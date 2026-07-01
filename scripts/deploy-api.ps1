param(
    [string]$ResourceGroupName = "rg-vanwise-dev",
    [string]$ApiAppName = "app-vanwise-dev-api",
    [string]$Configuration = "Release"
)

$ErrorActionPreference = "Stop"

$repoRoot = Join-Path $PSScriptRoot ".."
$publishDir = Join-Path $repoRoot "artifacts\api-publish"
$zipPath = Join-Path $repoRoot "artifacts\vanwise-api.zip"

Set-Location -Path $repoRoot

if (Test-Path $publishDir) {
    Remove-Item $publishDir -Recurse -Force
}

dotnet publish "src\VanWise.Api\VanWise.Api.csproj" --configuration $Configuration --output $publishDir

if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

Compress-Archive -Path (Join-Path $publishDir "*") -DestinationPath $zipPath

az webapp deploy `
    --resource-group $ResourceGroupName `
    --name $ApiAppName `
    --src-path $zipPath `
    --type zip
