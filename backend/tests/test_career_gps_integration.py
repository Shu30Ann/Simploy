import os
import tempfile
import unittest
from pathlib import Path

from fastapi.testclient import TestClient

from backend.app.core.config import settings
from backend.app.main import app


class CareerGpsIntegrationTest(unittest.TestCase):
    def setUp(self) -> None:
        fd, db_path = tempfile.mkstemp(prefix="simploy-career-gps-test-", suffix=".sqlite")
        os.close(fd)
        self.db_path = Path(db_path)
        object.__setattr__(settings, "database_path", str(self.db_path))
        object.__setattr__(settings, "career_buddy_ai_provider", "template")
        object.__setattr__(settings, "openai_api_key", None)
        object.__setattr__(settings, "career_buddy_rate_limit_per_hour", 20)
        self.client = TestClient(app)
        self.client.__enter__()

    def tearDown(self) -> None:
        self.client.__exit__(None, None, None)
        self.db_path.unlink(missing_ok=True)

    def signup_employee(self, email: str) -> dict:
        response = self.client.post(
            "/auth/signup",
            json={
                "email": email,
                "password": "password123",
                "role": "employee",
                "full_name": email.split("@", 1)[0],
            },
        )
        self.assertEqual(response.status_code, 200, response.text)
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}

    def complete_onboarding(self, headers: dict, *, avoid_management: bool = False) -> None:
        goals = self.client.put(
            "/career-gps/goals",
            headers=headers,
            json={
                "career_ambition": (
                    "Grow into analytics without becoming a manager."
                    if avoid_management
                    else "Grow into a sustainable analytics career."
                ),
                "target_role": "Analytics Engineer",
                "target_industry": "data",
                "target_retirement_age": 60,
                "target_timeline_months": 24,
                "motivation": "Build long-term optionality.",
            },
        )
        self.assertEqual(goals.status_code, 200, goals.text)
        lifestyle = self.client.put(
            "/career-gps/lifestyle-priorities",
            headers=headers,
            json={
                "income_priority": 55,
                "work_life_balance_priority": 75,
                "leadership_priority": 10 if avoid_management else 45,
                "job_security_priority": 60,
                "remote_work_priority": 70,
                "international_mobility": False,
                "risk_tolerance": "moderate",
                "learning_budget": 3000,
                "preferred_company_type": "Enterprise",
                "willing_to_relocate": False,
                "preferred_locations": ["Kuala Lumpur"],
                "preferred_work_styles": ["Hybrid"],
                "top_two_non_negotiable_priorities": ["work_life_balance", "income"],
            },
        )
        self.assertEqual(lifestyle.status_code, 200, lifestyle.text)
        constraints = self.client.put(
            "/career-gps/constraints",
            headers=headers,
            json={
                "constraints": [
                    {
                        "constraint_type": "role",
                        "label": "Does not want management responsibilities",
                        "value": {},
                        "is_blocking": True,
                    }
                ]
                if avoid_management
                else []
            },
        )
        self.assertEqual(constraints.status_code, 200, constraints.text)
        progress = self.client.put(
            "/career-gps/onboarding-progress",
            headers=headers,
            json={
                "current_step": "review",
                "completed_steps": ["current_situation", "north_star", "lifestyle", "constraints", "financials"],
                "is_complete": True,
            },
        )
        self.assertEqual(progress.status_code, 200, progress.text)

    def generate_roadmap(self, headers: dict) -> dict:
        response = self.client.post("/career-gps/roadmaps/generate", headers=headers, json={})
        self.assertEqual(response.status_code, 200, response.text)
        return response.json()

    def test_full_onboarding_to_roadmap_versioning_what_if_and_buddy_fallback(self) -> None:
        headers = self.signup_employee("career-gps-a@simploy.local")
        self.complete_onboarding(headers, avoid_management=True)

        profile = self.client.get("/career-gps/profile", headers=headers)
        self.assertEqual(profile.status_code, 200, profile.text)
        self.assertTrue(profile.json()["onboarding_progress"]["is_complete"])

        first = self.generate_roadmap(headers)
        self.assertEqual(first["version"], 1)
        second = self.generate_roadmap(headers)
        self.assertEqual(second["version"], 2)
        self.assertEqual(second["roadmap_id"], first["roadmap_id"])

        preview = self.client.post(
            "/career-gps/roadmaps/what-if/preview",
            headers=headers,
            json={
                "scenario_name": "Singapore balanced move",
                "adjustments": ["relocate_country", "prioritise_work_life_balance"],
                "target_country": "Singapore",
                "target_industry": None,
                "target_retirement_age": None,
                "target_timeline_months": None,
            },
        )
        self.assertEqual(preview.status_code, 200, preview.text)
        self.assertEqual(preview.json()["preview_roadmap"]["version"], 3)

        latest_after_preview = self.client.get("/career-gps/roadmaps/latest", headers=headers)
        self.assertEqual(latest_after_preview.status_code, 200, latest_after_preview.text)
        self.assertEqual(latest_after_preview.json()["version"], 2)

        applied = self.client.post(
            "/career-gps/roadmaps/what-if/apply",
            headers=headers,
            json={
                "scenario_name": "Singapore balanced move",
                "adjustments": ["relocate_country", "prioritise_work_life_balance"],
                "target_country": "Singapore",
                "target_industry": None,
                "target_retirement_age": None,
                "target_timeline_months": None,
            },
        )
        self.assertEqual(applied.status_code, 200, applied.text)
        self.assertEqual(applied.json()["applied_roadmap"]["version"], 3)

        reply = self.client.post(
            "/career-gps/career-buddy/messages",
            headers=headers,
            json={
                "conversation_id": None,
                "roadmap_id": first["roadmap_id"],
                "route_type": "recommended",
                "message": "What should I do in the next 90 days?",
            },
        )
        self.assertEqual(reply.status_code, 200, reply.text)
        body = reply.json()
        self.assertEqual(body["provider"], "template")
        self.assertTrue(body["response"]["recommended_actions"])
        conversation_id = body["conversation"]["id"]
        detail = self.client.get(f"/career-gps/career-buddy/conversations/{conversation_id}", headers=headers)
        self.assertEqual(detail.status_code, 200, detail.text)
        self.assertEqual(len(detail.json()["messages"]), 2)

    def test_authenticated_ownership_checks_for_roadmaps_and_buddy_conversations(self) -> None:
        owner_headers = self.signup_employee("career-gps-owner@simploy.local")
        other_headers = self.signup_employee("career-gps-other@simploy.local")
        self.complete_onboarding(owner_headers)
        roadmap = self.generate_roadmap(owner_headers)

        unauthorized_roadmap = self.client.get(
            f"/career-gps/roadmaps/{roadmap['roadmap_id']}",
            headers=other_headers,
        )
        self.assertEqual(unauthorized_roadmap.status_code, 404)

        reply = self.client.post(
            "/career-gps/career-buddy/messages",
            headers=owner_headers,
            json={
                "conversation_id": None,
                "roadmap_id": roadmap["roadmap_id"],
                "route_type": "recommended",
                "message": "Why was this route recommended?",
            },
        )
        self.assertEqual(reply.status_code, 200, reply.text)
        conversation_id = reply.json()["conversation"]["id"]

        unauthorized_conversation = self.client.get(
            f"/career-gps/career-buddy/conversations/{conversation_id}",
            headers=other_headers,
        )
        self.assertEqual(unauthorized_conversation.status_code, 404)

        unauthorized_message = self.client.post(
            "/career-gps/career-buddy/messages",
            headers=other_headers,
            json={
                "conversation_id": conversation_id,
                "roadmap_id": roadmap["roadmap_id"],
                "route_type": "recommended",
                "message": "Show me a more balanced route.",
            },
        )
        self.assertEqual(unauthorized_message.status_code, 404)

    def test_career_gps_rls_migrations_cover_employee_owned_tables(self) -> None:
        rls_sql = Path("backend/migrations/002_career_gps_rls.sql").read_text(encoding="utf-8")
        buddy_sql = Path("backend/migrations/005_career_buddy.sql").read_text(encoding="utf-8")
        for table in [
            "career_north_star_settings",
            "career_preferences",
            "career_constraints",
            "career_roadmaps",
            "roadmap_progress",
        ]:
            self.assertIn(f"alter table public.{table} enable row level security", rls_sql)
        self.assertIn("alter table public.career_buddy_conversations enable row level security", buddy_sql)
        self.assertIn("alter table public.career_buddy_messages enable row level security", buddy_sql)
        self.assertIn("public.is_career_buddy_conversation_owner", buddy_sql)


if __name__ == "__main__":
    unittest.main()
