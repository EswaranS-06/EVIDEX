@echo off
echo ========================================
echo Starting EVIDEX Application
echo ========================================

set SILENT=0
if "%1"=="-s" set SILENT=1

echo.
echo [1/2] Starting Django Backend...
cd "%~dp0backend"
if %SILENT%==1 (
    start /B "EVIDEX Backend" cmd /c "uv run python manage.py runserver >nul 2>&1"
) else (
    start "EVIDEX Backend" cmd /k "uv run python manage.py runserver"
)

echo.
echo [2/2] Starting React Frontend...
cd "%~dp0frontend"
if %SILENT%==1 (
    start /B "EVIDEX Frontend" cmd /c "npm run dev >nul 2>&1"
) else (
    start "EVIDEX Frontend" cmd /k "npm run dev"
)

echo.
echo ========================================
if %SILENT%==1 (
    echo Servers are starting in the background.
) else (
    echo Servers are starting in separate windows.
)
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173 (default)
echo ========================================

echo Waiting 5 seconds for front-end server to initialize before opening browser...
timeout /t 5 /nobreak >nul
start http://localhost:5173

echo.
if %SILENT%==1 (
    echo App is running in the background. Close this window to keep it running.
    echo To stop the servers later, you will need to forcefully terminate the node and python processes.
) else (
    echo You can close this window now.
)
pause
