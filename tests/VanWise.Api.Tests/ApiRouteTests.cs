using FluentAssertions;

namespace VanWise.Api.Tests;

public sealed class ApiRouteTests
{
    [Fact]
    public void Program_type_is_exposed_for_integration_tests()
    {
        typeof(Program).Assembly.GetName().Name.Should().Be("VanWise.Api");
    }
}
