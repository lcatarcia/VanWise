namespace VanWise.Application.Campers;

public sealed record CamperSummaryDto(
    Guid Id,
    string Brand,
    string Model,
    int? Year,
    decimal? AskingPrice,
    int? MileageKm,
    decimal? LengthMeters,
    string Region,
    string City,
    string? DealerName,
    bool IsFavorite,
    string? CoverImageUrl,
    decimal PricePerMeter);
