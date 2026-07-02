namespace VanWise.Application.Campers;

public interface ICamperListingParser
{
    Task<ParsedCamperDto> ParseAsync(ParseCamperUrlRequest request, CancellationToken cancellationToken);
}
