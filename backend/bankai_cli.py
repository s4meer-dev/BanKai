#!/usr/bin/env python3
"""
BAN KAI CLI - Multi-Agent Autonomous Research & Execution Command Line Tool
Usage:
    python bankai_cli.py --objective "Analyze market feasibility of quantum computing"
    python bankai_cli.py --objective "Evaluate Rust vs Go for AI gateways" --domain technical --depth comprehensive
"""

import argparse
import asyncio
import os
import sys
import time
import uuid
from pathlib import Path

# Setup paths
curr_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(curr_dir))

from app.db.session import init_db, AsyncSessionLocal
from app.models.user import User
from app.models.project import Project
from app.orchestrator.graph import workflow_graph
from app.orchestrator.state import AgentState
from app.eal.ledger import eal_ledger


def main():
    parser = argparse.ArgumentParser(
        description="BAN KAI - Autonomous Multi-Agent AI Research & Execution Platform CLI"
    )
    parser.add_argument(
        "--objective", "-o",
        type=str,
        required=True,
        help="Primary research/execution objective",
    )
    parser.add_argument(
        "--domain", "-d",
        type=str,
        default="general",
        choices=["general", "technical", "business", "market", "academic", "finance"],
        help="Target analysis domain (default: general)",
    )
    parser.add_argument(
        "--depth",
        type=str,
        default="standard",
        choices=["quick", "standard", "comprehensive"],
        help="Research depth level (default: standard)",
    )
    parser.add_argument(
        "--auto-approve",
        action="store_true",
        default=True,
        help="Auto-approve execution plans without pausing for prompt",
    )

    args = parser.parse_args()

    asyncio.run(execute_cli(args.objective, args.domain, args.depth, args.auto_approve))


async def execute_cli(objective: str, domain: str, depth: str, auto_approve: bool):
    print("=" * 70)
    print("  BAN KAI - Autonomous Multi-Agent Research & Execution Platform")
    print("=" * 70)
    print(f"[*] Objective: {objective}")
    print(f"[*] Domain:    {domain}")
    print(f"[*] Depth:     {depth}")
    print("-" * 70)

    await init_db()

    project_id = f"cli_{uuid.uuid4().hex[:8]}"
    workflow_id = f"wf_{project_id}"
    user_id = "cli_operator"

    # Register in DB
    async with AsyncSessionLocal() as session:
        proj = Project(
            id=project_id,
            user_id=user_id,
            title=f"CLI: {objective[:50]}",
            description=objective,
            status="IN_PROGRESS",
            settings={"domain": domain, "depth": depth, "cli_invoked": True},
        )
        session.add(proj)
        await session.commit()

    initial_state: AgentState = {
        "project_id": project_id,
        "workflow_id": workflow_id,
        "user_id": user_id,
        "objective": objective,
        "domain": domain,
        "depth": depth,
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
        "requires_human_approval": not auto_approve,
        "is_approved": auto_approve,
        "memory_updates": [],
        "workflow_status": "PENDING",
    }

    print("[*] Initiating LangGraph state transitions across 8 agents...")
    t0 = time.perf_counter()

    final_state = await workflow_graph.ainvoke(initial_state)

    duration = time.perf_counter() - t0
    print(f"[+] Multi-agent execution completed in {duration:.2f} seconds.")
    print("-" * 70)

    print(f"[*] Subtasks Executed:       {len(final_state.get('subtasks', []))}")
    print(f"[*] Sources Gathered:        {len(final_state.get('sources', []))}")
    print(f"[*] Factual Claims Verified: {len(final_state.get('claims', []))}")
    rqs = final_state.get("research_quality_score", 0.0)
    print(f"[*] Research Quality Score:  {rqs:.1f} / 100")
    print(f"[*] Strategic Directives:    {len(final_state.get('recommendations', []))}")
    print(f"[*] Artifacts Created:       {len(final_state.get('generated_artifacts', []))}")

    if final_state.get("generated_artifacts"):
        print("\nGenerated Deliverables:")
        for a in final_state["generated_artifacts"]:
            print(f"  - [{a.get('file_type', '').upper()}] {a.get('name')}: {a.get('file_path')}")

    print("=" * 70)
    print(f"Platform URL: http://localhost:3000/eal?projectId={project_id}")
    print("=" * 70)


if __name__ == "__main__":
    main()

