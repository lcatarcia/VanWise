using VanWise.Domain.Common;

namespace VanWise.Domain.Visits;

public sealed class VisitChecklist : Entity
{
    private readonly List<ChecklistItem> _items = [];

    public Guid CamperId { get; private set; }
    public DateTimeOffset VisitDate { get; private set; }
    public IReadOnlyCollection<ChecklistItem> Items => _items;

    private VisitChecklist()
    {
    }

    public VisitChecklist(Guid camperId, DateTimeOffset visitDate)
    {
        CamperId = camperId;
        VisitDate = visitDate;
    }

    public void AddItem(string category, string description, ChecklistItemStatus status, string notes)
    {
        _items.Add(new ChecklistItem(category, description, status, notes));
        MarkUpdated();
    }

    public void UpdateVisitDate(DateTimeOffset visitDate)
    {
        VisitDate = visitDate;
        MarkUpdated();
    }

    public void ReplaceItems(IEnumerable<ChecklistItemUpdate> items)
    {
        var requestedItems = items.ToList();
        var requestedIds = requestedItems
            .Where(item => item.Id is not null)
            .Select(item => item.Id!.Value)
            .ToList();

        if (requestedIds.Count != requestedIds.Distinct().Count())
        {
            throw new ArgumentException("Checklist item ids must be unique.", nameof(items));
        }

        var existingItemIds = _items.Select(item => item.Id).ToHashSet();
        if (requestedIds.Any(id => !existingItemIds.Contains(id)))
        {
            throw new ArgumentException("Checklist item does not belong to this checklist.", nameof(items));
        }

        _items.RemoveAll(item => !requestedIds.Contains(item.Id));

        foreach (var item in requestedItems)
        {
            if (item.Id is null)
            {
                _items.Add(new ChecklistItem(item.Category, item.Description, item.Status, item.Notes));
                continue;
            }

            var existingItem = _items.Single(existing => existing.Id == item.Id.Value);
            existingItem.UpdateDetails(item.Category, item.Description, item.Status, item.Notes);
        }

        MarkUpdated();
    }
}

public sealed record ChecklistItemUpdate(
    Guid? Id,
    string Category,
    string Description,
    ChecklistItemStatus Status,
    string Notes);
