"""4-Tier persistent memory engine with deduplication and semantic retrieval."""

import math
import uuid
from typing import Any, Dict, List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import logger
from app.memory.embeddings import embedding_provider
from app.models.memory_item import MemoryItem
from app.schemas.memory import MemoryCreate, MemoryResponse


class MemoryEngine:
    """Manages Session, Project, Explicit User, and Knowledge memory."""

    async def store_memory(
        self,
        memory_in: MemoryCreate,
        db: AsyncSession,
    ) -> MemoryItem:
        """Stores a memory item with embedding, checking for duplicates first."""
        embedding = await embedding_provider.get_embedding(memory_in.content)

        # Check for near-duplicate memory in the same project/tier
        query = select(MemoryItem).where(MemoryItem.key == memory_in.key)
        if memory_in.project_id:
            query = query.where(MemoryItem.project_id == memory_in.project_id)
        if memory_in.tier:
            query = query.where(MemoryItem.tier == memory_in.tier)

        existing_res = await db.execute(query)
        existing_item = existing_res.scalar_one_or_none()

        if existing_item:
            # Update existing memory rather than duplicating
            existing_item.content = memory_in.content
            existing_item.embedding = embedding
            existing_item.metadata_json = memory_in.metadata_json
            existing_item.relevance_score = memory_in.relevance_score
            await db.commit()
            await db.refresh(existing_item)
            logger.info(f"Updated existing memory: {existing_item.id} key={existing_item.key}")
            return existing_item

        # Create new memory item
        item = MemoryItem(
            id=str(uuid.uuid4()),
            project_id=memory_in.project_id,
            user_id=memory_in.user_id,
            tier=memory_in.tier,
            key=memory_in.key,
            content=memory_in.content,
            embedding=embedding,
            metadata_json=memory_in.metadata_json,
            relevance_score=memory_in.relevance_score,
        )
        db.add(item)
        await db.commit()
        await db.refresh(item)
        logger.info(f"Stored new memory: {item.id} tier={item.tier}")
        return item

    async def search_memory(
        self,
        query: str,
        db: AsyncSession,
        project_id: Optional[str] = None,
        tier: Optional[str] = None,
        top_k: int = 5,
        min_similarity: float = 0.4,
    ) -> List[MemoryResponse]:
        """Performs semantic vector search over stored memory items."""
        query_vec = await embedding_provider.get_embedding(query)

        stmt = select(MemoryItem)
        if project_id:
            stmt = stmt.where(MemoryItem.project_id == project_id)
        if tier:
            stmt = stmt.where(MemoryItem.tier == tier)

        result = await db.execute(stmt)
        all_items = result.scalars().all()

        scored_items: List[tuple] = []
        for item in all_items:
            sim = self._cosine_similarity(query_vec, item.embedding)
            if sim >= min_similarity:
                scored_items.append((sim, item))

        # Sort by similarity descending
        scored_items.sort(key=lambda x: x[0], reverse=True)

        responses: List[MemoryResponse] = []
        for sim, item in scored_items[:top_k]:
            responses.append(
                MemoryResponse(
                    id=item.id,
                    project_id=item.project_id,
                    user_id=item.user_id,
                    tier=item.tier,
                    key=item.key,
                    content=item.content,
                    similarity=round(sim, 4),
                    metadata_json=item.metadata_json,
                    relevance_score=item.relevance_score,
                    created_at=item.created_at,
                )
            )
        return responses

    def _cosine_similarity(self, vec_a: List[float], vec_b: List[float]) -> float:
        """Computes cosine similarity between two normalized vectors."""
        if not vec_a or not vec_b or len(vec_a) != len(vec_b):
            return 0.0
        dot = sum(a * b for a, b in zip(vec_a, vec_b))
        norm_a = math.sqrt(sum(a * a for a in vec_a))
        norm_b = math.sqrt(sum(b * b for b in vec_b))
        if norm_a == 0.0 or norm_b == 0.0:
            return 0.0
        return max(0.0, min(1.0, dot / (norm_a * norm_b)))


memory_engine = MemoryEngine()
