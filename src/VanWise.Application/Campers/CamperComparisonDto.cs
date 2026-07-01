namespace VanWise.Application.Campers;

public sealed record CamperComparisonDto(
    Guid Id,
    string Brand,
    string Model,
    int Year,
    decimal AskingPrice,
    int MileageKm,
    decimal LengthMeters,
    int SleepingPlaces,
    string Transmission,
    string Engine,
    string Chassis,
    decimal PricePerMeter,
    bool IsFavorite);
