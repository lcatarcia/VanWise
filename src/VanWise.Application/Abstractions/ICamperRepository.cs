using VanWise.Application.Campers;
using VanWise.Domain.Campers;

namespace VanWise.Application.Abstractions;

public interface ICamperRepository
{
    Task<IReadOnlyCollection<CamperSummaryDto>> ListAsync(CamperFilterRequest filter, CancellationToken cancellationToken);
    Task<CamperDetailDto?> GetDetailAsync(Guid id, CancellationToken cancellationToken);
    Task<Camper?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<IReadOnlyCollection<CamperComparisonDto>> GetComparisonAsync(IReadOnlyCollection<Guid> ids, CancellationToken cancellationToken);
    Task<DashboardStatsDto> GetDashboardStatsAsync(CancellationToken cancellationToken);
    void Add(Camper camper);
    void Remove(Camper camper);
}
