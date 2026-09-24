from typing import Optional
from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "BYTE4 AI — REMEMBR"
    TAGLINE: str = "Every repair becomes knowledge."
    API_V1_STR: str = "/api"
    ENVIRONMENT: str = "production"

    # Database: Supabase PostgreSQL or local async fallback
    DATABASE_URL: str = (
        "sqlite+aiosqlite:////tmp/remembr.db"
        if os.environ.get("VERCEL")
        else "sqlite+aiosqlite:///./remembr.db"
    )
    SUPABASE_URL: Optional[str] = None
    SUPABASE_ANON_KEY: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None

    # Hindsight by Vectorize
    HINDSIGHT_BASE_URL: str = "http://localhost:8888"
    HINDSIGHT_API_KEY: Optional[str] = None
    HINDSIGHT_DEFAULT_BANK: str = "org_byte4_default"

    # AI / LLM Configuration
    LLM_PROVIDER: str = "huggingface"
    LLM_API_KEY: Optional[str] = None
    LLM_MODEL: str = "meta-llama/Llama-3.3-70B-Instruct"

    # Hugging Face Configuration
    HUGGINGFACE_API_KEY: Optional[str] = None
    HUGGINGFACE_MODEL: str = "meta-llama/Llama-3.3-70B-Instruct"
    HUGGINGFACE_API_URL: str = "https://router.huggingface.co/v1/chat/completions"

    # CORS
    FRONTEND_URL: str = "http://localhost:5173"
    BACKEND_URL: str = "http://localhost:8000"

    # Auth
    JWT_SECRET: str = "remembr-byte4-enterprise-secret-key-production-ready"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    @model_validator(mode="after")
    def sync_llm_settings(self):
        if self.HUGGINGFACE_MODEL:
            self.LLM_MODEL = self.HUGGINGFACE_MODEL
        if self.HUGGINGFACE_API_KEY and not self.LLM_API_KEY:
            self.LLM_API_KEY = self.HUGGINGFACE_API_KEY
        return self

    model_config = SettingsConfigDict(
        env_file=(".env", "backend/.env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
