"""LifeOS Backend Configuration."""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/lifeos"

    # Authentication
    SECRET_KEY: str = "lifeos-dev-secret-key-change-in-production"
    ACCESS_KEYWORD: str = "Harsh"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 10080  # 7 days

    # Storage
    UPLOAD_DIR: str = "./uploads"

    # CORS
    FRONTEND_URL: str = "http://localhost:5173"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
