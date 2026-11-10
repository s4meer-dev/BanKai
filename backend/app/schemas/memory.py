"""Memory engine schemas."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class MemoryCreate(BaseModel):
    project_id: Optional[str] = None
    user_id: Optional[str] = None
    tier: str = "project"  # session | project | user | knowledge
    key: str
    content: str
    metadata_json: Dict[str, Any] = Field(default_factory=dict)
    relevance_score: float = 1.0


class MemoryQuery(BaseModel):
    query: str
    project_id: Optional[str] = None
    tier: Optional[str] = None
    top_k: int = 5
    min_similarity: float = 0.2


class MemoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: Optional[str] = None
    user_id: Optional[str] = None
    tier: str
    key: str
    content: str
    similarity: Optional[float] = None
    metadata_json: Dict[str, Any]
    relevance_score: float
    created_at: datetime
