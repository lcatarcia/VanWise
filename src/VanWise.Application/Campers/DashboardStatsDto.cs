namespace VanWise.Application.Campers;

public sealed record DashboardStatsDto(
    int TotalCampers,
    int FavoriteCampers,
    decimal AveragePrice,
    decimal AverageMileageKm,
    IReadOnlyCollection<DistributionPointDto> BrandDistribution,
    IReadOnlyCollection<DistributionPointDto> PriceDistribution,
    IReadOnlyCollection<DistributionPointDto> RegionDistribution,
    IReadOnlyCollection<CamperLocationDto> CamperLocations,
    IReadOnlyCollection<CamperSummaryDto> LatestCampers);

public sealed record DistributionPointDto(string Label, decimal Value);

public sealed record CamperLocationDto(Guid Id, string Brand, string Model, double Latitude, double Longitude);
