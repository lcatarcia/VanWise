using FluentAssertions;
using FluentValidation;
using VanWise.Application.Abstractions;
using VanWise.Application.Campers;
using VanWise.Domain.Campers;

namespace VanWise.Application.Tests;

public sealed class CamperComparisonTests
{
    [Fact]
    public async Task CompareAsync_rejects_duplicate_ids()
    {
        var camperId = Guid.NewGuid();
        var service = new CamperService(new EmptyCamperRepository(), null!, null!, null!);

        var action = () => service.CompareAsync([camperId, camperId], CancellationToken.None);

        await action.Should().ThrowAsync<ValidationException>();
    }

    private sealed class EmptyCamperRepository : ICamperRepository
    {
        public Task<IReadOnlyCollection<CamperSummaryDto>> ListAsync(CamperFilterRequest filter, CancellationToken cancellationToken) => Task.FromResult<IReadOnlyCollection<CamperSummaryDto>>([]);
        public Task<CamperDetailDto?> GetDetailAsync(Guid id, CancellationToken cancellationToken) => Task.FromResult<CamperDetailDto?>(null);
        public Task<Camper?> GetByIdAsync(Guid id, CancellationToken cancellationToken) => Task.FromResult<Camper?>(null);
        public Task<IReadOnlyCollection<CamperComparisonDto>> GetComparisonAsync(IReadOnlyCollection<Guid> ids, CancellationToken cancellationToken) => Task.FromResult<IReadOnlyCollection<CamperComparisonDto>>([]);
        public Task<DashboardStatsDto> GetDashboardStatsAsync(CancellationToken cancellationToken) => throw new NotSupportedException();
        public void RemoveExistingTags(Camper camper) => throw new NotSupportedException();
        public void ReplaceRemotePhotos(Guid camperId, IEnumerable<string> imageUrls) => throw new NotSupportedException();
        public void Add(Camper camper) => throw new NotSupportedException();
        public void Remove(Camper camper) => throw new NotSupportedException();
    }
}
