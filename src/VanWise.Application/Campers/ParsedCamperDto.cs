namespace VanWise.Application.Campers;

public sealed record ParsedCamperDto(
    string Brand,
    string Model,
    int? Year,
    decimal? AskingPrice,
    int? MileageKm,
    decimal? LengthMeters,
    string Transmission,
    string Engine,
    string Chassis,
    int? SleepingPlaces,
    string Region,
    string City,
    string Notes,
    string SourceUrl,
    IReadOnlyCollection<string> ImageUrls);
