namespace VanWise.Application.Campers;

public interface ICamperService
{
    Task<IReadOnlyCollection<CamperSummaryDto>> ListAsync(CamperFilterRequest filter, CancellationToken cancellationToken);
    Task<CamperDetailDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<CamperDetailDto> CreateAsync(CreateCamperRequest request, CancellationToken cancellationToken);
    Task<CamperDetailDto?> UpdateAsync(Guid id, UpdateCamperRequest request, CancellationToken cancellationToken);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken);
    Task<IReadOnlyCollection<CamperComparisonDto>> CompareAsync(IReadOnlyCollection<Guid> ids, CancellationToken cancellationToken);
}
