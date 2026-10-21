"""
Vitalis Core Configuration Management
Strongly-typed environment settings utilizing Pydantic Settings v2.
"""

import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    # Application & Environment
    APP_NAME: str = "Vitalis Clinical Logistics Gateway"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = Field(default="development", description="development | staging | production")
    DEBUG: bool = Field(default=False, description="Enable debug logging")
    LOG_LEVEL: str = Field(default="INFO", description="Logging verbosity level")

    # Network & Gateway
    BACKEND_HOST: str = Field(default="0.0.0.0", description="Binding host interface")
    BACKEND_PORT: int = Field(default=8000, description="Listening TCP port")
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8081",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8081",
        "*"
    ]

    # Database & Supabase (PostGIS)
    DATABASE_URL: str = Field(
        default="postgresql://postgres:postgres@localhost:5432/vitalis",
        description="PostgreSQL / PostGIS connection string"
    )
    SUPABASE_URL: str = Field(default="https://your-project.supabase.co")
    SUPABASE_ANON_KEY: str = Field(default="your-anon-key")
    SUPABASE_SERVICE_ROLE_KEY: str = Field(default="your-service-role-key")

    # LangChain & LLM Gateway
    OPENAI_API_KEY: str = Field(default="", description="OpenAI API key for LangChain ReAct agent")
    MODEL_NAME: str = Field(default="gpt-4o", description="Target LLM model")

    # ML Pipeline Artifact Paths
    BASE_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    PROPHET_MODEL_PATH: str = Field(default="ml_pipeline/models/prophet_model.pkl")
    XGB_STOCKOUT_MODEL_PATH: str = Field(default="ml_pipeline/models/xgb_stockout.json")
    STOCKOUT_RISK_THRESHOLD: float = Field(default=0.40, description="Ethical depletion guardrail cutoff")

    # Spatial Routing
    OSRM_BASE_URL: str = Field(default="https://router.project-osrm.org")

    # Clinical Constants
    HAC_QUALITY_THRESHOLD: float = Field(default=85.00, description="Medicare HAC benchmark score")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
