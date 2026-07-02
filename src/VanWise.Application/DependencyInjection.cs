using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using VanWise.Application.Campers;
using VanWise.Application.Campers.Validation;
using VanWise.Application.Visits;
using VanWise.Application.Visits.Validation;

namespace VanWise.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<ICamperService, CamperService>();
        services.AddScoped<IDashboardService, DashboardService>();
        services.AddScoped<IVisitChecklistService, VisitChecklistService>();
        services.AddScoped<IValidator<CreateCamperRequest>, CreateCamperRequestValidator>();
        services.AddScoped<IValidator<UpdateCamperRequest>, UpdateCamperRequestValidator>();
        services.AddScoped<IValidator<UpsertVisitChecklistRequest>, UpsertVisitChecklistRequestValidator>();

        return services;
    }
}
