@echo off
set SCRIPT=LocalServer.ps1
set PORT=8080

echo Starting PowerShell HTTP server on port %PORT%...
powershell -ExecutionPolicy Bypass -File "%SCRIPT%" -Port %PORT%
pause