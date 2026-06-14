"use client";

import type { ElementType } from "react";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  GraduationCap,
  Repeat2,
  Sparkles,
  Zap,
} from "lucide-react";
import SectionLabel from "@/components/ui/SectionLabel";

const actions = [
  {
    id: "hire",
    priority: 1,
    title: "Hire",
    category: "Hire",
    problem: "Engineering will face a shortage of 1,200 employees by 2030.",
    recommendation: "Hire 800 software engineers, 250 AI engineers, and 150 cybersecurity specialists.",
    impact: "High",
    cost: "RM 12M",
    timeline: "3 years",
    buttonLabel: "Create Hiring Plan",
    label: "Critical",
  },
  {
    id: "upskill",
    priority: 2,
    title: "Upskill",
    category: "Upskill",
    problem: "800 business analysts are at risk of role mismatch.",
    recommendation: "Retrain 500 analysts into AI business analysts.",
    impact: "High",
    cost: "RM 1.2M",
    timeline: "6 months",
    buttonLabel: "Generate Learning Path",
    label: "High",
  },
  {
    id: "mobility",
    priority: 3,
    title: "Internal Mobility",
    category: "Mobility",
    problem: "HR Operations has 300 surplus employees while Data Operations has a 200-person shortage.",
    recommendation: "Move 200 employees from HR Operations to Data Operations.",
    impact: "Medium-High",
    cost: "RM 400K",
    timeline: "4 months",
    buttonLabel: "View Candidates",
    label: "High",
  },
  {
    id: "automate",
    priority: 4,
    title: "Automate",
    category: "Automate",
    problem: "HR administrative tasks have 82% automation risk.",
    recommendation: "Automate payroll processing, leave approval, and document verification.",
    impact: "Medium",
    cost: "RM 800K",
    timeline: "4 months",
    buttonLabel: "View Automation Opportunities",
    label: "Medium",
  },
  {
    id: "global",
    priority: 5,
    title: "Global Talent Sourcing",
    category: "Hire",
    problem: "Local talent supply is insufficient for AI engineering roles.",
    recommendation: "Source talent from Vietnam, India, Philippines, and Indonesia.",
    impact: "High",
    cost: "RM 3M",
    timeline: "12 months",
    buttonLabel: "Explore Talent Pool",
    label: "High",
  },
  {
    id: "retention",
    priority: 6,
    title: "Retention Plan",
    category: "Retain",
    problem: "Senior engineers have high retirement and attrition risk.",
    recommendation: "Launch salary review, flexible work, mentorship, and leadership program.",
    impact: "Medium",
    cost: "RM 900K",
    timeline: "6 months",
    buttonLabel: "Create Retention Plan",
    label: "Medium",
  },
  {
    id: "succession",
    priority: 7,
    title: "Succession Planning",
    category: "Retain",
    problem: "15 engineering managers may retire within 5 years.",
    recommendation: "Identify 8 ready-now successors, 5 ready-in-2-years candidates, and 2 requiring development.",
    impact: "High",
    cost: "RM 500K",
    timeline: "2 years",
    buttonLabel: "Generate Succession Plan",
    label: "High",
  },
];

const filters = ["All", "Hire", "Upskill", "Mobility", "Automate", "Retain"];

const labelStyles: Record<string, string> = {
  Critical: "bg-[#FFF0F8] text-[#E8197A] border-[#FFD0E8]",
  High: "bg-[#F5F0FF] text-[#6B46C1] border-[#DDD0F8]",
  Medium: "bg-[#E0F9FF] text-[#087C7E] border-[#BAF3FF]",
};

const impactStyles: Record<string, string> = {
  High: "text-[#E8197A]",
  "Medium-High": "text-[#087C7E]",
  Medium: "text-[#6B46C1]",
};

const actionVisuals: Record<string, { icon: ElementType; accent: string }> = {
  Hire: {
    icon: BriefcaseBusiness,
    accent: "text-[#E8197A] bg-[#FFF0F8]",
  },
  Upskill: {
    icon: GraduationCap,
    accent: "text-[#6B46C1] bg-[#F5F0FF]",
  },
  Mobility: {
    icon: Repeat2,
    accent: "text-[#087C7E] bg-[#E0F9FF]",
  },
  Automate: {
    icon: Zap,
    accent: "text-[#C2410C] bg-[#FFF3E8]",
  },
  Retain: {
    icon: Sparkles,
    accent: "text-[#E8197A] bg-[#FFF0F8]",
  },
};

export default function ActionEnginePage() {
  const [selectedFilter, setSelectedFilter] = useState("All");

  const filteredActions = useMemo(
    () => actions.filter((action) => selectedFilter === "All" || action.category === selectedFilter),
    [selectedFilter]
  );

  return (
    <main className="min-h-screen bg-[#FFF8FC] text-[#1A1033]">
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
          <div>
            <SectionLabel>Layer 3 Execution Plan</SectionLabel>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold leading-tight text-[#1A1033] sm:text-4xl">Action Engine</h1>
              <span className="rounded-full bg-[#FFF0F8] px-3 py-1 text-xs font-bold uppercase text-[#E8197A]">
                7 plans
              </span>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#4B5563]">
              Layer 2 detected the gap. Layer 3 turns it into a prioritized execution plan.
            </p>
          </div>
        </header>

        <section className="mt-5 rounded-lg border border-[#F0EBF8] bg-white px-4 py-3 shadow-[0_8px_24px_rgba(26,16,51,0.05)]">
          <div className="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1.4fr_auto] xl:items-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#9CA3AF]">Gap detected</p>
              <p className="mt-1 font-bold text-[#1A1033]">1,850 roles</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#9CA3AF]">Main risk</p>
              <p className="mt-1 font-bold text-[#E8197A]">Engineering shortage</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#9CA3AF]">Recommended strategy</p>
              <p className="mt-1 font-bold text-[#087C7E]">Hire + Upskill + Mobility</p>
            </div>
            <span className="rounded-full bg-[#E0F9FF] px-4 py-2 text-xs font-bold text-[#087C7E]">
              Based on current gap signals
            </span>
          </div>
        </section>

        <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-start">
          <section className="min-w-0">
            <div className="sticky top-0 z-10 rounded-lg border border-[#F0EBF8] bg-white/95 p-3 shadow-[0_8px_22px_rgba(26,16,51,0.06)] backdrop-blur">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[#E8197A]">Action plan</p>
                  <h2 className="text-lg font-bold text-[#1A1033]">Execution cards</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filters.map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setSelectedFilter(filter)}
                      className={`rounded-lg border px-3 py-2 text-sm font-bold transition ${
                        selectedFilter === filter
                          ? "border-[#E8197A] bg-[#E8197A] text-white shadow-[0_8px_18px_rgba(232,25,122,0.18)]"
                          : "border-[#F0EBF8] bg-white text-[#6B7280] hover:border-[#FFD0E8] hover:text-[#E8197A]"
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
                    className="flex min-h-[310px] flex-col rounded-lg border border-[#F0EBF8] bg-white p-4 shadow-[0_8px_24px_rgba(26,16,51,0.04)] transition hover:-translate-y-0.5 hover:border-[#FFD0E8] hover:shadow-[0_14px_34px_rgba(232,25,122,0.12)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${visual.accent}`}>
                          <Icon size={18} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-xl font-bold text-[#1A1033]">{action.title}</h3>
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

                    <div className="mt-4 rounded-lg bg-[#FDFCFF] p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-[#E8197A]">Recommendation</p>
                      <p className="mt-1 text-sm leading-6 text-[#374151]">{action.recommendation}</p>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {[
                        ["Impact", action.impact, impactStyles[action.impact] || "text-[#1A1033]"],
                        ["Cost", action.cost, "text-[#1A1033]"],
                        ["Timeline", action.timeline, "text-[#1A1033]"],
                      ].map(([label, value, color]) => (
                        <div key={label} className="rounded-lg border border-[#F0EBF8] bg-white p-2">
                          <p className="text-[10px] font-bold uppercase text-[#9CA3AF]">{label}</p>
                          <p className={`mt-1 text-sm font-bold ${color}`}>{value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-auto pt-5">
                      <button className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#E8197A] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#C91569] hover:shadow-[0_10px_22px_rgba(232,25,122,0.22)]">
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
            <div className="sticky top-4 rounded-lg border border-[#F0EBF8] bg-white p-5 shadow-[0_16px_42px_rgba(232,25,122,0.12)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[#E8197A]">Layer 3 Output</p>
                  <h2 className="mt-1 text-xl font-bold text-[#1A1033]">Execution Summary</h2>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#E0F9FF] text-[#087C7E]">
                  <BarChart3 size={20} />
                </div>
              </div>

              <div className="mt-5 rounded-lg bg-[#FFF0F8] p-4">
                <p className="text-[10px] font-bold uppercase tracking-wide text-[#E8197A]">Gap reduction potential</p>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <p className="text-4xl font-bold text-[#1A1033]">82%</p>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#E8197A]">High confidence</span>
                </div>
                <div className="mt-4 h-2 rounded-full bg-white">
                  <div className="h-2 w-[82%] rounded-full bg-[#E8197A]" />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  ["Total plans", "7", "text-[#1A1033]"],
                  ["Critical actions", "2", "text-[#E8197A]"],
                  ["Estimated cost", "RM 18.8M", "text-[#087C7E]"],
                  ["Time horizon", "12-36 mo", "text-[#6B46C1]"],
                ].map(([label, value, color]) => (
                  <div key={label} className="rounded-lg border border-[#F0EBF8] bg-[#FDFCFF] p-3">
                    <p className="text-[10px] font-bold uppercase text-[#9CA3AF]">{label}</p>
                    <p className={`mt-2 text-base font-bold ${color}`}>{value}</p>
                  </div>
                ))}
              </div>


              <div className="mt-4 rounded-lg bg-[#E0F9FF] p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[#087C7E]">Execution result</p>
                <div className="mt-3 space-y-3">
                  {[
                    ["Shortage reduced", "1,517 roles"],
                    ["Priority sequence", "Hire -> Upskill -> Mobility"],
                    ["Residual risk", "Senior leadership retention"],
                  ].map(([label, value]) => (
                    <div key={label} className="border-b border-white/70 pb-3 last:border-b-0 last:pb-0">
                      <p className="text-[10px] font-bold uppercase text-[#087C7E]">{label}</p>
                      <p className="mt-1 text-sm font-bold leading-5 text-[#1A1033]">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
