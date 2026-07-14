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

function MetricCard({ label, value, icon: Icon }: { label: string; value: string; icon: typeof CheckCircle2 }) {
  return (
    <div className="rounded-lg border border-[#F0EBF8] bg-white p-4 shadow-[0_6px_20px_rgba(26,16,51,0.05)] transition hover:border-[#DDD0F8] hover:shadow-[0_10px_28px_rgba(26,16,51,0.07)]">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FFF0F8] text-[#E8197A]">
          <Icon size={18} />
        </span>
        <div className="min-w-0">
          <p className="text-xl font-bold text-[#1A1033]">{value}</p>
          <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-[#8A7AA8]">{label}</p>
        </div>
      </div>
    </div>
  );
}

function LoadingDashboard() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[#F0EBF8] bg-white p-5 shadow-[0_6px_20px_rgba(26,16,51,0.05)]">
        <div className="h-4 w-36 animate-pulse rounded bg-[#F1ECF8]" />
        <div className="mt-4 h-8 w-72 max-w-full animate-pulse rounded bg-[#F1ECF8]" />
        <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded bg-[#F1ECF8]" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
        <div className="rounded-lg border border-[#F0EBF8] bg-white p-5 shadow-[0_6px_20px_rgba(26,16,51,0.05)]">
          <div className="h-5 w-40 animate-pulse rounded bg-[#F1ECF8]" />
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="h-36 animate-pulse rounded-lg bg-[#F1ECF8]" />
            <div className="h-36 animate-pulse rounded-lg bg-[#F1ECF8]" />
          </div>
        </div>
        <div className="rounded-lg border border-[#F0EBF8] bg-white p-5 shadow-[0_6px_20px_rgba(26,16,51,0.05)]">
          <Loader2 className="h-6 w-6 animate-spin text-[#E8197A]" />
          <p className="mt-4 text-sm font-bold text-[#1A1033]">Loading your next action</p>
          <p className="mt-2 text-sm leading-6 text-[#6B7280]">Pulling your current Career GPS route and saved progress.</p>
        </div>
      </div>
    </div>
  );
}

function ErrorDashboard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <section className="rounded-lg border border-[#FBCFE8] bg-white p-6 shadow-[0_8px_32px_rgba(26,16,51,0.06)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#FFF0F8] text-[#E8197A]">
          <TriangleAlert size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-[#1A1033]">Dashboard unavailable</h2>
          <p className="mt-2 text-sm leading-6 text-[#6B7280]">{message}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg bg-[#1A1033] px-4 text-sm font-bold text-white outline-none transition hover:bg-[#2A1B4A] focus-visible:ring-2 focus-visible:ring-[#E8197A] focus-visible:ring-offset-2"
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
    <section className="rounded-lg border border-[#F0EBF8] bg-white p-6 shadow-[0_8px_32px_rgba(26,16,51,0.06)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full bg-[#F5F2FB] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#6B46C1]">
            <Compass size={14} />
            Career GPS setup needed
          </p>
          <h2 className="mt-3 text-2xl font-bold text-[#1A1033]">Create your first career route</h2>
          <p className="mt-2 text-sm leading-6 text-[#6B7280]">
            Once your Career GPS roadmap exists, this dashboard will show your current milestone, destination, next
            action, and progress summary.
          </p>
        </div>
        <Link
          href={routes.employeeCareerGps}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#E8197A] px-5 text-sm font-bold text-white shadow-sm outline-none transition hover:bg-[#CC146A] focus-visible:ring-2 focus-visible:ring-[#1A1033] focus-visible:ring-offset-2"
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

  return (
    <main className="min-h-screen bg-[#FAF8FD] text-[#1A1033]">
      <EmployeeTopNav initials={initialsFromName(fullName)} name={fullName} />

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {isLoading ? (
          <LoadingDashboard />
        ) : error ? (
          <ErrorDashboard message={error} onRetry={loadDashboard} />
        ) : (
          <div className="space-y-5">
            <section className="rounded-lg border border-[#F0EBF8] bg-white p-5 shadow-[0_6px_24px_rgba(26,16,51,0.06)] sm:p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <p className="inline-flex items-center gap-2 rounded-full bg-[#FFF0F8] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#E8197A]">
                    <Sparkles size={14} />
                    Employee dashboard
                  </p>
                  <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Welcome back, {displayName}.</h1>
                  <p className="mt-3 text-base leading-7 text-[#6B7280]">{journeySummary}</p>
                </div>
                <Link
                  href={routes.employeeCareerGps}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#1A1033] px-5 text-sm font-bold text-white shadow-sm outline-none transition hover:bg-[#2A1B4A] focus-visible:ring-2 focus-visible:ring-[#E8197A] focus-visible:ring-offset-2"
                >
                  Open Career GPS
                  <ArrowRight size={16} />
                </Link>
              </div>
            </section>

            {!state.roadmap || !activeRoute ? (
              <EmptyRoadmapState />
            ) : (
              <>
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
                  <section className="rounded-lg border border-[#F0EBF8] bg-white p-5 shadow-[0_6px_24px_rgba(26,16,51,0.06)] sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="inline-flex items-center gap-2 rounded-full bg-[#F5F2FB] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#6B46C1]">
                          <Map size={14} />
                          Career GPS preview
                        </p>
                        <h2 className="mt-3 text-2xl font-bold tracking-tight">Your route at a glance</h2>
                      </div>
                      <div className="rounded-lg bg-[#F7F3EA] px-4 py-3 text-sm font-bold text-[#B08A44]">
                        {progress.overallProgress}% overall progress
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      <div className="rounded-lg border border-[#E7F0E9] bg-[#F7FBF8] p-4">
                        <p className="text-xs font-bold uppercase tracking-wide text-[#17694F]">Current milestone</p>
                        <p className="mt-2 text-lg font-bold">{progress.currentMilestone?.title ?? "No milestone selected"}</p>
                        <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                          {progress.currentMilestone?.description ??
                            "Career GPS will show the next active stop once your route has milestones."}
                        </p>
                      </div>
                      <div className="rounded-lg border border-[#F0EBF8] bg-[#FBFAFE] p-4">
                        <p className="text-xs font-bold uppercase tracking-wide text-[#6B46C1]">Destination</p>
                        <p className="mt-2 text-lg font-bold">{activeRoute.target_occupation.title}</p>
                        <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                          {activeRoute.estimated_months} months on the {routeLabels[activeRoute.route_type].toLowerCase()}.
                        </p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="h-3 overflow-hidden rounded-full bg-[#F0EBF8]">
                        <div
                          className="h-full rounded-full bg-[#E8197A]"
                          style={{ width: `${Math.min(progress.overallProgress, 100)}%` }}
                        />
                      </div>
                      <div className="mt-5 grid gap-3 sm:grid-cols-4">
                        {routeStops.slice(0, 4).map((stop, index) => (
                          <div key={`${stop}-${index}`} className="flex items-start gap-3 rounded-lg bg-[#FAF8FD] p-3">
                            <span
                              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                index === 0 ? "bg-[#E8197A] text-white" : "bg-white text-[#6B46C1]"
                              }`}
                            >
                              {index + 1}
                            </span>
                            <p className="min-w-0 text-sm font-bold leading-5 text-[#1A1033] line-clamp-3">{stop}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                  <section className="rounded-lg border border-[#F0EBF8] bg-white p-5 shadow-[0_6px_24px_rgba(26,16,51,0.06)] sm:p-6">
                    <p className="inline-flex items-center gap-2 rounded-full bg-[#FFF0F8] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#E8197A]">
                      <PlayCircle size={14} />
                      Next best action
                    </p>
                    {state.nextBestAction ? (
                      <div className="mt-4">
                        <h2 className="text-2xl font-bold">{state.nextBestAction.action_title}</h2>
                        <p className="mt-3 text-sm leading-6 text-[#6B7280]">{state.nextBestAction.why_it_matters}</p>
                        <div className="mt-5 grid gap-3 text-sm">
                          <div className="flex items-center justify-between rounded-lg bg-[#FAF8FD] px-4 py-3">
                            <span className="font-semibold text-[#6B7280]">Estimated effort</span>
                            <span className="font-bold">{state.nextBestAction.estimated_effort}</span>
                          </div>
                          <div className="flex items-center justify-between rounded-lg bg-[#FAF8FD] px-4 py-3">
                            <span className="font-semibold text-[#6B7280]">Status</span>
                            <span className="font-bold">{statusLabels[state.nextBestAction.status]}</span>
                          </div>
                        </div>
                        <Link
                          href={routes.employeeCareerGps}
                          className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#E8197A] px-4 text-sm font-bold text-white outline-none transition hover:bg-[#CC146A] focus-visible:ring-2 focus-visible:ring-[#1A1033] focus-visible:ring-offset-2"
                        >
                          {state.nextBestAction.status === "not_started" ? "Start in Career GPS" : "Continue in Career GPS"}
                          <ArrowRight size={16} />
                        </Link>
                      </div>
                    ) : (
                      <div className="mt-4 rounded-lg border border-dashed border-[#DDD0F8] bg-[#FAF8FD] p-4">
                        <h2 className="text-lg font-bold">No action available yet</h2>
                        <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                          Open Career GPS to generate or refresh the route action queue.
                        </p>
                      </div>
                    )}
                  </section>
                </div>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Compact progress summary">
                  <MetricCard
                    icon={CheckCircle2}
                    label="Milestones completed"
                    value={`${progress.milestonesCompleted}/${progress.totalMilestones}`}
                  />
                  <MetricCard icon={Target} label="Route readiness" value={`${readiness}%`} />
                  <MetricCard icon={Flag} label="Skill gaps remaining" value={`${skillGapsRemaining}`} />
                  <MetricCard icon={Timer} label="Active actions" value={`${progress.activeActions}`} />
                </section>

                <section className="rounded-lg border border-[#F0EBF8] bg-white p-5 shadow-[0_6px_24px_rgba(26,16,51,0.06)] sm:p-6">
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
                          <span className="rounded-full border border-[#F0EBF8] bg-[#FAF8FD] px-3 py-1 text-sm font-bold text-[#8A7AA8]">
                            Add priorities in Settings
                          </span>
                        )}
                      </div>
                    </div>
                    <Link
                      href={routes.employeeSettings}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#DDD0F8] bg-white px-5 text-sm font-bold text-[#6B46C1] outline-none transition hover:border-[#E8197A] hover:text-[#E8197A] focus-visible:ring-2 focus-visible:ring-[#E8197A] focus-visible:ring-offset-2"
                    >
                      <Settings size={16} />
                      Edit in Settings
                    </Link>
                  </div>
                </section>
              </>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
