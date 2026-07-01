using FluentValidation;

namespace VanWise.Application.Campers.Validation;

public sealed class UpdateCamperRequestValidator : CamperRequestValidatorBase<UpdateCamperRequest>
{
    public UpdateCamperRequestValidator()
    {
        Configure(
            request => request.Brand,
            request => request.Model,
            request => request.Year,
            request => request.AskingPrice,
            request => request.MileageKm,
            request => request.LengthMeters,
            request => request.SleepingPlaces,
            request => request.Region);

        RuleFor(request => request.SourceUrl)
            .MaximumLength(1000)
            .Must(BeEmptyOrAbsoluteUrl)
            .WithMessage("Source URL must be a valid absolute URL.");
    }

    private static bool BeEmptyOrAbsoluteUrl(string sourceUrl)
    {
        return string.IsNullOrWhiteSpace(sourceUrl) || Uri.TryCreate(sourceUrl, UriKind.Absolute, out _);
    }
}
