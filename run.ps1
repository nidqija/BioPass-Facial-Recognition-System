param (
    [switch]$Stop
)

$ErrorActionPreference = "Stop"
$projectRoot = $PSScriptRoot

# Unique window titles for targeted shutdown
$frontendTitle = "App_Frontend_Vite"
$backendTitle  = "App_Backend_FastAPI"

if ($Stop) {
    Write-Host "`n==========================================" -ForegroundColor Red
    Write-Host " STOPPING ALL RUNTIME SERVICES & WINDOWS" -ForegroundColor Red
    Write-Host "==========================================`n" -ForegroundColor Red

    # 1. Stop Docker containers (preserves state, no deletion)
    Write-Host "[1/4] Halting Docker containers..." -ForegroundColor Yellow
    Set-Location "$projectRoot\server"
    docker compose stop

    # 2. Release port 5173 and close Frontend terminal window
    Write-Host "[2/4] Terminating Frontend on port 5173 & closing window..." -ForegroundColor Yellow
    $frontendConns = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
    if ($frontendConns) {
        $frontendConns | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object {
            Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
        }
    }
    Get-Process powershell, pwsh -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like "*$frontendTitle*" } | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "Frontend stopped and window closed." -ForegroundColor Green

    # 3. Release port 8000 and close Backend terminal window
    Write-Host "[3/4] Terminating Backend on port 8000 & closing window..." -ForegroundColor Yellow
    $backendConns = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
    if ($backendConns) {
        $backendConns | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object {
            Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
        }
    }
    Get-Process powershell, pwsh -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like "*$backendTitle*" } | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "Backend stopped and window closed." -ForegroundColor Green

    Write-Host "`n==========================================" -ForegroundColor Green
    Write-Host " All runtime services and open windows closed." -ForegroundColor Green
    Write-Host "==========================================`n" -ForegroundColor Green

    Set-Location $projectRoot
    exit 0
}

# --- STARTUP LOGIC ---

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host " 1. STARTING DOCKER CONTAINERS" -ForegroundColor Cyan
Write-Host "==========================================`n" -ForegroundColor Cyan

Set-Location "$projectRoot\server"
docker compose up -d

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host " 2. STARTING REACT FRONTEND" -ForegroundColor Cyan
Write-Host "==========================================`n" -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$Host.UI.RawUI.WindowTitle = '$frontendTitle'; cd '$projectRoot\client'; npm run dev"

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host " 3. ACTIVATING VENV & STARTING FASTAPI" -ForegroundColor Cyan
Write-Host "==========================================`n" -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$Host.UI.RawUI.WindowTitle = '$backendTitle'; cd '$projectRoot\server'; .\.venv\Scripts\Activate.ps1; uvicorn main:app --reload"

Write-Host "`n==========================================" -ForegroundColor Green
Write-Host " All services are launching!" -ForegroundColor Green
Write-Host " Docker:   Running in background" -ForegroundColor Yellow
Write-Host " Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host " Backend:  http://127.0.0.1:8000" -ForegroundColor Yellow
Write-Host "==========================================`n" -ForegroundColor Green

Set-Location $projectRoot