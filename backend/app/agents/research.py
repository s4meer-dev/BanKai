"""Agent 2: Research Agent."""

from typing import Any, Dict, List, Optional
from app.agents.base import BaseAgent
from app.research.engine import research_engine


class ResearchAgent(BaseAgent):
    agent_name = "ResearchAgent"
    role_description = "Conducts internet research, extracts source metadata, and formulates cited factual claims."
    system_prompt = (
        "You are the Research Specialist of BAN KAI. Your role is to scour empirical sources, "
        "extract clean verified content, avoid hallucination, record exact citations, and isolate atomic claims."
    )

    async def _run(
        self,
        project_id: str,
        workflow_id: str,
        input_data: Dict[str, Any],
        task_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        queries: List[str] = input_data.get("research_queries", [])
        if not queries:
            objective = input_data.get("objective", "market analysis")
            queries = [f"{objective} industry research facts benchmarks 2026"]

        db_session = input_data.get("db")
        research_output = await research_engine.execute_research(
            project_id=project_id,
            workflow_id=workflow_id,
            queries=queries,
            db=db_session,
            task_id=task_id,
        )

        return {
            "sources": research_output["sources"],
            "claims": research_output["claims"],
            "source_count": research_output["source_count"],
            "claim_count": research_output["claim_count"],
        }


research_agent = ResearchAgent()

