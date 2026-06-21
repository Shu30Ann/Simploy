from backend.app.schemas.predictions import (
    JobMatchRequest,
    JobMatchResponse,
    SkillGapRequest,
    SkillGapResponse,
)

MODEL_VERSION = "baseline-rules-v1"


def _normalize_skills(skills: list[str]) -> set[str]:
    return {skill.strip().lower() for skill in skills if skill.strip()}


class PredictionService:
    def score_job_match(self, payload: JobMatchRequest) -> JobMatchResponse:
        candidate = _normalize_skills(payload.candidate_skills)
        required = _normalize_skills(payload.required_skills)
        matched = sorted(candidate & required)
        missing = sorted(required - candidate)
        skill_score = 1.0 if not required else len(matched) / len(required)
        exp_score = 1.0 if payload.required_experience_years == 0 else min(
            1.0,
            payload.experience_years / payload.required_experience_years,
        )
        match_score = round((skill_score * 0.72 + exp_score * 0.28) * 100, 1)
        confidence = round(0.62 + min(len(required), 8) * 0.025, 2)
        return JobMatchResponse(
            match_score=match_score,
            missing_skills=missing,
            matched_skills=matched,
            confidence_score=min(confidence, 0.86),
            model_version=MODEL_VERSION,
        )

    def score_skill_gap(self, payload: SkillGapRequest) -> SkillGapResponse:
        current = _normalize_skills(payload.current_skills)
        target = _normalize_skills(payload.target_skills)
        missing = sorted(target - current)
        readiness = 100.0 if not target else round(((len(target) - len(missing)) / len(target)) * 100, 1)
        return SkillGapResponse(
            missing_skills=missing,
            readiness_score=readiness,
            priority_skills=missing[:3],
            model_version=MODEL_VERSION,
        )
