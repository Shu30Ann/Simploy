from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class SimulationRequest(BaseModel):
    company: str
    department: str
    time_horizon: int


class WorkforceChange(BaseModel):
    role: str
    current_headcount: int
    predicted_headcount: int
    change: int


class SkillShift(BaseModel):
    skill: str
    demand_trend: str
    importance_score: int


class AutomationRisk(BaseModel):
    area: str
    risk_level: str
    explanation: str


class SimulationResult(BaseModel):
    company: str
    department: str
    time_horizon: int
    workforce_changes: List[WorkforceChange]
    skill_demand_shifts: List[SkillShift]
    automation_risk: List[AutomationRisk]


class InsightsRequest(BaseModel):
    simulation: Dict[str, Any]


class Recommendation(BaseModel):
    action: str
    target: str
    priority: str
    rationale: str


class InsightsResponse(BaseModel):
    recommendations: List[Recommendation]
