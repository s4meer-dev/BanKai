"""In-memory and pub/sub event bus for real-time agent workflow telemetry."""

import asyncio
import json
import uuid
from datetime import datetime, timezone
from typing import AsyncGenerator, Dict, List, Optional
from app.core.logging import logger
from app.schemas.workflow import WorkflowEvent


class EventBus:
    """Manages asynchronous broadcast channels for real-time workflow events."""

    def __init__(self) -> None:
        # Maps project_id -> list of active client queues
        self._listeners: Dict[str, List[asyncio.Queue]] = {}
        # Retains recent events buffer for new joiners
        self._history: Dict[str, List[WorkflowEvent]] = {}
        self._lock = asyncio.Lock()

    async def subscribe(self, project_id: str) -> AsyncGenerator[WorkflowEvent, None]:
        """Subscribes an SSE or WebSocket client to a project's live event stream."""
        queue: asyncio.Queue = asyncio.Queue()
        async with self._lock:
            if project_id not in self._listeners:
                self._listeners[project_id] = []
            self._listeners[project_id].append(queue)
            
            # Replay recent history (up to last 20 events)
            historical_events = list(self._history.get(project_id, []))

        # Yield historical events first
        for event in historical_events:
            yield event

        try:
            while True:
                event = await queue.get()
                yield event
        except asyncio.CancelledError:
            pass
        finally:
            async with self._lock:
                if project_id in self._listeners and queue in self._listeners[project_id]:
                    self._listeners[project_id].remove(queue)
                    if not self._listeners[project_id]:
                        del self._listeners[project_id]

    async def publish(
        self,
        event_type: str,
        project_id: str,
        workflow_id: str,
        payload: dict,
        task_id: Optional[str] = None,
        agent_id: Optional[str] = None,
    ) -> WorkflowEvent:
        """Publishes a structured workflow event to all project subscribers."""
        event = WorkflowEvent(
            event_id=str(uuid.uuid4()),
            event_type=event_type,
            project_id=project_id,
            workflow_id=workflow_id,
            task_id=task_id,
            agent_id=agent_id,
            timestamp=datetime.now(timezone.utc).isoformat(),
            payload=payload,
        )

        async with self._lock:
            if project_id not in self._history:
                self._history[project_id] = []
            self._history[project_id].append(event)
            # Cap history buffer at 50 events per project
            if len(self._history[project_id]) > 50:
                self._history[project_id].pop(0)

            listeners = list(self._listeners.get(project_id, []))

        for queue in listeners:
            await queue.put(event)

        logger.info(
            f"Event published: [{event_type}] Project={project_id} Agent={agent_id or 'System'}"
        )
        return event


# Global singleton instance
event_bus = EventBus()
