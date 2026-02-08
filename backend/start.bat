@echo off
echo Starting Claims AI Dashboard Backend...

REM Check if Python is installed
python --version > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Python could not be found. Please install Python 3.
    exit /b 1
)

REM Navigate to backend directory
cd /d "%~dp0"

REM Create virtual environment if it doesn't exist
if not exist ".venv" (
    echo Creating virtual environment...
    python -m venv .venv
)

REM Activate virtual environment
if exist ".venv\Scripts\activate.bat" (
    echo Activating virtual environment...
    call .venv\Scripts\activate.bat
) else (
    echo Virtual environment activation script not found.
    exit /b 1
)

REM Install/upgrade dependencies
echo Installing dependencies...
pip install --upgrade pip
pip install -r requirements.txt

REM Set environment variables
set PYTHONPATH=%CD%

REM Create data directories
if not exist "data\uploads" mkdir data\uploads
if not exist "data\processed" mkdir data\processed

REM Start the FastAPI server
echo Starting FastAPI server...
echo API will be available at: http://localhost:8000
echo API docs available at: http://localhost:8000/docs

uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

REM Deactivate virtual environment when server stops
call .venv\Scripts\deactivate.bat
