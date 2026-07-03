namespace VanWise.Application.Campers;

public sealed record DashboardStatsDto(
    int TotalCampers,
    int FavoriteCampers,
    decimal AveragePrice,
    decimal AverageMileageKm,
    IReadOnlyCollection<DistributionPointDto> BrandDistribution,
    IReadOnlyCollection<DistributionPointDto> PriceDistribution,
    IReadOnlyCollection<DistributionPointDto> RegionDistribution,
    IReadOnlyCollection<CamperSummaryDto> LatestCampers);

public sealed record DistributionPointDto(string Label, decimal Value);
