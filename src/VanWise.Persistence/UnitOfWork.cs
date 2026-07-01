using VanWise.Application.Abstractions;

namespace VanWise.Persistence;

public sealed class UnitOfWork(VanWiseDbContext dbContext) : IUnitOfWork
{
    public Task<int> SaveChangesAsync(CancellationToken cancellationToken)
    {
        return dbContext.SaveChangesAsync(cancellationToken);
    }
}
