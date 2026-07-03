using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VanWise.Domain.Campers;

namespace VanWise.Persistence.Configurations;

public sealed class CamperConfiguration : IEntityTypeConfiguration<Camper>
{
    public void Configure(EntityTypeBuilder<Camper> builder)
    {
        builder.HasKey(camper => camper.Id);

        builder.Property(camper => camper.Brand).HasMaxLength(100).IsRequired();
        builder.Property(camper => camper.Model).HasMaxLength(120).IsRequired();
        builder.Property(camper => camper.AskingPrice).HasPrecision(18, 2);
        builder.Property(camper => camper.LengthMeters).HasPrecision(5, 2);
        builder.Property(camper => camper.Transmission).HasMaxLength(60);
        builder.Property(camper => camper.Engine).HasMaxLength(120);
        builder.Property(camper => camper.Chassis).HasMaxLength(120);
        builder.Property(camper => camper.Region).HasMaxLength(80);
        builder.Property(camper => camper.City).HasMaxLength(80);
        builder.Property(camper => camper.Address).HasMaxLength(200);
        builder.Property(camper => camper.Notes).HasMaxLength(4000);
        builder.Property(camper => camper.SourceUrl).HasMaxLength(1000);

        builder.HasIndex(camper => camper.Brand);
        builder.HasIndex(camper => camper.AskingPrice);
        builder.HasIndex(camper => camper.MileageKm);
        builder.HasIndex(camper => camper.Region);
        builder.HasIndex(camper => camper.City);

        builder.Navigation(camper => camper.Tags).UsePropertyAccessMode(PropertyAccessMode.Field);
        builder.Navigation(camper => camper.Attachments).UsePropertyAccessMode(PropertyAccessMode.Field);
        builder.Navigation(camper => camper.FinancingOffers).UsePropertyAccessMode(PropertyAccessMode.Field);
        builder.Navigation(camper => camper.Visits).UsePropertyAccessMode(PropertyAccessMode.Field);
        builder.Navigation(camper => camper.VisitChecklists).UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
