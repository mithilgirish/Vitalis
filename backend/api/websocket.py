"""
WebSocket Telemetry & Dispatch Broadcaster
Provides real-time event streaming for Next.js command maps and courier clients.
"""

import json
from typing import List, Dict, Any, Set
from fastapi import WebSocket, WebSocketDisconnect
from backend.core.logging import logger

class WebSocketManager:
    """Manages active WebSocket subscriptions across the command center and couriers."""
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        logger.info(f"WebSocket client connected. Active sessions: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)
        logger.info(f"WebSocket client disconnected. Active sessions: {len(self.active_connections)}")

    async def broadcast_event(self, event_type: str, data: Dict[str, Any]):
        message = json.dumps({
            "event": event_type,
            "payload": data
        })
        disconnected = []
        for connection in list(self.active_connections):
            try:
                await connection.send_text(message)
            except Exception:
                disconnected.append(connection)
        
        for dead_conn in disconnected:
            self.disconnect(dead_conn)

ws_manager = WebSocketManager()
