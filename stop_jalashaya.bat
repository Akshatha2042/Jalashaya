@echo off
title JALASHAYA — Server Stopper
echo =====================================================================
echo           JALASHAYA — Stopping Background Servers
echo =====================================================================
echo.

powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 8000, 5173 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }; Write-Host 'All JALASHAYA server processes on ports 8000 and 5173 stopped successfully.'"

echo.
echo =====================================================================
echo  Both Frontend and Backend servers have been stopped.
echo =====================================================================
echo.
pause
