"""Evidence-to-Action Ledger (EAL) schemas."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class EALTraceNode(BaseModel):
    id: str
    type: str  # objective | task | claim | source | verification | recommendation | plan | action | artifact
    title: str
    subtitle: Optional[str] = None
    status: Optional[str] = None
    data: Dict[str, Any] = {}


class EALTraceEdge(BaseModel):
    id: str
    source: str
    target: str
    relation: str  # decomposed_to | cites | verifies | informs | plans | executes | produces


class EALGraphResponse(BaseModel):
    project_id: str
    nodes: List[EALTraceNode]
    edges: List[EALTraceEdge]
    quality_score: float
    total_claims: int
    verified_claims: int
    contradicted_claims: int


class EALQualityScoreResponse(BaseModel):
    project_id: str
    overall_score: float  # 0.0 to 100.0
    citation_coverage: float  # 0.0 to 1.0
    source_reliability_avg: float  # 0.0 to 1.0
    verification_rate: float  # 0.0 to 1.0
    contradiction_resolution_rate: float  # 0.0 to 1.0
    recency_score: float  # 0.0 to 1.0
    scoring_notes: List[str]
