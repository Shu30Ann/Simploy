"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Compass,
  Flag,
  Gauge,
  GitBranch,
  Loader2,
  Map,
  Play,
  RefreshCw,
  Route,
  Sparkles,
  Target,
} from "lucide-react";
import { getAuthToken, getJson, postJson } from "@/lib/api";
import type {
  CareerGpsMilestone,
  CareerGpsNorthStarSummary,
  CareerGpsProfile,
  CareerGpsRoadmap,
  CareerGpsRoute,
  CareerGpsRouteType,
} from "@/lib/backendTypes";

type ProgressStatus = "planned" | "in_progress" | "completed";

const routeTone: Record<CareerGpsRouteType, { label: string; accent: string; bg: string; border: string }> = {
  recommended: {
    label: "Recommended Route",
    accent: "text-[#E8197A]",
    bg: "bg-[#FFF0F8]",
    border: "border-[#FFD0E8]",
  },
  accelerated: {
    label: "Accelerated Route",
    accent: "text-[#0891B2]",
    bg: "bg-[#E0F9FF]",
    border: "border-[#BAF3FF]",
  },
  balanced: {
    label: "Balanced Route",
    accent: "text-[#6B46C1]",
    bg: "bg-[#F5F0FF]",
    border: "border-[#DDD0F8]",
  },
};

const detailLabels = [
  "Why it is recommended",
  "Required skills",
  "Missing skills",
  "Recommended experience",
  "Certifications",
  "Suggested projects",
  "Transition difficulty",
  "Lifestyle impact",
  "Confidence",
  "Immediate actions",
];

function scoreLabel(score: number) {
  if (score >= 82) return "High";
  if (score >= 68) return "Medium";
  if (score >= 52) return "Developing";
  return "Low";
}

function component(route: CareerGpsRoute, key: string) {
  return route.score_components.find((item) => item.key === key);
}

function sortedComponents(route: CareerGpsRoute) {
  return [...route.score_components].sort((a, b) => b.score - a.score);
}

function bestComponent(route: CareerGpsRoute) {
  return sortedComponents(route)[0];
}

function weakestComponent(route: CareerGpsRoute) {
  return sortedComponents(route).at(-1);
}

function metricValue(route: CareerGpsRoute, key: string) {
  return Math.round(component(route, key)?.score ?? route.score);
}

function readinessFromRoute(route: CareerGpsRoute) {
  return metricValue(route, "skill_fit");
}

function statusLabel(status: ProgressStatus) {
  if (status === "completed") return "Completed";
  if (status === "in_progress") return "In progress";
  return "Planned";
}

function missingRequirement(milestone: CareerGpsMilestone, route: CareerGpsRoute) {
  const focus = milestone.focus_skill_name;
  const exact = route.skill_gaps.find((gap) => gap.skill_name === focus);
  return exact?.skill_name ?? focus ?? route.skill_gaps[0]?.skill_name ?? "Role evidence";
}

function progressPercent(progress: Record<string, ProgressStatus>, route: CareerGpsRoute) {
  if (!route.milestones.length) return 0;
  const value = route.milestones.reduce((total, milestone) => {
    const status = progress[`${route.route_type}-${milestone.sequence}`] ?? "planned";
    if (status === "completed") return total + 1;
    if (status === "in_progress") return total + 0.5;
    return total;
  }, 0);
  return Math.round((value / route.milestones.length) * 100);
}

function InfoAlert({ tone, children }: { tone: "error" | "success" | "info"; children: React.ReactNode }) {
  const styles = {
    error: "border-[#FECACA] bg-[#FFF5F5] text-[#DC2626]",
    success: "border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D]",
    info: "border-[#BAF3FF] bg-[#F0FDFF] text-[#087C7E]",
  }[tone];
  const Icon = tone === "error" ? AlertCircle : tone === "success" ? CheckCircle2 : Sparkles;
  return (
    <div className={`flex items-start gap-2 rounded-lg border px-4 py-3 text-sm font-bold ${styles}`}>
      <Icon size={17} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-xs font-bold text-[#6B7280]">
        <span>{label}</span>
        <span className="text-[#1A1033]">{Math.round(score)}%</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-[#F0EBF8]">
        <div className="h-2 rounded-full bg-[#E8197A]" style={{ width: `${Math.max(0, Math.min(100, score))}%` }} />
      </div>
    </div>
  );
}

function NorthStarSummary({ summary }: { summary: CareerGpsNorthStarSummary | null }) {
  return (
    <section className="rounded-lg border border-[#BAF3FF] bg-white p-5 shadow-[0_4px_24px_rgba(232,25,122,0.08)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-[#BAF3FF] bg-[#E0F9FF] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#0891B2]">
            <Compass size={14} />
            Career North Star
          </p>
          <h2 className="mt-3 text-2xl font-bold text-[#1A1033]">{summary?.target_role ?? "Career GPS roadmap"}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B7280]">
            {summary?.career_ambition ?? "Complete your Career North Star setup to personalize roadmap generation."}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
          <div className="rounded-lg bg-[#FFF0F8] p-3">
            <p className="text-xs font-bold uppercase text-[#9CA3AF]">Industry</p>
            <p className="mt-1 text-sm font-bold text-[#E8197A]">{summary?.target_industry ?? "Not set"}</p>
          </div>
          <div className="rounded-lg bg-[#F5F0FF] p-3">
            <p className="text-xs font-bold uppercase text-[#9CA3AF]">Timeline</p>
            <p className="mt-1 text-sm font-bold text-[#6B46C1]">
              {summary?.target_timeline_months ? `${summary.target_timeline_months} months` : "Flexible"}
            </p>
          </div>
          <div className="rounded-lg bg-[#E0F9FF] p-3">
            <p className="text-xs font-bold uppercase text-[#9CA3AF]">Setup</p>
            <p className="mt-1 text-sm font-bold text-[#0891B2]">
              {summary?.is_onboarding_complete ? "Complete" : "Needs setup"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function NextBestActionCard({ roadmap }: { roadmap: CareerGpsRoadmap }) {
  return (
    <section className="rounded-lg bg-[#1A1033] p-5 text-white shadow-[0_8px_48px_rgba(26,16,51,0.18)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white/70">
            <Flag size={14} />
            Next Best Action
          </p>
          <h2 className="mt-3 text-2xl font-bold">{roadmap.next_best_action.title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/75">{roadmap.next_best_action.description}</p>
        </div>
        <div className="rounded-lg border border-white/15 bg-white/10 px-4 py-3">
          <p className="text-xs font-bold uppercase text-white/45">Roadmap readiness</p>
          <p className="mt-1 text-3xl font-bold">{Math.round(roadmap.fit_score)}%</p>
        </div>
      </div>
    </section>
  );
}

function RouteCard({
  route,
  selected,
  onSelect,
}: {
  route: CareerGpsRoute;
  selected: boolean;
  onSelect: () => void;
}) {
  const tone = routeTone[route.route_type];
  const advantage = bestComponent(route);
  const tradeoff = weakestComponent(route);
  const lifestyle = metricValue(route, "lifestyle_fit");
  const skill = readinessFromRoute(route);
  const market = metricValue(route, "market_opportunity");
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`min-h-[300px] rounded-lg border bg-white p-4 text-left shadow-[0_4px_24px_rgba(232,25,122,0.08)] transition ${
        selected ? `${tone.border} ring-2 ring-[#E8197A]/20` : "border-[#F0EBF8] hover:border-[#DDD0F8]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${tone.bg} ${tone.accent} ${tone.border}`}>
          <Route size={14} />
          {tone.label}
        </span>
        <span className="rounded-full bg-[#F8F5FC] px-2 py-1 text-xs font-bold text-[#6B7280]">
          {scoreLabel(route.score)}
        </span>
      </div>
      <h3 className="mt-4 text-lg font-bold text-[#1A1033]">{route.target_occupation.title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#6B7280]">{route.summary}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-[#FDFCFF] p-3">
          <p className="text-xs font-bold uppercase text-[#9CA3AF]">Estimated timeline</p>
          <p className="mt-1 text-sm font-bold text-[#1A1033]">{route.estimated_months} months</p>
        </div>
        <div className="rounded-lg bg-[#FDFCFF] p-3">
          <p className="text-xs font-bold uppercase text-[#9CA3AF]">Confidence</p>
          <p className="mt-1 text-sm font-bold text-[#1A1033]">{scoreLabel(route.score)}</p>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        <ScoreBar label="Lifestyle fit" score={lifestyle} />
        <ScoreBar label="Skill readiness" score={skill} />
        <ScoreBar label="Market opportunity" score={market} />
      </div>
      <div className="mt-4 grid gap-3 text-xs font-semibold text-[#6B7280]">
        <p>
          <span className="font-bold text-[#059669]">Advantage:</span> {advantage?.label ?? "Overall fit"}{" "}
          {advantage ? `${Math.round(advantage.score)}%` : ""}
        </p>
        <p>
          <span className="font-bold text-[#DC2626]">Trade-off:</span> {tradeoff?.label ?? "Preparation"}{" "}
          {tradeoff ? `${Math.round(tradeoff.score)}%` : ""}
        </p>
      </div>
    </button>
  );
}

function MetroRoadmap({
  route,
  selectedMilestone,
  progress,
  onSelectMilestone,
  onSetStatus,
}: {
  route: CareerGpsRoute;
  selectedMilestone: CareerGpsMilestone | null;
  progress: Record<string, ProgressStatus>;
  onSelectMilestone: (milestone: CareerGpsMilestone) => void;
  onSetStatus: (milestone: CareerGpsMilestone, status: ProgressStatus) => void;
}) {
  return (
    <section className="rounded-lg border border-[#F0EBF8] bg-white p-5 shadow-[0_4px_24px_rgba(232,25,122,0.08)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-[#FFD0E8] bg-[#FFF0F8] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#E8197A]">
            <GitBranch size={14} />
            Visual roadmap
          </p>
          <h2 className="mt-3 text-2xl font-bold text-[#1A1033]">{route.title}</h2>
        </div>
        <div className="rounded-lg bg-[#FDFCFF] px-4 py-3">
          <p className="text-xs font-bold uppercase text-[#9CA3AF]">Progress</p>
          <p className="mt-1 text-lg font-bold text-[#E8197A]">{progressPercent(progress, route)}%</p>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto pb-2">
        <div className="relative grid min-w-[760px] grid-cols-4 gap-4">
          <div className="absolute left-[12%] right-[12%] top-9 h-1 rounded-full bg-[#E2D9F3]" />
          <article className="relative rounded-lg border border-[#BAF3FF] bg-[#F0FDFF] p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#06B6D4] text-white">
              <Target size={18} />
            </div>
            <p className="mt-4 text-xs font-bold uppercase text-[#0891B2]">Target role</p>
            <h3 className="mt-1 text-sm font-bold text-[#1A1033]">{route.target_occupation.title}</h3>
            <p className="mt-2 text-xs font-semibold text-[#6B7280]">Stage: {route.target_occupation.seniority_level ?? "target"}</p>
            <p className="mt-1 text-xs font-semibold text-[#6B7280]">Readiness: {Math.round(route.score)}%</p>
          </article>
          {route.milestones.map((milestone) => {
            const key = `${route.route_type}-${milestone.sequence}`;
            const status = progress[key] ?? "planned";
            const active = selectedMilestone?.sequence === milestone.sequence;
            return (
              <article
                key={milestone.sequence}
                className={`relative rounded-lg border bg-white p-4 ${
                  active ? "border-[#E8197A] ring-2 ring-[#E8197A]/20" : "border-[#F0EBF8]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectMilestone(milestone)}
                  className="block w-full text-left"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      status === "completed" ? "bg-[#10B981]" : status === "in_progress" ? "bg-[#E8197A]" : "bg-[#6B46C1]"
                    } text-white`}
                  >
                    {milestone.sequence}
                  </div>
                  <p className="mt-4 text-xs font-bold uppercase text-[#9CA3AF]">Milestone {milestone.sequence}</p>
                  <h3 className="mt-1 min-h-10 text-sm font-bold text-[#1A1033]">{milestone.title}</h3>
                  <p className="mt-2 text-xs font-semibold text-[#6B7280]">{milestone.duration_weeks ?? 4} weeks</p>
                  <p className="mt-1 text-xs font-semibold text-[#6B7280]">Readiness: {readinessFromRoute(route)}%</p>
                  <p className="mt-1 text-xs font-semibold text-[#6B7280]">Status: {statusLabel(status)}</p>
                  <p className="mt-2 text-xs font-bold text-[#E8197A]">Gap: {missingRequirement(milestone, route)}</p>
                </button>
                <div className="mt-4 grid gap-2">
                  {(["planned", "in_progress", "completed"] as ProgressStatus[]).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => onSetStatus(milestone, item)}
                      className={`rounded-lg border px-2 py-1.5 text-xs font-bold ${
                        status === item
                          ? "border-[#E8197A] bg-[#FFF0F8] text-[#E8197A]"
                          : "border-[#F0EBF8] bg-white text-[#6B7280]"
                      }`}
                    >
                      {statusLabel(item)}
                    </button>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function MilestoneDetailPanel({
  route,
  milestone,
}: {
  route: CareerGpsRoute;
  milestone: CareerGpsMilestone | null;
}) {
  const active = milestone ?? route.milestones[0] ?? null;
  const missing = active ? route.skill_gaps.filter((gap) => gap.skill_name === active.focus_skill_name) : route.skill_gaps;
  const detailMap = {
    "Why it is recommended": active?.description ?? route.explanation,
    "Required skills": active?.focus_skill_name ?? (route.skill_gaps.map((gap) => gap.skill_name).join(", ") || "Role-specific proof"),
    "Missing skills": missing.length ? missing.map((gap) => gap.skill_name).join(", ") : route.skill_gaps[0]?.skill_name ?? "No major gap identified",
    "Recommended experience": `Complete one applied ${route.target_occupation.family} work sample before moving to the next milestone.`,
    Certifications: "No mandatory certification is stored for this route; use relevant role credentials only when they support the target skill.",
    "Suggested projects": active?.actions.find((action) => action.action_type === "project")?.title ?? `Build a ${route.target_occupation.family} proof project.`,
    "Transition difficulty": `${metricValue(route, "transition_difficulty")}% fit`,
    "Lifestyle impact": `${metricValue(route, "lifestyle_fit")}% lifestyle fit and ${metricValue(route, "work_life_balance_fit")}% work-life fit`,
    Confidence: `${scoreLabel(route.score)} confidence at ${Math.round(route.score)}%`,
    "Immediate actions": active?.actions.map((action) => action.title).join("; ") ?? "Validate this target role with one role-holder conversation.",
  };

  return (
    <aside className="rounded-lg border border-[#F0EBF8] bg-white p-5 shadow-[0_4px_24px_rgba(232,25,122,0.08)]">
      <p className="inline-flex items-center gap-2 rounded-full border border-[#BAF3FF] bg-[#E0F9FF] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#0891B2]">
        <Map size={14} />
        Milestone detail
      </p>
      <h2 className="mt-3 text-xl font-bold text-[#1A1033]">{active?.title ?? route.target_occupation.title}</h2>
      <div className="mt-4 grid gap-3">
        {detailLabels.map((label) => (
          <div key={label} className="rounded-lg bg-[#FDFCFF] p-3">
            <p className="text-xs font-bold uppercase text-[#9CA3AF]">{label}</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-[#1A1033]">{detailMap[label as keyof typeof detailMap]}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}

function SkillReadinessSummary({ route }: { route: CareerGpsRoute }) {
  const missing = route.skill_gaps;
  const readiness = readinessFromRoute(route);
  return (
    <section className="rounded-lg border border-[#F0EBF8] bg-white p-5 shadow-[0_4px_24px_rgba(232,25,122,0.08)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-[#DDD0F8] bg-[#F5F0FF] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#6B46C1]">
            <Gauge size={14} />
            Skills and readiness
          </p>
          <h2 className="mt-3 text-2xl font-bold text-[#1A1033]">{readiness}% skill readiness</h2>
        </div>
        <div className="rounded-lg bg-[#FDFCFF] px-4 py-3">
          <p className="text-xs font-bold uppercase text-[#9CA3AF]">Missing skills</p>
          <p className="mt-1 text-lg font-bold text-[#E8197A]">{missing.length}</p>
        </div>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-3 sm:grid-cols-2">
          {missing.length ? (
            missing.map((gap) => (
              <article key={`${gap.skill_name}-${gap.priority}`} className="rounded-lg border border-[#F0EBF8] bg-[#FDFCFF] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-[#1A1033]">{gap.skill_name}</p>
                    <p className="mt-1 text-xs font-bold uppercase text-[#9CA3AF]">{gap.skill_type}</p>
                  </div>
                  <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-[#E8197A]">P{gap.priority}</span>
                </div>
                <p className="mt-3 text-sm font-semibold text-[#6B7280]">Target level: {gap.proficiency_level}</p>
              </article>
            ))
          ) : (
            <article className="rounded-lg border border-[#BAF3FF] bg-[#F0FDFF] p-4 text-sm font-bold text-[#087C7E]">
              No major skill gap was identified for this route.
            </article>
          )}
        </div>
        <div className="space-y-3 rounded-lg border border-[#F0EBF8] bg-[#FDFCFF] p-4">
          <ScoreBar label="Goal fit" score={metricValue(route, "goal_fit")} />
          <ScoreBar label="Skill fit" score={metricValue(route, "skill_fit")} />
          <ScoreBar label="Lifestyle fit" score={metricValue(route, "lifestyle_fit")} />
          <ScoreBar label="Career risk fit" score={metricValue(route, "career_risk")} />
        </div>
      </div>
    </section>
  );
}

export default function CareerGpsRoadmapPanel() {
  const [profile, setProfile] = useState<CareerGpsProfile | null>(null);
  const [roadmap, setRoadmap] = useState<CareerGpsRoadmap | null>(null);
  const [selectedRouteType, setSelectedRouteType] = useState<CareerGpsRouteType>("recommended");
  const [selectedMilestoneKey, setSelectedMilestoneKey] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<string, ProgressStatus>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const selectedRoute = useMemo(() => {
    if (!roadmap) return null;
    return roadmap.routes.find((route) => route.route_type === selectedRouteType) ?? roadmap.routes[0] ?? null;
  }, [roadmap, selectedRouteType]);

  const selectedMilestone = useMemo(() => {
    if (!selectedRoute || !selectedMilestoneKey) return selectedRoute?.milestones[0] ?? null;
    return selectedRoute.milestones.find((milestone) => `${selectedRoute.route_type}-${milestone.sequence}` === selectedMilestoneKey) ?? null;
  }, [selectedMilestoneKey, selectedRoute]);

  const loadRoadmap = useCallback(async () => {
    if (!getAuthToken()) {
      setIsLoading(false);
      setError("Sign in as an employee to view Career GPS roadmap.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setMessage(null);
    try {
      const nextProfile = await getJson<CareerGpsProfile>("/career-gps/profile", { auth: true });
      setProfile(nextProfile);
      try {
        const latest = await getJson<CareerGpsRoadmap>("/career-gps/roadmaps/latest", { auth: true });
        setRoadmap(latest);
        setSelectedRouteType(latest.routes[0]?.route_type ?? "recommended");
        setSelectedMilestoneKey(latest.routes[0]?.milestones[0] ? `${latest.routes[0].route_type}-${latest.routes[0].milestones[0].sequence}` : null);
      } catch {
        setRoadmap(null);
        setMessage("No generated roadmap yet.");
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load Career GPS roadmap.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoadmap();
  }, [loadRoadmap]);

  const generateRoadmap = async () => {
    setIsGenerating(true);
    setError(null);
    setMessage(null);
    try {
      const generated = await postJson<CareerGpsRoadmap, Record<string, never>>(
        "/career-gps/roadmaps/generate",
        {},
        { auth: true },
      );
      setRoadmap(generated);
      setSelectedRouteType(generated.routes[0]?.route_type ?? "recommended");
      setSelectedMilestoneKey(generated.routes[0]?.milestones[0] ? `${generated.routes[0].route_type}-${generated.routes[0].milestones[0].sequence}` : null);
      setProgress({});
      setMessage(`Roadmap version ${generated.version} generated.`);
    } catch (generateError) {
      setError(generateError instanceof Error ? generateError.message : "Unable to generate Career GPS roadmap.");
    } finally {
      setIsGenerating(false);
    }
  };

  const setMilestoneStatus = (route: CareerGpsRoute, milestone: CareerGpsMilestone, status: ProgressStatus) => {
    setProgress((current) => ({
      ...current,
      [`${route.route_type}-${milestone.sequence}`]: status,
    }));
  };

  if (isLoading) {
    return (
      <section id="career-gps-roadmap" className="rounded-lg border border-[#F0EBF8] bg-white p-5 shadow-[0_4px_24px_rgba(232,25,122,0.08)]">
        <div className="flex items-center gap-3 text-sm font-bold text-[#6B7280]">
          <Loader2 size={18} className="animate-spin text-[#E8197A]" />
          Loading Career GPS roadmap...
        </div>
      </section>
    );
  }

  return (
    <section id="career-gps-roadmap" className="mt-6 space-y-6 scroll-mt-24">
      {error && <InfoAlert tone="error">{error}</InfoAlert>}
      {message && <InfoAlert tone="info">{message}</InfoAlert>}

      <NorthStarSummary summary={profile?.north_star ?? null} />

      {!roadmap && (
        <section className="rounded-lg border border-[#F0EBF8] bg-white p-6 text-center shadow-[0_4px_24px_rgba(232,25,122,0.08)]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-[#FFF0F8] text-[#E8197A]">
            <BarChart3 size={22} />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-[#1A1033]">Generate your Career GPS roadmap</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]">
            Career GPS will use your saved North Star, skills, lifestyle priorities, constraints, and illustrative occupation data.
          </p>
          <button
            type="button"
            onClick={generateRoadmap}
            disabled={isGenerating}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-[#1A1033] px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            Generate roadmap
          </button>
        </section>
      )}

      {roadmap && selectedRoute && (
        <>
          <div className="flex flex-col gap-3 rounded-lg border border-[#F0EBF8] bg-white p-4 shadow-[0_4px_24px_rgba(232,25,122,0.08)] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-[#9CA3AF]">Career GPS roadmap</p>
              <p className="mt-1 text-sm font-semibold text-[#6B7280]">
                Version {roadmap.version} / {roadmap.scoring_version}
              </p>
            </div>
            <button
              type="button"
              onClick={generateRoadmap}
              disabled={isGenerating}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#DDD0F8] bg-white px-4 py-2.5 text-sm font-bold text-[#6B46C1] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              Regenerate
            </button>
          </div>

          <NextBestActionCard roadmap={roadmap} />

          <section className="grid gap-4 xl:grid-cols-3">
            {roadmap.routes.map((route) => (
              <RouteCard
                key={route.route_type}
                route={route}
                selected={route.route_type === selectedRoute.route_type}
                onSelect={() => {
                  setSelectedRouteType(route.route_type);
                  setSelectedMilestoneKey(route.milestones[0] ? `${route.route_type}-${route.milestones[0].sequence}` : null);
                }}
              />
            ))}
          </section>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
            <MetroRoadmap
              route={selectedRoute}
              selectedMilestone={selectedMilestone}
              progress={progress}
              onSelectMilestone={(milestone) => setSelectedMilestoneKey(`${selectedRoute.route_type}-${milestone.sequence}`)}
              onSetStatus={(milestone, status) => setMilestoneStatus(selectedRoute, milestone, status)}
            />
            <MilestoneDetailPanel route={selectedRoute} milestone={selectedMilestone} />
          </div>

          <SkillReadinessSummary route={selectedRoute} />

          <InfoAlert tone="info">{roadmap.source_note}</InfoAlert>
        </>
      )}
    </section>
  );
}
