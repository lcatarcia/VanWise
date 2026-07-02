namespace VanWise.Application.Visits;

public sealed record VisitChecklistDto(
    Guid Id,
    Guid CamperId,
    DateTimeOffset VisitDate,
    IReadOnlyCollection<ChecklistItemDto> Items);
