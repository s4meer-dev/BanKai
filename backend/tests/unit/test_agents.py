"""Unit tests for all 8 specialized agents."""

import pytest
from app.agents.orchestrator import orchestrator_agent
from app.agents.research import research_agent
from app.agents.market_intelligence import market_intelligence_agent
from app.agents.technical_research import technical_research_agent
from app.agents.data_analyst import data_analyst_agent
from app.agents.verification import verification_agent
from app.agents.strategy import strategy_agent
from app.agents.execution import execution_agent


@pytest.mark.asyncio
async def test_orchestrator_agent():
    out = await orchestrator_agent.execute(
        project_id="test_proj",
        workflow_id="test_wf",
        input_data={"objective": "Evaluate AI Market Opportunities in 2026"},
    )
    assert "subtasks" in out
    assert len(out["subtasks"]) >= 5
    assert "research_queries" in out
    assert len(out["research_queries"]) > 0


@pytest.mark.asyncio
async def test_research_agent():
    out = await research_agent.execute(
        project_id="test_proj",
        workflow_id="test_wf",
        input_data={"research_queries": ["Autonomous multi-agent benchmarks 2026"]},
    )
    assert "sources" in out
    assert "claims" in out
    assert len(out["sources"]) > 0
    assert len(out["claims"]) > 0


@pytest.mark.asyncio
async def test_market_intelligence_agent():
    out = await market_intelligence_agent.execute(
        project_id="test_proj",
        workflow_id="test_wf",
        input_data={"objective": "SaaS Platform", "claims": [{"claim_text": "Sample claim"}]},
    )
    assert "market_analysis" in out
    assert "swot_analysis" in out["market_analysis"]
    assert "key_competitors" in out["market_analysis"]


@pytest.mark.asyncio
async def test_technical_research_agent():
    out = await technical_research_agent.execute(
        project_id="test_proj",
        workflow_id="test_wf",
        input_data={"objective": "Distributed Agent Platform", "claims": []},
    )
    assert "technical_analysis" in out
    assert "recommended_stack" in out["technical_analysis"]
    assert "feasibility_assessment" in out["technical_analysis"]


@pytest.mark.asyncio
async def test_data_analyst_agent():
    out = await data_analyst_agent.execute(
        project_id="test_proj",
        workflow_id="test_wf",
        input_data={"objective": "Financial Feasibility"},
    )
    assert "data_analysis" in out
    assert "financial_model" in out["data_analysis"]
    assert len(out["data_analysis"]["financial_model"]) == 5


@pytest.mark.asyncio
async def test_verification_agent():
    mock_claims = [
        {
            "id": "c1",
            "claim_text": "Empirical benchmarks demonstrate verified annual growth.",
            "evidence_excerpt": "Empirical benchmarks demonstrate verified annual growth.",
            "source_url": "https://example.com/report",
        }
    ]
    mock_sources = [
        {"url": "https://example.com/report", "reliability_score": 0.95, "publisher": "Test"}
    ]
    out = await verification_agent.execute(
        project_id="test_proj",
        workflow_id="test_wf",
        input_data={"claims": mock_claims, "sources": mock_sources},
    )
    assert "verification_results" in out
    assert "research_quality_score" in out
    assert out["research_quality_score"] > 50.0


@pytest.mark.asyncio
async def test_strategy_agent():
    mock_claims = [{"id": "c1", "claim_text": "Growth benchmark"}]
    out = await strategy_agent.execute(
        project_id="test_proj",
        workflow_id="test_wf",
        input_data={"objective": "Launch Strategy", "claims": mock_claims},
    )
    assert "recommendations" in out
    assert "execution_plans" in out
    assert len(out["recommendations"]) > 0


@pytest.mark.asyncio
async def test_execution_agent():
    out = await execution_agent.execute(
        project_id="test_proj",
        workflow_id="test_wf",
        input_data={
            "objective": "Test Deliverable Project",
            "execution_plans": [{"id": "p1", "params": {}}],
            "claims": [{"claim_text": "Verified empirical assertion.", "source_url": "https://test.org"}],
            "recommendations": [{"title": "Launch Phase", "details": "Phase 1 rollout."}],
            "research_quality_score": 92.5,
        },
    )
    assert "generated_artifacts" in out
    assert len(out["generated_artifacts"]) >= 4  # xlsx, docx, pptx, pdf

