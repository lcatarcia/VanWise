param(
    [string]$SubscriptionId,
    [string]$ResourceGroupName = "rg-vanwise-dev",
    [string]$Location = "westeurope",
    [string]$SqlAdminLogin = "vanwiseadmin",
    [Parameter(Mandatory = $true)]
    [securestring]$SqlAdminPassword,
    [string]$ParametersFile = "infra\parameters.dev.json"
)

$ErrorActionPreference = "Stop"

Set-Location -Path (Join-Path $PSScriptRoot "..")

if ($SubscriptionId) {
    az account set --subscription $SubscriptionId
}

az group create --name $ResourceGroupName --location $Location | Out-Null

$plainPassword = [System.Net.NetworkCredential]::new("", $SqlAdminPassword).Password

az deployment group create `
    --resource-group $ResourceGroupName `
    --template-file "infra\main.bicep" `
    --parameters "@$ParametersFile" `
    --parameters sqlAdminLogin=$SqlAdminLogin sqlAdminPassword=$plainPassword
