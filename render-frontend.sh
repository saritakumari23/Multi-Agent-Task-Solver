#!/bin/bash
# Render deployment script for frontend

echo "🚀 Starting Render deployment for Multi-Agent Task Orchestration System Frontend..."

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
cd frontend && npm install

# Build the frontend
echo "🔧 Building frontend..."
npm run build

echo "✅ Frontend build completed successfully!"
