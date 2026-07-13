"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  Compass,
  FileText,
  Flag,
  Gauge,
  GitBranch,
  ListChecks,
  Loader2,
  Lock,
  Map,
  MapPin,
  Play,
  RefreshCw,
  Route,
  Save,
  ShieldCheck,
  SkipForward,
  SlidersHorizontal,
  Sparkles,
  Target,
} from "lucide-react";
import { ProfileMenu } from "@/components/ProfileMenu";
import { getAuthToken, getJson, postJson, putJson } from "@/lib/api";
import type {
  CareerGpsMilestone,
  CareerGpsMilestoneDetail,
  CareerGpsNextBestActionDetail,
  CareerGpsNextBestActionStatusPayload,
  CareerGpsProfile,
  CareerGpsProgressEntry,
  CareerGpsProgressResponse,
  CareerGpsProgressStatus,
  CareerGpsProgressUpdatePayload,
  CareerGpsRoadmap,
  CareerGpsRoute,
  CareerGpsRouteScoreComponent,
  CareerGpsRouteType,
  CareerGpsSelectedRoutePayload,
} from "@/lib/backendTypes";
import { loadRiasecResult, type RiasecResult } from "@/lib/riasec";
import { routes } from "@/lib/routes";

type ShellState = {
  profile: CareerGpsProfile | null;
  roadmap: CareerGpsRoadmap | null;
};

type JourneyNodeStatus = "start" | "completed" | "active" | "future" | "locked" | "destination";

type JourneyNode = {
  id: string;
  title: string;
  stage: string;
  timing: string;
  readiness: number;
  status: JourneyNodeStatus;
  missingRequirement: string;
  milestone: CareerGpsMilestone | null;
  sequence: number;
  desktop: { x: number; y: number };
};

type ProgressEntriesByKey = Record<string, CareerGpsProgressEntry>;

type SaveProgressHandler = (
  kind: "action" | "milestone",
  payload: CareerGpsProgressUpdatePayload,
) => Promise<void>;

const routeLabels = {
  recommended: "Recommended Route",
  accelerated: "Accelerated Route",
  balanced: "Balanced Route",
} as const;

const routeTone: Record<
  CareerGpsRouteType,
  { accent: string; bg: string; border: string; ring: string; line: string }
> = {
  recommended: {
    accent: "text-[#E8197A]",
    bg: "bg-[#FFF0F8]",
    border: "border-[#FFD0E8]",
    ring: "ring-[#E8197A]/20",
    line: "bg-[#E8197A]",
  },
  accelerated: {
    accent: "text-[#0891B2]",
    bg: "bg-[#E0F9FF]",
    border: "border-[#BAF3FF]",
    ring: "ring-[#06B6D4]/20",
    line: "bg-[#06B6D4]",
  },
  balanced: {
    accent: "text-[#6B46C1]",
    bg: "bg-[#F5F0FF]",
    border: "border-[#DDD0F8]",
    ring: "ring-[#6B46C1]/20",
    line: "bg-[#6B46C1]",
  },
};

const routeHexColor: Record<CareerGpsRouteType, string> = {
  recommended: "#E8197A",
  accelerated: "#06B6D4",
  balanced: "#6B46C1",
};

function initialsFromName(name: string | null | undefined) {
  const initials = (name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "E";
}

function careerStage(experienceYears: number | null | undefined) {
  const years = Math.max(0, experienceYears ?? 0);
  if (years >= 10) return "Advanced career";
  if (years >= 6) return "Senior contributor";
  if (years >= 3) return "Building momentum";
  if (years > 0) return "Early career";
  return "Career foundation";
}

function setupReadiness(profile: CareerGpsProfile | null) {
  if (!profile) return 0;
  if (profile.north_star.is_onboarding_complete) return 100;
  const required = ["career_ambition", "target_role", "target_industry", "top_two_non_negotiable_priorities"];
  const missing = new Set(profile.north_star.missing_sections);
  const completed = required.filter((section) => !missing.has(section)).length;
  return Math.round((completed / required.length) * 100);
}

function formatPriority(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function selectedRoute(roadmap: CareerGpsRoadmap | null, routeType?: CareerGpsRouteType | null) {
  return (
    roadmap?.routes.find((route) => route.route_type === routeType) ??
    roadmap?.routes.find((route) => route.route_type === roadmap.selected_route_type) ??
    roadmap?.routes.find((route) => route.route_type === "recommended") ??
    roadmap?.routes[0] ??
    null
  );
}

function strongestComponent(route: CareerGpsRoute) {
  return [...route.score_components].sort((a, b) => b.score - a.score)[0] ?? null;
}

function weakestComponent(route: CareerGpsRoute) {
  return [...route.score_components].sort((a, b) => a.score - b.score)[0] ?? null;
}

function component(route: CareerGpsRoute, key: string) {
  return route.score_components.find((item) => item.key === key);
}

function metricValue(route: CareerGpsRoute, key: string) {
  return Math.round(component(route, key)?.score ?? route.score);
}

function readinessFromRoute(route: CareerGpsRoute) {
  return metricValue(route, "skill_fit");
}

function statusLabel(status: JourneyNodeStatus) {
  if (status === "start") return "Starting point";
  if (status === "completed") return "Completed";
  if (status === "active") return "Active now";
  if (status === "locked") return "Locked";
  if (status === "destination") return "Destination";
  return "Future";
}

function progressStatusLabel(status: CareerGpsProgressStatus | null | undefined) {
  if (status === "completed") return "Complete";
  if (status === "in_progress") return "In progress";
  if (status === "skipped") return "Skipped";
  return "Not started";
}

function progressKey(routeType: CareerGpsRouteType, milestoneSequence: number, actionSequence?: number | null) {
  return actionSequence
    ? `${routeType}-${milestoneSequence}-action-${actionSequence}`
    : `${routeType}-${milestoneSequence}-milestone`;
}

function progressEntriesByKey(entries: CareerGpsProgressEntry[]) {
  return entries.reduce<ProgressEntriesByKey>((accumulator, entry) => {
    accumulator[progressKey(entry.route_type, entry.milestone_sequence, entry.action_sequence)] = entry;
    return accumulator;
  }, {});
}

function missingRequirement(milestone: CareerGpsMilestone | null, route: CareerGpsRoute) {
  if (!milestone) return route.skill_gaps[0]?.skill_name ?? "Role evidence";
  const focus = milestone.focus_skill_name;
  const exact = route.skill_gaps.find((gap) => gap.skill_name === focus);
  return exact?.skill_name ?? focus ?? route.skill_gaps[0]?.skill_name ?? "Role evidence";
}

function milestoneTiming(milestone: CareerGpsMilestone | null, route: CareerGpsRoute) {
  if (!milestone) return `${route.estimated_months} months`;
  return `${milestone.duration_weeks ?? 4} weeks`;
}

function confidenceLevel(score: number) {
  if (score >= 82) return "High";
  if (score >= 68) return "Medium";
  if (score >= 52) return "Developing";
  return "Low";
}

function componentText(componentItem: CareerGpsRouteScoreComponent | null) {
  if (!componentItem) return "Overall fit";
  return `${componentItem.label} (${Math.round(componentItem.score)}%)`;
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function formatActionDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function progressStatusTone(status: CareerGpsProgressStatus | null | undefined) {
  if (status === "completed") return "border-[#A7F3D0] bg-[#ECFDF5] text-[#047857]";
  if (status === "in_progress") return "border-[#BAF3FF] bg-[#E0F9FF] text-[#0891B2]";
  if (status === "skipped") return "border-[#E2D9F3] bg-[#F8F5FC] text-[#6B7280]";
  return "border-[#FFD0E8] bg-[#FFF0F8] text-[#E8197A]";
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-[#F1ECF8] ${className}`} />;
}

function LoadingShell() {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-[#F0EBF8] bg-white p-5 shadow-[0_4px_24px_rgba(232,25,122,0.08)]">
        <SkeletonBlock className="h-5 w-36" />
        <SkeletonBlock className="mt-4 h-10 w-72 max-w-full" />
        <SkeletonBlock className="mt-3 h-4 w-full max-w-2xl" />
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <SkeletonBlock className="h-20" />
          <SkeletonBlock className="h-20" />
          <SkeletonBlock className="h-20" />
        </div>
      </section>
      <section className="grid gap-4 lg:grid-cols-3">
        <SkeletonBlock className="h-44" />
        <SkeletonBlock className="h-44" />
        <SkeletonBlock className="h-44" />
      </section>
    </div>
  );
}

function AlertMessage({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-[#FECACA] bg-[#FFF5F5] px-4 py-3 text-sm font-bold text-[#DC2626]">
      <AlertCircle size={17} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

function EmptyPanel({
  icon: Icon,
  label,
  title,
  description,
}: {
  icon: LucideIcon;
  label: string;
  title: string;
  description: string;
}) {
  return (
    <section className="rounded-lg border border-dashed border-[#DDD0F8] bg-white p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#F5F0FF] text-[#6B46C1]">
          <Icon size={20} />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#9CA3AF]">{label}</p>
          <h2 className="mt-1 text-lg font-bold text-[#1A1033]">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-[#6B7280]">{description}</p>
        </div>
      </div>
    </section>
  );
}

function HeaderNav({ active = false }: { active?: boolean }) {
  return (
    <nav className="hidden items-center gap-1 text-sm font-semibold text-[#6B7280] md:flex">
      <Link href={`${routes.employeeDashboard}#asia-market-title`} className="rounded-full px-4 py-2 hover:bg-[#F8F5FC]">
        Asia Market Insight
      </Link>
      <Link
        href={routes.employeeCareerGps}
        className={`rounded-full px-4 py-2 ${active ? "bg-[#FFF0F8] text-[#E8197A]" : "hover:bg-[#F8F5FC]"}`}
      >
        Career GPS
      </Link>
      <Link href={routes.employeeApplications} className="rounded-full px-4 py-2 hover:bg-[#F8F5FC]">
        Applications
      </Link>
    </nav>
  );
}

function CareerGpsHeader({
  profile,
  roadmap,
  isRefreshing,
  onRefresh,
}: {
  profile: CareerGpsProfile;
  roadmap: CareerGpsRoadmap | null;
  isRefreshing: boolean;
  onRefresh: () => void;
}) {
  const destination = profile.north_star.target_role ?? profile.employee.target_role ?? "Set a target role";
  const stage = careerStage(profile.employee.experience_years);
  const readiness = roadmap ? Math.round(roadmap.fit_score) : setupReadiness(profile);

  return (
    <section className="relative overflow-hidden rounded-lg border border-[#F0EBF8] bg-white shadow-[0_4px_24px_rgba(232,25,122,0.08)]">
      <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[#F0FDFF] lg:block" />
      <div className="relative grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:p-7">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-[#BAF3FF] bg-[#E0F9FF] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#0891B2]">
            <Compass size={14} />
            Career GPS
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#1A1033] sm:text-4xl">Your Career GPS</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6B7280]">
            A focused planning workspace for your destination, next best action, and upcoming career journey map.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`${routes.employeeDashboard}#settings`}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#1A1033] px-4 py-2.5 text-sm font-bold text-white"
            >
              <Target size={16} />
              Edit Goals
            </Link>
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#DDD0F8] bg-white px-4 py-2.5 text-sm font-bold text-[#6B46C1] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRefreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              Recalculate
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <div className="rounded-lg border border-[#FFD0E8] bg-[#FFF8FC] p-4">
            <p className="text-xs font-bold uppercase text-[#9CA3AF]">Current stage</p>
            <p className="mt-2 text-lg font-bold text-[#E8197A]">{stage}</p>
            <p className="mt-1 text-xs font-semibold text-[#6B7280]">
              {profile.employee.experience_years} years experience
            </p>
          </div>
          <div className="rounded-lg border border-[#BAF3FF] bg-white p-4">
            <p className="text-xs font-bold uppercase text-[#9CA3AF]">Main destination</p>
            <p className="mt-2 text-lg font-bold text-[#1A1033]">{destination}</p>
            <p className="mt-1 text-xs font-semibold text-[#0891B2]">
              {profile.north_star.target_industry ?? "Industry not set"}
            </p>
          </div>
          <div className="rounded-lg border border-[#F0EBF8] bg-[#FDFCFF] p-4">
            <p className="text-xs font-bold uppercase text-[#9CA3AF]">Readiness</p>
            <div className="mt-2 flex items-end gap-2">
              <p className="text-2xl font-bold text-[#1A1033]">{readiness}%</p>
              <p className="pb-1 text-xs font-bold text-[#6B7280]">{roadmap ? "roadmap fit" : "profile setup"}</p>
            </div>
            <div className="mt-3 h-2 rounded-full bg-[#F0EBF8]">
              <div className="h-2 rounded-full bg-[#E8197A]" style={{ width: `${Math.max(0, Math.min(100, readiness))}%` }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function NorthStarSummary({ profile }: { profile: CareerGpsProfile }) {
  const summary = profile.north_star;
  const priorities = summary.top_two_non_negotiable_priorities.length
    ? summary.top_two_non_negotiable_priorities.slice(0, 2).map(formatPriority)
    : ["Not set"];
  const constraints = profile.constraints.length ? profile.constraints.slice(0, 3) : [];
  const modeParts = [
    summary.preferred_company_type,
    summary.willing_to_relocate ? "Open to relocation" : null,
    summary.international_mobility ? "International mobility" : null,
  ].filter(Boolean);
  const mode = modeParts.length ? modeParts.join(" / ") : "Flexible";
  const readiness = setupReadiness(profile);

  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.6fr)]">
      <div className="rounded-lg border border-[#F0EBF8] bg-white p-5 shadow-[0_4px_24px_rgba(232,25,122,0.08)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#FFD0E8] bg-[#FFF0F8] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#E8197A]">
              <Flag size={14} />
              Career North Star
            </p>
            <h2 className="mt-3 text-2xl font-bold text-[#1A1033]">{summary.career_ambition ?? "Define your main goal"}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B7280]">
              This summary uses your saved Career GPS profile and existing employee data.
            </p>
          </div>
          <Link href={`${routes.employeeDashboard}#settings`} className="text-sm font-bold text-[#0891B2]">
            Update summary
          </Link>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-lg bg-[#FDFCFF] p-4">
            <p className="text-xs font-bold uppercase text-[#9CA3AF]">Target role</p>
            <p className="mt-2 text-base font-bold text-[#1A1033]">{summary.target_role ?? profile.employee.target_role ?? "Not set"}</p>
          </div>
          <div className="rounded-lg bg-[#FDFCFF] p-4">
            <p className="text-xs font-bold uppercase text-[#9CA3AF]">Top priorities</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {priorities.map((priority) => (
                <span key={priority} className="rounded-full bg-[#E0F9FF] px-3 py-1 text-xs font-bold text-[#0891B2]">
                  {priority}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-lg bg-[#FDFCFF] p-4">
            <p className="text-xs font-bold uppercase text-[#9CA3AF]">Preferred career mode</p>
            <p className="mt-2 text-base font-bold text-[#1A1033]">{mode}</p>
          </div>
          <div className="rounded-lg bg-[#FDFCFF] p-4 xl:col-span-2">
            <p className="text-xs font-bold uppercase text-[#9CA3AF]">Important constraints</p>
            {constraints.length ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {constraints.map((constraint) => (
                  <span
                    key={`${constraint.constraint_type}-${constraint.label}`}
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      constraint.is_blocking ? "bg-[#FFF0F8] text-[#E8197A]" : "bg-[#F5F0FF] text-[#6B46C1]"
                    }`}
                  >
                    {constraint.label}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm font-semibold text-[#6B7280]">No important constraints saved yet.</p>
            )}
          </div>
          <div className="rounded-lg bg-[#FDFCFF] p-4">
            <p className="text-xs font-bold uppercase text-[#9CA3AF]">Profile completion</p>
            <p className="mt-2 text-base font-bold text-[#1A1033]">{readiness}% ready</p>
          </div>
        </div>
      </div>

      <aside className="rounded-lg border border-[#BAF3FF] bg-[#F0FDFF] p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#0891B2]">
            <ShieldCheck size={19} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#0891B2]">Setup state</p>
            <h3 className="mt-1 text-lg font-bold text-[#1A1033]">
              {summary.is_onboarding_complete ? "North Star complete" : "North Star needs detail"}
            </h3>
            <p className="mt-2 text-sm leading-6 text-[#6B7280]">
              {summary.is_onboarding_complete
                ? "Your goals and priorities are ready to support the Career GPS shell."
                : `Missing: ${summary.missing_sections.map((section) => section.replace(/_/g, " ")).join(", ") || "profile details"}.`}
            </p>
          </div>
        </div>
      </aside>
    </section>
  );
}

function NextBestAction({
  roadmap,
  action,
  isLoading,
  isUpdating,
  error,
  onUpdateStatus,
  onRequestAlternative,
}: {
  roadmap: CareerGpsRoadmap | null;
  action: CareerGpsNextBestActionDetail | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  onUpdateStatus: (action: CareerGpsNextBestActionDetail, status: CareerGpsProgressStatus) => Promise<void>;
  onRequestAlternative: () => Promise<void>;
}) {
  if (!roadmap) {
    return (
      <EmptyPanel
        icon={Flag}
        label="Next Best Action"
        title="Generate a roadmap to unlock the first action"
        description="The shell is ready, but no stored roadmap was found. This phase does not generate a new route."
      />
    );
  }

  if (isLoading) {
    return (
      <section className="rounded-lg border border-[#F0EBF8] bg-white p-5 shadow-[0_4px_24px_rgba(232,25,122,0.08)]">
        <SkeletonBlock className="h-6 w-44" />
        <SkeletonBlock className="mt-4 h-8 w-full max-w-xl" />
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <SkeletonBlock className="h-16" />
          <SkeletonBlock className="h-16" />
          <SkeletonBlock className="h-16" />
          <SkeletonBlock className="h-16" />
        </div>
      </section>
    );
  }

  if (!action) {
    return (
      <EmptyPanel
        icon={CheckCircle2}
        label="Next Best Action"
        title="No available next action"
        description={error ?? "All stored actions for this selected roadmap route are complete or skipped."}
      />
    );
  }

  const routeColor = routeHexColor[action.route_type];
  const disabled = isUpdating;

  return (
    <section className="overflow-hidden rounded-lg border border-[#BAF3FF] bg-white shadow-[0_8px_48px_rgba(6,182,212,0.12)]">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="p-5 lg:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-[#BAF3FF] bg-[#E0F9FF] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#0891B2]">
                <Flag size={14} />
                Your Next Best Action
              </p>
              <h2 className="mt-3 text-2xl font-bold leading-tight text-[#1A1033]">{action.action_title}</h2>
            </div>
            <span className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-bold ${progressStatusTone(action.status)}`}>
              {progressStatusLabel(action.status)}
            </span>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-[#FECACA] bg-[#FFF5F5] px-3 py-2 text-xs font-bold text-[#DC2626]">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <p className="mt-4 max-w-3xl text-sm leading-6 text-[#6B7280]">{action.why_it_matters}</p>

          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <ActionMetric icon={Clock3} label="Effort" value={action.estimated_effort} />
            <ActionMetric icon={CalendarCheck} label="Target date" value={formatActionDate(action.target_completion_date)} />
            <ActionMetric icon={Route} label="Related milestone" value={action.related_milestone} />
            <ActionMetric icon={Gauge} label="Skill gained" value={action.recommended_skill_gained} />
          </div>

          <div className="mt-5 rounded-lg border border-[#F0EBF8] bg-[#FDFCFF] p-4">
            <p className="text-xs font-bold uppercase text-[#9CA3AF]">Expected impact</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#1A1033]">{action.expected_impact}</p>
          </div>
        </div>

        <aside className="border-t border-[#F0EBF8] bg-[#F0FDFF] p-5 lg:border-l lg:border-t-0 lg:p-6">
          <div className="rounded-lg bg-white p-4">
            <p className="text-xs font-bold uppercase text-[#9CA3AF]">Route context</p>
            <p className="mt-1 text-sm font-bold" style={{ color: routeColor }}>
              {routeLabels[action.route_type]}
            </p>
            <p className="mt-3 text-xs font-semibold leading-5 text-[#6B7280]">{action.selection_reason}</p>
            {action.is_alternative && (
              <p className="mt-3 inline-flex rounded-full bg-[#F5F0FF] px-3 py-1 text-xs font-bold text-[#6B46C1]">
                Alternative option
              </p>
            )}
          </div>

          <div className="mt-4 grid gap-2">
            <button
              type="button"
              onClick={() => onUpdateStatus(action, "in_progress")}
              disabled={disabled || action.status === "in_progress"}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#1A1033] px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
              Start
            </button>
            <button
              type="button"
              onClick={() => onUpdateStatus(action, "completed")}
              disabled={disabled}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#A7F3D0] bg-[#ECFDF5] px-4 py-2.5 text-sm font-bold text-[#047857] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CheckCircle2 size={16} />
              Mark complete
            </button>
            <button
              type="button"
              onClick={() => onUpdateStatus(action, "skipped")}
              disabled={disabled}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#DDD0F8] bg-white px-4 py-2.5 text-sm font-bold text-[#6B46C1] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <SkipForward size={16} />
              Skip
            </button>
            <button
              type="button"
              onClick={onRequestAlternative}
              disabled={disabled}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#FFD0E8] bg-[#FFF8FC] px-4 py-2.5 text-sm font-bold text-[#E8197A] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={16} />
              Request alternative
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}

function ActionMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-[#F0EBF8] bg-white p-3">
      <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#9CA3AF]">
        <Icon size={14} />
        {label}
      </div>
      <p className="mt-2 text-sm font-bold leading-5 text-[#1A1033]">{value}</p>
    </div>
  );
}

function MetricBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-xs font-bold text-[#6B7280]">
        <span>{label}</span>
        <span className="text-[#1A1033]">{value}%</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-[#F0EBF8]">
        <div className="h-2 rounded-full bg-[#E8197A]" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}

function RouteComparisonRow({
  label,
  selected,
  recommended,
}: {
  label: string;
  selected: string;
  recommended: string;
}) {
  const changed = selected !== recommended;
  return (
    <div className="grid gap-2 rounded-lg border border-[#F0EBF8] bg-white p-3 md:grid-cols-[150px_minmax(0,1fr)_minmax(0,1fr)]">
      <p className="text-xs font-bold uppercase text-[#9CA3AF]">{label}</p>
      <p className={`text-sm font-bold leading-6 ${changed ? "text-[#E8197A]" : "text-[#1A1033]"}`}>{selected}</p>
      <p className="text-sm font-semibold leading-6 text-[#6B7280]">{recommended}</p>
    </div>
  );
}

function RouteCard({
  route,
  selected,
  isSaving,
  onSelect,
}: {
  route: CareerGpsRoute;
  selected: boolean;
  isSaving: boolean;
  onSelect: () => void;
}) {
  const tone = routeTone[route.route_type];
  const advantage = strongestComponent(route);
  const tradeoff = weakestComponent(route);
  const skillReadiness = metricValue(route, "skill_fit");
  const lifestyleFit = metricValue(route, "lifestyle_fit");
  const marketOpportunity = metricValue(route, "market_opportunity");

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={isSaving}
      aria-pressed={selected}
      className={`flex h-full min-h-[420px] flex-col rounded-lg border bg-white p-4 text-left shadow-[0_4px_24px_rgba(232,25,122,0.08)] transition disabled:cursor-wait disabled:opacity-75 ${
        selected ? `${tone.border} ring-2 ${tone.ring}` : "border-[#F0EBF8] hover:border-[#DDD0F8] hover:bg-[#FDFCFF]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${tone.bg} ${tone.accent} ${tone.border}`}>
          <Route size={14} />
          {routeLabels[route.route_type]}
        </span>
        {route.route_type === "recommended" && (
          <span className="rounded-full bg-[#1A1033] px-2.5 py-1 text-xs font-bold text-white">Recommended</span>
        )}
      </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-[#1A1033]">{route.target_occupation.title}</h3>
          <p className="mt-2 text-sm leading-6 text-[#6B7280]">{route.summary}</p>
        </div>
        {selected && <CheckCircle2 size={22} className="shrink-0 text-[#10B981]" aria-label="Selected route" />}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-[#FDFCFF] p-3">
          <p className="flex items-center gap-1 text-xs font-bold uppercase text-[#9CA3AF]">
            <Clock3 size={13} />
            Timeline
          </p>
          <p className="mt-1 text-sm font-bold text-[#1A1033]">{route.estimated_months} months</p>
        </div>
        <div className="rounded-lg bg-[#FDFCFF] p-3">
          <p className="text-xs font-bold uppercase text-[#9CA3AF]">Confidence</p>
          <p className="mt-1 text-sm font-bold text-[#1A1033]">{confidenceLevel(route.score)}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-xs font-semibold leading-5 text-[#6B7280]">
        <p>
          <span className="font-bold text-[#059669]">Main advantage:</span> {componentText(advantage)}
        </p>
        <p>
          <span className="font-bold text-[#DC2626]">Main trade-off:</span> {componentText(tradeoff)}
        </p>
      </div>

      <div className="mt-4 space-y-3">
        <MetricBar label="Skill readiness" value={skillReadiness} />
        <MetricBar label="Lifestyle fit" value={lifestyleFit} />
        <MetricBar label="Market opportunity" value={marketOpportunity} />
      </div>

      <div className="mt-auto pt-4">
        <span
          className={`inline-flex w-full items-center justify-center rounded-lg px-3 py-2 text-sm font-bold ${
            selected ? "bg-[#1A1033] text-white" : "bg-[#F8F5FC] text-[#6B46C1]"
          }`}
        >
          {selected ? "Active route" : "Select route"}
        </span>
      </div>
    </button>
  );
}

function RouteComparison({
  roadmap,
  activeRoute,
}: {
  roadmap: CareerGpsRoadmap;
  activeRoute: CareerGpsRoute;
}) {
  const recommended = roadmap.routes.find((route) => route.route_type === "recommended") ?? activeRoute;
  const activeAdvantage = strongestComponent(activeRoute);
  const activeTradeoff = weakestComponent(activeRoute);
  const recommendedAdvantage = strongestComponent(recommended);
  const recommendedTradeoff = weakestComponent(recommended);

  return (
    <div className="mt-5 rounded-lg border border-[#F0EBF8] bg-[#FDFCFF] p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#9CA3AF]">Route comparison</p>
          <h3 className="mt-1 text-xl font-bold text-[#1A1033]">
            {routeLabels[activeRoute.route_type]} vs Recommended Route
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B7280]">
            The active route changes the balance of timeline, preparation effort, lifestyle fit, and opportunity signals.
          </p>
        </div>
        <div className="rounded-lg bg-white px-4 py-3">
          <p className="text-xs font-bold uppercase text-[#9CA3AF]">Active route</p>
          <p className="mt-1 text-sm font-bold text-[#E8197A]">{routeLabels[activeRoute.route_type]}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        <div className="hidden rounded-lg px-3 text-xs font-bold uppercase tracking-wide text-[#9CA3AF] md:grid md:grid-cols-[150px_minmax(0,1fr)_minmax(0,1fr)]">
          <span>Signal</span>
          <span>Active route</span>
          <span>Recommended route</span>
        </div>
        <RouteComparisonRow
          label="Timeline"
          selected={`${activeRoute.estimated_months} months`}
          recommended={`${recommended.estimated_months} months`}
        />
        <RouteComparisonRow
          label="Advantage"
          selected={componentText(activeAdvantage)}
          recommended={componentText(recommendedAdvantage)}
        />
        <RouteComparisonRow
          label="Trade-off"
          selected={componentText(activeTradeoff)}
          recommended={componentText(recommendedTradeoff)}
        />
        <RouteComparisonRow
          label="Readiness"
          selected={`${metricValue(activeRoute, "skill_fit")}% skill readiness`}
          recommended={`${metricValue(recommended, "skill_fit")}% skill readiness`}
        />
        <RouteComparisonRow
          label="Lifestyle"
          selected={`${metricValue(activeRoute, "lifestyle_fit")}% lifestyle fit`}
          recommended={`${metricValue(recommended, "lifestyle_fit")}% lifestyle fit`}
        />
        <RouteComparisonRow
          label="Opportunity"
          selected={`${metricValue(activeRoute, "market_opportunity")}% market opportunity`}
          recommended={`${metricValue(recommended, "market_opportunity")}% market opportunity`}
        />
      </div>

      <div className="mt-4 rounded-lg border border-[#BAF3FF] bg-white p-4">
        <p className="text-xs font-bold uppercase text-[#0891B2]">Why this route is different</p>
        <p className="mt-2 text-sm font-semibold leading-6 text-[#1A1033]">{activeRoute.explanation}</p>
      </div>
    </div>
  );
}

function RouteSelectorShell({
  roadmap,
  selectedRouteType,
  isSavingSelectedRoute,
  routeSelectionError,
  onSelectRoute,
}: {
  roadmap: CareerGpsRoadmap | null;
  selectedRouteType: CareerGpsRouteType;
  isSavingSelectedRoute: boolean;
  routeSelectionError: string | null;
  onSelectRoute: (routeType: CareerGpsRouteType) => void;
}) {
  if (!roadmap) {
    return (
      <EmptyPanel
        icon={Route}
        label="Route selector"
        title="Route choices will appear here"
        description="Recommended, accelerated, and balanced routes will use stored backend route data once a roadmap exists."
      />
    );
  }

  const activeRoute = selectedRoute(roadmap, selectedRouteType) ?? roadmap.routes[0];

  if (!activeRoute) {
    return (
      <EmptyPanel
        icon={Route}
        label="Route selector"
        title="No routes are stored on this roadmap"
        description="Regenerate the roadmap from the existing dashboard roadmap panel when route generation is in scope."
      />
    );
  }

  return (
    <section className="rounded-lg border border-[#F0EBF8] bg-white p-5 shadow-[0_4px_24px_rgba(232,25,122,0.08)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-[#BAF3FF] bg-[#E0F9FF] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#0891B2]">
            <Route size={14} />
            Route selector
          </p>
          <h2 className="mt-3 text-2xl font-bold text-[#1A1033]">Choose a route view</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B7280]">
            Switching routes updates your active route only. It does not regenerate the deterministic roadmap.
          </p>
        </div>
        <div className="rounded-lg bg-[#FDFCFF] px-4 py-3">
          <p className="text-xs font-bold uppercase text-[#9CA3AF]">Roadmap version</p>
          <p className="mt-1 text-sm font-bold text-[#1A1033]">Version {roadmap.version}</p>
        </div>
      </div>

      {routeSelectionError && (
        <div className="mt-4">
          <AlertMessage>{routeSelectionError}</AlertMessage>
        </div>
      )}

      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        {roadmap.routes.map((route) => (
          <RouteCard
            key={route.route_type}
            route={route}
            selected={route.route_type === selectedRouteType}
            isSaving={isSavingSelectedRoute}
            onSelect={() => onSelectRoute(route.route_type)}
          />
        ))}
      </div>

      {activeRoute && <RouteComparison roadmap={roadmap} activeRoute={activeRoute} />}
    </section>
  );
}

function nodePositions(milestoneCount: number) {
  const milestoneSlots = Math.max(1, milestoneCount);
  const yPattern = [34, 58, 42, 65, 36, 55];
  return {
    start: { x: 11, y: 62 },
    milestones: Array.from({ length: milestoneCount }, (_, index) => ({
      x: 24 + ((index + 0.5) * 56) / milestoneSlots,
      y: yPattern[index % yPattern.length],
    })),
    destination: { x: 90, y: 42 },
  };
}

function buildJourneyNodes(route: CareerGpsRoute, progressByKey: ProgressEntriesByKey) {
  const positions = nodePositions(route.milestones.length);
  const readiness = readinessFromRoute(route);
  const activeProgressIndex = route.milestones.findIndex(
    (milestone) => progressByKey[progressKey(route.route_type, milestone.sequence)]?.status === "in_progress",
  );
  const firstIncompleteIndex = route.milestones.findIndex(
    (milestone) => progressByKey[progressKey(route.route_type, milestone.sequence)]?.status !== "completed",
  );
  const activeIndex = activeProgressIndex >= 0 ? activeProgressIndex : firstIncompleteIndex;
  const allMilestonesCompleted =
    route.milestones.length > 0 &&
    route.milestones.every(
      (milestone) => progressByKey[progressKey(route.route_type, milestone.sequence)]?.status === "completed",
    );
  const milestoneNodes: JourneyNode[] = route.milestones.map((milestone, index) => ({
    id: `${route.route_type}-milestone-${milestone.sequence}`,
    title: milestone.title,
    stage: `Milestone ${milestone.sequence}`,
    timing: milestoneTiming(milestone, route),
    readiness,
    status:
      progressByKey[progressKey(route.route_type, milestone.sequence)]?.status === "completed"
        ? "completed"
        : index === activeIndex
          ? "active"
          : "future",
    missingRequirement: missingRequirement(milestone, route),
    milestone,
    sequence: milestone.sequence,
    desktop: positions.milestones[index],
  }));

  return [
    {
      id: `${route.route_type}-start`,
      title: "Career GPS start",
      stage: "Starting point",
      timing: "Now",
      readiness: Math.round(route.score),
      status: "start",
      missingRequirement: route.skill_gaps[0]?.skill_name ?? "Target role evidence",
      milestone: null,
      sequence: 0,
      desktop: positions.start,
    },
    ...milestoneNodes,
    {
      id: `${route.route_type}-destination`,
      title: route.target_occupation.title,
      stage: route.target_occupation.seniority_level ?? "Destination",
      timing: `${route.estimated_months} months`,
      readiness: Math.round(route.score),
      status: allMilestonesCompleted || !route.milestones.length ? "active" : "destination",
      missingRequirement: route.skill_gaps[0]?.skill_name ?? "Role evidence",
      milestone: null,
      sequence: route.milestones.length + 1,
      desktop: positions.destination,
    },
  ] satisfies JourneyNode[];
}

function pathFromNodes(nodes: JourneyNode[]) {
  if (!nodes.length) return "";
  return nodes.slice(1).reduce((path, node, index) => {
    const previous = nodes[index];
    const midX = (previous.desktop.x + node.desktop.x) / 2;
    return `${path} C ${midX} ${previous.desktop.y}, ${midX} ${node.desktop.y}, ${node.desktop.x} ${node.desktop.y}`;
  }, `M ${nodes[0].desktop.x} ${nodes[0].desktop.y}`);
}

function nodeButtonStyles(node: JourneyNode, selected: boolean) {
  if (node.status === "start") return "border-[#BAF3FF] bg-[#E0F9FF] text-[#0891B2]";
  if (node.status === "completed") return "border-[#10B981] bg-[#10B981] text-white";
  if (node.status === "active") return selected ? "border-[#E8197A] bg-[#E8197A] text-white" : "border-[#E8197A] bg-white text-[#E8197A]";
  if (node.status === "locked") return "border-[#E2D9F3] bg-[#F8F5FC] text-[#9CA3AF]";
  if (node.status === "destination") return "border-[#1A1033] bg-[#1A1033] text-white";
  return selected ? "border-[#6B46C1] bg-[#F5F0FF] text-[#6B46C1]" : "border-[#DDD0F8] bg-white text-[#6B46C1]";
}

function JourneyCurrentMarker({
  riasecResult,
  employeeName,
  routeColor,
}: {
  riasecResult: RiasecResult | null;
  employeeName: string;
  routeColor: string;
}) {
  const label = riasecResult
    ? `${riasecResult.animalName} / ${riasecResult.hollandCode} / ${riasecResult.label}`
    : `${employeeName || "Employee"} current position`;

  return (
    <div
      className="absolute -right-3 -top-4 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-white text-base font-bold text-[#1A1033]"
      style={{ boxShadow: `0 0 0 4px ${routeColor}33, 0 8px 22px rgba(26,16,51,0.18)` }}
      title={label}
      aria-label={label}
    >
      {riasecResult?.animal ? riasecResult.animal : <MapPin size={17} aria-hidden="true" />}
    </div>
  );
}

function JourneyMilestoneButton({
  node,
  selected,
  active,
  riasecResult,
  employeeName,
  routeColor,
  onSelect,
}: {
  node: JourneyNode;
  selected: boolean;
  active: boolean;
  riasecResult: RiasecResult | null;
  employeeName: string;
  routeColor: string;
  onSelect: () => void;
}) {
  const locked = node.status === "locked";
  const Icon = node.status === "destination" ? Target : node.status === "start" ? BriefcaseBusiness : locked ? Lock : null;

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={locked}
      aria-pressed={selected}
      aria-label={`${node.title}, ${node.stage}, ${node.timing}, readiness ${node.readiness}%, ${statusLabel(node.status)}, missing requirement ${node.missingRequirement}`}
      className="group absolute z-10 flex w-[150px] -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-lg px-2 py-1 text-center outline-none transition focus-visible:ring-2 focus-visible:ring-[#E8197A] disabled:cursor-not-allowed"
      style={{ left: `${node.desktop.x}%`, top: `${node.desktop.y}%` }}
    >
      <span
        className={`relative flex h-12 w-12 items-center justify-center rounded-full border-4 text-sm font-black shadow-sm transition group-hover:scale-105 ${nodeButtonStyles(
          node,
          selected,
        )} ${selected ? "ring-4 ring-[#E8197A]/20" : ""}`}
      >
        {Icon ? <Icon size={18} /> : node.status === "completed" ? <CheckCircle2 size={18} /> : node.sequence}
        {active && (
          <JourneyCurrentMarker
            riasecResult={riasecResult}
            employeeName={employeeName}
            routeColor={routeColor}
          />
        )}
      </span>
      <span className="mt-2 line-clamp-2 min-h-9 text-xs font-bold leading-[18px] text-[#1A1033]">{node.title}</span>
      <span className="text-[11px] font-bold uppercase text-[#9CA3AF]">{node.timing}</span>
    </button>
  );
}

function DetailBlock({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-lg bg-[#FDFCFF] p-3">
      <p className="text-xs font-bold uppercase text-[#9CA3AF]">{label}</p>
      <div className="mt-1 text-sm font-bold leading-5 text-[#1A1033]">{value}</div>
    </div>
  );
}

function ChipList({ items, emptyLabel }: { items: string[]; emptyLabel: string }) {
  if (!items.length) return <span className="text-[#6B7280]">{emptyLabel}</span>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-[#6B46C1]">
          {item}
        </span>
      ))}
    </div>
  );
}

function ActionProgressEditor({
  action,
  progress,
  routeType,
  milestoneSequence,
  isSaving,
  onSaveProgress,
}: {
  action: CareerGpsMilestone["actions"][number];
  progress: CareerGpsProgressEntry | null;
  routeType: CareerGpsRouteType;
  milestoneSequence: number;
  isSaving: boolean;
  onSaveProgress: SaveProgressHandler;
}) {
  const [notes, setNotes] = useState(progress?.notes ?? "");
  const [evidenceUrl, setEvidenceUrl] = useState(progress?.evidence_url ?? "");
  const [completedAt, setCompletedAt] = useState(progress?.completed_at?.slice(0, 10) ?? "");

  useEffect(() => {
    setNotes(progress?.notes ?? "");
    setEvidenceUrl(progress?.evidence_url ?? "");
    setCompletedAt(progress?.completed_at?.slice(0, 10) ?? "");
  }, [progress?.id, progress?.notes, progress?.evidence_url, progress?.completed_at]);

  const save = (statusValue: CareerGpsProgressStatus) =>
    onSaveProgress("action", {
      route_type: routeType,
      milestone_sequence: milestoneSequence,
      action_sequence: action.sequence,
      status: statusValue,
      notes,
      evidence_url: evidenceUrl,
      completed_at: statusValue === "completed" ? completedAt || todayIsoDate() : null,
    });

  return (
    <div className="rounded-lg border border-[#F0EBF8] bg-white p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-[#9CA3AF]">{action.action_type}</p>
          <h4 className="mt-1 text-sm font-bold leading-5 text-[#1A1033]">{action.title}</h4>
          {action.description && <p className="mt-1 text-xs font-semibold leading-5 text-[#6B7280]">{action.description}</p>}
        </div>
        <span className="rounded-full bg-[#F5F0FF] px-2.5 py-1 text-xs font-bold text-[#6B46C1]">
          {progressStatusLabel(progress?.status)}
        </span>
      </div>

      <div className="mt-3 grid gap-2">
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={2}
          maxLength={600}
          placeholder="Short progress note"
          className="w-full rounded-lg border border-[#E2D9F3] px-3 py-2 text-sm font-semibold text-[#1A1033] outline-none placeholder:text-[#9CA3AF] focus:border-[#E8197A]"
        />
        <input
          value={evidenceUrl}
          onChange={(event) => setEvidenceUrl(event.target.value)}
          placeholder="Evidence URL or internal proof link"
          className="min-h-10 rounded-lg border border-[#E2D9F3] px-3 text-sm font-semibold text-[#1A1033] outline-none placeholder:text-[#9CA3AF] focus:border-[#E8197A]"
        />
        <label className="grid gap-1 text-xs font-bold uppercase text-[#9CA3AF]">
          Completion date
          <input
            type="date"
            value={completedAt}
            onChange={(event) => setCompletedAt(event.target.value)}
            className="min-h-10 rounded-lg border border-[#E2D9F3] px-3 text-sm font-semibold normal-case text-[#1A1033] outline-none focus:border-[#E8197A]"
          />
        </label>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-4">
        {(["not_started", "in_progress", "completed"] as CareerGpsProgressStatus[]).map((statusValue) => (
          <button
            key={statusValue}
            type="button"
            onClick={() => save(statusValue)}
            disabled={isSaving}
            className={`rounded-lg border px-2 py-2 text-xs font-bold transition disabled:cursor-wait disabled:opacity-60 ${
              progress?.status === statusValue
                ? "border-[#E8197A] bg-[#FFF0F8] text-[#E8197A]"
                : "border-[#DDD0F8] bg-white text-[#6B46C1] hover:border-[#E8197A]"
            }`}
          >
            {progressStatusLabel(statusValue)}
          </button>
        ))}
        <button
          type="button"
          onClick={() => save(progress?.status ?? "not_started")}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-1 rounded-lg bg-[#1A1033] px-2 py-2 text-xs font-bold text-white disabled:cursor-wait disabled:opacity-60"
        >
          {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          Save
        </button>
      </div>
    </div>
  );
}

function JourneyDetailPanel({
  node,
  route,
  roadmap,
  progressByKey,
  milestoneDetail,
  isDetailLoading,
  detailError,
  isSavingProgress,
  progressError,
  onSaveProgress,
}: {
  node: JourneyNode;
  route: CareerGpsRoute;
  roadmap: CareerGpsRoadmap;
  progressByKey: ProgressEntriesByKey;
  milestoneDetail: CareerGpsMilestoneDetail | null;
  isDetailLoading: boolean;
  detailError: string | null;
  isSavingProgress: boolean;
  progressError: string | null;
  onSaveProgress: SaveProgressHandler;
}) {
  const milestone = node.milestone;
  const routeRoles = roadmap.routes.map((item) => item.target_occupation.title);
  const requiredSkills = milestoneDetail?.required_skills ?? route.skill_gaps.map((gap) => gap.skill_name);
  const existingSkills = milestoneDetail?.existing_skills ?? [];
  const missingSkills = milestoneDetail?.missing_skills ?? route.skill_gaps.map((gap) => gap.skill_name);
  const milestoneProgress = milestone
    ? progressByKey[progressKey(route.route_type, milestone.sequence)] ?? null
    : null;
  const actionProgressEntries = milestone?.actions.map((action) => progressByKey[progressKey(route.route_type, milestone.sequence, action.sequence)] ?? null) ?? [];
  const canCompleteMilestone =
    !!milestone &&
    milestone.actions.length > 0 &&
    actionProgressEntries.every((entry) => entry?.status === "completed");

  const saveMilestone = (statusValue: CareerGpsProgressStatus) => {
    if (!milestone) return Promise.resolve();
    return onSaveProgress("milestone", {
      route_type: route.route_type,
      milestone_sequence: milestone.sequence,
      action_sequence: null,
      status: statusValue,
      notes: milestoneProgress?.notes ?? null,
      evidence_url: milestoneProgress?.evidence_url ?? null,
      completed_at: statusValue === "completed" ? milestoneProgress?.completed_at?.slice(0, 10) ?? todayIsoDate() : null,
    });
  };

  return (
    <aside className="rounded-lg border border-[#F0EBF8] bg-white p-4 shadow-[0_4px_24px_rgba(232,25,122,0.08)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-[#BAF3FF] bg-[#E0F9FF] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#0891B2]">
            <Map size={14} />
            Milestone details
          </p>
          <h3 className="mt-3 text-xl font-bold text-[#1A1033]">{node.title}</h3>
          {isDetailLoading && (
            <p className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-[#6B7280]">
              <Loader2 size={13} className="animate-spin text-[#E8197A]" />
              Loading detail...
            </p>
          )}
        </div>
        <span className="rounded-lg bg-[#FDFCFF] px-3 py-2 text-xs font-bold text-[#6B46C1]">
          {milestone ? progressStatusLabel(milestoneProgress?.status) : statusLabel(node.status)}
        </span>
      </div>

      {(detailError || progressError) && (
        <div className="mt-3 rounded-lg border border-[#FECACA] bg-[#FFF5F5] px-3 py-2 text-xs font-bold leading-5 text-[#DC2626]">
          {detailError ?? progressError}
        </div>
      )}

      <p className="mt-3 text-sm font-semibold leading-6 text-[#6B7280]">
        {milestoneDetail?.why_recommended ?? milestone?.description ?? route.summary}
      </p>

      <div className="mt-4 grid gap-3">
        <DetailBlock label="Estimated timeline" value={milestoneDetail?.estimated_timeline ?? node.timing} />
        <DetailBlock label="Required skills" value={<ChipList items={requiredSkills} emptyLabel="No required skills stored." />} />
        <DetailBlock label="Existing skills" value={<ChipList items={existingSkills} emptyLabel="No existing skills stored on profile." />} />
        <DetailBlock label="Missing skills" value={<ChipList items={missingSkills} emptyLabel="No major missing skill stored." />} />
        <DetailBlock
          label="Recommended certification"
          value={milestoneDetail?.recommended_certification ?? "No mandatory certification is stored for this route."}
        />
        <DetailBlock
          label="Recommended experience"
          value={milestoneDetail?.recommended_experience ?? `Complete one applied ${route.target_occupation.family} work sample.`}
        />
        <DetailBlock
          label="Suggested project"
          value={milestoneDetail?.suggested_project ?? milestone?.actions.find((action) => action.action_type === "project")?.title ?? "No project action stored for this milestone."}
        />
        <DetailBlock label="Relevant target roles" value={<ChipList items={milestoneDetail?.relevant_target_roles ?? routeRoles} emptyLabel="No target roles stored." />} />
        <DetailBlock label="Transition difficulty" value={milestoneDetail?.transition_difficulty ?? componentText(component(route, "transition_difficulty") ?? null)} />
        <DetailBlock
          label="Lifestyle impact"
          value={milestoneDetail?.lifestyle_impact ?? `${componentText(component(route, "lifestyle_fit") ?? null)} / ${componentText(component(route, "work_life_balance_fit") ?? null)}`}
        />
        <DetailBlock label="Confidence level" value={milestoneDetail?.confidence_level ?? confidenceLevel(route.score)} />
        <DetailBlock
          label="Main assumptions"
          value={
            <ul className="list-disc space-y-1 pl-4">
              {(milestoneDetail?.main_assumptions ?? [
                "Scores are deterministic planning scores from saved profile, route, and illustrative occupation data.",
                "No salary data is shown because no validated salary source is attached to this roadmap.",
              ]).map((assumption) => (
                <li key={assumption}>{assumption}</li>
              ))}
            </ul>
          }
        />
      </div>

      {milestone ? (
        <div className="mt-4 rounded-lg border border-[#BAF3FF] bg-[#F0FDFF] p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-bold uppercase text-[#087C7E]">
                <ListChecks size={14} />
                Immediate actions
              </p>
              <p className="mt-1 text-xs font-semibold leading-5 text-[#087C7E]">
                Complete all actions before marking the milestone complete.
              </p>
            </div>
            <button
              type="button"
              onClick={() => saveMilestone("completed")}
              disabled={!canCompleteMilestone || isSavingProgress}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#10B981] px-3 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSavingProgress ? <Loader2 size={14} className="animate-spin" /> : <CalendarCheck size={14} />}
              Mark milestone complete
            </button>
          </div>

          <div className="mt-3 grid gap-3">
            {milestone.actions.map((action) => (
              <ActionProgressEditor
                key={action.sequence}
                action={action}
                progress={progressByKey[progressKey(route.route_type, milestone.sequence, action.sequence)] ?? null}
                routeType={route.route_type}
                milestoneSequence={milestone.sequence}
                isSaving={isSavingProgress}
                onSaveProgress={onSaveProgress}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-[#F0EBF8] bg-[#FDFCFF] p-3 text-sm font-semibold leading-6 text-[#6B7280]">
          <FileText size={16} className="mb-2 text-[#6B46C1]" />
          Select a milestone station to update action progress and evidence.
        </div>
      )}
    </aside>
  );
}

function JourneyLegend() {
  const items: { label: string; status: JourneyNodeStatus }[] = [
    { label: "Start", status: "start" },
    { label: "Active", status: "active" },
    { label: "Future", status: "future" },
    { label: "Locked", status: "locked" },
    { label: "Destination", status: "destination" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-2 rounded-full border border-[#F0EBF8] bg-white px-3 py-1 text-xs font-bold text-[#6B7280]">
          <span className={`h-3 w-3 rounded-full border ${nodeButtonStyles({ status: item.status } as JourneyNode, false)}`} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

function MobileJourneyPath({
  nodes,
  selectedNode,
  activeNodeId,
  riasecResult,
  employeeName,
  routeColor,
  onSelectNode,
}: {
  nodes: JourneyNode[];
  selectedNode: JourneyNode;
  activeNodeId: string;
  riasecResult: RiasecResult | null;
  employeeName: string;
  routeColor: string;
  onSelectNode: (node: JourneyNode) => void;
}) {
  return (
    <div className="mt-5 lg:hidden">
      <div className="relative space-y-3 before:absolute before:bottom-8 before:left-6 before:top-8 before:w-1 before:rounded-full before:bg-[#E2D9F3]">
        {nodes.map((node) => {
          const selected = selectedNode.id === node.id;
          const active = activeNodeId === node.id;
          const locked = node.status === "locked";
          return (
            <button
              key={node.id}
              type="button"
              onClick={() => onSelectNode(node)}
              disabled={locked}
              aria-pressed={selected}
              className={`relative z-10 grid w-full grid-cols-[52px_minmax(0,1fr)] gap-3 rounded-lg border bg-white p-3 text-left shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-[#E8197A] ${
                selected ? "border-[#E8197A] ring-2 ring-[#E8197A]/15" : "border-[#F0EBF8]"
              }`}
            >
              <span className={`relative flex h-12 w-12 items-center justify-center rounded-full border-4 text-sm font-black ${nodeButtonStyles(node, selected)}`}>
                {node.status === "destination" ? <Target size={17} /> : node.status === "start" ? <BriefcaseBusiness size={17} /> : node.sequence}
                {active && <JourneyCurrentMarker riasecResult={riasecResult} employeeName={employeeName} routeColor={routeColor} />}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold text-[#1A1033]">{node.title}</span>
                <span className="mt-1 block text-xs font-semibold text-[#6B7280]">
                  {node.stage} / {node.timing} / {node.readiness}% ready
                </span>
                <span className="mt-1 block text-xs font-bold text-[#E8197A]">{statusLabel(node.status)}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CareerJourneyMap({
  roadmap,
  activeRoute,
  riasecResult,
  employeeName,
  progressEntries,
  isSavingProgress,
  progressError,
  onSaveProgress,
}: {
  roadmap: CareerGpsRoadmap | null;
  activeRoute: CareerGpsRoute | null;
  riasecResult: RiasecResult | null;
  employeeName: string;
  progressEntries: CareerGpsProgressEntry[];
  isSavingProgress: boolean;
  progressError: string | null;
  onSaveProgress: SaveProgressHandler;
}) {
  const progressByKey = useMemo(() => progressEntriesByKey(progressEntries), [progressEntries]);
  const nodes = useMemo(() => (activeRoute ? buildJourneyNodes(activeRoute, progressByKey) : []), [activeRoute, progressByKey]);
  const activeNode = nodes.find((node) => node.status === "active") ?? nodes.find((node) => node.status === "destination") ?? nodes[0];
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [milestoneDetail, setMilestoneDetail] = useState<CareerGpsMilestoneDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedNodeId(activeNode?.id ?? null);
  }, [activeNode?.id, activeRoute?.route_type]);

  const selectedNode = nodes.find((node) => node.id === selectedNodeId) ?? activeNode;

  useEffect(() => {
    if (!roadmap || !activeRoute || !selectedNode?.milestone) {
      setMilestoneDetail(null);
      setDetailError(null);
      setIsDetailLoading(false);
      return;
    }
    let cancelled = false;
    setIsDetailLoading(true);
    setDetailError(null);
    getJson<CareerGpsMilestoneDetail>(
      `/career-gps/roadmaps/${roadmap.roadmap_id}/milestones/${activeRoute.route_type}/${selectedNode.milestone.sequence}`,
      { auth: true },
    )
      .then((detail) => {
        if (!cancelled) setMilestoneDetail(detail);
      })
      .catch((detailLoadError) => {
        if (!cancelled) {
          setMilestoneDetail(null);
          setDetailError(detailLoadError instanceof Error ? detailLoadError.message : "Unable to load milestone detail.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsDetailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [roadmap, activeRoute, selectedNode?.id, selectedNode?.milestone]);

  if (!roadmap || !activeRoute || !nodes.length || !activeNode) {
    return (
      <EmptyPanel
        icon={Map}
        label="Journey map"
        title="Generate a roadmap to see the journey map"
        description="The visual journey needs a stored route and milestones. This phase does not generate a new roadmap."
      />
    );
  }

  const routeColor = routeHexColor[activeRoute.route_type];
  const fullPath = pathFromNodes(nodes);
  const activeIndex = Math.max(0, nodes.findIndex((node) => node.id === activeNode.id));
  const activePath = pathFromNodes(nodes.slice(0, activeIndex + 1));
  const branchRoutes = roadmap.routes.filter((route) => route.route_type !== activeRoute.route_type);

  return (
    <section className="rounded-lg border border-[#F0EBF8] bg-white p-5 shadow-[0_4px_24px_rgba(232,25,122,0.08)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-[#FFD0E8] bg-[#FFF0F8] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#E8197A]">
            <Map size={14} />
            Journey map
          </p>
          <h2 className="mt-3 text-2xl font-bold text-[#1A1033]">{activeRoute.title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B7280]">
            A metro-style career route using stored milestones from the selected roadmap. Route branches show alternative views, not regenerated recommendations.
          </p>
        </div>
        <div className="rounded-lg bg-[#FDFCFF] px-4 py-3">
          <p className="text-xs font-bold uppercase text-[#9CA3AF]">Active route</p>
          <p className="mt-1 text-sm font-bold" style={{ color: routeColor }}>
            {routeLabels[activeRoute.route_type]}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          <div className="hidden lg:block">
            <div className="relative min-h-[560px] overflow-hidden rounded-lg border border-[#F0EBF8] bg-[#FDFCFF]">
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(226,217,243,0.32)_1px,transparent_1px),linear-gradient(0deg,rgba(226,217,243,0.32)_1px,transparent_1px)] bg-[size:44px_44px]" />
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <path d={fullPath} fill="none" stroke="#E2D9F3" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="3 3" />
                {activePath && (
                  <path d={activePath} fill="none" stroke={routeColor} strokeWidth="1.5" strokeLinecap="round" />
                )}
                {branchRoutes.map((route, index) => {
                  const branchY = index === 0 ? 20 : 82;
                  const start = nodes[Math.min(1, nodes.length - 1)] ?? nodes[0];
                  return (
                    <path
                      key={route.route_type}
                      d={`M ${start.desktop.x} ${start.desktop.y} C 45 ${branchY}, 68 ${branchY}, 84 ${branchY}`}
                      fill="none"
                      stroke={routeHexColor[route.route_type]}
                      strokeWidth="0.75"
                      strokeLinecap="round"
                      strokeDasharray="2 2"
                      opacity="0.55"
                    />
                  );
                })}
              </svg>
              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                {branchRoutes.map((route) => (
                  <span
                    key={route.route_type}
                    className="inline-flex items-center gap-2 rounded-full border border-[#DDD0F8] bg-white px-3 py-1 text-xs font-bold text-[#6B7280]"
                  >
                    <GitBranch size={13} style={{ color: routeHexColor[route.route_type] }} />
                    {routeLabels[route.route_type]}
                  </span>
                ))}
              </div>
              {nodes.map((node) => (
                <JourneyMilestoneButton
                  key={node.id}
                  node={node}
                  selected={selectedNode.id === node.id}
                  active={activeNode.id === node.id}
                  riasecResult={riasecResult}
                  employeeName={employeeName}
                  routeColor={routeColor}
                  onSelect={() => setSelectedNodeId(node.id)}
                />
              ))}
            </div>
          </div>

          <MobileJourneyPath
            nodes={nodes}
            selectedNode={selectedNode}
            activeNodeId={activeNode.id}
            riasecResult={riasecResult}
            employeeName={employeeName}
            routeColor={routeColor}
            onSelectNode={(node) => setSelectedNodeId(node.id)}
          />

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <JourneyLegend />
            <p className="text-xs font-semibold leading-5 text-[#9CA3AF]">
              Locked stops are supported visually but not assigned without explicit roadmap lock data.
            </p>
          </div>
        </div>

        <div className="hidden xl:block">
          <JourneyDetailPanel
            node={selectedNode}
            route={activeRoute}
            roadmap={roadmap}
            progressByKey={progressByKey}
            milestoneDetail={milestoneDetail}
            isDetailLoading={isDetailLoading}
            detailError={detailError}
            isSavingProgress={isSavingProgress}
            progressError={progressError}
            onSaveProgress={onSaveProgress}
          />
        </div>
      </div>

      <div className="mt-5 xl:hidden">
        <JourneyDetailPanel
          node={selectedNode}
          route={activeRoute}
          roadmap={roadmap}
          progressByKey={progressByKey}
          milestoneDetail={milestoneDetail}
          isDetailLoading={isDetailLoading}
          detailError={detailError}
          isSavingProgress={isSavingProgress}
          progressError={progressError}
          onSaveProgress={onSaveProgress}
        />
      </div>
    </section>
  );
}

export default function CareerGpsPageShell() {
  const [state, setState] = useState<ShellState>({ profile: null, roadmap: null });
  const [selectedRouteType, setSelectedRouteType] = useState<CareerGpsRouteType>("recommended");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSavingSelectedRoute, setIsSavingSelectedRoute] = useState(false);
  const [routeSelectionError, setRouteSelectionError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [riasecResult, setRiasecResult] = useState<RiasecResult | null>(null);
  const [progressEntries, setProgressEntries] = useState<CareerGpsProgressEntry[]>([]);
  const [progressError, setProgressError] = useState<string | null>(null);
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const [nextBestAction, setNextBestAction] = useState<CareerGpsNextBestActionDetail | null>(null);
  const [nextBestActionError, setNextBestActionError] = useState<string | null>(null);
  const [isNextBestActionLoading, setIsNextBestActionLoading] = useState(false);
  const [isUpdatingNextBestAction, setIsUpdatingNextBestAction] = useState(false);

  const loadProgress = useCallback(async (roadmapId: number) => {
    try {
      const progress = await getJson<CareerGpsProgressResponse>(
        `/career-gps/roadmaps/${roadmapId}/progress`,
        { auth: true },
      );
      setProgressEntries(progress.entries);
      setProgressError(null);
    } catch (progressLoadError) {
      setProgressEntries([]);
      setProgressError(
        progressLoadError instanceof Error ? progressLoadError.message : "Unable to load roadmap progress.",
      );
    }
  }, []);

  const loadNextBestAction = useCallback(async (roadmapId: number) => {
    setIsNextBestActionLoading(true);
    setNextBestActionError(null);
    try {
      const action = await getJson<CareerGpsNextBestActionDetail>(
        `/career-gps/roadmaps/${roadmapId}/next-best-action`,
        { auth: true },
      );
      setNextBestAction(action);
    } catch (actionLoadError) {
      setNextBestAction(null);
      setNextBestActionError(
        actionLoadError instanceof Error ? actionLoadError.message : "Unable to load your next best action.",
      );
    } finally {
      setIsNextBestActionLoading(false);
    }
  }, []);

  const loadShell = useCallback(async (refreshing = false) => {
    if (!getAuthToken()) {
      setIsLoading(false);
      setError("Sign in as an employee to view your Career GPS.");
      return;
    }

    if (refreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const profile = await getJson<CareerGpsProfile>("/career-gps/profile", { auth: true });
      let roadmap: CareerGpsRoadmap | null = null;
      try {
        roadmap = await getJson<CareerGpsRoadmap>("/career-gps/roadmaps/latest", { auth: true });
      } catch {
        roadmap = null;
      }
      if (roadmap) {
        await Promise.all([loadProgress(roadmap.roadmap_id), loadNextBestAction(roadmap.roadmap_id)]);
      } else {
        setProgressEntries([]);
        setProgressError(null);
        setNextBestAction(null);
        setNextBestActionError(null);
        setIsNextBestActionLoading(false);
      }
      setState({ profile, roadmap });
      setSelectedRouteType(roadmap?.selected_route_type ?? "recommended");
      setRouteSelectionError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load Career GPS.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [loadNextBestAction, loadProgress]);

  useEffect(() => {
    loadShell();
  }, [loadShell]);

  useEffect(() => {
    setRiasecResult(loadRiasecResult());
  }, []);

  const profileName = state.profile?.employee.full_name ?? "Employee";
  const profileInitials = useMemo(() => initialsFromName(profileName), [profileName]);
  const activeRoute = useMemo(
    () => selectedRoute(state.roadmap, selectedRouteType),
    [state.roadmap, selectedRouteType],
  );

  const handleSelectRoute = async (routeType: CareerGpsRouteType) => {
    if (!state.roadmap || routeType === selectedRouteType || isSavingSelectedRoute) return;
    const previousRouteType = selectedRouteType;
    const previousRoadmap = state.roadmap;
    setSelectedRouteType(routeType);
    setState((current) => ({
      ...current,
      roadmap: current.roadmap ? { ...current.roadmap, selected_route_type: routeType } : current.roadmap,
    }));
    setIsSavingSelectedRoute(true);
    setRouteSelectionError(null);
    try {
      const updatedRoadmap = await putJson<CareerGpsRoadmap, CareerGpsSelectedRoutePayload>(
        `/career-gps/roadmaps/${state.roadmap.roadmap_id}/selected-route`,
        { selected_route_type: routeType },
        { auth: true },
      );
      setState((current) => ({ ...current, roadmap: updatedRoadmap }));
      setSelectedRouteType(updatedRoadmap.selected_route_type);
      await loadNextBestAction(updatedRoadmap.roadmap_id);
    } catch (selectionError) {
      setSelectedRouteType(previousRouteType);
      setState((current) => ({ ...current, roadmap: previousRoadmap }));
      setRouteSelectionError(
        selectionError instanceof Error ? selectionError.message : "Unable to save the selected route.",
      );
    } finally {
      setIsSavingSelectedRoute(false);
    }
  };

  const handleNextBestActionStatus = async (
    action: CareerGpsNextBestActionDetail,
    statusValue: CareerGpsProgressStatus,
  ) => {
    if (!state.roadmap || isUpdatingNextBestAction) return;
    setIsUpdatingNextBestAction(true);
    setNextBestActionError(null);
    try {
      const updatedAction = await putJson<CareerGpsNextBestActionDetail, CareerGpsNextBestActionStatusPayload>(
        `/career-gps/roadmaps/${state.roadmap.roadmap_id}/next-best-action/status`,
        {
          route_type: action.route_type,
          milestone_sequence: action.milestone_sequence,
          action_sequence: action.action_sequence,
          status: statusValue,
        },
        { auth: true },
      );
      setNextBestAction(updatedAction);
      await loadProgress(state.roadmap.roadmap_id);
    } catch (updateError) {
      setNextBestActionError(
        updateError instanceof Error ? updateError.message : "Unable to update your next best action.",
      );
      await loadProgress(state.roadmap.roadmap_id);
    } finally {
      setIsUpdatingNextBestAction(false);
    }
  };

  const handleRequestAlternativeAction = async () => {
    if (!state.roadmap || isUpdatingNextBestAction) return;
    setIsUpdatingNextBestAction(true);
    setNextBestActionError(null);
    try {
      const alternative = await postJson<CareerGpsNextBestActionDetail, Record<string, never>>(
        `/career-gps/roadmaps/${state.roadmap.roadmap_id}/next-best-action/alternative`,
        {},
        { auth: true },
      );
      setNextBestAction(alternative);
    } catch (alternativeError) {
      setNextBestActionError(
        alternativeError instanceof Error ? alternativeError.message : "Unable to find an alternative action.",
      );
    } finally {
      setIsUpdatingNextBestAction(false);
    }
  };

  const handleSaveProgress: SaveProgressHandler = async (kind, payload) => {
    if (!state.roadmap || isSavingProgress) return;
    setIsSavingProgress(true);
    setProgressError(null);
    try {
      const updated = await putJson<CareerGpsProgressEntry, CareerGpsProgressUpdatePayload>(
        `/career-gps/roadmaps/${state.roadmap.roadmap_id}/progress/${kind === "action" ? "actions" : "milestones"}`,
        payload,
        { auth: true },
      );
      setProgressEntries((current) => {
        const key = progressKey(updated.route_type, updated.milestone_sequence, updated.action_sequence);
        const filtered = current.filter(
          (entry) => progressKey(entry.route_type, entry.milestone_sequence, entry.action_sequence) !== key,
        );
        return [...filtered, updated];
      });
    } catch (saveError) {
      setProgressError(saveError instanceof Error ? saveError.message : "Unable to save roadmap progress.");
    } finally {
      setIsSavingProgress(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FDFCFF] text-[#1A1033]">
      <header className="border-b border-[#F0EBF8] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-[#E8197A]">
              Simploy
            </Link>
            <HeaderNav active />
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-[#DDD0F8] bg-white px-4 py-2 text-sm font-semibold text-[#6B46C1] shadow-sm"
            >
              <Building2 size={16} />
              Switch Portal
            </Link>
            <ProfileMenu role="employee" initials={profileInitials} name={profileName} label="Open employee profile menu" />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {isLoading ? (
          <LoadingShell />
        ) : error ? (
          <div className="space-y-4">
            <AlertMessage>{error}</AlertMessage>
            <Link
              href={routes.login}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1A1033] px-4 py-2.5 text-sm font-bold text-white"
            >
              Go to login
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : state.profile ? (
          <>
            <CareerGpsHeader
              profile={state.profile}
              roadmap={state.roadmap}
              isRefreshing={isRefreshing}
              onRefresh={() => loadShell(true)}
            />
            <NorthStarSummary profile={state.profile} />
            <NextBestAction
              roadmap={state.roadmap}
              action={nextBestAction}
              isLoading={isNextBestActionLoading}
              isUpdating={isUpdatingNextBestAction}
              error={nextBestActionError}
              onUpdateStatus={handleNextBestActionStatus}
              onRequestAlternative={handleRequestAlternativeAction}
            />
            <RouteSelectorShell
              roadmap={state.roadmap}
              selectedRouteType={selectedRouteType}
              isSavingSelectedRoute={isSavingSelectedRoute}
              routeSelectionError={routeSelectionError}
              onSelectRoute={handleSelectRoute}
            />
            <CareerJourneyMap
              roadmap={state.roadmap}
              activeRoute={activeRoute}
              riasecResult={riasecResult}
              employeeName={profileName}
              progressEntries={progressEntries}
              isSavingProgress={isSavingProgress}
              progressError={progressError}
              onSaveProgress={handleSaveProgress}
            />
            <section className="grid gap-4 lg:grid-cols-3">
              <EmptyPanel
                icon={Gauge}
                label="Skills and readiness"
                title="Readiness detail will connect to the map"
                description="Skill gaps and readiness meters will be placed here after the journey map shell is approved."
              />
              <EmptyPanel
                icon={SlidersHorizontal}
                label="What-if simulator"
                title="Scenario controls are parked for now"
                description="The existing what-if APIs remain available, but this shell does not run scenario previews yet."
              />
              <EmptyPanel
                icon={Bot}
                label="Career Buddy"
                title="Contextual coaching will return here"
                description="Career Buddy stays backend-powered. This phase only reserves a polished location for it."
              />
            </section>
            <section className="rounded-lg border border-[#BAF3FF] bg-[#F0FDFF] p-4 text-sm font-semibold leading-6 text-[#087C7E]">
              <div className="flex items-start gap-2">
                <Sparkles size={17} className="mt-0.5 shrink-0" />
                <p>
                  {state.roadmap?.source_note ??
                    "Career GPS shell loaded from saved profile data. Route generation is intentionally outside this phase."}
                </p>
              </div>
            </section>
          </>
        ) : (
          <AlertMessage>Career GPS profile was not available.</AlertMessage>
        )}
      </section>
    </main>
  );
}
