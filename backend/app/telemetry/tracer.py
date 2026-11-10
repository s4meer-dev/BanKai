"""Observability, Langfuse tracing integration, and OpenTelemetry instrumentation."""

import time
from typing import Any, Callable, Dict, Optional
from app.core.config import settings
from app.core.logging import logger

# Langfuse client holder
_langfuse_client = None

if settings.LANGFUSE_ENABLED and settings.LANGFUSE_PUBLIC_KEY and settings.LANGFUSE_SECRET_KEY:
    try:
        from langfuse import Langfuse

        _langfuse_client = Langfuse(
            public_key=settings.LANGFUSE_PUBLIC_KEY,
            secret_key=settings.LANGFUSE_SECRET_KEY,
            host=settings.LANGFUSE_HOST,
        )
        logger.info("Langfuse tracing client successfully initialized.")
    except Exception as exc:
        logger.warning(f"Could not initialize Langfuse: {exc}. Operating in local tracing mode.")


class TelemetryTracer:
    """Manages distributed spans, agent profiling, and cost estimation."""

    def trace_agent_execution(
        self,
        agent_name: str,
        project_id: str,
        workflow_id: str,
        input_data: Dict[str, Any],
        output_data: Dict[str, Any],
        duration_ms: float,
        tokens_used: int = 1500,
    ) -> None:
        """Records agent telemetry span to Langfuse or structured local audit logger."""
        # Estimated cost model: ~$0.005 per 1k tokens
        estimated_cost_usd = round((tokens_used / 1000.0) * 0.005, 5)

        telemetry_payload = {
            "agent_name": agent_name,
            "project_id": project_id,
            "workflow_id": workflow_id,
            "duration_ms": duration_ms,
            "tokens_used": tokens_used,
            "estimated_cost_usd": estimated_cost_usd,
            "timestamp": time.time(),
        }

        if _langfuse_client:
            try:
                _langfuse_client.trace(
                    name=f"agent_{agent_name.lower()}",
                    session_id=workflow_id,
                    metadata=telemetry_payload,
                    input=input_data,
                    output=output_data,
                )
            except Exception as e:
                logger.warning(f"Failed to record Langfuse span: {e}")

        logger.info(
            f"Telemetry Span: [{agent_name}] {duration_ms}ms | {tokens_used} tokens | ${estimated_cost_usd}"
        )


telemetry_tracer = TelemetryTracer()
