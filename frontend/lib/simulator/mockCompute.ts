import type { SimState, SimResult, ChartPoint, DeptRisk, RoleGap } from "./types";

export const MOCK_ROLE_GAPS: RoleGap[] = [
  { role: "Sr. Software Engineer", dept: "Engineering", current: 120, projected: 340, gap: -220, marketSupply: "Critical" },
  { role: "Data Analyst",          dept: "Engineering", current: 85,  projected: 180, gap: -95,  marketSupply: "Scarce"   },
  { role: "DevOps Engineer",       dept: "Engineering", current: 40,  projected: 110, gap: -70,  marketSupply: "Critical" },
  { role: "Product Manager",       dept: "Sales",       current: 62,  projected: 115, gap: -53,  marketSupply: "Balanced" },
  { role: "ML Engineer",           dept: "Engineering", current: 18,  projected: 65,  gap: -47,  marketSupply: "Critical" },
  { role: "Sales Engineer",        dept: "Sales",       current: 55,  projected: 90,  gap: -35,  marketSupply: "Scarce"   },
];

const TIMEFRAME_YEARS: Record<SimState["timeframe"], number> = {
  CURRENT: 1,
  "1Y":    2,
  "3Y":    3,
  "5Y":    4,
  "10Y":   5,
  "20Y":   6,
  "30Y":   7,
};

const ALL_YEARS = ["2024", "2026", "2028", "2030", "2032", "2040", "2055"];

export function runMockSimulation(state: SimState): SimResult {
  const { attritionRate, aiLevel, hiringBudget, growthTarget,
          retirementExtension, migrationImpact, presets, timeframe } = state;

  const yearCount = TIMEFRAME_YEARS[timeframe];
  const years = ALL_YEARS.slice(0, yearCount + 1);

  const aiMult         = [0.8, 1.0, 1.2, 1.5][aiLevel];
  const attritionBoost = presets.attritionSpike  ? 1.4 : 1.0;
  const hiringPenalty  = presets.hiringFreeze    ? -3  : 0;
  const retirePenalty  = presets.massRetirement  ? 1.3 : 1.0;
  const retirementBoost = (retirementExtension ?? 3) * 40;
  const migrationBoost  = (migrationImpact ?? 12) * 30;

  const chartData: ChartPoint[] = years.map((year, i) => {
    const supply = Math.max(1500, Math.round(
      5000
      - (attritionRate * 85 * i * attritionBoost * retirePenalty)
      + ((hiringBudget + hiringPenalty) * 180 * i)
      + (aiMult * 120 * i)
      + retirementBoost * i
      + migrationBoost * i
    ));
    const demand = Math.round(4200 + (growthTarget * 160 * i));
    return { year, supply, demand, net: supply - demand };
  });

  const lastPoint = chartData[chartData.length - 1];
  const gap = lastPoint.demand - lastPoint.supply;

  const resilienceScore = Math.min(100, Math.max(10,
    100 - (gap / 80) - (attritionRate * 0.5)
  ));

  const deptRisks: DeptRisk[] = [
    {
      id: "eng", abbr: "ENG", label: "Engineering",
      score: Math.min(95, Math.round(30 + attritionRate * 1.8 + (aiLevel === 3 ? 15 : 0))),
      stability: "Critical",
    },
    {
      id: "sls", abbr: "SLS", label: "Sales",
      score: Math.min(80, Math.round(20 + attritionRate * 1.2)),
      stability: "At Risk",
    },
    {
      id: "ops", abbr: "OPS", label: "Operations",
      score: Math.round(10 + attritionRate * 0.6),
      stability: "Stable",
    },
    {
      id: "fin", abbr: "FIN", label: "Finance",
      score: Math.max(5, Math.round(25 - hiringBudget * 2)),
      stability: "Growing",
    },
  ].map(d => ({
    ...d,
    stability: (
      d.score >= 60 ? "Critical" :
      d.score >= 35 ? "At Risk"  :
      d.score >= 20 ? "Stable"   : "Growing"
    ) as DeptRisk["stability"],
  }));

  return {
    chartData,
    resilienceScore: Math.round(resilienceScore * 10) / 10,
    deptRisks,
    projectedGap:   Math.max(0, gap),
    costOfInaction: Math.round(gap * 14200),
    highRiskRoles:  Math.max(0, Math.round(gap / 300)),
    roleGaps:       MOCK_ROLE_GAPS,
  };
}

export const DEFAULT_STATE: SimState = {
  attritionRate:       12,
  aiLevel:             2,
  hiringBudget:        -2,
  growthTarget:        8,
  retirementExtension: 3,
  migrationImpact:     12,
  presets: { attritionSpike: true, aiAutomation: true, hiringFreeze: false, massRetirement: false },
  timeframe: "1Y",
};

export const DEFAULT_RESULT = runMockSimulation(DEFAULT_STATE);
