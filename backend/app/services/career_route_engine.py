from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Literal


SCORING_VERSION = "career_gps_deterministic_v1"
RouteType = Literal["recommended", "accelerated", "balanced"]


@dataclass(frozen=True)
class ScoreComponentDefinition:
    key: str
    label: str


SCORE_COMPONENTS = [
    ScoreComponentDefinition("goal_fit", "Goal fit"),
    ScoreComponentDefinition("skill_fit", "Skill fit"),
    ScoreComponentDefinition("lifestyle_fit", "Lifestyle fit"),
    ScoreComponentDefinition("market_opportunity", "Market opportunity"),
    ScoreComponentDefinition("income_potential", "Income potential"),
    ScoreComponentDefinition("leadership_fit", "Leadership fit"),
    ScoreComponentDefinition("geographic_fit", "Geographic fit"),
    ScoreComponentDefinition("work_life_balance_fit", "Work-life balance fit"),
    ScoreComponentDefinition("transition_difficulty", "Transition difficulty"),
    ScoreComponentDefinition("estimated_cost", "Estimated cost"),
    ScoreComponentDefinition("career_risk", "Career risk"),
    ScoreComponentDefinition("preparation_time", "Preparation time"),
]

ROUTE_TYPES: list[RouteType] = ["recommended", "accelerated", "balanced"]

ROUTE_LABELS: dict[RouteType, str] = {
    "recommended": "Recommended Route",
    "accelerated": "Accelerated Route",
    "balanced": "Balanced Route",
}

ROUTE_WEIGHTS: dict[RouteType, dict[str, float]] = {
    "recommended": {
        "goal_fit": 0.16,
        "skill_fit": 0.14,
        "lifestyle_fit": 0.10,
        "market_opportunity": 0.10,
        "income_potential": 0.08,
        "leadership_fit": 0.08,
        "geographic_fit": 0.07,
        "work_life_balance_fit": 0.08,
        "transition_difficulty": 0.07,
        "estimated_cost": 0.04,
        "career_risk": 0.04,
        "preparation_time": 0.04,
    },
    "accelerated": {
        "goal_fit": 0.15,
        "skill_fit": 0.18,
        "lifestyle_fit": 0.06,
        "market_opportunity": 0.11,
        "income_potential": 0.11,
        "leadership_fit": 0.08,
        "geographic_fit": 0.04,
        "work_life_balance_fit": 0.04,
        "transition_difficulty": 0.08,
        "estimated_cost": 0.04,
        "career_risk": 0.04,
        "preparation_time": 0.07,
    },
    "balanced": {
        "goal_fit": 0.13,
        "skill_fit": 0.10,
        "lifestyle_fit": 0.15,
        "market_opportunity": 0.07,
        "income_potential": 0.06,
        "leadership_fit": 0.05,
        "geographic_fit": 0.10,
        "work_life_balance_fit": 0.15,
        "transition_difficulty": 0.06,
        "estimated_cost": 0.04,
        "career_risk": 0.05,
        "preparation_time": 0.04,
    },
}

DIFFICULTY_PENALTY = {"low": 10, "moderate": 24, "high": 42}
SENIORITY_INCOME = {"junior": 45, "mid": 66, "senior": 78, "lead": 84, "executive": 92}
FAMILY_MARKET = {"technology": 78, "data": 82, "project-management": 68}

MANAGEMENT_TERMS = {
    "manager",
    "management",
    "leadership",
    "director",
    "head",
    "chief",
    "c-suite",
    "executive",
    "stakeholder",
}


def clamp_score(value: float) -> float:
    return round(max(0.0, min(100.0, value)), 2)


def normalize_text(value: str | None) -> str:
    return (value or "").strip().lower()


def tokenize(*values: str | None) -> set[str]:
    tokens: set[str] = set()
    for value in values:
        clean = normalize_text(value)
        if not clean:
            continue
        for token in clean.replace("/", " ").replace("-", " ").replace(",", " ").split():
            if len(token) > 2:
                tokens.add(token)
    return tokens


def normalized_skills(skills: list[str]) -> set[str]:
    return {normalize_text(skill) for skill in skills if normalize_text(skill)}


def contains_management_signal(*values: str | None) -> bool:
    haystack = " ".join(normalize_text(value) for value in values)
    return any(term in haystack for term in MANAGEMENT_TERMS)


def component_label(component_key: str) -> str:
    return next(item.label for item in SCORE_COMPONENTS if item.key == component_key)


class CareerRouteEngine:
    def generate(
        self,
        *,
        employee: dict[str, Any],
        goals: dict[str, Any],
        lifestyle: dict[str, Any],
        constraints: list[dict[str, Any]],
        occupations: list[dict[str, Any]],
        occupation_skills: list[dict[str, Any]],
        transitions: list[dict[str, Any]],
    ) -> dict[str, Any]:
        candidates = self._candidate_paths(occupations, occupation_skills, transitions)
        scored_by_type: dict[RouteType, list[dict[str, Any]]] = {route_type: [] for route_type in ROUTE_TYPES}

        for route_type in ROUTE_TYPES:
            for candidate in candidates:
                if self._violates_hard_constraints(candidate, route_type, constraints, lifestyle):
                    continue
                scored_by_type[route_type].append(
                    self._score_candidate(employee, goals, lifestyle, candidate, route_type)
                )
            scored_by_type[route_type].sort(
                key=lambda item: (-item["score"], item["estimated_months"], item["target_occupation"]["title"])
            )

        selected_routes: list[dict[str, Any]] = []
        used_candidate_keys: set[str] = set()
        for route_type in ROUTE_TYPES:
            scored = scored_by_type[route_type]
            if not scored:
                continue
            selected = next(
                (item for item in scored if item["candidate_key"] not in used_candidate_keys),
                scored[0],
            )
            used_candidate_keys.add(selected["candidate_key"])
            selected_routes.append(self._route_payload(selected, route_type))

        if not selected_routes:
            raise ValueError("No Career GPS routes are available after applying hard constraints.")

        recommended = selected_routes[0]
        route_scores = [route["score"] for route in selected_routes]
        next_best_action = self._next_best_action(recommended)

        return {
            "scoring_version": SCORING_VERSION,
            "title": "Career GPS Routes",
            "summary": (
                "Deterministic Career GPS route set based on the employee profile, Career North Star, "
                "skills, constraints, and illustrative occupation data."
            ),
            "fit_score": clamp_score(sum(route_scores) / len(route_scores)),
            "target_occupation_id": recommended["target_occupation"]["id"],
            "routes": selected_routes,
            "score_components": [
                {
                    "route_type": route["route_type"],
                    "component_key": component["key"],
                    "label": component["label"],
                    "score": component["score"],
                    "weight": component["weight"],
                    "explanation": component["explanation"],
                }
                for route in selected_routes
                for component in route["score_components"]
            ],
            "next_best_action": next_best_action,
            "source_note": "Occupation and transition reference data is illustrative seed data, not verified labor-market data.",
        }

    def _candidate_paths(
        self,
        occupations: list[dict[str, Any]],
        occupation_skills: list[dict[str, Any]],
        transitions: list[dict[str, Any]],
    ) -> list[dict[str, Any]]:
        occupation_by_id = {occupation["id"]: occupation for occupation in occupations if occupation.get("status", "active") == "active"}
        skills_by_occupation: dict[int, list[dict[str, Any]]] = {occupation_id: [] for occupation_id in occupation_by_id}
        for skill in occupation_skills:
            occupation_id = skill["occupation_id"]
            if occupation_id in skills_by_occupation:
                skills_by_occupation[occupation_id].append(skill)

        candidates: list[dict[str, Any]] = []
        for transition in transitions:
            target = occupation_by_id.get(transition["to_occupation_id"])
            if target is None:
                continue
            source = occupation_by_id.get(transition.get("from_occupation_id"))
            candidates.append(
                {
                    "candidate_key": f"transition:{transition['slug']}",
                    "transition": transition,
                    "source_occupation": source,
                    "target_occupation": target,
                    "skills": sorted(skills_by_occupation.get(target["id"], []), key=lambda item: (-item.get("priority", 3), item["skill_name"])),
                    "estimated_months": int(transition.get("estimated_months") or 12),
                    "difficulty": transition.get("difficulty") or "moderate",
                }
            )

        transition_targets = {candidate["target_occupation"]["id"] for candidate in candidates}
        for occupation in occupation_by_id.values():
            if occupation["id"] in transition_targets:
                continue
            candidates.append(
                {
                    "candidate_key": f"occupation:{occupation['slug']}",
                    "transition": None,
                    "source_occupation": None,
                    "target_occupation": occupation,
                    "skills": sorted(skills_by_occupation.get(occupation["id"], []), key=lambda item: (-item.get("priority", 3), item["skill_name"])),
                    "estimated_months": 6 if occupation.get("seniority_level") == "junior" else 10,
                    "difficulty": "low" if occupation.get("seniority_level") == "junior" else "moderate",
                }
            )
        return sorted(candidates, key=lambda item: item["candidate_key"])

    def _violates_hard_constraints(
        self,
        candidate: dict[str, Any],
        route_type: RouteType,
        constraints: list[dict[str, Any]],
        lifestyle: dict[str, Any],
    ) -> bool:
        target = candidate["target_occupation"]
        target_is_management = contains_management_signal(target.get("title"), target.get("family"))
        for constraint in constraints:
            if not constraint.get("is_blocking"):
                continue
            label = normalize_text(constraint.get("label"))
            constraint_type = normalize_text(constraint.get("constraint_type"))
            if ("no management" in label or "individual contributor" in label or "does not want management" in label) and target_is_management:
                return True
            if route_type == "accelerated" and any(term in label for term in ["no accelerated route", "no fast track"]):
                return True
            if constraint_type == "location" and "relocat" in label and not lifestyle.get("willing_to_relocate", False):
                return False
        return False

    def _score_candidate(
        self,
        employee: dict[str, Any],
        goals: dict[str, Any],
        lifestyle: dict[str, Any],
        candidate: dict[str, Any],
        route_type: RouteType,
    ) -> dict[str, Any]:
        target = candidate["target_occupation"]
        missing_skills, skill_fit = self._skill_fit(employee.get("skills", []), candidate["skills"])
        difficulty_penalty = DIFFICULTY_PENALTY.get(candidate["difficulty"], 24)
        route_months = self._route_months(candidate["estimated_months"], route_type, len(missing_skills))
        leadership_signal = contains_management_signal(target.get("title"), target.get("family"), goals.get("career_ambition"))

        components = {
            "goal_fit": self._goal_fit(goals, target, candidate.get("transition")),
            "skill_fit": skill_fit,
            "lifestyle_fit": self._lifestyle_fit(lifestyle, route_type, leadership_signal),
            "market_opportunity": self._market_opportunity(target),
            "income_potential": self._income_potential(target, goals, route_type),
            "leadership_fit": self._leadership_fit(goals, lifestyle, target),
            "geographic_fit": self._geographic_fit(lifestyle, route_type),
            "work_life_balance_fit": self._work_life_fit(lifestyle, route_type, candidate["difficulty"]),
            "transition_difficulty": clamp_score(100 - difficulty_penalty - len(missing_skills) * 6),
            "estimated_cost": self._estimated_cost_fit(lifestyle, len(missing_skills), route_type),
            "career_risk": self._career_risk_fit(lifestyle, candidate["difficulty"], route_type),
            "preparation_time": self._preparation_time_fit(goals, route_months),
        }
        weights = ROUTE_WEIGHTS[route_type]
        score = clamp_score(sum(components[key] * weights[key] for key in weights))
        score_components = [
            {
                "key": key,
                "label": component_label(key),
                "score": clamp_score(components[key]),
                "weight": weights[key],
                "explanation": self._component_explanation(key, components[key], route_type, target, missing_skills, route_months),
            }
            for key in weights
        ]

        return {
            **candidate,
            "score": score,
            "estimated_months": route_months,
            "skill_gaps": missing_skills,
            "score_components": score_components,
        }

    def _route_payload(self, scored: dict[str, Any], route_type: RouteType) -> dict[str, Any]:
        target = scored["target_occupation"]
        route_label = ROUTE_LABELS[route_type]
        skill_gaps = scored["skill_gaps"]
        milestones = self._milestones(target, skill_gaps, scored["estimated_months"], route_type)
        explanation = self._route_explanation(scored, route_type)
        return {
            "route_type": route_type,
            "title": f"{route_label}: {target['title']}",
            "summary": explanation,
            "score": scored["score"],
            "estimated_months": scored["estimated_months"],
            "target_occupation": {
                "id": target["id"],
                "slug": target["slug"],
                "title": target["title"],
                "family": target["family"],
                "seniority_level": target.get("seniority_level"),
                "source_label": target.get("source_label", "illustrative_seed"),
            },
            "transition": scored["transition"],
            "skill_gaps": skill_gaps,
            "milestones": milestones,
            "score_components": scored["score_components"],
            "explanation": explanation,
        }

    def _skill_fit(self, employee_skills: list[str], required_skills: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], float]:
        owned = normalized_skills(employee_skills)
        total_weight = 0
        matched_weight = 0
        missing: list[dict[str, Any]] = []
        for skill in required_skills:
            priority = int(skill.get("priority") or 3)
            skill_name = normalize_text(skill.get("skill_name"))
            weight = priority * (1.2 if skill.get("skill_type") == "required" else 0.8)
            total_weight += weight
            if skill_name in owned:
                matched_weight += weight
            else:
                missing.append(
                    {
                        "skill_name": skill["skill_name"],
                        "skill_type": skill.get("skill_type", "required"),
                        "priority": priority,
                        "proficiency_level": skill.get("proficiency_level", "foundation"),
                    }
                )
        if total_weight == 0:
            return missing, 65.0
        return missing, clamp_score((matched_weight / total_weight) * 100)

    def _goal_fit(self, goals: dict[str, Any], target: dict[str, Any], transition: dict[str, Any] | None) -> float:
        goal_tokens = tokenize(goals.get("career_ambition"), goals.get("target_role"), goals.get("target_industry"), goals.get("motivation"))
        target_tokens = tokenize(target.get("title"), target.get("family"), target.get("description"), transition.get("title") if transition else None)
        if not goal_tokens:
            return 55.0
        overlap = len(goal_tokens & target_tokens)
        direct_role_match = normalize_text(target.get("title")) in normalize_text(goals.get("target_role"))
        family_match = normalize_text(target.get("family")) in normalize_text(goals.get("target_industry"))
        score = 45 + overlap * 8 + (22 if direct_role_match else 0) + (14 if family_match else 0)
        if contains_management_signal(goals.get("career_ambition"), goals.get("target_role")) and contains_management_signal(target.get("title"), target.get("family")):
            score += 10
        return clamp_score(score)

    def _lifestyle_fit(self, lifestyle: dict[str, Any], route_type: RouteType, leadership_signal: bool) -> float:
        balance = lifestyle.get("work_life_balance_priority", 50)
        income = lifestyle.get("income_priority", 50)
        leadership = lifestyle.get("leadership_priority", 50)
        security = lifestyle.get("job_security_priority", 50)
        if route_type == "balanced":
            return clamp_score(50 + balance * 0.35 + security * 0.15 - income * 0.08)
        if route_type == "accelerated":
            return clamp_score(55 + income * 0.20 + leadership * 0.12 - balance * 0.16)
        leadership_adjustment = 8 if leadership_signal and leadership >= 60 else 0
        return clamp_score(52 + balance * 0.16 + income * 0.12 + security * 0.10 + leadership_adjustment)

    def _market_opportunity(self, target: dict[str, Any]) -> float:
        base = FAMILY_MARKET.get(target.get("family"), 64)
        seniority = target.get("seniority_level") or "mid"
        return clamp_score(base + (5 if seniority in {"mid", "senior", "lead"} else 0))

    def _income_potential(self, target: dict[str, Any], goals: dict[str, Any], route_type: RouteType) -> float:
        base = SENIORITY_INCOME.get(target.get("seniority_level") or "mid", 62)
        if contains_management_signal(goals.get("career_ambition"), goals.get("target_role"), target.get("title")):
            base += 8
        if route_type == "accelerated":
            base += 5
        if route_type == "balanced":
            base -= 2
        return clamp_score(base)

    def _leadership_fit(self, goals: dict[str, Any], lifestyle: dict[str, Any], target: dict[str, Any]) -> float:
        wants_leadership = lifestyle.get("leadership_priority", 50)
        target_is_leadership = contains_management_signal(target.get("title"), target.get("family"))
        goal_is_leadership = contains_management_signal(goals.get("career_ambition"), goals.get("target_role"))
        if target_is_leadership or goal_is_leadership:
            return clamp_score(40 + wants_leadership * 0.55)
        return clamp_score(82 - wants_leadership * 0.25)

    def _geographic_fit(self, lifestyle: dict[str, Any], route_type: RouteType) -> float:
        preferred_locations = lifestyle.get("preferred_locations") or []
        relocation = lifestyle.get("willing_to_relocate", False)
        international = lifestyle.get("international_mobility", False)
        remote_priority = lifestyle.get("remote_work_priority", 50)
        score = 58 + min(len(preferred_locations), 3) * 5 + remote_priority * 0.18
        if relocation or international:
            score += 8
        if route_type == "accelerated" and not relocation and not international:
            score -= 8
        return clamp_score(score)

    def _work_life_fit(self, lifestyle: dict[str, Any], route_type: RouteType, difficulty: str) -> float:
        balance = lifestyle.get("work_life_balance_priority", 50)
        score = 45 + balance * 0.45
        if route_type == "balanced":
            score += 14
        if route_type == "accelerated":
            score -= 18
        score -= {"low": 0, "moderate": 7, "high": 16}.get(difficulty, 7)
        return clamp_score(score)

    def _estimated_cost_fit(self, lifestyle: dict[str, Any], missing_skill_count: int, route_type: RouteType) -> float:
        estimated_cost = missing_skill_count * (900 if route_type == "accelerated" else 600)
        budget = lifestyle.get("learning_budget")
        if budget is None:
            return clamp_score(78 - missing_skill_count * 7)
        if estimated_cost <= budget:
            return clamp_score(88 - missing_skill_count * 3)
        overage = estimated_cost - budget
        return clamp_score(70 - overage / 250)

    def _career_risk_fit(self, lifestyle: dict[str, Any], difficulty: str, route_type: RouteType) -> float:
        tolerance = lifestyle.get("risk_tolerance", "moderate")
        score = 78 - DIFFICULTY_PENALTY.get(difficulty, 24) * 0.7
        if route_type == "accelerated":
            score -= 10
        if tolerance == "high":
            score += 10
        if tolerance == "low":
            score -= 10
        return clamp_score(score)

    def _preparation_time_fit(self, goals: dict[str, Any], estimated_months: int) -> float:
        timeline = goals.get("target_timeline_months")
        if not timeline:
            return clamp_score(82 - max(0, estimated_months - 12) * 2)
        if estimated_months <= timeline:
            return clamp_score(92 - max(0, timeline - estimated_months) * 0.4)
        return clamp_score(80 - (estimated_months - timeline) * 5)

    def _route_months(self, base_months: int, route_type: RouteType, missing_skill_count: int) -> int:
        adjustment = {"recommended": 1.0, "accelerated": 0.72, "balanced": 1.25}[route_type]
        skill_adjustment = max(0, missing_skill_count - 1)
        return max(1, round(base_months * adjustment + skill_adjustment))

    def _component_explanation(
        self,
        key: str,
        score: float,
        route_type: RouteType,
        target: dict[str, Any],
        missing_skills: list[dict[str, Any]],
        route_months: int,
    ) -> str:
        rounded = round(score)
        if key == "skill_fit":
            return f"{rounded}/100 because {len(missing_skills)} target skills are still missing for {target['title']}."
        if key == "preparation_time":
            return f"{rounded}/100 based on an estimated {route_months} month preparation window."
        if key == "transition_difficulty":
            return f"{rounded}/100 after accounting for route difficulty and missing skills."
        if key == "estimated_cost":
            return f"{rounded}/100 based on the number of skill gaps and the saved learning budget."
        return f"{rounded}/100 for the {ROUTE_LABELS[route_type].lower()} toward {target['title']}."

    def _route_explanation(self, scored: dict[str, Any], route_type: RouteType) -> str:
        target = scored["target_occupation"]
        strongest = sorted(scored["score_components"], key=lambda item: item["score"], reverse=True)[0]
        weakest = sorted(scored["score_components"], key=lambda item: item["score"])[0]
        return (
            f"{ROUTE_LABELS[route_type]} scores {scored['score']}/100 for {target['title']}. "
            f"Strongest component: {strongest['label']} ({strongest['score']}/100). "
            f"Main tradeoff: {weakest['label']} ({weakest['score']}/100). "
            "This is a deterministic planning score and does not guarantee salary, promotion, or hiring outcomes."
        )

    def _milestones(
        self,
        target: dict[str, Any],
        skill_gaps: list[dict[str, Any]],
        estimated_months: int,
        route_type: RouteType,
    ) -> list[dict[str, Any]]:
        focus_skills = skill_gaps[:3]
        if not focus_skills:
            focus_skills = [{"skill_name": "role-specific proof", "skill_type": "preferred", "priority": 3}]
        weeks_total = max(4, estimated_months * 4)
        milestone_weeks = max(2, round(weeks_total / 3))
        intensity = "accelerated" if route_type == "accelerated" else "steady"
        return [
            {
                "title": "Close priority skill gaps",
                "description": f"Build the core skills required for {target['title']} using a {intensity} learning plan.",
                "sequence": 1,
                "duration_weeks": milestone_weeks,
                "focus_skill_name": focus_skills[0]["skill_name"],
                "actions": [
                    {
                        "action_type": "learning",
                        "title": f"Complete focused practice for {focus_skills[0]['skill_name']}",
                        "description": "Use a short course, internal project, or structured practice plan.",
                        "sequence": 1,
                        "estimated_hours": 8.0,
                    }
                ],
            },
            {
                "title": "Create role evidence",
                "description": "Turn new skills into a portfolio-ready work sample or internal proof point.",
                "sequence": 2,
                "duration_weeks": milestone_weeks,
                "focus_skill_name": focus_skills[min(1, len(focus_skills) - 1)]["skill_name"],
                "actions": [
                    {
                        "action_type": "project",
                        "title": f"Build a {target['family']} proof project",
                        "description": "Document the problem, decisions, tradeoffs, and measurable result.",
                        "sequence": 1,
                        "estimated_hours": 12.0,
                    }
                ],
            },
            {
                "title": "Prepare for target-role conversations",
                "description": "Update positioning and prepare examples for interviews, internal mobility, or mentoring conversations.",
                "sequence": 3,
                "duration_weeks": milestone_weeks,
                "focus_skill_name": focus_skills[min(2, len(focus_skills) - 1)]["skill_name"],
                "actions": [
                    {
                        "action_type": "networking",
                        "title": f"Schedule one conversation with a {target['title']} or hiring manager",
                        "description": "Validate expectations before applying or committing to the next milestone.",
                        "sequence": 1,
                        "estimated_hours": 2.0,
                    }
                ],
            },
        ]

    def _next_best_action(self, recommended_route: dict[str, Any]) -> dict[str, Any]:
        first_gap = recommended_route["skill_gaps"][0] if recommended_route["skill_gaps"] else None
        if first_gap:
            title = f"Start with {first_gap['skill_name']}"
            description = (
                f"Spend the next week building evidence for {first_gap['skill_name']} because it is the highest-priority "
                f"gap on the {recommended_route['title']}."
            )
        else:
            title = "Validate the target role"
            description = f"Speak with one person in {recommended_route['target_occupation']['title']} before committing to the route."
        return {
            "title": title,
            "description": description,
            "route_type": recommended_route["route_type"],
        }
