param(
    [string]$ResourceGroupName = "rg-vanwise-dev",
    [string]$ApiAppName = "app-vanwise-dev-api",
    [string]$Configuration = "Release"
)

$ErrorActionPreference = "Stop"

$repoRoot = Join-Path $PSScriptRoot ".."
$artifactsDir = Join-Path $repoRoot "artifacts"
$publishDir = Join-Path $artifactsDir ("api-publish-" + [Guid]::NewGuid().ToString("N"))
$zipPath = Join-Path $repoRoot "artifacts\vanwise-api.zip"

Set-Location -Path $repoRoot

if (-not (Test-Path $artifactsDir)) {
    New-Item -ItemType Directory -Path $artifactsDir | Out-Null
}

dotnet publish "src\VanWise.Api\VanWise.Api.csproj" --configuration $Configuration --output $publishDir

if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

for ($attempt = 1; $attempt -le 5; $attempt++) {
    try {
        Compress-Archive -Path (Join-Path $publishDir "*") -DestinationPath $zipPath -Force
        break
    }
    catch {
        if ($attempt -eq 5) {
            throw
        }

        Start-Sleep -Seconds 2
    }
}

az webapp deploy `
    --resource-group $ResourceGroupName `
    --name $ApiAppName `
    --src-path $zipPath `
    --type zip

Remove-Item $publishDir -Recurse -Force
