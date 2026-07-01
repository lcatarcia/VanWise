using VanWise.Domain.Common;
using VanWise.Domain.Financing;
using VanWise.Domain.Visits;

namespace VanWise.Domain.Campers;

public sealed class Camper : Entity
{
    private readonly List<Attachment> _attachments = [];
    private readonly List<FinancingOffer> _financingOffers = [];
    private readonly List<Tag> _tags = [];
    private readonly List<Visit> _visits = [];
    private readonly List<VisitChecklist> _visitChecklists = [];

    public string Brand { get; private set; } = string.Empty;
    public string Model { get; private set; } = string.Empty;
    public int Year { get; private set; }
    public decimal AskingPrice { get; private set; }
    public int MileageKm { get; private set; }
    public decimal LengthMeters { get; private set; }
    public string Transmission { get; private set; } = string.Empty;
    public string Engine { get; private set; } = string.Empty;
    public string Chassis { get; private set; } = string.Empty;
    public int SleepingPlaces { get; private set; }
    public string Region { get; private set; } = string.Empty;
    public string Notes { get; private set; } = string.Empty;
    public string SourceUrl { get; private set; } = string.Empty;
    public bool IsFavorite { get; private set; }
    public Guid? DealerId { get; private set; }
    public Dealer? Dealer { get; private set; }

    public IReadOnlyCollection<Attachment> Attachments => _attachments;
    public IReadOnlyCollection<FinancingOffer> FinancingOffers => _financingOffers;
    public IReadOnlyCollection<Tag> Tags => _tags;
    public IReadOnlyCollection<Visit> Visits => _visits;
    public IReadOnlyCollection<VisitChecklist> VisitChecklists => _visitChecklists;

    private Camper()
    {
    }

    public Camper(
        string brand,
        string model,
        int year,
        decimal askingPrice,
        int mileageKm,
        decimal lengthMeters,
        string transmission,
        string engine,
        string chassis,
        int sleepingPlaces,
        string region,
        string notes,
        string sourceUrl,
        bool isFavorite)
    {
        UpdateDetails(brand, model, year, askingPrice, mileageKm, lengthMeters, transmission, engine, chassis, sleepingPlaces, region, notes, sourceUrl, isFavorite);
    }

    public decimal PricePerMeter => LengthMeters <= 0 ? 0 : decimal.Round(AskingPrice / LengthMeters, 2);

    public void UpdateDetails(
        string brand,
        string model,
        int year,
        decimal askingPrice,
        int mileageKm,
        decimal lengthMeters,
        string transmission,
        string engine,
        string chassis,
        int sleepingPlaces,
        string region,
        string notes,
        string sourceUrl,
        bool isFavorite)
    {
        Brand = brand.Trim();
        Model = model.Trim();
        Year = year;
        AskingPrice = askingPrice;
        MileageKm = mileageKm;
        LengthMeters = lengthMeters;
        Transmission = transmission.Trim();
        Engine = engine.Trim();
        Chassis = chassis.Trim();
        SleepingPlaces = sleepingPlaces;
        Region = region.Trim();
        Notes = notes.Trim();
        SourceUrl = sourceUrl.Trim();
        IsFavorite = isFavorite;
        MarkUpdated();
    }

    public void ReplaceTags(IEnumerable<string> names)
    {
        _tags.Clear();

        foreach (var name in names.Select(name => name.Trim()).Where(name => name.Length > 0).Distinct(StringComparer.OrdinalIgnoreCase))
        {
            _tags.Add(new Tag(name));
        }

        MarkUpdated();
    }
}
