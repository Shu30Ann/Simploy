"use client";

import type { ElementType } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  GraduationCap,
  Repeat2,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import SectionLabel from "@/components/ui/SectionLabel";
import { getAuthToken, getJson } from "@/lib/api";
import type { EmployerDashboardData } from "@/lib/backendTypes";
import {
  manufacturingHiringPlanDrafts,
  manufacturingInternalTalentPools,
  manufacturingRecommendations,
  manufacturingSimulationSummary,
} from "@/lib/mock-data";
import type { SimResult, SimState, SimulatorActionPlan } from "@/lib/simulator/types";

const LAST_SIMULATION_KEY = "simploy-employer-last-simulation";
const HIRING_PLAN_KEY = "simploy-employer-hiring-plan";

type LastSimulationContext = {
  savedAt: string;
  state: SimState;
  result: SimResult;
};

type ActionCard = {
  id: string;
  priority: number;
  title: string;
  category: SimulatorActionPlan["category"];
  problem: string;
  recommendation: string;
  impact: SimulatorActionPlan["impact"];
  cost: string;
  timeline: string;
  buttonLabel: string;
  label: SimulatorActionPlan["priority"];
  owner?: string;
  gapReduction?: number;
  confidence?: number;
  linkedRoles?: string[];
  nextStep?: string;
};

const actions: ActionCard[] = [
  ...manufacturingRecommendations.map((item, index) => ({
    id: item.id,
    priority: index + 1,
    title: item.title,
    category: item.category,
    problem: item.problem,
    recommendation: item.recommendation,
    impact: item.impact,
    cost: item.estimatedCost,
    timeline: item.timeline,
    buttonLabel:
      item.category === "Hire" ? "Create Hiring Plan" :
      item.category === "Upskill" ? "Generate Learning Path" :
      item.category === "Mobility" ? "View Transition Pool" :
      item.category === "Automate" ? "View Automation Plan" : "Create Retention Plan",
    label: item.priority,
  })),
];
function actionFromPlan(item: SimulatorActionPlan, index: number): ActionCard {
  return {
    id: item.id,
    priority: index + 1,
    title: item.title,
    category: item.category,
    problem: item.problem,
    recommendation: item.recommendation,
    impact: item.impact,
    cost: item.estimatedCost,
    timeline: item.timeline,
    buttonLabel:
      item.category === "Hire" ? "Create Hiring Plan" :
      item.category === "Upskill" ? "Generate Learning Path" :
      item.category === "Mobility" ? "View Transition Pool" :
      item.category === "Automate" ? "View Automation Plan" : "Create Retention Plan",
    label: item.priority,
    owner: item.owner,
    gapReduction: item.gapReduction,
    confidence: item.confidence,
    linkedRoles: item.linkedRoles,
    nextStep: item.nextStep,
  };
}

interface RecommendationResponse {
  recommendations: Array<{
    action: string;
    target: string;
    priority: string;
    rationale: string;
  }>;
}

function actionFromRecommendation(item: RecommendationResponse["recommendations"][number], index: number): ActionCard {
  const categoryByAction: Record<string, ActionCard["category"]> = {
    hire: "Hire",
    retrain: "Upskill",
    monitor: "Retain",
    automate: "Automate",
    outsource: "Mobility",
  };
  const category = categoryByAction[item.action] ?? "Retain";
  return {
    id: `${item.action}-${item.target}-${index}`,
    priority: index + 1,
    title: item.target,
    category,
    problem: item.rationale,
    recommendation: `${category} action recommended for ${item.target}.`,
    impact: item.priority === "high" ? "High" : item.priority === "medium" ? "Medium-High" : "Medium",
    cost: "TBD",
    timeline: item.priority === "high" ? "90 days" : "6 months",
    buttonLabel: category === "Hire" ? "Create Hiring Plan" : category === "Upskill" ? "Generate Learning Path" : "Open Plan",
    label: item.priority === "high" ? "Critical" : item.priority === "medium" ? "High" : "Medium",
  };
}

const filters = ["All", "Hire", "Upskill", "Mobility", "Automate", "Retain"];

const labelStyles: Record<string, string> = {
  Critical: "bg-[#F6F1E4] text-[#B08A44] border-[#E3D8BC]",
  High: "bg-[#F1EDE0] text-[#6B46C1] border-[#DFD6BE]",
  Medium: "bg-[#E7F0E9] text-[#087C7E] border-[#CBDFD4]",
};

const impactStyles: Record<string, string> = {
  High: "text-[#B08A44]",
  "Medium-High": "text-[#087C7E]",
  Medium: "text-[#6B46C1]",
};

const actionVisuals: Record<string, { icon: ElementType; accent: string }> = {
  Hire: {
    icon: BriefcaseBusiness,
    accent: "text-[#B08A44] bg-[#F6F1E4]",
  },
  Upskill: {
    icon: GraduationCap,
    accent: "text-[#6B46C1] bg-[#F1EDE0]",
  },
  Mobility: {
    icon: Repeat2,
    accent: "text-[#087C7E] bg-[#E7F0E9]",
  },
  Automate: {
    icon: Zap,
    accent: "text-[#C2410C] bg-[#FFF3E8]",
  },
  Retain: {
    icon: Sparkles,
    accent: "text-[#B08A44] bg-[#F6F1E4]",
  },
};

export default function ActionEnginePage() {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [dbActions, setDbActions] = useState<ActionCard[] | null>(null);
  const [simulationContext, setSimulationContext] = useState<LastSimulationContext | null>(null);
  const [selectedAction, setSelectedAction] = useState<ActionCard | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(LAST_SIMULATION_KEY);
      if (raw) {
        setSimulationContext(JSON.parse(raw) as LastSimulationContext);
      }
    } catch {
      setSimulationContext(null);
    }
  }, []);

  useEffect(() => {
    if (!getAuthToken()) return;
    getJson<EmployerDashboardData>("/dashboard/employer", { auth: true })
      .then(async (dashboard) => {
        const latest = dashboard.simulations[0];
        if (!latest) return;
        const response = await getJson<RecommendationResponse>(`/simulations/${latest.id}/actions`, { auth: true });
        setDbActions(response.recommendations.map(actionFromRecommendation));
      })
      .catch(() => setDbActions(null));
  }, []);

  const simulationActions = simulationContext?.result.actionPlans?.map(actionFromPlan);
  const visibleActions = simulationActions?.length ? simulationActions : dbActions?.length ? dbActions : actions;
  const summary = simulationContext?.result;

  const filteredActions = useMemo(
    () => visibleActions.filter((action) => selectedFilter === "All" || action.category === selectedFilter),
    [selectedFilter, visibleActions]
  );

  const openPlan = (action: ActionCard) => {
    setSelectedAction(action);
    if (action.category === "Hire") {
      const draft = manufacturingHiringPlanDrafts.find((plan) =>
        action.linkedRoles?.some((role) => plan.role.toLowerCase().includes(role.toLowerCase().split(" ")[0])),
      ) ?? manufacturingHiringPlanDrafts[0];
      window.localStorage.setItem(HIRING_PLAN_KEY, JSON.stringify({ createdAt: new Date().toISOString(), draft, sourceAction: action.title }));
    }
  };

  return (
    <main className="min-h-screen bg-[#FFF8FC] text-[#1E2A44]">
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
          <div>
            <SectionLabel>Layer 3 Execution Plan</SectionLabel>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold leading-tight text-[#1E2A44] sm:text-4xl">Action Engine</h1>
              <span className="rounded-full bg-[#F6F1E4] px-3 py-1 text-xs font-bold uppercase text-[#B08A44]">
                {visibleActions.length} plans
              </span>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#4B5563]">
              Layer 2 detected the gap. Layer 3 turns it into a prioritized execution plan.
            </p>
          </div>
        </header>

        <section className="mt-5 rounded-lg border border-[#EAE3D3] bg-white px-4 py-3 shadow-[0_8px_24px_rgba(26,16,51,0.05)]">
          <div className="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1.4fr_auto] xl:items-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#9CA3AF]">Gap detected</p>
              <p className="mt-1 font-bold text-[#1E2A44]">{(summary?.projectedGap ?? manufacturingSimulationSummary.projectedGap).toLocaleString()} roles</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#9CA3AF]">Main risk</p>
              <p className="mt-1 font-bold text-[#B08A44]">Maintenance technician shortage</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#9CA3AF]">Recommended strategy</p>
              <p className="mt-1 font-bold text-[#087C7E]">{manufacturingSimulationSummary.strongestActionMix.join(" + ")}</p>
            </div>
            <span className="rounded-full bg-[#E7F0E9] px-4 py-2 text-xs font-bold text-[#087C7E]">
              {simulationContext ? "Loaded from latest simulator run" : "Based on current gap signals"}
            </span>
          </div>
        </section>

        <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-start">
          <section className="min-w-0">
            <div className="sticky top-0 z-10 rounded-lg border border-[#EAE3D3] bg-white/95 p-3 shadow-[0_8px_22px_rgba(26,16,51,0.06)] backdrop-blur">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[#B08A44]">Action plan</p>
                  <h2 className="text-lg font-bold text-[#1E2A44]">Execution cards</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filters.map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setSelectedFilter(filter)}
                      className={`rounded-lg border px-3 py-2 text-sm font-bold transition ${
                        selectedFilter === filter
                          ? "border-[#B08A44] bg-[#B08A44] text-white shadow-[0_8px_18px_rgba(70,60,35,0.18)]"
                          : "border-[#EAE3D3] bg-white text-[#6B7280] hover:border-[#E3D8BC] hover:text-[#B08A44]"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {filteredActions.map((action) => {
                const visual = actionVisuals[action.category] ?? actionVisuals.Retain;
                const Icon = visual.icon;
                return (
                  <article
                    key={action.id}
                    className="flex min-h-[310px] flex-col rounded-lg border border-[#EAE3D3] bg-white p-4 shadow-[0_8px_24px_rgba(26,16,51,0.04)] transition hover:-translate-y-0.5 hover:border-[#E3D8BC] hover:shadow-[0_14px_34px_rgba(70,60,35,0.12)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${visual.accent}`}>
                          <Icon size={18} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-xl font-bold text-[#1E2A44]">{action.title}</h3>
                          <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[#9CA3AF]">
                            Priority {action.priority}
                          </p>
                        </div>
                      </div>
                      <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-bold ${labelStyles[action.label]}`}>
                        {action.label}
                      </span>
                    </div>

                    <p className="mt-4 text-sm font-semibold leading-6 text-[#374151]">{action.problem}</p>

                    <div className="mt-4 rounded-lg bg-[#F7F3EA] p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-[#B08A44]">Recommendation</p>
                      <p className="mt-1 text-sm leading-6 text-[#374151]">{action.recommendation}</p>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {[
                        ["Impact", action.impact, impactStyles[action.impact] || "text-[#1E2A44]"],
                        ["Cost", action.cost, "text-[#1E2A44]"],
                        ["Timeline", action.timeline, "text-[#1E2A44]"],
                      ].map(([label, value, color]) => (
                        <div key={label} className="rounded-lg border border-[#EAE3D3] bg-white p-2">
                          <p className="text-[10px] font-bold uppercase text-[#9CA3AF]">{label}</p>
                          <p className={`mt-1 text-sm font-bold ${color}`}>{value}</p>
                        </div>
                      ))}
                    </div>
                    {(action.owner || action.gapReduction || action.confidence) && (
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {[
                          ["Owner", action.owner ?? "HR", "text-[#1E2A44]"],
                          ["Gap cut", action.gapReduction ? `${action.gapReduction} roles` : "TBD", "text-[#087C7E]"],
                          ["Confidence", action.confidence ? `${action.confidence}%` : "TBD", "text-[#B08A44]"],
                        ].map(([label, value, color]) => (
                          <div key={label} className="rounded-lg bg-[#F7F3EA] p-2">
                            <p className="text-[10px] font-bold uppercase text-[#9CA3AF]">{label}</p>
                            <p className={`mt-1 truncate text-xs font-bold ${color}`}>{value}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-auto pt-5">
                      <button
                        type="button"
                        onClick={() => openPlan(action)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#B08A44] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#97742F] hover:shadow-[0_10px_22px_rgba(70,60,35,0.22)]"
                      >
                        {action.buttonLabel}
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <aside className="hidden xl:block">
            <div className="sticky top-4 rounded-lg border border-[#EAE3D3] bg-white p-5 shadow-[0_16px_42px_rgba(70,60,35,0.12)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[#B08A44]">Layer 3 Output</p>
                  <h2 className="mt-1 text-xl font-bold text-[#1E2A44]">Execution Summary</h2>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#E7F0E9] text-[#087C7E]">
                  <BarChart3 size={20} />
                </div>
              </div>

              <div className="mt-5 rounded-lg bg-[#F6F1E4] p-4">
                <p className="text-[10px] font-bold uppercase tracking-wide text-[#B08A44]">Gap reduction potential</p>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <p className="text-4xl font-bold text-[#1E2A44]">82%</p>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#B08A44]">High confidence</span>
                </div>
                <div className="mt-4 h-2 rounded-full bg-white">
                  <div className="h-2 w-[82%] rounded-full bg-[#B08A44]" />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  ["Total plans", "7", "text-[#1E2A44]"],
                  ["Critical actions", "2", "text-[#B08A44]"],
                  ["Estimated cost", "RM 18.8M", "text-[#087C7E]"],
                  ["Time horizon", "12-36 mo", "text-[#6B46C1]"],
                ].map(([label, value, color]) => (
                  <div key={label} className="rounded-lg border border-[#EAE3D3] bg-[#F7F3EA] p-3">
                    <p className="text-[10px] font-bold uppercase text-[#9CA3AF]">{label}</p>
                    <p className={`mt-2 text-base font-bold ${color}`}>{value}</p>
                  </div>
                ))}
              </div>


              <div className="mt-4 rounded-lg bg-[#E7F0E9] p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[#087C7E]">Execution result</p>
                <div className="mt-3 space-y-3">
                  {[
                    ["Shortage reduced", "1,517 roles"],
                    ["Priority sequence", "Hire -> Upskill -> Mobility"],
                    ["Residual risk", "Senior leadership retention"],
                  ].map(([label, value]) => (
                    <div key={label} className="border-b border-white/70 pb-3 last:border-b-0 last:pb-0">
                      <p className="text-[10px] font-bold uppercase text-[#087C7E]">{label}</p>
                      <p className="mt-1 text-sm font-bold leading-5 text-[#1E2A44]">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {selectedAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E2A44]/45 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-[0_24px_80px_rgba(26,16,51,0.28)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#B08A44]">{selectedAction.category} plan</p>
                <h3 className="mt-1 text-2xl font-bold text-[#1E2A44]">{selectedAction.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#5D6470]">{selectedAction.nextStep ?? selectedAction.recommendation}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAction(null)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F7F3EA]"
                aria-label="Close plan preview"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                ["Owner", selectedAction.owner ?? "HR"],
                ["Gap reduction", selectedAction.gapReduction ? `${selectedAction.gapReduction} roles` : "TBD"],
                ["Confidence", selectedAction.confidence ? `${selectedAction.confidence}%` : "TBD"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-[#EAE3D3] bg-[#F7F3EA] p-3">
                  <p className="text-[10px] font-bold uppercase text-[#9CA3AF]">{label}</p>
                  <p className="mt-1 text-sm font-bold text-[#1E2A44]">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-lg border border-[#EAE3D3] bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[#B08A44]">Execution preview</p>
              {selectedAction.category === "Hire" ? (
                <div className="mt-3 grid gap-3">
                  {manufacturingHiringPlanDrafts.slice(0, 2).map((plan) => (
                    <div key={plan.id} className="rounded-lg bg-[#F7F3EA] p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold text-[#1E2A44]">{plan.role}</p>
                          <p className="mt-1 text-xs font-semibold text-[#6B7280]">{plan.department} / {plan.targetStart}</p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#B08A44]">{plan.targetHires} hires</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[#5D6470]">{plan.successMetric}</p>
                    </div>
                  ))}
                </div>
              ) : selectedAction.category === "Mobility" || selectedAction.category === "Upskill" ? (
                <div className="mt-3 grid gap-3">
                  {manufacturingInternalTalentPools.slice(0, 3).map((pool) => (
                    <div key={pool.id} className="rounded-lg bg-[#F7F3EA] p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold text-[#1E2A44]">{pool.sourceRole} to {pool.targetRole}</p>
                          <p className="mt-1 text-xs font-semibold text-[#6B7280]">{pool.program}</p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#087C7E]">
                          {pool.employeesReadyNow + pool.employeesTrainable} people
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[#5D6470]">
                        {pool.employeesReadyNow} ready now, {pool.employeesTrainable} trainable in {pool.timeToProductive}.
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-3 rounded-lg bg-[#F7F3EA] p-4 text-sm leading-6 text-[#5D6470]">
                  Create workflow inventory, validate automation exposure, assign owner, and track savings against the simulation plan.
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <a
                href={selectedAction.category === "Hire" ? "/employer/jobs" : "/employer/action-engine"}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#B08A44] px-4 text-sm font-bold text-white"
              >
                {selectedAction.category === "Hire" ? "Open Jobs / Hiring Plan" : "Keep in Action Engine"}
                <ArrowRight size={15} />
              </a>
              <button
                type="button"
                onClick={() => setSelectedAction(null)}
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg border border-[#EAE3D3] bg-white px-4 text-sm font-bold text-[#6B7280]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
