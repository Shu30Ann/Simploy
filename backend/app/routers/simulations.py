from fastapi import APIRouter, Depends, HTTPException, status

from backend.app.dependencies import get_current_user
from backend.app.repositories.simulations import SimulationRepository
from backend.app.repositories.users import ProfileRepository
from backend.app.schemas.simulations import SimulationCreate, SimulationRecord, SimulationResult
from backend.app.services.simulation_service import MODEL_VERSION, RecommendationService, SimulationService

router = APIRouter(prefix="/simulations", tags=["simulations"])


@router.post("", response_model=SimulationRecord)
def create_simulation(payload: SimulationCreate, user: dict = Depends(get_current_user)) -> SimulationRecord:
    employer_id = None
    if user["role"] == "employer":
        employer = ProfileRepository().get_employer_by_user_id(user["id"])
        employer_id = employer["id"] if employer is not None else None
    result = SimulationService().run(payload.input)
    record = SimulationRepository().create(
        employer_id=employer_id,
        name=payload.name,
        input_data=payload.input.model_dump(),
        result_data=result.model_dump(),
        model_version=MODEL_VERSION,
    )
    return SimulationRecord(**record)


@router.get("", response_model=list[SimulationRecord])
def list_simulations(user: dict = Depends(get_current_user)) -> list[SimulationRecord]:
    employer_id = None
    if user["role"] == "employer":
        employer = ProfileRepository().get_employer_by_user_id(user["id"])
        employer_id = employer["id"] if employer is not None else None
    records = SimulationRepository().list(employer_id=employer_id)
    return [SimulationRecord(**record) for record in records]


@router.get("/{simulation_id}", response_model=SimulationRecord)
def get_simulation(simulation_id: int, user: dict = Depends(get_current_user)) -> SimulationRecord:
    record = SimulationRepository().get(simulation_id)
    if record is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Simulation not found")
    return SimulationRecord(**record)


@router.post("/preview", response_model=SimulationResult)
def preview_simulation(payload: SimulationCreate) -> SimulationResult:
    return SimulationService().run(payload.input)


@router.get("/{simulation_id}/actions")
def simulation_actions(simulation_id: int, user: dict = Depends(get_current_user)) -> dict:
    record = SimulationRepository().get(simulation_id)
    if record is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Simulation not found")
    result = SimulationResult(**record["result"])
    return {"recommendations": RecommendationService().generate_actions(result)}
