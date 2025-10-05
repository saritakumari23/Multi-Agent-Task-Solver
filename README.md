# 🤖 Multi-Agent Task Orchestration System

A smart and friendly system that breaks down complex tasks into manageable subtasks handled by specialized AI agents, with real-time progress tracking and human-like communication! ✨

## 🎯 Features

- **🧠 Smart Task Decomposition**: Automatically breaks complex tasks into manageable subtasks
- **🤖 Specialized AI Agents**: Research, Writer, Reviewer, Data, and Analysis agents that work together
- **⚡ Real-time Updates**: Live progress tracking via WebSocket connections
- **🔗 Dependency Management**: Tasks execute in proper order based on dependencies
- **🛡️ Fault Tolerance**: Retry mechanisms and error handling
- **🎨 Modern UI**: Beautiful React-based dashboard with real-time updates
- **👥 Agent Management**: Monitor and control agent status
- **💬 Human-like Communication**: Friendly, engaging messages throughout the system

## 🏗️ Architecture

### Backend (FastAPI)
- **🎯 Task Orchestration**: Manages task lifecycle and execution
- **🤖 Agent Registry**: Manages specialized AI agents with personality
- **⚙️ Execution Engine**: Handles dependency resolution and parallel execution
- **🔌 WebSocket Manager**: Real-time communication with frontend
- **💾 Database**: SQLite for development, PostgreSQL for production

### Frontend (React)
- **📊 Dashboard**: Beautiful task overview and management
- **✨ Task Creation**: Intuitive task creation with friendly workflow selection
- **📈 Real-time Monitoring**: Live progress tracking with engaging status messages
- **👥 Agent Management**: Monitor and control agents with human-like feedback

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- SQLite (included, no setup needed!)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd WandAI_NITYO
   ```

2. **Install dependencies**
   ```bash
   # Install Python dependencies
   pip install -r requirements.txt
   
   # Install Node.js dependencies
   cd frontend
   npm install
   cd ..
   ```

3. **Start the backend**
   ```bash
   cd backend
   python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
   ```

4. **Start the frontend** (in a new terminal)
   ```bash
   cd frontend
   npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## 🌐 Railway Deployment (Recommended)

### One-Click Deploy to Railway

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Railway deployment"
   git push origin main
   ```

2. **Deploy on Railway**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway will automatically detect the configuration

3. **Get Your URL**
   - Backend: `https://your-project.railway.app`
   - Frontend: Deploy separately or use Railway's static hosting

### Railway Configuration
- ✅ **Automatic Detection
- ✅ **Zero Configuration Required
- ✅ **Free Tier Available
- ✅ **Automatic Deployments

## 🐳 Docker Deployment (Alternative)

### Using Docker Compose

1. **Start all services**
   ```bash
   docker-compose up -d
   ```

2. **Access the application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000

### Individual Services

```bash
# Backend only
docker build -f Dockerfile.backend -t multi-agent-backend .
docker run -p 8000:8000 multi-agent-backend

# Frontend only
docker build -f Dockerfile.frontend -t multi-agent-frontend .
docker run -p 3000:3000 multi-agent-frontend
```

> **💡 Tip**: Railway deployment is much easier and doesn't require Docker setup!

## 📖 Usage

### Creating a Task

1. **Navigate to Create Task**
   - Click "Create New Task" on the dashboard
   - Or go to `/create` directly

2. **Describe Your Task**
   - Enter a detailed description of what you want to accomplish
   - Be specific about requirements and context
   - The more details you provide, the better we can help! 💡

3. **Choose Workflow Type**
   - **Research → Write → Review**: Great for creating awesome content, reports, and deep-dive analysis! 📝
   - **Data Analysis**: Perfect for digging into data, finding trends, and uncovering insights! 📊
   - **Custom**: Let our smart AI agents handle whatever you need! 🤖

4. **Start Execution**
   - Click "Let's Go! 🚀" to begin execution
   - You'll be redirected to the task details page with real-time updates

### Monitoring Progress

1. **Real-time Updates**
   - Watch subtasks execute in real-time with friendly status messages
   - Progress bars show completion status with engaging animations
   - WebSocket provides live updates with human-like feedback

2. **Task Details**
   - View individual subtask outputs with detailed insights
   - Monitor agent performance with quality scores
   - Track execution time and see "All done! 🎉" when complete

3. **Results**
   - Download final output in multiple formats
   - Copy to clipboard with one click
   - View quality scores and improvement suggestions

## 🔧 Configuration

### Environment Variables

```bash
# Database (SQLite for development, PostgreSQL for production)
DATABASE_URL=sqlite:///./app.db

# API Settings
API_HOST=0.0.0.0
API_PORT=8000

# Railway Deployment
PORT=$PORT  # Automatically set by Railway
```

### Agent Configuration

Agents can be configured in `backend/agents.py` with human-like personality:

- **🔍 Research Agent**: Information gathering and analysis with friendly insights
- **✍️ Writer Agent**: Content creation and writing with engaging style
- **📝 Reviewer Agent**: Quality review and improvement with helpful feedback
- **📊 Data Agent**: Data collection and processing with clear explanations
- **📈 Analysis Agent**: Statistical analysis and insights with actionable recommendations

## 🏗️ Development

### Backend Development

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### Frontend Development

```bash
cd frontend
npm install
npm start
```

### Database Setup

```bash
# SQLite database is automatically created
# No migrations needed for development!

# For production with PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/orchestration
```

## 📊 API Documentation

The API is fully documented with interactive Swagger UI:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

- `POST /api/tasks` - Create a new task 🚀
- `GET /api/tasks` - List all tasks 📋
- `GET /api/tasks/{task_id}` - Get task details 🔍
- `GET /api/tasks/{task_id}/subtasks` - Get subtasks 📊
- `DELETE /api/tasks/{task_id}` - Delete task 🗑️
- `WS /ws/tasks/{task_id}` - WebSocket for real-time updates ⚡

## 🔍 Monitoring

### System Health

- **🤖 Agent Status**: Monitor agent availability and performance with friendly status messages
- **📊 Task Metrics**: Track completion rates and execution times with engaging visualizations
- **📝 Error Logs**: View detailed error information with helpful debugging tips
- **🔌 WebSocket Status**: Monitor real-time connections with live status indicators

### Performance Metrics

- ⏱️ Task execution time with progress tracking
- 🎯 Agent success rates with quality scores
- 💻 System resource usage with optimization suggestions
- 🗄️ Database performance with efficiency metrics

## 🛠️ Troubleshooting

### Common Issues

1. **WebSocket Connection Failed** 🔌
   - Check if backend is running on port 8000
   - Verify CORS settings in `backend/main.py`
   - Check firewall settings

2. **Database Connection Error** 🗄️
   - SQLite database is created automatically
   - For PostgreSQL: verify connection string
   - Check database permissions

3. **Agent Execution Failed** 🤖
   - Check agent logs for helpful error messages
   - Verify agent configuration in `backend/agents.py`
   - Review error messages with debugging tips

### Debug Mode

```bash
# Backend with debug logging
python -m uvicorn main:app --reload --log-level debug --host 127.0.0.1 --port 8000

# Frontend with debug mode
REACT_APP_DEBUG=true npm start
```

### Railway Deployment Issues

1. **Build Failures**
   - Check `railway.json` configuration
   - Verify `requirements.txt` dependencies
   - Check Railway logs for specific errors

2. **Runtime Errors**
   - Check Railway logs: `railway logs`
   - Verify environment variables
   - Test locally first

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with human-friendly improvements
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- 🚀 FastAPI for the excellent web framework
- ⚛️ React for the modern frontend
- 🗄️ SQLite for simple data storage
- 🔌 WebSocket for real-time communication
- 🌐 Railway for easy deployment
- 🤖 AI Agents for their hard work and personality!

## 🎉 Ready to Deploy?

Your Multi-Agent Task Orchestration System is now ready for Railway deployment! 

**Next Steps:**
1. Push to GitHub
2. Deploy on Railway
3. Enjoy your AI-powered task automation! 🚀✨
