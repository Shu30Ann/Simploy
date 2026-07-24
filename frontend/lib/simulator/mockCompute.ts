import {
  manufacturingCostBreakdown,
  manufacturingDepartments,
  manufacturingForecast,
  manufacturingHiringPlanDrafts,
  manufacturingInternalTalentPools,
  manufacturingRecommendations,
  manufacturingRoleGaps,
  manufacturingTimelineEvents,
  manufacturingWorkforceAssumptions,
} from "@/lib/mock-data";
import type { SimState, SimResult, ChartPoint, DeptRisk, RoleGap } from "./types";

export const MOCK_ROLE_GAPS: RoleGap[] = [
  ...manufacturingRoleGaps.map((role) => ({
    role: role.role,
    dept: role.department,
    current: role.current,
    projected: role.projected,
    gap: role.gap,
    marketSupply: role.marketSupply,
    recommendedAction: role.recommendedAction,
    avgSalary: role.avgSalary,
    timeToFillMonths: role.timeToFillMonths,
    internalReadyNow: role.internalReadyNow,
    internalTrainable: role.internalTrainable,
    externalSupplyIndex: role.externalSupplyIndex,
    riskReason: role.riskReason,
    prioritySkills: role.prioritySkills,
  })),
];

const TIMEFRAME_YEARS: Record<SimState["timeframe"], number> = {
  "6month": 1,
  "1 yr":   2,
  "3 yr":   4,
  "5 yr":   6,
};

const ALL_YEARS = manufacturingForecast.map((point) => point.year);

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
  const automationDemandBoost = presets.aiAutomation ? aiLevel * 18 : aiLevel * 8;
  const budgetMultiplier = Math.max(0.55, 1 + (hiringBudget * 0.055));
  const attritionGapPressure = Math.max(0, attritionRate - 10) * 0.018 * attritionBoost;
  const retirementRelief = Math.max(0, retirementExtension - 3) * 0.025;
  const migrationRelief = Math.max(0, migrationImpact - 8) * 0.015;
  const actionEffectiveness = Math.min(1.2, Math.max(0.35, budgetMultiplier + retirementRelief + migrationRelief));

  const chartData: ChartPoint[] = years.map((year, i) => {
    const basePoint = manufacturingForecast[i] ?? manufacturingForecast[manufacturingForecast.length - 1];
    const supply = Math.max(1500, Math.round(
      basePoint.supply
      - (attritionRate * 85 * i * attritionBoost * retirePenalty)
      + ((hiringBudget + hiringPenalty) * 180 * i)
      + (aiMult * 120 * i)
      + retirementBoost * i
      + migrationBoost * i
    ));
    const demand = Math.round(basePoint.demand + (growthTarget * 120 * i) + automationDemandBoost * i);
    return { year, supply, demand, net: supply - demand };
  });

  const lastPoint = chartData[chartData.length - 1];
  const gap = lastPoint.demand - lastPoint.supply;

  const resilienceScore = Math.min(100, Math.max(10,
    100 - (gap / 80) - (attritionRate * 0.5) + (hiringBudget * 1.8) + (retirementExtension * 1.1) + (migrationImpact * 0.6)
  ));

  const deptRisks: DeptRisk[] = manufacturingDepartments.slice(0, 6).map((dept) => {
    const score = Math.min(95, Math.max(5, Math.round(
      20
      + dept.attritionRisk * 1.2
      + dept.retirementRisk * 0.7
      + dept.automationExposure * 0.25
      + (aiLevel === 3 ? 8 : 0)
      - hiringBudget
    )));

    return {
      id: dept.id,
      abbr: dept.name.split(" ").map((part) => part[0]).join("").slice(0, 3).toUpperCase(),
      label: dept.name,
      score,
      stability: dept.stability,
    };
  }).map(d => ({
    ...d,
    stability: (
      d.score >= 60 ? "Critical" :
      d.score >= 35 ? "At Risk"  :
      d.score >= 20 ? "Stable"   : "Growing"
    ) as DeptRisk["stability"],
  }));

  const roleGaps: RoleGap[] = MOCK_ROLE_GAPS.map((role) => {
    const isShortage = role.gap < 0;
    const automationSensitive = ["Production", "Quality Assurance", "Human Resources"].includes(role.dept);
    const technicalShortage = ["Maintenance", "Engineering", "Digital Transformation"].includes(role.dept);
    const pressure =
      isShortage
        ? 1 + attritionGapPressure + (technicalShortage ? aiLevel * 0.045 : 0) + (presets.massRetirement ? 0.12 : 0)
        : 1 + (automationSensitive ? aiLevel * 0.08 : 0);
    const relief = isShortage ? Math.min(0.32, (hiringBudget + 5) * 0.025 + retirementRelief + migrationRelief) : 0;
    const nextGap = isShortage
      ? Math.round(role.gap * Math.max(0.62, pressure - relief))
      : Math.round(role.gap * Math.max(0.72, pressure));
    const projected = Math.max(0, role.current - nextGap);

    return {
      ...role,
      projected,
      gap: nextGap,
      internalReadyNow: Math.round((role.internalReadyNow ?? 0) * actionEffectiveness),
      internalTrainable: Math.round((role.internalTrainable ?? 0) * actionEffectiveness),
      timeToFillMonths: Number(((role.timeToFillMonths ?? 3) * (presets.hiringFreeze ? 1.35 : 1) / Math.max(0.8, budgetMultiplier)).toFixed(1)),
    };
  });

  const shortageTotal = roleGaps.reduce((sum, role) => sum + Math.max(0, -role.gap), 0);
  const surplusTotal = roleGaps.reduce((sum, role) => sum + Math.max(0, role.gap), 0);
  const adjustedGap = Math.max(0, Math.round((gap + shortageTotal - surplusTotal * 0.35) / 2));
  const costMultiplier = Math.max(0.55, adjustedGap / 1110);
  const costBreakdown = manufacturingCostBreakdown.map((item) => ({
    ...item,
    value: Math.round(item.value * costMultiplier),
  }));
  const costOfInaction = costBreakdown.reduce((sum, item) => sum + item.value, 0);
  const gapReductionPotential = Math.round(
    manufacturingRecommendations.reduce((sum, action) => sum + (action.gapReduction ?? 0), 0) * actionEffectiveness,
  );
  const internalReadyNow = roleGaps.reduce((sum, role) => sum + (role.internalReadyNow ?? 0), 0);
  const internalTrainable = roleGaps.reduce((sum, role) => sum + (role.internalTrainable ?? 0), 0);
  const planCost = Math.round(18800000 * Math.max(0.72, budgetMultiplier));
  const modelNarrative =
    adjustedGap > 900
      ? "Critical shortage path: maintenance, automation engineering, and analytics capacity require immediate intervention."
      : adjustedGap > 500
        ? "Managed risk path: hiring and mobility reduce the worst shortages, but specialist retention remains exposed."
        : "Resilient path: current levers materially reduce the forecast gap, with mobility and upskilling doing most of the work.";

  return {
    chartData,
    resilienceScore: Math.round(resilienceScore * 10) / 10,
    deptRisks,
    projectedGap:   adjustedGap,
    costOfInaction,
    highRiskRoles:  roleGaps.filter((role) => role.gap < -40).length,
    roleGaps,
    assumptions: manufacturingWorkforceAssumptions,
    costBreakdown,
    talentPools: manufacturingInternalTalentPools,
    actionPlans: manufacturingRecommendations,
    hiringDrafts: manufacturingHiringPlanDrafts,
    timelineEvents: manufacturingTimelineEvents,
    gapReductionPotential,
    internalReadyNow,
    internalTrainable,
    planCost,
    modelNarrative,
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
  timeframe: "1 yr",
};

export const DEFAULT_RESULT = runMockSimulation(DEFAULT_STATE);
