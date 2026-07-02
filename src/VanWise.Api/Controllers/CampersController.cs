using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using VanWise.Application.Campers;

namespace VanWise.Api.Controllers;

[ApiController]
[ApiVersion(1.0)]
[Route("api/v{version:apiVersion}/campers")]
public sealed class CampersController(ICamperService camperService, ICamperListingParser camperListingParser) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType<IReadOnlyCollection<CamperSummaryDto>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyCollection<CamperSummaryDto>>> List([FromQuery] CamperFilterRequest filter, CancellationToken cancellationToken)
    {
        return Ok(await camperService.ListAsync(filter, cancellationToken));
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType<CamperDetailDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CamperDetailDto>> Get(Guid id, CancellationToken cancellationToken)
    {
        var camper = await camperService.GetByIdAsync(id, cancellationToken);
        return camper is null ? NotFound() : Ok(camper);
    }

    [HttpPost]
    [ProducesResponseType<CamperDetailDto>(StatusCodes.Status201Created)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CamperDetailDto>> Create(CreateCamperRequest request, CancellationToken cancellationToken)
    {
        var camper = await camperService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = camper.Id, version = "1.0" }, camper);
    }

    [HttpPost("parse-url")]
    [ProducesResponseType<ParsedCamperDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ParsedCamperDto>> ParseUrl(ParseCamperUrlRequest request, CancellationToken cancellationToken)
    {
        return Ok(await camperListingParser.ParseAsync(request, cancellationToken));
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType<CamperDetailDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CamperDetailDto>> Update(Guid id, UpdateCamperRequest request, CancellationToken cancellationToken)
    {
        var camper = await camperService.UpdateAsync(id, request, cancellationToken);
        return camper is null ? NotFound() : Ok(camper);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var deleted = await camperService.DeleteAsync(id, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }

    [HttpGet("compare")]
    [ProducesResponseType<IReadOnlyCollection<CamperComparisonDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<IReadOnlyCollection<CamperComparisonDto>>> Compare([FromQuery] Guid[] ids, CancellationToken cancellationToken)
    {
        var comparison = await camperService.CompareAsync(ids, cancellationToken);
        return comparison.Count == ids.Distinct().Count() ? Ok(comparison) : NotFound();
    }
}
