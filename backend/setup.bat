@echo off

echo Setting up AI Wardrobe Backend...

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python is not installed. Please install Python 3.8+ first.
    exit /b 1
)

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate

REM Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip

REM Install requirements
echo Installing Python dependencies...
pip install -r requirements.txt

REM Create uploads directory
if not exist "..\uploads" mkdir "..\uploads"

REM Copy environment file if it doesn't exist
if not exist ".env" (
    echo Creating .env file from example...
    copy .env.example .env
    echo Please edit .env file with your API keys before running the application.
)

echo Backend setup complete!
echo.
echo To start the backend server:
echo 1. Activate the virtual environment:
echo    venv\Scripts\activate
echo 2. Run the server:
echo    python app.py

pause
