import copy
import unittest

from backend.app.services.career_route_engine import SCORE_COMPONENTS, CareerRouteEngine


OCCUPATIONS = [
    {
        "id": 1,
        "slug": "application_engineer",
        "title": "Application Engineer",
        "family": "technology",
        "description": "Builds application features across frontend, backend, and platform services.",
        "seniority_level": "mid",
        "source_label": "illustrative_seed",
        "status": "active",
    },
    {
        "id": 2,
        "slug": "analytics_engineer",
        "title": "Analytics Engineer",
        "family": "data",
        "description": "Designs reusable analytics models, metrics, and reliable data pipelines.",
        "seniority_level": "mid",
        "source_label": "illustrative_seed",
        "status": "active",
    },
    {
        "id": 3,
        "slug": "project_manager",
        "title": "Project Manager",
        "family": "project-management",
        "description": "Owns delivery plans, risks, stakeholders, and cross-functional execution.",
        "seniority_level": "mid",
        "source_label": "illustrative_seed",
        "status": "active",
    },
]

OCCUPATION_SKILLS = [
    {"occupation_id": 1, "skill_name": "typescript", "skill_type": "required", "proficiency_level": "intermediate", "priority": 5},
    {"occupation_id": 1, "skill_name": "python", "skill_type": "required", "proficiency_level": "intermediate", "priority": 4},
    {"occupation_id": 1, "skill_name": "cloud", "skill_type": "preferred", "proficiency_level": "intermediate", "priority": 3},
    {"occupation_id": 2, "skill_name": "sql", "skill_type": "required", "proficiency_level": "advanced", "priority": 5},
    {"occupation_id": 2, "skill_name": "python", "skill_type": "required", "proficiency_level": "intermediate", "priority": 4},
    {"occupation_id": 2, "skill_name": "experimentation", "skill_type": "preferred", "proficiency_level": "intermediate", "priority": 3},
    {"occupation_id": 3, "skill_name": "project management", "skill_type": "required", "proficiency_level": "intermediate", "priority": 5},
    {"occupation_id": 3, "skill_name": "stakeholder management", "skill_type": "required", "proficiency_level": "intermediate", "priority": 5},
    {"occupation_id": 3, "skill_name": "change management", "skill_type": "preferred", "proficiency_level": "intermediate", "priority": 3},
]

TRANSITIONS = [
    {
        "id": 1,
        "slug": "to_application_engineer",
        "from_occupation_id": None,
        "to_occupation_id": 1,
        "title": "Technology builder path",
        "path_family": "technology",
        "difficulty": "moderate",
        "estimated_months": 9,
        "rationale": "Illustrative technology transition.",
        "source_label": "illustrative_seed",
    },
    {
        "id": 2,
        "slug": "to_analytics_engineer",
        "from_occupation_id": None,
        "to_occupation_id": 2,
        "title": "Data platform path",
        "path_family": "data",
        "difficulty": "moderate",
        "estimated_months": 8,
        "rationale": "Illustrative data transition.",
        "source_label": "illustrative_seed",
    },
    {
        "id": 3,
        "slug": "to_project_manager",
        "from_occupation_id": None,
        "to_occupation_id": 3,
        "title": "Project-management leadership path",
        "path_family": "project-management",
        "difficulty": "moderate",
        "estimated_months": 6,
        "rationale": "Illustrative leadership transition.",
        "source_label": "illustrative_seed",
    },
]


def base_lifestyle(**overrides):
    data = {
        "income_priority": 50,
        "work_life_balance_priority": 50,
        "leadership_priority": 50,
        "job_security_priority": 50,
        "remote_work_priority": 50,
        "international_mobility": False,
        "risk_tolerance": "moderate",
        "learning_budget": 3000,
        "preferred_company_type": "Enterprise",
        "willing_to_relocate": False,
        "preferred_locations": ["Kuala Lumpur"],
        "preferred_work_styles": ["Hybrid"],
        "top_two_non_negotiable_priorities": ["income", "work_life_balance"],
    }
    data.update(overrides)
    return data


class CareerRouteEngineTest(unittest.TestCase):
    def setUp(self) -> None:
        self.engine = CareerRouteEngine()

    def generate(self, *, employee, goals, lifestyle, constraints=None):
        return self.engine.generate(
            employee=copy.deepcopy(employee),
            goals=copy.deepcopy(goals),
            lifestyle=copy.deepcopy(lifestyle),
            constraints=copy.deepcopy(constraints or []),
            occupations=copy.deepcopy(OCCUPATIONS),
            occupation_skills=copy.deepcopy(OCCUPATION_SKILLS),
            transitions=copy.deepcopy(TRANSITIONS),
        )

    def assert_valid_deterministic_roadmap(self, first, second):
        self.assertEqual(first, second)
        self.assertEqual(len(first["routes"]), 3)
        self.assertEqual(len(first["score_components"]), 3 * len(SCORE_COMPONENTS))
        self.assertIn("next_best_action", first)
        for route in first["routes"]:
            self.assertGreaterEqual(route["score"], 0)
            self.assertLessEqual(route["score"], 100)
            self.assertEqual(len(route["score_components"]), len(SCORE_COMPONENTS))
            self.assertTrue(route["milestones"])
            self.assertIn("does not guarantee", route["explanation"])
            for component in route["score_components"]:
                self.assertGreaterEqual(component["score"], 0)
                self.assertLessEqual(component["score"], 100)

    def test_c_suite_ambition_is_deterministic(self):
        employee = {"id": 1, "skills": ["python", "cloud", "stakeholder management"]}
        goals = {
            "career_ambition": "Move toward a C-suite technology leadership path.",
            "target_role": "Chief Technology Officer",
            "target_industry": "technology",
            "target_timeline_months": 36,
        }
        lifestyle = base_lifestyle(income_priority=80, leadership_priority=95, risk_tolerance="high")
        first = self.generate(employee=employee, goals=goals, lifestyle=lifestyle)
        second = self.generate(employee=employee, goals=goals, lifestyle=lifestyle)
        self.assert_valid_deterministic_roadmap(first, second)

    def test_work_life_balance_profile_is_deterministic(self):
        employee = {"id": 2, "skills": ["sql", "storytelling"]}
        goals = {
            "career_ambition": "Grow into a sustainable analytics role without sacrificing family time.",
            "target_role": "Analytics Engineer",
            "target_industry": "data",
            "target_timeline_months": 24,
        }
        lifestyle = base_lifestyle(work_life_balance_priority=95, remote_work_priority=90, risk_tolerance="low")
        first = self.generate(employee=employee, goals=goals, lifestyle=lifestyle)
        second = self.generate(employee=employee, goals=goals, lifestyle=lifestyle)
        self.assert_valid_deterministic_roadmap(first, second)

    def test_financial_independence_profile_is_deterministic(self):
        employee = {"id": 3, "skills": ["python", "typescript", "cloud"]}
        goals = {
            "career_ambition": "Prioritise financial independence through higher-value technical roles.",
            "target_role": "Application Engineer",
            "target_industry": "technology",
            "target_timeline_months": 18,
            "target_retirement_age": 55,
        }
        lifestyle = base_lifestyle(income_priority=100, learning_budget=8000, risk_tolerance="moderate")
        first = self.generate(employee=employee, goals=goals, lifestyle=lifestyle)
        second = self.generate(employee=employee, goals=goals, lifestyle=lifestyle)
        self.assert_valid_deterministic_roadmap(first, second)

    def test_technical_specialist_no_management_filters_management_paths(self):
        employee = {"id": 4, "skills": ["python", "typescript", "sql"]}
        goals = {
            "career_ambition": "Become a deep technical specialist and stay an individual contributor.",
            "target_role": "Senior Software Engineer",
            "target_industry": "technology",
            "target_timeline_months": 24,
        }
        lifestyle = base_lifestyle(leadership_priority=5, work_life_balance_priority=80)
        constraints = [
            {
                "constraint_type": "role",
                "label": "Does not want management responsibilities",
                "value": {},
                "is_blocking": True,
            }
        ]
        result = self.generate(employee=employee, goals=goals, lifestyle=lifestyle, constraints=constraints)
        titles = {route["target_occupation"]["title"] for route in result["routes"]}
        self.assertNotIn("Project Manager", titles)
        self.assert_valid_deterministic_roadmap(
            result,
            self.generate(employee=employee, goals=goals, lifestyle=lifestyle, constraints=constraints),
        )


if __name__ == "__main__":
    unittest.main()
