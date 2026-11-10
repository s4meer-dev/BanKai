"""Research engine and verification schemas."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class SearchQuery(BaseModel):
    query: str
    num_results: int = 5
    provider: Optional[str] = None


class SearchResult(BaseModel):
    title: str
    url: str
    snippet: str
    publisher: Optional[str] = None
    published_date: Optional[str] = None
    reliability_score: float = 0.5


class ResearchSourceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    url: str
    title: str
    publisher: Optional[str] = None
    published_date: Optional[str] = None
    content_hash: str
    summary: Optional[str] = None
    reliability_score: float
    created_at: datetime


class ResearchClaimResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    task_id: Optional[str] = None
    source_id: str
    claim_text: str
    evidence_excerpt: str
    confidence_score: float
    verification_status: str
    created_at: datetime


class VerificationResultResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    claim_id: str
    status: str
    rationale: str
    corroborated_sources: List[str]
    conflicting_sources: List[str]
    verified_by_agent: str
    created_at: datetime
