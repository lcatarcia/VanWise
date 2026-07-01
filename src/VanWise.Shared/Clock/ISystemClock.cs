namespace VanWise.Shared.Clock;

public interface ISystemClock
{
    DateTimeOffset UtcNow { get; }
}
