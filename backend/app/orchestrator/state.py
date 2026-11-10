"""Typed shared state schema for LangGraph multi-agent workflow."""

from typing import Any, Dict, List, Optional
from typing_extensions import TypedDict


class AgentState(TypedDict, total=False):
    """The central typed state passed across all LangGraph nodes."""

    # Project & Workflow Identifiers
    project_id: str
    workflow_id: str
    user_id: str
    objective: str
    domain: str  # academic | business | market | technical | data | general
    depth: str  # quick | standard | deep

    # Orchestrator Task Decomposition
    subtasks: List[Dict[str, Any]]
    current_task_id: Optional[str]
    active_agent: Optional[str]
    iteration_count: int
    max_iterations: int

    # Information Gathering & Extraction
    research_queries: List[str]
    sources: List[Dict[str, Any]]
    claims: List[Dict[str, Any]]

    # Specialized Agent Outputs
    market_analysis: Dict[str, Any]
    technical_analysis: Dict[str, Any]
    data_analysis: Dict[str, Any]

    # Verification & Quality Ledger
    verification_results: List[Dict[str, Any]]
    research_quality_score: float
    disputed_claims: List[Dict[str, Any]]

    # Strategy & Execution Planning
    recommendations: List[Dict[str, Any]]
    execution_plans: List[Dict[str, Any]]
    execution_results: List[Dict[str, Any]]
    generated_artifacts: List[Dict[str, Any]]

    # Human-in-the-Loop Approval Gate
    requires_human_approval: bool
    is_approved: bool
    approval_comments: Optional[str]

    # Memory Updates
    memory_updates: List[Dict[str, Any]]

    # Final Report & Status
    final_report: Dict[str, Any]
    workflow_status: str  # PENDING | RUNNING | WAITING_FOR_APPROVAL | COMPLETED | FAILED
    error: Optional[str]

