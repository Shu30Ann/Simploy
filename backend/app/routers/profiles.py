from fastapi import APIRouter, Depends, HTTPException, status

from backend.app.dependencies import require_role
from backend.app.repositories.users import ProfileRepository
from backend.app.schemas.profiles import (
    EmployeeProfile,
    EmployeeProfileIn,
    EmployerProfile,
    EmployerProfileIn,
)

router = APIRouter(tags=["profiles"])


@router.get("/employees/me", response_model=EmployeeProfile)
def get_employee_profile(user: dict = Depends(require_role("employee"))) -> EmployeeProfile:
    profile = ProfileRepository().get_employee_by_user_id(user["id"])
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee profile not found")
    return EmployeeProfile(**profile)


@router.put("/employees/me", response_model=EmployeeProfile)
def update_employee_profile(
    payload: EmployeeProfileIn,
    user: dict = Depends(require_role("employee")),
) -> EmployeeProfile:
    profile = ProfileRepository().update_employee_profile(user["id"], payload.model_dump())
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee profile not found")
    return EmployeeProfile(**profile)


@router.get("/employers/me", response_model=EmployerProfile)
def get_employer_profile(user: dict = Depends(require_role("employer"))) -> EmployerProfile:
    profile = ProfileRepository().get_employer_by_user_id(user["id"])
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employer profile not found")
    return EmployerProfile(**profile)


@router.put("/employers/me", response_model=EmployerProfile)
def update_employer_profile(
    payload: EmployerProfileIn,
    user: dict = Depends(require_role("employer")),
) -> EmployerProfile:
    profile = ProfileRepository().update_employer_profile(user["id"], payload.model_dump())
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employer profile not found")
    return EmployerProfile(**profile)
