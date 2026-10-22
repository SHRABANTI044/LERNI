@echo off
cd /d "%~dp0"
echo Starting Emotion-Aware Study Assistant Backend...
start "LERNI Backend" cmd /k "cd /d ""%~dp0backend"" && node server.js"

echo Starting Emotion-Aware Study Assistant Frontend...
start "LERNI Frontend" cmd /k "cd /d ""%~dp0"" && npm start"

echo Both servers are launching!
