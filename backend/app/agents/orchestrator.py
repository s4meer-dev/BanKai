"""Agent 1: Orchestrator Agent."""

import uuid
from typing import Any, Dict, List, Optional
from app.agents.base import BaseAgent


class OrchestratorAgent(BaseAgent):
    agent_name = "OrchestratorAgent"
    role_description = "Understands objectives, decomposes tasks, assigns agents, and coordinates workflow."
    system_prompt = (
        "You are the Principal Orchestrator of BAN KAI. Your role is to deterministically analyze "
        "user objectives, gauge complexity, decompose goals into structured subtasks, assign specialized "
        "agents, and ensure zero unverified or circular execution loops."
    )

    async def _run(
        self,
        project_id: str,
        workflow_id: str,
        input_data: Dict[str, Any],
        task_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        objective = input_data.get("objective", "")
        domain = input_data.get("domain", "general")
        depth = input_data.get("depth", "standard")

        # Deterministic decomposition based on objective and domain
        subtasks: List[Dict[str, Any]] = [
            {
                "id": str(uuid.uuid4()),
                "title": f"Deep Web Research & Evidence Gathering for '{objective[:40]}...'",
                "assigned_agent": "ResearchAgent",
                "priority": "HIGH",
                "status": "pending",
                "dependencies": [],
            },
            {
                "id": str(uuid.uuid4()),
                "title": f"Market Dynamics & Competitive Positioning Analysis",
                "assigned_agent": "MarketIntelligenceAgent",
                "priority": "MEDIUM",
                "status": "pending",
                "dependencies": ["ResearchAgent"],
            },
            {
                "id": str(uuid.uuid4()),
                "title": f"Technical Feasibility & Architecture Evaluation",
                "assigned_agent": "TechnicalResearchAgent",
                "priority": "MEDIUM",
                "status": "pending",
                "dependencies": ["ResearchAgent"],
            },
            {
                "id": str(uuid.uuid4()),
                "title": f"Quantitative Metrics & Feasibility Financial Modeling",
                "assigned_agent": "DataAnalystAgent",
                "priority": "MEDIUM",
                "status": "pending",
                "dependencies": ["MarketIntelligenceAgent", "TechnicalResearchAgent"],
            },
            {
                "id": str(uuid.uuid4()),
                "title": f"Factual Claim Verification & Contradiction Resolution",
                "assigned_agent": "VerificationAgent",
                "priority": "HIGH",
                "status": "pending",
                "dependencies": ["ResearchAgent", "DataAnalystAgent"],
            },
            {
                "id": str(uuid.uuid4()),
                "title": f"Strategic Action Plan & Risk Matrix Formulation",
                "assigned_agent": "StrategyAgent",
                "priority": "HIGH",
                "status": "pending",
                "dependencies": ["VerificationAgent"],
            },
            {
                "id": str(uuid.uuid4()),
                "title": f"Execution & Deliverable Artifact Generation",
                "assigned_agent": "ExecutionAgent",
                "priority": "HIGH",
                "status": "pending",
                "dependencies": ["StrategyAgent"],
            },
        ]

        # Generate targeted multi-hop search queries
        research_queries = [
            f"{objective} comprehensive market overview industry trends 2026",
            f"{objective} technical architecture benchmarks best practices",
            f"{objective} competitive analysis market share players pricing",
            f"{objective} feasibility risks limitations and compliance",
        ]

        return {
            "objective": objective,
            "domain": domain,
            "depth": depth,
            "subtasks": subtasks,
            "research_queries": research_queries,
            "workflow_status": "RUNNING",
        }


orchestrator_agent = OrchestratorAgent()

