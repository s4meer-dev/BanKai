"""Integration tests for FastAPI REST endpoints."""

import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app
from app.db.session import init_db


@pytest.fixture(autouse=True)
async def setup_test_db():
    await init_db()


@pytest.mark.asyncio
async def test_root_and_health_endpoints():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Root
        root_res = await client.get("/")
        assert root_res.status_code == 200
        assert root_res.json()["status"] == "operational"

        # Health
        health_res = await client.get("/health")
        assert health_res.status_code == 200
        assert health_res.json()["status"] == "healthy"


@pytest.mark.asyncio
async def test_project_crud():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Create Project
        create_res = await client.post(
            "/api/v1/projects",
            json={
                "title": "Quantum Computing Market Study",
                "description": "Comprehensive market research on quantum software ecosystems.",
                "settings": {"domain": "technical"},
            },
        )
        assert create_res.status_code == 201
        project = create_res.json()
        project_id = project["id"]
        assert project["title"] == "Quantum Computing Market Study"

        # List Projects
        list_res = await client.get("/api/v1/projects")
        assert list_res.status_code == 200
        assert any(p["id"] == project_id for p in list_res.json())

        # Get Project Detail
        detail_res = await client.get(f"/api/v1/projects/{project_id}")
        assert detail_res.status_code == 200
        assert detail_res.json()["id"] == project_id

        # Delete Project
        del_res = await client.delete(f"/api/v1/projects/{project_id}")
        assert del_res.status_code == 204


@pytest.mark.asyncio
async def test_sandbox_code_execution():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Safe math code
        exec_res = await client.post(
            "/api/v1/execution/sandbox",
            json={"code": "print(2 + 2)"},
        )
        assert exec_res.status_code == 200
        assert exec_res.json()["status"] == "SUCCESS"
        assert "4" in exec_res.json()["stdout"]

        # Malicious code rejection
        evil_res = await client.post(
            "/api/v1/execution/sandbox",
            json={"code": "import os\nos.system('echo pwned')"},
        )
        assert evil_res.status_code == 200
        assert evil_res.json()["status"] == "SECURITY_VIOLATION"


@pytest.mark.asyncio
async def test_memory_engine_crud():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Store memory
        mem_res = await client.post(
            "/api/v1/memory",
            json={
                "tier": "knowledge",
                "key": "market_growth_2026",
                "content": "Autonomous multi-agent platforms demonstrate verified 34% annual growth.",
                "relevance_score": 0.95,
            },
        )
        assert mem_res.status_code == 201
        mem_id = mem_res.json()["id"]

        # Semantic query
        query_res = await client.post(
            "/api/v1/memory/query",
            json={"query": "multi-agent annual growth rate", "min_similarity": 0.1},
        )
        assert query_res.status_code == 200
        assert len(query_res.json()) > 0

        # Clean up
        del_mem = await client.delete(f"/api/v1/memory/{mem_id}")
        assert del_mem.status_code == 204
