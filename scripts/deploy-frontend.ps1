param(
    [string]$ResourceGroupName = "rg-vanwise-dev",
    [string]$StaticWebAppName = "stapp-vanwise-dev-web"
)

$ErrorActionPreference = "Stop"

$repoRoot = Join-Path $PSScriptRoot ".."
$frontendRoot = Join-Path $repoRoot "frontend"

Set-Location -Path $frontendRoot
npm ci
npm run build

$deploymentToken = az staticwebapp secrets list `
    --resource-group $ResourceGroupName `
    --name $StaticWebAppName `
    --query "properties.apiKey" `
    --output tsv

npx -y @azure/static-web-apps-cli deploy ".\dist" `
    --deployment-token $deploymentToken `
    --env production
