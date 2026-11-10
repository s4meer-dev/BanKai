"""LangGraph Multi-Agent Orchestration StateGraph."""

import asyncio
from typing import Any, Dict, Literal
from langgraph.graph import END, START, StateGraph

from app.agents.data_analyst import data_analyst_agent
from app.agents.execution import execution_agent
from app.agents.market_intelligence import market_intelligence_agent
from app.agents.orchestrator import orchestrator_agent
from app.agents.research import research_agent
from app.agents.strategy import strategy_agent
from app.agents.technical_research import technical_research_agent
from app.agents.verification import verification_agent
from app.core.logging import logger
from app.orchestrator.event_bus import event_bus
from app.orchestrator.state import AgentState


# ==============================================================================
# LangGraph Node Handlers
# ==============================================================================

async def orchestrator_node(state: AgentState) -> Dict[str, Any]:
    """Node 1: Evaluates objective and decomposes into structured subtasks."""
    logger.info("Executing LangGraph Node: Orchestrator")
    out = await orchestrator_agent.execute(
        project_id=state["project_id"],
        workflow_id=state["workflow_id"],
        input_data={"objective": state["objective"], "domain": state.get("domain", "general")},
    )
    return {
        "subtasks": out.get("subtasks", []),
        "research_queries": out.get("research_queries", []),
        "iteration_count": state.get("iteration_count", 0) + 1,
        "workflow_status": "RUNNING",
    }


async def research_node(state: AgentState) -> Dict[str, Any]:
    """Node 2: Executes web searches and claim extraction."""
    logger.info("Executing LangGraph Node: Research")
    out = await research_agent.execute(
        project_id=state["project_id"],
        workflow_id=state["workflow_id"],
        input_data={
            "research_queries": state.get("research_queries", []),
            "objective": state["objective"],
            "db": state.get("_db_session"),  # Optional session passed internally
        },
    )
    return {
        "sources": out.get("sources", []),
        "claims": out.get("claims", []),
    }


async def market_intel_node(state: AgentState) -> Dict[str, Any]:
    """Node 3: Competitive landscape, SWOT, and market sizing."""
    logger.info("Executing LangGraph Node: Market Intelligence")
    out = await market_intelligence_agent.execute(
        project_id=state["project_id"],
        workflow_id=state["workflow_id"],
        input_data={"objective": state["objective"], "claims": state.get("claims", [])},
    )
    return {"market_analysis": out.get("market_analysis", {})}


async def tech_research_node(state: AgentState) -> Dict[str, Any]:
    """Node 4: Architectural specs, feasibility ratings, and risk audits."""
    logger.info("Executing LangGraph Node: Technical Research")
    out = await technical_research_agent.execute(
        project_id=state["project_id"],
        workflow_id=state["workflow_id"],
        input_data={"objective": state["objective"], "claims": state.get("claims", [])},
    )
    return {"technical_analysis": out.get("technical_analysis", {})}


async def data_analyst_node(state: AgentState) -> Dict[str, Any]:
    """Node 5: Financial projections, quantitative analysis, and unit economics."""
    logger.info("Executing LangGraph Node: Data Analyst")
    out = await data_analyst_agent.execute(
        project_id=state["project_id"],
        workflow_id=state["workflow_id"],
        input_data={"objective": state["objective"]},
    )
    return {"data_analysis": out.get("data_analysis", {})}


async def verification_node(state: AgentState) -> Dict[str, Any]:
    """Node 6: Factual claim verification, contradiction detection, and Research Quality Score."""
    logger.info("Executing LangGraph Node: Verification")
    out = await verification_agent.execute(
        project_id=state["project_id"],
        workflow_id=state["workflow_id"],
        input_data={
            "claims": state.get("claims", []),
            "sources": state.get("sources", []),
            "db": state.get("_db_session"),
        },
    )
    return {
        "verification_results": out.get("verification_results", []),
        "research_quality_score": out.get("research_quality_score", 0.0),
        "disputed_claims": out.get("disputed_claims", []),
    }


async def strategy_node(state: AgentState) -> Dict[str, Any]:
    """Node 7: Actionable recommendations, risk assessment, and execution plans."""
    logger.info("Executing LangGraph Node: Strategy")
    out = await strategy_agent.execute(
        project_id=state["project_id"],
        workflow_id=state["workflow_id"],
        input_data={
            "objective": state["objective"],
            "claims": state.get("claims", []),
            "research_quality_score": state.get("research_quality_score", 85.0),
            "db": state.get("_db_session"),
        },
    )
    return {
        "recommendations": out.get("recommendations", []),
        "execution_plans": out.get("execution_plans", []),
        "requires_human_approval": out.get("requires_human_approval", False),
    }


async def execution_node(state: AgentState) -> Dict[str, Any]:
    """Node 8: Generates verified deliverables (Excel, Word, PPTX, PDF, HTML charts)."""
    logger.info("Executing LangGraph Node: Execution")
    out = await execution_agent.execute(
        project_id=state["project_id"],
        workflow_id=state["workflow_id"],
        input_data={
            "objective": state["objective"],
            "execution_plans": state.get("execution_plans", []),
            "claims": state.get("claims", []),
            "recommendations": state.get("recommendations", []),
            "research_quality_score": state.get("research_quality_score", 90.0),
            "data_analysis": state.get("data_analysis", {}),
            "db": state.get("_db_session"),
        },
    )
    return {
        "execution_results": out.get("execution_results", []),
        "generated_artifacts": out.get("generated_artifacts", []),
        "workflow_status": "COMPLETED",
    }


async def final_synthesis_node(state: AgentState) -> Dict[str, Any]:
    """Final synthesis node compiling the complete traceable research intelligence deliverable."""
    report = {
        "project_id": state["project_id"],
        "workflow_id": state["workflow_id"],
        "objective": state["objective"],
        "research_quality_score": state.get("research_quality_score", 0.0),
        "total_sources": len(state.get("sources", [])),
        "total_claims": len(state.get("claims", [])),
        "total_recommendations": len(state.get("recommendations", [])),
        "total_artifacts": len(state.get("generated_artifacts", [])),
        "status": "COMPLETED",
    }
    await event_bus.publish(
        event_type="workflow.completed",
        project_id=state["project_id"],
        workflow_id=state["workflow_id"],
        payload=report,
    )
    return {"final_report": report, "workflow_status": "COMPLETED"}


# ==============================================================================
# Conditional Edge Router
# ==============================================================================

def approval_router(state: AgentState) -> Literal["execution_node", "final_synthesis_node"]:
    """Determines if execution proceeds or halts at approval gate."""
    requires_approval = state.get("requires_human_approval", False)
    is_approved = state.get("is_approved", False)

    if requires_approval and not is_approved:
        logger.info("Workflow paused: awaiting human approval for high-risk operations.")
        return "final_synthesis_node"
    return "execution_node"


# ==============================================================================
# Graph Construction
# ==============================================================================

def create_workflow_graph() -> StateGraph:
    """Builds and compiles the complete LangGraph multi-agent execution pipeline."""
    graph = StateGraph(AgentState)

    # Register Nodes
    graph.add_node("orchestrator", orchestrator_node)
    graph.add_node("research", research_node)
    graph.add_node("market_intel", market_intel_node)
    graph.add_node("tech_research", tech_research_node)
    graph.add_node("data_analyst", data_analyst_node)
    graph.add_node("verification", verification_node)
    graph.add_node("strategy", strategy_node)
    graph.add_node("execution", execution_node)
    graph.add_node("synthesis", final_synthesis_node)

    # Edges
    graph.add_edge(START, "orchestrator")
    graph.add_edge("orchestrator", "research")
    
    # After research, specialized analysis nodes run
    graph.add_edge("research", "market_intel")
    graph.add_edge("market_intel", "tech_research")
    graph.add_edge("tech_research", "data_analyst")
    graph.add_edge("data_analyst", "verification")
    graph.add_edge("verification", "strategy")

    # Conditional routing based on human approval gate
    graph.add_conditional_edges(
        "strategy",
        approval_router,
        {
            "execution_node": "execution",
            "final_synthesis_node": "synthesis",
        },
    )

    graph.add_edge("execution", "synthesis")
    graph.add_edge("synthesis", END)

    return graph.compile()


# Compiled Singleton Graph
workflow_graph = create_workflow_graph()
