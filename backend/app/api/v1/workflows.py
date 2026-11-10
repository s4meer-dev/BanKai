"""Workflow execution and LangGraph orchestration endpoints."""

import asyncio
import uuid
from typing import Any, Dict
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import AsyncSessionLocal, get_db
from app.models.execution_plan import ExecutionPlan
from app.models.project import Project
from app.models.task import Task
from app.models.user import User
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
        try:
            active_workflows[workflow_id]["status"] = "RUNNING"
            final_state = await workflow_graph.ainvoke(initial_state)

            # Update cache
            active_workflows[workflow_id]["status"] = final_state.get(
                "workflow_status", "COMPLETED"
            )
            active_workflows[workflow_id]["final_state"] = final_state

            # Save created subtasks into the database
            for st in final_state.get("subtasks", []):
                t = Task(
                    id=st["id"],
                    project_id=initial_state["project_id"],
                    title=st["title"],
                    description=f"Auto-decomposed subtask for {st['assigned_agent']}",
                    assigned_agent=st["assigned_agent"],
                    priority=st.get("priority", "medium"),
                    status="completed",
                    dependencies=st.get("dependencies", []),
                )
                session.add(t)

            await session.commit()
        except Exception as exc:
            active_workflows[workflow_id]["status"] = "FAILED"
            active_workflows[workflow_id]["error"] = str(exc)
            await event_bus.publish(
                event_type="workflow.failed",
                project_id=initial_state["project_id"],
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
    proj = await db.execute(
        select(Project).where(Project.id == request.project_id, Project.user_id == current_user.id)
    )
    if not proj.scalar_one_or_none():
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
