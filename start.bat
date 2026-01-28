@echo off
title POS System - Fast Food Shop
echo ========================================
echo    POS System - Fast Food Shop
echo ========================================
echo.

echo Starting Backend Server...
cd backend
start "POS Backend" cmd /k "python app.py"

echo.
echo Starting Frontend...
cd ../frontend
start "POS Frontend" cmd /k "npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit this window...
pause >nul
