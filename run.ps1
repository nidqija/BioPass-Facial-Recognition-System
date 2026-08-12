# Stop script if Docker fails to start
$ErrorActionPreference = "Stop"
$projectRoot = $PSScriptRoot

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host " 1. STARTING DOCKER CONTAINERS" -ForegroundColor Cyan
Write-Host "==========================================`n" -ForegroundColor Cyan

Set-Location "$projectRoot\server"
docker compose up -d

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host " 2. STARTING REACT FRONTEND" -ForegroundColor Cyan
Write-Host "==========================================`n" -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\client'; npm run dev"

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host " 3. ACTIVATING VENV & STARTING FASTAPI" -ForegroundColor Cyan
Write-Host "==========================================`n" -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\server'; .\.venv\Scripts\Activate.ps1; uvicorn main:app --reload"

Write-Host "`n==========================================" -ForegroundColor Green
Write-Host " All services are launching!" -ForegroundColor Green
Write-Host " Docker:   Running in background" -ForegroundColor Yellow
Write-Host " Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host " Backend:  http://127.0.0.1:8000" -ForegroundColor Yellow
Write-Host "==========================================`n" -ForegroundColor Green

Set-Location $projectRoot