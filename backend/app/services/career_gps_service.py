from fastapi import HTTPException, status

from backend.app.repositories.career_gps import CareerGpsRepository
from backend.app.repositories.users import ProfileRepository
from backend.app.schemas.career_gps import (
    CareerConstraint,
    CareerConstraintsIn,
    CareerGoals,
    CareerGoalsIn,
    CareerGpsProfile,
    CareerNorthStarSummary,
    EmployeeCareerProfile,
    LifestylePriorities,
    LifestylePrioritiesIn,
    OnboardingProgress,
    OnboardingProgressIn,
)


class CareerGpsService:
    def __init__(self) -> None:
        self.profiles = ProfileRepository()
        self.career = CareerGpsRepository()

    def get_profile(self, user: dict) -> CareerGpsProfile:
        employee = self._employee(user)
        return self._profile_response(employee)

    def save_onboarding_progress(self, user: dict, payload: OnboardingProgressIn) -> OnboardingProgress:
        employee = self._employee(user)
        row = self.career.upsert_onboarding_progress(employee["id"], payload.model_dump())
        return OnboardingProgress(**row)

    def update_goals(self, user: dict, payload: CareerGoalsIn) -> CareerGoals:
        employee = self._employee(user)
        row = self.career.upsert_goals(employee["id"], payload.model_dump())
        if payload.target_role is not None and payload.target_role != employee.get("target_role"):
            self.profiles.update_employee_profile(
                user["id"],
                {
                    "full_name": employee["full_name"],
                    "location": employee.get("location"),
                    "target_role": payload.target_role,
                    "experience_years": employee.get("experience_years", 0),
                    "skills": employee.get("skills", []),
                },
            )
        return CareerGoals(**self._goals_with_defaults(employee["id"], row, employee))

    def update_lifestyle_priorities(self, user: dict, payload: LifestylePrioritiesIn) -> LifestylePriorities:
        employee = self._employee(user)
        row = self.career.upsert_lifestyle_priorities(employee["id"], payload.model_dump())
        return LifestylePriorities(**row)

    def update_constraints(self, user: dict, payload: CareerConstraintsIn) -> list[CareerConstraint]:
        employee = self._employee(user)
        rows = self.career.replace_constraints(
            employee["id"],
            [item.model_dump() for item in payload.constraints],
        )
        return [CareerConstraint(**row) for row in rows]

    def get_north_star_summary(self, user: dict) -> CareerNorthStarSummary:
        employee = self._employee(user)
        goals = self._goals_with_defaults(employee["id"], self.career.get_goals(employee["id"]), employee)
        lifestyle = self._lifestyle_with_defaults(employee["id"], self.career.get_lifestyle_priorities(employee["id"]))
        onboarding = self._onboarding_with_defaults(employee["id"], self.career.get_onboarding_progress(employee["id"]))
        return self._north_star(employee["id"], goals, lifestyle, onboarding)

    def _profile_response(self, employee: dict) -> CareerGpsProfile:
        goals = self._goals_with_defaults(employee["id"], self.career.get_goals(employee["id"]), employee)
        lifestyle = self._lifestyle_with_defaults(employee["id"], self.career.get_lifestyle_priorities(employee["id"]))
        onboarding = self._onboarding_with_defaults(employee["id"], self.career.get_onboarding_progress(employee["id"]))
        constraints = [CareerConstraint(**row) for row in self.career.list_constraints(employee["id"])]
        return CareerGpsProfile(
            employee=EmployeeCareerProfile(**employee),
            onboarding_progress=OnboardingProgress(**onboarding),
            goals=CareerGoals(**goals),
            lifestyle_priorities=LifestylePriorities(**lifestyle),
            constraints=constraints,
            north_star=self._north_star(employee["id"], goals, lifestyle, onboarding),
        )

    def _employee(self, user: dict) -> dict:
        employee = self.profiles.get_employee_by_user_id(user["id"])
        if employee is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee profile not found")
        return employee

    def _onboarding_with_defaults(self, employee_profile_id: int, row: dict | None) -> dict:
        if row is not None:
            return row
        return {
            "id": None,
            "employee_profile_id": employee_profile_id,
            "current_step": "north_star",
            "completed_steps": [],
            "is_complete": False,
            "last_completed_at": None,
        }

    def _goals_with_defaults(self, employee_profile_id: int, row: dict | None, employee: dict) -> dict:
        data = row or {}
        return {
            "id": data.get("id"),
            "employee_profile_id": employee_profile_id,
            "career_ambition": data.get("career_ambition"),
            "target_role": data.get("target_role") or employee.get("target_role"),
            "target_industry": data.get("target_industry"),
            "target_retirement_age": data.get("target_retirement_age"),
            "target_timeline_months": data.get("target_timeline_months"),
            "motivation": data.get("motivation"),
            "status": data.get("status") or "active",
        }

    def _lifestyle_with_defaults(self, employee_profile_id: int, row: dict | None) -> dict:
        if row is not None:
            return row
        return {
            "id": None,
            "employee_profile_id": employee_profile_id,
            "income_priority": 50,
            "work_life_balance_priority": 50,
            "leadership_priority": 50,
            "job_security_priority": 50,
            "remote_work_priority": 50,
            "international_mobility": False,
            "risk_tolerance": "moderate",
            "learning_budget": None,
            "preferred_company_type": None,
            "willing_to_relocate": False,
            "preferred_locations": [],
            "preferred_work_styles": [],
            "top_two_non_negotiable_priorities": [],
        }

    def _north_star(
        self,
        employee_profile_id: int,
        goals: dict,
        lifestyle: dict,
        onboarding: dict,
    ) -> CareerNorthStarSummary:
        missing_sections: list[str] = []
        if not goals.get("career_ambition"):
            missing_sections.append("career_ambition")
        if not goals.get("target_role"):
            missing_sections.append("target_role")
        if not goals.get("target_industry"):
            missing_sections.append("target_industry")
        if not lifestyle.get("top_two_non_negotiable_priorities"):
            missing_sections.append("top_two_non_negotiable_priorities")

        return CareerNorthStarSummary(
            employee_profile_id=employee_profile_id,
            career_ambition=goals.get("career_ambition"),
            target_role=goals.get("target_role"),
            target_industry=goals.get("target_industry"),
            target_retirement_age=goals.get("target_retirement_age"),
            target_timeline_months=goals.get("target_timeline_months"),
            income_priority=lifestyle["income_priority"],
            work_life_balance_priority=lifestyle["work_life_balance_priority"],
            leadership_priority=lifestyle["leadership_priority"],
            job_security_priority=lifestyle["job_security_priority"],
            remote_work_priority=lifestyle["remote_work_priority"],
            international_mobility=lifestyle["international_mobility"],
            risk_tolerance=lifestyle["risk_tolerance"],
            learning_budget=lifestyle.get("learning_budget"),
            preferred_company_type=lifestyle.get("preferred_company_type"),
            willing_to_relocate=lifestyle["willing_to_relocate"],
            top_two_non_negotiable_priorities=lifestyle["top_two_non_negotiable_priorities"],
            is_onboarding_complete=bool(onboarding.get("is_complete")) and not missing_sections,
            missing_sections=missing_sections,
        )
