"""Configuration settings for BAN KAI."""

import os
from typing import List, Optional, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    # --- Application & Core ---
    APP_NAME: str = "BAN KAI Multi-Agent Platform"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "bankai-development-secret-key-32-chars-long-secure"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    ALLOWED_ORIGINS: Union[str, List[str]] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # --- Databases ---
    DATABASE_URL: str = "postgresql+asyncpg://bankai:bankai_secret@localhost:5432/bankai_db"
    SQLITE_FALLBACK_URL: str = "sqlite+aiosqlite:///./bankai_dev.db"
    USE_SQLITE_FALLBACK: bool = True

    REDIS_URL: str = "redis://localhost:6379/0"
    USE_REDIS_CACHE: bool = False

    # --- AI Providers ---
    DEFAULT_LLM_PROVIDER: str = "mock"  # "openai" | "gemini" | "ollama" | "anthropic" | "mock"
    DEFAULT_FAST_MODEL: str = "gpt-4o-mini"
    DEFAULT_SMART_MODEL: str = "gpt-4o"
    DEFAULT_EMBEDDING_PROVIDER: str = "mock"
    DEFAULT_EMBEDDING_MODEL: str = "text-embedding-3-small"

    OPENAI_API_KEY: Optional[str] = None
    OPENAI_API_BASE: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    OLLAMA_BASE_URL: str = "http://localhost:11434"

    # --- Search Providers ---
    DEFAULT_SEARCH_PROVIDER: str = "duckduckgo"  # "duckduckgo" | "searxng" | "tavily" | "mock"
    TAVILY_API_KEY: Optional[str] = None
    SEARXNG_URL: str = "http://localhost:8080"
    MAX_SEARCH_RESULTS_PER_QUERY: int = 5

    # --- Crawler & Scraping ---
    CRAWLER_HEADLESS: bool = True
    CRAWLER_TIMEOUT_MS: int = 15000
    MAX_CONCURRENT_CRAWLS: int = 4
    ENABLE_JAVASCRIPT_SCRAPING: bool = True

    # --- Execution & Sandbox ---
    SANDBOX_MODE: str = "local_restricted"  # "local_restricted" | "e2b"
    E2B_API_KEY: Optional[str] = None
    SANDBOX_TIMEOUT_SECONDS: int = 30
    SANDBOX_MAX_MEMORY_MB: int = 512
    ARTIFACT_STORAGE_DIR: str = "./storage/artifacts"
    SCRATCH_STORAGE_DIR: str = "./storage/scratch"

    # --- Observability ---
    LANGFUSE_ENABLED: bool = False
    LANGFUSE_PUBLIC_KEY: Optional[str] = None
    LANGFUSE_SECRET_KEY: Optional[str] = None
    LANGFUSE_HOST: str = "https://cloud.langfuse.com"
    OTEL_ENABLED: bool = False
    OTEL_EXPORTER_OTLP_ENDPOINT: str = "http://localhost:4317"
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"

    # --- Limits ---
    MAX_ORCHESTRATION_CYCLES: int = 12
    MAX_SUBTASKS_PER_OBJECTIVE: int = 10
    AUTO_APPROVE_LOW_RISK: bool = True
    REQUIRE_APPROVAL_HIGH_RISK: bool = True

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, (list, str)):
            return v  # type: ignore
        raise ValueError(v)


settings = Settings()
