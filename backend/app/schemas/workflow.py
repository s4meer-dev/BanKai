"""Workflow and real-time streaming schemas."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class WorkflowRunRequest(BaseModel):
    project_id: str
    objective: str = Field(..., min_length=3)
    domain: Optional[str] = "general"
    depth: Optional[str] = "standard"  # quick | standard | deep
    auto_approve_low_risk: bool = True


class WorkflowEvent(BaseModel):
    event_id: str
    event_type: str  # agent.started | agent.progress | agent.completed | research.source_found | etc.
    project_id: str
    workflow_id: str
    task_id: Optional[str] = None
    agent_id: Optional[str] = None
    timestamp: str
    payload: Dict[str, Any] = Field(default_factory=dict)


class WorkflowStatusResponse(BaseModel):
    workflow_id: str
    project_id: str
    objective: str
    status: str  # PENDING | RUNNING | WAITING_FOR_APPROVAL | COMPLETED | FAILED
    current_agent: Optional[str] = None
    subtasks_total: int = 0
    subtasks_completed: int = 0
    sources_count: int = 0
    claims_count: int = 0
    research_quality_score: float = 0.0
    pending_approvals: List[Dict[str, Any]] = []
    error: Optional[str] = None

