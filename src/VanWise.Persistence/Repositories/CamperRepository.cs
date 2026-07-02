using Microsoft.EntityFrameworkCore;
using VanWise.Application.Abstractions;
using VanWise.Application.Campers;
using VanWise.Domain.Campers;

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

        return new DashboardStatsDto(
            total,
            favorites,
            decimal.Round(averagePrice, 2),
            decimal.Round((decimal)averageMileage, 2),
            await GetBrandDistribution(cancellationToken),
            await GetPriceDistribution(cancellationToken),
            await GetLengthDistribution(cancellationToken),
            await ListAsync(new CamperFilterRequest(null, null, null, null, null, null, null, null, null, null, null), cancellationToken));
    }

    public void Add(Camper camper)
    {
        dbContext.Campers.Add(camper);
    }

    public void RemoveExistingTags(Camper camper)
    {
        dbContext.Tags.RemoveRange(camper.Tags);
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

    private async Task<IReadOnlyCollection<DistributionPointDto>> GetLengthDistribution(CancellationToken cancellationToken)
    {
        var points = await dbContext.Campers
            .AsNoTracking()
            .GroupBy(camper => camper.LengthMeters == null ? "Non indicato" : camper.LengthMeters < 6 ? "< 6m" : camper.LengthMeters < 7.5m ? "6m-7.5m" : "> 7.5m")
            .Select(group => new { Label = group.Key, Value = group.Count() })
            .ToListAsync(cancellationToken);

        return points
            .Select(point => new DistributionPointDto(point.Label, point.Value))
            .ToList();
    }
}
