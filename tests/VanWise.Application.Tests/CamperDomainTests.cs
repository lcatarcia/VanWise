using FluentAssertions;
using VanWise.Domain.Campers;

namespace VanWise.Application.Tests;

public sealed class CamperDomainTests
{
    [Fact]
    public void PricePerMeter_returns_rounded_value()
    {
        var camper = new Camper(
            "Adria",
            "Matrix",
            2022,
            76500,
            18000,
            6.99m,
            "Manual",
            "Fiat 2.2",
            "Ducato",
            4,
            "Veneto",
            string.Empty,
            "https://example.com/adria",
            false);

        camper.PricePerMeter.Should().Be(10944.21m);
    }
}
