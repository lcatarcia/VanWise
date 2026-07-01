using VanWise.Domain.Common;

namespace VanWise.Domain.Visits;

public sealed class ChecklistItem : Entity
{
    public Guid VisitChecklistId { get; private set; }
    public string Category { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public ChecklistItemStatus Status { get; private set; }
    public string Notes { get; private set; } = string.Empty;

    private ChecklistItem()
    {
    }

    public ChecklistItem(string category, string description, ChecklistItemStatus status, string notes)
    {
        Category = category.Trim();
        Description = description.Trim();
        Status = status;
        Notes = notes.Trim();
    }
}
