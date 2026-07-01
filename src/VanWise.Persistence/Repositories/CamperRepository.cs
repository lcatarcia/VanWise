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
                camper.Dealer == null ? null : camper.Dealer.Name,
                camper.IsFavorite,
                camper.LengthMeters <= 0 ? 0 : camper.AskingPrice / camper.LengthMeters))
            .ToListAsync(cancellationToken);
    }

    public Task<Camper?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return dbContext.Campers
            .Include(camper => camper.Tags)
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
                camper.Notes,
                camper.SourceUrl,
                camper.IsFavorite,
                camper.Dealer == null ? null : camper.Dealer.Name,
                camper.Tags.Select(tag => tag.Name).ToList(),
                camper.LengthMeters <= 0 ? 0 : camper.AskingPrice / camper.LengthMeters))
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
                camper.LengthMeters <= 0 ? 0 : camper.AskingPrice / camper.LengthMeters,
                camper.IsFavorite))
            .ToListAsync(cancellationToken);
    }

    public async Task<DashboardStatsDto> GetDashboardStatsAsync(CancellationToken cancellationToken)
    {
        var total = await dbContext.Campers.CountAsync(cancellationToken);
        var favorites = await dbContext.Campers.CountAsync(camper => camper.IsFavorite, cancellationToken);
        var averagePrice = await dbContext.Campers.AnyAsync(cancellationToken)
            ? await dbContext.Campers.AverageAsync(camper => camper.AskingPrice, cancellationToken)
            : 0;
        var averageMileage = await dbContext.Campers.AnyAsync(cancellationToken)
            ? await dbContext.Campers.AverageAsync(camper => camper.MileageKm, cancellationToken)
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

    public void Remove(Camper camper)
    {
        dbContext.Campers.Remove(camper);
    }

    private static IQueryable<Camper> ApplyFilter(IQueryable<Camper> query, CamperFilterRequest filter)
    {
        if (filter.MinPrice is not null)
        {
            query = query.Where(camper => camper.AskingPrice >= filter.MinPrice);
        }

        if (filter.MaxPrice is not null)
        {
            query = query.Where(camper => camper.AskingPrice <= filter.MaxPrice);
        }

        if (filter.MaxMileageKm is not null)
        {
            query = query.Where(camper => camper.MileageKm <= filter.MaxMileageKm);
        }

        if (filter.MinLengthMeters is not null)
        {
            query = query.Where(camper => camper.LengthMeters >= filter.MinLengthMeters);
        }

        if (filter.MaxLengthMeters is not null)
        {
            query = query.Where(camper => camper.LengthMeters <= filter.MaxLengthMeters);
        }

        if (!string.IsNullOrWhiteSpace(filter.Region))
        {
            query = query.Where(camper => camper.Region == filter.Region);
        }

        if (filter.SleepingPlaces is not null)
        {
            query = query.Where(camper => camper.SleepingPlaces >= filter.SleepingPlaces);
        }

        return query;
    }

    private async Task<IReadOnlyCollection<DistributionPointDto>> GetBrandDistribution(CancellationToken cancellationToken)
    {
        return await dbContext.Campers
            .AsNoTracking()
            .GroupBy(camper => camper.Brand)
            .Select(group => new DistributionPointDto(group.Key, group.Count()))
            .OrderByDescending(point => point.Value)
            .ToListAsync(cancellationToken);
    }

    private async Task<IReadOnlyCollection<DistributionPointDto>> GetPriceDistribution(CancellationToken cancellationToken)
    {
        return await dbContext.Campers
            .AsNoTracking()
            .GroupBy(camper => camper.AskingPrice < 50000 ? "< 50k" : camper.AskingPrice < 80000 ? "50k-80k" : "> 80k")
            .Select(group => new DistributionPointDto(group.Key, group.Count()))
            .ToListAsync(cancellationToken);
    }

    private async Task<IReadOnlyCollection<DistributionPointDto>> GetLengthDistribution(CancellationToken cancellationToken)
    {
        return await dbContext.Campers
            .AsNoTracking()
            .GroupBy(camper => camper.LengthMeters < 6 ? "< 6m" : camper.LengthMeters < 7.5m ? "6m-7.5m" : "> 7.5m")
            .Select(group => new DistributionPointDto(group.Key, group.Count()))
            .ToListAsync(cancellationToken);
    }
}
