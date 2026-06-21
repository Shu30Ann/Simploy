from fastapi import APIRouter, Depends, HTTPException, status

from backend.app.dependencies import require_role
from backend.app.repositories.jobs import JobRepository
from backend.app.repositories.simulations import SimulationRepository
from backend.app.repositories.users import ProfileRepository
from backend.app.schemas.dashboard import EmployeeDashboard, EmployerDashboard, EmployerMetrics
from backend.app.schemas.jobs import ApplicationDetail, Job
from backend.app.schemas.simulations import SimulationRecord

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/employer", response_model=EmployerDashboard)
def employer_dashboard(user: dict = Depends(require_role("employer"))) -> EmployerDashboard:
    profiles = ProfileRepository()
    employer = profiles.get_employer_by_user_id(user["id"])
    if employer is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employer profile not found")

    jobs_repo = JobRepository()
    counts = jobs_repo.count_by_employer(employer["id"])
    jobs = [Job(**job) for job in jobs_repo.list(employer_id=employer["id"])]
    applications = [
        ApplicationDetail(**application)
        for application in jobs_repo.list_applications_for_employer(employer["id"])
    ]
    simulations = [
        SimulationRecord(**record)
        for record in SimulationRepository().list(employer_id=employer["id"])
    ]

    return EmployerDashboard(
        company_name=employer["company_name"],
        metrics=EmployerMetrics(
            active_roles=counts["open"],
            draft_roles=counts["draft"],
            applications=counts["applications"],
            qualified_matches=sum(1 for item in applications if item.match_score >= 70),
        ),
        jobs=jobs,
        applications=applications,
        simulations=simulations,
    )


@router.get("/employee", response_model=EmployeeDashboard)
def employee_dashboard(user: dict = Depends(require_role("employee"))) -> EmployeeDashboard:
    employee = ProfileRepository().get_employee_by_user_id(user["id"])
    if employee is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee profile not found")

    jobs_repo = JobRepository()
    return EmployeeDashboard(
        full_name=employee["full_name"],
        target_role=employee.get("target_role"),
        skills=employee["skills"],
        jobs=[Job(**job) for job in jobs_repo.list(status="open")],
        applications=[
            ApplicationDetail(**application)
            for application in jobs_repo.list_applications_for_employee(employee["id"])
        ],
    )
