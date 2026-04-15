param(
  [string]$TaskName = 'MIMI-DB-FastAPI',
  [int]$DelaySeconds = 30,
  [switch]$RunNow
)

$ErrorActionPreference = 'Stop'

$currentIdentity = [Security.Principal.WindowsIdentity]::GetCurrent()
$principalCheck = New-Object Security.Principal.WindowsPrincipal($currentIdentity)
$isAdmin = $principalCheck.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
  $args = @(
    '-NoProfile'
    '-ExecutionPolicy', 'Bypass'
    '-File', ('"{0}"' -f $PSCommandPath)
    '-TaskName', ('"{0}"' -f $TaskName)
    '-DelaySeconds', $DelaySeconds
  )
  if ($RunNow) {
    $args += '-RunNow'
  }

  Write-Host 'Requesting Administrator permission to repair Task Scheduler entry...'
  Start-Process powershell.exe -Verb RunAs -ArgumentList ($args -join ' ')
  exit 0
}

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$startupScript = Join-Path $scriptRoot 'start-backend.ps1'

if (-not (Test-Path $startupScript)) {
  throw "Startup script not found: $startupScript"
}

$delay = [TimeSpan]::FromSeconds($DelaySeconds)
$delayIso = "PT$([int]$delay.TotalSeconds)S"

$action = New-ScheduledTaskAction `
  -Execute 'powershell.exe' `
  -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$startupScript`"" `
  -WorkingDirectory $scriptRoot

$trigger = New-ScheduledTaskTrigger -AtStartup
$trigger.Delay = $delayIso

$principal = New-ScheduledTaskPrincipal `
  -UserId 'SYSTEM' `
  -LogonType ServiceAccount `
  -RunLevel Highest

$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -ExecutionTimeLimit (New-TimeSpan -Hours 0) `
  -RestartCount 999 `
  -RestartInterval (New-TimeSpan -Minutes 1) `
  -StartWhenAvailable

$task = New-ScheduledTask `
  -Action $action `
  -Trigger $trigger `
  -Principal $principal `
  -Settings $settings `
  -Description 'Start MIMI DB FastAPI backend at system boot.'

$existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($null -ne $existing) {
  Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction Stop
}

Register-ScheduledTask -TaskName $TaskName -InputObject $task -ErrorAction Stop | Out-Null

Write-Host "Scheduled task '$TaskName' created or updated."
Write-Host "Action: powershell.exe -NoProfile -ExecutionPolicy Bypass -File $startupScript"
Write-Host "Trigger: At startup, delay ${DelaySeconds}s"
Write-Host 'RunAs: SYSTEM (highest privileges)'

if ($RunNow) {
  Start-ScheduledTask -TaskName $TaskName -ErrorAction Stop
  Write-Host "Task '$TaskName' started."
}
