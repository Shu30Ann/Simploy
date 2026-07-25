"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, ClipboardList, Target, UserCheck, Users } from "lucide-react";
import { getAuthToken, getJson } from "@/lib/api";
import type { BackendJob, EmployerDashboardData } from "@/lib/backendTypes";
import type { DashboardTone, WorkStyle } from "@/lib/mock-data";
import { employerDashboardMetrics, marketplaceCompanies, marketplaceJobs } from "@/lib/mock-data";

export type EmployerJobView = {
  title: string;
  department: string;
  workStyle: WorkStyle;
  hiringStatus: string;
  appsReceived: number;
  matches: string[];
  matchTone: string;
};

export type EmployerMetricView = {
  label: string;
  value: string;
  detail: string;
  icon: typeof ClipboardList;
  tone: DashboardTone;
};

export const fallbackJobs: EmployerJobView[] = marketplaceJobs.slice(0, 6).map((job, index) => ({
  title: job.title,
  department: `${marketplaceCompanies.find((company) => company.id === job.companyId)?.name ?? job.department} - ${job.department}`,
  workStyle: job.workStyle,
  hiringStatus: job.status === "open" ? "Hiring" : job.status === "draft" ? "Draft" : "Closed",
  appsReceived: job.applicants,
  matches: job.qualifiedMatches > 0 ? [String(job.qualifiedMatches), `+${Math.max(1, Math.round(job.applicants / 12))}`] : [],
  matchTone: ["pink", "teal", "purple"][index % 3],
}));

export function jobFromBackend(job: BackendJob): EmployerJobView {
  return {
    title: job.title,
    department: job.department_name ?? "General",
    workStyle: (["On-site", "Hybrid", "Remote"].includes(job.work_style) ? job.work_style : "Hybrid") as WorkStyle,
    hiringStatus: job.status === "open" ? "Hiring" : job.status === "draft" ? "Draft" : "Closed",
    appsReceived: job.applications_count,
    matches: job.applications_count > 0 ? [`${job.applications_count}`] : [],
    matchTone: job.applications_count > 0 ? "pink" : "purple",
  };
}

export const commandMetrics: EmployerMetricView[] = [
  { ...employerDashboardMetrics[0], icon: ClipboardList },
  { ...employerDashboardMetrics[1], icon: Users },
  { ...employerDashboardMetrics[2], icon: BadgeCheck },
  { ...employerDashboardMetrics[3], icon: Target },
];

export const toneStyles: Record<string, string> = {
  pink: "border-[#E3D8BC] bg-[#F6F1E4] text-[#B08A44]",
  teal: "border-[#CBDFD4] bg-[#E7F0E9] text-[#114F3B]",
  purple: "border-[#DFD6BE] bg-[#F1EDE0] text-[#17694F]",
  orange: "border-[#E3D8BC] bg-[#F6F1E4] text-[#8B7434]",
};

export function Pill({ children, tone = "pink" }: { children: React.ReactNode; tone?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${toneStyles[tone]}`}
    >
      {children}
    </span>
  );
}

export type LoadState = "idle" | "loading" | "loaded" | "fallback";

export function useEmployerDashboard() {
  const [dashboard, setDashboard] = useState<EmployerDashboardData | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("idle");

  useEffect(() => {
    if (!getAuthToken()) {
      setLoadState("fallback");
      return;
    }

    setLoadState("loading");
    getJson<EmployerDashboardData>("/dashboard/employer", { auth: true })
      .then((data) => {
        setDashboard(data);
        setLoadState("loaded");
      })
      .catch(() => setLoadState("fallback"));
  }, []);

  return { dashboard, loadState };
}

export function metricsFromDashboard(dashboard: EmployerDashboardData | null): EmployerMetricView[] {
  if (!dashboard) return commandMetrics;
  return [
    {
      label: "Active Roles",
      value: String(dashboard.metrics.active_roles),
      detail: `${dashboard.metrics.draft_roles} drafts in progress`,
      icon: ClipboardList,
      tone: "pink" as DashboardTone,
    },
    {
      label: "Applications",
      value: String(dashboard.metrics.applications),
      detail: `${dashboard.metrics.qualified_matches} qualified matches`,
      icon: Users,
      tone: "teal" as DashboardTone,
    },
    { label: "Hires", value: "0", detail: "No accepted offers yet", icon: UserCheck, tone: "purple" as DashboardTone },
    {
      label: "Saved Plans",
      value: String(dashboard.simulations.length),
      detail: "Workforce simulations saved",
      icon: BadgeCheck,
      tone: "pink" as DashboardTone,
    },
  ];
}
