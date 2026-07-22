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
    IReadOnlyCollection<CamperSummaryDto> LatestCampers,
    IReadOnlyCollection<InspectedCamperDto> InspectedCampers);

public sealed record DistributionPointDto(string Label, decimal Value);

public sealed record CamperLocationDto(
    Guid Id,
    string Brand,
    string Model,
    double Latitude,
    double Longitude,
    bool IsInspected,
    int VisitCount,
    int ProblemCount,
    DateTimeOffset? LastVisitDate);

public sealed record InspectedCamperDto(
    Guid Id,
    string Brand,
    string Model,
    int? Year,
    decimal? AskingPrice,
    int? MileageKm,
    decimal? LengthMeters,
    string Region,
    string City,
    bool IsFavorite,
    string? CoverImageUrl,
    int VisitCount,
    DateTimeOffset LastVisitDate,
    int OkCount,
    int ToVerifyCount,
    int ProblemCount,
    int TotalItems,
    IReadOnlyCollection<string> ProblemHighlights);
