#!/bin/bash

echo "🚀 Starting Nexara Development Servers"
echo ""

# Start backend server
echo "📦 Starting Backend Server..."
cd backend
npm install --silent
npm start &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 5

# Start frontend server
echo "🎨 Starting Frontend Server..."
cd ../frontend
npm install --silent
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Servers started successfully!"
echo "🔗 Backend: http://localhost:5000"
echo "🔗 Frontend: http://localhost:3000"
echo ""
echo "📝 Issue Management Features:"
echo "   • Create, read, update, delete issues"
echo "   • Issue statistics and analytics"
echo "   • Board and column management"
echo "   • Project-specific issue tracking"
echo ""
echo "Press Ctrl+C to stop all servers"

# Keep script running and handle interruption
trap "echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait