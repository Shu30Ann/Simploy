import json
import unittest
from unittest.mock import patch

from backend.app.core.config import settings
from backend.app.services.career_buddy_ai import (
    CAREER_BUDDY_REQUEST_TIMEOUT_SECONDS,
    CareerBuddyAiService,
    clear_career_buddy_cache,
)


class DummyHttpResponse:
    def __init__(self, payload: dict) -> None:
        self.payload = payload

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, traceback) -> None:
        return None

    def read(self) -> bytes:
        return json.dumps(self.payload).encode("utf-8")


class CareerBuddyAiTest(unittest.TestCase):
    def setUp(self) -> None:
        self.original_provider = settings.career_buddy_ai_provider
        self.original_model = settings.career_buddy_model
        self.original_openai_key = settings.openai_api_key
        self.original_gemini_key = settings.gemini_api_key
        clear_career_buddy_cache()

    def tearDown(self) -> None:
        object.__setattr__(settings, "career_buddy_ai_provider", self.original_provider)
        object.__setattr__(settings, "career_buddy_model", self.original_model)
        object.__setattr__(settings, "openai_api_key", self.original_openai_key)
        object.__setattr__(settings, "gemini_api_key", self.original_gemini_key)
        clear_career_buddy_cache()

    def test_auto_provider_uses_gemini_key_for_structured_career_buddy_answer(self) -> None:
        object.__setattr__(settings, "career_buddy_ai_provider", "auto")
        object.__setattr__(settings, "career_buddy_model", "gemini-test-model")
        object.__setattr__(settings, "openai_api_key", "paid-openai-key-that-auto-must-not-use")
        object.__setattr__(settings, "gemini_api_key", "test-gemini-key")
        captured = {}

        def fake_urlopen(request, timeout):
            captured["timeout"] = timeout
            captured["body"] = json.loads(request.data.decode("utf-8"))
            provider_response = {
                "answer": "Start with the next roadmap milestone and one applied proof project.",
                "recommended_actions": ["Complete the first milestone"],
                "referenced_route_type": "recommended",
                "confidence": "medium",
                "used_context": ["selected_route", "milestones"],
                "safety_notes": ["Uses stored Career GPS context only."],
            }
            return DummyHttpResponse({"output_text": json.dumps(provider_response)})

        with patch("backend.app.services.career_buddy_ai.urlopen", fake_urlopen):
            result = CareerBuddyAiService().answer(
                question="What should I do next?",
                context={"selected_route": {"route_type": "recommended", "title": "Analytics route"}},
            )

        self.assertEqual(result.provider, "gemini")
        self.assertEqual(result.model, "gemini-test-model")
        self.assertEqual(captured["timeout"], CAREER_BUDDY_REQUEST_TIMEOUT_SECONDS)
        self.assertEqual(captured["body"]["generationConfig"]["responseMimeType"], "application/json")
        self.assertIn("question", captured["body"]["contents"][0]["parts"][0]["text"])
        self.assertTrue(result.response.recommended_actions)

    def test_repeated_question_uses_cached_provider_response(self) -> None:
        object.__setattr__(settings, "career_buddy_ai_provider", "gemini")
        object.__setattr__(settings, "career_buddy_model", "gemini-cache-test")
        object.__setattr__(settings, "gemini_api_key", "test-gemini-key")
        calls = {"count": 0}

        def fake_urlopen(request, timeout):
            calls["count"] += 1
            provider_response = {
                "answer": "Use the selected roadmap milestone and build one proof project.",
                "recommended_actions": ["Start the active milestone"],
                "referenced_route_type": "balanced",
                "confidence": "high",
                "used_context": ["selected_route", "skill_gaps"],
                "safety_notes": ["No salary figures generated."],
            }
            return DummyHttpResponse({"output_text": json.dumps(provider_response)})

        service = CareerBuddyAiService()
        context = {
            "selected_route": {"route_type": "balanced", "title": "Balanced Route"},
            "roadmap": {"version": 3},
        }
        with patch("backend.app.services.career_buddy_ai.urlopen", fake_urlopen):
            first = service.answer(question="Why was this route recommended?", context=context)
            second = service.answer(question="Why was this route recommended?", context=context)

        self.assertEqual(calls["count"], 1)
        self.assertEqual(first.provider, "gemini")
        self.assertEqual(second.response.answer, first.response.answer)

    def test_missing_gemini_key_falls_back_to_template(self) -> None:
        object.__setattr__(settings, "career_buddy_ai_provider", "gemini")
        object.__setattr__(settings, "career_buddy_model", "gemini-test-model")
        object.__setattr__(settings, "gemini_api_key", None)

        result = CareerBuddyAiService().answer(
            question="What skill is holding me back?",
            context={
                "selected_route": {
                    "route_type": "recommended",
                    "title": "Cloud route",
                    "score": 72,
                    "skill_gaps": [{"skill_name": "cloud", "priority": 3}],
                    "score_components": [{"key": "skill_fit", "label": "Skill fit", "score": 64}],
                }
            },
        )

        self.assertEqual(result.provider, "template")
        self.assertIn("cloud", result.response.answer.lower())

    def test_gemini_timeout_or_quota_failure_falls_back_to_template(self) -> None:
        object.__setattr__(settings, "career_buddy_ai_provider", "gemini")
        object.__setattr__(settings, "career_buddy_model", "gemini-timeout-test")
        object.__setattr__(settings, "gemini_api_key", "test-gemini-key")

        def fake_urlopen(request, timeout):
            raise TimeoutError("simulated Gemini quota or timeout failure")

        with patch("backend.app.services.career_buddy_ai.urlopen", fake_urlopen):
            result = CareerBuddyAiService().answer(
                question="What should I do next?",
                context={
                    "selected_route": {
                        "route_type": "recommended",
                        "title": "Cloud route",
                        "skill_gaps": [{"skill_name": "cloud", "priority": 3}],
                    }
                },
            )

        self.assertEqual(result.provider, "template")
        self.assertIn("template fallback", " ".join(result.response.safety_notes).lower())

    def test_gemini_boolean_context_fields_are_normalized(self) -> None:
        object.__setattr__(settings, "career_buddy_ai_provider", "gemini")
        object.__setattr__(settings, "career_buddy_model", "gemini-normalize-test")
        object.__setattr__(settings, "gemini_api_key", "test-gemini-key")

        def fake_urlopen(request, timeout):
            provider_response = {
                "answer": "Build one small project tied to the selected route.",
                "recommended_actions": ["Define the project scope"],
                "referenced_route_type": "recommended",
                "confidence": "medium",
                "used_context": True,
                "safety_notes": False,
            }
            return DummyHttpResponse({"output_text": json.dumps(provider_response)})

        with patch("backend.app.services.career_buddy_ai.urlopen", fake_urlopen):
            result = CareerBuddyAiService().answer(
                question="Suggest a project",
                context={"selected_route": {"route_type": "recommended", "title": "Project route"}},
            )

        self.assertEqual(result.provider, "gemini")
        self.assertEqual(result.response.used_context, [])
        self.assertEqual(result.response.safety_notes, [])


if __name__ == "__main__":
    unittest.main()
