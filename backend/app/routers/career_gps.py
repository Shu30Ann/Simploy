from fastapi import APIRouter, Depends

from backend.app.dependencies import require_role
from backend.app.schemas.career_gps import (
    CareerConstraint,
    CareerConstraintsIn,
    CareerGoals,
    CareerGoalsIn,
    CareerGpsProfile,
    CareerNorthStarSummary,
    LifestylePriorities,
    LifestylePrioritiesIn,
    OnboardingProgress,
    OnboardingProgressIn,
)
from backend.app.services.career_gps_service import CareerGpsService

router = APIRouter(prefix="/career-gps", tags=["career-gps"])


@router.get("/profile", response_model=CareerGpsProfile)
def get_career_profile(user: dict = Depends(require_role("employee"))) -> CareerGpsProfile:
    return CareerGpsService().get_profile(user)


@router.put("/onboarding-progress", response_model=OnboardingProgress)
def save_onboarding_progress(
    payload: OnboardingProgressIn,
    user: dict = Depends(require_role("employee")),
) -> OnboardingProgress:
    return CareerGpsService().save_onboarding_progress(user, payload)


@router.put("/goals", response_model=CareerGoals)
def update_career_goals(
    payload: CareerGoalsIn,
    user: dict = Depends(require_role("employee")),
) -> CareerGoals:
    return CareerGpsService().update_goals(user, payload)


@router.put("/lifestyle-priorities", response_model=LifestylePriorities)
def update_lifestyle_priorities(
    payload: LifestylePrioritiesIn,
    user: dict = Depends(require_role("employee")),
) -> LifestylePriorities:
    return CareerGpsService().update_lifestyle_priorities(user, payload)


@router.put("/constraints", response_model=list[CareerConstraint])
def update_constraints(
    payload: CareerConstraintsIn,
    user: dict = Depends(require_role("employee")),
) -> list[CareerConstraint]:
    return CareerGpsService().update_constraints(user, payload)


@router.get("/north-star", response_model=CareerNorthStarSummary)
def get_north_star_summary(user: dict = Depends(require_role("employee"))) -> CareerNorthStarSummary:
    return CareerGpsService().get_north_star_summary(user)
