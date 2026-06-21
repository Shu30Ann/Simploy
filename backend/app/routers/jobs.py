import sqlite3

from fastapi import APIRouter, Depends, HTTPException, Query, status

from backend.app.dependencies import require_role
from backend.app.repositories.jobs import JobRepository
from backend.app.repositories.users import ProfileRepository
from backend.app.schemas.jobs import Application, Job, JobCreate
from backend.app.schemas.predictions import JobMatchRequest
from backend.app.services.prediction_service import PredictionService

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.post("", response_model=Job)
def create_job(payload: JobCreate, user: dict = Depends(require_role("employer"))) -> Job:
    employer = ProfileRepository().get_employer_by_user_id(user["id"])
    if employer is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employer profile not found")
    job = JobRepository().create(employer["id"], payload.model_dump())
    return Job(**job)


@router.get("", response_model=list[Job])
def list_jobs(status_filter: str | None = Query(default=None, alias="status")) -> list[Job]:
    jobs = JobRepository().list(status=status_filter)
    return [Job(**job) for job in jobs]


@router.get("/{job_id}", response_model=Job)
def get_job(job_id: int) -> Job:
    job = JobRepository().get(job_id)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    return Job(**job)


@router.post("/{job_id}/apply", response_model=Application)
def apply_to_job(job_id: int, user: dict = Depends(require_role("employee"))) -> Application:
    profiles = ProfileRepository()
    employee = profiles.get_employee_by_user_id(user["id"])
    if employee is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee profile not found")

    repo = JobRepository()
    job = repo.get(job_id)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    score = PredictionService().score_job_match(
        JobMatchRequest(
            candidate_skills=employee["skills"],
            required_skills=job["required_skills"],
            experience_years=employee["experience_years"],
            required_experience_years=2,
        )
    )
    try:
        application = repo.create_application(job_id, employee["id"], score.match_score)
    except sqlite3.IntegrityError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="You have already applied to this job") from exc
    return Application(**application)
