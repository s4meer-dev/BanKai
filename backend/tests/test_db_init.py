"""Test database model creation and session initialization."""

import pytest
from app.db.session import engine, init_db, AsyncSessionLocal
from app.models.user import User
from app.models.project import Project
from sqlalchemy import select


@pytest.mark.asyncio
async def test_database_initialization():
    # Run schema creation
    await init_db()

    # Create a test session and perform a query
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User))
        users = result.scalars().all()
        assert isinstance(users, list)
