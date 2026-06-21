"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  ClipboardList,
  EllipsisVertical,
  FilePenLine,
  LineChart,
  Megaphone,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UserCheck,
  Users,
  Zap,
} from "lucide-react";
import { routes } from "@/lib/routes";
import { getAuthToken, getJson } from "@/lib/api";
import type { BackendJob, EmployerDashboardData } from "@/lib/backendTypes";

const fallbackJobs = [
  {
    title: "Senior Protocol Engineer",
    department: "Core Infrastructure",
    workStyle: "Hybrid",
    hiringStatus: "Hiring",
    appsReceived: 42,
    matches: ["JE", "MC", "+3"],
    matchTone: "pink",
  },
  {
    title: "DevRel Lead",
    department: "Ecosystem Growth",
    workStyle: "Remote",
    hiringStatus: "Hiring",
    appsReceived: 15,
    matches: ["AS", "SR"],
    matchTone: "teal",
  },
  {
    title: "Product Designer (v2)",
    department: "UI/UX",
    workStyle: "On-site",
    hiringStatus: "Draft",
    appsReceived: 0,
    matches: [],
    matchTone: "purple",
  },
];

function jobFromBackend(job: BackendJob) {
  return {
    title: job.title,
    department: job.department_name ?? "General",
    workStyle: job.work_style,
    hiringStatus: job.status === "open" ? "Hiring" : job.status === "draft" ? "Draft" : "Closed",
    appsReceived: job.applications_count,
    matches: job.applications_count > 0 ? [`${job.applications_count}`] : [],
    matchTone: job.applications_count > 0 ? "pink" : "purple",
  };
}

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
    color: "bg-[#E8197A]",
  },
  {
    label: "Marketing",
    benchmark: "19 days",
    value: 72,
    color: "bg-[#6B46C1]",
  },
];

const commandMetrics = [
  { label: "Active Roles", value: "12", detail: "8 live, 3 drafts, 1 offer", icon: ClipboardList, tone: "pink" },
  { label: "Applications", value: "124", detail: "45 new this week", icon: Users, tone: "teal" },
  { label: "Hires", value: "18", detail: "Q2 accepted offers", icon: UserCheck, tone: "purple" },
  { label: "Qualified Matches", value: "37", detail: "Ready for review", icon: BadgeCheck, tone: "pink" },
];

const attentionItems = [
  {
    title: "Review applicants",
    detail: '12 new applicants for "Senior Protocol Engineer" need a decision.',
    meta: "Due today",
    action: "Review queue",
    icon: Users,
    tone: "pink",
  },
  {
    title: "Publish draft jobs",
    detail: '"Product Designer (v2)" is ready once compensation is confirmed.',
    meta: "3 drafts",
    action: "Open drafts",
    icon: FilePenLine,
    tone: "purple",
  },
  {
    title: "Low candidate supply",
    detail: "Senior protocol roles are trending below target supply this week.",
    meta: "Supply risk",
    action: "Find talent",
    icon: Target,
    tone: "teal",
  },
];

const marketplaceSnapshot = [
  { label: "Most In-Demand Skill", value: "Rust / Wasm", detail: "Engineering demand up 24%", icon: Zap, tone: "pink" },
  { label: "Talent Supply Score", value: "72/100", detail: "Healthy, but tightening", icon: Users, tone: "teal" },
  { label: "Competition Level", value: "High", detail: "5 similar employers active", icon: TrendingUp, tone: "purple" },
  { label: "Hiring Outlook", value: "Positive", detail: "Faster with certified talent", icon: ShieldCheck, tone: "teal" },
];

const workforceForecast = [
  { year: "2026", population: "10,000", value: 100 },
  { year: "2030", population: "9,100", value: 91 },
  { year: "2040", population: "7,800", value: 78 },
  { year: "2050", population: "6,900", value: 69 },
];

const toneStyles: Record<string, string> = {
  pink: "border-[#FFD0E8] bg-[#FFF0F8] text-[#E8197A]",
  teal: "border-[#BAF3FF] bg-[#E0F9FF] text-[#0891B2]",
  purple: "border-[#DDD0F8] bg-[#F5F0FF] text-[#6B46C1]",
};

function Pill({ children, tone = "pink" }: { children: React.ReactNode; tone?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${toneStyles[tone]}`}
    >
      {children}
    </span>
  );
}

function JobPostingTable({ jobs }: { jobs: typeof fallbackJobs }) {
  return (
    <section
      id="jobs"
      aria-labelledby="jobs-title"
      className="rounded-2xl border border-[#F0EBF8] bg-white p-5 shadow-[0_8px_48px_rgba(232,25,122,0.08)] sm:p-7"
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#E8197A]">Active Hiring Pipeline</p>
          <h2 id="jobs-title" className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Active Hiring Pipeline
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]">
            Track every live role, application flow, and matching signal from one focused queue.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Pill tone="pink">Hiring (8)</Pill>
          <Pill tone="purple">Draft (3)</Pill>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-separate border-spacing-0 text-left">
          <thead>
            <tr className="text-xs font-bold uppercase text-[#9CA3AF]">
              <th className="border-b border-[#F0EBF8] px-1 pb-3">Role Title</th>
              <th className="border-b border-[#F0EBF8] px-4 pb-3">Hiring Status</th>
              <th className="border-b border-[#F0EBF8] px-4 pb-3 text-center">Apps Received</th>
              <th className="border-b border-[#F0EBF8] px-4 pb-3">Matches</th>
              <th className="border-b border-[#F0EBF8] px-1 pb-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.title} className="align-middle">
                <td className="border-b border-[#F8F5FC] px-1 py-4">
                  <p className="font-bold">{job.title}</p>
                  <p className="mt-1 text-xs font-semibold text-[#9CA3AF]">
                    {job.department} - {job.workStyle}
                  </p>
                </td>
                <td className="border-b border-[#F8F5FC] px-4 py-4">
                  <Pill tone={job.hiringStatus === "Hiring" ? "pink" : "purple"}>{job.hiringStatus}</Pill>
                </td>
                <td className="border-b border-[#F8F5FC] px-4 py-4 text-center text-sm font-bold">
                  {job.appsReceived}
                </td>
                <td className="border-b border-[#F8F5FC] px-4 py-4">
                  {job.matches.length > 0 ? (
                    <div className="flex items-center">
                      {job.matches.map((match) => (
                        <span
                          key={`${job.title}-${match}`}
                          className={`-ml-1 first:ml-0 flex h-7 min-w-7 items-center justify-center rounded-full border-2 border-white px-1.5 text-[10px] font-bold ${toneStyles[job.matchTone]}`}
                        >
                          {match}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs font-semibold italic text-[#9CA3AF]">Pending post</span>
                  )}
                </td>
                <td className="border-b border-[#F8F5FC] px-1 py-4 text-right">
                  <button
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#6B46C1] hover:bg-[#F5F0FF]"
                    aria-label={job.hiringStatus === "Draft" ? `Edit ${job.title}` : `Open actions for ${job.title}`}
                  >
                    {job.hiringStatus === "Draft" ? <FilePenLine size={18} /> : <EllipsisVertical size={18} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function WorkforceCommandCenter({
  metrics = commandMetrics,
  companyName,
}: {
  metrics?: typeof commandMetrics;
  companyName?: string;
}) {
  return (
    <section aria-labelledby="command-center-title" className="relative overflow-hidden bg-[#FDFCFF] pb-14 pt-12 sm:pb-20 sm:pt-16">
      <div className="pointer-events-none absolute left-1/2 top-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#E8197A]/[0.06] blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.8fr)] lg:items-center">
          <div>
            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-[#FFD0E8] bg-[#FFF5FA] px-5 py-2 text-base font-bold text-[#E8197A]">
              <Sparkles size={17} />
              Employer marketplace
            </div>
            <h1
              id="command-center-title"
              className="font-bold leading-[1.1] tracking-tight text-[#1A1033]"
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
                href="#jobs"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#E8197A] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#C91569]"
              >
                Find Talent
                <ArrowUpRight size={16} />
              </Link>
              <Link
                href="#jobs"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#E8197A] bg-transparent px-6 py-3 text-sm font-medium text-[#E8197A] transition-colors hover:bg-[#FFF5FA]"
              >
                <Send size={16} />
                Post Job
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {metrics.map(({ label, value, detail, icon: Icon, tone }) => (
              <article key={label} className="rounded-2xl border border-[#F0EBF8] bg-white p-5 shadow-[0_8px_48px_rgba(232,25,122,0.1)]">
                <div className={`mb-5 flex h-11 w-11 items-center justify-center rounded-lg border ${toneStyles[tone]}`}>
                  <Icon size={20} />
                </div>
                <p className="text-4xl font-bold text-[#1A1033]">{value}</p>
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

function AttentionRequired() {
  return (
    <section aria-labelledby="attention-title" className="bg-[#FDFCFF] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#E8197A]">Attention Required</p>
            <h2 id="attention-title" className="mt-2 text-3xl font-bold tracking-tight sm:text-[40px]">
              Clear the blockers first.
            </h2>
          </div>
          <Link href={routes.employerActionEngine} className="inline-flex items-center gap-1 text-sm font-medium text-[#E8197A] hover:underline">
            Open action engine
            <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {attentionItems.map(({ title, detail, meta, action, icon: Icon, tone }) => (
            <article key={title} className="rounded-2xl border border-[#F0EBF8] bg-white p-5 shadow-[0_4px_24px_rgba(232,25,122,0.08)]">
              <div className="flex items-start justify-between gap-4">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${toneStyles[tone]}`}>
                  <Icon size={20} />
                </div>
                <Pill tone={tone}>{meta}</Pill>
              </div>
              <h3 className="mt-5 text-xl font-bold">{title}</h3>
              <p className="mt-2 min-h-[48px] text-sm leading-6 text-[#6B7280]">{detail}</p>
              <button className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#E8197A]">
                {action}
                <ArrowUpRight size={15} />
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkforceInsights() {
  return (
    <section id="insights" aria-labelledby="insights-title" className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-wide text-[#E8197A]">Workforce Insights</p>
          <h2 id="insights-title" className="mt-2 text-3xl font-bold tracking-tight sm:text-[40px]">
            Marketplace signals for the next hire.
          </h2>
          <p className="mt-3 text-lg leading-relaxed text-[#6B7280]">
            Pair hiring velocity with supply, demand, and competition signals before you post or source.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <section className="rounded-2xl border border-[#F0D9E6] bg-[#FDFCFF] p-5 shadow-[0_8px_48px_rgba(232,25,122,0.08)] sm:p-7" aria-labelledby="velocity-title">
            <div className="mb-6 flex items-center justify-between gap-3">
              <h3 id="velocity-title" className="flex items-center gap-2 text-2xl font-bold">
                <BarChart3 size={22} className="text-[#087C7E]" />
                Hiring Velocity
              </h3>
              <LineChart size={20} className="text-[#1A1033]" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-white p-4">
                <p className="text-[10px] font-bold uppercase text-[#9CA3AF]">Time-to-hire</p>
                <div className="mt-1 flex items-end gap-2">
                  <p className="text-3xl font-bold text-[#1A1033]">18 Days</p>
                  <span className="pb-1 text-xs font-bold text-[#087C7E]">-2.4%</span>
                </div>
              </div>
              <div className="rounded-lg bg-white p-4">
                <p className="text-[10px] font-bold uppercase text-[#9CA3AF]">Cost-per-hire</p>
                <div className="mt-1 flex items-end gap-2">
                  <p className="text-3xl font-bold text-[#1A1033]">$4,200</p>
                  <span className="pb-1 text-xs font-bold text-[#E8197A]">+1.2%</span>
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

            <div className="mt-6 rounded-lg border border-[#BAF3FF] bg-[#D8F7FF] p-4">
              <p className="text-sm leading-6 text-[#34616F]">
                Hiring velocity is <span className="font-bold">15% faster</span> for candidates with existing skill
                certifications.
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-[#F0EBF8] bg-white p-5 shadow-[0_8px_48px_rgba(232,25,122,0.08)] sm:p-7" aria-labelledby="snapshot-title">
            <div className="mb-6 flex items-center justify-between gap-3">
              <h3 id="snapshot-title" className="text-2xl font-bold">
                Talent Marketplace Snapshot
              </h3>
              <Megaphone size={20} className="text-[#E8197A]" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {marketplaceSnapshot.map(({ label, value, detail, icon: Icon, tone }) => (
                <article key={label} className="rounded-lg border border-[#F0EBF8] bg-[#FDFCFF] p-4">
                  <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg border ${toneStyles[tone]}`}>
                    <Icon size={18} />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[#9CA3AF]">{label}</p>
                  <p className="mt-2 text-2xl font-bold text-[#1A1033]">{value}</p>
                  <p className="mt-2 text-sm leading-6 text-[#6B7280]">{detail}</p>
                </article>
              ))}
            </div>
            <Link
              href={routes.employerSimulator}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1A1033] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(26,16,51,0.16)]"
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

function DemographicClock() {
  return (
    <section aria-labelledby="workforce-forecast-title" className="bg-[#FFF8FC] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-wide text-[#E8197A]">Workforce Forecast</p>
          <h2 id="workforce-forecast-title" className="mt-2 text-3xl font-bold tracking-tight sm:text-[40px]">
            Workforce Availability Forecast
          </h2>
          <p className="mt-3 text-lg leading-relaxed text-[#6B7280]">
            Long-range supply signals for planning roles, mobility, and hiring demand.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#F0EBF8] bg-white shadow-[0_8px_48px_rgba(232,25,122,0.1)]">
          <div className="grid gap-0 lg:grid-cols-[300px_minmax(0,1fr)]">
            <div className="bg-[#1A1033] p-6 text-white sm:p-8">
              <h3 className="flex items-center gap-3 text-2xl font-bold">
                <LineChart size={22} className="text-[#39BFE8]" />
                Demographic Clock
              </h3>
              <p className="mt-6 text-lg leading-8 text-white/80">
                Workforce availability forecast for aging Asian labor markets.
              </p>
              <div className="mt-10">
                <p className="text-xs font-bold uppercase text-white/45">Projected decline</p>
                <p className="mt-3 text-6xl font-bold text-[#39BFE8]">31%</p>
                <p className="mt-3 text-base font-semibold leading-7 text-white/75">Working-age population by 2050</p>
              </div>
              <div className="mt-10 rounded-lg bg-white/10 p-5">
                <p className="text-xs font-bold uppercase text-white/45">Planning signal</p>
                <p className="mt-3 text-base leading-7 text-white/80">
                  Build internal mobility and skills transfer before hiring demand peaks.
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-3xl font-bold tracking-tight">Workforce Availability Forecast</h3>
                  <p className="mt-3 text-lg leading-8 text-[#6B7280]">
                    Working-age population trend from 2026 to 2050.
                  </p>
                </div>
                <Pill tone="pink">2026 - 2050</Pill>
              </div>

              <div className="rounded-lg border border-[#F0EBF8] bg-[#FDFCFF] p-4 sm:p-5">
                <div className="relative h-72">
                  <div className="absolute inset-x-0 top-8 border-t border-dashed border-[#E5DDEC]" />
                  <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-[#E5DDEC]" />
                  <div className="absolute inset-x-0 bottom-14 border-t border-dashed border-[#E5DDEC]" />

                  <svg
                    className="absolute inset-0 h-full w-full"
                    viewBox="0 0 420 250"
                    role="img"
                    aria-label="Working age population declines from 10,000 in 2026 to 6,900 in 2050"
                  >
                    <defs>
                      <linearGradient id="workforceLine" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0%" stopColor="#087C7E" />
                        <stop offset="55%" stopColor="#E8197A" />
                        <stop offset="100%" stopColor="#6B46C1" />
                      </linearGradient>
                    </defs>
                    <polyline
                      points="48,54 160,92 286,145 386,176"
                      fill="none"
                      stroke="url(#workforceLine)"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="7"
                    />
                    <polyline points="48,54 160,92 286,145 386,176 386,215 48,215" fill="rgba(232,25,122,0.08)" />
                    {[
                      ["48", "54", "#087C7E"],
                      ["160", "92", "#E8197A"],
                      ["286", "145", "#6B46C1"],
                      ["386", "176", "#1A1033"],
                    ].map(([cx, cy, color]) => (
                      <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="8" fill={color} stroke="#FFFFFF" strokeWidth="4" />
                    ))}
                  </svg>

                  <div className="absolute bottom-0 left-0 right-0 grid grid-cols-4 gap-2">
                    {workforceForecast.map((point) => (
                      <div key={point.year} className="text-center">
                        <p className="text-base font-bold text-[#1A1033]">{point.year}</p>
                        <p className="text-sm font-semibold text-[#6B7280]">{point.population}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-4 pb-4 sm:grid-cols-4 sm:pb-6">
                {workforceForecast.map((point) => (
                  <div key={point.year} className="rounded-lg bg-[#FFF8FC] p-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-[#6B46C1]">{point.year}</span>
                      <span className="text-sm font-bold text-[#E8197A]">{point.value}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-[#EFE7F4]">
                      <div className="h-2.5 rounded-full bg-[#E8197A]" style={{ width: `${point.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href={routes.employerSimulator}
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#1A1033] px-5 py-4 text-base font-bold text-white shadow-[0_8px_24px_rgba(26,16,51,0.16)]"
              >
                Checkout workforce simulator
                <ArrowUpRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function EmployerDashboardPage() {
  const [dashboard, setDashboard] = useState<EmployerDashboardData | null>(null);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "loaded" | "fallback">("idle");

  useEffect(() => {
    if (!getAuthToken()) {
      setLoadState("fallback");
      return;
    }

    setLoadState("loading");
    getJson<EmployerDashboardData>("/dashboard/employer", { auth: true })
      .then((data) => {
        setDashboard(data);
        setLoadState("loaded");
      })
      .catch(() => setLoadState("fallback"));
  }, []);

  const visibleJobs = dashboard?.jobs.length ? dashboard.jobs.map(jobFromBackend) : fallbackJobs;
  const metrics = dashboard
    ? [
        {
          label: "Active Roles",
          value: String(dashboard.metrics.active_roles),
          detail: `${dashboard.metrics.draft_roles} drafts in progress`,
          icon: ClipboardList,
          tone: "pink",
        },
        {
          label: "Applications",
          value: String(dashboard.metrics.applications),
          detail: `${dashboard.metrics.qualified_matches} qualified matches`,
          icon: Users,
          tone: "teal",
        },
        { label: "Hires", value: "0", detail: "No accepted offers yet", icon: UserCheck, tone: "purple" },
        {
          label: "Saved Plans",
          value: String(dashboard.simulations.length),
          detail: "Workforce simulations saved",
          icon: BadgeCheck,
          tone: "pink",
        },
      ]
    : commandMetrics;

  return (
    <main className="min-h-screen bg-[#FDFCFF] text-[#1A1033]">
      <WorkforceCommandCenter metrics={metrics} companyName={dashboard?.company_name} />
      {loadState === "loaded" && (
        <div className="border-y border-[#BAF3FF] bg-[#F0FDFF] px-4 py-3 text-center text-sm font-bold text-[#087C7E]">
          Dashboard loaded from database for {dashboard?.company_name}.
        </div>
      )}
      <AttentionRequired />
      <section className="bg-[#FDFCFF] pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <JobPostingTable jobs={visibleJobs} />
        </div>
      </section>
      <WorkforceInsights />
      <DemographicClock />
    </main>
  );
}
