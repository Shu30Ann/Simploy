from typing import Dict, List
from backend.models import AutomationRisk, Recommendation, SkillShift, SimulationResult, WorkforceChange


DEPARTMENT_PROFILE = {
    "engineering": {
        "roles": [
            ("Software Engineer", 40),
            ("QA Engineer", 15),
            ("Data Scientist", 10),
            ("DevOps Engineer", 8),
        ],
        "skills": ["python", "cloud", "data analytics", "automation"],
        "automation_focus": ["testing", "infrastructure"],
    },
    "sales": {
        "roles": [
            ("Sales Representative", 20),
            ("Account Executive", 12),
            ("Customer Success", 10),
        ],
        "skills": ["relationship management", "analytics", "digital selling"],
        "automation_focus": ["reporting", "lead qualification"],
    },
    "hr": {
        "roles": [
            ("Talent Partner", 10),
            ("Learning & Development", 6),
            ("HR Operations", 8),
        ],
        "skills": ["coaching", "talent analytics", "change management"],
        "automation_focus": ["payroll", "admin"],
    },
}


def _normalize_department(department: str) -> str:
    return department.strip().lower()


def simulate_workforce(company: str, department: str, time_horizon: int) -> SimulationResult:
    dept_key = _normalize_department(department)
    profile = DEPARTMENT_PROFILE.get(dept_key, DEPARTMENT_PROFILE["engineering"])

    growth_factor = 1 + min(max(time_horizon / 24.0, 0.05), 0.35)
    automation_risk_level = "medium"
    if time_horizon >= 18:
        automation_risk_level = "high"
    elif time_horizon <= 6:
        automation_risk_level = "low"

    workforce_changes: List[WorkforceChange] = []
    for role, current in profile["roles"]:
        predicted = int(current * growth_factor)
        workforce_changes.append(
            WorkforceChange(
                role=role,
                current_headcount=current,
                predicted_headcount=predicted,
                change=predicted - current,
            )
        )

    skill_demand_shifts: List[SkillShift] = []
    for index, skill in enumerate(profile["skills"]):
        trend = "up"
        score = 70 + (index * 5)
        if department.lower() == "hr" and skill == "talent analytics":
            score += 10
        skill_demand_shifts.append(
            SkillShift(skill=skill, demand_trend=trend, importance_score=min(score, 95))
        )

    automation_risk: List[AutomationRisk] = [
        AutomationRisk(
            area=area,
            risk_level=automation_risk_level,
            explanation=f"{area.capitalize()} is likely to see {automation_risk_level} automation pressure over the next {time_horizon} months.",
        )
        for area in profile["automation_focus"]
    ]

    return SimulationResult(
        company=company,
        department=department,
        time_horizon=time_horizon,
        workforce_changes=workforce_changes,
        skill_demand_shifts=skill_demand_shifts,
        automation_risk=automation_risk,
    )


def generate_insights(simulation: Dict[str, any]) -> Dict[str, List[Recommendation]]:
    workforce = simulation.get("workforce_changes", [])
    skills = simulation.get("skill_demand_shifts", [])
    automation = simulation.get("automation_risk", [])

    recommendations: List[Recommendation] = []
    for item in workforce:
        if item.get("change", 0) >= 5:
            recommendations.append(
                Recommendation(
                    action="hire",
                    target=item.get("role", "staff"),
                    priority="high",
                    rationale=f"Projected headcount increase of {item.get('change')} indicates hiring need.",
                )
            )
        elif item.get("change", 0) < 0:
            recommendations.append(
                Recommendation(
                    action="retrain",
                    target=item.get("role", "staff"),
                    priority="medium",
                    rationale="Projected reduction in staff suggests reskilling or internal mobility.",
                )
            )

    for skill in skills:
        if skill.get("demand_trend") == "up" and skill.get("importance_score", 0) >= 80:
            recommendations.append(
                Recommendation(
                    action="retrain",
                    target=skill.get("skill", "critical skill"),
                    priority="high",
                    rationale="Rising skill demand means current teams should be trained or upskilled.",
                )
            )

    for item in automation:
        if item.get("risk_level") == "high":
            recommendations.append(
                Recommendation(
                    action="automate",
                    target=item.get("area", "operations"),
                    priority="high",
                    rationale="High automation risk suggests process automation or tooling investment.",
                )
            )
        else:
            recommendations.append(
                Recommendation(
                    action="outsource",
                    target=item.get("area", "support"),
                    priority="low",
                    rationale="Consider outsourcing non-core areas with moderate automation risk.",
                )
            )

    if not recommendations:
        recommendations.append(
            Recommendation(
                action="monitor",
                target="workforce",
                priority="low",
                rationale="No strong signals detected; continue tracking simulation trends.",
            )
        )

    return {"recommendations": recommendations}
