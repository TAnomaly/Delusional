"""Application configuration - loaded from environment variables."""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Digital Minimalism Study Platform"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/minimalism_db"
    DATABASE_URL_SYNC: str = "postgresql://postgres:postgres@localhost:5432/minimalism_db"

    # Auth / JWT
    SECRET_KEY: str = "change-me-in-production-use-a-real-secret"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Minimalism constraints
    DAILY_FEED_LIMIT: int = 20
    DAILY_USAGE_CAP_MINUTES: int = 15
    POMODORO_DEFAULT_MINUTES: int = 25
    POMODORO_BREAK_MINUTES: int = 5

    # AI module
    AI_WEEKLY_SUMMARY_ENABLED: bool = True
    AI_MAX_NOTIFICATIONS_PER_DAY: int = 1

    class Config:
        env_file = ".env"
        extra = "allow"


settings = Settings()
