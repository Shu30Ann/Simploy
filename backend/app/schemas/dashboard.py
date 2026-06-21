from pydantic import BaseModel

from backend.app.schemas.jobs import ApplicationDetail, Job
from backend.app.schemas.simulations import SimulationRecord


class EmployerMetrics(BaseModel):
    active_roles: int
    draft_roles: int
    applications: int
    qualified_matches: int


class EmployerDashboard(BaseModel):
    company_name: str
    metrics: EmployerMetrics
    jobs: list[Job]
    applications: list[ApplicationDetail]
    simulations: list[SimulationRecord]


class EmployeeDashboard(BaseModel):
    full_name: str
    target_role: str | None
    skills: list[str]
    jobs: list[Job]
    applications: list[ApplicationDetail]
