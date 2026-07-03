using FluentValidation;
using System.Linq.Expressions;

namespace VanWise.Application.Campers.Validation;

public abstract class CamperRequestValidatorBase<T> : AbstractValidator<T>
{
    protected void Configure(
        Expression<Func<T, string>> brand,
        Expression<Func<T, string>> model,
        Expression<Func<T, int?>> year,
        Expression<Func<T, decimal?>> askingPrice,
        Expression<Func<T, int?>> mileageKm,
        Expression<Func<T, decimal?>> lengthMeters,
        Expression<Func<T, int?>> sleepingPlaces,
        Expression<Func<T, string>> region,
        Expression<Func<T, string>> city,
        Expression<Func<T, string>> address,
        Expression<Func<T, double?>> latitude,
        Expression<Func<T, double?>> longitude,
        Expression<Func<T, string>> sourceUrl,
        Expression<Func<T, IReadOnlyCollection<string>>> imageUrls)
    {
        var yearValue = year.Compile();
        var askingPriceValue = askingPrice.Compile();
        var mileageKmValue = mileageKm.Compile();
        var lengthMetersValue = lengthMeters.Compile();
        var sleepingPlacesValue = sleepingPlaces.Compile();
        var latitudeValue = latitude.Compile();
        var longitudeValue = longitude.Compile();
        var imageUrlsValue = imageUrls.Compile();

        RuleFor(brand).NotEmpty().MaximumLength(100);
        RuleFor(model).NotEmpty().MaximumLength(120);
        RuleFor(year).InclusiveBetween(1980, DateTime.UtcNow.Year + 1).When(request => yearValue(request) is not null);
        RuleFor(askingPrice).GreaterThan(0).When(request => askingPriceValue(request) is not null);
        RuleFor(mileageKm).GreaterThanOrEqualTo(0).When(request => mileageKmValue(request) is not null);
        RuleFor(lengthMeters).InclusiveBetween(3m, 12m).When(request => lengthMetersValue(request) is not null);
        RuleFor(sleepingPlaces).InclusiveBetween(1, 10).When(request => sleepingPlacesValue(request) is not null);
        RuleFor(region).MaximumLength(80);
        RuleFor(city).MaximumLength(80);
        RuleFor(address).MaximumLength(200);
        RuleFor(latitude).InclusiveBetween(-90, 90).When(request => latitudeValue(request) is not null);
        RuleFor(longitude).InclusiveBetween(-180, 180).When(request => longitudeValue(request) is not null);
        RuleFor(sourceUrl)
            .MaximumLength(1000)
            .Must(BeEmptyOrHttpUrl)
            .WithMessage("Source URL must be a valid HTTP or HTTPS URL.");
        RuleFor(imageUrls)
            .Must(requestImageUrls => requestImageUrls is not null && requestImageUrls.Count <= 20)
            .WithMessage("A camper can have at most 20 images.");
        RuleFor(request => imageUrlsValue(request))
            .Must(requestImageUrls => requestImageUrls is null || requestImageUrls.All(url => url.Length <= 1000 && BeEmptyOrHttpUrl(url)))
            .WithMessage("Image URL must be a valid HTTP or HTTPS URL.");
    }

    protected static bool BeEmptyOrHttpUrl(string? url)
    {
        return string.IsNullOrWhiteSpace(url)
            || Uri.TryCreate(url, UriKind.Absolute, out var uri) && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps);
    }
}
