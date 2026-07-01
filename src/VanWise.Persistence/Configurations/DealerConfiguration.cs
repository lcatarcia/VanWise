using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VanWise.Domain.Campers;

namespace VanWise.Persistence.Configurations;

public sealed class DealerConfiguration : IEntityTypeConfiguration<Dealer>
{
    public void Configure(EntityTypeBuilder<Dealer> builder)
    {
        builder.HasKey(dealer => dealer.Id);
        builder.Property(dealer => dealer.Name).HasMaxLength(160).IsRequired();
        builder.Property(dealer => dealer.Region).HasMaxLength(80);
        builder.Property(dealer => dealer.WebsiteUrl).HasMaxLength(300);
        builder.Property(dealer => dealer.PhoneNumber).HasMaxLength(40);
        builder.HasIndex(dealer => dealer.Name);
        builder.Navigation(dealer => dealer.Campers).UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
