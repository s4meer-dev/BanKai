"""Execution engine and approval schemas."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class ExecutionApprovalRequest(BaseModel):
    approved: bool
    comments: Optional[str] = None


class CodeExecutionRequest(BaseModel):
    code: str
    timeout_seconds: Optional[int] = 30
    project_id: Optional[str] = None


class CodeExecutionResponse(BaseModel):
    status: str  # SUCCESS | FAILED | SECURITY_VIOLATION
    stdout: str
    stderr: str
    exit_code: int
    duration_ms: float
    generated_files: List[str] = []


class ArtifactResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    execution_action_id: Optional[str] = None
    name: str
    file_path: str
    file_type: str
    file_size_bytes: int
    download_url: Optional[str] = None
    created_at: datetime


class ExecutionPlanResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    recommendation_id: Optional[str] = None
    title: str
    action_type: str
    params: Dict[str, Any]
    risk_level: str
    approval_status: str
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    created_at: datetime
