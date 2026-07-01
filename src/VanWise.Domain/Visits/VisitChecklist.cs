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
}
