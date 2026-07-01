using Microsoft.Extensions.DependencyInjection;
using VanWise.Shared.Clock;

namespace VanWise.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddSingleton<ISystemClock, SystemClock>();
        return services;
    }
}
