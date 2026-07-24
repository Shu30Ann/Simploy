export interface ChartPoint {
  year: string;
  supply: number;
  demand: number;
  net: number;
  supply_b?: number;
  demand_b?: number;
  net_b?: number;
}

export interface SimState {
  attritionRate:       number;
  aiLevel:             number;
  hiringBudget:        number;
  growthTarget:        number;
  retirementExtension: number;
  migrationImpact:     number;
  presets: {
    attritionSpike: boolean;
    aiAutomation:   boolean;
    hiringFreeze:   boolean;
    massRetirement: boolean;
  };
  timeframe: "6month" | "1 yr" | "3 yr" | "5 yr";
}

export interface DeptRisk {
  id:        string;
  label:     string;
  abbr:      string;
  score:     number;
  stability: "Critical" | "At Risk" | "Stable" | "Growing";
}

export interface RoleGap {
  role:         string;
  dept:         string;
  current:      number;
  projected:    number;
  gap:          number;
  marketSupply: "Critical" | "Scarce" | "Balanced" | "Abundant";
  recommendedAction?: "Hire" | "Upskill" | "Mobility" | "Automate" | "Retain";
  avgSalary?: number;
  timeToFillMonths?: number;
  internalReadyNow?: number;
  internalTrainable?: number;
  externalSupplyIndex?: number;
  riskReason?: string;
  prioritySkills?: string[];
}

export interface SimulatorCostBreakdown {
  label: string;
  value: number;
  detail: string;
}

export interface SimulatorAssumption {
  id: string;
  label: string;
  value: string;
  detail: string;
}

export interface SimulatorTalentPool {
  id: string;
  sourceRole: string;
  targetRole: string;
  department: string;
  employeesReadyNow: number;
  employeesTrainable: number;
  readinessScore: number;
  program: string;
  estimatedCost: string;
  timeToProductive: string;
  skillsToClose: string[];
}

export interface SimulatorActionPlan {
  id: string;
  category: "Hire" | "Upskill" | "Mobility" | "Automate" | "Retain";
  priority: "Critical" | "High" | "Medium";
  title: string;
  problem: string;
  recommendation: string;
  estimatedCost: string;
  timeline: string;
  impact: "High" | "Medium-High" | "Medium";
  owner?: string;
  gapReduction?: number;
  confidence?: number;
  linkedRoles?: string[];
  nextStep?: string;
}

export interface SimulatorHiringDraft {
  id: string;
  role: string;
  department: string;
  targetHires: number;
  priority: "Critical" | "High" | "Medium";
  targetStart: string;
  budget: string;
  channels: string[];
  successMetric: string;
}

export interface SimulatorTimelineEvent {
  date: string;
  label: string;
  severity: "critical" | "warning" | "medium";
  detail: string;
  linkedActionId: string;
}

export interface SimResult {
  chartData:       ChartPoint[];
  resilienceScore: number;
  deptRisks:       DeptRisk[];
  projectedGap:    number;
  costOfInaction:  number;
  highRiskRoles:   number;
  roleGaps:        RoleGap[];
  assumptions:     SimulatorAssumption[];
  costBreakdown:   SimulatorCostBreakdown[];
  talentPools:     SimulatorTalentPool[];
  actionPlans:     SimulatorActionPlan[];
  hiringDrafts:    SimulatorHiringDraft[];
  timelineEvents:  SimulatorTimelineEvent[];
  gapReductionPotential: number;
  internalReadyNow: number;
  internalTrainable: number;
  planCost: number;
  modelNarrative: string;
}
