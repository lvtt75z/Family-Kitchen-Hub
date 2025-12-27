@echo off
REM Virtual Fridge - Start All Services
REM For Windows

echo ============================================================
echo 🥦 Starting Virtual Fridge System
echo 💰 100% FREE - No API costs!
echo ============================================================
echo.

REM Check if required commands exist
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Python not found. Please install Python 3.8-3.11
    pause
    exit /b 1
)

where java >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Java not found. Please install Java 17+
    pause
    exit /b 1
)

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js 16+
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed!
echo.

REM Start ML Service in new window
echo 1️⃣  Starting Python ML Service...
start "ML Service" cmd /c "cd ml-service && if not exist venv python -m venv venv && venv\Scripts\activate && pip install -q -r requirements.txt && python main.py"
timeout /t 5 /nobreak >nul
echo ✅ ML Service started on http://localhost:5000
echo.

REM Start Spring Boot Backend in new window
echo 2️⃣  Starting Spring Boot Backend...
start "Spring Boot Backend" cmd /c "cd backend && mvnw.cmd spring-boot:run"
timeout /t 10 /nobreak >nul
echo ✅ Backend started on http://localhost:8080
echo.

REM Start React Frontend in new window
echo 3️⃣  Starting React Frontend...
start "React Frontend" cmd /c "cd frontend && if not exist node_modules npm install && npm start"
timeout /t 5 /nobreak >nul
echo ✅ Frontend started on http://localhost:3000
echo.

echo ============================================================
echo 🎉 All services started successfully!
echo ============================================================
echo.
echo 📍 Access your Virtual Fridge at: http://localhost:3000
echo.
echo 🔧 Service Status:
echo    Frontend:   http://localhost:3000
echo    Backend:    http://localhost:8080
echo    ML Service: http://localhost:5000
echo.
echo 📝 To stop services, close the terminal windows
echo ============================================================
echo.

REM Open browser
timeout /t 3 /nobreak >nul
start http://localhost:3000

pause




