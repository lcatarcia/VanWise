using VanWise.Domain.Common;

namespace VanWise.Domain.Campers;

public sealed class Tag : Entity
{
    public string Name { get; private set; } = string.Empty;
    public Guid? CamperId { get; private set; }

    private Tag()
    {
    }

    public Tag(string name)
    {
        Name = name.Trim();
    }
}
