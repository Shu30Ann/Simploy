import copy
from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import HTTPException, status

from backend.app.core.config import settings
from backend.app.repositories.career_gps import CareerGpsRepository
from backend.app.repositories.users import ProfileRepository
from backend.app.schemas.career_gps import (
    CareerBuddyConversation,
    CareerBuddyConversationCreateIn,
    CareerBuddyConversationDetail,
    CareerBuddyMessage,
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
    CareerGpsWhatIfChange,
    CareerGpsWhatIfComparison,
    CareerGpsWhatIfPreview,
    CareerGpsWhatIfScenarioIn,
    CareerGpsWhatIfScenarioSummary,
    CareerNorthStarSummary,
    EmployeeCareerProfile,
    LifestylePriorities,
    LifestylePrioritiesIn,
    OnboardingProgress,
    OnboardingProgressIn,
)
from backend.app.services.career_buddy_ai import CareerBuddyAiService
from backend.app.services.career_route_engine import CareerRouteEngine


class CareerGpsService:
    def __init__(self) -> None:
        self.profiles = ProfileRepository()
        self.career = CareerGpsRepository()
        self.route_engine = CareerRouteEngine()
        self.career_buddy = CareerBuddyAiService()

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

    def generate_roadmap(self, user: dict) -> CareerGpsRoadmap:
        employee = self._employee(user)
        goals = self._goals_with_defaults(employee["id"], self.career.get_goals(employee["id"]), employee)
        lifestyle = self._lifestyle_with_defaults(employee["id"], self.career.get_lifestyle_priorities(employee["id"]))
        constraints = self.career.list_constraints(employee["id"])
        generated = self._generate_from_inputs(
            employee=employee,
            goals=goals,
            lifestyle=lifestyle,
            constraints=constraints,
        )
        saved = self.career.save_generated_roadmap(
            employee_profile_id=employee["id"],
            north_star_setting_id=goals.get("id"),
            generated=generated,
        )
        return CareerGpsRoadmap(**saved)

    def preview_what_if_scenario(self, user: dict, payload: CareerGpsWhatIfScenarioIn) -> CareerGpsWhatIfPreview:
        employee = self._employee(user)
        current = self.career.get_latest_roadmap_snapshot(employee["id"])
        if current is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Generate an active Career GPS roadmap before previewing a what-if scenario.",
            )
        goals = self._goals_with_defaults(employee["id"], self.career.get_goals(employee["id"]), employee)
        lifestyle = self._lifestyle_with_defaults(employee["id"], self.career.get_lifestyle_priorities(employee["id"]))
        constraints = self.career.list_constraints(employee["id"])
        scenario_employee, scenario_goals, scenario_lifestyle, scenario_constraints, scenario = self._scenario_inputs(
            employee=employee,
            goals=goals,
            lifestyle=lifestyle,
            constraints=constraints,
            payload=payload,
        )
        generated = self._generate_from_inputs(
            employee=scenario_employee,
            goals=scenario_goals,
            lifestyle=scenario_lifestyle,
            constraints=scenario_constraints,
        )
        preview_snapshot = {
            **generated,
            "roadmap_id": current["roadmap_id"],
            "version": int(current["version"]) + 1,
            "source_note": (
                f"{generated['source_note']} This what-if preview has not been applied and does not overwrite the active roadmap."
            ),
        }
        return CareerGpsWhatIfPreview(
            scenario=scenario,
            preview_roadmap=CareerGpsRoadmap(**preview_snapshot),
            comparison=self._compare_roadmaps(current, preview_snapshot),
        )

    def apply_what_if_scenario(self, user: dict, payload: CareerGpsWhatIfScenarioIn) -> CareerGpsWhatIfApplyResponse:
        employee = self._employee(user)
        current = self.career.get_latest_roadmap_snapshot(employee["id"])
        if current is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Generate an active Career GPS roadmap before applying a what-if scenario.",
            )
        goals = self._goals_with_defaults(employee["id"], self.career.get_goals(employee["id"]), employee)
        lifestyle = self._lifestyle_with_defaults(employee["id"], self.career.get_lifestyle_priorities(employee["id"]))
        constraints = self.career.list_constraints(employee["id"])
        scenario_employee, scenario_goals, scenario_lifestyle, scenario_constraints, scenario = self._scenario_inputs(
            employee=employee,
            goals=goals,
            lifestyle=lifestyle,
            constraints=constraints,
            payload=payload,
        )
        generated = self._generate_from_inputs(
            employee=scenario_employee,
            goals=scenario_goals,
            lifestyle=scenario_lifestyle,
            constraints=scenario_constraints,
        )
        saved = self.career.save_generated_roadmap(
            employee_profile_id=employee["id"],
            north_star_setting_id=goals.get("id"),
            generated=generated,
            change_summary=f"Applied what-if scenario: {scenario.scenario_name}.",
        )
        return CareerGpsWhatIfApplyResponse(
            scenario=scenario,
            applied_roadmap=CareerGpsRoadmap(**saved),
            comparison=self._compare_roadmaps(current, saved),
            message=f"Scenario applied as roadmap version {saved['version']}. Previous versions remain in roadmap history.",
        )

    def _generate_from_inputs(
        self,
        *,
        employee: dict,
        goals: dict,
        lifestyle: dict,
        constraints: list[dict],
    ) -> dict:
        occupations = self.career.list_occupations()
        occupation_skills = self.career.list_occupation_skills()
        transitions = self.career.list_career_transitions()
        if not occupations:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Career GPS occupation reference data is not available.",
            )
        try:
            generated = self.route_engine.generate(
                employee=employee,
                goals=goals,
                lifestyle=lifestyle,
                constraints=constraints,
                occupations=occupations,
                occupation_skills=occupation_skills,
                transitions=transitions,
            )
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc
        return generated

    def get_latest_roadmap(self, user: dict) -> CareerGpsRoadmap:
        employee = self._employee(user)
        snapshot = self.career.get_latest_roadmap_snapshot(employee["id"])
        if snapshot is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Career GPS roadmap not found")
        return CareerGpsRoadmap(**snapshot)

    def get_roadmap(self, user: dict, roadmap_id: int) -> CareerGpsRoadmap:
        employee = self._employee(user)
        snapshot = self.career.get_roadmap_snapshot(employee["id"], roadmap_id)
        if snapshot is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Career GPS roadmap not found")
        return CareerGpsRoadmap(**snapshot)

    def update_selected_route(
        self,
        user: dict,
        roadmap_id: int,
        payload: CareerGpsSelectedRouteIn,
    ) -> CareerGpsRoadmap:
        employee = self._employee(user)
        snapshot = self.career.get_roadmap_snapshot(employee["id"], roadmap_id)
        if snapshot is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Career GPS roadmap not found")
        route_types = {route.get("route_type") for route in snapshot.get("routes", [])}
        if payload.selected_route_type not in route_types:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Selected route is not available on this roadmap.",
            )
        updated = self.career.update_selected_route(
            employee_profile_id=employee["id"],
            roadmap_id=roadmap_id,
            selected_route_type=payload.selected_route_type,
        )
        if updated is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Career GPS roadmap not found")
        return CareerGpsRoadmap(**updated)

    def get_roadmap_progress(self, user: dict, roadmap_id: int) -> CareerGpsProgressResponse:
        employee = self._employee(user)
        rows = self.career.list_roadmap_progress(employee["id"], roadmap_id)
        if rows is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Career GPS roadmap not found")
        return CareerGpsProgressResponse(
            roadmap_id=roadmap_id,
            entries=[CareerGpsProgressEntry(**row) for row in rows],
        )

    def update_action_progress(
        self,
        user: dict,
        roadmap_id: int,
        payload: CareerGpsProgressUpdateIn,
    ) -> CareerGpsProgressEntry:
        if payload.action_sequence is None:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="action_sequence is required")
        return self._save_progress(user, roadmap_id, payload)

    def update_milestone_progress(
        self,
        user: dict,
        roadmap_id: int,
        payload: CareerGpsProgressUpdateIn,
    ) -> CareerGpsProgressEntry:
        if payload.action_sequence is not None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="action_sequence is not allowed for milestone progress",
            )
        employee = self._employee(user)
        context = self.career.get_milestone_context(
            employee_profile_id=employee["id"],
            roadmap_id=roadmap_id,
            route_type=payload.route_type,
            milestone_sequence=payload.milestone_sequence,
        )
        if context is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found")
        if payload.status == "completed":
            rows = self.career.list_roadmap_progress(employee["id"], roadmap_id) or []
            action_sequences = {int(action["sequence"]) for action in context["actions"]}
            completed_actions = {
                int(row["action_sequence"])
                for row in rows
                if row.get("route_type") == payload.route_type
                and int(row.get("milestone_sequence") or 0) == payload.milestone_sequence
                and row.get("action_sequence") is not None
                and row.get("status") == "completed"
            }
            if action_sequences and not action_sequences.issubset(completed_actions):
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="Complete all milestone actions before marking the milestone complete.",
                )
        return self._save_progress(user, roadmap_id, payload, employee=employee)

    def get_milestone_detail(
        self,
        user: dict,
        roadmap_id: int,
        route_type: str,
        milestone_sequence: int,
    ) -> CareerGpsMilestoneDetail:
        employee = self._employee(user)
        roadmap = self.career.get_roadmap_snapshot(employee["id"], roadmap_id)
        if roadmap is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Career GPS roadmap not found")
        route = self._selected_route(roadmap, route_type)
        if route is None or route.get("route_type") != route_type:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Route not found")
        milestone = next(
            (item for item in route.get("milestones", []) if int(item.get("sequence", 0)) == milestone_sequence),
            None,
        )
        if milestone is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found")

        progress_rows = self.career.list_roadmap_progress(employee["id"], roadmap_id) or []
        milestone_progress = next(
            (
                row
                for row in progress_rows
                if row.get("route_type") == route_type
                and int(row.get("milestone_sequence") or 0) == milestone_sequence
                and row.get("action_sequence") is None
            ),
            None,
        )
        action_progress = {
            int(row["action_sequence"]): row
            for row in progress_rows
            if row.get("route_type") == route_type
            and int(row.get("milestone_sequence") or 0) == milestone_sequence
            and row.get("action_sequence") is not None
        }
        required_skills = [gap["skill_name"] for gap in route.get("skill_gaps", [])]
        existing_skills = [str(skill) for skill in employee.get("skills", [])]
        focus_skill = milestone.get("focus_skill_name")
        project_action = next(
            (action for action in milestone.get("actions", []) if action.get("action_type") == "project"),
            None,
        )
        transition_difficulty = self._component_label(route, "transition_difficulty")
        lifestyle_impact = (
            f"{self._component_label(route, 'lifestyle_fit')} / "
            f"{self._component_label(route, 'work_life_balance_fit')}"
        )
        immediate_actions = []
        for action in milestone.get("actions", []):
            progress = action_progress.get(int(action.get("sequence", 0)))
            immediate_actions.append(
                {
                    **action,
                    "progress": CareerGpsProgressEntry(**progress) if progress else None,
                }
            )
        return CareerGpsMilestoneDetail(
            roadmap_id=roadmap_id,
            route_type=route_type,  # type: ignore[arg-type]
            milestone_sequence=milestone_sequence,
            title=milestone["title"],
            why_recommended=milestone.get("description") or route["explanation"],
            estimated_timeline=f"{milestone.get('duration_weeks') or 4} weeks",
            required_skills=required_skills,
            existing_skills=existing_skills,
            missing_skills=required_skills,
            recommended_certification="No mandatory certification is stored for this route.",
            recommended_experience=(
                f"Complete one applied {route['target_occupation']['family']} work sample before moving to the next milestone."
            ),
            suggested_project=(
                project_action.get("title")
                if project_action
                else f"Build evidence for {focus_skill or route['target_occupation']['title']}."
            ),
            relevant_target_roles=[item["target_occupation"]["title"] for item in roadmap.get("routes", [])],
            transition_difficulty=transition_difficulty,
            lifestyle_impact=lifestyle_impact,
            confidence_level=self._confidence_level(float(route.get("score", 0))),
            main_assumptions=[
                "Scores are deterministic planning scores from saved profile, route, and illustrative occupation data.",
                "Occupation and transition references are illustrative seed data, not verified labor-market data.",
                "No salary data is shown because no validated salary source is attached to this roadmap.",
            ],
            immediate_actions=immediate_actions,
            milestone_progress=CareerGpsProgressEntry(**milestone_progress) if milestone_progress else None,
        )

    def _save_progress(
        self,
        user: dict,
        roadmap_id: int,
        payload: CareerGpsProgressUpdateIn,
        employee: dict | None = None,
    ) -> CareerGpsProgressEntry:
        employee = employee or self._employee(user)
        completed_at = self._completion_timestamp(payload)
        row = self.career.upsert_progress(
            employee_profile_id=employee["id"],
            roadmap_id=roadmap_id,
            route_type=payload.route_type,
            milestone_sequence=payload.milestone_sequence,
            action_sequence=payload.action_sequence,
            status_value=payload.status,
            notes=payload.notes,
            evidence_url=payload.evidence_url,
            completed_at=completed_at,
        )
        if row is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Roadmap progress target not found")
        return CareerGpsProgressEntry(**row)

    def get_next_best_action(
        self,
        user: dict,
        roadmap_id: int,
        *,
        alternative: bool = False,
    ) -> CareerGpsNextBestActionDetail:
        employee = self._employee(user)
        roadmap = self.career.get_roadmap_snapshot(employee["id"], roadmap_id)
        if roadmap is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Career GPS roadmap not found")
        progress_rows = self.career.list_roadmap_progress(employee["id"], roadmap_id) or []
        profile = self._profile_response(employee)
        candidate = self._choose_next_best_action(
            roadmap=roadmap,
            progress_rows=progress_rows,
            profile=profile.model_dump(),
            alternative=alternative,
        )
        if candidate is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No available next action found for this roadmap.",
            )
        return CareerGpsNextBestActionDetail(**candidate)

    def update_next_best_action_status(
        self,
        user: dict,
        roadmap_id: int,
        payload: CareerGpsNextBestActionStatusIn,
    ) -> CareerGpsNextBestActionDetail:
        progress_payload = CareerGpsProgressUpdateIn(
            route_type=payload.route_type,
            milestone_sequence=payload.milestone_sequence,
            action_sequence=payload.action_sequence,
            status=payload.status,
            notes=None,
            evidence_url=None,
            completed_at=datetime.now(timezone.utc).isoformat() if payload.status == "completed" else None,
        )
        self.update_action_progress(user, roadmap_id, progress_payload)
        return self.get_next_best_action(user, roadmap_id)

    def list_buddy_conversations(self, user: dict) -> list[CareerBuddyConversation]:
        employee = self._employee(user)
        return [CareerBuddyConversation(**row) for row in self.career.list_buddy_conversations(employee["id"])]

    def create_buddy_conversation(
        self,
        user: dict,
        payload: CareerBuddyConversationCreateIn,
    ) -> CareerBuddyConversation:
        employee = self._employee(user)
        roadmap = self._roadmap_for_buddy(employee["id"], payload.roadmap_id)
        title = payload.title or f"Career Buddy for roadmap v{roadmap['version']}"
        row = self.career.create_buddy_conversation(
            employee_profile_id=employee["id"],
            roadmap_id=roadmap["roadmap_id"],
            title=title,
        )
        return CareerBuddyConversation(**row)

    def get_buddy_conversation(self, user: dict, conversation_id: int) -> CareerBuddyConversationDetail:
        employee = self._employee(user)
        conversation = self.career.get_buddy_conversation(employee["id"], conversation_id)
        if conversation is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Career Buddy conversation not found")
        messages = self.career.list_buddy_messages(employee["id"], conversation_id)
        return CareerBuddyConversationDetail(
            **conversation,
            messages=[CareerBuddyMessage(**message) for message in messages],
        )

    def send_buddy_message(self, user: dict, payload: CareerBuddyMessageIn) -> CareerBuddyReply:
        employee = self._employee(user)
        remaining = self._check_buddy_rate_limit(employee["id"])
        roadmap = self._roadmap_for_buddy(employee["id"], payload.roadmap_id)
        conversation = (
            self.career.get_buddy_conversation(employee["id"], payload.conversation_id)
            if payload.conversation_id is not None
            else None
        )
        if payload.conversation_id is not None and conversation is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Career Buddy conversation not found")
        if conversation is None:
            conversation = self.career.create_buddy_conversation(
                employee_profile_id=employee["id"],
                roadmap_id=roadmap["roadmap_id"],
                title=self._conversation_title(payload.message),
            )

        user_message = self.career.add_buddy_message(
            employee_profile_id=employee["id"],
            conversation_id=conversation["id"],
            sender="employee",
            content=payload.message,
            provider="user",
        )
        context = self._buddy_context(employee, roadmap, payload.route_type)
        result = self.career_buddy.answer(question=payload.message, context=context)
        assistant_message = self.career.add_buddy_message(
            employee_profile_id=employee["id"],
            conversation_id=conversation["id"],
            sender="assistant",
            content=result.response.answer,
            structured_response=result.response.model_dump(),
            provider=result.provider,
            model=result.model,
        )
        refreshed_conversation = self.career.get_buddy_conversation(employee["id"], conversation["id"]) or conversation
        return CareerBuddyReply(
            conversation=CareerBuddyConversation(**refreshed_conversation),
            user_message=CareerBuddyMessage(**user_message),
            assistant_message=CareerBuddyMessage(**assistant_message),
            response=result.response,
            provider=result.provider,
            model=result.model,
            rate_limit_remaining=max(0, remaining - 1),
        )

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

    def _scenario_inputs(
        self,
        *,
        employee: dict,
        goals: dict,
        lifestyle: dict,
        constraints: list[dict],
        payload: CareerGpsWhatIfScenarioIn,
    ) -> tuple[dict, dict, dict, list[dict], CareerGpsWhatIfScenarioSummary]:
        scenario_employee = copy.deepcopy(employee)
        scenario_goals = copy.deepcopy(goals)
        scenario_lifestyle = copy.deepcopy(lifestyle)
        scenario_constraints = copy.deepcopy(constraints)
        applied: list[str] = []

        def add_priority(priority: str) -> None:
            priorities = [item for item in scenario_lifestyle.get("top_two_non_negotiable_priorities", []) if item != priority]
            scenario_lifestyle["top_two_non_negotiable_priorities"] = [priority, *priorities][:2]

        def append_ambition(text: str) -> None:
            current = scenario_goals.get("career_ambition")
            scenario_goals["career_ambition"] = f"{current} {text}".strip() if current else text

        for adjustment in payload.adjustments:
            if adjustment == "prioritise_salary":
                scenario_lifestyle["income_priority"] = max(int(scenario_lifestyle.get("income_priority", 50)), 92)
                scenario_lifestyle["risk_tolerance"] = "high"
                add_priority("income")
                append_ambition("Prioritise higher income and faster financial progress.")
                applied.append("Raised income priority and risk tolerance for salary-focused routes.")
            elif adjustment == "prioritise_work_life_balance":
                scenario_lifestyle["work_life_balance_priority"] = 95
                scenario_lifestyle["remote_work_priority"] = max(int(scenario_lifestyle.get("remote_work_priority", 50)), 80)
                scenario_lifestyle["risk_tolerance"] = "low"
                add_priority("work_life_balance")
                append_ambition("Protect work-life balance and sustainable pacing.")
                applied.append("Raised work-life balance and remote-work priorities while lowering risk tolerance.")
            elif adjustment == "avoid_management":
                scenario_lifestyle["leadership_priority"] = 0
                scenario_constraints.append(
                    {
                        "id": None,
                        "employee_profile_id": employee["id"],
                        "constraint_type": "role",
                        "label": "Does not want management responsibilities",
                        "value": {},
                        "is_blocking": True,
                    }
                )
                append_ambition("Stay on an individual-contributor path without management responsibilities.")
                applied.append("Added a blocking no-management constraint.")
            elif adjustment == "relocate_country":
                country = payload.target_country or "Singapore"
                locations = [country, *[item for item in scenario_lifestyle.get("preferred_locations", []) if item != country]]
                scenario_lifestyle["preferred_locations"] = locations[:12]
                scenario_lifestyle["willing_to_relocate"] = True
                scenario_lifestyle["international_mobility"] = True
                applied.append(f"Temporarily set relocation openness and preferred country to {country}.")
            elif adjustment == "change_industry":
                current_industry = (scenario_goals.get("target_industry") or "").strip().lower()
                target_industry = payload.target_industry or ("data" if current_industry != "data" else "technology")
                scenario_goals["target_industry"] = target_industry
                append_ambition(f"Explore {target_industry} industry routes.")
                applied.append(f"Temporarily changed target industry to {target_industry}.")
            elif adjustment == "retire_earlier":
                current_age = scenario_goals.get("target_retirement_age")
                target_age = payload.target_retirement_age or max(45, int(current_age or 60) - 5)
                scenario_goals["target_retirement_age"] = target_age
                scenario_goals["target_timeline_months"] = payload.target_timeline_months or min(
                    int(scenario_goals.get("target_timeline_months") or 36),
                    18,
                )
                scenario_lifestyle["income_priority"] = max(int(scenario_lifestyle.get("income_priority", 50)), 85)
                add_priority("income")
                append_ambition("Compress the career plan to support earlier retirement.")
                applied.append(f"Set an earlier retirement target at age {target_age}.")
            elif adjustment == "complete_masters_degree":
                existing_skills = [str(skill) for skill in scenario_employee.get("skills", [])]
                for skill in ["research", "analytics", "sql", "experimentation"]:
                    if skill not in existing_skills:
                        existing_skills.append(skill)
                scenario_employee["skills"] = existing_skills
                scenario_lifestyle["learning_budget"] = max(int(scenario_lifestyle.get("learning_budget") or 0), 20000)
                append_ambition("Include the effect of completing a master's degree and applied research evidence.")
                applied.append("Temporarily treated a master's degree as completed with analytics and research evidence.")
            elif adjustment == "focus_entrepreneurship":
                scenario_lifestyle["preferred_company_type"] = "Startup"
                scenario_lifestyle["risk_tolerance"] = "high"
                scenario_lifestyle["leadership_priority"] = max(int(scenario_lifestyle.get("leadership_priority", 50)), 75)
                scenario_lifestyle["income_priority"] = max(int(scenario_lifestyle.get("income_priority", 50)), 78)
                add_priority("entrepreneurship")
                append_ambition("Build toward entrepreneurship, startup exposure, and ownership-oriented work.")
                applied.append("Shifted preferences toward startup, ownership, and higher-risk routes.")

        scenario_name = payload.scenario_name or self._scenario_name(payload.adjustments)
        return (
            scenario_employee,
            scenario_goals,
            scenario_lifestyle,
            scenario_constraints,
            CareerGpsWhatIfScenarioSummary(
                scenario_name=scenario_name,
                adjustments=payload.adjustments,
                applied_overrides=applied,
            ),
        )

    def _scenario_name(self, adjustments: list[str]) -> str:
        labels = {
            "prioritise_salary": "Prioritise salary",
            "prioritise_work_life_balance": "Prioritise work-life balance",
            "avoid_management": "Avoid management",
            "relocate_country": "Relocate internationally",
            "change_industry": "Change industry",
            "retire_earlier": "Retire earlier",
            "complete_masters_degree": "Complete a master's degree",
            "focus_entrepreneurship": "Focus on entrepreneurship",
        }
        return " + ".join(labels.get(item, item) for item in adjustments)

    def _compare_roadmaps(self, current: dict[str, Any], preview: dict[str, Any]) -> CareerGpsWhatIfComparison:
        current_route = self._recommended_route(current)
        preview_route = self._recommended_route(preview)
        if current_route is None or preview_route is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Roadmap comparison requires a recommended route in both roadmaps.",
            )

        current_tradeoff = self._weakest_component(current_route)
        preview_tradeoff = self._weakest_component(preview_route)
        current_skills = self._top_skill_names(current_route)
        preview_skills = self._top_skill_names(preview_route)
        current_roles = self._route_targets(current)
        preview_roles = self._route_targets(preview)
        changes = [
            self._change(
                "recommended_route",
                "Changed recommended route",
                current_route["title"],
                preview_route["title"],
                "The scenario may rebalance route ranking because goals, constraints, lifestyle priorities, or temporary evidence changed.",
            ),
            self._change(
                "target_roles",
                "Changed target roles",
                current_roles,
                preview_roles,
                "Target roles come from the deterministic occupation and transition set after applying the scenario.",
            ),
            self._change(
                "timeline",
                "Changed timeline",
                f"{current_route['estimated_months']} months",
                f"{preview_route['estimated_months']} months",
                "Timeline changes when the selected route, target timeline, or skill-gap count changes.",
            ),
            self._change(
                "skill_priorities",
                "Changed skill priorities",
                current_skills,
                preview_skills,
                "Skill priorities reflect the missing skills for the scenario's recommended route.",
            ),
            self._change(
                "tradeoffs",
                "Changed trade-offs",
                self._tradeoff_label(current_tradeoff),
                self._tradeoff_label(preview_tradeoff),
                "Trade-offs show the weakest score component after the scenario is scored.",
            ),
            self._change(
                "scores",
                "Changed scores",
                f"Route {round(current_route['score'])}% / roadmap {round(current['fit_score'])}%",
                f"Route {round(preview_route['score'])}% / roadmap {round(preview['fit_score'])}%",
                "Scores are deterministic planning scores from the existing Career GPS engine, not market guarantees.",
            ),
        ]
        return CareerGpsWhatIfComparison(
            current_roadmap_id=current["roadmap_id"],
            current_version=current["version"],
            preview_version=preview["version"],
            changes=changes,
        )

    def _recommended_route(self, roadmap: dict[str, Any]) -> dict[str, Any] | None:
        routes = roadmap.get("routes") or []
        return next((route for route in routes if route.get("route_type") == "recommended"), routes[0] if routes else None)

    def _route_targets(self, roadmap: dict[str, Any]) -> str:
        titles = [route["target_occupation"]["title"] for route in roadmap.get("routes", [])]
        return ", ".join(titles) if titles else "No target roles"

    def _top_skill_names(self, route: dict[str, Any]) -> str:
        names = [gap["skill_name"] for gap in route.get("skill_gaps", [])[:4]]
        return ", ".join(names) if names else "No major skill gaps"

    def _weakest_component(self, route: dict[str, Any]) -> dict[str, Any] | None:
        components = route.get("score_components") or []
        return min(components, key=lambda item: item.get("score", 0), default=None)

    def _tradeoff_label(self, component: dict[str, Any] | None) -> str:
        if component is None:
            return "No trade-off available"
        return f"{component['label']} ({round(component['score'])}%)"

    def _component_label(self, route: dict[str, Any], key: str) -> str:
        component = next((item for item in route.get("score_components", []) if item.get("key") == key), None)
        if component is None:
            return "No stored signal"
        return f"{component['label']} {round(component.get('score', 0))}%"

    def _confidence_level(self, score: float) -> str:
        if score >= 82:
            return "High"
        if score >= 68:
            return "Medium"
        if score >= 52:
            return "Developing"
        return "Low"

    def _completion_timestamp(self, payload: CareerGpsProgressUpdateIn) -> str | None:
        if payload.status != "completed":
            return None
        if not payload.completed_at:
            return datetime.now(timezone.utc).isoformat()
        value = payload.completed_at
        try:
            if len(value) == 10:
                parsed = datetime.fromisoformat(f"{value}T00:00:00+00:00")
            else:
                parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="completed_at must be an ISO date or timestamp.",
            ) from exc
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed.astimezone(timezone.utc).isoformat()

    def _change(
        self,
        category: str,
        label: str,
        before: str,
        after: str,
        explanation: str,
    ) -> CareerGpsWhatIfChange:
        return CareerGpsWhatIfChange(
            category=category,
            label=label,
            before=before,
            after=after,
            changed=before != after,
            explanation=explanation,
        )

    def _roadmap_for_buddy(self, employee_profile_id: int, roadmap_id: int | None) -> dict[str, Any]:
        roadmap = (
            self.career.get_roadmap_snapshot(employee_profile_id, roadmap_id)
            if roadmap_id is not None
            else self.career.get_latest_roadmap_snapshot(employee_profile_id)
        )
        if roadmap is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Generate a Career GPS roadmap before using Career Buddy.",
            )
        return roadmap

    def _choose_next_best_action(
        self,
        *,
        roadmap: dict[str, Any],
        progress_rows: list[dict[str, Any]],
        profile: dict[str, Any],
        alternative: bool,
    ) -> dict[str, Any] | None:
        selected_route_type = roadmap.get("selected_route_type") or "recommended"
        route = self._selected_route(roadmap, selected_route_type)
        if route is None:
            return None

        progress_by_action = {
            (
                row.get("route_type"),
                int(row.get("milestone_sequence") or 0),
                int(row.get("action_sequence") or 0),
            ): row
            for row in progress_rows
            if row.get("action_sequence") is not None
        }
        progress_by_milestone = {
            (
                row.get("route_type"),
                int(row.get("milestone_sequence") or 0),
            ): row
            for row in progress_rows
            if row.get("action_sequence") is None
        }

        active_milestone_sequence = self._active_milestone_sequence(route, progress_by_milestone)
        largest_gap = max(route.get("skill_gaps", []), key=lambda gap: int(gap.get("priority", 0)), default=None)
        candidate_rows: list[dict[str, Any]] = []
        for milestone in route.get("milestones", []):
            milestone_sequence = int(milestone.get("sequence") or 0)
            milestone_status = progress_by_milestone.get((route["route_type"], milestone_sequence), {}).get("status")
            if milestone_status in {"completed", "skipped"}:
                continue
            for action in milestone.get("actions", []):
                action_sequence = int(action.get("sequence") or 0)
                progress = progress_by_action.get((route["route_type"], milestone_sequence, action_sequence), {})
                action_status = progress.get("status", "not_started")
                if action_status in {"completed", "skipped"}:
                    continue
                candidate_rows.append(
                    {
                        "route": route,
                        "milestone": milestone,
                        "action": action,
                        "status": action_status,
                        "score": self._next_action_score(
                            route=route,
                            milestone=milestone,
                            action=action,
                            status_value=action_status,
                            active_milestone_sequence=active_milestone_sequence,
                            largest_gap=largest_gap,
                            priorities=profile.get("lifestyle_priorities", {}).get("top_two_non_negotiable_priorities", []),
                        ),
                    }
                )

        if not candidate_rows:
            return None
        candidate_rows.sort(
            key=lambda item: (
                -item["score"],
                int(item["milestone"].get("sequence") or 0),
                int(item["action"].get("sequence") or 0),
            )
        )
        chosen = candidate_rows[1] if alternative and len(candidate_rows) > 1 else candidate_rows[0]
        return self._next_action_response(
            roadmap=roadmap,
            route=chosen["route"],
            milestone=chosen["milestone"],
            action=chosen["action"],
            status_value=chosen["status"],
            largest_gap=largest_gap,
            is_alternative=alternative,
        )

    def _active_milestone_sequence(
        self,
        route: dict[str, Any],
        progress_by_milestone: dict[tuple[str, int], dict[str, Any]],
    ) -> int:
        milestones = route.get("milestones", [])
        for milestone in milestones:
            row = progress_by_milestone.get((route["route_type"], int(milestone.get("sequence") or 0)), {})
            if row.get("status") == "in_progress":
                return int(milestone.get("sequence") or 1)
        for milestone in milestones:
            row = progress_by_milestone.get((route["route_type"], int(milestone.get("sequence") or 0)), {})
            if row.get("status") not in {"completed", "skipped"}:
                return int(milestone.get("sequence") or 1)
        return int(milestones[-1].get("sequence") if milestones else 1)

    def _next_action_score(
        self,
        *,
        route: dict[str, Any],
        milestone: dict[str, Any],
        action: dict[str, Any],
        status_value: str,
        active_milestone_sequence: int,
        largest_gap: dict[str, Any] | None,
        priorities: list[str],
    ) -> float:
        score = 0.0
        if int(milestone.get("sequence") or 0) == active_milestone_sequence:
            score += 100
        if status_value == "in_progress":
            score += 35
        if status_value == "not_started":
            score += 18
        focus_skill = str(milestone.get("focus_skill_name") or "").lower()
        action_text = f"{action.get('title', '')} {action.get('description', '')}".lower()
        if largest_gap and str(largest_gap.get("skill_name", "")).lower() in f"{focus_skill} {action_text}":
            score += 45 + int(largest_gap.get("priority") or 0) * 3
        if action.get("action_type") == "project":
            score += 12
        if "work_life_balance" in priorities and route.get("route_type") == "balanced":
            score += 8
        if "income" in priorities and route.get("route_type") == "accelerated":
            score += 8
        score += max(0, 10 - int(action.get("sequence") or 1))
        return score

    def _next_action_response(
        self,
        *,
        roadmap: dict[str, Any],
        route: dict[str, Any],
        milestone: dict[str, Any],
        action: dict[str, Any],
        status_value: str,
        largest_gap: dict[str, Any] | None,
        is_alternative: bool,
    ) -> dict[str, Any]:
        focus_skill = milestone.get("focus_skill_name") or (largest_gap or {}).get("skill_name") or "role evidence"
        estimated_hours = float(action.get("estimated_hours") or 2)
        target_date = (datetime.now(timezone.utc) + timedelta(days=max(3, min(21, round(estimated_hours * 1.5))))).date()
        effort = f"{estimated_hours:g} hours"
        return {
            "roadmap_id": roadmap["roadmap_id"],
            "route_type": route["route_type"],
            "milestone_sequence": int(milestone.get("sequence") or 1),
            "action_sequence": int(action.get("sequence") or 1),
            "action_title": action["title"],
            "why_it_matters": (
                f"This is the best next step because it supports {milestone['title']} on the active "
                f"{route['route_type']} route and builds evidence for {focus_skill}."
            ),
            "estimated_effort": effort,
            "target_completion_date": target_date.isoformat(),
            "expected_impact": (
                f"Completing it should improve readiness for {route['target_occupation']['title']} by turning "
                f"{focus_skill} into visible progress."
            ),
            "related_milestone": milestone["title"],
            "status": status_value if status_value in {"not_started", "in_progress", "completed", "skipped"} else "not_started",
            "recommended_skill_gained": str(focus_skill),
            "selection_reason": (
                "Deterministic selection based on the active route, active milestone, largest skill gap, "
                "incomplete action status, employee priorities, and route requirements."
            ),
            "is_alternative": is_alternative,
        }

    def _buddy_context(self, employee: dict, roadmap: dict[str, Any], route_type: str) -> dict[str, Any]:
        selected_route = self._selected_route(roadmap, route_type)
        goals = self._goals_with_defaults(employee["id"], self.career.get_goals(employee["id"]), employee)
        lifestyle = self._lifestyle_with_defaults(employee["id"], self.career.get_lifestyle_priorities(employee["id"]))
        constraints = self.career.list_constraints(employee["id"])
        return {
            "employee": {
                "target_role": employee.get("target_role"),
                "experience_years": employee.get("experience_years"),
                "skills": employee.get("skills", []),
                "location": employee.get("location"),
            },
            "profile": {
                "goals": goals,
                "lifestyle_priorities": lifestyle,
                "constraints": constraints,
            },
            "roadmap": {
                "roadmap_id": roadmap["roadmap_id"],
                "version": roadmap["version"],
                "fit_score": roadmap["fit_score"],
                "scoring_version": roadmap["scoring_version"],
                "routes": [
                    {
                        "route_type": route["route_type"],
                        "title": route["title"],
                        "score": route["score"],
                        "estimated_months": route["estimated_months"],
                        "target_occupation": route["target_occupation"],
                        "skill_gaps": route.get("skill_gaps", [])[:5],
                        "score_components": route.get("score_components", []),
                    }
                    for route in roadmap.get("routes", [])
                ],
                "next_best_action": roadmap.get("next_best_action"),
                "source_note": roadmap.get("source_note"),
            },
            "selected_route": selected_route,
            "guardrails": {
                "deterministic_scoring_is_authoritative": True,
                "do_not_invent_salary_or_market_figures": True,
                "occupation_data_is_illustrative": True,
            },
        }

    def _selected_route(self, roadmap: dict[str, Any], route_type: str) -> dict[str, Any] | None:
        routes = roadmap.get("routes") or []
        return next((route for route in routes if route.get("route_type") == route_type), routes[0] if routes else None)

    def _check_buddy_rate_limit(self, employee_profile_id: int) -> int:
        limit = settings.career_buddy_rate_limit_per_hour
        if limit <= 0:
            return 999_999
        used = self.career.count_recent_buddy_user_messages(employee_profile_id, within_minutes=60)
        if used >= limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Career Buddy message limit reached. Try again later.",
            )
        return limit - used

    def _conversation_title(self, message: str) -> str:
        cleaned = " ".join(message.split())
        if len(cleaned) <= 64:
            return cleaned
        return f"{cleaned[:61]}..."

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
