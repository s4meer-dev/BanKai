"""Project workspace API endpoints."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.artifact import Artifact
from app.models.project import Project
from app.models.recommendation import Recommendation
from app.models.research_claim import ResearchClaim
from app.models.task import Task
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectDetailResponse, ProjectResponse, ProjectUpdate

router = APIRouter()


@router.get("", response_model=List[ProjectResponse])
async def list_projects(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Lists all projects owned by the user."""
    result = await db.execute(
        select(Project)
        .where(Project.user_id == current_user.id)
        .order_by(Project.created_at.desc())
    )
    return result.scalars().all()


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_in: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Creates a new research project workspace."""
    project = Project(
        user_id=current_user.id,
        title=project_in.title,
        description=project_in.description,
        settings=project_in.settings,
        status="active",
    )
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return project


@router.get("/{project_id}", response_model=ProjectDetailResponse)
async def get_project(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieves detailed project statistics."""
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.user_id == current_user.id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")

    # Calculate counts
    task_count_q = await db.execute(
        select(func.count(Task.id)).where(Task.project_id == project_id)
    )
    claim_count_q = await db.execute(
        select(func.count(ResearchClaim.id)).where(ResearchClaim.project_id == project_id)
    )
    rec_count_q = await db.execute(
        select(func.count(Recommendation.id)).where(Recommendation.project_id == project_id)
    )
    art_count_q = await db.execute(
        select(func.count(Artifact.id)).where(Artifact.project_id == project_id)
    )

    return ProjectDetailResponse(
        id=project.id,
        user_id=project.user_id,
        title=project.title,
        description=project.description,
        status=project.status,
        settings=project.settings,
        created_at=project.created_at,
        updated_at=project.updated_at,
        task_count=task_count_q.scalar() or 0,
        claim_count=claim_count_q.scalar() or 0,
        recommendation_count=rec_count_q.scalar() or 0,
        artifact_count=art_count_q.scalar() or 0,
    )


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    project_update: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Updates an existing project."""
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.user_id == current_user.id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")

    if project_update.title is not None:
        project.title = project_update.title
    if project_update.description is not None:
        project.description = project_update.description
    if project_update.status is not None:
        project.status = project_update.status
    if project_update.settings is not None:
        project.settings = project_update.settings

    await db.commit()
    await db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Deletes a project and all associated cascades."""
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.user_id == current_user.id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")

    await db.delete(project)
    await db.commit()
    return None
