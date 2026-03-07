@echo off
echo Starting InfoBill SaaS Website...

:: Start Backend
start "InfoBill Web Backend" cmd /k "cd rebill-web/backend && python app.py"

:: Start Frontend
start "InfoBill Web Frontend" cmd /k "cd rebill-web/frontend && npm start"

echo InfoBill Website started!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
pause
