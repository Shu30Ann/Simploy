"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, BarChart3, ClipboardList, LineChart, ShieldAlert, Zap } from "lucide-react";
import { routes } from "@/lib/routes";
import { WorkforceCommandCenter } from "@/components/employer/CommandCenter";
import { metricsFromDashboard, toneStyles, useEmployerDashboard } from "@/components/employer/shared";
import {
  manufacturingRecommendations,
  manufacturingSimulationSummary,
  manufacturingEmployerProfile,
} from "@/lib/mock-data";

const topics = [
  {
    title: "Active Hiring Pipeline",
    detail: "Track every live role, application flow, and matching signal from one focused queue.",
    href: routes.employerJobs,
    icon: ClipboardList,
    tone: "pink",
  },
  {
    title: "Market Insight",
    detail: "Attention signals, hiring velocity, market supply, and forecast pressure in one page.",
    href: routes.employerMarketInsight,
    icon: BarChart3,
    tone: "teal",
  },
  {
    title: "Workforce Simulator",
    detail: "Model timeline, attrition, AI adoption, hiring budget, and workforce gap scenarios.",
    href: routes.employerSimulator,
    icon: LineChart,
    tone: "purple",
  },
  {
    title: "Action Engine",
    detail: "Turn simulation outputs into prioritized hiring, upskilling, mobility, and retention actions.",
    href: routes.employerActionEngine,
    icon: Zap,
    tone: "orange",
  },
];

export default function EmployerDashboardPage() {
  const { dashboard, loadState } = useEmployerDashboard();
  const topAction = manufacturingRecommendations[0];

  return (
    <main className="min-h-screen bg-[#F7F3EA] text-[#1E2A44]">
      <WorkforceCommandCenter metrics={metricsFromDashboard(dashboard)} companyName={dashboard?.company_name} />
      {loadState === "loaded" && (
        <div className="border-y border-[#CBDFD4] bg-[#EFF5F0] px-4 py-3 text-center text-sm font-bold text-[#17694F]">
          Dashboard loaded from database for {dashboard?.company_name}.
        </div>
      )}

      <section className="border-y border-[#EAE3D3] bg-white py-6">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center lg:px-8">
          <div className="rounded-2xl border border-[#EAE3D3] bg-[#F7F3EA] p-5 shadow-[0_8px_28px_rgba(70,60,35,0.06)]">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <p className="inline-flex items-center gap-2 rounded-full border border-[#E3D8BC] bg-[#F6F1E4] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#B08A44]">
                  <ShieldAlert size={14} />
                  Workforce risk detected
                </p>
                <h2 className="mt-3 text-2xl font-bold text-[#1E2A44]">
                  {manufacturingEmployerProfile.name} is tracking a {manufacturingSimulationSummary.projectedGap.toLocaleString()} role gap by 2031.
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#5D6470]">
                  Main risk: {topAction.problem} Simulate the workforce levers before committing budget to hiring, upskilling, or mobility.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                <a
                  href={routes.employerSimulator}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#B08A44] px-5 text-sm font-bold text-white transition hover:bg-[#97742F]"
                >
                  Run Workforce Simulation
                  <ArrowRight size={16} />
                </a>
                <a
                  href={routes.employerActionEngine}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#B08A44] bg-white px-5 text-sm font-bold text-[#B08A44] transition hover:bg-[#F6F1E4]"
                >
                  View Action Plan
                  <Zap size={15} />
                </a>
              </div>
            </div>
          </div>

          <aside className="grid grid-cols-3 gap-3 lg:grid-cols-1">
            {[
              ["Projected gap", manufacturingSimulationSummary.projectedGap.toLocaleString(), "roles"],
              ["Cost exposure", `RM ${(manufacturingSimulationSummary.costOfInaction / 1e6).toFixed(1)}M`, "inaction"],
              ["Internal pool", `${manufacturingSimulationSummary.internalCandidatesReadyNow + manufacturingSimulationSummary.internalCandidatesTrainable}`, "candidates"],
            ].map(([label, value, detail]) => (
              <div key={label} className="rounded-xl border border-[#EAE3D3] bg-white p-4 shadow-[0_4px_18px_rgba(70,60,35,0.06)]">
                <p className="text-[10px] font-bold uppercase tracking-wide text-[#9CA3AF]">{label}</p>
                <p className="mt-1 text-xl font-black text-[#1E2A44]">{value}</p>
                <p className="mt-0.5 text-xs font-semibold text-[#6B7280]">{detail}</p>
              </div>
            ))}
          </aside>
        </div>
      </section>

      <section aria-labelledby="topics-title" className="bg-[#F7F3EA] pb-20 pt-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-wide text-[#B08A44]">Explore</p>
            <h2 id="topics-title" className="mt-2 text-3xl font-bold tracking-tight sm:text-[40px]">
              A simpler employer workspace.
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {topics.map(({ title, detail, href, icon: Icon, tone }) => (
              <Link
                key={title}
                href={href}
                className="group rounded-2xl border border-[#EAE3D3] bg-white p-6 shadow-[0_4px_24px_rgba(70,60,35,0.08)] transition-shadow hover:shadow-[0_8px_40px_rgba(70,60,35,0.14)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${toneStyles[tone]}`}>
                    <Icon size={20} />
                  </div>
                  <ArrowUpRight size={18} className="text-[#B08A44] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
                <h3 className="mt-5 text-xl font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#6B7280]">{detail}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
