@echo off
title InFocus Movie App - Starting...
echo.
echo ========================================
echo    InFocus Movie App - Development
echo ========================================
echo.
echo Starting Next.js development server...
echo.
echo App will be available at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    npm install --legacy-peer-deps
    echo.
)

REM Start the development server
echo Starting server...
npm run dev

pause
