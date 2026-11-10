"""Verification Result database model."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import DateTime, ForeignKey, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class VerificationResult(Base):
    __tablename__ = "verification_results"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    claim_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("research_claims.id", ondelete="CASCADE"), index=True, nullable=False
    )
    status: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # VERIFIED | PARTIALLY_VERIFIED | DISPUTED | UNVERIFIED | INSUFFICIENT_EVIDENCE
    rationale: Mapped[str] = mapped_column(Text, nullable=False)
    corroborated_sources: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    conflicting_sources: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    verified_by_agent: Mapped[str] = mapped_column(
        String(100), default="VerificationAgent", nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relationships
    claim = relationship("ResearchClaim", back_populates="verification_results")

