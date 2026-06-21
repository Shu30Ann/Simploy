from fastapi import APIRouter

from backend.app.schemas.predictions import (
    JobMatchRequest,
    JobMatchResponse,
    SkillGapRequest,
    SkillGapResponse,
)
from backend.app.services.prediction_service import PredictionService

router = APIRouter(prefix="/predictions", tags=["predictions"])


@router.post("/job-match", response_model=JobMatchResponse)
def job_match(payload: JobMatchRequest) -> JobMatchResponse:
    return PredictionService().score_job_match(payload)


@router.post("/skill-gap", response_model=SkillGapResponse)
def skill_gap(payload: SkillGapRequest) -> SkillGapResponse:
    return PredictionService().score_skill_gap(payload)
