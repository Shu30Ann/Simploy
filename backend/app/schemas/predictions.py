from pydantic import BaseModel, ConfigDict, Field


class JobMatchRequest(BaseModel):
    candidate_skills: list[str]
    required_skills: list[str]
    experience_years: int = Field(default=0, ge=0)
    required_experience_years: int = Field(default=0, ge=0)


class JobMatchResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    match_score: float
    missing_skills: list[str]
    matched_skills: list[str]
    confidence_score: float
    model_version: str


class SkillGapRequest(BaseModel):
    current_skills: list[str]
    target_skills: list[str]


class SkillGapResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    missing_skills: list[str]
    readiness_score: float
    priority_skills: list[str]
    model_version: str
