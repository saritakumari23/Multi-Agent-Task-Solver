import asyncio
import json
import uuid
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session

from database import get_db, Task, Subtask, TaskStatus, SubtaskStatus
from schemas import ExecutionContext, AgentResult, WebSocketMessage
from agents import AgentRegistry
from websocket_manager import WebSocketManager

logger = logging.getLogger(__name__)

class ExecutionEngine:
    def __init__(self, websocket_manager: WebSocketManager):
        self.websocket_manager = websocket_manager
        self.agent_registry = AgentRegistry()
        
    async def execute_task(self, task_id: str, db: Session):
        """Main execution method for a task"""
        try:
            # Get task from database
            task = db.query(Task).filter(Task.id == task_id).first()
            if not task:
                logger.error(f"Task {task_id} not found")
                return
                
            # Update task status
            task.status = TaskStatus.RUNNING
            task.updated_at = datetime.utcnow()
            db.commit()
            
            # Emit task started event
            await self.websocket_manager.broadcast(task_id, WebSocketMessage(
                type="task_started",
                task_id=task_id,
                message="Task execution started"
            ))
            
            # Decompose task into subtasks
            await self._decompose_task(task, db)
            
            # Execute subtasks
            await self._execute_subtasks(task_id, db)
            
            # Aggregate results
            logger.info(f"Starting aggregation for task {task_id}")
            await self._aggregate_results(task_id, db)
            logger.info(f"Completed aggregation for task {task_id}")
            
        except Exception as e:
            logger.error(f"Error executing task {task_id}: {e}")
            await self._handle_task_failure(task_id, str(e), db)
    
    async def _decompose_task(self, task: Task, db: Session):
        """Decompose task into subtasks based on workflow type"""
        if task.workflow_type == "research_write_review":
            # Create research subtask
            research_subtask = Subtask(
                id=f"{task.id}-0",
                task_id=task.id,
                agent_name="Research Agent",
                description=f"Research information about: {task.description}",
                dependencies=None,
                order=0
            )
            db.add(research_subtask)
            
            # Create writer subtask
            writer_subtask = Subtask(
                id=f"{task.id}-1",
                task_id=task.id,
                agent_name="Writer Agent",
                description=f"Write content based on research for: {task.description}",
                dependencies=json.dumps([research_subtask.id]),
                order=1
            )
            db.add(writer_subtask)
            
            # Create reviewer subtask
            reviewer_subtask = Subtask(
                id=f"{task.id}-2",
                task_id=task.id,
                agent_name="Reviewer Agent",
                description=f"Review and improve content for: {task.description}",
                dependencies=json.dumps([writer_subtask.id]),
                order=2
            )
            db.add(reviewer_subtask)
            
        elif task.workflow_type == "data_analysis":
            # Create data fetching subtask
            fetch_subtask = Subtask(
                id=f"{task.id}-0",
                task_id=task.id,
                agent_name="Data Agent",
                description=f"Fetch data for: {task.description}",
                dependencies=None,
                order=0
            )
            db.add(fetch_subtask)
            
            # Create analysis subtask
            analysis_subtask = Subtask(
                id=f"{task.id}-1",
                task_id=task.id,
                agent_name="Analysis Agent",
                description=f"Analyze data for: {task.description}",
                dependencies=json.dumps([fetch_subtask.id]),
                order=1
            )
            db.add(analysis_subtask)
            
        else:  # Custom workflow
            # Create a single general subtask
            general_subtask = Subtask(
                id=f"{task.id}-0",
                task_id=task.id,
                agent_name="General Agent",
                description=f"Process task: {task.description}",
                dependencies=None,
                order=0
            )
            db.add(general_subtask)
        
        db.commit()
    
    async def _execute_subtasks(self, task_id: str, db: Session):
        """Execute subtasks in dependency order"""
        completed_subtasks = set()
        ready_queue = []
        
        # Get subtask IDs that have no dependencies - use fresh database query
        all_subtasks = db.query(Subtask).filter(Subtask.task_id == task_id).all()
        for subtask in all_subtasks:
            if not subtask.dependencies:
                ready_queue.append(subtask.id)
        
        while ready_queue:
            # Execute all ready subtasks in parallel
            subtask_ids_to_execute = ready_queue.copy()
            ready_queue.clear()
            
            # Execute subtasks concurrently
            execution_tasks = []
            for subtask_id in subtask_ids_to_execute:
                execution_tasks.append(self._execute_single_subtask(subtask_id, task_id, db))
            
            # Wait for all subtasks to complete
            results = await asyncio.gather(*execution_tasks, return_exceptions=True)
            
            # Process results and update ready queue
            for i, result in enumerate(results):
                subtask_id = subtask_ids_to_execute[i]
                if isinstance(result, Exception):
                    logger.error(f"Subtask {subtask_id} failed: {result}")
                    # Update subtask status in database
                    db_subtask = db.query(Subtask).filter(Subtask.id == subtask_id).first()
                    if db_subtask:
                        db_subtask.status = SubtaskStatus.FAILED
                        db_subtask.error_message = str(result)
                        db.commit()
                else:
                    completed_subtasks.add(subtask_id)
                    # Update subtask status in database
                    db_subtask = db.query(Subtask).filter(Subtask.id == subtask_id).first()
                    if db_subtask:
                        db_subtask.status = SubtaskStatus.COMPLETED
                        db_subtask.completed_at = datetime.utcnow()
                        db.commit()
                    
                    # Check if any other subtasks are now ready
                    # Get fresh subtask list from database
                    all_subtasks = db.query(Subtask).filter(Subtask.task_id == task_id).all()
                    for other_subtask in all_subtasks:
                        if (other_subtask.id not in completed_subtasks and 
                            other_subtask.status == SubtaskStatus.PENDING):
                            
                            dependencies = json.loads(other_subtask.dependencies) if other_subtask.dependencies else []
                            if all(dep in completed_subtasks for dep in dependencies):
                                ready_queue.append(other_subtask.id)
            
            # Update task progress
            total_subtasks = db.query(Subtask).filter(Subtask.task_id == task_id).count()
            progress = int((len(completed_subtasks) / total_subtasks) * 100)
            task = db.query(Task).filter(Task.id == task_id).first()
            task.progress = progress
            db.commit()
            
            # Emit progress update
            await self.websocket_manager.broadcast(task_id, WebSocketMessage(
                type="task_progress",
                task_id=task_id,
                progress=progress,
                message=f"Progress: {progress}%"
            ))
    
    async def _execute_single_subtask(self, subtask_id: str, task_id: str, db: Session):
        """Execute a single subtask"""
        try:
            # Get fresh subtask from database
            subtask = db.query(Subtask).filter(Subtask.id == subtask_id).first()
            if not subtask:
                raise Exception(f"Subtask {subtask_id} not found")
            
            # Update subtask status
            subtask.status = SubtaskStatus.RUNNING
            subtask.started_at = datetime.utcnow()
            db.commit()
            
            # Emit subtask started event
            await self.websocket_manager.broadcast(task_id, WebSocketMessage(
                type="subtask_started",
                task_id=task_id,
                subtask_id=subtask.id,
                message=f"{subtask.agent_name} started"
            ))
            
            # Prepare execution context
            context = ExecutionContext(
                subtask_id=subtask.id,
                input_data=self._get_input_data(subtask.id, db),
                shared_context={"description": subtask.task.description}
            )
            
            # Get agent and execute
            agent = self.agent_registry.get_agent(subtask.agent_name)
            if not agent:
                raise Exception(f"Agent {subtask.agent_name} not found")
            
            # Execute agent
            result = await agent.execute(context)
            
            # Store result
            subtask.output_data = json.dumps(result.data) if result.data else None
            subtask.progress = 100
            subtask.status = SubtaskStatus.COMPLETED
            subtask.completed_at = datetime.utcnow()
            db.commit()
            
            # Debug logging
            logger.info(f"Subtask {subtask.id} completed with output: {result.data}")
            if result.data and "content" in result.data:
                logger.info(f"Content length: {len(result.data['content'])}")
                logger.info(f"Content preview: {result.data['content'][:200]}...")
            
            # Emit subtask completed event
            await self.websocket_manager.broadcast(task_id, WebSocketMessage(
                type="subtask_completed",
                task_id=task_id,
                subtask_id=subtask.id,
                message=f"{subtask.agent_name} completed",
                data=result.data
            ))
            
            return result
            
        except Exception as e:
            logger.error(f"Error executing subtask {subtask_id}: {e}")
            # Get fresh subtask for error update
            subtask = db.query(Subtask).filter(Subtask.id == subtask_id).first()
            if subtask:
                subtask.status = SubtaskStatus.FAILED
                subtask.error_message = str(e)
                db.commit()
            
            # Emit subtask failed event
            await self.websocket_manager.broadcast(task_id, WebSocketMessage(
                type="subtask_failed",
                task_id=task_id,
                subtask_id=subtask_id,
                message=f"Subtask failed: {str(e)}"
            ))
            
            raise e
    
    def _get_input_data(self, subtask_id: str, db: Session) -> Dict[str, Any]:
        """Get input data for a subtask from its dependencies"""
        input_data = {}
        
        # Get fresh subtask from database
        subtask = db.query(Subtask).filter(Subtask.id == subtask_id).first()
        if not subtask:
            return input_data
        
        if subtask.dependencies:
            dependencies = json.loads(subtask.dependencies)
            for dep_id in dependencies:
                dep_subtask = db.query(Subtask).filter(Subtask.id == dep_id).first()
                if dep_subtask and dep_subtask.output_data:
                    dep_data = json.loads(dep_subtask.output_data)
                    input_data[dep_id] = dep_data
        
        return input_data
    
    async def _aggregate_results(self, task_id: str, db: Session):
        """Aggregate results from all subtasks"""
        try:
            task = db.query(Task).filter(Task.id == task_id).first()
            subtasks = db.query(Subtask).filter(Subtask.task_id == task_id).order_by(Subtask.order).all()
            
            # Collect all outputs
            results = {}
            final_content = ""
            
            for subtask in subtasks:
                logger.info(f"Processing subtask {subtask.id} with order {subtask.order}")
                if subtask.output_data:
                    data = json.loads(subtask.output_data)
                    results[subtask.id] = data
                    logger.info(f"Subtask {subtask.id} output data: {data}")
                    
                    # Get the main content from the last subtask (highest order)
                    if subtask.order == max([s.order for s in subtasks]):
                        # Check for different content fields
                        final_content = data.get("content", "") or data.get("improved_content", "") or data.get("original_content", "")
                        logger.info(f"Final content from subtask {subtask.id}: {final_content[:100]}...")
                else:
                    logger.warning(f"Subtask {subtask.id} has no output data")
            
            # If no content found, try to get content from any subtask
            if not final_content:
                for subtask in subtasks:
                    if subtask.output_data:
                        data = json.loads(subtask.output_data)
                        # Check for different content fields
                        content = data.get("content", "") or data.get("improved_content", "") or data.get("original_content", "")
                        if content:
                            final_content = content
                            logger.info(f"Content found in subtask {subtask.id}: {final_content[:100]}...")
                            break
            
            # Create aggregated result
            aggregated = {
                "summary": "Task completed successfully",
                "results": results,
                "final_content": final_content,
                "total_subtasks": len(subtasks),
                "completed_at": datetime.utcnow().isoformat()
            }
            
            logger.info(f"Aggregated results for task {task_id}: {aggregated}")
            
            # Store final output
            task.final_output = json.dumps(aggregated)
            task.status = TaskStatus.COMPLETED
            task.progress = 100
            task.updated_at = datetime.utcnow()
            db.commit()
            
            # Debug: Check what was stored
            logger.info(f"Task {task_id} final_output stored: {task.final_output}")
            logger.info(f"Task {task_id} status: {task.status}")
            
            # Emit task completed event
            await self.websocket_manager.broadcast(task_id, WebSocketMessage(
                type="task_completed",
                task_id=task_id,
                message="Task completed successfully",
                data=aggregated
            ))
            
        except Exception as e:
            logger.error(f"Error aggregating results for task {task_id}: {e}")
            await self._handle_task_failure(task_id, str(e), db)
    
    async def _handle_task_failure(self, task_id: str, error_message: str, db: Session):
        """Handle task failure"""
        task = db.query(Task).filter(Task.id == task_id).first()
        if task:
            task.status = TaskStatus.FAILED
            task.final_output = json.dumps({"error": error_message})
            task.updated_at = datetime.utcnow()
            db.commit()
            
            # Emit task failed event
            await self.websocket_manager.broadcast(task_id, WebSocketMessage(
                type="task_failed",
                task_id=task_id,
                message=f"Task failed: {error_message}"
            ))
