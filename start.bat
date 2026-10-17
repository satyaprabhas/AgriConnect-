@echo off
title AgriConnect Server
set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%"
cd /d "%~dp0"
echo ==========================================
echo Starting AgriConnect (Backend + Frontend)
echo ==========================================
npm run dev
pause
