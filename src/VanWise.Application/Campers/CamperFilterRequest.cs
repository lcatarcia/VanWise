namespace VanWise.Application.Campers;

public sealed record CamperFilterRequest(
    decimal? MinPrice,
    decimal? MaxPrice,
    int? MaxMileageKm,
    decimal? MinLengthMeters,
    decimal? MaxLengthMeters,
    string? Transmission,
    string? Engine,
    string? Chassis,
    int? SleepingPlaces,
    string? Region,
    string? Dealer);
