from fastapi import WebSocket
from typing import Dict, List
import json
import logging

logger = logging.getLogger(__name__)

class WebSocketManager:
    def __init__(self):
        # Dictionary to store active connections by task_id
        self.active_connections: Dict[str, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, task_id: str):
        """Accept a new WebSocket connection for a specific task"""
        await websocket.accept()
        
        if task_id not in self.active_connections:
            self.active_connections[task_id] = []
        
        self.active_connections[task_id].append(websocket)
        logger.info(f"WebSocket connected for task {task_id}")
    
    def disconnect(self, task_id: str, websocket: WebSocket = None):
        """Remove a WebSocket connection"""
        if task_id in self.active_connections:
            if websocket:
                try:
                    self.active_connections[task_id].remove(websocket)
                except ValueError:
                    pass
            
            # If no more connections for this task, remove the entry
            if not self.active_connections[task_id]:
                del self.active_connections[task_id]
        
        logger.info(f"WebSocket disconnected for task {task_id}")
    
    async def broadcast(self, task_id: str, message):
        """Broadcast a message to all connections for a specific task"""
        if task_id not in self.active_connections:
            return
        
        # Convert message to JSON if it's a Pydantic model
        if hasattr(message, 'dict'):
            message_data = message.dict()
        else:
            message_data = message
        
        message_json = json.dumps(message_data, default=str)
        
        # Send to all connections for this task
        connections_to_remove = []
        for websocket in self.active_connections[task_id]:
            try:
                await websocket.send_text(message_json)
            except Exception as e:
                logger.error(f"Error sending WebSocket message: {e}")
                connections_to_remove.append(websocket)
        
        # Remove failed connections
        for websocket in connections_to_remove:
            self.disconnect(task_id, websocket)
    
    async def broadcast_to_all(self, message):
        """Broadcast a message to all active connections"""
        for task_id in list(self.active_connections.keys()):
            await self.broadcast(task_id, message)
