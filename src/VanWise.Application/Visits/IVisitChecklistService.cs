namespace VanWise.Application.Visits;

public interface IVisitChecklistService
{
    Task<IReadOnlyCollection<VisitChecklistDto>?> ListByCamperAsync(Guid camperId, CancellationToken cancellationToken);
    Task<VisitChecklistDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<VisitChecklistDto?> CreateAsync(Guid camperId, UpsertVisitChecklistRequest request, CancellationToken cancellationToken);
    Task<VisitChecklistDto?> UpdateAsync(Guid id, UpsertVisitChecklistRequest request, CancellationToken cancellationToken);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken);
}
