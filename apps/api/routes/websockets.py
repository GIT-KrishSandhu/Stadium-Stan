from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List

router = APIRouter(prefix="/ws", tags=["websockets"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, venue_id: str):
        await websocket.accept()
        if venue_id not in self.active_connections:
            self.active_connections[venue_id] = []
        self.active_connections[venue_id].append(websocket)

    def disconnect(self, websocket: WebSocket, venue_id: str):
        if venue_id in self.active_connections:
            self.active_connections[venue_id].remove(websocket)

    async def broadcast_to_venue(self, venue_id: str, message: dict):
        if venue_id in self.active_connections:
            for connection in self.active_connections[venue_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    pass

manager = ConnectionManager()

@router.websocket("/venues/{venue_id}")
async def websocket_endpoint(websocket: WebSocket, venue_id: str):
    await manager.connect(websocket, venue_id)
    try:
        while True:
            data = await websocket.receive_text()
            # We don't process incoming messages in this architecture, just push
    except WebSocketDisconnect:
        manager.disconnect(websocket, venue_id)
