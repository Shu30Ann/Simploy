from fastapi import APIRouter, Depends

from backend.app.dependencies import require_role
from backend.app.schemas.career_gps import (
    CareerBuddyConversation,
    CareerBuddyConversationCreateIn,
    CareerBuddyConversationDetail,
    CareerBuddyMessageIn,
    CareerBuddyReply,
    CareerConstraint,
    CareerConstraintsIn,
    CareerGoals,
    CareerGoalsIn,
    CareerGpsProfile,
    CareerGpsMilestoneDetail,
    CareerGpsNextBestActionDetail,
    CareerGpsNextBestActionStatusIn,
    CareerGpsProgressEntry,
    CareerGpsProgressResponse,
    CareerGpsProgressUpdateIn,
    CareerGpsRoadmap,
    CareerGpsSelectedRouteIn,
    CareerGpsWhatIfApplyResponse,
    CareerGpsWhatIfPreview,
    CareerGpsWhatIfScenarioIn,
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


@router.post("/roadmaps/generate", response_model=CareerGpsRoadmap)
def generate_roadmap(user: dict = Depends(require_role("employee"))) -> CareerGpsRoadmap:
    return CareerGpsService().generate_roadmap(user)


@router.post("/roadmaps/what-if/preview", response_model=CareerGpsWhatIfPreview)
def preview_what_if_scenario(
    payload: CareerGpsWhatIfScenarioIn,
    user: dict = Depends(require_role("employee")),
) -> CareerGpsWhatIfPreview:
    return CareerGpsService().preview_what_if_scenario(user, payload)


@router.post("/roadmaps/what-if/apply", response_model=CareerGpsWhatIfApplyResponse)
def apply_what_if_scenario(
    payload: CareerGpsWhatIfScenarioIn,
    user: dict = Depends(require_role("employee")),
) -> CareerGpsWhatIfApplyResponse:
    return CareerGpsService().apply_what_if_scenario(user, payload)


@router.get("/roadmaps/latest", response_model=CareerGpsRoadmap)
def get_latest_roadmap(user: dict = Depends(require_role("employee"))) -> CareerGpsRoadmap:
    return CareerGpsService().get_latest_roadmap(user)


@router.get("/roadmaps/{roadmap_id}", response_model=CareerGpsRoadmap)
def get_roadmap(roadmap_id: int, user: dict = Depends(require_role("employee"))) -> CareerGpsRoadmap:
    return CareerGpsService().get_roadmap(user, roadmap_id)


@router.put("/roadmaps/{roadmap_id}/selected-route", response_model=CareerGpsRoadmap)
def update_selected_route(
    roadmap_id: int,
    payload: CareerGpsSelectedRouteIn,
    user: dict = Depends(require_role("employee")),
) -> CareerGpsRoadmap:
    return CareerGpsService().update_selected_route(user, roadmap_id, payload)


@router.get("/roadmaps/{roadmap_id}/next-best-action", response_model=CareerGpsNextBestActionDetail)
def get_next_best_action(
    roadmap_id: int,
    user: dict = Depends(require_role("employee")),
) -> CareerGpsNextBestActionDetail:
    return CareerGpsService().get_next_best_action(user, roadmap_id)


@router.put("/roadmaps/{roadmap_id}/next-best-action/status", response_model=CareerGpsNextBestActionDetail)
def update_next_best_action_status(
    roadmap_id: int,
    payload: CareerGpsNextBestActionStatusIn,
    user: dict = Depends(require_role("employee")),
) -> CareerGpsNextBestActionDetail:
    return CareerGpsService().update_next_best_action_status(user, roadmap_id, payload)


@router.post("/roadmaps/{roadmap_id}/next-best-action/alternative", response_model=CareerGpsNextBestActionDetail)
def get_alternative_next_best_action(
    roadmap_id: int,
    user: dict = Depends(require_role("employee")),
) -> CareerGpsNextBestActionDetail:
    return CareerGpsService().get_next_best_action(user, roadmap_id, alternative=True)


@router.get("/roadmaps/{roadmap_id}/progress", response_model=CareerGpsProgressResponse)
def get_roadmap_progress(
    roadmap_id: int,
    user: dict = Depends(require_role("employee")),
) -> CareerGpsProgressResponse:
    return CareerGpsService().get_roadmap_progress(user, roadmap_id)


@router.put("/roadmaps/{roadmap_id}/progress/actions", response_model=CareerGpsProgressEntry)
def update_action_progress(
    roadmap_id: int,
    payload: CareerGpsProgressUpdateIn,
    user: dict = Depends(require_role("employee")),
) -> CareerGpsProgressEntry:
    return CareerGpsService().update_action_progress(user, roadmap_id, payload)


@router.put("/roadmaps/{roadmap_id}/progress/milestones", response_model=CareerGpsProgressEntry)
def update_milestone_progress(
    roadmap_id: int,
    payload: CareerGpsProgressUpdateIn,
    user: dict = Depends(require_role("employee")),
) -> CareerGpsProgressEntry:
    return CareerGpsService().update_milestone_progress(user, roadmap_id, payload)


@router.get(
    "/roadmaps/{roadmap_id}/milestones/{route_type}/{milestone_sequence}",
    response_model=CareerGpsMilestoneDetail,
)
def get_milestone_detail(
    roadmap_id: int,
    route_type: str,
    milestone_sequence: int,
    user: dict = Depends(require_role("employee")),
) -> CareerGpsMilestoneDetail:
    return CareerGpsService().get_milestone_detail(user, roadmap_id, route_type, milestone_sequence)


@router.get("/career-buddy/conversations", response_model=list[CareerBuddyConversation])
def list_career_buddy_conversations(
    user: dict = Depends(require_role("employee")),
) -> list[CareerBuddyConversation]:
    return CareerGpsService().list_buddy_conversations(user)


@router.post("/career-buddy/conversations", response_model=CareerBuddyConversation)
def create_career_buddy_conversation(
    payload: CareerBuddyConversationCreateIn,
    user: dict = Depends(require_role("employee")),
) -> CareerBuddyConversation:
    return CareerGpsService().create_buddy_conversation(user, payload)


@router.get("/career-buddy/conversations/{conversation_id}", response_model=CareerBuddyConversationDetail)
def get_career_buddy_conversation(
    conversation_id: int,
    user: dict = Depends(require_role("employee")),
) -> CareerBuddyConversationDetail:
    return CareerGpsService().get_buddy_conversation(user, conversation_id)


@router.post("/career-buddy/messages", response_model=CareerBuddyReply)
def send_career_buddy_message(
    payload: CareerBuddyMessageIn,
    user: dict = Depends(require_role("employee")),
) -> CareerBuddyReply:
    return CareerGpsService().send_buddy_message(user, payload)
