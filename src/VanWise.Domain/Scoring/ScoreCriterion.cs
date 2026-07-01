using VanWise.Domain.Common;

namespace VanWise.Domain.Scoring;

public sealed class ScoreCriterion : Entity
{
    public Guid ScoreProfileId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public decimal Weight { get; private set; }

    private ScoreCriterion()
    {
    }

    public ScoreCriterion(string name, decimal weight)
    {
        Name = name.Trim();
        Weight = weight;
    }
}
