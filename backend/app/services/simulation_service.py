from backend.app.schemas.simulations import (
    ChartPoint,
    DeptRisk,
    RoleGap,
    SimulationInput,
    SimulationResult,
)

MODEL_VERSION = "simulator-rules-v2"

MOCK_ROLE_GAPS = [
    RoleGap(role="Production Operator", dept="Production", current=1200, projected=920, gap=280, marketSupply="Abundant"),
    RoleGap(role="Line Supervisor", dept="Production", current=155, projected=190, gap=-35, marketSupply="Balanced"),
    RoleGap(role="Maintenance Technician", dept="Maintenance", current=180, projected=310, gap=-130, marketSupply="Critical"),
    RoleGap(role="Automation Engineer", dept="Engineering", current=35, projected=120, gap=-85, marketSupply="Critical"),
    RoleGap(role="Quality Inspector", dept="Quality Assurance", current=210, projected=165, gap=45, marketSupply="Balanced"),
    RoleGap(role="QA Analyst", dept="Quality Assurance", current=45, projected=90, gap=-45, marketSupply="Scarce"),
    RoleGap(role="Supply Chain Planner", dept="Supply Chain", current=70, projected=115, gap=-45, marketSupply="Scarce"),
    RoleGap(role="Digital Marketing Specialist", dept="Marketing", current=12, projected=35, gap=-23, marketSupply="Balanced"),
    RoleGap(role="Finance Analyst", dept="Finance", current=32, projected=48, gap=-16, marketSupply="Balanced"),
    RoleGap(role="HR Operations Executive", dept="Human Resources", current=38, projected=28, gap=10, marketSupply="Abundant"),
    RoleGap(role="Data Analyst", dept="Digital Transformation", current=10, projected=42, gap=-32, marketSupply="Scarce"),
]

TIMEFRAME_YEARS = {
    "CURRENT": 1,
    "5Y": 4,
    "10Y": 5,
    "20Y": 6,
    "30Y": 7,
}

ALL_YEARS = ["2026", "2027", "2028", "2029", "2030", "2031", "2031"]
BASE_FORECAST = [
    {"supply": 4800, "demand": 4720},
    {"supply": 4680, "demand": 4860},
    {"supply": 4560, "demand": 5010},
    {"supply": 4440, "demand": 5150},
    {"supply": 4380, "demand": 5290},
    {"supply": 4310, "demand": 5420},
    {"supply": 4310, "demand": 5420},
]


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
            base = BASE_FORECAST[index]
            supply = max(
                1500,
                round(
                    base["supply"]
                    - (state.attritionRate * 85 * index * attrition_boost * retire_penalty)
                    + ((state.hiringBudget + hiring_penalty) * 180 * index)
                    + (ai_mult * 120 * index)
                    + retirement_boost * index
                    + migration_boost * index
                ),
            )
            demand = round(base["demand"] + (state.growthTarget * 120 * index))
            chart_data.append(ChartPoint(year=year, supply=supply, demand=demand, net=supply - demand))

        last_point = chart_data[-1]
        gap = last_point.demand - last_point.supply
        resilience_score = min(100, max(10, 100 - (gap / 80) - (state.attritionRate * 0.5)))

        dept_risks = [
            self._dept_risk("production", "PRO", "Production", min(95, round(35 + state.attritionRate * 1.1 + state.aiLevel * 4))),
            self._dept_risk("maintenance", "MAI", "Maintenance", min(95, round(48 + state.attritionRate * 1.4))),
            self._dept_risk("quality", "QA", "Quality Assurance", min(90, round(34 + state.attritionRate * 1.0))),
            self._dept_risk("supply-chain", "SC", "Supply Chain", min(85, round(32 + state.growthTarget * 1.1))),
            self._dept_risk("marketing", "MKT", "Marketing", min(75, round(24 + state.growthTarget * 0.9))),
            self._dept_risk("engineering", "ENG", "Engineering", min(95, round(46 + state.aiLevel * 9 + state.attritionRate * 0.7))),
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
