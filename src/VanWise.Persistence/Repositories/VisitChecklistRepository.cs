using Microsoft.EntityFrameworkCore;
using VanWise.Application.Abstractions;
using VanWise.Application.Visits;
using VanWise.Domain.Visits;

namespace VanWise.Persistence.Repositories;

public sealed class VisitChecklistRepository(VanWiseDbContext dbContext) : IVisitChecklistRepository
{
    public Task<bool> CamperExistsAsync(Guid camperId, CancellationToken cancellationToken)
    {
        return dbContext.Campers.AnyAsync(camper => camper.Id == camperId, cancellationToken);
    }

    public async Task<IReadOnlyCollection<VisitChecklistDto>> ListByCamperAsync(Guid camperId, CancellationToken cancellationToken)
    {
        var checklists = await dbContext.VisitChecklists
            .AsNoTracking()
            .Include(checklist => checklist.Items)
            .Where(checklist => checklist.CamperId == camperId)
            .OrderByDescending(checklist => checklist.VisitDate)
            .ToListAsync(cancellationToken);

        return checklists.Select(Map).ToList();
    }

    public async Task<VisitChecklistDto?> GetDetailAsync(Guid id, CancellationToken cancellationToken)
    {
        var checklist = await dbContext.VisitChecklists
            .AsNoTracking()
            .Include(checklist => checklist.Items)
            .FirstOrDefaultAsync(checklist => checklist.Id == id, cancellationToken);

        return checklist is null ? null : Map(checklist);
    }

    public Task<VisitChecklist?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return dbContext.VisitChecklists
            .Include(checklist => checklist.Items)
            .FirstOrDefaultAsync(checklist => checklist.Id == id, cancellationToken);
    }

    public void Add(VisitChecklist checklist)
    {
        dbContext.VisitChecklists.Add(checklist);
    }

    public void Remove(VisitChecklist checklist)
    {
        dbContext.VisitChecklists.Remove(checklist);
    }

    private static VisitChecklistDto Map(VisitChecklist checklist)
    {
        return new VisitChecklistDto(
            checklist.Id,
            checklist.CamperId,
            checklist.VisitDate,
            checklist.Items
                .OrderBy(item => item.CreatedAt)
                .Select(item => new ChecklistItemDto(
                    item.Id,
                    item.Category,
                    item.Description,
                    ChecklistStatusMapper.ToDto(item.Status),
                    item.Notes))
                .ToList());
    }
}
