@echo off
echo Starting Dei Frati Restaurant servers...

echo Starting backend server...
start cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak > nul

echo Starting frontend server...
start cmd /k "cd frontend && npm run dev"

echo Servers started!
echo Frontend: http://localhost:8080
echo Backend:  http://localhost:5000
echo Admin:    http://localhost:8080/admin
echo.
echo Close the command windows to stop the servers
pause