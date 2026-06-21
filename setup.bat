@echo off
echo.
echo ====================================
echo   NEXUS REVIVE - SETUP WIZARD
echo ====================================
echo.
echo This will:
echo   1. Install dependencies
echo   2. Setup database
echo   3. Seed 100K reviews (4.6 star avg)
echo   4. Push to GitHub
echo.
echo Repository: https://github.com/jayaraman2212066/NEXUS-REVIVE
echo.
pause

PowerShell -ExecutionPolicy Bypass -File "%~dp0setup.ps1"

pause
