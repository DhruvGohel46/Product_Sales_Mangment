@echo off
echo Starting ReBill SaaS Website...

:: Start Backend
start "ReBill Web Backend" cmd /k "cd rebill-web/backend && python app.py"

:: Start Frontend
start "ReBill Web Frontend" cmd /k "cd rebill-web/frontend && npm start"

echo ReBill Website started!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
pause
