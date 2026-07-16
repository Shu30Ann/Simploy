"use client";

import Link from "next/link";
import { BarChart3, LineChart, Megaphone, ShieldCheck, TrendingUp, Users, Zap, ArrowUpRight } from "lucide-react";
import { routes } from "@/lib/routes";
import { industrySignals, marketplaceSkills, marketplaceSummary } from "@/lib/mock-data";
import { toneStyles } from "@/components/employer/shared";

const insights = [
  {
    label: "Engineering",
    benchmark: "14 days",
    value: 86,
    color: "bg-[#087C7E]",
  },
  {
    label: "Sales",
    benchmark: "22 days",
    value: 58,
    color: "bg-[#B08A44]",
  },
  {
    label: "Marketing",
    benchmark: "19 days",
    value: 72,
    color: "bg-[#6B46C1]",
  },
];

const marketplaceSnapshot = [
  {
    label: "Most In-Demand Skill",
    value: marketplaceSummary.mostInDemandSkills[0],
    detail: `${marketplaceSkills[0].growthRate}% demand growth across platform roles`,
    icon: Zap,
    tone: "pink",
  },
  {
    label: "Talent Supply Score",
    value: `${marketplaceSummary.platformTalentSupplyScore}/100`,
    detail: "Healthy overall, tight for technical roles",
    icon: Users,
    tone: "teal",
  },
  {
    label: "Highest Shortage Industry",
    value: industrySignals.slice().sort((a, b) => b.shortageIndex - a.shortageIndex)[0].industry,
    detail: "Shortages are strongest in data and technical roles",
    icon: TrendingUp,
    tone: "purple",
  },
  {
    label: "Hiring Outlook",
    value: "Transformation",
    detail: "Employers need hire + upskill pathways",
    icon: ShieldCheck,
    tone: "teal",
  },
];

export function WorkforceInsights() {
  return (
    <section id="insights" aria-labelledby="insights-title" className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-wide text-[#B08A44]">Workforce Insights</p>
          <h2 id="insights-title" className="mt-2 text-3xl font-bold tracking-tight sm:text-[40px]">
            Marketplace signals for the next hire.
          </h2>
          <p className="mt-3 text-lg leading-relaxed text-[#6B7280]">
            Pair hiring velocity with supply, demand, and competition signals before you post or source.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <section className="rounded-2xl border border-[#F0D9E6] bg-[#F7F3EA] p-5 shadow-[0_8px_48px_rgba(70,60,35,0.08)] sm:p-7" aria-labelledby="velocity-title">
            <div className="mb-6 flex items-center justify-between gap-3">
              <h3 id="velocity-title" className="flex items-center gap-2 text-2xl font-bold">
                <BarChart3 size={22} className="text-[#087C7E]" />
                Hiring Velocity
              </h3>
              <LineChart size={20} className="text-[#1E2A44]" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-white p-4">
                <p className="text-[10px] font-bold uppercase text-[#9CA3AF]">Time-to-hire</p>
                <div className="mt-1 flex items-end gap-2">
                  <p className="text-3xl font-bold text-[#1E2A44]">18 Days</p>
                  <span className="pb-1 text-xs font-bold text-[#087C7E]">-2.4%</span>
                </div>
              </div>
              <div className="rounded-lg bg-white p-4">
                <p className="text-[10px] font-bold uppercase text-[#9CA3AF]">Cost-per-hire</p>
                <div className="mt-1 flex items-end gap-2">
                  <p className="text-3xl font-bold text-[#1E2A44]">$4,200</p>
                  <span className="pb-1 text-xs font-bold text-[#B08A44]">+1.2%</span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {insights.map((insight) => (
                <div key={insight.label}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-xs font-bold">
                    <span>{insight.label}</span>
                    <span className="text-[#6B7280]">{insight.benchmark}</span>
                  </div>
                  <div className="h-3 rounded-full bg-[#E8E3EA]">
                    <div className={`h-3 rounded-full ${insight.color}`} style={{ width: `${insight.value}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-lg border border-[#CBDFD4] bg-[#D8F7FF] p-4">
              <p className="text-sm leading-6 text-[#34616F]">
                Hiring velocity is <span className="font-bold">15% faster</span> for candidates with existing skill
                certifications.
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-[#EAE3D3] bg-white p-5 shadow-[0_8px_48px_rgba(70,60,35,0.08)] sm:p-7" aria-labelledby="snapshot-title">
            <div className="mb-6 flex items-center justify-between gap-3">
              <h3 id="snapshot-title" className="text-2xl font-bold">
                Talent Marketplace Snapshot
              </h3>
              <Megaphone size={20} className="text-[#B08A44]" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {marketplaceSnapshot.map(({ label, value, detail, icon: Icon, tone }) => (
                <article key={label} className="rounded-lg border border-[#EAE3D3] bg-[#F7F3EA] p-4">
                  <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg border ${toneStyles[tone]}`}>
                    <Icon size={18} />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[#9CA3AF]">{label}</p>
                  <p className="mt-2 text-2xl font-bold text-[#1E2A44]">{value}</p>
                  <p className="mt-2 text-sm leading-6 text-[#6B7280]">{detail}</p>
                </article>
              ))}
            </div>
            <Link
              href={routes.employerSimulator}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1E2A44] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(26,16,51,0.16)]"
            >
              Open workforce simulator
              <ArrowUpRight size={16} />
            </Link>
          </section>
        </div>
      </div>
    </section>
  );
}
