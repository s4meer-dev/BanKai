"""Agent 7: Strategy Agent & Execution Planner."""

import uuid
from typing import Any, Dict, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.base import BaseAgent
from app.models.execution_plan import ExecutionPlan
from app.models.recommendation import Recommendation
from app.orchestrator.event_bus import event_bus


class StrategyAgent(BaseAgent):
    agent_name = "StrategyAgent"
    role_description = "Formulates strategic recommendations, execution plans, and risk assessments."
    system_prompt = (
        "You are the Chief Strategy Officer of BAN KAI. You synthesize multi-agent findings, "
        "formulate concrete recommendations directly linked to verified claims, assess operational risk levels, "
        "and draft actionable execution plans."
    )

    async def _run(
        self,
        project_id: str,
        workflow_id: str,
        input_data: Dict[str, Any],
        task_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        objective = input_data.get("objective", "")
        claims: List[Dict[str, Any]] = input_data.get("claims", [])
        rqs: float = input_data.get("research_quality_score", 85.0)
        db: Optional[AsyncSession] = input_data.get("db")

        # Extract top supporting claim IDs
        supporting_claim_ids = [c["id"] for c in claims[:4] if "id" in c]

        recommendations_data: List[Dict[str, Any]] = [
            {
                "id": str(uuid.uuid4()),
                "title": f"Execute Phased Market Launch for {objective}",
                "details": (
                    "Deploy a high-leverage beachhead targeting developer and enterprise pilot groups. "
                    "Leverage modular open-source interfaces to accelerate initial adoption while securing recurring SaaS contracts."
                ),
                "risk_level": "LOW",
                "priority": "HIGH",
                "supporting_claim_ids": supporting_claim_ids,
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Establish High-Assurance Evidence-to-Action Ledger Integrations",
                "details": (
                    "Mandate that all external data feeds, API interactions, and analytics outputs "
                    "are cryptographically hashed and linked to source citations."
                ),
                "risk_level": "LOW",
                "priority": "CRITICAL",
                "supporting_claim_ids": supporting_claim_ids,
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Automate Multi-Tier Deliverable Artifact Generation",
                "details": (
                    "Trigger automated generation of executive presentations, financial Excel spreadsheets, "
                    "and comprehensive PDF reports with verified charts."
                ),
                "risk_level": "MEDIUM",
                "priority": "MEDIUM",
                "supporting_claim_ids": supporting_claim_ids,
            },
        ]

        # Generate corresponding execution plans
        execution_plans: List[Dict[str, Any]] = []
        requires_human_approval = False

        for rec in recommendations_data:
            plan_id = str(uuid.uuid4())
            is_high_risk = rec["risk_level"] == "HIGH"
            if is_high_risk:
                requires_human_approval = True

            plan_dict = {
                "id": plan_id,
                "recommendation_id": rec["id"],
                "title": f"Generate Deliverables: {rec['title']}",
                "action_type": "generate_artifacts",
                "params": {
                    "document_types": ["xlsx", "docx", "pptx", "pdf"],
                    "project_title": objective,
                    "target_dir": "./storage/artifacts",
                },
                "risk_level": rec["risk_level"],
                "approval_status": "PENDING" if is_high_risk else "AUTO_APPROVED",
            }
            execution_plans.append(plan_dict)

            # Persist recommendation and execution plan to DB if session provided
            if db:
                db_rec = Recommendation(
                    id=rec["id"],
                    project_id=project_id,
                    title=rec["title"],
                    details=rec["details"],
                    risk_level=rec["risk_level"],
                    priority=rec["priority"],
                    supporting_claim_ids=rec["supporting_claim_ids"],
                )
                db.add(db_rec)
                await db.flush()

                db_plan = ExecutionPlan(
                    id=plan_dict["id"],
                    project_id=project_id,
                    recommendation_id=rec["id"],
                    title=plan_dict["title"],
                    action_type=plan_dict["action_type"],
                    params=plan_dict["params"],
                    risk_level=plan_dict["risk_level"],
                    approval_status=plan_dict["approval_status"],
                )
                db.add(db_plan)

        if db:
            await db.commit()

        if requires_human_approval:
            await event_bus.publish(
                event_type="approval.required",
                project_id=project_id,
                workflow_id=workflow_id,
                task_id=task_id,
                agent_id=self.agent_name,
                payload={
                    "pending_plans": [p for p in execution_plans if p["risk_level"] == "HIGH"]
                },
            )

        return {
            "recommendations": recommendations_data,
            "execution_plans": execution_plans,
            "requires_human_approval": requires_human_approval,
        }


strategy_agent = StrategyAgent()

