<#
.SYNOPSIS
  Registers (or removes) a daily Windows Scheduled Task that runs the Flight Monitor.
.DESCRIPTION
  Reads schedule.time (HH:mm, 24-hour) from flight-monitor/config.json. No secrets are stored in
  the task: SERPAPI_API_KEY is read from the repo-root .env file by run_monitor.py.
.EXAMPLE
  powershell -ExecutionPolicy Bypass -File flight-monitor/register_task.ps1
  powershell -ExecutionPolicy Bypass -File flight-monitor/register_task.ps1 -WhatIf
  powershell -ExecutionPolicy Bypass -File flight-monitor/register_task.ps1 -Unregister
#>
[CmdletBinding(SupportsShouldProcess = $true)]
param(
  [switch]$Unregister,
  [string]$TaskName = 'VietnamFlightMonitor'
)

$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$repo = Split-Path -Parent $here
$configPath = Join-Path $here 'config.json'
$runner = Join-Path $here 'run_monitor.py'

if ($Unregister) {
  if ($PSCmdlet.ShouldProcess($TaskName, 'Unregister scheduled task')) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Host "Removed scheduled task '$TaskName'."
  }
  return
}

$config = Get-Content -Raw -Path $configPath | ConvertFrom-Json
$time = [string]$config.schedule.time
if ($time -notmatch '^([01]\d|2[0-3]):[0-5]\d$') {
  throw "schedule.time in config.json must be HH:mm (24-hour), got '$time'."
}

$python = (Get-Command python -ErrorAction Stop).Source
$runAt = [datetime]::ParseExact($time, 'HH:mm', [Globalization.CultureInfo]::InvariantCulture)

Write-Host "Task name : $TaskName"
Write-Host "Runs daily: $time (local time, from flight-monitor/config.json)"
Write-Host "Command   : `"$python`" `"$runner`""
Write-Host "Start in  : $repo"

if ($PSCmdlet.ShouldProcess($TaskName, "Register daily task at $time")) {
  $action = New-ScheduledTaskAction -Execute $python -Argument "`"$runner`"" -WorkingDirectory $repo
  $trigger = New-ScheduledTaskTrigger -Daily -At $runAt
  $settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 30)
  Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings `
    -Description 'Daily Vietnam trip Flight Monitor refresh' -Force | Out-Null
  Write-Host "Registered. Re-run this script after changing schedule.time."
}
