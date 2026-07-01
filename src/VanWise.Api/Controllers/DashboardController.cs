using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using VanWise.Application.Campers;

namespace VanWise.Api.Controllers;

[ApiController]
[ApiVersion(1.0)]
[Route("api/v{version:apiVersion}/dashboard")]
public sealed class DashboardController(IDashboardService dashboardService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType<DashboardStatsDto>(StatusCodes.Status200OK)]
    public async Task<ActionResult<DashboardStatsDto>> Get(CancellationToken cancellationToken)
    {
        return Ok(await dashboardService.GetAsync(cancellationToken));
    }
}
