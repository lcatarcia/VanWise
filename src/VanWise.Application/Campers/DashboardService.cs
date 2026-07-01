using VanWise.Application.Abstractions;

namespace VanWise.Application.Campers;

public sealed class DashboardService(ICamperRepository camperRepository) : IDashboardService
{
    public Task<DashboardStatsDto> GetAsync(CancellationToken cancellationToken)
    {
        return camperRepository.GetDashboardStatsAsync(cancellationToken);
    }
}
