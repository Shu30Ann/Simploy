from __future__ import annotations

import json
import re
import time
from collections import OrderedDict
from dataclasses import dataclass
from hashlib import sha256
from typing import Any, Protocol
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from backend.app.core.config import settings
from backend.app.schemas.career_gps import CareerBuddyStructuredResponse

CAREER_BUDDY_REQUEST_TIMEOUT_SECONDS = max(3, settings.career_buddy_timeout_seconds)
CAREER_BUDDY_TRANSIENT_ATTEMPTS = 2
CAREER_BUDDY_CACHE_LIMIT = 128
_CAREER_BUDDY_CACHE: OrderedDict[str, CareerBuddyProviderResult] = OrderedDict()


class CareerBuddyProvider(Protocol):
    provider_name: str
    model_name: str | None

    def answer(self, *, question: str, context: dict[str, Any]) -> CareerBuddyStructuredResponse:
        ...


@dataclass(frozen=True)
class CareerBuddyProviderResult:
    response: CareerBuddyStructuredResponse
    provider: str
    model: str | None


def clear_career_buddy_cache() -> None:
    _CAREER_BUDDY_CACHE.clear()


def read_provider_response(request: Request) -> str:
    last_error: Exception | None = None
    for attempt in range(CAREER_BUDDY_TRANSIENT_ATTEMPTS):
        try:
            with urlopen(request, timeout=CAREER_BUDDY_REQUEST_TIMEOUT_SECONDS) as response:
                return response.read().decode("utf-8")
        except HTTPError as exc:
            last_error = exc
            if exc.code not in {503} or attempt == CAREER_BUDDY_TRANSIENT_ATTEMPTS - 1:
                raise
        except (URLError, TimeoutError) as exc:
            last_error = exc
            if attempt == CAREER_BUDDY_TRANSIENT_ATTEMPTS - 1:
                raise
        time.sleep(0.8 * (attempt + 1))
    raise RuntimeError("Provider response unavailable") from last_error


def career_buddy_response_schema() -> dict[str, Any]:
    return {
        "type": "object",
        "additionalProperties": False,
        "required": [
            "answer",
            "recommended_actions",
            "referenced_route_type",
            "confidence",
            "used_context",
            "safety_notes",
        ],
        "properties": {
            "answer": {"type": "string", "minLength": 1, "maxLength": 2400},
            "recommended_actions": {
                "type": "array",
                "maxItems": 5,
                "items": {"type": "string", "maxLength": 220},
            },
            "referenced_route_type": {
                "anyOf": [
                    {"type": "string", "enum": ["recommended", "accelerated", "balanced"]},
                    {"type": "null"},
                ]
            },
            "confidence": {"type": "string", "enum": ["low", "medium", "high"]},
            "used_context": {
                "type": "array",
                "maxItems": 8,
                "items": {"type": "string", "maxLength": 120},
            },
            "safety_notes": {
                "type": "array",
                "maxItems": 5,
                "items": {"type": "string", "maxLength": 180},
            },
        },
    }


def career_buddy_system_instructions() -> str:
    return (
        "You are Career Buddy for Simploy Career GPS. Answer only from the provided JSON context. "
        "Use the stored roadmap, selected route, deterministic scores, skill gaps, milestones, Next Best Action, "
        "and employee preferences. Do not replace or rescore deterministic Career GPS routes. "
        "Do not invent salary, market-size, hiring-probability, or labor-market figures. "
        "If asked for unavailable facts, say the current prototype does not contain verified market data. "
        "Keep advice practical and concise."
    )


def route_label(route: dict[str, Any] | None) -> str:
    if route is None:
        return "the selected route"
    return route.get("title") or route.get("target_occupation", {}).get("title") or "the selected route"


def score_component(route: dict[str, Any] | None, key: str) -> dict[str, Any] | None:
    if route is None:
        return None
    return next((item for item in route.get("score_components", []) if item.get("key") == key), None)


def sorted_components(route: dict[str, Any] | None) -> list[dict[str, Any]]:
    if route is None:
        return []
    return sorted(route.get("score_components", []), key=lambda item: item.get("score", 0), reverse=True)


def top_skill_gaps(route: dict[str, Any] | None, limit: int = 3) -> list[str]:
    if route is None:
        return []
    return [gap["skill_name"] for gap in route.get("skill_gaps", [])[:limit]]


def disallowed_salary_or_market_figures(text: str) -> bool:
    normalized = text.lower()
    currency_pattern = r"(\$|rm|myr|usd|sgd|eur|gbp)\s?\d"
    salary_pattern = r"(salary|compensation|pay|market rate|market size)[^\n.]{0,80}\d"
    return bool(re.search(currency_pattern, normalized) or re.search(salary_pattern, normalized))


def normalize_ai_response_payload(payload: dict[str, Any]) -> dict[str, Any]:
    normalized = dict(payload)
    for key in ("recommended_actions", "used_context", "safety_notes"):
        value = normalized.get(key)
        if isinstance(value, str):
            normalized[key] = [value]
        elif isinstance(value, dict):
            normalized[key] = list(value.keys())
        elif isinstance(value, list):
            normalized[key] = value
        elif value is None:
            normalized[key] = []
        else:
            normalized[key] = []

    if normalized.get("referenced_route_type") not in {"recommended", "accelerated", "balanced", None}:
        normalized["referenced_route_type"] = None
    if normalized.get("confidence") not in {"low", "medium", "high"}:
        normalized["confidence"] = "medium"
    return normalized


class TemplateCareerBuddyProvider:
    provider_name = "template"
    model_name = None

    def answer(self, *, question: str, context: dict[str, Any]) -> CareerBuddyStructuredResponse:
        route = context.get("selected_route")
        roadmap = context.get("roadmap") or {}
        profile = context.get("profile") or {}
        question_text = question.lower()
        skill_gaps = top_skill_gaps(route)
        strongest = sorted_components(route)[0] if sorted_components(route) else None
        weakest = sorted_components(route)[-1] if sorted_components(route) else None
        next_action = roadmap.get("next_best_action") or {}
        milestones = route.get("milestones", []) if route else []

        if "90" in question_text or "next" in question_text:
            answer = self._next_90_days(route, next_action, milestones)
            actions = [next_action.get("title", "Start the next best action")]
        elif "skill" in question_text or "holding me back" in question_text:
            first_gap = skill_gaps[0] if skill_gaps else "role-specific proof"
            skill_fit = score_component(route, "skill_fit")
            skill_score = round(skill_fit["score"]) if skill_fit else round(route.get("score", 0) if route else 0)
            answer = (
                f"The main blocker on {route_label(route)} is {first_gap}. "
                f"Career GPS puts it first because the route's skill fit is {skill_score}/100."
            )
            actions = [f"Create one applied proof point for {first_gap}", next_action.get("title", "Validate the target role")]
        elif "manager" in question_text or "management" in question_text:
            leadership = score_component(route, "leadership_fit")
            answer = (
                f"Yes, Career GPS can support an individual-contributor path if your saved constraints avoid management. "
                f"For {route_label(route)}, leadership fit is {round(leadership['score']) if leadership else 'not scored'}/100. "
                "Use the What-If simulator's Avoid management scenario to preview routes that filter management-heavy paths."
            )
            actions = ["Preview the Avoid management scenario", "Prioritise specialist skill evidence over people-management evidence"]
        elif "singapore" in question_text or "move" in question_text or "relocat" in question_text:
            geographic = score_component(route, "geographic_fit")
            answer = (
                f"A move can change geographic fit and route trade-offs. For {route_label(route)}, geographic fit is "
                f"{round(geographic['score']) if geographic else 'not scored'}/100. Use the Singapore relocation what-if scenario "
                "to compare the preview without overwriting this roadmap."
            )
            actions = ["Preview the Relocate country scenario with Singapore", "Compare score and timeline changes before applying"]
        elif "balanced" in question_text:
            answer = self._balanced_route_answer(roadmap)
            actions = ["Select the Balanced Route card", "Compare lifestyle fit and preparation time"]
        else:
            answer = (
                f"{route_label(route)} was recommended because Career GPS scored the stored roadmap using deterministic profile, "
                f"skill, preference, and constraint data. Strongest factor: {strongest['label']} at {round(strongest['score'])}/100. "
                f"Main trade-off: {weakest['label']} at {round(weakest['score'])}/100. "
                "These are planning scores, not salary, promotion, or hiring guarantees."
                if strongest and weakest
                else "Career GPS uses your stored roadmap, selected route, skill gaps, milestones, and Next Best Action to guide this answer."
            )
            actions = [next_action.get("title", "Start the next best action")]

        if profile.get("lifestyle_priorities", {}).get("top_two_non_negotiable_priorities"):
            priorities = ", ".join(profile["lifestyle_priorities"]["top_two_non_negotiable_priorities"])
            answer = f"{answer} I also considered your saved priorities: {priorities}."

        return CareerBuddyStructuredResponse(
            answer=answer,
            recommended_actions=[item for item in actions if item],
            referenced_route_type=route.get("route_type") if route else None,
            confidence="medium",
            used_context=["selected_route", "route_scores", "skill_gaps", "milestones", "next_best_action", "employee_preferences"],
            safety_notes=[
                "Career Buddy does not replace deterministic Career GPS scoring.",
                "Any occupation data is illustrative prototype data, not verified market data.",
            ],
        )

    def _next_90_days(
        self,
        route: dict[str, Any] | None,
        next_action: dict[str, Any],
        milestones: list[dict[str, Any]],
    ) -> str:
        first = milestones[0] if milestones else {}
        second = milestones[1] if len(milestones) > 1 else {}
        return (
            f"For the next 90 days on {route_label(route)}, start with {next_action.get('title', 'the Next Best Action')}. "
            f"Then complete the first milestone: {first.get('title', 'close priority skill gaps')}. "
            f"If you have capacity, begin {second.get('title', 'creating role evidence')}. "
            "Keep the scope evidence-based: one focused learning block, one proof project, and one target-role conversation."
        )

    def _balanced_route_answer(self, roadmap: dict[str, Any]) -> str:
        balanced = next((route for route in roadmap.get("routes", []) if route.get("route_type") == "balanced"), None)
        if not balanced:
            return "I do not see a Balanced Route in the stored roadmap. Regenerate the roadmap or use a work-life balance what-if preview."
        lifestyle = score_component(balanced, "lifestyle_fit")
        timeline = balanced.get("estimated_months")
        return (
            f"The more balanced option is {balanced['title']}. It has an estimated timeline of {timeline} months and "
            f"lifestyle fit of {round(lifestyle['score']) if lifestyle else round(balanced.get('score', 0))}/100. "
            "It usually trades speed for sustainability, so compare its preparation time and skill gaps before applying changes."
        )


class GeminiCareerBuddyProvider:
    provider_name = "gemini"

    def __init__(self) -> None:
        if not settings.gemini_api_key:
            raise RuntimeError("GEMINI_API_KEY is not configured")
        self.model_name = settings.career_buddy_model or "gemini-flash-latest"

    def answer(self, *, question: str, context: dict[str, Any]) -> CareerBuddyStructuredResponse:
        request_body = {
            "systemInstruction": {
                "parts": [
                    {
                        "text": (
                            f"{career_buddy_system_instructions()} "
                            "Return only a JSON object with these keys: answer, recommended_actions, "
                            "referenced_route_type, confidence, used_context, safety_notes."
                        )
                    }
                ]
            },
            "contents": [
                {
                    "role": "user",
                    "parts": [
                        {
                            "text": json.dumps({"question": question, "context": context}, separators=(",", ":")),
                        }
                    ],
                }
            ],
            "generationConfig": {
                "responseMimeType": "application/json",
            },
        }
        request = Request(
            f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:generateContent",
            data=json.dumps(request_body).encode("utf-8"),
            headers={
                "x-goog-api-key": settings.gemini_api_key,
                "Content-Type": "application/json",
            },
            method="POST",
        )
        try:
            raw = read_provider_response(request)
        except (HTTPError, URLError, TimeoutError, RuntimeError) as exc:
            raise RuntimeError("Gemini Career Buddy provider failed") from exc

        parsed = json.loads(raw)
        output_text = self._extract_output_text(parsed)
        structured = CareerBuddyStructuredResponse(**normalize_ai_response_payload(json.loads(output_text)))
        if disallowed_salary_or_market_figures(structured.answer):
            raise ValueError("AI response included disallowed salary or market figures")
        return structured

    def _extract_output_text(self, response: dict[str, Any]) -> str:
        if isinstance(response.get("output_text"), str):
            return response["output_text"]
        if all(key in response for key in career_buddy_response_schema()["required"]):
            return json.dumps(response)
        for item in response.get("output", []):
            for content in item.get("content", []):
                if content.get("type") in {"output_text", "text"} and isinstance(content.get("text"), str):
                    return content["text"]
        for candidate in response.get("candidates", []):
            for part in candidate.get("content", {}).get("parts", []):
                if isinstance(part.get("text"), str):
                    return part["text"]
        raise ValueError("Gemini response did not include output text")


class CareerBuddyAiService:
    def __init__(self) -> None:
        self.template_provider = TemplateCareerBuddyProvider()

    def answer(self, *, question: str, context: dict[str, Any]) -> CareerBuddyProviderResult:
        try:
            provider = self._configured_provider()
        except Exception:
            provider = self.template_provider
        cache_key = self._cache_key(provider=provider, question=question, context=context)
        cached = _CAREER_BUDDY_CACHE.get(cache_key)
        if cached is not None:
            _CAREER_BUDDY_CACHE.move_to_end(cache_key)
            return cached
        try:
            response = provider.answer(question=question, context=context)
            if disallowed_salary_or_market_figures(response.answer):
                raise ValueError("Provider response included disallowed salary or market figures")
            result = CareerBuddyProviderResult(response=response, provider=provider.provider_name, model=provider.model_name)
        except Exception:
            fallback = self.template_provider.answer(question=question, context=context)
            fallback.safety_notes.append("Template fallback used because the AI provider was unavailable or returned invalid output.")
            result = CareerBuddyProviderResult(response=fallback, provider=self.template_provider.provider_name, model=None)
        self._cache_result(cache_key, result)
        return result

    def _configured_provider(self) -> CareerBuddyProvider:
        provider = settings.career_buddy_ai_provider.lower().strip()
        if provider == "gemini" or (provider == "auto" and settings.gemini_api_key):
            return GeminiCareerBuddyProvider()
        return self.template_provider

    def _cache_key(self, *, provider: CareerBuddyProvider, question: str, context: dict[str, Any]) -> str:
        payload = {
            "provider": provider.provider_name,
            "model": provider.model_name,
            "question": " ".join(question.lower().split()),
            "context": context,
        }
        raw = json.dumps(payload, sort_keys=True, separators=(",", ":"), default=str)
        return sha256(raw.encode("utf-8")).hexdigest()

    def _cache_result(self, key: str, result: CareerBuddyProviderResult) -> None:
        _CAREER_BUDDY_CACHE[key] = result
        _CAREER_BUDDY_CACHE.move_to_end(key)
        while len(_CAREER_BUDDY_CACHE) > CAREER_BUDDY_CACHE_LIMIT:
            _CAREER_BUDDY_CACHE.popitem(last=False)
