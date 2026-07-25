"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  Flag,
  Loader2,
  Map,
  PlayCircle,
  Settings,
  Sparkles,
  Target,
  Timer,
  TriangleAlert,
} from "lucide-react";
import { EmployeeTopNav } from "@/components/employee/EmployeeTopNav";
import { getAuthToken, getJson } from "@/lib/api";
import type {
  CareerGpsNextBestActionDetail,
  CareerGpsProfile,
  CareerGpsProgressEntry,
  CareerGpsProgressResponse,
  CareerGpsProgressStatus,
  CareerGpsRoadmap,
  CareerGpsRoute,
  CareerGpsRouteType,
  EmployeeDashboardData,
} from "@/lib/backendTypes";
import { routes } from "@/lib/routes";

type DashboardState = {
  employee: EmployeeDashboardData | null;
  profile: CareerGpsProfile | null;
  roadmap: CareerGpsRoadmap | null;
  progressEntries: CareerGpsProgressEntry[];
  nextBestAction: CareerGpsNextBestActionDetail | null;
};

type ProgressIndex = Record<string, CareerGpsProgressEntry>;

const routeLabels: Record<CareerGpsRouteType, string> = {
  recommended: "Recommended route",
  accelerated: "Accelerated route",
  balanced: "Balanced route",
};

const statusLabels: Record<CareerGpsProgressStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  completed: "Complete",
  skipped: "Skipped",
};

const emptyState: DashboardState = {
  employee: null,
  profile: null,
  roadmap: null,
  progressEntries: [],
  nextBestAction: null,
};

function initialsFromName(name: string) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return initials || "E";
}

function progressKey(routeType: CareerGpsRouteType, milestoneSequence: number, actionSequence?: number | null) {
  return actionSequence
    ? `${routeType}-${milestoneSequence}-action-${actionSequence}`
    : `${routeType}-${milestoneSequence}-milestone`;
}

function progressEntriesByKey(entries: CareerGpsProgressEntry[]) {
  return entries.reduce<ProgressIndex>((index, entry) => {
    index[progressKey(entry.route_type, entry.milestone_sequence, entry.action_sequence)] = entry;
    return index;
  }, {});
}

function selectedRoute(roadmap: CareerGpsRoadmap | null) {
  return (
    roadmap?.routes.find((route) => route.route_type === roadmap.selected_route_type) ??
    roadmap?.routes.find((route) => route.route_type === "recommended") ??
    roadmap?.routes[0] ??
    null
  );
}

function routeReadiness(route: CareerGpsRoute | null) {
  if (!route) return 0;
  const skillFit = route.score_components.find((component) => component.key === "skill_fit");
  return Math.round(skillFit?.score ?? route.score);
}

function normalizeSkill(skill: string | null | undefined) {
  return (skill ?? "").trim().toLowerCase();
}

function employeeHasSkill(profile: CareerGpsProfile | null, skillName: string) {
  const normalized = normalizeSkill(skillName);
  return Boolean(profile?.employee.skills.some((skill) => normalizeSkill(skill) === normalized));
}

function formatPriority(priority: string) {
  return priority.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function buildProgressSummary(route: CareerGpsRoute | null, progressIndex: ProgressIndex) {
  if (!route) {
    return {
      activeActions: 0,
      currentMilestone: null as CareerGpsRoute["milestones"][number] | null,
      milestonesCompleted: 0,
      overallProgress: 0,
      totalMilestones: 0,
    };
  }

  const milestoneEntries = route.milestones.map((milestone) => ({
    milestone,
    progress: progressIndex[progressKey(route.route_type, milestone.sequence)],
  }));
  const actionEntries = route.milestones.flatMap((milestone) =>
    milestone.actions.map((action) => progressIndex[progressKey(route.route_type, milestone.sequence, action.sequence)]),
  );
  const totalActions = actionEntries.length;
  const completedActions = actionEntries.filter((entry) => entry?.status === "completed").length;

  return {
    activeActions: actionEntries.filter((entry) => entry?.status === "in_progress").length,
    currentMilestone:
      milestoneEntries.find((entry) => entry.progress?.status === "in_progress")?.milestone ??
      milestoneEntries.find((entry) => entry.progress?.status !== "completed")?.milestone ??
      route.milestones[route.milestones.length - 1] ??
      null,
    milestonesCompleted: milestoneEntries.filter((entry) => entry.progress?.status === "completed").length,
    overallProgress: totalActions ? Math.round((completedActions / totalActions) * 100) : 0,
    totalMilestones: route.milestones.length,
  };
}

type DashboardMetric = {
  label: string;
  value: string;
  detail: string;
  icon: typeof CheckCircle2;
  tone: "gold" | "green" | "neutral";
};

const metricToneStyles: Record<DashboardMetric["tone"], string> = {
  gold: "border-[#E3D8BC] bg-[#F6F1E4] text-[#B08A44]",
  green: "border-[#CBDFD4] bg-[#E7F0E9] text-[#114F3B]",
  neutral: "border-[#DFD6BE] bg-[#F1EDE0] text-[#17694F]",
};

function MetricCard({ label, value, detail, icon: Icon, tone }: DashboardMetric) {
  return (
    <article className="rounded-2xl border border-[#EAE3D3] bg-white p-5 shadow-[0_8px_48px_rgba(70,60,35,0.1)]">
      <div className={`mb-5 flex h-11 w-11 items-center justify-center rounded-lg border ${metricToneStyles[tone]}`}>
        <Icon size={20} />
      </div>
      <p className="text-4xl font-bold text-[#1E2A44]">{value}</p>
      <p className="mt-2 text-xs font-bold uppercase tracking-wide text-[#9CA3AF]">{label}</p>
      <p className="mt-2 text-sm font-semibold text-[#6B7280]">{detail}</p>
    </article>
  );
}

function EmployeeCommandCenter({
  displayName,
  journeySummary,
  metrics,
}: {
  displayName: string;
  journeySummary: string;
  metrics: DashboardMetric[];
}) {
  return (
    <section aria-labelledby="employee-command-center-title" className="bg-[#F7F3EA] pb-14 pt-12 sm:pb-20 sm:pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.8fr)] lg:items-center">
          <div>
            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-[#E3D8BC] bg-[#F6F1E4] px-5 py-2 text-base font-bold text-[#B08A44]">
              <Sparkles size={17} />
              Employee workspace
            </div>
            <h1
              id="employee-command-center-title"
              className="font-bold leading-[1.1] tracking-tight text-[#1E2A44]"
              style={{ fontSize: "clamp(36px, 6vw, 64px)" }}
            >
              Career Command Center
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[#6B7280]">
              {displayName}: {journeySummary}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={routes.employeeCareerGps}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#B08A44] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#97742F]"
              >
                Open Career GPS
                <ArrowRight size={16} />
              </Link>
              <Link
                href={routes.employeeSettings}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#B08A44] bg-transparent px-6 py-3 text-sm font-medium text-[#B08A44] transition-colors hover:bg-[#F6F1E4]"
              >
                <Settings size={16} />
                Edit Settings
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {metrics.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function LoadingDashboard() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[#EAE3D3] bg-white p-5 shadow-[0_6px_20px_rgba(26,16,51,0.05)]">
        <div className="h-4 w-36 animate-pulse rounded bg-[#F1EDE0]" />
        <div className="mt-4 h-8 w-72 max-w-full animate-pulse rounded bg-[#F1EDE0]" />
        <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded bg-[#F1EDE0]" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
        <div className="rounded-lg border border-[#EAE3D3] bg-white p-5 shadow-[0_6px_20px_rgba(26,16,51,0.05)]">
          <div className="h-5 w-40 animate-pulse rounded bg-[#F1EDE0]" />
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="h-36 animate-pulse rounded-lg bg-[#F1EDE0]" />
            <div className="h-36 animate-pulse rounded-lg bg-[#F1EDE0]" />
          </div>
        </div>
        <div className="rounded-lg border border-[#EAE3D3] bg-white p-5 shadow-[0_6px_20px_rgba(26,16,51,0.05)]">
          <Loader2 className="h-6 w-6 animate-spin text-[#B08A44]" />
          <p className="mt-4 text-sm font-bold text-[#1E2A44]">Loading your next action</p>
          <p className="mt-2 text-sm leading-6 text-[#6B7280]">Pulling your current Career GPS route and saved progress.</p>
        </div>
      </div>
    </div>
  );
}

function ErrorDashboard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <section className="rounded-lg border border-[#E3D8BC] bg-white p-6 shadow-[0_8px_32px_rgba(26,16,51,0.06)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#F6F1E4] text-[#B08A44]">
          <TriangleAlert size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-[#1E2A44]">Dashboard unavailable</h2>
          <p className="mt-2 text-sm leading-6 text-[#6B7280]">{message}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg bg-[#1E2A44] px-4 text-sm font-bold text-white outline-none transition hover:bg-[#16233C] focus-visible:ring-2 focus-visible:ring-[#B08A44] focus-visible:ring-offset-2"
          >
            Retry
          </button>
        </div>
      </div>
    </section>
  );
}

function EmptyRoadmapState() {
  return (
    <section className="rounded-lg border border-[#EAE3D3] bg-white p-6 shadow-[0_8px_32px_rgba(26,16,51,0.06)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full bg-[#E7F0E9] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#17694F]">
            <Compass size={14} />
            Career GPS setup needed
          </p>
          <h2 className="mt-3 text-2xl font-bold text-[#1E2A44]">Create your first career route</h2>
          <p className="mt-2 text-sm leading-6 text-[#6B7280]">
            Once your Career GPS roadmap exists, this dashboard will show your current milestone, destination, next
            action, and progress summary.
          </p>
        </div>
        <Link
          href={routes.employeeCareerGps}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#B08A44] px-5 text-sm font-bold text-white shadow-sm outline-none transition hover:bg-[#97742F] focus-visible:ring-2 focus-visible:ring-[#1E2A44] focus-visible:ring-offset-2"
        >
          Open Career GPS
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}

export default function EmployeeDashboardPage() {
  const [state, setState] = useState<DashboardState>(emptyState);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    if (!getAuthToken()) {
      setIsLoading(false);
      setError("Sign in as an employee to view your dashboard.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [employeeResult, profileResult] = await Promise.allSettled([
        getJson<EmployeeDashboardData>("/dashboard/employee", { auth: true }),
        getJson<CareerGpsProfile>("/career-gps/profile", { auth: true }),
      ]);

      const employee = employeeResult.status === "fulfilled" ? employeeResult.value : null;
      const profile = profileResult.status === "fulfilled" ? profileResult.value : null;

      if (!employee && !profile) {
        throw new Error("Unable to load your employee profile.");
      }

      let roadmap: CareerGpsRoadmap | null = null;
      let progressEntries: CareerGpsProgressEntry[] = [];
      let nextBestAction: CareerGpsNextBestActionDetail | null = null;

      try {
        roadmap = await getJson<CareerGpsRoadmap>("/career-gps/roadmaps/latest", { auth: true });
      } catch {
        roadmap = null;
      }

      if (roadmap) {
        const [progressResult, actionResult] = await Promise.allSettled([
          getJson<CareerGpsProgressResponse>(`/career-gps/roadmaps/${roadmap.roadmap_id}/progress`, { auth: true }),
          getJson<CareerGpsNextBestActionDetail>(
            `/career-gps/roadmaps/${roadmap.roadmap_id}/next-best-action`,
            { auth: true },
          ),
        ]);
        progressEntries = progressResult.status === "fulfilled" ? progressResult.value.entries : [];
        nextBestAction = actionResult.status === "fulfilled" ? actionResult.value : null;
      }

      setState({ employee, profile, roadmap, progressEntries, nextBestAction });
    } catch (loadError) {
      setState(emptyState);
      setError(loadError instanceof Error ? loadError.message : "Unable to load your dashboard.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const fullName = state.profile?.employee.full_name ?? state.employee?.full_name ?? "Employee";
  const displayName = fullName.split(" ").filter(Boolean)[0] || "there";
  const activeRoute = selectedRoute(state.roadmap);
  const progressIndex = useMemo(() => progressEntriesByKey(state.progressEntries), [state.progressEntries]);
  const progress = buildProgressSummary(activeRoute, progressIndex);
  const readiness = routeReadiness(activeRoute);
  const targetRole = state.profile?.north_star.target_role ?? state.employee?.target_role ?? null;
  const careerGoal =
    state.profile?.north_star.career_ambition ??
    targetRole ??
    activeRoute?.target_occupation.title ??
    "Define your next career goal";
  const topPriorities = state.profile?.north_star.top_two_non_negotiable_priorities ?? [];
  const skillGapsRemaining = activeRoute
    ? activeRoute.skill_gaps.filter((gap) => !employeeHasSkill(state.profile, gap.skill_name)).length
    : 0;
  const journeySummary = activeRoute
    ? `${routeLabels[activeRoute.route_type]} toward ${activeRoute.target_occupation.title}.`
    : targetRole
      ? `Preparing your next move toward ${targetRole}.`
      : "Set up Career GPS to turn your goals into a visible route.";
  const routeStops = activeRoute
    ? [
        progress.currentMilestone?.title ?? activeRoute.milestones[0]?.title,
        ...activeRoute.milestones
          .filter((milestone) => milestone.sequence > (progress.currentMilestone?.sequence ?? 0))
          .slice(0, 2)
          .map((milestone) => milestone.title),
        activeRoute.target_occupation.title,
      ].filter(Boolean)
    : [];
  const dashboardMetrics: DashboardMetric[] = [
    {
      icon: CheckCircle2,
      label: "Milestones",
      value: `${progress.milestonesCompleted}/${progress.totalMilestones}`,
      detail: progress.totalMilestones ? "Completed on selected route" : "Create a route to start",
      tone: "gold",
    },
    {
      icon: Target,
      label: "Readiness",
      value: `${readiness}%`,
      detail: activeRoute ? "Skill-fit score for destination" : "Waiting for Career GPS",
      tone: "green",
    },
    {
      icon: Flag,
      label: "Skill Gaps",
      value: `${skillGapsRemaining}`,
      detail: activeRoute ? "Remaining priority gaps" : "No route selected yet",
      tone: "neutral",
    },
    {
      icon: Timer,
      label: "Active Actions",
      value: `${progress.activeActions}`,
      detail: state.nextBestAction ? statusLabels[state.nextBestAction.status] : "No action queued",
      tone: "gold",
    },
  ];

  return (
    <main className="min-h-screen bg-[#F7F3EA] text-[#1E2A44]">
      <EmployeeTopNav initials={initialsFromName(fullName)} name={fullName} />

      {isLoading ? (
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <LoadingDashboard />
        </section>
      ) : error ? (
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <ErrorDashboard message={error} onRetry={loadDashboard} />
        </section>
      ) : (
        <>
          <EmployeeCommandCenter displayName={displayName} journeySummary={journeySummary} metrics={dashboardMetrics} />

          <div className="space-y-0">
            {!state.roadmap || !activeRoute ? (
              <section className="border-y border-[#EAE3D3] bg-white py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <EmptyRoadmapState />
                </div>
              </section>
            ) : (
              <>
                <section className="border-y border-[#EAE3D3] bg-white py-6">
                  <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:px-8">
                    <div className="rounded-2xl border border-[#EAE3D3] bg-[#F7F3EA] p-5 shadow-[0_8px_28px_rgba(70,60,35,0.06)]">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="inline-flex items-center gap-2 rounded-full border border-[#CBDFD4] bg-[#E7F0E9] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#17694F]">
                            <Map size={14} />
                            Career GPS preview
                          </p>
                          <h2 className="mt-3 text-2xl font-bold tracking-tight">Your route at a glance</h2>
                        </div>
                        <div className="rounded-lg bg-white px-4 py-3 text-sm font-bold text-[#B08A44]">
                          {progress.overallProgress}% overall progress
                        </div>
                      </div>

                      <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <div className="rounded-lg border border-[#E7F0E9] bg-[#EFF5F0] p-4">
                          <p className="text-xs font-bold uppercase tracking-wide text-[#17694F]">Current milestone</p>
                          <p className="mt-2 text-lg font-bold">{progress.currentMilestone?.title ?? "No milestone selected"}</p>
                          <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                            {progress.currentMilestone?.description ??
                              "Career GPS will show the next active stop once your route has milestones."}
                          </p>
                        </div>
                        <div className="rounded-lg border border-[#EAE3D3] bg-white p-4">
                          <p className="text-xs font-bold uppercase tracking-wide text-[#17694F]">Destination</p>
                          <p className="mt-2 text-lg font-bold">{activeRoute.target_occupation.title}</p>
                          <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                            {activeRoute.estimated_months} months on the {routeLabels[activeRoute.route_type].toLowerCase()}.
                          </p>
                        </div>
                      </div>

                      <div className="mt-6">
                        <div className="h-3 overflow-hidden rounded-full bg-[#EAE3D3]">
                          <div
                            className="h-full rounded-full bg-[#B08A44]"
                            style={{ width: `${Math.min(progress.overallProgress, 100)}%` }}
                          />
                        </div>
                        <div className="mt-5 grid gap-3 sm:grid-cols-4">
                          {routeStops.slice(0, 4).map((stop, index) => (
                            <div key={`${stop}-${index}`} className="flex items-start gap-3 rounded-lg bg-white p-3">
                              <span
                                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                  index === 0 ? "bg-[#B08A44] text-white" : "bg-[#F7F3EA] text-[#17694F]"
                                }`}
                              >
                                {index + 1}
                              </span>
                              <p className="min-w-0 text-sm font-bold leading-5 text-[#1E2A44] line-clamp-3">{stop}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <aside className="rounded-2xl border border-[#EAE3D3] bg-white p-5 shadow-[0_4px_18px_rgba(70,60,35,0.06)]">
                      <p className="inline-flex items-center gap-2 rounded-full border border-[#E3D8BC] bg-[#F6F1E4] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#B08A44]">
                        <PlayCircle size={14} />
                        Next best action
                      </p>
                      {state.nextBestAction ? (
                        <div className="mt-4">
                          <h2 className="text-2xl font-bold">{state.nextBestAction.action_title}</h2>
                          <p className="mt-3 text-sm leading-6 text-[#6B7280]">{state.nextBestAction.why_it_matters}</p>
                          <div className="mt-5 grid gap-3 text-sm">
                            <div className="flex items-center justify-between rounded-lg bg-[#F7F3EA] px-4 py-3">
                              <span className="font-semibold text-[#6B7280]">Estimated effort</span>
                              <span className="font-bold">{state.nextBestAction.estimated_effort}</span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg bg-[#F7F3EA] px-4 py-3">
                              <span className="font-semibold text-[#6B7280]">Status</span>
                              <span className="font-bold">{statusLabels[state.nextBestAction.status]}</span>
                            </div>
                          </div>
                          <Link
                            href={routes.employeeCareerGps}
                            className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#B08A44] px-4 text-sm font-bold text-white outline-none transition hover:bg-[#97742F] focus-visible:ring-2 focus-visible:ring-[#1E2A44] focus-visible:ring-offset-2"
                          >
                            {state.nextBestAction.status === "not_started" ? "Start in Career GPS" : "Continue in Career GPS"}
                            <ArrowRight size={16} />
                          </Link>
                        </div>
                      ) : (
                        <div className="mt-4 rounded-lg border border-dashed border-[#DFD6BE] bg-[#F7F3EA] p-4">
                          <h2 className="text-lg font-bold">No action available yet</h2>
                          <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                            Open Career GPS to generate or refresh the route action queue.
                          </p>
                        </div>
                      )}
                    </aside>
                  </div>
                </section>

                <section className="bg-[#F7F3EA] pb-20 pt-4">
                  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                      <p className="text-xs font-bold uppercase tracking-wide text-[#B08A44]">Explore</p>
                      <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-[40px]">
                        A simpler employee workspace.
                      </h2>
                    </div>

                    <div className="rounded-2xl border border-[#EAE3D3] bg-white p-6 shadow-[0_4px_24px_rgba(70,60,35,0.08)]">
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="max-w-3xl">
                          <p className="inline-flex items-center gap-2 rounded-full bg-[#F7F3EA] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#B08A44]">
                            <Target size={14} />
                            Career goal summary
                          </p>
                          <h2 className="mt-3 text-2xl font-bold">{careerGoal}</h2>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {topPriorities.length ? (
                              topPriorities.map((priority) => (
                                <span
                                  key={priority}
                                  className="rounded-full border border-[#E3D8BC] bg-[#F7F3EA] px-3 py-1 text-sm font-bold text-[#B08A44]"
                                >
                                  {formatPriority(priority)}
                                </span>
                              ))
                            ) : (
                              <span className="rounded-full border border-[#EAE3D3] bg-[#F7F3EA] px-3 py-1 text-sm font-bold text-[#8B7434]">
                                Add priorities in Settings
                              </span>
                            )}
                          </div>
                        </div>
                        <Link
                          href={routes.employeeSettings}
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#B08A44] bg-white px-5 text-sm font-bold text-[#B08A44] outline-none transition hover:bg-[#F6F1E4] focus-visible:ring-2 focus-visible:ring-[#B08A44] focus-visible:ring-offset-2"
                        >
                          <Settings size={16} />
                          Edit in Settings
                        </Link>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}
          </div>
        </>
      )}
    </main>
  );
}
