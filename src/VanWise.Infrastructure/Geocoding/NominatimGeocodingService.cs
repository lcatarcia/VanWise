using System.Net.Http.Json;
using System.Text.Json.Serialization;
using VanWise.Application.Abstractions;

namespace VanWise.Infrastructure.Geocoding;

public sealed class NominatimGeocodingService(HttpClient httpClient) : IGeocodingService
{
    public async Task<(double Latitude, double Longitude)?> GeocodeAsync(string query, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return null;
        }

        var encodedQuery = Uri.EscapeDataString(query.Trim());
        var url = $"https://nominatim.openstreetmap.org/search?q={encodedQuery}&format=json&limit=1&countrycodes=it";

        try
        {
            var results = await httpClient.GetFromJsonAsync<NominatimResult[]>(url, cancellationToken);
            if (results is not { Length: > 0 })
            {
                return null;
            }

            var first = results[0];
            if (double.TryParse(first.Lat, System.Globalization.NumberStyles.Float, System.Globalization.CultureInfo.InvariantCulture, out var lat)
                && double.TryParse(first.Lon, System.Globalization.NumberStyles.Float, System.Globalization.CultureInfo.InvariantCulture, out var lon))
            {
                return (lat, lon);
            }
        }
        catch (HttpRequestException)
        {
            // Geocoding failure is not critical — camper is saved without coordinates
        }
        catch (TaskCanceledException)
        {
            // Timeout — same as above
        }

        return null;
    }

    private sealed record NominatimResult(
        [property: JsonPropertyName("lat")] string Lat,
        [property: JsonPropertyName("lon")] string Lon);
}
