# 🚀 Render.com Deployment Guide

## Overview
This guide will help you deploy the Multi-Agent Task Orchestration System on Render.com with separate backend and frontend services.

## 🎯 Render Deployment Steps

### Step 1: Prepare Your Repository

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Render deployment"
   git push origin main
   ```

### Step 2: Deploy Backend Service

1. **Go to Render Dashboard**
   - Visit [render.com](https://render.com)
   - Sign up/Login with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Choose the repository: `saritakumari23/Multi-Agent-Task-Solver`

3. **Configure Backend Service**
   - **Name**: `wandai-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `cd backend && python -m uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path**: `/api/tasks`

4. **Environment Variables**
   - `PYTHON_VERSION`: `3.11.0`
   - `DATABASE_URL`: `sqlite:///./app.db`

5. **Deploy Backend**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note the URL: `https://wandai-backend.onrender.com`

### Step 3: Deploy Frontend Service

1. **Create New Static Site**
   - Click "New +" → "Static Site"
   - Connect the same GitHub repository

2. **Configure Frontend Service**
   - **Name**: `wandai-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/build`

3. **Environment Variables**
   - `REACT_APP_API_URL`: `https://wandai-backend.onrender.com`

4. **Deploy Frontend**
   - Click "Create Static Site"
   - Wait for deployment to complete
   - Note the URL: `https://wandai-frontend.onrender.com`

## 🔧 Configuration Files

### render.yaml (Optional)
```yaml
services:
  - type: web
    name: wandai-backend
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: cd backend && python -m uvicorn main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.0
      - key: DATABASE_URL
        value: sqlite:///./app.db
    healthCheckPath: /api/tasks

  - type: web
    name: wandai-frontend
    env: static
    buildCommand: cd frontend && npm install && npm run build
    staticPublishPath: ./frontend/build
    envVars:
      - key: REACT_APP_API_URL
        value: https://wandai-backend.onrender.com
```

## 📋 Environment Variables

### Backend Service
```bash
PYTHON_VERSION=3.11.0
DATABASE_URL=sqlite:///./app.db
```

### Frontend Service
```bash
REACT_APP_API_URL=https://wandai-backend.onrender.com
```

## 🔍 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Python version (3.11+)
   - Verify all dependencies in `requirements.txt`
   - Check Render logs for specific errors

2. **CORS Errors**
   - Update `allow_origins` in `backend/main.py`
   - Ensure frontend URL is included

3. **Database Issues**
   - SQLite database is created automatically
   - Check file permissions

4. **Frontend Build Issues**
   - Verify Node.js version (18+)
   - Check `package.json` dependencies
   - Ensure build command is correct

### Debug Commands

```bash
# Check backend logs
# Available in Render dashboard

# Test API endpoints
curl https://wandai-backend.onrender.com/api/tasks

# Check frontend build locally
cd frontend && npm run build
```

## 🎉 Success!

Once deployed, your Multi-Agent Task Orchestration System will be available at:
- **Frontend**: `https://wandai-frontend.onrender.com`
- **Backend API**: `https://wandai-backend.onrender.com`
- **API Documentation**: `https://wandai-backend.onrender.com/docs`

## 🔄 Updates

### Updating the Application
1. Push changes to GitHub
2. Render automatically redeploys
3. Monitor logs for any issues

### Manual Redeploy
- Go to Render dashboard
- Click "Manual Deploy" on your service
- Select the latest commit

---

**Happy Deploying on Render! 🚀**
