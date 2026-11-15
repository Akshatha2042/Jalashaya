@echo off
title JALASHAYA — Launcher
setlocal EnableDelayedExpansion

echo =====================================================================
echo           JALASHAYA — Bengaluru Water Body Digital Twin
echo               Full-Stack Launch Controller
echo =====================================================================
echo.

cd /d "%~dp0"

:: 1. Verify Backend Python Environment
if exist "backend\venv\Scripts\python.exe" (
    set "PYTHON_EXE=backend\venv\Scripts\python.exe"
) else (
    set "PYTHON_EXE=python"
)

:: 2. Launch FastAPI Backend in a dedicated terminal window
echo [1/3] Starting FastAPI Backend on http://localhost:8000 ...
start "JALASHAYA Backend (FastAPI :8000)" cmd /k "cd /d "%~dp0" && set PYTHONPATH=%~dp0&& "!PYTHON_EXE!" -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000"

:: 3. Launch Vite Frontend in a dedicated terminal window
echo [2/3] Starting Vite Frontend on http://localhost:5173 ...
start "JALASHAYA Frontend (Vite :5173)" cmd /k "cd /d "%~dp0frontend" && npm run dev -- --host"

:: 4. Wait for servers to initialize
echo [3/3] Waiting for servers to initialize...
powershell -NoProfile -Command "Start-Sleep -Seconds 3"

:: 5. Open browser automatically
echo.
echo Launching JALASHAYA in your default browser...
start http://localhost:5173

echo.
echo =====================================================================
echo  SUCCESS: JALASHAYA is now running!
echo.
echo  - Frontend: http://localhost:5173
echo  - Backend:  http://localhost:8000
echo  - API Docs: http://localhost:8000/docs
echo.
echo  To stop the application:
echo    Close the two opened terminal windows (Backend and Frontend),
echo    or double-click stop_jalashaya.bat.
echo =====================================================================
echo.
pause
