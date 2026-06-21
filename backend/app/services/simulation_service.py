from backend.app.schemas.simulations import (
    ChartPoint,
    DeptRisk,
    RoleGap,
    SimulationInput,
    SimulationResult,
)

MODEL_VERSION = "simulator-rules-v2"

MOCK_ROLE_GAPS = [
    RoleGap(role="Sr. Software Engineer", dept="Engineering", current=120, projected=340, gap=-220, marketSupply="Critical"),
    RoleGap(role="Data Analyst", dept="Engineering", current=85, projected=180, gap=-95, marketSupply="Scarce"),
    RoleGap(role="DevOps Engineer", dept="Engineering", current=40, projected=110, gap=-70, marketSupply="Critical"),
    RoleGap(role="Product Manager", dept="Sales", current=62, projected=115, gap=-53, marketSupply="Balanced"),
    RoleGap(role="ML Engineer", dept="Engineering", current=18, projected=65, gap=-47, marketSupply="Critical"),
    RoleGap(role="Sales Engineer", dept="Sales", current=55, projected=90, gap=-35, marketSupply="Scarce"),
]

TIMEFRAME_YEARS = {
    "CURRENT": 1,
    "5Y": 4,
    "10Y": 5,
    "20Y": 6,
    "30Y": 7,
}

ALL_YEARS = ["2024", "2026", "2028", "2030", "2032", "2040", "2055"]


class SimulationService:
    def run(self, state: SimulationInput) -> SimulationResult:
        year_count = TIMEFRAME_YEARS[state.timeframe]
        years = ALL_YEARS[: year_count + 1]

        ai_mult = [0.8, 1.0, 1.2, 1.5][state.aiLevel]
        attrition_boost = 1.4 if state.presets.attritionSpike else 1.0
        hiring_penalty = -3 if state.presets.hiringFreeze else 0
        retire_penalty = 1.3 if state.presets.massRetirement else 1.0
        retirement_boost = state.retirementExtension * 40
        migration_boost = state.migrationImpact * 30

        chart_data: list[ChartPoint] = []
        for index, year in enumerate(years):
            supply = max(
                1500,
                round(
                    5000
                    - (state.attritionRate * 85 * index * attrition_boost * retire_penalty)
                    + ((state.hiringBudget + hiring_penalty) * 180 * index)
                    + (ai_mult * 120 * index)
                    + retirement_boost * index
                    + migration_boost * index
                ),
            )
            demand = round(4200 + (state.growthTarget * 160 * index))
            chart_data.append(ChartPoint(year=year, supply=supply, demand=demand, net=supply - demand))

        last_point = chart_data[-1]
        gap = last_point.demand - last_point.supply
        resilience_score = min(100, max(10, 100 - (gap / 80) - (state.attritionRate * 0.5)))

        dept_risks = [
            self._dept_risk("eng", "ENG", "Engineering", min(95, round(30 + state.attritionRate * 1.8 + (15 if state.aiLevel == 3 else 0)))),
            self._dept_risk("sls", "SLS", "Sales", min(80, round(20 + state.attritionRate * 1.2))),
            self._dept_risk("ops", "OPS", "Operations", round(10 + state.attritionRate * 0.6)),
            self._dept_risk("fin", "FIN", "Finance", max(5, round(25 - state.hiringBudget * 2))),
        ]

        return SimulationResult(
            chartData=chart_data,
            resilienceScore=round(resilience_score, 1),
            deptRisks=dept_risks,
            projectedGap=max(0, gap),
            costOfInaction=round(gap * 14200),
            highRiskRoles=max(0, round(gap / 300)),
            roleGaps=MOCK_ROLE_GAPS,
        )

    def _dept_risk(self, id_: str, abbr: str, label: str, score: int) -> DeptRisk:
        if score >= 60:
            stability = "Critical"
        elif score >= 35:
            stability = "At Risk"
        elif score >= 20:
            stability = "Stable"
        else:
            stability = "Growing"
        return DeptRisk(id=id_, label=label, abbr=abbr, score=score, stability=stability)


class RecommendationService:
    def generate_actions(self, result: SimulationResult) -> list[dict]:
        actions: list[dict] = []
        for role in result.roleGaps:
            if role.gap <= -100:
                actions.append(
                    {
                        "action": "hire",
                        "target": role.role,
                        "priority": "high",
                        "rationale": f"{role.role} shows a projected shortage of {abs(role.gap)} people.",
                    }
                )
            elif role.gap < 0:
                actions.append(
                    {
                        "action": "retrain",
                        "target": role.role,
                        "priority": "medium",
                        "rationale": f"Upskill internal talent to reduce the {abs(role.gap)} person gap.",
                    }
                )

        for dept in result.deptRisks:
            if dept.stability in {"Critical", "At Risk"}:
                actions.append(
                    {
                        "action": "monitor",
                        "target": dept.label,
                        "priority": "high" if dept.stability == "Critical" else "medium",
                        "rationale": f"{dept.label} risk score is {dept.score}/100.",
                    }
                )
        return actions[:8]
