"""Research Claim database model."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import DateTime, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class ResearchClaim(Base):
    __tablename__ = "research_claims"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    project_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("projects.id", ondelete="CASCADE"), index=True, nullable=False
    )
    task_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("tasks.id", ondelete="SET NULL"), index=True, nullable=True
    )
    source_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("research_sources.id", ondelete="CASCADE"), index=True, nullable=False
    )
    claim_text: Mapped[str] = mapped_column(Text, nullable=False)
    evidence_excerpt: Mapped[str] = mapped_column(Text, nullable=False)
    confidence_score: Mapped[float] = mapped_column(Float, default=0.5, nullable=False)
    # Verification status: UNVERIFIED | VERIFIED | PARTIALLY_VERIFIED | DISPUTED | INSUFFICIENT_EVIDENCE
    verification_status: Mapped[str] = mapped_column(
        String(50), default="UNVERIFIED", index=True, nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relationships
    project = relationship("Project", back_populates="claims")
    task = relationship("Task", back_populates="claims")
    source = relationship("ResearchSource", back_populates="claims")
    verification_results = relationship(
        "VerificationResult", back_populates="claim", cascade="all, delete-orphan"
    )

