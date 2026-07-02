using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VanWise.Domain.Campers;
using VanWise.Domain.Financing;
using VanWise.Domain.Scoring;
using VanWise.Domain.Users;
using VanWise.Domain.Visits;

namespace VanWise.Persistence.Configurations;

public sealed class AttachmentConfiguration : IEntityTypeConfiguration<Attachment>
{
    public void Configure(EntityTypeBuilder<Attachment> builder)
    {
        builder.Property(attachment => attachment.FileName).HasMaxLength(260).IsRequired();
        builder.Property(attachment => attachment.ContentType).HasMaxLength(120).IsRequired();
        builder.Property(attachment => attachment.StoragePath).HasMaxLength(1000).IsRequired();
        builder.Property(attachment => attachment.Caption).HasMaxLength(300);
        builder.HasIndex(attachment => new { attachment.CamperId, attachment.SortOrder });
    }
}

public sealed class FinancingOfferConfiguration : IEntityTypeConfiguration<FinancingOffer>
{
    public void Configure(EntityTypeBuilder<FinancingOffer> builder)
    {
        builder.Property(offer => offer.DownPayment).HasPrecision(18, 2);
        builder.Property(offer => offer.TanPercent).HasPrecision(5, 2);
        builder.Property(offer => offer.TaegPercent).HasPrecision(5, 2);
        builder.Property(offer => offer.MonthlyPayment).HasPrecision(18, 2);
        builder.Property(offer => offer.TotalCost).HasPrecision(18, 2);
    }
}

public sealed class TagConfiguration : IEntityTypeConfiguration<Tag>
{
    public void Configure(EntityTypeBuilder<Tag> builder)
    {
        builder.Property(tag => tag.Id).ValueGeneratedNever();
        builder.Property(tag => tag.Name).HasMaxLength(80).IsRequired();
        builder.HasIndex(tag => tag.Name);
    }
}

public sealed class VisitConfiguration : IEntityTypeConfiguration<Visit>
{
    public void Configure(EntityTypeBuilder<Visit> builder)
    {
        builder.Property(visit => visit.Notes).HasMaxLength(2000);
        builder.HasIndex(visit => visit.OccurredAt);
    }
}

public sealed class VisitChecklistConfiguration : IEntityTypeConfiguration<VisitChecklist>
{
    public void Configure(EntityTypeBuilder<VisitChecklist> builder)
    {
        builder.Navigation(checklist => checklist.Items).UsePropertyAccessMode(PropertyAccessMode.Field);
        builder
            .HasMany(checklist => checklist.Items)
            .WithOne()
            .HasForeignKey(item => item.VisitChecklistId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public sealed class ChecklistItemConfiguration : IEntityTypeConfiguration<ChecklistItem>
{
    public void Configure(EntityTypeBuilder<ChecklistItem> builder)
    {
        builder.Property(item => item.Category).HasMaxLength(80).IsRequired();
        builder.Property(item => item.Description).HasMaxLength(500).IsRequired();
        builder.Property(item => item.Notes).HasMaxLength(1000);
    }
}

public sealed class ScoreProfileConfiguration : IEntityTypeConfiguration<ScoreProfile>
{
    public void Configure(EntityTypeBuilder<ScoreProfile> builder)
    {
        builder.Property(profile => profile.Name).HasMaxLength(120).IsRequired();
        builder.Navigation(profile => profile.Criteria).UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}

public sealed class ScoreCriterionConfiguration : IEntityTypeConfiguration<ScoreCriterion>
{
    public void Configure(EntityTypeBuilder<ScoreCriterion> builder)
    {
        builder.Property(criterion => criterion.Name).HasMaxLength(120).IsRequired();
        builder.Property(criterion => criterion.Weight).HasPrecision(5, 2);
    }
}

public sealed class UserPreferenceConfiguration : IEntityTypeConfiguration<UserPreference>
{
    public void Configure(EntityTypeBuilder<UserPreference> builder)
    {
        builder.Property(preference => preference.Key).HasMaxLength(120).IsRequired();
        builder.Property(preference => preference.Value).HasMaxLength(2000).IsRequired();
        builder.HasIndex(preference => preference.Key).IsUnique();
    }
}
