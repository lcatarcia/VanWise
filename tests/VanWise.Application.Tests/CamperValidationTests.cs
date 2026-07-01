using FluentAssertions;
using FluentValidation;
using VanWise.Application.Campers;
using VanWise.Application.Campers.Validation;

namespace VanWise.Application.Tests;

public sealed class CamperValidationTests
{
    [Fact]
    public async Task CreateCamperRequestValidator_accepts_valid_camper()
    {
        var request = new CreateCamperRequest(
            "Hymer",
            "B-MC T 580",
            DateTime.UtcNow.Year,
            92000,
            24000,
            6.99m,
            "Automatic",
            "Mercedes 2.0",
            "Sprinter",
            4,
            "Lombardia",
            "Milano",
            "Well equipped",
            "https://example.com/hymer",
            true,
            ["garage", "solar"]);

        var validator = new CreateCamperRequestValidator();

        var result = await validator.ValidateAsync(request);

        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public async Task CreateCamperRequestValidator_rejects_invalid_price()
    {
        var request = new CreateCamperRequest(
            "Hymer",
            "B-MC T 580",
            DateTime.UtcNow.Year,
            0,
            24000,
            6.99m,
            "Automatic",
            "Mercedes 2.0",
            "Sprinter",
            4,
            "Lombardia",
            string.Empty,
            string.Empty,
            string.Empty,
            false,
            []);

        var validator = new CreateCamperRequestValidator();

        var action = () => validator.ValidateAndThrowAsync(request);

        await action.Should().ThrowAsync<ValidationException>();
    }

    [Fact]
    public async Task CreateCamperRequestValidator_accepts_optional_camper_fields()
    {
        var request = new CreateCamperRequest(
            "Hymer",
            "B-MC T 580",
            null,
            null,
            null,
            null,
            string.Empty,
            string.Empty,
            string.Empty,
            null,
            string.Empty,
            "Milano",
            string.Empty,
            string.Empty,
            false,
            []);

        var validator = new CreateCamperRequestValidator();

        var result = await validator.ValidateAsync(request);

        result.IsValid.Should().BeTrue();
    }
}
