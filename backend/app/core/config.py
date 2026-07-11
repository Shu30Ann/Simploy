import os
from dataclasses import dataclass
from pathlib import Path


def load_env_file(path: str = "backend/.env") -> None:
    env_path = Path(path)
    if not env_path.exists():
        return

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


load_env_file()


@dataclass(frozen=True)
class Settings:
    app_name: str = "Simploy API"
    app_version: str = "0.2.0"
    database_path: str = os.getenv("SIMPLOY_DATABASE_PATH", "backend/simploy.db")
    jwt_secret: str = os.getenv("SIMPLOY_JWT_SECRET", "dev-change-me")
    jwt_issuer: str = "simploy-api"
    token_ttl_minutes: int = int(os.getenv("SIMPLOY_TOKEN_TTL_MINUTES", "1440"))
    ai_engine_url: str = os.getenv("SIMPLOY_AI_ENGINE_URL", "http://127.0.0.1:8010")
    cors_origins: str = os.getenv("SIMPLOY_CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
    cors_origin_regex: str = os.getenv(
        "SIMPLOY_CORS_ORIGIN_REGEX",
        r"https://.*\.vercel\.app|http://(localhost|127\.0\.0\.1):\d+",
    )
    supabase_url: str | None = os.getenv("SUPABASE_URL")
    supabase_anon_key: str | None = os.getenv("SUPABASE_ANON_KEY")
    supabase_service_role_key: str | None = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    @property
    def supabase_enabled(self) -> bool:
        return bool(self.supabase_url and self.supabase_anon_key and self.supabase_service_role_key)


settings = Settings()
