using FluentValidation;
using FluentValidation.Results;
using VanWise.Application.Abstractions;
using VanWise.Domain.Visits;

namespace VanWise.Application.Visits;

public sealed class VisitChecklistService(
    IVisitChecklistRepository visitChecklistRepository,
    IUnitOfWork unitOfWork,
    IValidator<UpsertVisitChecklistRequest> validator) : IVisitChecklistService
{
    public async Task<IReadOnlyCollection<VisitChecklistDto>?> ListByCamperAsync(Guid camperId, CancellationToken cancellationToken)
    {
        if (!await visitChecklistRepository.CamperExistsAsync(camperId, cancellationToken))
        {
            return null;
        }

        return await visitChecklistRepository.ListByCamperAsync(camperId, cancellationToken);
    }

    public Task<VisitChecklistDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return visitChecklistRepository.GetDetailAsync(id, cancellationToken);
    }

    public async Task<VisitChecklistDto?> CreateAsync(Guid camperId, UpsertVisitChecklistRequest request, CancellationToken cancellationToken)
    {
        await validator.ValidateAndThrowAsync(request, cancellationToken);
        EnsureCreateItemsDoNotHaveIds(request.Items);

        if (!await visitChecklistRepository.CamperExistsAsync(camperId, cancellationToken))
        {
            return null;
        }

        var checklist = new VisitChecklist(camperId, request.VisitDate);
        checklist.ReplaceItems(ToDomainItems(request.Items));
        visitChecklistRepository.Add(checklist);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return await visitChecklistRepository.GetDetailAsync(checklist.Id, cancellationToken)
            ?? throw new InvalidOperationException("Created checklist could not be reloaded.");
    }

    public async Task<VisitChecklistDto?> UpdateAsync(Guid id, UpsertVisitChecklistRequest request, CancellationToken cancellationToken)
    {
        await validator.ValidateAndThrowAsync(request, cancellationToken);

        var checklist = await visitChecklistRepository.GetByIdAsync(id, cancellationToken);
        if (checklist is null)
        {
            return null;
        }

        EnsureItemsBelongToChecklist(checklist, request.Items);
        checklist.UpdateVisitDate(request.VisitDate);
        checklist.ReplaceItems(ToDomainItems(request.Items));
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return await visitChecklistRepository.GetDetailAsync(id, cancellationToken);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var checklist = await visitChecklistRepository.GetByIdAsync(id, cancellationToken);
        if (checklist is null)
        {
            return false;
        }

        visitChecklistRepository.Remove(checklist);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static IReadOnlyCollection<ChecklistItemUpdate> ToDomainItems(IReadOnlyCollection<UpsertChecklistItemRequest> items)
    {
        return items
            .Select(item => new ChecklistItemUpdate(
                item.Id,
                item.Category,
                item.Description,
                ChecklistStatusMapper.ToDomain(item.Status),
                item.Notes))
            .ToList();
    }

    private static void EnsureCreateItemsDoNotHaveIds(IReadOnlyCollection<UpsertChecklistItemRequest> items)
    {
        if (items.Any(item => item.Id is not null))
        {
            throw new ValidationException([new ValidationFailure("Items", "New checklist items must not include ids.")]);
        }
    }

    private static void EnsureItemsBelongToChecklist(VisitChecklist checklist, IReadOnlyCollection<UpsertChecklistItemRequest> items)
    {
        var existingItemIds = checklist.Items.Select(item => item.Id).ToHashSet();
        if (items.Any(item => item.Id is not null && !existingItemIds.Contains(item.Id.Value)))
        {
            throw new ValidationException([new ValidationFailure("Items", "Checklist item does not belong to this checklist.")]);
        }
    }
}
