namespace VanWise.Application.Campers;

public sealed record CamperDetailDto(
    Guid Id,
    string Brand,
    string Model,
    int Year,
    decimal AskingPrice,
    int MileageKm,
    decimal LengthMeters,
    string Transmission,
    string Engine,
    string Chassis,
    int SleepingPlaces,
    string Region,
    string Notes,
    string SourceUrl,
    bool IsFavorite,
    string? DealerName,
    IReadOnlyCollection<string> Tags,
    decimal PricePerMeter);
