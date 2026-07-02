using VanWise.Domain.Visits;

namespace VanWise.Application.Visits;

public static class ChecklistStatusMapper
{
    public const string Ok = "ok";
    public const string ToVerify = "toVerify";
    public const string Problem = "problem";

    public static string ToDto(ChecklistItemStatus status)
    {
        return status switch
        {
            ChecklistItemStatus.Ok => Ok,
            ChecklistItemStatus.ToVerify => ToVerify,
            ChecklistItemStatus.Problem => Problem,
            _ => throw new ArgumentOutOfRangeException(nameof(status), status, "Unknown checklist status.")
        };
    }

    public static ChecklistItemStatus ToDomain(string status)
    {
        return status.Trim() switch
        {
            Ok => ChecklistItemStatus.Ok,
            ToVerify => ChecklistItemStatus.ToVerify,
            Problem => ChecklistItemStatus.Problem,
            _ => throw new ArgumentException("Unknown checklist status.", nameof(status))
        };
    }

    public static bool IsKnown(string? status)
    {
        return status?.Trim() is Ok or ToVerify or Problem;
    }
}
