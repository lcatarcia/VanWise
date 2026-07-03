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
            "Padova",
            string.Empty,
            null,
            null,
            string.Empty,
            "https://example.com/adria",
            false);

        camper.PricePerMeter.Should().Be(10944.21m);
    }

    [Fact]
    public void Camper_trims_city_and_keeps_missing_price_per_meter_zero()
    {
        var camper = new Camper(
            "Adria",
            "Matrix",
            null,
            null,
            null,
            null,
            string.Empty,
            string.Empty,
            string.Empty,
            null,
            "Veneto",
            " Padova ",
            string.Empty,
            null,
            null,
            string.Empty,
            string.Empty,
            false);

        camper.City.Should().Be("Padova");
        camper.PricePerMeter.Should().Be(0);
    }

    [Fact]
    public void ReplaceRemotePhotos_updates_existing_photos_in_place()
    {
        var camper = new Camper(
            "Adria",
            "Matrix",
            null,
            null,
            null,
            null,
            string.Empty,
            string.Empty,
            string.Empty,
            null,
            string.Empty,
            "Padova",
            string.Empty,
            null,
            null,
            string.Empty,
            string.Empty,
            false);
        camper.ReplaceRemotePhotos(["https://example.com/old-a.jpg", "https://example.com/old-b.jpg"]);
        var firstPhotoId = camper.Attachments.OrderBy(attachment => attachment.SortOrder).First().Id;

        camper.ReplaceRemotePhotos(["https://example.com/new-a.jpg", "https://example.com/new-b.jpg"]);

        camper.Attachments.Should().HaveCount(2);
        camper.Attachments.OrderBy(attachment => attachment.SortOrder).First().Id.Should().Be(firstPhotoId);
        camper.Attachments.OrderBy(attachment => attachment.SortOrder).First().StoragePath.Should().Be("https://example.com/new-a.jpg");
    }
}
