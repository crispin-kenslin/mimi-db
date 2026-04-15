$ErrorActionPreference = 'Stop'

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptRoot

$pythonExe = Join-Path $scriptRoot 'venv\Scripts\python.exe'
if (-not (Test-Path $pythonExe)) {
  throw 'Python virtual environment not found at backend\venv\Scripts\python.exe'
}

$logDir = Join-Path $scriptRoot 'logs'
if (-not (Test-Path $logDir)) {
  New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}
$logFile = Join-Path $logDir 'backend-startup.log'

Add-Content -Path $logFile -Value "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Starting backend via start-backend.ps1"

# Uvicorn can write normal runtime logs to stderr; keep running and log all streams.
$ErrorActionPreference = 'Continue'
& $pythonExe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 *>> $logFile

$exitCode = $LASTEXITCODE
Add-Content -Path $logFile -Value "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Backend process exited with code $exitCode"
if ($exitCode -ne 0) {
  exit $exitCode
}
