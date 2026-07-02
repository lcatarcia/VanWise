using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using VanWise.Application.Visits;

namespace VanWise.Api.Controllers;

[ApiController]
[ApiVersion(1.0)]
[Route("api/v{version:apiVersion}")]
public sealed class VisitChecklistsController(IVisitChecklistService visitChecklistService) : ControllerBase
{
    [HttpGet("campers/{camperId:guid}/visit-checklists")]
    [ProducesResponseType<IReadOnlyCollection<VisitChecklistDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IReadOnlyCollection<VisitChecklistDto>>> ListByCamper(Guid camperId, CancellationToken cancellationToken)
    {
        var checklists = await visitChecklistService.ListByCamperAsync(camperId, cancellationToken);
        return checklists is null ? NotFound() : Ok(checklists);
    }

    [HttpGet("visit-checklists/{id:guid}")]
    [ProducesResponseType<VisitChecklistDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<VisitChecklistDto>> Get(Guid id, CancellationToken cancellationToken)
    {
        var checklist = await visitChecklistService.GetByIdAsync(id, cancellationToken);
        return checklist is null ? NotFound() : Ok(checklist);
    }

    [HttpPost("campers/{camperId:guid}/visit-checklists")]
    [ProducesResponseType<VisitChecklistDto>(StatusCodes.Status201Created)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<VisitChecklistDto>> Create(Guid camperId, UpsertVisitChecklistRequest request, CancellationToken cancellationToken)
    {
        var checklist = await visitChecklistService.CreateAsync(camperId, request, cancellationToken);
        return checklist is null ? NotFound() : CreatedAtAction(nameof(Get), new { id = checklist.Id, version = "1.0" }, checklist);
    }

    [HttpPut("visit-checklists/{id:guid}")]
    [ProducesResponseType<VisitChecklistDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<VisitChecklistDto>> Update(Guid id, UpsertVisitChecklistRequest request, CancellationToken cancellationToken)
    {
        var checklist = await visitChecklistService.UpdateAsync(id, request, cancellationToken);
        return checklist is null ? NotFound() : Ok(checklist);
    }

    [HttpDelete("visit-checklists/{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var deleted = await visitChecklistService.DeleteAsync(id, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }
}
