from __future__ import annotations

import sys
from pathlib import Path


sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from backend.app.core.config import settings
from backend.app.services.career_buddy_ai import GeminiCareerBuddyProvider


def main() -> int:
    if not settings.gemini_api_key or settings.gemini_api_key == "paste-your-gemini-api-key-here":
        print("GEMINI_API_KEY is missing in backend/.env")
        return 1

    if not settings.gemini_api_key.startswith("AIza"):
        print("GEMINI_API_KEY is set. Its prefix is not the common AI Studio format, so testing it with the API now.")

    provider = GeminiCareerBuddyProvider()
    response = provider.answer(
        question="What should I do next for this career roadmap?",
        context={
            "selected_route": {
                "route_type": "recommended",
                "title": "Analytics Engineer route",
                "score": 82,
                "skill_gaps": [
                    {"skill_name": "SQL", "priority": 5},
                    {"skill_name": "data storytelling", "priority": 4},
                ],
                "milestones": [
                    {"title": "Build one analytics portfolio project"},
                    {"title": "Practice stakeholder storytelling"},
                ],
                "score_components": [
                    {"key": "skill_fit", "label": "Skill fit", "score": 74},
                    {"key": "lifestyle_fit", "label": "Lifestyle fit", "score": 88},
                ],
            },
            "roadmap": {
                "next_best_action": {
                    "title": "Complete one SQL portfolio project",
                    "description": "Create a small project that proves the route's top skill gap.",
                    "route_type": "recommended",
                }
            },
            "profile": {
                "lifestyle_priorities": {
                    "top_two_non_negotiable_priorities": ["work_life_balance", "income"]
                }
            },
        },
    )
    print(f"Gemini connected successfully using model: {provider.model_name}")
    print(f"Answer: {response.answer}")
    print(f"Recommended actions: {response.recommended_actions}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
