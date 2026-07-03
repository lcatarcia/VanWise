using FluentValidation;

namespace VanWise.Application.Campers.Validation;

public sealed class CreateCamperRequestValidator : CamperRequestValidatorBase<CreateCamperRequest>
{
    public CreateCamperRequestValidator()
    {
        Configure(
            request => request.Brand,
            request => request.Model,
            request => request.Year,
            request => request.AskingPrice,
            request => request.MileageKm,
            request => request.LengthMeters,
            request => request.SleepingPlaces,
            request => request.Region,
            request => request.City,
            request => request.Address,
            request => request.Latitude,
            request => request.Longitude,
            request => request.SourceUrl,
            request => request.ImageUrls);
    }
}
