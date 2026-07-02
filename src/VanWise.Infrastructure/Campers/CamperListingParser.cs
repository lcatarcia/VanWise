using System.Globalization;
using System.Net;
using System.Text.Json;
using System.Text.RegularExpressions;
using FluentValidation;
using VanWise.Application.Campers;

namespace VanWise.Infrastructure.Campers;

public sealed partial class CamperListingParser(HttpClient httpClient) : ICamperListingParser
{
    private const int MaxHtmlBytes = 1_500_000;

    public async Task<ParsedCamperDto> ParseAsync(ParseCamperUrlRequest request, CancellationToken cancellationToken)
    {
        if (!Uri.TryCreate(request.Url, UriKind.Absolute, out var uri) || (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps))
        {
            throw new ValidationException("URL must be a valid HTTP or HTTPS URL.");
        }

        try
        {
            using var response = await FetchListingAsync(uri, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                throw new ValidationException("The listing page could not be downloaded.");
            }

            var contentLength = response.Content.Headers.ContentLength;
            if (contentLength > MaxHtmlBytes)
            {
                throw new ValidationException("The listing page is too large to parse.");
            }

            await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
            using var memoryStream = new MemoryStream();
            var buffer = new byte[81920];
            int bytesRead;
            while ((bytesRead = await stream.ReadAsync(buffer, cancellationToken)) > 0)
            {
                memoryStream.Write(buffer, 0, bytesRead);
                if (memoryStream.Length > MaxHtmlBytes)
                {
                    throw new ValidationException("The listing page is too large to parse.");
                }
            }

            var html = System.Text.Encoding.UTF8.GetString(memoryStream.ToArray());
            return ParseHtml(uri, html);
        }
        catch (HttpRequestException)
        {
            throw new ValidationException("The listing page could not be downloaded.");
        }
    }

    private async Task<HttpResponseMessage> FetchListingAsync(Uri initialUri, CancellationToken cancellationToken)
    {
        var currentUri = initialUri;

        for (var redirectCount = 0; redirectCount <= 3; redirectCount++)
        {
            await EnsurePublicHostAsync(currentUri, cancellationToken);

            var response = await httpClient.GetAsync(currentUri, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
            if (!IsRedirect(response.StatusCode))
            {
                return response;
            }

            var location = response.Headers.Location;
            response.Dispose();
            if (location is null || !Uri.TryCreate(currentUri, location, out var redirectedUri) || (redirectedUri.Scheme != Uri.UriSchemeHttp && redirectedUri.Scheme != Uri.UriSchemeHttps))
            {
                throw new ValidationException("The listing page returned an unsupported redirect.");
            }

            currentUri = redirectedUri;
        }

        throw new ValidationException("The listing page returned too many redirects.");
    }

    private static ParsedCamperDto ParseHtml(Uri sourceUri, string html)
    {
        var text = NormalizeWhitespace(StripHtml(html));
        var title = HtmlDecode(FirstMeta(html, "og:title") ?? FirstTitle(html) ?? string.Empty);
        var description = HtmlDecode(FirstMeta(html, "og:description") ?? FirstMeta(html, "description") ?? string.Empty);
        var jsonLd = JsonLdBlocks(html).SelectMany(ReadJsonLdObjects).ToList();
        var product = jsonLd.FirstOrDefault(element => HasType(element, "Product") || HasType(element, "Vehicle"));
        var name = ReadString(product, "name");
        var modelName = FirstNonEmpty(name, title);
        var brand = ReadBrand(product, modelName);
        var model = RemoveBrand(modelName, brand);
        var price = ReadPrice(product) ?? ParseDecimal(text, PriceRegex());
        var images = ReadImages(product, sourceUri)
            .Concat(MetaImages(html, sourceUri))
            .Concat(HtmlImages(html, sourceUri))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Take(12)
            .ToList();

        return new ParsedCamperDto(
            brand,
            model,
            ParseInteger(text, YearRegex()),
            price,
            ParseInteger(text, MileageRegex()),
            ParseDecimal(text, LengthRegex()),
            ParseMatch(text, TransmissionRegex()),
            ParseMatch(text, EngineRegex()),
            ParseMatch(text, ChassisRegex()),
            ParseInteger(text, SleepingPlacesRegex()),
            string.Empty,
            string.Empty,
            FirstNonEmpty(description, title),
            sourceUri.ToString(),
            images);
    }

    private static async Task EnsurePublicHostAsync(Uri uri, CancellationToken cancellationToken)
    {
        var addresses = await Dns.GetHostAddressesAsync(uri.Host, cancellationToken);
        if (addresses.Length == 0 || addresses.Any(IsPrivateAddress))
        {
            throw new ValidationException("URL host is not allowed.");
        }
    }

    private static bool IsPrivateAddress(IPAddress address)
    {
        if (IPAddress.IsLoopback(address))
        {
            return true;
        }

        var bytes = address.GetAddressBytes();
        return address.AddressFamily switch
        {
            System.Net.Sockets.AddressFamily.InterNetwork => bytes[0] == 10
                || bytes[0] == 127
                || bytes[0] == 169 && bytes[1] == 254
                || bytes[0] == 172 && bytes[1] is >= 16 and <= 31
                || bytes[0] == 192 && bytes[1] == 168,
            System.Net.Sockets.AddressFamily.InterNetworkV6 => address.IsIPv6LinkLocal || address.IsIPv6SiteLocal || (bytes[0] & 0xfe) == 0xfc,
            _ => true
        };
    }

    private static bool IsRedirect(HttpStatusCode statusCode)
    {
        var code = (int)statusCode;
        return code is >= 300 and <= 399;
    }

    private static string ReadBrand(JsonElement product, string name)
    {
        if (product.ValueKind == JsonValueKind.Object && product.TryGetProperty("brand", out var brand))
        {
            if (brand.ValueKind == JsonValueKind.String)
            {
                return brand.GetString() ?? string.Empty;
            }

            var brandName = ReadString(brand, "name");
            if (!string.IsNullOrWhiteSpace(brandName))
            {
                return brandName;
            }
        }

        return name.Split(' ', StringSplitOptions.RemoveEmptyEntries).FirstOrDefault() ?? string.Empty;
    }

    private static decimal? ReadPrice(JsonElement product)
    {
        if (product.ValueKind != JsonValueKind.Object || !product.TryGetProperty("offers", out var offers))
        {
            return null;
        }

        return offers.ValueKind switch
        {
            JsonValueKind.Object => ReadDecimal(offers, "price"),
            JsonValueKind.Array => offers.EnumerateArray().Select(offer => ReadDecimal(offer, "price")).FirstOrDefault(price => price is not null),
            _ => null
        };
    }

    private static IEnumerable<string> ReadImages(JsonElement product, Uri baseUri)
    {
        if (product.ValueKind != JsonValueKind.Object || !product.TryGetProperty("image", out var image))
        {
            yield break;
        }

        foreach (var url in ReadStringValues(image))
        {
            if (TryNormalizeUrl(url, baseUri, out var normalizedUrl))
            {
                yield return normalizedUrl;
            }
        }
    }

    private static IEnumerable<string> ReadStringValues(JsonElement element)
    {
        if (element.ValueKind == JsonValueKind.String)
        {
            yield return element.GetString() ?? string.Empty;
        }

        if (element.ValueKind != JsonValueKind.Array)
        {
            yield break;
        }

        foreach (var item in element.EnumerateArray())
        {
            if (item.ValueKind == JsonValueKind.String)
            {
                yield return item.GetString() ?? string.Empty;
            }
        }
    }

    private static IEnumerable<string> MetaImages(string html, Uri baseUri)
    {
        foreach (Match match in MetaImageRegex().Matches(html))
        {
            var url = match.Groups["value"].Value;
            if (TryNormalizeUrl(HtmlDecode(url), baseUri, out var normalizedUrl))
            {
                yield return normalizedUrl;
            }
        }
    }

    private static IEnumerable<string> HtmlImages(string html, Uri baseUri)
    {
        foreach (Match match in ImgRegex().Matches(html))
        {
            var url = match.Groups["value"].Value;
            if (TryNormalizeUrl(HtmlDecode(url), baseUri, out var normalizedUrl))
            {
                yield return normalizedUrl;
            }
        }
    }

    private static bool TryNormalizeUrl(string url, Uri baseUri, out string normalizedUrl)
    {
        normalizedUrl = string.Empty;
        if (string.IsNullOrWhiteSpace(url) || url.StartsWith("data:", StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        if (!Uri.TryCreate(baseUri, url, out var uri) || (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps))
        {
            return false;
        }

        normalizedUrl = uri.ToString();
        return true;
    }

    private static IEnumerable<string> JsonLdBlocks(string html)
    {
        foreach (Match match in JsonLdRegex().Matches(html))
        {
            yield return HtmlDecode(match.Groups["json"].Value);
        }
    }

    private static IReadOnlyCollection<JsonElement> ReadJsonLdObjects(string json)
    {
        var elements = new List<JsonElement>();
        try
        {
            using var document = JsonDocument.Parse(json);
            if (document.RootElement.ValueKind == JsonValueKind.Array)
            {
                elements.AddRange(document.RootElement.EnumerateArray().Select(item => item.Clone()));
                return elements;
            }

            elements.Add(document.RootElement.Clone());
        }
        catch (JsonException)
        {
            return elements;
        }

        return elements;
    }

    private static bool HasType(JsonElement element, string expectedType)
    {
        if (element.ValueKind != JsonValueKind.Object || !element.TryGetProperty("@type", out var type))
        {
            return false;
        }

        return ReadStringValues(type).Any(value => value.Contains(expectedType, StringComparison.OrdinalIgnoreCase));
    }

    private static string ReadString(JsonElement element, string propertyName)
    {
        return element.ValueKind == JsonValueKind.Object && element.TryGetProperty(propertyName, out var property) && property.ValueKind == JsonValueKind.String
            ? property.GetString() ?? string.Empty
            : string.Empty;
    }

    private static decimal? ReadDecimal(JsonElement element, string propertyName)
    {
        if (element.ValueKind != JsonValueKind.Object || !element.TryGetProperty(propertyName, out var property))
        {
            return null;
        }

        return property.ValueKind switch
        {
            JsonValueKind.Number => property.GetDecimal(),
            JsonValueKind.String => ParseDecimal(property.GetString() ?? string.Empty, AnyNumberRegex()),
            _ => null
        };
    }

    private static string FirstMeta(string html, string name)
    {
        var escapedName = Regex.Escape(name);
        var match = Regex.Match(html, $"""<meta[^>]+(?:property|name)=["']{escapedName}["'][^>]+content=["'](?<value>[^"']+)["'][^>]*>""", RegexOptions.IgnoreCase);
        return match.Success ? match.Groups["value"].Value : string.Empty;
    }

    private static string FirstTitle(string html)
    {
        var match = Regex.Match(html, "<title[^>]*>(?<value>.*?)</title>", RegexOptions.IgnoreCase | RegexOptions.Singleline);
        return match.Success ? match.Groups["value"].Value : string.Empty;
    }

    private static string ParseMatch(string text, Regex regex)
    {
        var match = regex.Match(text);
        return match.Success ? match.Groups["value"].Value.Trim() : string.Empty;
    }

    private static int? ParseInteger(string text, Regex regex)
    {
        var match = regex.Match(text);
        if (!match.Success)
        {
            return null;
        }

        var value = DigitsOnlyRegex().Replace(match.Groups["value"].Value, string.Empty);
        return int.TryParse(value, NumberStyles.Integer, CultureInfo.InvariantCulture, out var parsedValue) ? parsedValue : null;
    }

    private static decimal? ParseDecimal(string text, Regex regex)
    {
        var match = regex.Match(text);
        if (!match.Success)
        {
            return null;
        }

        var value = match.Groups["value"].Value.Replace(".", string.Empty).Replace(',', '.');
        return decimal.TryParse(value, NumberStyles.Number, CultureInfo.InvariantCulture, out var parsedValue) ? parsedValue : null;
    }

    private static string RemoveBrand(string name, string brand)
    {
        return string.IsNullOrWhiteSpace(brand) ? name : Regex.Replace(name, $"^{Regex.Escape(brand)}\\s*", string.Empty, RegexOptions.IgnoreCase).Trim();
    }

    private static string FirstNonEmpty(params string[] values)
    {
        return values.FirstOrDefault(value => !string.IsNullOrWhiteSpace(value))?.Trim() ?? string.Empty;
    }

    private static string StripHtml(string html)
    {
        return Regex.Replace(html, "<[^>]+>", " ");
    }

    private static string NormalizeWhitespace(string value)
    {
        return Regex.Replace(HtmlDecode(value), "\\s+", " ").Trim();
    }

    private static string HtmlDecode(string value)
    {
        return WebUtility.HtmlDecode(value);
    }

    [GeneratedRegex("<script[^>]+type=[\"']application/ld\\+json[\"'][^>]*>(?<json>.*?)</script>", RegexOptions.IgnoreCase | RegexOptions.Singleline)]
    private static partial Regex JsonLdRegex();

    [GeneratedRegex("<meta[^>]+property=[\"']og:image(?::url)?[\"'][^>]+content=[\"'](?<value>[^\"']+)[\"'][^>]*>", RegexOptions.IgnoreCase)]
    private static partial Regex MetaImageRegex();

    [GeneratedRegex("<img[^>]+src=[\"'](?<value>[^\"']+)[\"'][^>]*>", RegexOptions.IgnoreCase)]
    private static partial Regex ImgRegex();

    [GeneratedRegex("(?:prezzo|price)\\D{0,20}(?<value>\\d{2,3}(?:[\\.,]\\d{3})*(?:,\\d{2})?)", RegexOptions.IgnoreCase)]
    private static partial Regex PriceRegex();

    [GeneratedRegex("(?<value>\\d{4})")]
    private static partial Regex YearRegex();

    [GeneratedRegex("(?:km|chilometri)\\D{0,20}(?<value>\\d{1,3}(?:[\\.,]\\d{3})*)", RegexOptions.IgnoreCase)]
    private static partial Regex MileageRegex();

    [GeneratedRegex("(?:lunghezza|length)\\D{0,20}(?<value>\\d{1,2}(?:[\\.,]\\d{1,2})?)", RegexOptions.IgnoreCase)]
    private static partial Regex LengthRegex();

    [GeneratedRegex("(?:cambio|transmission)\\D{0,20}(?<value>[^\\.\\|,;]{3,60})", RegexOptions.IgnoreCase)]
    private static partial Regex TransmissionRegex();

    [GeneratedRegex("(?:motore|engine)\\D{0,20}(?<value>[^\\.\\|,;]{3,120})", RegexOptions.IgnoreCase)]
    private static partial Regex EngineRegex();

    [GeneratedRegex("(?:telaio|chassis)\\D{0,20}(?<value>[^\\.\\|,;]{3,120})", RegexOptions.IgnoreCase)]
    private static partial Regex ChassisRegex();

    [GeneratedRegex("(?:posti letto|sleeping places|beds)\\D{0,20}(?<value>\\d{1,2})", RegexOptions.IgnoreCase)]
    private static partial Regex SleepingPlacesRegex();

    [GeneratedRegex("(?<value>\\d+(?:[\\.,]\\d+)?)")]
    private static partial Regex AnyNumberRegex();

    [GeneratedRegex("\\D")]
    private static partial Regex DigitsOnlyRegex();
}
