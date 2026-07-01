using VanWise.Domain.Common;

namespace VanWise.Domain.Users;

public sealed class UserPreference : Entity
{
    public string Key { get; private set; } = string.Empty;
    public string Value { get; private set; } = string.Empty;

    private UserPreference()
    {
    }

    public UserPreference(string key, string value)
    {
        Key = key.Trim();
        Value = value.Trim();
    }
}
