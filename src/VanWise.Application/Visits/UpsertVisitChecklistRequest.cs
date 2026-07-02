namespace VanWise.Application.Visits;

public sealed record UpsertVisitChecklistRequest(
    DateTimeOffset VisitDate,
    IReadOnlyCollection<UpsertChecklistItemRequest> Items);
