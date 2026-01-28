@echo off
title POS System - First Time Setup
color 0A

echo ========================================
echo    POS System - First Time Setup
echo ========================================
echo.

echo [1/5] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Python is not installed or not in PATH
    echo    Please install Python 3.8+ from https://python.org
    echo    Make sure to check "Add Python to PATH" during installation
    pause
    exit /b 1
)
for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
echo ✅ Python %PYTHON_VERSION% found!
echo.

echo [2/5] Installing Backend Dependencies...
cd backend
echo    Installing Flask and Flask-CORS...
pip install -r requirements.txt
if errorlevel 1 (
    echo ❌ ERROR: Failed to install backend dependencies
    echo    Try running: pip install --upgrade pip
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed successfully!
echo.

echo [3/5] Initializing Database...
echo    Creating SQLite database and migrating data...
python init_db.py
if errorlevel 1 (
    echo ⚠️  Warning: Database initialization had issues
    echo    You can still continue, but may need to add products manually
)
echo ✅ Database initialized!
echo.

echo [4/5] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Node.js is not installed or not in PATH
    echo    Please install Node.js from https://nodejs.org
    echo    Download the LTS version recommended for most users
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js %NODE_VERSION% found!
echo.

echo [5/5] Installing Frontend Dependencies...
cd ../frontend
echo    Installing React, Axios, and other dependencies...
npm install
if errorlevel 1 (
    echo ❌ ERROR: Failed to install frontend dependencies
    echo    Try running: npm cache clean --force
    pause
    exit /b 1
)
echo ✅ Frontend dependencies installed successfully!
echo.

echo ========================================
echo    🎉 Setup Complete!
echo ========================================
echo.
echo 📋 What's been installed:
echo    • Python backend with SQLite database
echo    • React frontend with modern UI
echo    • All required dependencies
echo.
echo 🚀 To start the POS system:
echo    1. Run 'start.bat' in this folder
echo    2. Or manually:
echo       - Backend: cd backend && python app.py
echo       - Frontend: cd frontend && npm start
echo.
echo 🌐 The application will open at:
echo    • Frontend: http://localhost:3000
echo    • Backend API: http://localhost:5000
echo.
echo 💡 First time tips:
echo    • Add some products using the Product Management page
echo    • Test the billing system with sample products
echo    • Check the reports for sales analytics
echo.
echo Press any key to exit...
pause >nul
