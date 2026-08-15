[CmdletBinding()]
param (
    [switch]$Detach = $false,
    [switch]$NoCache = $false
)

$ErrorActionPreference = 'Stop'

# Ensure the script runs relative to where dockerbuild.ps1 is located
Set-Location -Path $PSScriptRoot

$composeFile = Join-Path -Path $PSScriptRoot -ChildPath "server\docker-compose.yml"

# Verify the docker-compose file exists
if (-not (Test-Path -Path $composeFile)) {
    Write-Error "Could not find compose file at: $composeFile"
    exit 1
}

# Check if Docker CLI is installed
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Docker CLI is not found in PATH. Please install Docker."
    exit 1
}

Write-Host "Checking Docker daemon status..." -ForegroundColor Cyan
docker info > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "Docker daemon is not running. Please start Docker Desktop/Daemon first."
    exit 1
}

# Construct arguments pointing directly to the server folder's compose file
$composeArgs = @("compose", "-f", $composeFile, "up", "--build")

if ($Detach) {
    $composeArgs += "-d"
}

if ($NoCache) {
    $composeArgs += "--force-recreate"
    Write-Host "Forcing container recreation..." -ForegroundColor Yellow
}

Write-Host "Executing: docker $($composeArgs -join ' ')" -ForegroundColor Green

# Run Docker Compose
& docker $composeArgs

if ($LASTEXITCODE -ne 0) {
    Write-Error "Docker Compose failed with exit code $LASTEXITCODE."
    exit $LASTEXITCODE
}