@echo off
cd /d "%~dp0"
echo Iniciando o site local...
start "" powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Sleep -Seconds 2; Start-Process 'http://localhost:4173'"
npm run dev
pause
