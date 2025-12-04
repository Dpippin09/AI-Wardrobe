@echo off
echo AI Wardrobe - Quick Start Guide
echo ================================
echo.

echo This system requires:
echo 1. Python 3.8 or higher
echo 2. Node.js 14 or higher
echo 3. Chrome browser (for web scraping)
echo.

echo Current setup status:
echo.

REM Check Python
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Python is installed
    python --version
) else (
    echo ✗ Python not found
    echo   Please install Python from https://python.org
    echo   Make sure to add Python to PATH during installation
)

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Node.js is installed
    node --version
) else (
    echo ✗ Node.js not found
    echo   Please install Node.js from https://nodejs.org
)

echo.
echo To set up the project:
echo 1. Backend setup:
echo    cd backend
echo    python -m venv venv
echo    venv\Scripts\activate
echo    pip install -r requirements.txt
echo    python app.py
echo.
echo 2. Frontend setup (in new terminal):
echo    cd frontend
echo    npm install
echo    npm start
echo.

pause
