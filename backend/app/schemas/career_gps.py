from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator


RiskTolerance = Literal["low", "moderate", "high"]


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
