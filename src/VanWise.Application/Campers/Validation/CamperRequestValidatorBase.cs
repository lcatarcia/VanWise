using FluentValidation;
using System.Linq.Expressions;

namespace VanWise.Application.Campers.Validation;

public abstract class CamperRequestValidatorBase<T> : AbstractValidator<T>
{
    protected void Configure(
        Expression<Func<T, string>> brand,
        Expression<Func<T, string>> model,
        Expression<Func<T, int>> year,
        Expression<Func<T, decimal>> askingPrice,
        Expression<Func<T, int>> mileageKm,
        Expression<Func<T, decimal>> lengthMeters,
        Expression<Func<T, int>> sleepingPlaces,
        Expression<Func<T, string>> region)
    {
        RuleFor(brand).NotEmpty().MaximumLength(100);
        RuleFor(model).NotEmpty().MaximumLength(120);
        RuleFor(year).InclusiveBetween(1980, DateTime.UtcNow.Year + 1);
        RuleFor(askingPrice).GreaterThan(0);
        RuleFor(mileageKm).GreaterThanOrEqualTo(0);
        RuleFor(lengthMeters).InclusiveBetween(3m, 12m);
        RuleFor(sleepingPlaces).InclusiveBetween(1, 10);
        RuleFor(region).NotEmpty().MaximumLength(80);
    }
}
