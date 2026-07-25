"use client";

import type { ElementType } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  FileText,
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
  High: "bg-[#F1EDE0] text-[#17694F] border-[#DFD6BE]",
  Medium: "bg-[#E7F0E9] text-[#17694F] border-[#CBDFD4]",
};

const impactStyles: Record<string, string> = {
  High: "text-[#B08A44]",
  "Medium-High": "text-[#17694F]",
  Medium: "text-[#17694F]",
};

const actionVisuals: Record<string, { icon: ElementType; accent: string }> = {
  Hire: {
    icon: BriefcaseBusiness,
    accent: "text-[#B08A44] bg-[#F6F1E4]",
  },
  Upskill: {
    icon: GraduationCap,
    accent: "text-[#17694F] bg-[#F1EDE0]",
  },
  Mobility: {
    icon: Repeat2,
    accent: "text-[#17694F] bg-[#E7F0E9]",
  },
  Automate: {
    icon: Zap,
    accent: "text-[#8B7434] bg-[#F6F1E4]",
  },
  Retain: {
    icon: Sparkles,
    accent: "text-[#B08A44] bg-[#F6F1E4]",
  },
};

const reportPrintDocumentStyles = `
  @page { margin: 14mm; size: A4; }
  body { margin: 0; background: #FFFFFF; color: #1E2A44; font-family: Arial, sans-serif; line-height: 1.45; }
  #action-engine-pdf-report { display: block; width: 100%; background: #FFFFFF; color: #1E2A44; }
  #action-engine-pdf-report article { max-width: 760px; margin: 0 auto; }
  #action-engine-pdf-report header {
    border: 1px solid #EAE3D3;
    border-top: 7px solid #B08A44;
    border-radius: 14px;
    padding: 18px;
    margin-bottom: 14px;
    background: #FFFFFF;
  }
  #action-engine-pdf-report .report-brand { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; }
  #action-engine-pdf-report .report-logo-img { display: block; width: 86px; height: auto; }
  #action-engine-pdf-report .report-kicker {
    margin: 0 0 6px; color: #B08A44; font-size: 11px; font-weight: 800;
    letter-spacing: 0.08em; text-transform: uppercase;
  }
  #action-engine-pdf-report .report-title-row { display: flex; align-items: flex-end; justify-content: space-between; gap: 18px; }
  #action-engine-pdf-report .report-date-card {
    min-width: 116px; border-radius: 10px; background: #FFFFFF; border: 1px solid #EAE3D3; padding: 10px; text-align: right;
  }
  #action-engine-pdf-report .report-date-card span {
    display: block; color: #6B7280; font-size: 10px; font-weight: 800; text-transform: uppercase;
  }
  #action-engine-pdf-report .report-date-card strong { display: block; color: #1E2A44; font-size: 12px; margin-top: 4px; }
  #action-engine-pdf-report h1 { margin: 0; font-size: 28px; line-height: 1.15; }
  #action-engine-pdf-report .report-section {
    border: 1px solid #EAE3D3; border-radius: 12px; padding: 14px; margin-bottom: 12px; break-inside: avoid;
  }
  #action-engine-pdf-report .report-summary { background: #F6F1E4; border-color: #E3D8BC; }
  #action-engine-pdf-report h2 { margin: 0 0 8px; color: #1E2A44; font-size: 16px; line-height: 1.25; }
  #action-engine-pdf-report p, #action-engine-pdf-report li { font-size: 12px; }
  #action-engine-pdf-report ul, #action-engine-pdf-report ol { margin: 8px 0 0; padding-left: 18px; }
  #action-engine-pdf-report li { margin-bottom: 7px; }
  #action-engine-pdf-report .report-card-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
  #action-engine-pdf-report .report-card {
    border: 1px solid #EAE3D3; border-radius: 10px; padding: 10px; background: #FFFFFF;
  }
  #action-engine-pdf-report .report-card span {
    display: block; color: #8B7434; font-size: 10px; font-weight: 800; text-transform: uppercase;
  }
  #action-engine-pdf-report .report-card strong { display: block; margin-top: 3px; color: #1E2A44; font-size: 12px; }
  #action-engine-pdf-report .report-action-list { list-style: none; margin: 8px 0 0; padding: 0; }
  #action-engine-pdf-report .report-action-list li {
    border: 1px solid #EAE3D3; border-left: 4px solid #B08A44; border-radius: 10px; padding: 10px; margin-bottom: 9px;
  }
  #action-engine-pdf-report .report-action-meta {
    display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0;
  }
  #action-engine-pdf-report .report-chip {
    border-radius: 999px; background: #F7F3EA; color: #8B7434; font-size: 10px; font-weight: 800; padding: 4px 8px;
  }
  #action-engine-pdf-report footer {
    margin-top: 16px; border-top: 1px solid #EAE3D3; padding-top: 10px; color: #6B7280; font-size: 10px;
  }
`;

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
  const generatedOn = useMemo(() => new Date().toLocaleDateString(), []);
  const criticalActions = visibleActions.filter((action) => action.label === "Critical").length;
  const totalGapReduction = visibleActions.reduce((sum, action) => sum + (action.gapReduction ?? 0), 0);
  const actionMix = Array.from(new Set(visibleActions.map((action) => action.category)));

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

  const exportReport = () => {
    const report = document.getElementById("action-engine-pdf-report");
    if (!report) return;

    const printWindow = window.open("", "_blank", "width=900,height=1200");
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.open();
    printWindow.document.write(`<!doctype html>
      <html>
        <head>
          <title>Simploy Action Engine Report</title>
          <style>${reportPrintDocumentStyles}</style>
        </head>
        <body>
          <div id="action-engine-pdf-report">${report.innerHTML}</div>
        </body>
      </html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <main className="min-h-screen bg-[#F6F1E4] text-[#1E2A44]">
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
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#5D6470]">
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
              <p className="mt-1 font-bold text-[#17694F]">{manufacturingSimulationSummary.strongestActionMix.join(" + ")}</p>
            </div>
            <span className="rounded-full bg-[#E7F0E9] px-4 py-2 text-xs font-bold text-[#17694F]">
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
                          ["Gap cut", action.gapReduction ? `${action.gapReduction} roles` : "TBD", "text-[#17694F]"],
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
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#E7F0E9] text-[#17694F]">
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
                  ["Estimated cost", "RM 18.8M", "text-[#17694F]"],
                  ["Time horizon", "12-36 mo", "text-[#17694F]"],
                ].map(([label, value, color]) => (
                  <div key={label} className="rounded-lg border border-[#EAE3D3] bg-[#F7F3EA] p-3">
                    <p className="text-[10px] font-bold uppercase text-[#9CA3AF]">{label}</p>
                    <p className={`mt-2 text-base font-bold ${color}`}>{value}</p>
                  </div>
                ))}
              </div>


              <div className="mt-4 rounded-lg bg-[#E7F0E9] p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[#17694F]">Execution result</p>
                <div className="mt-3 space-y-3">
                  {[
                    ["Shortage reduced", "1,517 roles"],
                    ["Priority sequence", "Hire -> Upskill -> Mobility"],
                    ["Residual risk", "Senior leadership retention"],
                  ].map(([label, value]) => (
                    <div key={label} className="border-b border-white/70 pb-3 last:border-b-0 last:pb-0">
                      <p className="text-[10px] font-bold uppercase text-[#17694F]">{label}</p>
                      <p className="mt-1 text-sm font-bold leading-5 text-[#1E2A44]">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>

        <section className="mt-8 rounded-lg border border-[#1E2A44] bg-white p-5 shadow-[0_10px_36px_rgba(26,16,51,0.12)]">
          <div className="action-engine-no-print flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#1E2A44] text-white">
                <FileText size={20} />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#1E2A44]">Action report</p>
                <h2 className="mt-1 text-xl font-bold text-[#1E2A44]">Export PDF report</h2>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-[#5D6470]">
                  Creates a printable report with the workforce gap, action mix, priority plans, owners, costs,
                  timelines, and execution recommendations.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={exportReport}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#B08A44] px-4 text-sm font-bold text-white shadow-sm outline-none transition hover:bg-[#97742F] focus-visible:ring-2 focus-visible:ring-[#1E2A44] focus-visible:ring-offset-2"
            >
              <FileText size={16} />
              Export PDF Report
            </button>
          </div>

          <div id="action-engine-pdf-report" className="action-engine-print-report">
            <article>
              <header>
                <div className="report-brand">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="report-logo-img" src="/brand/simploy-logo.png" alt="Simploy" />
                  <div>
                    <p className="report-kicker">Action Engine Report</p>
                  </div>
                </div>
                <div className="report-title-row">
                  <div>
                    <h1>Workforce action plan report</h1>
                    <p>
                      Source: {simulationContext ? "Latest workforce simulator run" : "Current workforce gap signals"}
                    </p>
                  </div>
                  <div className="report-date-card">
                    <span>Generated</span>
                    <strong>{generatedOn}</strong>
                  </div>
                </div>
              </header>

              <section className="report-section report-summary">
                <h2>Execution Snapshot</h2>
                <p>
                  Action Engine turns the detected workforce gap into a prioritized execution plan across hiring,
                  upskilling, internal mobility, automation, and retention.
                </p>
                <div className="report-card-grid">
                  <div className="report-card">
                    <span>Gap detected</span>
                    <strong>{(summary?.projectedGap ?? manufacturingSimulationSummary.projectedGap).toLocaleString()} roles</strong>
                  </div>
                  <div className="report-card">
                    <span>Total plans</span>
                    <strong>{visibleActions.length}</strong>
                  </div>
                  <div className="report-card">
                    <span>Critical actions</span>
                    <strong>{criticalActions}</strong>
                  </div>
                  <div className="report-card">
                    <span>Gap reduction</span>
                    <strong>{totalGapReduction ? `${totalGapReduction.toLocaleString()} roles` : "82% potential"}</strong>
                  </div>
                </div>
              </section>

              <section className="report-section">
                <h2>Recommended Strategy</h2>
                <p>
                  Main risk: maintenance technician shortage. Recommended strategy:{" "}
                  {(actionMix.length ? actionMix : manufacturingSimulationSummary.strongestActionMix).join(" + ")}.
                </p>
                <div className="report-action-meta">
                  {actionMix.map((category) => (
                    <span key={category} className="report-chip">{category}</span>
                  ))}
                </div>
              </section>

              <section className="report-section">
                <h2>Priority Actions</h2>
                <ol className="report-action-list">
                  {visibleActions.map((action) => (
                    <li key={action.id}>
                      <strong>{action.priority}. {action.title}</strong>
                      <div className="report-action-meta">
                        <span className="report-chip">{action.category}</span>
                        <span className="report-chip">{action.label}</span>
                        <span className="report-chip">Impact: {action.impact}</span>
                        <span className="report-chip">Cost: {action.cost}</span>
                        <span className="report-chip">Timeline: {action.timeline}</span>
                      </div>
                      <p>{action.problem}</p>
                      <p>{action.recommendation}</p>
                      {(action.owner || action.gapReduction || action.confidence) && (
                        <p>
                          Owner: {action.owner ?? "HR"} / Gap reduction:{" "}
                          {action.gapReduction ? `${action.gapReduction.toLocaleString()} roles` : "TBD"} / Confidence:{" "}
                          {action.confidence ? `${action.confidence}%` : "TBD"}.
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              </section>

              <section className="report-section">
                <h2>Execution Notes</h2>
                <ul>
                  <li>Sequence the highest-risk actions first, then validate cost, owner, and delivery timeline.</li>
                  <li>Use hiring plans for hard-to-fill external roles and mobility/upskilling plans for internal pools.</li>
                  <li>Refresh the workforce simulation after major hiring, automation, or attrition assumptions change.</li>
                </ul>
              </section>

              <footer>
                Generated by Simploy Action Engine. This report is based on the currently loaded execution plan.
              </footer>
            </article>
          </div>

          <style jsx>{`
            .action-engine-print-report {
              display: none;
            }

            @media print {
              .action-engine-no-print {
                display: none !important;
              }

              .action-engine-print-report {
                display: block;
              }
            }
          `}</style>
        </section>
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
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#17694F]">
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
