using System.Net;
using Microsoft.Extensions.DependencyInjection;
using VanWise.Application.Campers;
using VanWise.Infrastructure.Campers;
using VanWise.Shared.Clock;

namespace VanWise.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddSingleton<ISystemClock, SystemClock>();
        services.AddHttpClient<ICamperListingParser, CamperListingParser>(client =>
        {
            client.Timeout = TimeSpan.FromSeconds(12);
            client.DefaultRequestHeaders.UserAgent.ParseAdd("VanWise/1.0 camper-parser");
        })
        .ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler
        {
            AllowAutoRedirect = false,
            AutomaticDecompression = DecompressionMethods.All
        });

        return services;
    }
}
