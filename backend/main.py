from fastapi import FastAPI
from backend.models import InsightsRequest, InsightsResponse, SimulationRequest, SimulationResult
from backend.simulation import generate_insights, simulate_workforce

app = FastAPI(
    title="Simploy Layer 2/3 Backend",
    description="Minimal workforce simulation and insights prototype for Layer 2 and Layer 3.",
    version="0.1.0",
)


@app.get("/", summary="Health check")
async def root() -> dict:
    return {"status": "ok", "service": "Simploy Layer 2/3 Backend"}


@app.post("/workforce-simulation", response_model=SimulationResult, summary="Run workforce simulation")
async def workforce_simulation(request: SimulationRequest) -> SimulationResult:
    return simulate_workforce(request.company, request.department, request.time_horizon)


@app.post("/insights", response_model=InsightsResponse, summary="Generate actionable recommendations")
async def insights(request: InsightsRequest) -> InsightsResponse:
    return generate_insights(request.simulation)
