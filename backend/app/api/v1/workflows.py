"""Workflow execution and LangGraph orchestration endpoints."""

import asyncio
import uuid
from typing import Any, Dict
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import settings
from app.db.session import AsyncSessionLocal, get_db
from app.models.artifact import Artifact
from app.models.execution_plan import ExecutionPlan
from app.models.project import Project
from app.models.recommendation import Recommendation
from app.models.research_claim import ResearchClaim
from app.models.research_source import ResearchSource
from app.models.task import Task
from app.models.user import User
from app.memory.engine import memory_engine
from app.schemas.memory import MemoryCreate
from app.orchestrator.event_bus import event_bus
from app.orchestrator.graph import workflow_graph
from app.orchestrator.state import AgentState
from app.schemas.execution import ExecutionApprovalRequest
from app.schemas.workflow import WorkflowRunRequest, WorkflowStatusResponse

router = APIRouter()

# Active in-memory workflow state cache
active_workflows: Dict[str, Dict[str, Any]] = {}


async def _run_workflow_background(workflow_id: str, initial_state: AgentState) -> None:
    """Executes the compiled LangGraph workflow in the background and records DB state."""
    async with AsyncSessionLocal() as session:
        initial_state["_db_session"] = session
        project_id = initial_state["project_id"]
        try:
            active_workflows[workflow_id]["status"] = "RUNNING"
            final_state = await workflow_graph.ainvoke(initial_state)

            # Update cache
            active_workflows[workflow_id]["status"] = final_state.get(
                "workflow_status", "COMPLETED"
            )
            active_workflows[workflow_id]["final_state"] = final_state

            # 1. Save created subtasks into the database
            for st in final_state.get("subtasks", []):
                t = Task(
                    id=st.get("id", str(uuid.uuid4())),
                    project_id=project_id,
                    title=st.get("title", "Subtask"),
                    description=f"Auto-decomposed subtask for {st.get('assigned_agent', 'Agent')}",
                    assigned_agent=st.get("assigned_agent", "OrchestratorAgent"),
                    priority=st.get("priority", "medium"),
                    status="completed",
                    dependencies=st.get("dependencies", []),
                )
                session.add(t)

            # 2. Save sources
            created_source_ids = []
            for s in final_state.get("sources", []):
                s_id = s.get("id", str(uuid.uuid4()))
                created_source_ids.append(s_id)
                src_obj = ResearchSource(
                    id=s_id,
                    project_id=project_id,
                    title=s.get("title", "Research Source"),
                    url=s.get("url", "https://bankai.local"),
                    content_hash=s.get("content_hash", uuid.uuid4().hex),
                    reliability_score=s.get("reliability_score", 0.8),
                )
                session.add(src_obj)

            await session.flush()
            default_source_id = created_source_ids[0] if created_source_ids else "src_default"

            # 3. Save claims
            for c in final_state.get("claims", []):
                src_ref = c.get("source_id") or default_source_id
                clm_obj = ResearchClaim(
                    id=c.get("id", str(uuid.uuid4())),
                    project_id=project_id,
                    source_id=src_ref,
                    claim_text=c.get("claim_text", ""),
                    evidence_excerpt=c.get("evidence_excerpt") or c.get("claim_text", "")[:250],
                    confidence_score=c.get("confidence_score", 0.85),
                    verification_status=c.get("verification_status", "VERIFIED"),
                )
                session.add(clm_obj)

            # 4. Save recommendations
            for r in final_state.get("recommendations", []):
                rec_obj = Recommendation(
                    id=r.get("id", str(uuid.uuid4())),
                    project_id=project_id,
                    title=r.get("title", "Strategic Milestone"),
                    details=r.get("details", r.get("description", "Actionable initiative")),
                    priority=r.get("priority", "HIGH"),
                    risk_level=r.get("risk_level", "LOW"),
                    supporting_claim_ids=r.get("supporting_claim_ids", []),
                )
                session.add(rec_obj)

            # 5. Save generated artifacts
            for a in final_state.get("generated_artifacts", []):
                art_obj = Artifact(
                    id=a.get("id", str(uuid.uuid4())),
                    project_id=project_id,
                    name=a.get("name", "Deliverable"),
                    file_type=a.get("file_type", "bin"),
                    file_path=a.get("file_path", ""),
                    file_size_bytes=a.get("file_size_bytes", 1024),
                    download_url=f"/api/v1/execution/artifacts/{a.get('id', 'dl')}/download",
                )
                session.add(art_obj)

            # 6. Save memory items
            for mem in final_state.get("memory_updates", []):
                mem_in = MemoryCreate(
                    tier=mem.get("tier", "knowledge"),
                    key=mem.get("key", f"mem_{uuid.uuid4().hex[:6]}"),
                    content=mem.get("content", ""),
                    project_id=project_id,
                    metadata_json=mem.get("metadata", {}),
                    relevance_score=0.9,
                )
                await memory_engine.store_memory(mem_in, session)

            # 7. Update project status to completed
            proj_res = await session.execute(
                select(Project).where(Project.id == project_id)
            )
            proj_obj = proj_res.scalar_one_or_none()
            if proj_obj:
                proj_obj.status = "completed"

            await session.commit()

            await event_bus.publish(
                event_type="workflow.completed",
                project_id=project_id,
                workflow_id=workflow_id,
                payload={"status": "COMPLETED", "artifacts_count": len(final_state.get("generated_artifacts", []))},
            )
        except Exception as exc:
            active_workflows[workflow_id]["status"] = "FAILED"
            active_workflows[workflow_id]["error"] = str(exc)
            await event_bus.publish(
                event_type="workflow.failed",
                project_id=project_id,
                workflow_id=workflow_id,
                payload={"error": str(exc)},
            )


@router.post("/run", response_model=WorkflowStatusResponse)
async def run_workflow(
    request: WorkflowRunRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Initiates an autonomous multi-agent research and execution workflow."""
    query = select(Project).where(Project.id == request.project_id)
    if current_user.role != "admin" and settings.APP_ENV != "development":
        query = query.where(Project.user_id == current_user.id)
    proj_res = await db.execute(query)
    proj = proj_res.scalar_one_or_none()
    if not proj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")

    workflow_id = str(uuid.uuid4())
    initial_state: AgentState = {
        "project_id": request.project_id,
        "workflow_id": workflow_id,
        "user_id": current_user.id,
        "objective": request.objective,
        "domain": request.domain or "general",
        "depth": request.depth or "standard",
        "subtasks": [],
        "iteration_count": 0,
        "max_iterations": 10,
        "research_queries": [],
        "sources": [],
        "claims": [],
        "market_analysis": {},
        "technical_analysis": {},
        "data_analysis": {},
        "verification_results": [],
        "research_quality_score": 0.0,
        "disputed_claims": [],
        "recommendations": [],
        "execution_plans": [],
        "execution_results": [],
        "generated_artifacts": [],
        "requires_human_approval": False,
        "is_approved": request.auto_approve_low_risk,
        "memory_updates": [],
        "workflow_status": "PENDING",
    }

    active_workflows[workflow_id] = {
        "workflow_id": workflow_id,
        "project_id": request.project_id,
        "objective": request.objective,
        "status": "PENDING",
        "initial_state": initial_state,
    }

    background_tasks.add_task(_run_workflow_background, workflow_id, initial_state)

    return WorkflowStatusResponse(
        workflow_id=workflow_id,
        project_id=request.project_id,
        objective=request.objective,
        status="PENDING",
        current_agent="OrchestratorAgent",
    )


@router.get("/{workflow_id}", response_model=WorkflowStatusResponse)
async def get_workflow_status(
    workflow_id: str,
    current_user: User = Depends(get_current_user),
):
    """Retrieves current execution status of a workflow."""
    wf = active_workflows.get(workflow_id)
    if not wf:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workflow not found.")

    final_state = wf.get("final_state", {})
    return WorkflowStatusResponse(
        workflow_id=workflow_id,
        project_id=wf["project_id"],
        objective=wf["objective"],
        status=wf.get("status", "RUNNING"),
        current_agent="ExecutionAgent" if wf.get("status") == "COMPLETED" else "OrchestratorAgent",
        subtasks_total=len(final_state.get("subtasks", [])),
        subtasks_completed=len(final_state.get("subtasks", [])),
        sources_count=len(final_state.get("sources", [])),
        claims_count=len(final_state.get("claims", [])),
        research_quality_score=final_state.get("research_quality_score", 0.0),
        pending_approvals=[
            p for p in final_state.get("execution_plans", []) if p.get("approval_status") == "PENDING"
        ],
        error=wf.get("error"),
    )


@router.post("/{workflow_id}/approve")
async def approve_workflow_plan(
    workflow_id: str,
    approval: ExecutionApprovalRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Approves pending execution plans to resume execution."""
    wf = active_workflows.get(workflow_id)
    if not wf:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workflow not found.")

    final_state = wf.get("final_state")
    if not final_state:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Workflow is not awaiting approval.")

    # Update plans in state and DB
    for p in final_state.get("execution_plans", []):
        if p.get("approval_status") == "PENDING":
            p["approval_status"] = "APPROVED" if approval.approved else "REJECTED"
            plan_db = await db.execute(select(ExecutionPlan).where(ExecutionPlan.id == p["id"]))
            db_rec = plan_db.scalar_one_or_none()
            if db_rec:
                db_rec.approval_status = p["approval_status"]
                db_rec.approved_by = current_user.email
    await db.commit()

    return {"status": "approval_registered", "approved": approval.approved}

