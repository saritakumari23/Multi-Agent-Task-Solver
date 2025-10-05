#!/bin/bash
# Render deployment script for backend

echo "🚀 Starting Render deployment for Multi-Agent Task Orchestration System..."

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Start the backend server
echo "🔧 Starting backend server..."
cd backend && python -m uvicorn main:app --host 0.0.0.0 --port $PORT
