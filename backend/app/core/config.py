import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    app_name: str = "Simploy API"
    app_version: str = "0.2.0"
    database_path: str = os.getenv("SIMPLOY_DATABASE_PATH", "backend/simploy.db")
    jwt_secret: str = os.getenv("SIMPLOY_JWT_SECRET", "dev-change-me")
    jwt_issuer: str = "simploy-api"
    token_ttl_minutes: int = int(os.getenv("SIMPLOY_TOKEN_TTL_MINUTES", "1440"))
    ai_engine_url: str = os.getenv("SIMPLOY_AI_ENGINE_URL", "http://127.0.0.1:8010")


settings = Settings()
