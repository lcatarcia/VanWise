using Microsoft.EntityFrameworkCore;
using VanWise.Application.Abstractions;
using VanWise.Application.Campers;
using VanWise.Domain.Campers;
using VanWise.Domain.Visits;

namespace VanWise.Persistence.Repositories;

public sealed class CamperRepository(VanWiseDbContext dbContext) : ICamperRepository
{
    public async Task<IReadOnlyCollection<CamperSummaryDto>> ListAsync(CamperFilterRequest filter, CancellationToken cancellationToken)
    {
        return await ApplyFilter(dbContext.Campers.AsNoTracking(), filter)
            .OrderByDescending(camper => camper.CreatedAt)
            .Select(camper => new CamperSummaryDto(
                camper.Id,
                camper.Brand,
                camper.Model,
                camper.Year,
                camper.AskingPrice,
                camper.MileageKm,
                camper.LengthMeters,
                camper.Region,
                camper.City,
                camper.Dealer == null ? null : camper.Dealer.Name,
                camper.IsFavorite,
                camper.Attachments
                    .Where(attachment => attachment.IsPhoto)
                    .OrderBy(attachment => attachment.SortOrder)
                    .Select(attachment => attachment.StoragePath)
                    .FirstOrDefault(),
                camper.AskingPrice == null || camper.LengthMeters == null || camper.LengthMeters <= 0 ? 0 : camper.AskingPrice.Value / camper.LengthMeters.Value))
            .ToListAsync(cancellationToken);
    }

    public Task<Camper?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return dbContext.Campers
            .Include(camper => camper.Tags)
            .Include(camper => camper.Attachments)
            .FirstOrDefaultAsync(camper => camper.Id == id, cancellationToken);
    }

    public Task<CamperDetailDto?> GetDetailAsync(Guid id, CancellationToken cancellationToken)
    {
        return dbContext.Campers
            .AsNoTracking()
            .Where(camper => camper.Id == id)
            .Select(camper => new CamperDetailDto(
                camper.Id,
                camper.Brand,
                camper.Model,
                camper.Year,
                camper.AskingPrice,
                camper.MileageKm,
                camper.LengthMeters,
                camper.Transmission,
                camper.Engine,
                camper.Chassis,
                camper.SleepingPlaces,
                camper.Region,
                camper.City,
                camper.Address,
                camper.Latitude,
                camper.Longitude,
                camper.Notes,
                camper.SourceUrl,
                camper.IsFavorite,
                camper.Dealer == null ? null : camper.Dealer.Name,
                camper.Tags.Select(tag => tag.Name).ToList(),
                camper.Attachments
                    .Where(attachment => attachment.IsPhoto)
                    .OrderBy(attachment => attachment.SortOrder)
                    .Select(attachment => new CamperImageDto(
                        attachment.StoragePath,
                        attachment.FileName,
                        attachment.Caption,
                        attachment.SortOrder))
                    .ToList(),
                camper.AskingPrice == null || camper.LengthMeters == null || camper.LengthMeters <= 0 ? 0 : camper.AskingPrice.Value / camper.LengthMeters.Value))
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyCollection<CamperComparisonDto>> GetComparisonAsync(IReadOnlyCollection<Guid> ids, CancellationToken cancellationToken)
    {
        return await dbContext.Campers
            .AsNoTracking()
            .Where(camper => ids.Contains(camper.Id))
            .Select(camper => new CamperComparisonDto(
                camper.Id,
                camper.Brand,
                camper.Model,
                camper.Year,
                camper.AskingPrice,
                camper.MileageKm,
                camper.LengthMeters,
                camper.SleepingPlaces,
                camper.Transmission,
                camper.Engine,
                camper.Chassis,
                camper.AskingPrice == null || camper.LengthMeters == null || camper.LengthMeters <= 0 ? 0 : camper.AskingPrice.Value / camper.LengthMeters.Value,
                camper.IsFavorite))
            .ToListAsync(cancellationToken);
    }

    public async Task<DashboardStatsDto> GetDashboardStatsAsync(CancellationToken cancellationToken)
    {
        var total = await dbContext.Campers.CountAsync(cancellationToken);
        var favorites = await dbContext.Campers.CountAsync(camper => camper.IsFavorite, cancellationToken);
        var campersWithPrice = dbContext.Campers.Where(camper => camper.AskingPrice != null);
        var campersWithMileage = dbContext.Campers.Where(camper => camper.MileageKm != null);
        var averagePrice = await campersWithPrice.AnyAsync(cancellationToken)
            ? await campersWithPrice.AverageAsync(camper => camper.AskingPrice, cancellationToken) ?? 0
            : 0;
        var averageMileage = await campersWithMileage.AnyAsync(cancellationToken)
            ? await campersWithMileage.AverageAsync(camper => camper.MileageKm, cancellationToken) ?? 0
            : 0;

        var inspectedCampers = await GetInspectedCampers(cancellationToken);
        var inspectionByCamper = inspectedCampers.ToDictionary(camper => camper.Id);

        return new DashboardStatsDto(
            total,
            favorites,
            decimal.Round(averagePrice, 2),
            decimal.Round((decimal)averageMileage, 2),
            await GetBrandDistribution(cancellationToken),
            await GetPriceDistribution(cancellationToken),
            await GetRegionDistribution(cancellationToken),
            await GetCamperLocations(inspectionByCamper, cancellationToken),
            await ListAsync(new CamperFilterRequest(null, null, null, null, null, null, null, null, null, null, null), cancellationToken),
            inspectedCampers);
    }

    public void Add(Camper camper)
    {
        dbContext.Campers.Add(camper);
    }

    public void RemoveExistingTags(Camper camper)
    {
        dbContext.Tags.RemoveRange(camper.Tags);
    }

    public void ReplaceRemotePhotos(Guid camperId, IEnumerable<string> imageUrls)
    {
        dbContext.Attachments.RemoveRange(dbContext.Attachments.Where(attachment => attachment.CamperId == camperId && attachment.IsPhoto));

        var sortOrder = 0;
        foreach (var imageUrl in imageUrls.Select(url => url.Trim()).Where(url => url.Length > 0).Distinct(StringComparer.OrdinalIgnoreCase))
        {
            dbContext.Attachments.Add(Attachment.RemotePhoto(camperId, imageUrl, sortOrder));
            sortOrder++;
        }
    }

    public void Remove(Camper camper)
    {
        dbContext.Campers.Remove(camper);
    }

    private static IQueryable<Camper> ApplyFilter(IQueryable<Camper> query, CamperFilterRequest filter)
    {
        if (filter.MinPrice is not null)
        {
            query = query.Where(camper => camper.AskingPrice != null && camper.AskingPrice >= filter.MinPrice);
        }

        if (filter.MaxPrice is not null)
        {
            query = query.Where(camper => camper.AskingPrice != null && camper.AskingPrice <= filter.MaxPrice);
        }

        if (filter.MaxMileageKm is not null)
        {
            query = query.Where(camper => camper.MileageKm != null && camper.MileageKm <= filter.MaxMileageKm);
        }

        if (filter.MinLengthMeters is not null)
        {
            query = query.Where(camper => camper.LengthMeters != null && camper.LengthMeters >= filter.MinLengthMeters);
        }

        if (filter.MaxLengthMeters is not null)
        {
            query = query.Where(camper => camper.LengthMeters != null && camper.LengthMeters <= filter.MaxLengthMeters);
        }

        if (!string.IsNullOrWhiteSpace(filter.Region))
        {
            query = query.Where(camper => camper.Region == filter.Region);
        }

        if (filter.SleepingPlaces is not null)
        {
            query = query.Where(camper => camper.SleepingPlaces != null && camper.SleepingPlaces >= filter.SleepingPlaces);
        }

        return query;
    }

    private async Task<IReadOnlyCollection<DistributionPointDto>> GetBrandDistribution(CancellationToken cancellationToken)
    {
        var points = await dbContext.Campers
            .AsNoTracking()
            .GroupBy(camper => camper.Brand)
            .Select(group => new { Label = group.Key, Value = group.Count() })
            .OrderByDescending(point => point.Value)
            .ToListAsync(cancellationToken);

        return points
            .Select(point => new DistributionPointDto(point.Label, point.Value))
            .ToList();
    }

    private async Task<IReadOnlyCollection<DistributionPointDto>> GetPriceDistribution(CancellationToken cancellationToken)
    {
        var points = await dbContext.Campers
            .AsNoTracking()
            .GroupBy(camper => camper.AskingPrice == null ? "Non indicato" : camper.AskingPrice < 50000 ? "< 50k" : camper.AskingPrice < 80000 ? "50k-80k" : "> 80k")
            .Select(group => new { Label = group.Key, Value = group.Count() })
            .ToListAsync(cancellationToken);

        return points
            .Select(point => new DistributionPointDto(point.Label, point.Value))
            .ToList();
    }

    private async Task<IReadOnlyCollection<DistributionPointDto>> GetRegionDistribution(CancellationToken cancellationToken)
    {
        var points = await dbContext.Campers
            .AsNoTracking()
            .Where(camper => camper.Region != null && camper.Region != "")
            .GroupBy(camper => camper.Region)
            .Select(group => new { Label = group.Key, Value = group.Count() })
            .OrderByDescending(point => point.Value)
            .ToListAsync(cancellationToken);

        return points
            .Select(point => new DistributionPointDto(point.Label, point.Value))
            .ToList();
    }

    private async Task<IReadOnlyCollection<CamperLocationDto>> GetCamperLocations(
        IReadOnlyDictionary<Guid, InspectedCamperDto> inspectionByCamper,
        CancellationToken cancellationToken)
    {
        var locations = await dbContext.Campers
            .AsNoTracking()
            .Where(camper => camper.Latitude != null && camper.Longitude != null)
            .Select(camper => new
            {
                camper.Id,
                camper.Brand,
                camper.Model,
                Latitude = camper.Latitude!.Value,
                Longitude = camper.Longitude!.Value,
            })
            .ToListAsync(cancellationToken);

        return locations
            .Select(location =>
            {
                inspectionByCamper.TryGetValue(location.Id, out var inspection);
                return new CamperLocationDto(
                    location.Id,
                    location.Brand,
                    location.Model,
                    location.Latitude,
                    location.Longitude,
                    inspection is not null,
                    inspection?.VisitCount ?? 0,
                    inspection?.ProblemCount ?? 0,
                    inspection?.LastVisitDate);
            })
            .ToList();
    }

    private async Task<IReadOnlyCollection<InspectedCamperDto>> GetInspectedCampers(CancellationToken cancellationToken)
    {
        var checklists = await dbContext.VisitChecklists
            .AsNoTracking()
            .Select(checklist => new
            {
                checklist.CamperId,
                checklist.VisitDate,
                Items = checklist.Items
                    .Select(item => new { item.Status, item.Description })
                    .ToList(),
            })
            .ToListAsync(cancellationToken);

        if (checklists.Count == 0)
        {
            return [];
        }

        var camperIds = checklists.Select(checklist => checklist.CamperId).Distinct().ToList();

        var campers = await dbContext.Campers
            .AsNoTracking()
            .Where(camper => camperIds.Contains(camper.Id))
            .Select(camper => new
            {
                camper.Id,
                camper.Brand,
                camper.Model,
                camper.Year,
                camper.AskingPrice,
                camper.MileageKm,
                camper.LengthMeters,
                camper.Region,
                camper.City,
                camper.IsFavorite,
                CoverImageUrl = camper.Attachments
                    .Where(attachment => attachment.IsPhoto)
                    .OrderBy(attachment => attachment.SortOrder)
                    .Select(attachment => attachment.StoragePath)
                    .FirstOrDefault(),
            })
            .ToListAsync(cancellationToken);

        return campers
            .Select(camper =>
            {
                var camperChecklists = checklists.Where(checklist => checklist.CamperId == camper.Id).ToList();
                var latest = camperChecklists
                    .OrderByDescending(checklist => checklist.VisitDate)
                    .First();
                var items = latest.Items;

                return new InspectedCamperDto(
                    camper.Id,
                    camper.Brand,
                    camper.Model,
                    camper.Year,
                    camper.AskingPrice,
                    camper.MileageKm,
                    camper.LengthMeters,
                    camper.Region,
                    camper.City,
                    camper.IsFavorite,
                    camper.CoverImageUrl,
                    camperChecklists.Count,
                    latest.VisitDate,
                    items.Count(item => item.Status == ChecklistItemStatus.Ok),
                    items.Count(item => item.Status == ChecklistItemStatus.ToVerify),
                    items.Count(item => item.Status == ChecklistItemStatus.Problem),
                    items.Count,
                    items
                        .Where(item => item.Status == ChecklistItemStatus.Problem)
                        .Select(item => item.Description)
                        .Where(description => description.Length > 0)
                        .ToList());
            })
            .OrderByDescending(camper => camper.LastVisitDate)
            .ToList();
    }
}
