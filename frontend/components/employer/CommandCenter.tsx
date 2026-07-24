"use client";

import Link from "next/link";
import { ArrowUpRight, Send, Sparkles } from "lucide-react";
import { routes } from "@/lib/routes";
import { commandMetrics, toneStyles, type EmployerMetricView } from "@/components/employer/shared";

export function WorkforceCommandCenter({
  metrics = commandMetrics,
  companyName,
}: {
  metrics?: EmployerMetricView[];
  companyName?: string;
}) {
  return (
    <section aria-labelledby="command-center-title" className="relative overflow-hidden bg-[#F7F3EA] pb-14 pt-12 sm:pb-20 sm:pt-16">
      <div className="pointer-events-none absolute left-1/2 top-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#B08A44]/[0.06] blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.8fr)] lg:items-center">
          <div>
            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-[#E3D8BC] bg-[#F6F1E4] px-5 py-2 text-base font-bold text-[#B08A44]">
              <Sparkles size={17} />
              Employer marketplace
            </div>
            <h1
              id="command-center-title"
              className="font-bold leading-[1.1] tracking-tight text-[#1E2A44]"
              style={{ fontSize: "clamp(36px, 6vw, 64px)" }}
            >
              Workforce Command Center
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[#6B7280]">
              {companyName ? `${companyName}: ` : ""}
              Focus today&apos;s hiring work around live roles, qualified candidates, and the actions that move your
              workforce plan forward.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={routes.employerJobs}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#B08A44] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#97742F]"
              >
                Find Talent
                <ArrowUpRight size={16} />
              </Link>
              <Link
                href={routes.employerJobs}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#B08A44] bg-transparent px-6 py-3 text-sm font-medium text-[#B08A44] transition-colors hover:bg-[#F6F1E4]"
              >
                <Send size={16} />
                Manage Jobs
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {metrics.map(({ label, value, detail, icon: Icon, tone }) => (
              <article key={label} className="rounded-2xl border border-[#EAE3D3] bg-white p-5 shadow-[0_8px_48px_rgba(70,60,35,0.1)]">
                <div className={`mb-5 flex h-11 w-11 items-center justify-center rounded-lg border ${toneStyles[tone]}`}>
                  <Icon size={20} />
                </div>
                <p className="text-4xl font-bold text-[#1E2A44]">{value}</p>
                <p className="mt-2 text-xs font-bold uppercase tracking-wide text-[#9CA3AF]">{label}</p>
                <p className="mt-2 text-sm font-semibold text-[#6B7280]">{detail}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
