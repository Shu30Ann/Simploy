from fastapi import APIRouter, Depends, HTTPException, status

from backend.app.dependencies import require_role
from backend.app.repositories.jobs import JobRepository
from backend.app.repositories.users import ProfileRepository
from backend.app.schemas.jobs import ApplicationDetail

router = APIRouter(prefix="/applications", tags=["applications"])


@router.get("/me", response_model=list[ApplicationDetail])
def my_applications(user: dict = Depends(require_role("employee"))) -> list[ApplicationDetail]:
    employee = ProfileRepository().get_employee_by_user_id(user["id"])
    if employee is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee profile not found")
    applications = JobRepository().list_applications_for_employee(employee["id"])
    return [ApplicationDetail(**application) for application in applications]


@router.get("/employer", response_model=list[ApplicationDetail])
def employer_applications(user: dict = Depends(require_role("employer"))) -> list[ApplicationDetail]:
    employer = ProfileRepository().get_employer_by_user_id(user["id"])
    if employer is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employer profile not found")
    applications = JobRepository().list_applications_for_employer(employer["id"])
    return [ApplicationDetail(**application) for application in applications]
