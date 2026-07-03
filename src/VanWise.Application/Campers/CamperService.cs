using FluentValidation;
using VanWise.Application.Abstractions;
using VanWise.Domain.Campers;

namespace VanWise.Application.Campers;

public sealed class CamperService(
    ICamperRepository camperRepository,
    IUnitOfWork unitOfWork,
    IGeocodingService geocodingService,
    IValidator<CreateCamperRequest> createValidator,
    IValidator<UpdateCamperRequest> updateValidator) : ICamperService
{
    public Task<IReadOnlyCollection<CamperSummaryDto>> ListAsync(CamperFilterRequest filter, CancellationToken cancellationToken)
    {
        return camperRepository.ListAsync(filter, cancellationToken);
    }

    public Task<CamperDetailDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return camperRepository.GetDetailAsync(id, cancellationToken);
    }

    public async Task<CamperDetailDto> CreateAsync(CreateCamperRequest request, CancellationToken cancellationToken)
    {
        await createValidator.ValidateAndThrowAsync(request, cancellationToken);

        var coordinates = await ResolveCoordinatesAsync(request.Address, request.City, request.Region, cancellationToken);

        var camper = new Camper(
            request.Brand,
            request.Model,
            request.Year,
            request.AskingPrice,
            request.MileageKm,
            request.LengthMeters,
            request.Transmission,
            request.Engine,
            request.Chassis,
            request.SleepingPlaces,
            request.Region,
            request.City,
            request.Address,
            coordinates?.Latitude,
            coordinates?.Longitude,
            request.Notes,
            request.SourceUrl,
            request.IsFavorite);

        camper.ReplaceTags(request.Tags ?? []);
        camper.ReplaceRemotePhotos(request.ImageUrls ?? []);
        camperRepository.Add(camper);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return await camperRepository.GetDetailAsync(camper.Id, cancellationToken)
            ?? throw new InvalidOperationException("Created camper could not be reloaded.");
    }

    public async Task<CamperDetailDto?> UpdateAsync(Guid id, UpdateCamperRequest request, CancellationToken cancellationToken)
    {
        await updateValidator.ValidateAndThrowAsync(request, cancellationToken);

        var camper = await camperRepository.GetByIdAsync(id, cancellationToken);
        if (camper is null)
        {
            return null;
        }

        var coordinates = await ResolveCoordinatesAsync(request.Address, request.City, request.Region, cancellationToken);

        camper.UpdateDetails(
            request.Brand,
            request.Model,
            request.Year,
            request.AskingPrice,
            request.MileageKm,
            request.LengthMeters,
            request.Transmission,
            request.Engine,
            request.Chassis,
            request.SleepingPlaces,
            request.Region,
            request.City,
            request.Address,
            coordinates?.Latitude,
            coordinates?.Longitude,
            request.Notes,
            request.SourceUrl,
            request.IsFavorite);

        camperRepository.RemoveExistingTags(camper);
        camper.ReplaceTags(request.Tags ?? []);
        camperRepository.ReplaceRemotePhotos(camper.Id, request.ImageUrls ?? []);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return await camperRepository.GetDetailAsync(id, cancellationToken);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var camper = await camperRepository.GetByIdAsync(id, cancellationToken);
        if (camper is null)
        {
            return false;
        }

        camperRepository.Remove(camper);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    public Task<IReadOnlyCollection<CamperComparisonDto>> CompareAsync(IReadOnlyCollection<Guid> ids, CancellationToken cancellationToken)
    {
        var distinctIds = ids.Distinct().ToList();
        if (distinctIds.Count is < 2 or > 4)
        {
            throw new ValidationException("Select between 2 and 4 campers for comparison.");
        }

        if (distinctIds.Count != ids.Count)
        {
            throw new ValidationException("Select distinct campers for comparison.");
        }

        return camperRepository.GetComparisonAsync(distinctIds, cancellationToken);
    }

    private async Task<(double Latitude, double Longitude)?> ResolveCoordinatesAsync(
        string address, string city, string region, CancellationToken cancellationToken)
    {
        // Priority: full address > city + region > city alone
        if (!string.IsNullOrWhiteSpace(address))
        {
            var result = await geocodingService.GeocodeAsync(address, cancellationToken);
            if (result is not null)
            {
                return result;
            }
        }

        var fallbackQuery = string.IsNullOrWhiteSpace(city)
            ? null
            : string.IsNullOrWhiteSpace(region) ? city : $"{city}, {region}";

        if (fallbackQuery is not null)
        {
            return await geocodingService.GeocodeAsync(fallbackQuery, cancellationToken);
        }

        return null;
    }
}
