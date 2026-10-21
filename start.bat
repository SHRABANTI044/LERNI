@echo off
cd /d "e:\hackathon project\My-Project"
set PORT=3001
start cmd /k "npm start"
cd /d "e:\hackathon project\My-Project\backend"
start cmd /k "node server.js"

