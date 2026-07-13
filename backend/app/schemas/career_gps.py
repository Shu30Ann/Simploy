from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator


RiskTolerance = Literal["low", "moderate", "high"]
CareerRouteType = Literal["recommended", "accelerated", "balanced"]
CareerGpsProgressStatus = Literal["not_started", "in_progress", "completed", "skipped"]
CareerGpsScenarioCode = Literal[
    "prioritise_salary",
    "prioritise_work_life_balance",
    "avoid_management",
    "relocate_country",
    "change_industry",
    "retire_earlier",
    "complete_masters_degree",
    "focus_entrepreneurship",
]
CareerBuddySender = Literal["employee", "assistant", "system"]
CareerBuddyConfidence = Literal["low", "medium", "high"]


class EmployeeCareerProfile(BaseModel):
    id: int
    user_id: int
    full_name: str
    location: str | None = None
    target_role: str | None = None
    experience_years: int
    skills: list[str] = Field(default_factory=list)
    created_at: str


class OnboardingProgressIn(BaseModel):
    current_step: str = Field(default="north_star", min_length=1, max_length=80)
    completed_steps: list[str] = Field(default_factory=list, max_length=24)
    is_complete: bool = False

    @field_validator("completed_steps")
    @classmethod
    def clean_completed_steps(cls, value: list[str]) -> list[str]:
        cleaned = [item.strip() for item in value if item.strip()]
        if len(cleaned) != len(set(cleaned)):
            raise ValueError("completed_steps must not contain duplicates")
        return cleaned


class OnboardingProgress(OnboardingProgressIn):
    id: int | None = None
    employee_profile_id: int
    last_completed_at: str | None = None


class CareerGoalsIn(BaseModel):
    career_ambition: str | None = Field(default=None, max_length=500)
    target_role: str | None = Field(default=None, max_length=160)
    target_industry: str | None = Field(default=None, max_length=120)
    target_retirement_age: int | None = Field(default=None, ge=45, le=80)
    target_timeline_months: int | None = Field(default=None, ge=1, le=480)
    motivation: str | None = Field(default=None, max_length=1000)

    @field_validator("career_ambition", "target_role", "target_industry", "motivation")
    @classmethod
    def strip_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip()
        return cleaned or None


class CareerGoals(CareerGoalsIn):
    id: int | None = None
    employee_profile_id: int
    status: str = "active"


class LifestylePrioritiesIn(BaseModel):
    income_priority: int = Field(default=50, ge=0, le=100)
    work_life_balance_priority: int = Field(default=50, ge=0, le=100)
    leadership_priority: int = Field(default=50, ge=0, le=100)
    job_security_priority: int = Field(default=50, ge=0, le=100)
    remote_work_priority: int = Field(default=50, ge=0, le=100)
    international_mobility: bool = False
    risk_tolerance: RiskTolerance = "moderate"
    learning_budget: int | None = Field(default=None, ge=0, le=1_000_000)
    preferred_company_type: str | None = Field(default=None, max_length=120)
    willing_to_relocate: bool = False
    preferred_locations: list[str] = Field(default_factory=list, max_length=12)
    preferred_work_styles: list[str] = Field(default_factory=list, max_length=8)
    top_two_non_negotiable_priorities: list[str] = Field(default_factory=list, max_length=2)

    @field_validator(
        "preferred_company_type",
        mode="before",
    )
    @classmethod
    def strip_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = str(value).strip()
        return cleaned or None

    @field_validator("preferred_locations", "preferred_work_styles", "top_two_non_negotiable_priorities")
    @classmethod
    def clean_string_list(cls, value: list[str]) -> list[str]:
        cleaned = [str(item).strip() for item in value if str(item).strip()]
        if len(cleaned) != len(set(cleaned)):
            raise ValueError("list values must not contain duplicates")
        return cleaned


class LifestylePriorities(LifestylePrioritiesIn):
    id: int | None = None
    employee_profile_id: int


class CareerConstraintIn(BaseModel):
    constraint_type: str = Field(min_length=1, max_length=80)
    label: str = Field(min_length=1, max_length=160)
    value: dict[str, Any] = Field(default_factory=dict)
    is_blocking: bool = False

    @field_validator("constraint_type", "label")
    @classmethod
    def strip_required_text(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("value must not be blank")
        return cleaned


class CareerConstraintsIn(BaseModel):
    constraints: list[CareerConstraintIn] = Field(default_factory=list, max_length=20)


class CareerConstraint(CareerConstraintIn):
    id: int | None = None
    employee_profile_id: int


class CareerNorthStarSummary(BaseModel):
    employee_profile_id: int
    career_ambition: str | None = None
    target_role: str | None = None
    target_industry: str | None = None
    target_retirement_age: int | None = None
    target_timeline_months: int | None = None
    income_priority: int
    work_life_balance_priority: int
    leadership_priority: int
    job_security_priority: int
    remote_work_priority: int
    international_mobility: bool
    risk_tolerance: RiskTolerance
    learning_budget: int | None = None
    preferred_company_type: str | None = None
    willing_to_relocate: bool
    top_two_non_negotiable_priorities: list[str] = Field(default_factory=list)
    is_onboarding_complete: bool
    missing_sections: list[str] = Field(default_factory=list)


class CareerGpsProfile(BaseModel):
    employee: EmployeeCareerProfile
    onboarding_progress: OnboardingProgress
    goals: CareerGoals
    lifestyle_priorities: LifestylePriorities
    constraints: list[CareerConstraint]
    north_star: CareerNorthStarSummary


class CareerGpsOccupationSummary(BaseModel):
    id: int
    slug: str
    title: str
    family: str
    seniority_level: str | None = None
    source_label: str = "illustrative_seed"


class CareerGpsSkillGap(BaseModel):
    skill_name: str
    skill_type: str
    priority: int
    proficiency_level: str


class CareerGpsMilestoneAction(BaseModel):
    action_type: str
    title: str
    description: str | None = None
    sequence: int
    estimated_hours: float | None = None
    resource_url: str | None = None


class CareerGpsMilestone(BaseModel):
    title: str
    description: str | None = None
    sequence: int
    duration_weeks: int | None = None
    focus_skill_name: str | None = None
    actions: list[CareerGpsMilestoneAction] = Field(default_factory=list)


class CareerGpsRouteScoreComponent(BaseModel):
    key: str
    label: str
    score: float = Field(ge=0, le=100)
    weight: float = Field(ge=0, le=1)
    explanation: str


class CareerGpsStoredScoreComponent(BaseModel):
    route_type: CareerRouteType
    component_key: str
    label: str
    score: float = Field(ge=0, le=100)
    weight: float = Field(ge=0, le=1)
    explanation: str


class CareerGpsRoute(BaseModel):
    route_type: CareerRouteType
    title: str
    summary: str
    score: float = Field(ge=0, le=100)
    estimated_months: int = Field(gt=0)
    target_occupation: CareerGpsOccupationSummary
    transition: dict[str, Any] | None = None
    skill_gaps: list[CareerGpsSkillGap] = Field(default_factory=list)
    milestones: list[CareerGpsMilestone] = Field(default_factory=list)
    score_components: list[CareerGpsRouteScoreComponent] = Field(default_factory=list)
    explanation: str


class CareerGpsNextBestAction(BaseModel):
    title: str
    description: str
    route_type: CareerRouteType


class CareerGpsSelectedRouteIn(BaseModel):
    selected_route_type: CareerRouteType


class CareerGpsProgressUpdateIn(BaseModel):
    route_type: CareerRouteType
    milestone_sequence: int = Field(gt=0)
    action_sequence: int | None = Field(default=None, gt=0)
    status: CareerGpsProgressStatus
    notes: str | None = Field(default=None, max_length=600)
    evidence_url: str | None = Field(default=None, max_length=500)
    completed_at: str | None = Field(default=None, max_length=40)

    @field_validator("notes", "evidence_url", "completed_at")
    @classmethod
    def strip_optional_progress_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip()
        return cleaned or None


class CareerGpsProgressEntry(BaseModel):
    id: int
    roadmap_id: int
    route_type: CareerRouteType
    milestone_sequence: int
    action_sequence: int | None = None
    status: CareerGpsProgressStatus
    progress_percent: float = Field(ge=0, le=100)
    notes: str | None = None
    evidence_url: str | None = None
    completed_at: str | None = None
    updated_at: str | None = None


class CareerGpsProgressResponse(BaseModel):
    roadmap_id: int
    entries: list[CareerGpsProgressEntry] = Field(default_factory=list)


class CareerGpsNextBestActionDetail(BaseModel):
    roadmap_id: int
    route_type: CareerRouteType
    milestone_sequence: int
    action_sequence: int
    action_title: str
    why_it_matters: str
    estimated_effort: str
    target_completion_date: str
    expected_impact: str
    related_milestone: str
    status: CareerGpsProgressStatus
    recommended_skill_gained: str
    selection_reason: str
    is_alternative: bool = False


class CareerGpsNextBestActionStatusIn(BaseModel):
    route_type: CareerRouteType
    milestone_sequence: int = Field(gt=0)
    action_sequence: int = Field(gt=0)
    status: CareerGpsProgressStatus


class CareerGpsMilestoneActionDetail(CareerGpsMilestoneAction):
    progress: CareerGpsProgressEntry | None = None


class CareerGpsMilestoneDetail(BaseModel):
    roadmap_id: int
    route_type: CareerRouteType
    milestone_sequence: int
    title: str
    why_recommended: str
    estimated_timeline: str
    required_skills: list[str] = Field(default_factory=list)
    existing_skills: list[str] = Field(default_factory=list)
    missing_skills: list[str] = Field(default_factory=list)
    recommended_certification: str
    recommended_experience: str
    suggested_project: str
    relevant_target_roles: list[str] = Field(default_factory=list)
    transition_difficulty: str
    lifestyle_impact: str
    confidence_level: str
    main_assumptions: list[str] = Field(default_factory=list)
    immediate_actions: list[CareerGpsMilestoneActionDetail] = Field(default_factory=list)
    milestone_progress: CareerGpsProgressEntry | None = None


class CareerGpsRoadmap(BaseModel):
    roadmap_id: int
    version: int
    scoring_version: str
    title: str
    summary: str
    fit_score: float = Field(ge=0, le=100)
    target_occupation_id: int | None = None
    routes: list[CareerGpsRoute] = Field(default_factory=list)
    score_components: list[CareerGpsStoredScoreComponent] = Field(default_factory=list)
    next_best_action: CareerGpsNextBestAction
    selected_route_type: CareerRouteType = "recommended"
    source_note: str


class CareerGpsWhatIfScenarioIn(BaseModel):
    scenario_name: str | None = Field(default=None, max_length=120)
    adjustments: list[CareerGpsScenarioCode] = Field(min_length=1, max_length=8)
    target_country: str | None = Field(default=None, max_length=80)
    target_industry: str | None = Field(default=None, max_length=120)
    target_retirement_age: int | None = Field(default=None, ge=45, le=80)
    target_timeline_months: int | None = Field(default=None, ge=1, le=480)

    @field_validator("adjustments")
    @classmethod
    def clean_adjustments(cls, value: list[CareerGpsScenarioCode]) -> list[CareerGpsScenarioCode]:
        if len(value) != len(set(value)):
            raise ValueError("adjustments must not contain duplicates")
        return value

    @field_validator("scenario_name", "target_country", "target_industry")
    @classmethod
    def strip_optional_scenario_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip()
        return cleaned or None


class CareerGpsWhatIfScenarioSummary(BaseModel):
    scenario_name: str
    adjustments: list[CareerGpsScenarioCode]
    applied_overrides: list[str] = Field(default_factory=list)


class CareerGpsWhatIfChange(BaseModel):
    category: str
    label: str
    before: str
    after: str
    changed: bool
    explanation: str


class CareerGpsWhatIfComparison(BaseModel):
    current_roadmap_id: int
    current_version: int
    preview_version: int
    changes: list[CareerGpsWhatIfChange]


class CareerGpsWhatIfPreview(BaseModel):
    scenario: CareerGpsWhatIfScenarioSummary
    preview_roadmap: CareerGpsRoadmap
    comparison: CareerGpsWhatIfComparison


class CareerGpsWhatIfApplyResponse(BaseModel):
    scenario: CareerGpsWhatIfScenarioSummary
    applied_roadmap: CareerGpsRoadmap
    comparison: CareerGpsWhatIfComparison
    message: str


class CareerBuddyStructuredResponse(BaseModel):
    answer: str = Field(min_length=1, max_length=2400)
    recommended_actions: list[str] = Field(default_factory=list, max_length=5)
    referenced_route_type: CareerRouteType | None = None
    confidence: CareerBuddyConfidence = "medium"
    used_context: list[str] = Field(default_factory=list, max_length=8)
    safety_notes: list[str] = Field(default_factory=list, max_length=5)

    @field_validator("answer")
    @classmethod
    def strip_answer(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("answer must not be blank")
        return cleaned

    @field_validator("recommended_actions", "used_context", "safety_notes")
    @classmethod
    def clean_response_lists(cls, value: list[str]) -> list[str]:
        return [str(item).strip()[:220] for item in value if str(item).strip()]


class CareerBuddyConversationCreateIn(BaseModel):
    roadmap_id: int | None = None
    title: str | None = Field(default=None, max_length=120)

    @field_validator("title")
    @classmethod
    def strip_optional_title(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip()
        return cleaned or None


class CareerBuddyConversation(BaseModel):
    id: int
    employee_profile_id: int
    roadmap_id: int | None = None
    title: str
    status: str
    created_at: str
    updated_at: str


class CareerBuddyMessage(BaseModel):
    id: int
    conversation_id: int
    sender: CareerBuddySender
    content: str
    structured_response: dict[str, Any] = Field(default_factory=dict)
    provider: str
    model: str | None = None
    created_at: str


class CareerBuddyConversationDetail(CareerBuddyConversation):
    messages: list[CareerBuddyMessage] = Field(default_factory=list)


class CareerBuddyMessageIn(BaseModel):
    conversation_id: int | None = None
    roadmap_id: int | None = None
    route_type: CareerRouteType = "recommended"
    message: str = Field(min_length=1, max_length=800)

    @field_validator("message")
    @classmethod
    def strip_message(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("message must not be blank")
        return cleaned


class CareerBuddyReply(BaseModel):
    conversation: CareerBuddyConversation
    user_message: CareerBuddyMessage
    assistant_message: CareerBuddyMessage
    response: CareerBuddyStructuredResponse
    provider: str
    model: str | None = None
    rate_limit_remaining: int
