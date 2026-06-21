from typing import Literal

from pydantic import BaseModel, Field


JobStatus = Literal["draft", "open", "closed"]
ApplicationStatus = Literal["submitted", "reviewing", "interview", "offered", "rejected", "withdrawn"]


class Department(BaseModel):
    id: int
    employer_id: int
    name: str


class JobCreate(BaseModel):
    title: str
    description: str
    department_name: str | None = None
    required_skills: list[str] = []
    work_style: str = "Hybrid"
    location: str | None = None
    salary_min: int | None = Field(default=None, ge=0)
    salary_max: int | None = Field(default=None, ge=0)
    status: JobStatus = "draft"


class Job(JobCreate):
    id: int
    employer_id: int
    department_id: int | None = None
    applications_count: int = 0
    created_at: str


class Application(BaseModel):
    id: int
    job_id: int
    employee_id: int
    status: ApplicationStatus
    match_score: float
    created_at: str


class ApplicationDetail(Application):
    job_title: str
    work_style: str
    location: str | None = None
    required_skills: list[str] = []
    company_name: str | None = None
    candidate_name: str | None = None
