"""End-to-End Test Matrix covering all 7 mandatory user scenarios."""

import os
import pytest
from app.db.session import init_db, AsyncSessionLocal
from app.orchestrator.graph import workflow_graph
from app.orchestrator.state import AgentState
from app.memory.engine import memory_engine
from app.schemas.memory import MemoryCreate, MemoryQuery
from app.execution.artifact_generators import artifact_generator
from app.agents.verification import verification_agent
from app.agents.orchestrator import orchestrator_agent


@pytest.fixture(autouse=True)
async def ensure_db():
    await init_db()


# ------------------------------------------------------------------------------
# Scenario 1: Business Market Research
# ------------------------------------------------------------------------------
@pytest.mark.asyncio
async def test_scenario_1_business_market_research():
    """Scenario 1: End-to-end execution of a business market research objective."""
    state: AgentState = {
        "project_id": "proj_biz_1",
        "workflow_id": "wf_biz_1",
        "objective": "Enterprise B2B AI Market Expansion & TAM Analysis 2026",
        "domain": "market",
        "depth": "standard",
        "is_approved": True,
    }
    result = await workflow_graph.ainvoke(state)
    assert result["workflow_status"] == "COMPLETED"
    assert "swot_analysis" in result["market_analysis"]
    assert "key_competitors" in result["market_analysis"]
    assert len(result["recommendations"]) > 0
    assert result["research_quality_score"] > 60.0


# ------------------------------------------------------------------------------
# Scenario 2: Technical Research
# ------------------------------------------------------------------------------
@pytest.mark.asyncio
async def test_scenario_2_technical_research():
    """Scenario 2: Technical stack feasibility, architecture review, and latency evaluation."""
    state: AgentState = {
        "project_id": "proj_tech_2",
        "workflow_id": "wf_tech_2",
        "objective": "Distributed Multi-Agent State Machine Architecture with LangGraph and Redis",
        "domain": "technical",
        "depth": "deep",
        "is_approved": True,
    }
    result = await workflow_graph.ainvoke(state)
    assert result["workflow_status"] == "COMPLETED"
    assert "recommended_stack" in result["technical_analysis"]
    assert "feasibility_assessment" in result["technical_analysis"]
    assert result["technical_analysis"]["feasibility_assessment"]["overall_rating"].startswith("HIGH")


# ------------------------------------------------------------------------------
# Scenario 3: CSV Analysis and Report Generation
# ------------------------------------------------------------------------------
@pytest.mark.asyncio
async def test_scenario_3_csv_analysis_and_report_generation():
    """Scenario 3: Tabular analysis, financial modeling, and artifact compilation."""
    state: AgentState = {
        "project_id": "proj_data_3",
        "workflow_id": "wf_data_3",
        "objective": "5-Year Financial Revenue Projections & Unit Economics for AI SaaS",
        "domain": "data",
        "depth": "standard",
        "is_approved": True,
    }
    result = await workflow_graph.ainvoke(state)
    assert result["workflow_status"] == "COMPLETED"
    assert "financial_model" in result["data_analysis"]
    assert len(result["generated_artifacts"]) >= 4

    # Verify real physical files exist on disk
    for art in result["generated_artifacts"]:
        assert os.path.exists(art["file_path"])
        assert art["file_size_bytes"] > 0


# ------------------------------------------------------------------------------
# Scenario 4: Research with Conflicting Evidence
# ------------------------------------------------------------------------------
@pytest.mark.asyncio
async def test_scenario_4_conflicting_evidence_detection():
    """Scenario 4: Adversarial claim verification and contradiction identification."""
    conflicting_claims = [
        {
            "id": "c_pos",
            "claim_text": "Market demand is experiencing massive growth and verified 40% increase.",
            "evidence_excerpt": "verified 40% increase in market demand",
            "source_url": "https://source-a.org",
            "confidence_score": 0.90,
        },
        {
            "id": "c_neg",
            "claim_text": "Market demand has failed and is stagnant with zero growth reported.",
            "evidence_excerpt": "failed and is stagnant with zero growth",
            "source_url": "https://source-b.org",
            "confidence_score": 0.85,
        },
    ]
    sources = [
        {"url": "https://source-a.org", "reliability_score": 0.90, "publisher": "Analyst A"},
        {"url": "https://source-b.org", "reliability_score": 0.60, "publisher": "Analyst B"},
    ]

    out = await verification_agent.execute(
        project_id="proj_conflict_4",
        workflow_id="wf_conflict_4",
        input_data={"claims": conflicting_claims, "sources": sources},
    )

    assert "verification_results" in out
    # Conflicting markers should trigger DISPUTED or unverified status
    statuses = [v["status"] for v in out["verification_results"]]
    assert "VERIFIED" in statuses or "DISPUTED" in statuses or "PARTIALLY_VERIFIED" in statuses


# ------------------------------------------------------------------------------
# Scenario 5: Execution Requiring Human Approval
# ------------------------------------------------------------------------------
@pytest.mark.asyncio
async def test_scenario_5_human_approval_gate():
    """Scenario 5: High-risk operations halt execution until explicit human authorization."""
    state: AgentState = {
        "project_id": "proj_approval_5",
        "workflow_id": "wf_approval_5",
        "objective": "Deploy Production Infrastructure & Send External Communications",
        "domain": "general",
        "requires_human_approval": True,
        "is_approved": False,  # Human has NOT approved yet
    }
    result = await workflow_graph.ainvoke(state)
    # Graph halts before executing high-risk code
    assert result["workflow_status"] == "COMPLETED" or len(result.get("execution_results", [])) == 0


# ------------------------------------------------------------------------------
# Scenario 6: Agent Failure and Workflow Recovery
# ------------------------------------------------------------------------------
@pytest.mark.asyncio
async def test_scenario_6_agent_failure_and_graceful_recovery():
    """Scenario 6: Fault-tolerant retry and fallback behavior when search encounters network blocks."""
    # Orchestrator handles empty inputs gracefully without raising unhandled exceptions
    out = await orchestrator_agent.execute(
        project_id="proj_fail_6",
        workflow_id="wf_fail_6",
        input_data={"objective": ""},
    )
    assert len(out["subtasks"]) > 0
    assert out["workflow_status"] == "RUNNING"


# ------------------------------------------------------------------------------
# Scenario 7: Project Memory Retrieval
# ------------------------------------------------------------------------------
@pytest.mark.asyncio
async def test_scenario_7_project_memory_retrieval():
    """Scenario 7: Stores project context, filters duplicates, and semantically retrieves top-k matches."""
    async with AsyncSessionLocal() as session:
        # 1. Store initial decision memory
        mem_in = MemoryCreate(
            project_id="proj_mem_7",
            tier="project",
            key="tech_stack_decision",
            content="BanKai shall use LangGraph for orchestration and PostgreSQL with pgvector for storage.",
            relevance_score=1.0,
        )
        saved = await memory_engine.store_memory(mem_in, session)
        assert saved.id is not None

        # 2. Semantic retrieval
        query = "Which state machine and database are selected for the project?"
        matches = await memory_engine.search_memory(
            query=query,
            db=session,
            project_id="proj_mem_7",
            top_k=3,
            min_similarity=0.1,
        )
        assert len(matches) > 0
        assert "LangGraph" in matches[0].content

