from pydantic import BaseModel, Field
from fastapi import FastAPI

from app.services.baseline_models import predict_job_match, predict_skill_gap


class JobMatchPayload(BaseModel):
    candidate_skills: list[str]
    required_skills: list[str]
    experience_years: int = Field(default=0, ge=0)
    required_experience_years: int = Field(default=0, ge=0)


class SkillGapPayload(BaseModel):
    current_skills: list[str]
    target_skills: list[str]


app = FastAPI(
    title="Simploy AI Engine",
    version="0.1.0",
    description="Prediction service boundary for Simploy ML workloads.",
)


@app.get("/")
def health() -> dict:
    return {"status": "ok", "service": "Simploy AI Engine"}


@app.post("/predict/job-match")
def job_match(payload: JobMatchPayload) -> dict:
    return predict_job_match(
        candidate_skills=payload.candidate_skills,
        required_skills=payload.required_skills,
        experience_years=payload.experience_years,
        required_experience_years=payload.required_experience_years,
    )


@app.post("/predict/skill-gap")
def skill_gap(payload: SkillGapPayload) -> dict:
    return predict_skill_gap(payload.current_skills, payload.target_skills)
