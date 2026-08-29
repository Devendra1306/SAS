"""
WebSocket endpoint for live attendance updates.
Faculty connects to receive real-time face recognition events.
"""
import json
import logging
from typing import Dict, Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.auth.security import decode_access_token

logger = logging.getLogger(__name__)
router = APIRouter(tags=["websocket"])

# Active connections: session_id -> set of WebSocket connections
_connections: Dict[str, Set[WebSocket]] = {}


async def broadcast_to_session(session_id: str, message: dict):
    """Send a message to all WebSocket clients watching a session."""
    if session_id not in _connections:
        return
    dead = set()
    for ws in list(_connections[session_id]):
        try:
            await ws.send_text(json.dumps(message, default=str))
        except Exception:
            dead.add(ws)
    for ws in dead:
        _connections[session_id].discard(ws)


@router.websocket("/ws/attendance/{session_id}")
async def attendance_websocket(
    websocket: WebSocket,
    session_id: str,
    token: str = Query(...)
):
    """
    WebSocket for live attendance updates.
    Authenticate via ?token=<jwt_access_token>
    """
    # Authenticate
    payload = decode_access_token(token)
    if payload is None:
        await websocket.close(code=4001, reason="Unauthorized")
        return
    if payload.get("role") not in ["ADMIN", "FACULTY"]:
        await websocket.close(code=4003, reason="Forbidden")
        return

    await websocket.accept()
    logger.info(f"WS connected: session={session_id} user={payload.get('sub')}")

    # Register connection
    if session_id not in _connections:
        _connections[session_id] = set()
    _connections[session_id].add(websocket)

    try:
        await websocket.send_text(json.dumps({
            "type": "CONNECTED",
            "session_id": session_id,
            "message": "Connected to live attendance feed"
        }))
        while True:
            # Keep connection alive; client may send pings
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text(json.dumps({"type": "PONG"}))
    except WebSocketDisconnect:
        logger.info(f"WS disconnected: session={session_id}")
    finally:
        if session_id in _connections:
            _connections[session_id].discard(websocket)
            if not _connections[session_id]:
                del _connections[session_id]
