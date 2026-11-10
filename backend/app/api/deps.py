"""API dependencies for authentication, database session, and permissions."""

from typing import AsyncGenerator, Optional
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.user import User

security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Authenticates the user from JWT Bearer token or returns a default local workspace user."""
    if credentials:
        payload = decode_access_token(credentials.credentials)
        if payload and payload.get("sub"):
            user_id = payload["sub"]
            result = await db.execute(select(User).where(User.id == user_id))
            user = result.scalar_one_or_none()
            if user:
                return user

    # Development fallback: ensure a default admin user exists for seamless local testing
    result = await db.execute(select(User).where(User.email == "admin@bankai.ai"))
    default_user = result.scalar_one_or_none()
    if not default_user:
        from app.core.security import get_password_hash
        default_user = User(
            email="admin@bankai.ai",
            hashed_password=get_password_hash("bankai_admin_2026!"),
            full_name="BanKai Admin",
            role="admin",
            is_active=True,
        )
        db.add(default_user)
        await db.commit()
        await db.refresh(default_user)
    return default_user

