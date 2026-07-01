using Microsoft.EntityFrameworkCore;
using VanWise.Domain.Campers;
using VanWise.Domain.Financing;
using VanWise.Domain.Scoring;
using VanWise.Domain.Users;
using VanWise.Domain.Visits;

namespace VanWise.Persistence;

public sealed class VanWiseDbContext(DbContextOptions<VanWiseDbContext> options) : DbContext(options)
{
    public DbSet<Camper> Campers => Set<Camper>();
    public DbSet<Dealer> Dealers => Set<Dealer>();
    public DbSet<FinancingOffer> FinancingOffers => Set<FinancingOffer>();
    public DbSet<VisitChecklist> VisitChecklists => Set<VisitChecklist>();
    public DbSet<ChecklistItem> ChecklistItems => Set<ChecklistItem>();
    public DbSet<Visit> Visits => Set<Visit>();
    public DbSet<Attachment> Attachments => Set<Attachment>();
    public DbSet<UserPreference> UserPreferences => Set<UserPreference>();
    public DbSet<ScoreProfile> ScoreProfiles => Set<ScoreProfile>();
    public DbSet<Tag> Tags => Set<Tag>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(VanWiseDbContext).Assembly);
    }
}
