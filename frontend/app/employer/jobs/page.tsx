"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ClipboardList } from "lucide-react";
import { JobPostingTable } from "@/components/employer/JobPostingTable";
import { fallbackJobs, jobFromBackend, useEmployerDashboard } from "@/components/employer/shared";
import type { HiringPlanDraft } from "@/lib/mock-data";

const HIRING_PLAN_KEY = "simploy-employer-hiring-plan";

type HiringPlanContext = {
  createdAt: string;
  draft: HiringPlanDraft;
  sourceAction: string;
};

export default function EmployerJobsPage() {
  const { dashboard, loadState } = useEmployerDashboard();
  const visibleJobs = dashboard?.jobs.length ? dashboard.jobs.map(jobFromBackend) : fallbackJobs;
  const [hiringPlan, setHiringPlan] = useState<HiringPlanContext | null>(null);
  const [draftMessage, setDraftMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(HIRING_PLAN_KEY);
      if (raw) {
        setHiringPlan(JSON.parse(raw) as HiringPlanContext);
      }
    } catch {
      setHiringPlan(null);
    }
  }, []);

  return (
    <main className="min-h-screen bg-[#F7F3EA] text-[#1E2A44]">
      {loadState === "loaded" && (
        <div className="border-b border-[#CBDFD4] bg-[#EFF5F0] px-4 py-3 text-center text-sm font-bold text-[#087C7E]">
          Jobs loaded from database for {dashboard?.company_name}.
        </div>
      )}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {hiringPlan && (
            <section className="mb-6 rounded-2xl border border-[#E3D8BC] bg-white p-5 shadow-[0_8px_28px_rgba(70,60,35,0.08)]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#F6F1E4] text-[#B08A44]">
                    <ClipboardList size={20} />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-[#B08A44]">Hiring plan draft</p>
                    <h1 className="mt-1 text-2xl font-bold text-[#1E2A44]">{hiringPlan.draft.role}</h1>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5D6470]">
                      Created from {hiringPlan.sourceAction}. Target {hiringPlan.draft.targetHires} hires by {hiringPlan.draft.targetStart} with {hiringPlan.draft.budget} budget.
                    </p>
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[430px]">
                  {[
                    ["Priority", hiringPlan.draft.priority],
                    ["Channels", hiringPlan.draft.channels.slice(0, 2).join(", ")],
                    ["Metric", hiringPlan.draft.successMetric],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg bg-[#F7F3EA] p-3">
                      <p className="text-[10px] font-bold uppercase text-[#9CA3AF]">{label}</p>
                      <p className="mt-1 line-clamp-2 text-xs font-bold leading-5 text-[#1E2A44]">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDraftMessage(`Draft job post prepared for ${hiringPlan.draft.role}. Hiring team can review and publish next.`)}
                className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#B08A44] px-4 text-sm font-bold text-white"
              >
                Convert Draft to Job Post
                <ArrowRight size={15} />
              </button>
              {draftMessage && (
                <div className="mt-3 rounded-lg border border-[#CBDFD4] bg-[#EFF5F0] px-4 py-3 text-sm font-bold text-[#087C7E]">
                  {draftMessage}
                </div>
              )}
            </section>
          )}
          <JobPostingTable jobs={visibleJobs} />
        </div>
      </section>
    </main>
  );
}
