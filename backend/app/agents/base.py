"""Base agent interface with typed I/O, error handling, and structured telemetry."""

import abc
import time
from typing import Any, Dict, Optional
from pydantic import BaseModel
from app.core.logging import logger
from app.orchestrator.event_bus import event_bus


class BaseAgent(abc.ABC):
    """Abstract base class for all 8 specialized BAN KAI agents."""

    agent_name: str = "BaseAgent"
    role_description: str = "Base agent responsible for core intelligence tasks."
    system_prompt: str = ""

    async def execute(
        self,
        project_id: str,
        workflow_id: str,
        input_data: Dict[str, Any],
        task_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Wraps agent execution with telemetry, timing, event emission, and error handling."""
        start_time = time.perf_counter()
        logger.info(f"Agent [{self.agent_name}] started for project {project_id}")

        await event_bus.publish(
            event_type="agent.started",
            project_id=project_id,
            workflow_id=workflow_id,
            task_id=task_id,
            agent_id=self.agent_name,
            payload={
                "role": self.role_description,
                "input_summary": list(input_data.keys()),
            },
        )

        try:
            output = await self._run(project_id, workflow_id, input_data, task_id)
            latency_ms = round((time.perf_counter() - start_time) * 1000, 2)

            await event_bus.publish(
                event_type="agent.completed",
                project_id=project_id,
                workflow_id=workflow_id,
                task_id=task_id,
                agent_id=self.agent_name,
                payload={
                    "latency_ms": latency_ms,
                    "output_summary": list(output.keys()) if isinstance(output, dict) else "ok",
                },
            )
            return output
        except Exception as exc:
            latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
            logger.error(f"Agent [{self.agent_name}] failed: {exc}", exc_info=True)

            await event_bus.publish(
                event_type="agent.failed",
                project_id=project_id,
                workflow_id=workflow_id,
                task_id=task_id,
                agent_id=self.agent_name,
                payload={"error": str(exc), "latency_ms": latency_ms},
            )
            raise exc

    @abc.abstractmethod
    async def _run(
        self,
        project_id: str,
        workflow_id: str,
        input_data: Dict[str, Any],
        task_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Internal execution logic overridden by specialized agents."""
        pass
