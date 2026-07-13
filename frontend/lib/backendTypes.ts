import type { SimState, SimResult } from "@/lib/simulator/types";

export interface BackendJob {
  id: number;
  employer_id: number;
  department_id: number | null;
  department_name?: string | null;
  title: string;
  description: string;
  required_skills: string[];
  work_style: string;
  location: string | null;
  salary_min: number | null;
  salary_max: number | null;
  status: "draft" | "open" | "closed";
  applications_count: number;
  created_at: string;
}

export interface BackendApplication {
  id: number;
  job_id: number;
  employee_id: number;
  status: string;
  match_score: number;
  created_at: string;
  job_title: string;
  work_style: string;
  location: string | null;
  required_skills: string[];
  company_name?: string | null;
  candidate_name?: string | null;
}

export interface BackendSimulation {
  id: number;
  employer_id: number | null;
  name: string;
  input: SimState;
  result: SimResult;
  model_version: string;
  created_at: string;
}

export interface EmployerDashboardData {
  company_name: string;
  metrics: {
    active_roles: number;
    draft_roles: number;
    applications: number;
    qualified_matches: number;
  };
  jobs: BackendJob[];
  applications: BackendApplication[];
  simulations: BackendSimulation[];
}

export interface EmployeeDashboardData {
  full_name: string;
  target_role: string | null;
  skills: string[];
  jobs: BackendJob[];
  applications: BackendApplication[];
}

export type CareerGpsRiskTolerance = "low" | "moderate" | "high";

export interface EmployeeCareerProfile {
  id: number;
  user_id: number;
  full_name: string;
  location: string | null;
  target_role: string | null;
  experience_years: number;
  skills: string[];
  created_at: string;
}

export interface CareerGpsOnboardingProgress {
  id: number | null;
  employee_profile_id: number;
  current_step: string;
  completed_steps: string[];
  is_complete: boolean;
  last_completed_at: string | null;
}

export interface CareerGpsOnboardingProgressPayload {
  current_step: string;
  completed_steps: string[];
  is_complete: boolean;
}

export interface CareerGpsGoals {
  id: number | null;
  employee_profile_id: number;
  career_ambition: string | null;
  target_role: string | null;
  target_industry: string | null;
  target_retirement_age: number | null;
  target_timeline_months: number | null;
  motivation: string | null;
  status: string;
}

export interface CareerGpsGoalsPayload {
  career_ambition: string | null;
  target_role: string | null;
  target_industry: string | null;
  target_retirement_age: number | null;
  target_timeline_months: number | null;
  motivation: string | null;
}

export interface CareerGpsLifestylePriorities {
  id: number | null;
  employee_profile_id: number;
  income_priority: number;
  work_life_balance_priority: number;
  leadership_priority: number;
  job_security_priority: number;
  remote_work_priority: number;
  international_mobility: boolean;
  risk_tolerance: CareerGpsRiskTolerance;
  learning_budget: number | null;
  preferred_company_type: string | null;
  willing_to_relocate: boolean;
  preferred_locations: string[];
  preferred_work_styles: string[];
  top_two_non_negotiable_priorities: string[];
}

export interface CareerGpsLifestylePrioritiesPayload {
  income_priority: number;
  work_life_balance_priority: number;
  leadership_priority: number;
  job_security_priority: number;
  remote_work_priority: number;
  international_mobility: boolean;
  risk_tolerance: CareerGpsRiskTolerance;
  learning_budget: number | null;
  preferred_company_type: string | null;
  willing_to_relocate: boolean;
  preferred_locations: string[];
  preferred_work_styles: string[];
  top_two_non_negotiable_priorities: string[];
}

export interface CareerGpsConstraint {
  id: number | null;
  employee_profile_id: number;
  constraint_type: string;
  label: string;
  value: Record<string, unknown>;
  is_blocking: boolean;
}

export interface CareerGpsConstraintPayload {
  constraint_type: string;
  label: string;
  value: Record<string, unknown>;
  is_blocking: boolean;
}

export interface CareerGpsConstraintsPayload {
  constraints: CareerGpsConstraintPayload[];
}

export interface CareerGpsNorthStarSummary {
  employee_profile_id: number;
  career_ambition: string | null;
  target_role: string | null;
  target_industry: string | null;
  target_retirement_age: number | null;
  target_timeline_months: number | null;
  income_priority: number;
  work_life_balance_priority: number;
  leadership_priority: number;
  job_security_priority: number;
  remote_work_priority: number;
  international_mobility: boolean;
  risk_tolerance: CareerGpsRiskTolerance;
  learning_budget: number | null;
  preferred_company_type: string | null;
  willing_to_relocate: boolean;
  top_two_non_negotiable_priorities: string[];
  is_onboarding_complete: boolean;
  missing_sections: string[];
}

export interface CareerGpsProfile {
  employee: EmployeeCareerProfile;
  onboarding_progress: CareerGpsOnboardingProgress;
  goals: CareerGpsGoals;
  lifestyle_priorities: CareerGpsLifestylePriorities;
  constraints: CareerGpsConstraint[];
  north_star: CareerGpsNorthStarSummary;
}

export type CareerGpsRouteType = "recommended" | "accelerated" | "balanced";
export type CareerGpsProgressStatus = "not_started" | "in_progress" | "completed" | "skipped";

export interface CareerGpsOccupationSummary {
  id: number;
  slug: string;
  title: string;
  family: string;
  seniority_level: string | null;
  source_label: string;
}

export interface CareerGpsSkillGap {
  skill_name: string;
  skill_type: string;
  priority: number;
  proficiency_level: string;
}

export interface CareerGpsMilestoneAction {
  action_type: string;
  title: string;
  description: string | null;
  sequence: number;
  estimated_hours: number | null;
  resource_url: string | null;
}

export interface CareerGpsMilestone {
  title: string;
  description: string | null;
  sequence: number;
  duration_weeks: number | null;
  focus_skill_name: string | null;
  actions: CareerGpsMilestoneAction[];
}

export interface CareerGpsRouteScoreComponent {
  key: string;
  label: string;
  score: number;
  weight: number;
  explanation: string;
}

export interface CareerGpsStoredScoreComponent {
  route_type: CareerGpsRouteType;
  component_key: string;
  label: string;
  score: number;
  weight: number;
  explanation: string;
}

export interface CareerGpsRoute {
  route_type: CareerGpsRouteType;
  title: string;
  summary: string;
  score: number;
  estimated_months: number;
  target_occupation: CareerGpsOccupationSummary;
  transition: Record<string, unknown> | null;
  skill_gaps: CareerGpsSkillGap[];
  milestones: CareerGpsMilestone[];
  score_components: CareerGpsRouteScoreComponent[];
  explanation: string;
}

export interface CareerGpsNextBestAction {
  title: string;
  description: string;
  route_type: CareerGpsRouteType;
}

export interface CareerGpsRoadmap {
  roadmap_id: number;
  version: number;
  scoring_version: string;
  title: string;
  summary: string;
  fit_score: number;
  target_occupation_id: number | null;
  routes: CareerGpsRoute[];
  score_components: CareerGpsStoredScoreComponent[];
  next_best_action: CareerGpsNextBestAction;
  selected_route_type: CareerGpsRouteType;
  source_note: string;
}

export interface CareerGpsSelectedRoutePayload {
  selected_route_type: CareerGpsRouteType;
}

export interface CareerGpsProgressEntry {
  id: number;
  roadmap_id: number;
  route_type: CareerGpsRouteType;
  milestone_sequence: number;
  action_sequence: number | null;
  status: CareerGpsProgressStatus;
  progress_percent: number;
  notes: string | null;
  evidence_url: string | null;
  completed_at: string | null;
  updated_at: string | null;
}

export interface CareerGpsProgressResponse {
  roadmap_id: number;
  entries: CareerGpsProgressEntry[];
}

export interface CareerGpsProgressUpdatePayload {
  route_type: CareerGpsRouteType;
  milestone_sequence: number;
  action_sequence?: number | null;
  status: CareerGpsProgressStatus;
  notes?: string | null;
  evidence_url?: string | null;
  completed_at?: string | null;
}

export interface CareerGpsNextBestActionDetail {
  roadmap_id: number;
  route_type: CareerGpsRouteType;
  milestone_sequence: number;
  action_sequence: number;
  action_title: string;
  why_it_matters: string;
  estimated_effort: string;
  target_completion_date: string;
  expected_impact: string;
  related_milestone: string;
  status: CareerGpsProgressStatus;
  recommended_skill_gained: string;
  selection_reason: string;
  is_alternative: boolean;
}

export interface CareerGpsNextBestActionStatusPayload {
  route_type: CareerGpsRouteType;
  milestone_sequence: number;
  action_sequence: number;
  status: CareerGpsProgressStatus;
}

export interface CareerGpsMilestoneActionDetail extends CareerGpsMilestoneAction {
  progress: CareerGpsProgressEntry | null;
}

export interface CareerGpsMilestoneDetail {
  roadmap_id: number;
  route_type: CareerGpsRouteType;
  milestone_sequence: number;
  title: string;
  why_recommended: string;
  estimated_timeline: string;
  required_skills: string[];
  existing_skills: string[];
  missing_skills: string[];
  recommended_certification: string;
  recommended_experience: string;
  suggested_project: string;
  relevant_target_roles: string[];
  transition_difficulty: string;
  lifestyle_impact: string;
  confidence_level: string;
  main_assumptions: string[];
  immediate_actions: CareerGpsMilestoneActionDetail[];
  milestone_progress: CareerGpsProgressEntry | null;
}

export type CareerGpsScenarioCode =
  | "prioritise_salary"
  | "prioritise_work_life_balance"
  | "avoid_management"
  | "relocate_country"
  | "change_industry"
  | "retire_earlier"
  | "complete_masters_degree"
  | "focus_entrepreneurship";

export interface CareerGpsWhatIfScenarioPayload {
  scenario_name: string | null;
  adjustments: CareerGpsScenarioCode[];
  target_country: string | null;
  target_industry: string | null;
  target_retirement_age: number | null;
  target_timeline_months: number | null;
}

export interface CareerGpsWhatIfScenarioSummary {
  scenario_name: string;
  adjustments: CareerGpsScenarioCode[];
  applied_overrides: string[];
}

export interface CareerGpsWhatIfChange {
  category: string;
  label: string;
  before: string;
  after: string;
  changed: boolean;
  explanation: string;
}

export interface CareerGpsWhatIfComparison {
  current_roadmap_id: number;
  current_version: number;
  preview_version: number;
  changes: CareerGpsWhatIfChange[];
}

export interface CareerGpsWhatIfPreview {
  scenario: CareerGpsWhatIfScenarioSummary;
  preview_roadmap: CareerGpsRoadmap;
  comparison: CareerGpsWhatIfComparison;
}

export interface CareerGpsWhatIfApplyResponse {
  scenario: CareerGpsWhatIfScenarioSummary;
  applied_roadmap: CareerGpsRoadmap;
  comparison: CareerGpsWhatIfComparison;
  message: string;
}

export type CareerBuddySender = "employee" | "assistant" | "system";
export type CareerBuddyConfidence = "low" | "medium" | "high";

export interface CareerBuddyStructuredResponse {
  answer: string;
  recommended_actions: string[];
  referenced_route_type: CareerGpsRouteType | null;
  confidence: CareerBuddyConfidence;
  used_context: string[];
  safety_notes: string[];
}

export interface CareerBuddyConversation {
  id: number;
  employee_profile_id: number;
  roadmap_id: number | null;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CareerBuddyMessage {
  id: number;
  conversation_id: number;
  sender: CareerBuddySender;
  content: string;
  structured_response: Record<string, unknown>;
  provider: string;
  model: string | null;
  created_at: string;
}

export interface CareerBuddyConversationDetail extends CareerBuddyConversation {
  messages: CareerBuddyMessage[];
}

export interface CareerBuddyMessagePayload {
  conversation_id: number | null;
  roadmap_id: number | null;
  route_type: CareerGpsRouteType;
  message: string;
}

export interface CareerBuddyReply {
  conversation: CareerBuddyConversation;
  user_message: CareerBuddyMessage;
  assistant_message: CareerBuddyMessage;
  response: CareerBuddyStructuredResponse;
  provider: string;
  model: string | null;
  rate_limit_remaining: number;
}
