namespace VanWise.Application.Abstractions;

public interface IGeocodingService
{
    Task<(double Latitude, double Longitude)?> GeocodeAsync(string query, CancellationToken cancellationToken);
}
