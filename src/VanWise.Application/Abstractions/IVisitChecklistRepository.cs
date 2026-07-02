using VanWise.Application.Visits;
using VanWise.Domain.Visits;

namespace VanWise.Application.Abstractions;

public interface IVisitChecklistRepository
{
    Task<bool> CamperExistsAsync(Guid camperId, CancellationToken cancellationToken);
    Task<IReadOnlyCollection<VisitChecklistDto>> ListByCamperAsync(Guid camperId, CancellationToken cancellationToken);
    Task<VisitChecklistDto?> GetDetailAsync(Guid id, CancellationToken cancellationToken);
    Task<VisitChecklist?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    void Add(VisitChecklist checklist);
    void Remove(VisitChecklist checklist);
}
