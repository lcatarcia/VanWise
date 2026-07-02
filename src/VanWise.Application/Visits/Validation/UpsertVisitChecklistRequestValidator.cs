using FluentValidation;

namespace VanWise.Application.Visits.Validation;

public sealed class UpsertVisitChecklistRequestValidator : AbstractValidator<UpsertVisitChecklistRequest>
{
    private static readonly string[] AllowedCategories = ["Esterno", "Interno", "Impianti", "Meccanica"];

    public UpsertVisitChecklistRequestValidator()
    {
        RuleFor(request => request.Items)
            .Cascade(CascadeMode.Stop)
            .NotNull()
            .Must(items => items is not null && items.Count is >= 1 and <= 100)
            .WithMessage("A checklist must contain between 1 and 100 items.");

        RuleForEach(request => request.Items).SetValidator(new UpsertChecklistItemRequestValidator());

        RuleFor(request => request.Items)
            .Must(items => items is null || items.Where(item => item.Id is not null).Select(item => item.Id).Distinct().Count() == items.Count(item => item.Id is not null))
            .WithMessage("Checklist item ids must be unique.");
    }

    public static bool IsKnownCategory(string? category)
    {
        return AllowedCategories.Contains(category?.Trim(), StringComparer.Ordinal);
    }
}

public sealed class UpsertChecklistItemRequestValidator : AbstractValidator<UpsertChecklistItemRequest>
{
    public UpsertChecklistItemRequestValidator()
    {
        RuleFor(item => item.Category)
            .NotEmpty()
            .MaximumLength(80)
            .Must(UpsertVisitChecklistRequestValidator.IsKnownCategory)
            .WithMessage("Checklist item category must be Esterno, Interno, Impianti or Meccanica.");
        RuleFor(item => item.Description).NotEmpty().MaximumLength(500);
        RuleFor(item => item.Notes).MaximumLength(1000);
        RuleFor(item => item.Status)
            .Must(ChecklistStatusMapper.IsKnown)
            .WithMessage("Checklist item status must be ok, toVerify or problem.");
    }
}
