"use client";

import { useMemo, useState } from "react";
import { ArrowRight, CalendarDays, CheckCircle2, CircleDot, Globe, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";
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
  Critical: "bg-[#E8197A]/10 text-[#E8197A] border-[#E8197A]/20",
  High: "bg-[#EF4444]/10 text-[#DC2626] border-[#FCA5A5]/30",
  Medium: "bg-[#F59E0B]/10 text-[#B45309] border-[#FCD34D]/30",
};

const impactStyles: Record<string, string> = {
  High: "text-[#DC2626]",
  "Medium-High": "text-[#B45309]",
  Medium: "text-[#F59E0B]",
};

export default function ActionEnginePage() {
  const [selectedFilter, setSelectedFilter] = useState("All");

  const filteredActions = useMemo(
    () => actions.filter((action) => selectedFilter === "All" || action.category === selectedFilter),
    [selectedFilter]
  );

  const totalCost = useMemo(() => {
    const costValue = actions.reduce((sum, action) => {
      const numeric = Number(action.cost.replace(/[^0-9.]/g, ""));
      return sum + (Number.isNaN(numeric) ? 0 : numeric);
    }, 0);
    return `RM ${costValue.toFixed(1)}M`;
  }, []);

  return (
    <main className="min-h-screen bg-[#F8F6FB] text-[#1F2937]">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-3xl border border-[#E8E3F1] bg-white p-8 shadow-[0_18px_64px_rgba(57,44,93,0.08)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <SectionLabel>Layer 3</SectionLabel>
              <h1 className="text-3xl font-semibold tracking-tight text-[#111827] sm:text-4xl">
                Action Engine
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#4B5563]">
                Now that we detected the workforce gap, Simploy recommends the exact strategic actions to close it.
                Review AI-recommended workforce plans and launch the next moves for hiring, upskilling, mobility, automation, retention, and succession.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="outline" className="min-w-[160px]">
                Review Simulator Output
              </Button>
              <Button className="min-w-[160px]">Open action board</Button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-[#E8E3F1] bg-white p-6 shadow-[0_12px_40px_rgba(57,44,93,0.05)]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#6D28D9]">
                    AI Workforce Strategy
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-[#111827]">Simulator-led action summary</h2>
                </div>
                <div className="rounded-3xl bg-[#F8FAFC] px-4 py-3 text-sm text-[#475569] shadow-sm">
                  <p className="font-semibold">Based on current gap signals</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-[#E9E6F8] bg-[#FAF7FF] p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#7C3AED]">Total workforce gap</p>
                  <p className="mt-3 text-3xl font-bold text-[#111827]">1,850 roles</p>
                </div>
                <div className="rounded-3xl border border-[#E6F3F9] bg-[#F0FDFF] p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#0F766E]">Estimated cost</p>
                  <p className="mt-3 text-3xl font-bold text-[#065F46]">RM 18.8M</p>
                </div>
                <div className="rounded-3xl border border-[#FEF3C7] bg-[#FFFBEB] p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#B45309]">Expected impact</p>
                  <p className="mt-3 text-3xl font-bold text-[#92400E]">High</p>
                </div>
                <div className="rounded-3xl border border-[#E8E3F1] bg-[#F8F6FB] p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#4B5563]">Recommended action count</p>
                  <p className="mt-3 text-3xl font-bold text-[#111827]">7 plans</p>
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-[#E8E3F1] bg-[#F7F3FF] p-5">
                <p className="text-sm font-semibold text-[#6B7280]">Scenario result</p>
                <p className="mt-3 text-sm leading-7 text-[#374151]">
                  The workforce simulator detected a growing talent deficit and internal imbalance across engineering, HR, and data operations. These recommendations are prioritized to reduce risk, accelerate delivery, and preserve workforce continuity.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  {[
                    "Engineering shortage",
                    "Role mismatch risk",
                    "Automation opportunity",
                    "Global sourcing needed",
                    "Retention pressure",
                  ].map((badge) => (
                    <span key={badge} className="rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-xs font-semibold text-[#475569]">
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-[#E8E3F1] bg-white p-6 shadow-[0_12px_40px_rgba(57,44,93,0.05)]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#6D28D9]">Action filter</p>
                  <h3 className="mt-2 text-xl font-semibold text-[#111827]">Refine by action type</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filters.map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setSelectedFilter(filter)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        selectedFilter === filter
                          ? "bg-[#6D28D9] text-white"
                          : "bg-[#F3F4F6] text-[#475569] hover:bg-[#EDE9FE]"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                {filteredActions.map((action) => (
                  <article key={action.id} className="overflow-hidden rounded-3xl border border-[#E8E3F1] bg-[#FAFAFC] p-6 shadow-[0_10px_24px_rgba(57,44,93,0.04)]">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold uppercase tracking-[0.24em] text-[#6B7280]">
                            Priority {action.priority}
                          </span>
                          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${labelStyles[action.label]}`}>
                            {action.label}
                          </span>
                        </div>
                        <h4 className="mt-3 text-2xl font-semibold text-[#111827]">{action.title}</h4>
                        <p className="mt-3 text-sm leading-7 text-[#4B5563]">{action.problem}</p>
                        <p className="mt-3 text-sm font-semibold text-[#111827]">Recommendation</p>
                        <p className="mt-1 text-sm leading-7 text-[#374151]">{action.recommendation}</p>
                      </div>
                      <div className="grid gap-3 text-sm text-[#374151] sm:w-64">
                        <div className="rounded-3xl bg-white p-4 shadow-sm">
                          <p className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">Impact</p>
                          <p className={`mt-2 text-lg font-semibold ${impactStyles[action.impact] || "text-[#111827]"}`}>{action.impact}</p>
                        </div>
                        <div className="rounded-3xl bg-white p-4 shadow-sm">
                          <p className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">Estimated cost</p>
                          <p className="mt-2 text-lg font-semibold text-[#111827]">{action.cost}</p>
                        </div>
                        <div className="rounded-3xl bg-white p-4 shadow-sm">
                          <p className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">Timeline</p>
                          <p className="mt-2 text-lg font-semibold text-[#111827]">{action.timeline}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between gap-4">
                      <span className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">Type: {action.category}</span>
                      <Button className="inline-flex items-center gap-2 bg-[#1D4ED8] hover:bg-[#1E40AF]">
                        {action.buttonLabel}
                        <ArrowRight size={16} />
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-[#E8E3F1] bg-[#F8F6FB] p-6 shadow-[0_12px_40px_rgba(57,44,93,0.05)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <SectionLabel>AI Recommended Actions</SectionLabel>
                  <h3 className="text-xl font-semibold text-[#111827]">Action Engine panel</h3>
                </div>
                <div className="rounded-3xl bg-[#EEF2FF] px-3 py-2 text-sm font-semibold text-[#4338CA]">
                  Live guidance
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-3xl bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold text-[#6B7280]">Highest priority</p>
                  <p className="mt-3 text-lg font-semibold text-[#111827]">Hire engineering talent to close the 1,200-person gap.</p>
                </div>
                <div className="rounded-3xl bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold text-[#6B7280]">Quick win</p>
                  <p className="mt-3 text-lg font-semibold text-[#111827]">Upskill analysts into AI business analyst roles within 6 months.</p>
                </div>
                <div className="rounded-3xl bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold text-[#6B7280]">Risk signal</p>
                  <p className="mt-3 text-lg font-semibold text-[#111827]">Retention planning is critical for senior engineering leaders.</p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-[#E8E3F1] bg-white p-6 shadow-[0_12px_40px_rgba(57,44,93,0.05)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <SectionLabel>Leadership note</SectionLabel>
                  <p className="text-lg font-semibold text-[#111827]">Recommended next step</p>
                </div>
                <Sparkles size={22} className="text-[#9333EA]" />
              </div>
              <p className="mt-4 text-sm leading-7 text-[#475569]">
                Use the Action Engine after your Layer 2 simulation completes. The model prioritizes workforce actions that balance headcount, talent supply, automation, and retention across the next 12–36 months.
              </p>
              <div className="mt-5 rounded-3xl bg-[#EEF2FF] p-4 text-sm text-[#0F172A]">
                <p className="font-semibold">Insight:</p>
                <p className="mt-2 leading-6 text-[#475569]">
                  Hiring, mobility, and retention are required together. Acting on a single strategy will leave gaps in adjacent workforce categories.
                </p>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
