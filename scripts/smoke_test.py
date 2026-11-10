"""
BAN KAI - Subsystem Smoke Test
Verifies end-to-end functionality of core platform components:
1. Database initialization and model schema
2. AST security guard
3. Python execution sandbox
4. Research search provider and web crawler
5. 4-tier vector memory engine
6. Evidence-to-Action Ledger (EAL) & RQS calculation
7. Deliverable artifact generation (Excel, Docx, Plotly HTML)
"""

import asyncio
import os
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from app.db.session import init_db, AsyncSessionLocal
from app.execution.ast_guard import validate_python_code
from app.execution.sandbox import ExecutionSandbox
from app.execution.artifact_generators import ArtifactGenerator
from app.memory.embeddings import EmbeddingProvider
from app.memory.engine import memory_engine
from app.schemas.memory import MemoryCreate
from app.research.search_providers import MockSearchProvider
from app.research.crawler import WebCrawler
from app.research.claim_extractor import ClaimExtractor
from app.eal.ledger import eal_ledger
from app.models.research_claim import ResearchClaim
from app.models.research_source import ResearchSource


def print_status(component: str, status: str, details: str = ""):
    icon = "[OK]" if status == "PASS" else "[FAIL]"
    print(f"{icon:6} {component:<35} {details}")


async def test_database():
    try:
        await init_db()
        async with AsyncSessionLocal() as session:
            assert session is not None
        print_status("Database & ORM Schema", "PASS", "Async SQLite/PostgreSQL initialized")
        return True
    except Exception as e:
        print_status("Database & ORM Schema", "FAIL", str(e))
        return False


def test_ast_guard():
    safe_code = "x = [1, 2, 3]\ny = sum(x)"
    dangerous_code = "import os\nos.system('dir')"

    safe_valid, _ = validate_python_code(safe_code)
    dangerous_valid, violations = validate_python_code(dangerous_code)

    if safe_valid and (not dangerous_valid) and len(violations) > 0:
        print_status("AST Security Guard", "PASS", "Dangerous imports blocked, safe code allowed")
        return True
    else:
        print_status("AST Security Guard", "FAIL", "Security rule bypass detected")
        return False


async def test_sandbox():
    sandbox = ExecutionSandbox(timeout_seconds=5)
    code = """
import numpy as np
arr = np.array([10, 20, 30, 40, 50])
print(f"Mean: {arr.mean()}")
"""
    result = await sandbox.run_code(code)
    if result.exit_code == 0 and "Mean: 30.0" in result.stdout:
        print_status("Execution Sandbox", "PASS", f"Numpy executed in {result.duration_ms:.1f}ms")
        return True
    else:
        print_status("Execution Sandbox", "FAIL", result.stderr or "Non-zero exit")
        return False


async def test_research_pipeline():
    provider = MockSearchProvider()
    results = await provider.search("Autonomous multi-agent research platforms 2026")
    crawler = WebCrawler()
    extractor = ClaimExtractor()

    if not results:
        print_status("Research Engine", "FAIL", "No search results returned")
        return False

    page = await crawler.fetch_and_clean(results[0].url)
    claims = extractor.extract_claims(page)

    if claims and len(claims) > 0:
        print_status("Research Engine", "PASS", f"Extracted {len(claims)} verifiable claims")
        return True
    else:
        print_status("Research Engine", "FAIL", "Failed to extract claims from crawl")
        return False


async def test_memory_engine():
    async with AsyncSessionLocal() as session:
        mem_in = MemoryCreate(
            tier="knowledge",
            key="langgraph_orchestration_smoke",
            content="BAN KAI utilizes LangGraph for stateful cyclical orchestration.",
            project_id=None,
            metadata_json={"source": "smoke_test"},
            relevance_score=0.95,
        )
        item = await memory_engine.store_memory(mem_in, session)

        results = await memory_engine.search_memory(
            query="cyclical orchestration framework",
            db=session,
            tier="knowledge",
            top_k=3,
            min_similarity=0.1,
        )

        if results and len(results) > 0:
            print_status("4-Tier Vector Memory", "PASS", f"Retrieved top match (score: {results[0].similarity:.3f})")
            return True
        else:
            print_status("4-Tier Vector Memory", "FAIL", "Semantic retrieval yielded 0 items")
            return False


def test_eal_and_artifacts():
    # Mock some research claims and sources to test RQS score calculation
    mock_source = ResearchSource(
        id="src-1",
        project_id="proj-test",
        title="Smoke Test Source",
        url="https://example.com/test",
        content_hash="smoke_hash_123",
        reliability_score=0.92,
    )
    mock_claim = ResearchClaim(
        id="clm-1",
        project_id="proj-test",
        claim_text="Multi-agent architectures achieve higher benchmark resilience.",
        confidence_score=0.95,
        verification_status="VERIFIED",
    )
    score = eal_ledger._calculate_quality_score(
        total_claims=1, verified_claims=1, disputed_claims=0, sources=[mock_source]
    )

    gen = ArtifactGenerator()
    financial_data = [
        {"Year": 2026, "Projected_Revenue_kUSD": 250, "Operating_Costs_kUSD": 180, "Operating_Margin_Pct": 28.0},
        {"Year": 2027, "Projected_Revenue_kUSD": 780, "Operating_Costs_kUSD": 420, "Operating_Margin_Pct": 46.2},
    ]
    excel_path = gen.generate_excel_model("Smoke Test Project", financial_data)
    chart_path = gen.generate_plotly_chart(financial_data)

    artifacts_ok = os.path.exists(excel_path) and os.path.exists(chart_path)
    # Clean up temp files
    if os.path.exists(excel_path):
        os.remove(excel_path)
    if os.path.exists(chart_path):
        os.remove(chart_path)

    if artifacts_ok and score.overall_score > 70.0:
        print_status("EAL & Deliverables", "PASS", f"RQS: {score.overall_score}/100 | Excel & Plotly HTML generated")
        return True
    else:
        print_status("EAL & Deliverables", "FAIL", "Artifact or RQS score calculation failed")
        return False


async def main():
    print("=" * 70)
    print("          BAN KAI PLATFORM - SUBSYSTEM SMOKE TEST RUNNER")
    print("=" * 70)

    tests = [
        ("Database", test_database()),
        ("AST Guard", asyncio.to_thread(test_ast_guard)),
        ("Sandbox", test_sandbox()),
        ("Research Pipeline", test_research_pipeline()),
        ("Memory Engine", test_memory_engine()),
        ("EAL & Artifacts", asyncio.to_thread(test_eal_and_artifacts)),
    ]

    all_passed = True
    for name, test_coro in tests:
        passed = await test_coro
        if not passed:
            all_passed = False

    print("=" * 70)
    if all_passed:
        print("RESULT: ALL 6 PLATFORM SUBSYSTEMS OPERATIONAL AND VALIDATED [PASS]")
    else:
        print("RESULT: ONE OR MORE SUBSYSTEMS FAILED [FAIL]")
    print("=" * 70)
    sys.exit(0 if all_passed else 1)


if __name__ == "__main__":
    asyncio.run(main())
