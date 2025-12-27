#!/bin/bash

# Virtual Fridge - Start All Services
# For Mac/Linux

echo "============================================================"
echo "🥦 Starting Virtual Fridge System"
echo "💰 100% FREE - No API costs!"
echo "============================================================"
echo ""

# Check if required commands exist
command -v python3 >/dev/null 2>&1 || { echo "❌ Python 3 not found. Please install Python 3.8-3.11"; exit 1; }
command -v java >/dev/null 2>&1 || { echo "❌ Java not found. Please install Java 17+"; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ Node.js not found. Please install Node.js 16+"; exit 1; }
command -v mysql >/dev/null 2>&1 || { echo "⚠️  MySQL command not found. Make sure MySQL server is running."; }

echo "✅ Prerequisites check passed!"
echo ""

# Start ML Service
echo "1️⃣  Starting Python ML Service..."
cd ml-service
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi
source venv/bin/activate
pip install -q -r requirements.txt
python main.py &
ML_PID=$!
cd ..
echo "✅ ML Service started (PID: $ML_PID) on http://localhost:5000"
echo ""

# Wait for ML service to be ready
sleep 5

# Start Spring Boot Backend
echo "2️⃣  Starting Spring Boot Backend..."
cd backend
./mvnw spring-boot:run &
BACKEND_PID=$!
cd ..
echo "✅ Backend started (PID: $BACKEND_PID) on http://localhost:8080"
echo ""

# Wait for backend to be ready
sleep 10

# Start React Frontend
echo "3️⃣  Starting React Frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
fi
npm start &
FRONTEND_PID=$!
cd ..
echo "✅ Frontend started (PID: $FRONTEND_PID) on http://localhost:3000"
echo ""

echo "============================================================"
echo "🎉 All services started successfully!"
echo "============================================================"
echo ""
echo "📍 Access your Virtual Fridge at: http://localhost:3000"
echo ""
echo "🔧 Service Status:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:8080"
echo "   ML Service: http://localhost:5000"
echo ""
echo "📝 To stop all services, press Ctrl+C"
echo "============================================================"

# Save PIDs to file
echo "$ML_PID $BACKEND_PID $FRONTEND_PID" > .pids

# Wait for user interrupt
trap "echo ''; echo '🛑 Stopping all services...'; kill $ML_PID $BACKEND_PID $FRONTEND_PID 2>/dev/null; rm -f .pids; echo '✅ All services stopped'; exit 0" INT

wait




