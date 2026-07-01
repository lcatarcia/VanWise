namespace VanWise.Domain.Common;

public abstract class Entity
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public DateTimeOffset CreatedAt { get; init; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? UpdatedAt { get; private set; }

    public void MarkUpdated()
    {
        UpdatedAt = DateTimeOffset.UtcNow;
    }
}
