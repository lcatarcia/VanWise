using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using VanWise.Application.Abstractions;
using VanWise.Persistence.Repositories;

namespace VanWise.Persistence;

public static class DependencyInjection
{
    public static IServiceCollection AddPersistence(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("VanWise");

        services.AddDbContext<VanWiseDbContext>(options =>
            options.UseSqlServer(connectionString, sql => sql.MigrationsAssembly(typeof(VanWiseDbContext).Assembly.FullName)));

        services.AddScoped<ICamperRepository, CamperRepository>();
        services.AddScoped<IVisitChecklistRepository, VisitChecklistRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        return services;
    }
}
