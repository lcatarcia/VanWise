# VanWise

VanWise is a .NET 10 + React application for comparing campers, tracking financing options, checklists, dashboard metrics, scoring and attachments.

## Local development

```powershell
dotnet build VanWise.slnx
dotnet test VanWise.slnx

cd frontend
npm ci
npm run dev
```

## Low-cost Azure MVP

The repository includes a low-cost Azure deployment path without Key Vault or Managed Identity for the initial personal MVP.

Resources created by `infra\main.bicep`:

- Azure App Service for the .NET API
- Azure Static Web Apps Free for the React frontend
- Azure SQL Database Basic
- optional Blob Storage for future images/documents
- optional Application Insights

Create infrastructure:

```powershell
.\scripts\deploy-infra.ps1 -SqlAdminPassword (Read-Host "SQL password" -AsSecureString)
```

Apply EF Core migrations:

```powershell
.\scripts\apply-database.ps1
```

Deploy API:

```powershell
.\scripts\deploy-api.ps1
```

Deploy frontend:

```powershell
.\scripts\deploy-frontend.ps1
```

Keep `createStorage` and `createApplicationInsights` set to `false` in `infra\parameters.dev.json` until those features are needed.

## GitHub Actions deployment

The repository also supports low-cost deployment through GitHub Actions using Azure publish profiles and tokens.

Create these repository secrets in GitHub:

| Secret | Where to get it | Used by |
| --- | --- | --- |
| `AZURE_API_PUBLISH_PROFILE` | Azure Portal > App Service `app-vanwise-dev-api` > Get publish profile | `.github/workflows/deploy-api.yml` |
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | Azure Portal > Static Web App `stapp-vanwise-dev-web` > Manage deployment token | `.github/workflows/deploy-frontend.yml` |
| `AZURE_SQL_CONNECTION_STRING` | Azure SQL connection string for the `sqldb-vanwise-dev` database | `.github/workflows/migrate-database.yml` |

Deployment behavior:

- API deploys automatically on pushes to `main` that change backend files.
- Frontend deploys automatically on pushes to `main` that change frontend files.
- Database migrations are manual: run the **Migrate Database** workflow from the GitHub Actions tab when schema changes are ready.
