param(
    [string]$ResourceGroupName = "rg-vanwise-dev",
    [string]$ApiAppName = "app-vanwise-dev-api"
)

$ErrorActionPreference = "Stop"

$repoRoot = Join-Path $PSScriptRoot ".."
Set-Location -Path $repoRoot

$connectionString = az webapp config appsettings list `
    --resource-group $ResourceGroupName `
    --name $ApiAppName `
    --query "[?name=='ConnectionStrings__VanWise'].value | [0]" `
    --output tsv

if (-not $connectionString) {
    throw "ConnectionStrings__VanWise was not found on App Service '$ApiAppName'."
}

dotnet ef database update `
    --project "src\VanWise.Persistence\VanWise.Persistence.csproj" `
    --startup-project "src\VanWise.Api\VanWise.Api.csproj" `
    --connection $connectionString
