using VanWise.Domain.Common;

namespace VanWise.Domain.Scoring;

public sealed class ScoreProfile : Entity
{
    private readonly List<ScoreCriterion> _criteria = [];

    public string Name { get; private set; } = string.Empty;
    public IReadOnlyCollection<ScoreCriterion> Criteria => _criteria;

    private ScoreProfile()
    {
    }

    public ScoreProfile(string name)
    {
        Name = name.Trim();
    }

    public void AddCriterion(string name, decimal weight)
    {
        _criteria.Add(new ScoreCriterion(name, weight));
        MarkUpdated();
    }
}
