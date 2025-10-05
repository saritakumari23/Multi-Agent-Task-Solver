from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from models import TaskStatus, SubtaskStatus

class TaskCreate(BaseModel):
    description: str
    workflow_type: str

class TaskResponse(BaseModel):
    id: str
    description: str
    workflow_type: str
    status: TaskStatus
    progress: int
    final_output: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class SubtaskResponse(BaseModel):
    id: str
    task_id: str
    agent_name: str
    description: str
    status: SubtaskStatus
    progress: int
    input_data: Optional[str] = None
    output_data: Optional[str] = None
    error_message: Optional[str] = None
    dependencies: Optional[str] = None
    order: int
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class WebSocketMessage(BaseModel):
    type: str
    task_id: str
    subtask_id: Optional[str] = None
    message: Optional[str] = None
    progress: Optional[int] = None
    data: Optional[Dict[str, Any]] = None
    timestamp: datetime = datetime.utcnow()

class AgentResult(BaseModel):
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    execution_time: Optional[float] = None

class ExecutionContext(BaseModel):
    subtask_id: str
    input_data: Dict[str, Any]
    shared_context: Dict[str, Any]
    timeout: int = 300  # 5 minutes default
