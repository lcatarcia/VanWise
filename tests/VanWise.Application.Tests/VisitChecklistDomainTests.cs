using FluentAssertions;
using VanWise.Domain.Visits;

namespace VanWise.Application.Tests;

public sealed class VisitChecklistDomainTests
{
    [Fact]
    public void ReplaceItems_updates_adds_and_removes_items()
    {
        var checklist = new VisitChecklist(Guid.NewGuid(), DateTimeOffset.UtcNow);
        checklist.AddItem("Esterno", "Carrozzeria", ChecklistItemStatus.ToVerify, "Da vedere");
        checklist.AddItem("Interno", "Mobili", ChecklistItemStatus.ToVerify, string.Empty);
        var keptItem = checklist.Items.First();

        checklist.ReplaceItems([
            new ChecklistItemUpdate(keptItem.Id, "Esterno", "Carrozzeria completa", ChecklistItemStatus.Ok, "Verificata"),
            new ChecklistItemUpdate(null, "Meccanica", "Avviamento", ChecklistItemStatus.Problem, "Rumore anomalo")
        ]);

        checklist.Items.Should().HaveCount(2);
        checklist.Items.Should().Contain(item => item.Id == keptItem.Id && item.Description == "Carrozzeria completa" && item.Status == ChecklistItemStatus.Ok);
        checklist.Items.Should().Contain(item => item.Category == "Meccanica" && item.Status == ChecklistItemStatus.Problem);
        checklist.Items.Should().NotContain(item => item.Description == "Mobili");
    }

    [Fact]
    public void ReplaceItems_rejects_unknown_item_id()
    {
        var checklist = new VisitChecklist(Guid.NewGuid(), DateTimeOffset.UtcNow);
        checklist.AddItem("Esterno", "Carrozzeria", ChecklistItemStatus.ToVerify, string.Empty);

        var action = () => checklist.ReplaceItems([
            new ChecklistItemUpdate(Guid.NewGuid(), "Esterno", "Carrozzeria", ChecklistItemStatus.Ok, string.Empty)
        ]);

        action.Should().Throw<ArgumentException>();
    }
}
