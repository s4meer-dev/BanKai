"""Memory management and semantic retrieval API endpoints."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.memory.engine import memory_engine
from app.models.memory_item import MemoryItem
from app.models.user import User
from app.schemas.memory import MemoryCreate, MemoryQuery, MemoryResponse

router = APIRouter()


@router.post("", response_model=MemoryResponse, status_code=status.HTTP_201_CREATED)
async def create_memory(
    memory_in: MemoryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Stores a new memory item in the designated tier."""
    if not memory_in.user_id:
        memory_in.user_id = current_user.id
    item = await memory_engine.store_memory(memory_in, db)
    return item


@router.post("/query", response_model=List[MemoryResponse])
async def search_memory(
    query_in: MemoryQuery,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Performs semantic vector search across persistent memory."""
    results = await memory_engine.search_memory(
        query=query_in.query,
        db=db,
        project_id=query_in.project_id,
        tier=query_in.tier,
        top_k=query_in.top_k,
        min_similarity=query_in.min_similarity,
    )
    return results


@router.get("", response_model=List[MemoryResponse])
async def list_memories(
    project_id: Optional[str] = Query(None),
    tier: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Lists stored memories filtered by project or tier."""
    stmt = select(MemoryItem)
    if project_id:
        stmt = stmt.where(MemoryItem.project_id == project_id)
    if tier:
        stmt = stmt.where(MemoryItem.tier == tier)
    stmt = stmt.order_by(MemoryItem.created_at.desc())

    result = await db.execute(stmt)
    return result.scalars().all()


@router.delete("/{memory_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_memory(
    memory_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Deletes a specific memory item."""
    result = await db.execute(select(MemoryItem).where(MemoryItem.id == memory_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Memory not found.")

    await db.delete(item)
    await db.commit()
    return None

