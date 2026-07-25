"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  Bot,
  CheckCircle2,
  Compass,
  Flag,
  Gauge,
  GitBranch,
  HelpCircle,
  Loader2,
  Map,
  Play,
  RefreshCw,
  Route,
  Send,
  SlidersHorizontal,
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
  CareerGpsScenarioCode,
  CareerGpsWhatIfPreview,
  CareerGpsWhatIfScenarioPayload,
  CareerBuddyConversation,
  CareerBuddyConversationDetail,
  CareerBuddyMessage,
  CareerBuddyMessagePayload,
  CareerBuddyReply,
} from "@/lib/backendTypes";

type ProgressStatus = "planned" | "in_progress" | "completed";

const routeTone: Record<CareerGpsRouteType, { label: string; accent: string; bg: string; border: string }> = {
  recommended: {
    label: "Recommended Route",
    accent: "text-[#B08A44]",
    bg: "bg-[#F6F1E4]",
    border: "border-[#E3D8BC]",
  },
  accelerated: {
    label: "Accelerated Route",
    accent: "text-[#114F3B]",
    bg: "bg-[#E7F0E9]",
    border: "border-[#CBDFD4]",
  },
  balanced: {
    label: "Balanced Route",
    accent: "text-[#17694F]",
    bg: "bg-[#E7F0E9]",
    border: "border-[#DFD6BE]",
  },
};

const scenarioOptions: { code: CareerGpsScenarioCode; label: string; description: string }[] = [
  {
    code: "prioritise_salary",
    label: "Prioritise salary",
    description: "Raises income priority and risk tolerance for higher-earning paths.",
  },
  {
    code: "prioritise_work_life_balance",
    label: "Prioritise work-life balance",
    description: "Raises balance, remote-work, and lower-risk preferences.",
  },
  {
    code: "avoid_management",
    label: "Avoid management",
    description: "Adds a blocking individual-contributor constraint.",
  },
  {
    code: "relocate_country",
    label: "Relocate country",
    description: "Tests international mobility and a preferred relocation country.",
  },
  {
    code: "change_industry",
    label: "Change industry",
    description: "Temporarily shifts the target industry.",
  },
  {
    code: "retire_earlier",
    label: "Retire earlier",
    description: "Compresses timeline and raises income priority.",
  },
  {
    code: "complete_masters_degree",
    label: "Complete master's degree",
    description: "Treats additional learning evidence as completed for the preview.",
  },
  {
    code: "focus_entrepreneurship",
    label: "Focus on entrepreneurship",
    description: "Shifts toward startup, ownership, and higher-risk routes.",
  },
];

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

function recommendedRoute(roadmap: CareerGpsRoadmap) {
  return roadmap.routes.find((route) => route.route_type === "recommended") ?? roadmap.routes[0] ?? null;
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
    success: "border-[#CBDFD4] bg-[#EFF5F0] text-[#17694F]",
    info: "border-[#CBDFD4] bg-[#EFF5F0] text-[#17694F]",
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
        <span className="text-[#1E2A44]">{Math.round(score)}%</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-[#EAE3D3]">
        <div className="h-2 rounded-full bg-[#B08A44]" style={{ width: `${Math.max(0, Math.min(100, score))}%` }} />
      </div>
    </div>
  );
}

function NorthStarSummary({ summary }: { summary: CareerGpsNorthStarSummary | null }) {
  return (
    <section className="rounded-lg border border-[#CBDFD4] bg-white p-5 shadow-[0_4px_24px_rgba(232,25,122,0.08)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-[#CBDFD4] bg-[#E7F0E9] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#114F3B]">
            <Compass size={14} />
            Career North Star
          </p>
          <h2 className="mt-3 text-2xl font-bold text-[#1E2A44]">{summary?.target_role ?? "Career GPS roadmap"}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B7280]">
            {summary?.career_ambition ?? "Complete your Career North Star setup to personalize roadmap generation."}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
          <div className="rounded-lg bg-[#F6F1E4] p-3">
            <p className="text-xs font-bold uppercase text-[#9CA3AF]">Industry</p>
            <p className="mt-1 text-sm font-bold text-[#B08A44]">{summary?.target_industry ?? "Not set"}</p>
          </div>
          <div className="rounded-lg bg-[#E7F0E9] p-3">
            <p className="text-xs font-bold uppercase text-[#9CA3AF]">Timeline</p>
            <p className="mt-1 text-sm font-bold text-[#17694F]">
              {summary?.target_timeline_months ? `${summary.target_timeline_months} months` : "Flexible"}
            </p>
          </div>
          <div className="rounded-lg bg-[#E7F0E9] p-3">
            <p className="text-xs font-bold uppercase text-[#9CA3AF]">Setup</p>
            <p className="mt-1 text-sm font-bold text-[#114F3B]">
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
    <section className="rounded-lg bg-[#1E2A44] p-5 text-white shadow-[0_8px_48px_rgba(26,16,51,0.18)]">
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
        selected ? `${tone.border} ring-2 ring-[#B08A44]/20` : "border-[#EAE3D3] hover:border-[#DFD6BE]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${tone.bg} ${tone.accent} ${tone.border}`}>
          <Route size={14} />
          {tone.label}
        </span>
        <span className="rounded-full bg-[#F7F3EA] px-2 py-1 text-xs font-bold text-[#6B7280]">
          {scoreLabel(route.score)}
        </span>
      </div>
      <h3 className="mt-4 text-lg font-bold text-[#1E2A44]">{route.target_occupation.title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#6B7280]">{route.summary}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-[#FFFFFF] p-3">
          <p className="text-xs font-bold uppercase text-[#9CA3AF]">Estimated timeline</p>
          <p className="mt-1 text-sm font-bold text-[#1E2A44]">{route.estimated_months} months</p>
        </div>
        <div className="rounded-lg bg-[#FFFFFF] p-3">
          <p className="text-xs font-bold uppercase text-[#9CA3AF]">Confidence</p>
          <p className="mt-1 text-sm font-bold text-[#1E2A44]">{scoreLabel(route.score)}</p>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        <ScoreBar label="Lifestyle fit" score={lifestyle} />
        <ScoreBar label="Skill readiness" score={skill} />
        <ScoreBar label="Market opportunity" score={market} />
      </div>
      <div className="mt-4 grid gap-3 text-xs font-semibold text-[#6B7280]">
        <p>
          <span className="font-bold text-[#17694F]">Advantage:</span> {advantage?.label ?? "Overall fit"}{" "}
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
    <section className="rounded-lg border border-[#EAE3D3] bg-white p-5 shadow-[0_4px_24px_rgba(232,25,122,0.08)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-[#E3D8BC] bg-[#F6F1E4] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#B08A44]">
            <GitBranch size={14} />
            Visual roadmap
          </p>
          <h2 className="mt-3 text-2xl font-bold text-[#1E2A44]">{route.title}</h2>
        </div>
        <div className="rounded-lg bg-[#FFFFFF] px-4 py-3">
          <p className="text-xs font-bold uppercase text-[#9CA3AF]">Progress</p>
          <p className="mt-1 text-lg font-bold text-[#B08A44]">{progressPercent(progress, route)}%</p>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto pb-2">
        <div className="relative grid min-w-[760px] grid-cols-4 gap-4">
          <div className="absolute left-[12%] right-[12%] top-9 h-1 rounded-full bg-[#DFD6BE]" />
          <article className="relative rounded-lg border border-[#CBDFD4] bg-[#EFF5F0] p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#17694F] text-white">
              <Target size={18} />
            </div>
            <p className="mt-4 text-xs font-bold uppercase text-[#114F3B]">Target role</p>
            <h3 className="mt-1 text-sm font-bold text-[#1E2A44]">{route.target_occupation.title}</h3>
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
                  active ? "border-[#B08A44] ring-2 ring-[#B08A44]/20" : "border-[#EAE3D3]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectMilestone(milestone)}
                  className="block w-full text-left"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      status === "completed" ? "bg-[#17694F]" : status === "in_progress" ? "bg-[#B08A44]" : "bg-[#17694F]"
                    } text-white`}
                  >
                    {milestone.sequence}
                  </div>
                  <p className="mt-4 text-xs font-bold uppercase text-[#9CA3AF]">Milestone {milestone.sequence}</p>
                  <h3 className="mt-1 min-h-10 text-sm font-bold text-[#1E2A44]">{milestone.title}</h3>
                  <p className="mt-2 text-xs font-semibold text-[#6B7280]">{milestone.duration_weeks ?? 4} weeks</p>
                  <p className="mt-1 text-xs font-semibold text-[#6B7280]">Readiness: {readinessFromRoute(route)}%</p>
                  <p className="mt-1 text-xs font-semibold text-[#6B7280]">Status: {statusLabel(status)}</p>
                  <p className="mt-2 text-xs font-bold text-[#B08A44]">Gap: {missingRequirement(milestone, route)}</p>
                </button>
                <div className="mt-4 grid gap-2">
                  {(["planned", "in_progress", "completed"] as ProgressStatus[]).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => onSetStatus(milestone, item)}
                      className={`rounded-lg border px-2 py-1.5 text-xs font-bold ${
                        status === item
                          ? "border-[#B08A44] bg-[#F6F1E4] text-[#B08A44]"
                          : "border-[#EAE3D3] bg-white text-[#6B7280]"
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
    <aside className="rounded-lg border border-[#EAE3D3] bg-white p-5 shadow-[0_4px_24px_rgba(232,25,122,0.08)]">
      <p className="inline-flex items-center gap-2 rounded-full border border-[#CBDFD4] bg-[#E7F0E9] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#114F3B]">
        <Map size={14} />
        Milestone detail
      </p>
      <h2 className="mt-3 text-xl font-bold text-[#1E2A44]">{active?.title ?? route.target_occupation.title}</h2>
      <div className="mt-4 grid gap-3">
        {detailLabels.map((label) => (
          <div key={label} className="rounded-lg bg-[#FFFFFF] p-3">
            <p className="text-xs font-bold uppercase text-[#9CA3AF]">{label}</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-[#1E2A44]">{detailMap[label as keyof typeof detailMap]}</p>
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
    <section className="rounded-lg border border-[#EAE3D3] bg-white p-5 shadow-[0_4px_24px_rgba(232,25,122,0.08)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-[#DFD6BE] bg-[#E7F0E9] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#17694F]">
            <Gauge size={14} />
            Skills and readiness
          </p>
          <h2 className="mt-3 text-2xl font-bold text-[#1E2A44]">{readiness}% skill readiness</h2>
        </div>
        <div className="rounded-lg bg-[#FFFFFF] px-4 py-3">
          <p className="text-xs font-bold uppercase text-[#9CA3AF]">Missing skills</p>
          <p className="mt-1 text-lg font-bold text-[#B08A44]">{missing.length}</p>
        </div>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-3 sm:grid-cols-2">
          {missing.length ? (
            missing.map((gap) => (
              <article key={`${gap.skill_name}-${gap.priority}`} className="rounded-lg border border-[#EAE3D3] bg-[#FFFFFF] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-[#1E2A44]">{gap.skill_name}</p>
                    <p className="mt-1 text-xs font-bold uppercase text-[#9CA3AF]">{gap.skill_type}</p>
                  </div>
                  <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-[#B08A44]">P{gap.priority}</span>
                </div>
                <p className="mt-3 text-sm font-semibold text-[#6B7280]">Target level: {gap.proficiency_level}</p>
              </article>
            ))
          ) : (
            <article className="rounded-lg border border-[#CBDFD4] bg-[#EFF5F0] p-4 text-sm font-bold text-[#17694F]">
              No major skill gap was identified for this route.
            </article>
          )}
        </div>
        <div className="space-y-3 rounded-lg border border-[#EAE3D3] bg-[#FFFFFF] p-4">
          <ScoreBar label="Goal fit" score={metricValue(route, "goal_fit")} />
          <ScoreBar label="Skill fit" score={metricValue(route, "skill_fit")} />
          <ScoreBar label="Lifestyle fit" score={metricValue(route, "lifestyle_fit")} />
          <ScoreBar label="Career risk fit" score={metricValue(route, "career_risk")} />
        </div>
      </div>
    </section>
  );
}

function WhatIfSimulator({
  roadmap,
  preview,
  isPreviewing,
  isApplying,
  onPreview,
  onApply,
  onClear,
}: {
  roadmap: CareerGpsRoadmap;
  preview: CareerGpsWhatIfPreview | null;
  isPreviewing: boolean;
  isApplying: boolean;
  onPreview: (payload: CareerGpsWhatIfScenarioPayload) => void;
  onApply: (payload: CareerGpsWhatIfScenarioPayload) => void;
  onClear: () => void;
}) {
  const [scenarioName, setScenarioName] = useState("");
  const [adjustments, setAdjustments] = useState<CareerGpsScenarioCode[]>(["prioritise_salary"]);
  const [targetCountry, setTargetCountry] = useState("Singapore");
  const [targetIndustry, setTargetIndustry] = useState("data");
  const [targetRetirementAge, setTargetRetirementAge] = useState("50");
  const [targetTimelineMonths, setTargetTimelineMonths] = useState("18");

  const currentRecommended = recommendedRoute(roadmap);
  const previewRecommended = preview ? recommendedRoute(preview.preview_roadmap) : null;

  const hasAdjustment = (code: CareerGpsScenarioCode) => adjustments.includes(code);
  const toggleAdjustment = (code: CareerGpsScenarioCode) => {
    setAdjustments((current) => (current.includes(code) ? current.filter((item) => item !== code) : [...current, code]));
  };
  const numberOrNull = (value: string) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  };
  const payload = (): CareerGpsWhatIfScenarioPayload => ({
    scenario_name: scenarioName.trim() || null,
    adjustments,
    target_country: hasAdjustment("relocate_country") ? targetCountry.trim() || null : null,
    target_industry: hasAdjustment("change_industry") ? targetIndustry.trim() || null : null,
    target_retirement_age: hasAdjustment("retire_earlier") ? numberOrNull(targetRetirementAge) : null,
    target_timeline_months: hasAdjustment("retire_earlier") ? numberOrNull(targetTimelineMonths) : null,
  });
  const changedCount = preview?.comparison.changes.filter((change) => change.changed).length ?? 0;

  return (
    <section className="rounded-lg border border-[#EAE3D3] bg-white p-5 shadow-[0_4px_24px_rgba(232,25,122,0.08)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-[#E3D8BC] bg-[#F6F1E4] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#B08A44]">
            <SlidersHorizontal size={14} />
            What-if Career Simulator
          </p>
          <h2 className="mt-3 text-2xl font-bold text-[#1E2A44]">Preview a scenario before changing your roadmap</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B7280]">
            Scenario previews use the deterministic Career GPS engine with temporary preference changes. Applying a scenario saves it as the next roadmap version.
          </p>
        </div>
        <div className="rounded-lg bg-[#FFFFFF] px-4 py-3">
          <p className="text-xs font-bold uppercase text-[#9CA3AF]">Active version</p>
          <p className="mt-1 text-lg font-bold text-[#1E2A44]">Version {roadmap.version}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <label className="block">
            <span className="text-xs font-bold uppercase text-[#9CA3AF]">Scenario name</span>
            <input
              value={scenarioName}
              onChange={(event) => setScenarioName(event.target.value)}
              placeholder="Optional"
              className="mt-2 w-full rounded-lg border border-[#EAE3D3] bg-white px-3 py-2 text-sm font-semibold text-[#1E2A44] outline-none focus:border-[#B08A44]"
            />
          </label>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {scenarioOptions.map((option) => {
              const active = hasAdjustment(option.code);
              return (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => toggleAdjustment(option.code)}
                  className={`min-h-[118px] rounded-lg border p-3 text-left transition ${
                    active ? "border-[#B08A44] bg-[#F6F1E4] ring-2 ring-[#B08A44]/15" : "border-[#EAE3D3] bg-[#FFFFFF] hover:border-[#DFD6BE]"
                  }`}
                >
                  <span className={`inline-flex h-5 w-5 items-center justify-center rounded border ${active ? "border-[#B08A44] bg-[#B08A44]" : "border-[#DFD6BE] bg-white"}`}>
                    {active && <CheckCircle2 size={14} className="text-white" />}
                  </span>
                  <p className="mt-3 text-sm font-bold text-[#1E2A44]">{option.label}</p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-[#6B7280]">{option.description}</p>
                </button>
              );
            })}
          </div>

          {(hasAdjustment("relocate_country") || hasAdjustment("change_industry") || hasAdjustment("retire_earlier")) && (
            <div className="grid gap-3 rounded-lg border border-[#EAE3D3] bg-[#FFFFFF] p-4 md:grid-cols-2 xl:grid-cols-4">
              {hasAdjustment("relocate_country") && (
                <label className="block">
                  <span className="text-xs font-bold uppercase text-[#9CA3AF]">Relocation country</span>
                  <input
                    value={targetCountry}
                    onChange={(event) => setTargetCountry(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-[#EAE3D3] bg-white px-3 py-2 text-sm font-semibold text-[#1E2A44] outline-none focus:border-[#B08A44]"
                  />
                </label>
              )}
              {hasAdjustment("change_industry") && (
                <label className="block">
                  <span className="text-xs font-bold uppercase text-[#9CA3AF]">Target industry</span>
                  <select
                    value={targetIndustry}
                    onChange={(event) => setTargetIndustry(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-[#EAE3D3] bg-white px-3 py-2 text-sm font-semibold text-[#1E2A44] outline-none focus:border-[#B08A44]"
                  >
                    <option value="technology">Technology</option>
                    <option value="data">Data</option>
                    <option value="project-management">Project management</option>
                  </select>
                </label>
              )}
              {hasAdjustment("retire_earlier") && (
                <>
                  <label className="block">
                    <span className="text-xs font-bold uppercase text-[#9CA3AF]">Retirement age</span>
                    <input
                      value={targetRetirementAge}
                      type="number"
                      min={45}
                      max={80}
                      onChange={(event) => setTargetRetirementAge(event.target.value)}
                      className="mt-2 w-full rounded-lg border border-[#EAE3D3] bg-white px-3 py-2 text-sm font-semibold text-[#1E2A44] outline-none focus:border-[#B08A44]"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold uppercase text-[#9CA3AF]">Timeline months</span>
                    <input
                      value={targetTimelineMonths}
                      type="number"
                      min={1}
                      max={480}
                      onChange={(event) => setTargetTimelineMonths(event.target.value)}
                      className="mt-2 w-full rounded-lg border border-[#EAE3D3] bg-white px-3 py-2 text-sm font-semibold text-[#1E2A44] outline-none focus:border-[#B08A44]"
                    />
                  </label>
                </>
              )}
            </div>
          )}
        </div>

        <aside className="space-y-3 rounded-lg border border-[#EAE3D3] bg-[#FFFFFF] p-4">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase text-[#6B7280]">
            <HelpCircle size={14} />
            Current recommended route
          </p>
          <h3 className="text-lg font-bold text-[#1E2A44]">{currentRecommended?.target_occupation.title ?? "No route"}</h3>
          <ScoreBar label="Route score" score={currentRecommended?.score ?? 0} />
          <ScoreBar label="Skill fit" score={currentRecommended ? metricValue(currentRecommended, "skill_fit") : 0} />
          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={() => onPreview(payload())}
              disabled={!adjustments.length || isPreviewing || isApplying}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1E2A44] px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPreviewing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              Preview scenario
            </button>
            <button
              type="button"
              onClick={onClear}
              disabled={!preview || isPreviewing || isApplying}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#DFD6BE] bg-white px-4 py-2.5 text-sm font-bold text-[#17694F] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Clear preview
            </button>
          </div>
        </aside>
      </div>

      {preview && (
        <div className="mt-5 grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="rounded-lg border border-[#CBDFD4] bg-[#EFF5F0] p-4">
            <p className="text-xs font-bold uppercase text-[#114F3B]">Preview recommended route</p>
            <h3 className="mt-2 text-xl font-bold text-[#1E2A44]">{previewRecommended?.target_occupation.title ?? "No route"}</h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#6B7280]">
              {preview.scenario.scenario_name} previews version {preview.comparison.preview_version}.
            </p>
            <div className="mt-4 space-y-3">
              <ScoreBar label="Preview route score" score={previewRecommended?.score ?? 0} />
              <ScoreBar label="Preview roadmap fit" score={preview.preview_roadmap.fit_score} />
            </div>
            <p className="mt-4 rounded-lg bg-white p-3 text-xs font-bold text-[#17694F]">
              {changedCount} of {preview.comparison.changes.length} comparison areas changed.
            </p>
            <button
              type="button"
              onClick={() => onApply(payload())}
              disabled={isApplying || isPreviewing}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#B08A44] px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isApplying ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              Apply Scenario
            </button>
          </aside>

          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {preview.comparison.changes.map((change) => (
                <article
                  key={change.category}
                  className={`rounded-lg border p-4 ${change.changed ? "border-[#E3D8BC] bg-[#F6F1E4]" : "border-[#EAE3D3] bg-white"}`}
                >
                  <p className={`text-xs font-bold uppercase ${change.changed ? "text-[#B08A44]" : "text-[#9CA3AF]"}`}>
                    {change.changed ? "Changed" : "No change"}
                  </p>
                  <h3 className="mt-2 text-sm font-bold text-[#1E2A44]">{change.label}</h3>
                  <div className="mt-3 grid gap-2 text-xs font-semibold leading-5 text-[#6B7280]">
                    <p>
                      <span className="font-bold text-[#1E2A44]">Current:</span> {change.before}
                    </p>
                    <p>
                      <span className="font-bold text-[#1E2A44]">Preview:</span> {change.after}
                    </p>
                  </div>
                  <p className="mt-3 text-xs font-semibold leading-5 text-[#6B7280]">{change.explanation}</p>
                </article>
              ))}
            </div>
            <div className="rounded-lg border border-[#EAE3D3] bg-white p-4">
              <p className="text-xs font-bold uppercase text-[#9CA3AF]">Why the preview changed</p>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {preview.scenario.applied_overrides.map((override) => (
                  <p key={override} className="rounded-lg bg-[#FFFFFF] p-3 text-xs font-bold leading-5 text-[#6B7280]">
                    {override}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

const careerBuddyPrompts = [
  "Why was this route recommended?",
  "What should I do in the next 90 days?",
  "What skill is holding me back?",
  "Can I reach the target without becoming a manager?",
  "What happens if I move to Singapore?",
  "Show me a more balanced route.",
];

function CareerBuddyPanel({
  roadmap,
  selectedRoute,
}: {
  roadmap: CareerGpsRoadmap;
  selectedRoute: CareerGpsRoute;
}) {
  const [conversation, setConversation] = useState<CareerBuddyConversation | null>(null);
  const [messages, setMessages] = useState<CareerBuddyMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);

  const loadConversation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const conversations = await getJson<CareerBuddyConversation[]>("/career-gps/career-buddy/conversations", {
        auth: true,
      });
      const latest =
        conversations.find((item) => item.roadmap_id === roadmap.roadmap_id && item.status === "active") ??
        conversations[0] ??
        null;
      if (!latest) {
        setConversation(null);
        setMessages([]);
        setProvider(null);
        setModel(null);
        return;
      }
      const detail = await getJson<CareerBuddyConversationDetail>(
        `/career-gps/career-buddy/conversations/${latest.id}`,
        { auth: true },
      );
      setConversation(detail);
      setMessages(detail.messages);
      const latestAssistantMessage = [...detail.messages].reverse().find((message) => message.sender === "assistant");
      setProvider(latestAssistantMessage?.provider ?? null);
      setModel(latestAssistantMessage?.model ?? null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load Career Buddy conversation.");
    } finally {
      setIsLoading(false);
    }
  }, [roadmap.roadmap_id]);

  useEffect(() => {
    loadConversation();
  }, [loadConversation]);

  const sendCareerBuddyMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;
    setIsSending(true);
    setError(null);
    try {
      const payload: CareerBuddyMessagePayload = {
        conversation_id: conversation?.id ?? null,
        roadmap_id: roadmap.roadmap_id,
        route_type: selectedRoute.route_type,
        message: trimmed,
      };
      const reply = await postJson<CareerBuddyReply, CareerBuddyMessagePayload>(
        "/career-gps/career-buddy/messages",
        payload,
        { auth: true },
      );
      setConversation(reply.conversation);
      setMessages((current) => [...current, reply.user_message, reply.assistant_message]);
      setProvider(reply.provider);
      setModel(reply.model ?? reply.assistant_message.model);
      setRemaining(reply.rate_limit_remaining);
      setDraft("");
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Unable to send Career Buddy message.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className="rounded-lg border border-[#EAE3D3] bg-white p-5 shadow-[0_4px_24px_rgba(232,25,122,0.08)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-[#DFD6BE] bg-[#E7F0E9] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#17694F]">
            <Bot size={14} />
            Career Buddy
          </p>
          <h2 className="mt-3 text-2xl font-bold text-[#1E2A44]">Ask about this roadmap</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B7280]">
            Career Buddy uses your stored roadmap, selected route, skill gaps, milestones, and preferences. It does not replace deterministic Career GPS scoring.
          </p>
        </div>
        <div className="rounded-lg bg-[#FFFFFF] px-4 py-3">
          <p className="text-xs font-bold uppercase text-[#9CA3AF]">Context route</p>
          <p className="mt-1 text-sm font-bold text-[#1E2A44]">{selectedRoute.target_occupation.title}</p>
        </div>
      </div>

      {error && (
        <div className="mt-4">
          <InfoAlert tone="error">{error}</InfoAlert>
        </div>
      )}

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_310px]">
        <div className="rounded-lg border border-[#EAE3D3] bg-[#FFFFFF]">
          <div className="max-h-[430px] min-h-[280px] space-y-3 overflow-y-auto p-4">
            {isLoading ? (
              <div className="flex items-center gap-2 text-sm font-bold text-[#6B7280]">
                <Loader2 size={16} className="animate-spin text-[#B08A44]" />
                Loading Career Buddy...
              </div>
            ) : messages.length ? (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "employee" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[86%] rounded-lg px-3 py-2 text-sm leading-6 ${
                      message.sender === "employee"
                        ? "bg-[#B08A44] text-white"
                        : "border border-[#EAE3D3] bg-white text-[#1E2A44]"
                    }`}
                  >
                    <p>{message.content}</p>
                    {message.sender === "assistant" && message.provider && (
                      <p className="mt-2 text-[11px] font-bold uppercase text-[#9CA3AF]">
                        Provider: {message.provider}
                        {message.model ? ` / ${message.model}` : ""}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-[#CBDFD4] bg-[#EFF5F0] p-4 text-sm font-semibold leading-6 text-[#17694F]">
                Ask Career Buddy about the recommended route, 90-day plan, skill blockers, management constraints, relocation, or balanced options.
              </div>
            )}
            {isSending && (
              <div className="flex justify-start">
                <p className="inline-flex items-center gap-2 rounded-lg border border-[#EAE3D3] bg-white px-3 py-2 text-sm font-bold text-[#6B7280]">
                  <Loader2 size={15} className="animate-spin text-[#B08A44]" />
                  Career Buddy is thinking...
                </p>
              </div>
            )}
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              sendCareerBuddyMessage(draft);
            }}
            className="flex items-center gap-2 border-t border-[#EAE3D3] bg-white p-3"
          >
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask about your route..."
              className="min-h-11 flex-1 rounded-lg border border-[#DFD6BE] px-3 text-sm font-semibold text-[#1E2A44] outline-none placeholder:text-[#9CA3AF] focus:border-[#B08A44]"
            />
            <button
              type="submit"
              disabled={!draft.trim() || isSending}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#17694F] text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Send message to Career Buddy"
            >
              {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </form>
        </div>

        <aside className="space-y-3 rounded-lg border border-[#EAE3D3] bg-white p-4">
          <p className="text-xs font-bold uppercase text-[#9CA3AF]">Quick questions</p>
          <div className="grid gap-2">
            {careerBuddyPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => sendCareerBuddyMessage(prompt)}
                disabled={isSending}
                className="rounded-lg border border-[#DFD6BE] bg-[#FFFFFF] px-3 py-2 text-left text-xs font-bold leading-5 text-[#17694F] hover:border-[#B08A44] hover:text-[#B08A44] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {prompt}
              </button>
            ))}
          </div>
          <div className="rounded-lg bg-[#FFFFFF] p-3 text-xs font-semibold leading-5 text-[#6B7280]">
            <p>
              Provider: <span className="font-bold text-[#1E2A44]">{provider ?? "template or configured backend AI"}</span>
            </p>
            {model && (
              <p className="mt-1">
                Model: <span className="font-bold text-[#1E2A44]">{model}</span>
              </p>
            )}
            {remaining !== null && (
              <p className="mt-1">
                Messages left this hour: <span className="font-bold text-[#1E2A44]">{remaining}</span>
              </p>
            )}
          </div>
        </aside>
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
  const [isPreviewingScenario, setIsPreviewingScenario] = useState(false);
  const [isApplyingScenario, setIsApplyingScenario] = useState(false);
  const [whatIfPreview, setWhatIfPreview] = useState<CareerGpsWhatIfPreview | null>(null);
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
        setWhatIfPreview(null);
        setSelectedRouteType(latest.routes[0]?.route_type ?? "recommended");
        setSelectedMilestoneKey(latest.routes[0]?.milestones[0] ? `${latest.routes[0].route_type}-${latest.routes[0].milestones[0].sequence}` : null);
      } catch {
        setRoadmap(null);
        setWhatIfPreview(null);
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
      setWhatIfPreview(null);
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

  const previewScenario = async (payload: CareerGpsWhatIfScenarioPayload) => {
    setIsPreviewingScenario(true);
    setError(null);
    setMessage(null);
    try {
      const preview = await postJson<CareerGpsWhatIfPreview, CareerGpsWhatIfScenarioPayload>(
        "/career-gps/roadmaps/what-if/preview",
        payload,
        { auth: true },
      );
      setWhatIfPreview(preview);
      setMessage(`Preview ready for ${preview.scenario.scenario_name}.`);
    } catch (previewError) {
      setError(previewError instanceof Error ? previewError.message : "Unable to preview what-if scenario.");
    } finally {
      setIsPreviewingScenario(false);
    }
  };

  const applyScenario = async (payload: CareerGpsWhatIfScenarioPayload) => {
    setIsApplyingScenario(true);
    setError(null);
    setMessage(null);
    try {
      const response = await postJson<
        { applied_roadmap: CareerGpsRoadmap; message: string },
        CareerGpsWhatIfScenarioPayload
      >("/career-gps/roadmaps/what-if/apply", payload, { auth: true });
      setRoadmap(response.applied_roadmap);
      setSelectedRouteType(response.applied_roadmap.routes[0]?.route_type ?? "recommended");
      setSelectedMilestoneKey(
        response.applied_roadmap.routes[0]?.milestones[0]
          ? `${response.applied_roadmap.routes[0].route_type}-${response.applied_roadmap.routes[0].milestones[0].sequence}`
          : null,
      );
      setProgress({});
      setWhatIfPreview(null);
      setMessage(response.message);
    } catch (applyError) {
      setError(applyError instanceof Error ? applyError.message : "Unable to apply what-if scenario.");
    } finally {
      setIsApplyingScenario(false);
    }
  };

  if (isLoading) {
    return (
      <section id="career-gps-roadmap" className="rounded-lg border border-[#EAE3D3] bg-white p-5 shadow-[0_4px_24px_rgba(232,25,122,0.08)]">
        <div className="flex items-center gap-3 text-sm font-bold text-[#6B7280]">
          <Loader2 size={18} className="animate-spin text-[#B08A44]" />
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
        <section className="rounded-lg border border-[#EAE3D3] bg-white p-6 text-center shadow-[0_4px_24px_rgba(232,25,122,0.08)]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-[#F6F1E4] text-[#B08A44]">
            <BarChart3 size={22} />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-[#1E2A44]">Generate your Career GPS roadmap</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]">
            Career GPS will use your saved North Star, skills, lifestyle priorities, constraints, and illustrative occupation data.
          </p>
          <button
            type="button"
            onClick={generateRoadmap}
            disabled={isGenerating}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-[#1E2A44] px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            Generate roadmap
          </button>
        </section>
      )}

      {roadmap && selectedRoute && (
        <>
          <div className="flex flex-col gap-3 rounded-lg border border-[#EAE3D3] bg-white p-4 shadow-[0_4px_24px_rgba(232,25,122,0.08)] sm:flex-row sm:items-center sm:justify-between">
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
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#DFD6BE] bg-white px-4 py-2.5 text-sm font-bold text-[#17694F] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              Regenerate
            </button>
          </div>

          <NextBestActionCard roadmap={roadmap} />

          <WhatIfSimulator
            roadmap={roadmap}
            preview={whatIfPreview}
            isPreviewing={isPreviewingScenario}
            isApplying={isApplyingScenario}
            onPreview={previewScenario}
            onApply={applyScenario}
            onClear={() => setWhatIfPreview(null)}
          />

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

          <CareerBuddyPanel roadmap={roadmap} selectedRoute={selectedRoute} />

          <InfoAlert tone="info">{roadmap.source_note}</InfoAlert>
        </>
      )}
    </section>
  );
}
