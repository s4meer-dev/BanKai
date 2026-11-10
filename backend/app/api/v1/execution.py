"""Execution engine, sandbox, and artifact management endpoints."""

import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.execution.sandbox import sandbox
from app.models.artifact import Artifact
from app.models.execution_plan import ExecutionPlan
from app.models.user import User
from app.schemas.execution import (
    ArtifactResponse,
    CodeExecutionRequest,
    CodeExecutionResponse,
    ExecutionPlanResponse,
)

router = APIRouter()


@router.post("/sandbox", response_model=CodeExecutionResponse)
async def execute_sandboxed_code(
    request: CodeExecutionRequest,
    current_user: User = Depends(get_current_user),
):
    """Executes Python code in an isolated subprocess with AST safety gating."""
    response = await sandbox.run_code(
        code=request.code,
        timeout_seconds=request.timeout_seconds,
        project_id=request.project_id,
    )
    return response


@router.get("/artifacts", response_model=List[ArtifactResponse])
async def list_artifacts(
    project_id: str = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Lists all artifacts generated for a project."""
    stmt = select(Artifact).where(Artifact.project_id == project_id).order_by(Artifact.created_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/artifacts/{artifact_id}/download")
async def download_artifact(
    artifact_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Downloads a generated artifact file."""
    stmt = select(Artifact).where(Artifact.id == artifact_id)
    result = await db.execute(stmt)
    artifact = result.scalar_one_or_none()
    if not artifact or not os.path.exists(artifact.file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artifact file not found.")

    return FileResponse(
        path=artifact.file_path,
        filename=artifact.name,
        media_type="application/octet-stream",
    )


@router.get("/plans", response_model=List[ExecutionPlanResponse])
async def list_execution_plans(
    project_id: str = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Lists execution plans for a project."""
    stmt = select(ExecutionPlan).where(ExecutionPlan.project_id == project_id).order_by(ExecutionPlan.created_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()
