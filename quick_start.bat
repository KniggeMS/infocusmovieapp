@echo off
title InFocus Movie App - Quick Start
echo.
echo ========================================
echo     InFocus Movie App - Quick Start
echo ========================================
echo.
echo [1] Start App (with npm install if needed)
echo [2] Start App (skip npm install)
echo [3] Install dependencies only
echo [4] Exit
echo.
echo ========================================
echo.
set /p choice="Choose an option (1-4): "

if "%choice%"=="1" goto install_and_start
if "%choice%"=="2" goto start_only
if "%choice%"=="3" goto install_only
if "%choice%"=="4" goto exit

:install_and_start
echo.
echo Installing dependencies (if needed)...
if not exist "node_modules" (
    npm install --legacy-peer-deps
)
echo.
echo Starting server...
npm run dev
goto end

:start_only
echo.
echo Starting server...
npm run dev
goto end

:install_only
echo.
echo Installing dependencies...
npm install --legacy-peer-deps
echo.
echo Dependencies installed successfully!
pause
goto end

:exit
echo.
echo Goodbye!
exit

:end
pause
