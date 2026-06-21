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
