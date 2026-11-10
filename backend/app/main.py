"""Main FastAPI application entrypoint for BAN KAI."""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.api import api_router
from app.core.config import settings
from app.core.logging import logger, setup_logging
from app.db.session import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan setup and teardown."""
    setup_logging(level=settings.LOG_LEVEL, log_format=settings.LOG_FORMAT)
    logger.info(f"Starting {settings.APP_NAME} in {settings.APP_ENV} mode...")
    
    # Initialize database tables
    try:
        await init_db()
        logger.info("Database initialized successfully.")
    except Exception as exc:
        logger.error(f"Failed to initialize database: {exc}", exc_info=True)

    yield

    logger.info("Shutting down BAN KAI backend...")


app = FastAPI(
    title=settings.APP_NAME,
    description="Autonomous Multi-Agent AI Research and Execution Platform Backend",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API v1 router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Health"])
async def root():
    """Root platform metadata."""
    return {
        "platform": settings.APP_NAME,
        "version": "0.1.0",
        "status": "operational",
        "environment": settings.APP_ENV,
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint for orchestration and load balancers."""
    return {
        "status": "healthy",
        "database": "connected",
        "search_provider": settings.DEFAULT_SEARCH_PROVIDER,
        "sandbox_mode": settings.SANDBOX_MODE,
    }

