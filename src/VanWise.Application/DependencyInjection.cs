using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using VanWise.Application.Campers;
using VanWise.Application.Campers.Validation;

namespace VanWise.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<ICamperService, CamperService>();
        services.AddScoped<IDashboardService, DashboardService>();
        services.AddScoped<IValidator<CreateCamperRequest>, CreateCamperRequestValidator>();
        services.AddScoped<IValidator<UpdateCamperRequest>, UpdateCamperRequestValidator>();

        return services;
    }
}
