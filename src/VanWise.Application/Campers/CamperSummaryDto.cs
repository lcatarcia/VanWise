namespace VanWise.Application.Campers;

public sealed record CamperSummaryDto(
    Guid Id,
    string Brand,
    string Model,
    int Year,
    decimal AskingPrice,
    int MileageKm,
    decimal LengthMeters,
    string Region,
    string? DealerName,
    bool IsFavorite,
    decimal PricePerMeter);
