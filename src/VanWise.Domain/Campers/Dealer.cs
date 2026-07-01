using VanWise.Domain.Common;

namespace VanWise.Domain.Campers;

public sealed class Dealer : Entity
{
    private readonly List<Camper> _campers = [];

    public string Name { get; private set; } = string.Empty;
    public string Region { get; private set; } = string.Empty;
    public string WebsiteUrl { get; private set; } = string.Empty;
    public string PhoneNumber { get; private set; } = string.Empty;

    public IReadOnlyCollection<Camper> Campers => _campers;

    private Dealer()
    {
    }

    public Dealer(string name, string region, string websiteUrl, string phoneNumber)
    {
        Name = name.Trim();
        Region = region.Trim();
        WebsiteUrl = websiteUrl.Trim();
        PhoneNumber = phoneNumber.Trim();
    }
}
