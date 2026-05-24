@echo off
title DocuMind AI Launcher
echo ========================================================
echo                 DocuMind AI Launcher
echo ========================================================
echo.
echo Starting DocuMind AI Servers...
echo.

:: Launch Backend
echo [1/2] Starting FastAPI Backend on Port 8000...
start "DocuMind Backend" cmd /k "cd backend && venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000 --host 127.0.0.1"

:: Wait a brief moment
timeout /t 2 /nobreak >nul

:: Launch Frontend
echo [2/2] Starting Vite Frontend on Port 5173...
start "DocuMind Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo Servers are launching:
echo - FastAPI Swagger API Docs: http://127.0.0.1:8000/docs
echo - Vite React Frontend: http://localhost:5173
echo ========================================================
echo.
pause
