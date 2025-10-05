from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import asyncio
import json
import uuid
from datetime import datetime
from typing import List, Dict, Any
import logging

from database import get_db, engine, Base
from models import Task, Subtask, TaskStatus, SubtaskStatus
from schemas import TaskCreate, TaskResponse, SubtaskResponse, WebSocketMessage
from execution_engine import ExecutionEngine
from agents import AgentRegistry
from websocket_manager import WebSocketManager

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Multi-Agent Task Orchestration", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "https://wandai-frontend.vercel.app",
        "https://wandai-frontend.onrender.com",
        "https://wandai-frontend.railway.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket manager
websocket_manager = WebSocketManager()

# Execution engine
execution_engine = ExecutionEngine(websocket_manager)

# Agent registry
agent_registry = AgentRegistry()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.get("/")
async def root():
    return {"message": "Multi-Agent Task Orchestration System"}

@app.post("/api/tasks", response_model=TaskResponse)
async def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    """Create a new task and start execution"""
    try:
        # Create task in database
        db_task = Task(
            id=str(uuid.uuid4()),
            description=task.description,
            workflow_type=task.workflow_type,
            status=TaskStatus.PENDING,
            progress=0
        )
        db.add(db_task)
        db.commit()
        db.refresh(db_task)
        
        # Start task execution asynchronously
        asyncio.create_task(execution_engine.execute_task(db_task.id, db))
        
        return TaskResponse(
            id=db_task.id,
            description=db_task.description,
            workflow_type=db_task.workflow_type,
            status=db_task.status,
            progress=db_task.progress,
            created_at=db_task.created_at
        )
    except Exception as e:
        logger.error(f"Error creating task: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/tasks", response_model=List[TaskResponse])
async def get_tasks(db: Session = Depends(get_db)):
    """Get all tasks"""
    tasks = db.query(Task).order_by(Task.created_at.desc()).all()
    return [TaskResponse.from_orm(task) for task in tasks]

@app.get("/api/tasks/{task_id}", response_model=TaskResponse)
async def get_task(task_id: str, db: Session = Depends(get_db)):
    """Get specific task with subtasks"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return TaskResponse.from_orm(task)

@app.get("/api/tasks/{task_id}/subtasks", response_model=List[SubtaskResponse])
async def get_subtasks(task_id: str, db: Session = Depends(get_db)):
    """Get subtasks for a specific task"""
    subtasks = db.query(Subtask).filter(Subtask.task_id == task_id).order_by(Subtask.order).all()
    return [SubtaskResponse.from_orm(subtask) for subtask in subtasks]

@app.delete("/api/tasks/{task_id}")
async def delete_task(task_id: str, db: Session = Depends(get_db)):
    """Delete a task"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Delete subtasks first
    db.query(Subtask).filter(Subtask.task_id == task_id).delete()
    db.delete(task)
    db.commit()
    
    return {"message": "Task deleted successfully"}

@app.websocket("/ws/tasks/{task_id}")
async def websocket_endpoint(websocket: WebSocket, task_id: str):
    """WebSocket endpoint for real-time task updates"""
    logger.info(f"WebSocket connection attempt for task {task_id}")
    await websocket_manager.connect(websocket, task_id)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for task {task_id}")
        websocket_manager.disconnect(task_id)
    except Exception as e:
        logger.error(f"WebSocket error for task {task_id}: {e}")
        websocket_manager.disconnect(task_id)

@app.get("/api/agents")
async def get_agents():
    """Get available agents"""
    return {
        "agents": [
            {
                "name": "Research Agent",
                "description": "Gathers information and research data",
                "status": "active"
            },
            {
                "name": "Writer Agent", 
                "description": "Creates content based on research",
                "status": "active"
            },
            {
                "name": "Reviewer Agent",
                "description": "Reviews and improves content quality",
                "status": "active"
            }
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
