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
  timeframe: "CURRENT" | "5Y" | "10Y" | "20Y" | "30Y";
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
}

export interface SimResult {
  chartData:       ChartPoint[];
  resilienceScore: number;
  deptRisks:       DeptRisk[];
  projectedGap:    number;
  costOfInaction:  number;
  highRiskRoles:   number;
  roleGaps:        RoleGap[];
}
