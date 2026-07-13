import json
import unittest
from unittest.mock import patch

from backend.app.core.config import settings
from backend.app.services.career_buddy_ai import CareerBuddyAiService


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

    def tearDown(self) -> None:
        object.__setattr__(settings, "career_buddy_ai_provider", self.original_provider)
        object.__setattr__(settings, "career_buddy_model", self.original_model)
        object.__setattr__(settings, "openai_api_key", self.original_openai_key)
        object.__setattr__(settings, "gemini_api_key", self.original_gemini_key)

    def test_auto_provider_uses_gemini_key_for_structured_career_buddy_answer(self) -> None:
        object.__setattr__(settings, "career_buddy_ai_provider", "auto")
        object.__setattr__(settings, "career_buddy_model", "gemini-test-model")
        object.__setattr__(settings, "openai_api_key", None)
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
        self.assertEqual(captured["timeout"], 20)
        self.assertEqual(captured["body"]["generationConfig"]["responseMimeType"], "application/json")
        self.assertIn("question", captured["body"]["contents"][0]["parts"][0]["text"])
        self.assertTrue(result.response.recommended_actions)


if __name__ == "__main__":
    unittest.main()
