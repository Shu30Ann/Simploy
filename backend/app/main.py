from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.core.config import settings
from backend.app.core.database import init_db
from backend.app.routers import applications, auth, dashboard, jobs, predictions, profiles, simulations


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="Production-shaped API foundation for Simploy.",
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()],
        allow_origin_regex=settings.cors_origin_regex,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.on_event("startup")
    def on_startup() -> None:
        if not settings.supabase_enabled:
            init_db()

    @app.get("/", tags=["health"])
    def health() -> dict:
        return {"status": "ok", "service": settings.app_name, "version": settings.app_version}

    app.include_router(auth.router)
    app.include_router(profiles.router)
    app.include_router(jobs.router)
    app.include_router(applications.router)
    app.include_router(dashboard.router)
    app.include_router(simulations.router)
    app.include_router(predictions.router)
    return app


app = create_app()
