"""Aggregate API v1 router mounting all subsystem endpoints."""

from fastapi import APIRouter
from app.api.v1 import auth, eal, events, execution, memory, projects, research, tasks, workflows

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(projects.router, prefix="/projects", tags=["Projects"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["Tasks"])
api_router.include_router(workflows.router, prefix="/workflows", tags=["Workflows"])
api_router.include_router(research.router, prefix="/research", tags=["Research Engine"])
api_router.include_router(eal.router, prefix="/eal", tags=["Evidence-to-Action Ledger"])
api_router.include_router(memory.router, prefix="/memory", tags=["Memory Engine"])
api_router.include_router(execution.router, prefix="/execution", tags=["Execution & Artifacts"])
api_router.include_router(events.router, prefix="/events", tags=["Real-time Events"])

