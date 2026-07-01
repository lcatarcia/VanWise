namespace VanWise.Application.Campers;

public interface IDashboardService
{
    Task<DashboardStatsDto> GetAsync(CancellationToken cancellationToken);
}
