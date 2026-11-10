"""Research API endpoints for claims, sources, and querying."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.project import Project
from app.models.research_claim import ResearchClaim
from app.models.research_source import ResearchSource
from app.models.user import User
from app.research.engine import research_engine
from app.schemas.research import (
    ResearchClaimResponse,
    ResearchSourceResponse,
    SearchQuery,
    SearchResult,
)

router = APIRouter()


@router.post("/search", response_model=List[SearchResult])
async def search_web(
    query_in: SearchQuery,
    current_user: User = Depends(get_current_user),
):
    """Direct search query endpoint using configured search provider."""
    results = await research_engine.search_provider.search(
        query_in.query, num_results=query_in.num_results
    )
    return results


@router.get("/claims", response_model=List[ResearchClaimResponse])
async def list_claims(
    project_id: str = Query(...),
    status_filter: Optional[str] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Lists research claims extracted for a project."""
    stmt = select(ResearchClaim).where(ResearchClaim.project_id == project_id)
    if status_filter:
        stmt = stmt.where(ResearchClaim.verification_status == status_filter)
    stmt = stmt.order_by(ResearchClaim.created_at.desc())

    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/sources", response_model=List[ResearchSourceResponse])
async def list_sources(
    project_id: str = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Lists all web sources registered in a project."""
    stmt = select(ResearchSource).where(ResearchSource.project_id == project_id).order_by(ResearchSource.created_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()
