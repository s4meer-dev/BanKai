"""Integration tests for the compiled LangGraph workflow graph."""

import pytest
from app.orchestrator.graph import workflow_graph
from app.orchestrator.state import AgentState


@pytest.mark.asyncio
async def test_full_langgraph_workflow_execution():
    """Validates that the complete multi-agent LangGraph workflow transitions and compiles successfully."""
    initial_state: AgentState = {
        "project_id": "test_e2e_project",
        "workflow_id": "test_e2e_workflow",
        "user_id": "test_user_id",
        "objective": "Design an Autonomous Research and Execution Platform for 2026",
        "domain": "technical",
        "depth": "standard",
        "subtasks": [],
        "iteration_count": 0,
        "max_iterations": 10,
        "research_queries": [],
        "sources": [],
        "claims": [],
        "market_analysis": {},
        "technical_analysis": {},
        "data_analysis": {},
        "verification_results": [],
        "research_quality_score": 0.0,
        "disputed_claims": [],
        "recommendations": [],
        "execution_plans": [],
        "execution_results": [],
        "generated_artifacts": [],
        "requires_human_approval": False,
        "is_approved": True,  # Auto-approved for test run
        "memory_updates": [],
        "workflow_status": "PENDING",
    }

    # Execute compiled graph
    final_state = await workflow_graph.ainvoke(initial_state)

    assert final_state["workflow_status"] == "COMPLETED"
    assert len(final_state["subtasks"]) > 0
    assert len(final_state["sources"]) > 0
    assert len(final_state["claims"]) > 0
    assert "swot_analysis" in final_state["market_analysis"]
    assert "recommended_stack" in final_state["technical_analysis"]
    assert "financial_model" in final_state["data_analysis"]
    assert final_state["research_quality_score"] > 50.0
    assert len(final_state["recommendations"]) > 0
    assert len(final_state["generated_artifacts"]) >= 4
    assert "final_report" in final_state
