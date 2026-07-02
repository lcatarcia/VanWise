using FluentAssertions;
using VanWise.Application.Visits;
using VanWise.Application.Visits.Validation;

namespace VanWise.Application.Tests;

public sealed class VisitChecklistValidationTests
{
    [Fact]
    public async Task UpsertVisitChecklistRequestValidator_accepts_valid_request()
    {
        var request = new UpsertVisitChecklistRequest(
            DateTimeOffset.UtcNow,
            [new UpsertChecklistItemRequest(null, "Esterno", "Carrozzeria", "ok", string.Empty)]);

        var validator = new UpsertVisitChecklistRequestValidator();

        var result = await validator.ValidateAsync(request);

        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public async Task UpsertVisitChecklistRequestValidator_rejects_unknown_status()
    {
        var request = new UpsertVisitChecklistRequest(
            DateTimeOffset.UtcNow,
            [new UpsertChecklistItemRequest(null, "Esterno", "Carrozzeria", "unknown", string.Empty)]);

        var validator = new UpsertVisitChecklistRequestValidator();

        var result = await validator.ValidateAsync(request);

        result.IsValid.Should().BeFalse();
    }

    [Fact]
    public async Task UpsertVisitChecklistRequestValidator_rejects_null_items_without_throwing()
    {
        var request = new UpsertVisitChecklistRequest(DateTimeOffset.UtcNow, null!);
        var validator = new UpsertVisitChecklistRequestValidator();

        var result = await validator.ValidateAsync(request);

        result.IsValid.Should().BeFalse();
    }

    [Fact]
    public async Task UpsertVisitChecklistRequestValidator_rejects_unknown_category()
    {
        var request = new UpsertVisitChecklistRequest(
            DateTimeOffset.UtcNow,
            [new UpsertChecklistItemRequest(null, "Altro", "Carrozzeria", "ok", string.Empty)]);

        var validator = new UpsertVisitChecklistRequestValidator();

        var result = await validator.ValidateAsync(request);

        result.IsValid.Should().BeFalse();
    }
}
