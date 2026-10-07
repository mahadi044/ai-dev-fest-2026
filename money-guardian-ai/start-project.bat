@echo off
title Money Guardian AI - Launcher

echo ==========================================
echo       MONEY GUARDIAN AI
echo       Project Launcher
echo ==========================================
echo.

cd /d "D:\AI Programming\ai-dev-fest-2026\money-guardian-ai"

echo Starting Backend...
start "Money Guardian AI - Backend" cmd /k "cd /d D:\AI Programming\ai-dev-fest-2026\money-guardian-ai\backend && python -m uvicorn app.main:app --reload --port 8001"

timeout /t 3 /nobreak >nul

echo Starting Frontend...
start "Money Guardian AI - Frontend" cmd /k "cd /d D:\AI Programming\ai-dev-fest-2026\money-guardian-ai\frontend-vite && npm run dev"

echo.
echo ==========================================
echo Backend  : http://127.0.0.1:8001
echo Frontend : http://localhost:5173
echo ==========================================
echo.

timeout /t 5 /nobreak >nul

start http://localhost:5173

exit