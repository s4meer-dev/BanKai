"""Task schemas."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    assigned_agent: str
    priority: str = "medium"
    dependencies: List[str] = Field(default_factory=list)
    input_data: Dict[str, Any] = Field(default_factory=dict)


class TaskCreate(TaskBase):
    project_id: str


class TaskUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    result_summary: Optional[Dict[str, Any]] = None


class TaskResponse(TaskBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    status: str
    result_summary: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
