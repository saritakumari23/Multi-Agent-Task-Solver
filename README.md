# 🤖 Multi-Agent Task Orchestration System

A smart system that breaks down complex tasks into manageable subtasks handled by specialized AI agents with real-time progress tracking! ✨

## 🚀 Live Demo

**Try it now!** Your Multi-Agent Task Orchestration System is live and ready to use:

- **🌐 Frontend**: https://multiagent-task-solver.onrender.com/
- **🔧 Backend API**: https://multi-agent-task-solver.onrender.com/
- **📚 API Docs**: https://multi-agent-task-solver.onrender.com/docs

## 🎯 Features

- **🧠 Smart Task Decomposition**: Automatically breaks complex tasks into subtasks
- **🤖 Specialized AI Agents**: Research, Writer, Reviewer, Data, and Analysis agents
- **⚡ Real-time Updates**: Live progress tracking via WebSocket connections
- **🎨 Modern UI**: Beautiful React-based dashboard
- **💬 Human-like Communication**: Friendly, engaging messages

## 🛠️ Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+

### Quick Setup

1. **Clone and install**
   ```bash
   git clone https://github.com/saritakumari23/Multi-Agent-Task-Solver.git
   cd Multi-Agent-Task-Solver
   
   # Install Python dependencies
   pip install -r requirements.txt
   
   # Install Node.js dependencies
   cd frontend && npm install && cd ..
   ```

2. **Start the services**
   ```bash
   # Terminal 1: Backend
   cd backend
   python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
   
   # Terminal 2: Frontend
   cd frontend
   npm start
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## 🌐 Deployment

### Already Deployed on Render.com! 🎉

Your application is live at:
- **Frontend**: https://multiagent-task-solver.onrender.com/
- **Backend**: https://multi-agent-task-solver.onrender.com/

### Deploy Your Own Copy

1. **Fork this repository**
2. **Go to [render.com](https://render.com)**
3. **Deploy Backend**:
   - New Web Service → Connect GitHub → Select your fork
   - Build: `pip install -r requirements.txt`
   - Start: `cd backend && python -m uvicorn main:app --host 0.0.0.0 --port $PORT`
4. **Deploy Frontend**:
   - New Static Site → Connect GitHub → Select your fork
   - Build: `cd frontend && npm install && npm run build`
   - Publish: `frontend/build`

## 📖 How to Use

### Creating a Task

1. **Go to the frontend**: https://multiagent-task-solver.onrender.com/
2. **Click "Create New Task"**
3. **Describe your task** (be specific!)
4. **Choose workflow type**:
   - **Research → Write → Review**: For content creation 📝
   - **Data Analysis**: For data insights 📊
   - **Custom**: For anything else 🤖
5. **Click "Let's Go! 🚀"**

### Monitoring Progress

- Watch real-time updates as agents work
- View individual subtask outputs
- Download final results when complete

## 🔧 API Endpoints

- `POST /api/tasks` - Create a new task 🚀
- `GET /api/tasks` - List all tasks 📋
- `GET /api/tasks/{task_id}` - Get task details 🔍
- `GET /api/tasks/{task_id}/subtasks` - Get subtasks 📊
- `DELETE /api/tasks/{task_id}` - Delete task 🗑️
- `WS /ws/tasks/{task_id}` - WebSocket for real-time updates ⚡

## 🛠️ Troubleshooting

### Common Issues

1. **WebSocket Connection Failed** 🔌
   - Check if backend is running
   - Verify CORS settings

2. **Database Connection Error** 🗄️
   - SQLite database is created automatically
   - No setup needed!

3. **Agent Execution Failed** 🤖
   - Check agent logs for error messages
   - Verify agent configuration

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- 🚀 FastAPI for the web framework
- ⚛️ React for the frontend
- 🗄️ SQLite for data storage
- 🔌 WebSocket for real-time communication
- 🌐 Render for easy deployment
- 🤖 AI Agents for their hard work!

---

**Ready to automate your tasks?** Visit https://multiagent-task-solver.onrender.com/ and start creating! 🚀✨
