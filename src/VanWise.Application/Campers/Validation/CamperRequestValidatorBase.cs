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
        Expression<Func<T, string>> city)
    {
        var yearValue = year.Compile();
        var askingPriceValue = askingPrice.Compile();
        var mileageKmValue = mileageKm.Compile();
        var lengthMetersValue = lengthMeters.Compile();
        var sleepingPlacesValue = sleepingPlaces.Compile();

        RuleFor(brand).NotEmpty().MaximumLength(100);
        RuleFor(model).NotEmpty().MaximumLength(120);
        RuleFor(year).InclusiveBetween(1980, DateTime.UtcNow.Year + 1).When(request => yearValue(request) is not null);
        RuleFor(askingPrice).GreaterThan(0).When(request => askingPriceValue(request) is not null);
        RuleFor(mileageKm).GreaterThanOrEqualTo(0).When(request => mileageKmValue(request) is not null);
        RuleFor(lengthMeters).InclusiveBetween(3m, 12m).When(request => lengthMetersValue(request) is not null);
        RuleFor(sleepingPlaces).InclusiveBetween(1, 10).When(request => sleepingPlacesValue(request) is not null);
        RuleFor(region).MaximumLength(80);
        RuleFor(city).MaximumLength(80);
    }
}
