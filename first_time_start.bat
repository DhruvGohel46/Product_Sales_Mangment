@echo off
title POS System - First Time Setup
echo ========================================
echo    POS System - First Time Setup
echo ========================================
echo.

echo Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://python.org
    pause
    exit /b 1
)

echo Python found!
echo.

echo Installing Backend Dependencies...
cd backend
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)

echo Backend dependencies installed successfully!
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo Node.js found!
echo.

echo Installing Frontend Dependencies...
cd ../frontend
npm install
if errorlevel 1 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)

echo Frontend dependencies installed successfully!
echo.

echo ========================================
echo    Setup Complete!
echo ========================================
echo.
echo You can now run 'start.bat' to launch the POS system
echo.
echo Press any key to exit...
pause >nul
