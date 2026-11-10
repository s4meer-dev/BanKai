"""Async database session and engine management."""

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from app.core.config import settings
from app.core.logging import logger
from app.db.base import Base

# Determine target database connection string
db_url = settings.DATABASE_URL
if settings.USE_SQLITE_FALLBACK:
    # Use SQLite for local development or testing when postgres is not explicitly forced
    db_url = settings.SQLITE_FALLBACK_URL

# Create async engine
engine: AsyncEngine = create_async_engine(
    db_url,
    echo=False,
    future=True,
    pool_pre_ping=True,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency for yielding database sessions."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception as exc:
            await session.rollback()
            raise exc
        finally:
            await session.close()


async def init_db() -> None:
    """Initializes tables for local/development mode."""
    # Import all models to ensure they are registered with Base.metadata
    from app.models import (  # noqa: F401
        User,
        Project,
        Task,
        AgentRun,
        ResearchSource,
        ResearchClaim,
        VerificationResult,
        Recommendation,
        ExecutionPlan,
        ExecutionAction,
        MemoryItem,
        Artifact,
        AuditLog,
    )
    
    async with engine.begin() as conn:
        logger.info(f"Initializing database schemas with engine: {engine.url.drivername}")
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database schemas verified.")

