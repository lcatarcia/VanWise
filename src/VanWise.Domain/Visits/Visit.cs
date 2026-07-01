using VanWise.Domain.Common;

namespace VanWise.Domain.Visits;

public sealed class Visit : Entity
{
    public Guid CamperId { get; private set; }
    public TimelineEventType EventType { get; private set; }
    public DateTimeOffset OccurredAt { get; private set; }
    public string Notes { get; private set; } = string.Empty;

    private Visit()
    {
    }

    public Visit(Guid camperId, TimelineEventType eventType, DateTimeOffset occurredAt, string notes)
    {
        CamperId = camperId;
        EventType = eventType;
        OccurredAt = occurredAt;
        Notes = notes.Trim();
    }
}
