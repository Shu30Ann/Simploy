MODEL_VERSION = "ai-engine-baseline-v1"


def normalize_skills(skills: list[str]) -> set[str]:
    return {skill.strip().lower() for skill in skills if skill.strip()}


def predict_job_match(
    candidate_skills: list[str],
    required_skills: list[str],
    experience_years: int = 0,
    required_experience_years: int = 0,
) -> dict:
    candidate = normalize_skills(candidate_skills)
    required = normalize_skills(required_skills)
    matched = sorted(candidate & required)
    missing = sorted(required - candidate)
    skill_score = 1.0 if not required else len(matched) / len(required)
    experience_score = 1.0 if required_experience_years == 0 else min(1.0, experience_years / required_experience_years)
    return {
        "match_score": round((skill_score * 0.72 + experience_score * 0.28) * 100, 1),
        "matched_skills": matched,
        "missing_skills": missing,
        "confidence_score": min(round(0.62 + min(len(required), 8) * 0.025, 2), 0.86),
        "model_version": MODEL_VERSION,
    }


def predict_skill_gap(current_skills: list[str], target_skills: list[str]) -> dict:
    current = normalize_skills(current_skills)
    target = normalize_skills(target_skills)
    missing = sorted(target - current)
    readiness = 100.0 if not target else round(((len(target) - len(missing)) / len(target)) * 100, 1)
    return {
        "missing_skills": missing,
        "priority_skills": missing[:3],
        "readiness_score": readiness,
        "model_version": MODEL_VERSION,
    }
