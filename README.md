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
