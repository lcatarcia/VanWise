using VanWise.Domain.Common;

namespace VanWise.Domain.Financing;

public sealed class FinancingOffer : Entity
{
    public Guid CamperId { get; private set; }
    public FinancingType Type { get; private set; }
    public decimal DownPayment { get; private set; }
    public decimal TanPercent { get; private set; }
    public decimal TaegPercent { get; private set; }
    public decimal MonthlyPayment { get; private set; }
    public decimal TotalCost { get; private set; }

    private FinancingOffer()
    {
    }

    public FinancingOffer(Guid camperId, FinancingType type, decimal downPayment, decimal tanPercent, decimal taegPercent, decimal monthlyPayment, decimal totalCost)
    {
        CamperId = camperId;
        Type = type;
        DownPayment = downPayment;
        TanPercent = tanPercent;
        TaegPercent = taegPercent;
        MonthlyPayment = monthlyPayment;
        TotalCost = totalCost;
    }
}
