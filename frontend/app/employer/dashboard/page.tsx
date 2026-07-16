"use client";

import Link from "next/link";
import { AlertTriangle, ArrowUpRight, BarChart3, ClipboardList, LineChart } from "lucide-react";
import { routes } from "@/lib/routes";
import { WorkforceCommandCenter } from "@/components/employer/CommandCenter";
import { metricsFromDashboard, toneStyles, useEmployerDashboard } from "@/components/employer/shared";

const topics = [
  {
    title: "Active Hiring Pipeline",
    detail: "Track every live role, application flow, and matching signal from one focused queue.",
    href: routes.employerJobs,
    icon: ClipboardList,
    tone: "pink",
  },
  {
    title: "Attention Required",
    detail: "Clear the blockers first: stalled roles, pending drafts, and unreviewed candidates.",
    href: routes.employerAttention,
    icon: AlertTriangle,
    tone: "orange",
  },
  {
    title: "Workforce Insights",
    detail: "Hiring velocity, supply, demand, and competition signals before you post or source.",
    href: routes.employerInsights,
    icon: BarChart3,
    tone: "teal",
  },
  {
    title: "Workforce Forecast",
    detail: "Long-range supply signals for planning roles, mobility, and hiring demand.",
    href: routes.employerForecast,
    icon: LineChart,
    tone: "purple",
  },
];

export default function EmployerDashboardPage() {
  const { dashboard, loadState } = useEmployerDashboard();

  return (
    <main className="min-h-screen bg-[#F7F3EA] text-[#1E2A44]">
      <WorkforceCommandCenter metrics={metricsFromDashboard(dashboard)} companyName={dashboard?.company_name} />
      {loadState === "loaded" && (
        <div className="border-y border-[#CBDFD4] bg-[#EFF5F0] px-4 py-3 text-center text-sm font-bold text-[#087C7E]">
          Dashboard loaded from database for {dashboard?.company_name}.
        </div>
      )}

      <section aria-labelledby="topics-title" className="bg-[#F7F3EA] pb-20 pt-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-wide text-[#B08A44]">Explore</p>
            <h2 id="topics-title" className="mt-2 text-3xl font-bold tracking-tight sm:text-[40px]">
              Everything, one topic per page.
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
