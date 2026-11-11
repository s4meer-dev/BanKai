# BAN KAI - Dual-Process Platform Launcher (PowerShell)
# Launches both FastAPI Backend and Next.js Frontend concurrently

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "                 BAN KAI - STARTUP LAUNCHER" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

$backendDir = Join-Path $PSScriptRoot "backend"
$frontendDir = Join-Path $PSScriptRoot "frontend"
$pythonExe = Join-Path $backendDir ".venv\Scripts\python.exe"

if (-Not (Test-Path $pythonExe)) {
    $pythonExe = "python"
}

Write-Host "[*] Starting FastAPI Backend on http://localhost:8000 ..." -ForegroundColor Green
$backendProcess = Start-Process -FilePath $pythonExe -ArgumentList "-m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload" -WorkingDirectory $backendDir -PassThru

Write-Host "[*] Starting Next.js 15 Frontend on http://localhost:3000 ..." -ForegroundColor Green
$npmCmd = "npm.cmd"
if (-Not (Get-Command "npm.cmd" -ErrorAction SilentlyContinue)) {
    $npmCmd = "npm"
}
$frontendProcess = Start-Process -FilePath $npmCmd -ArgumentList "run dev -- -p 3000" -WorkingDirectory $frontendDir -PassThru

Write-Host "`n[+] BAN KAI Platform is running!" -ForegroundColor Cyan
Write-Host "    - Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host "    - API Docs:  http://localhost:8000/docs" -ForegroundColor White
Write-Host "    - EAL Graph: http://localhost:3000/eal" -ForegroundColor White
Write-Host "`nPress Ctrl+C or close the terminal windows to terminate." -ForegroundColor Yellow

