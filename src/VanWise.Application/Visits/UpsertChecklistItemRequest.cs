namespace VanWise.Application.Visits;

public sealed record UpsertChecklistItemRequest(
    Guid? Id,
    string Category,
    string Description,
    string Status,
    string Notes);
