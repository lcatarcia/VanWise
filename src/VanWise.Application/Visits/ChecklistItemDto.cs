namespace VanWise.Application.Visits;

public sealed record ChecklistItemDto(
    Guid Id,
    string Category,
    string Description,
    string Status,
    string Notes);
