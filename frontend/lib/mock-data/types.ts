export type Industry =
  | "Manufacturing"
  | "Banking"
  | "Aviation"
  | "Healthcare"
  | "Construction"
  | "Retail"
  | "Logistics"
  | "Technology"
  | "Telecommunications"
  | "Energy";

export type Region =
  | "Klang Valley"
  | "Penang"
  | "Johor"
  | "Perak"
  | "Sabah"
  | "Sarawak"
  | "Singapore"
  | "Remote";

export type WorkStyle = "On-site" | "Hybrid" | "Remote";
export type JobStatus = "draft" | "open" | "closed";
export type ApplicationStatus = "submitted" | "reviewed" | "shortlisted" | "interviewing" | "offered" | "rejected";
export type CandidateLevel = "Graduate" | "Junior" | "Mid-level" | "Senior";
export type SkillCategory = "Technical" | "Digital" | "Business" | "Soft Skill" | "Operations" | "Compliance";
export type MarketSupply = "Critical" | "Scarce" | "Balanced" | "Abundant";
export type DepartmentStability = "Critical" | "At Risk" | "Stable" | "Growing";
export type RecommendationCategory = "Hire" | "Upskill" | "Mobility" | "Automate" | "Retain";
export type DashboardTone = "pink" | "teal" | "blue" | "green" | "purple" | "orange";

export interface MarketplaceCompany {
  id: string;
  name: string;
  industry: Industry;
  region: Region;
  employeeCount: number;
  hiringSignal: "Rapid growth" | "Steady hiring" | "Selective hiring" | "Transformation hiring";
  openRoles: number;
  qualifiedMatches: number;
  talentSupplyScore: number;
  competitionLevel: "Low" | "Medium" | "High";
}

export interface MarketplaceSkill {
  id: string;
  name: string;
  category: SkillCategory;
  demandScore: number;
  supplyScore: number;
  growthRate: number;
  relatedRoles: string[];
}

export interface MarketplaceJob {
  id: string;
  companyId: string;
  title: string;
  department: string;
  industry: Industry;
  region: Region;
  workStyle: WorkStyle;
  salaryRange: [number, number];
  status: JobStatus;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  applicants: number;
  qualifiedMatches: number;
  urgency: "Low" | "Medium" | "High" | "Critical";
  postedDaysAgo: number;
}

export interface MarketplaceCandidate {
  id: string;
  name: string;
  level: CandidateLevel;
  region: Region;
  degree: string;
  targetRoles: string[];
  skills: string[];
  expectedSalary: number;
  availability: "Immediate" | "2 weeks" | "1 month" | "3 months";
  employabilityScore: number;
}

export interface MarketplaceApplication {
  id: string;
  candidateId: string;
  jobId: string;
  status: ApplicationStatus;
  matchScore: number;
  appliedDaysAgo: number;
}

export interface RegionalTalentSignal {
  region: Region;
  candidateSupply: number;
  employerDemand: number;
  averageMatchScore: number;
  strongestSkills: string[];
  shortageRoles: string[];
}

export interface DepartmentWorkforcePlan {
  id: string;
  name: string;
  currentHeadcount: number;
  projectedDemand: number;
  attritionRisk: number;
  retirementRisk: number;
  automationExposure: number;
  skillReadiness: number;
  stability: DepartmentStability;
  site?: string;
  avgAge?: number;
  avgTenure?: number;
  openRoles?: number;
  retirementEligible10Y?: number;
  pendingResignations?: number;
  flightRiskCount?: number;
  inUpskilling?: number;
  criticalProcesses?: string[];
  topSkills?: string[];
}

export interface SimulationRoleGap {
  role: string;
  department: string;
  current: number;
  projected: number;
  gap: number;
  marketSupply: MarketSupply;
  prioritySkills: string[];
  recommendedAction: RecommendationCategory;
  avgSalary?: number;
  timeToFillMonths?: number;
  internalReadyNow?: number;
  internalTrainable?: number;
  externalSupplyIndex?: number;
  riskReason?: string;
}

export interface SimulationSkillGap {
  skill: string;
  currentReadiness: number;
  targetReadiness: number;
  affectedRoles: string[];
  recommendedProgram: string;
  trainingCostPerPerson?: number;
  programLengthWeeks?: number;
  availableCohort?: number;
  businessImpact?: string;
}

export interface SimulationRecommendation {
  id: string;
  category: RecommendationCategory;
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

export interface WorkforceAssumption {
  id: string;
  label: string;
  value: string;
  detail: string;
}

export interface InternalTalentPool {
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

export interface HiringPlanDraft {
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

export interface CostBreakdownItem {
  label: string;
  value: number;
  detail: string;
}

export interface WorkforceTimelineEvent {
  date: string;
  label: string;
  severity: "critical" | "warning" | "medium";
  detail: string;
  linkedActionId: string;
}

export interface EmployeeDemoProfile {
  id: string;
  fullName: string;
  initials: string;
  region: Region;
  targetRole: string;
  currentRole: string;
  readinessScore: number;
  profileStrength: number;
  skills: string[];
  missingSkills: string[];
  nextAction: string;
}

export interface InternalGig {
  id: string;
  title: string;
  team: string;
  duration: string;
  matchScore: number;
  skills: string[];
  businessNeed: string;
  tone: DashboardTone;
}

export interface EmployerDashboardMetric {
  label: string;
  value: string;
  detail: string;
  tone: DashboardTone;
}

export interface EmployerAttentionItem {
  id: string;
  title: string;
  detail: string;
  meta: string;
  action: string;
  tone: DashboardTone;
}

export interface IndustrySignal {
  industry: Industry;
  openRoles: number;
  candidateSupply: number;
  shortageIndex: number;
  topRoles: string[];
  topSkills: string[];
}
