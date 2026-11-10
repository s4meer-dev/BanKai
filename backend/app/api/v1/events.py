"""Server-Sent Events (SSE) streaming endpoint for real-time frontend updates."""

import asyncio
import json
from fastapi import APIRouter, Query, Request
from fastapi.responses import StreamingResponse

from app.orchestrator.event_bus import event_bus

router = APIRouter()


@router.get("/stream")
async def stream_workflow_events(
    request: Request,
    project_id: str = Query(...),
):
    """Streams live workflow events for a project using Server-Sent Events (SSE)."""

    async def event_generator():
        # Yield initial connection confirmation
        yield f"event: connected\ndata: {json.dumps({'status': 'connected', 'project_id': project_id})}\n\n"

        subscription = event_bus.subscribe(project_id)
        try:
            async for event in subscription:
                # Check client disconnect
                if await request.is_disconnected():
                    break
                data = json.dumps(event.model_dump())
                yield f"event: {event.event_type}\ndata: {data}\n\n"
        except asyncio.CancelledError:
            pass

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )

