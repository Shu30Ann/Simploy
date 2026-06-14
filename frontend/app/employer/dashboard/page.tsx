"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  BriefcaseBusiness,
  ClipboardList,
  EllipsisVertical,
  FilePenLine,
  Handshake,
  LineChart,
  Map,
  Search,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { routes } from "@/lib/routes";

const jobs = [
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

const acquisitionTips = [
  'Review 12 new applicants for "Senior Protocol Engineer"',
  'Finalize offer for "DevRel Lead" candidate Felicia A.',
  'Update job brief for "Product Designer" draft',
];

const talentMatches = [
  {
    name: "Sarah Chen",
    current: "Sr. Blockchain Dev",
    match: "98%",
    role: "Senior Protocol",
    initials: "SC",
    tone: "pink",
  },
  {
    name: "Marcus Wright",
    current: "Community Lead",
    match: "92%",
    role: "DevRel Lead",
    initials: "MW",
    tone: "teal",
  },
];

const workforceForecast = [
  { year: "2026", population: "10,000", value: 100 },
  { year: "2030", population: "9,100", value: 91 },
  { year: "2040", population: "7,800", value: 78 },
  { year: "2050", population: "6,900", value: 69 },
];

const plannerItems = [
  { label: "Roles opening in 30 days", value: "5", icon: BriefcaseBusiness, tone: "pink" },
  { label: "Internal candidates ready", value: "18", icon: UsersRound, tone: "teal" },
  { label: "Skills to backfill", value: "7", icon: ShieldCheck, tone: "purple" },
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

function JobPostingTable() {
  return (
    <section
      id="jobs"
      aria-labelledby="jobs-title"
      className="rounded-lg border border-[#F0EBF8] bg-white p-5 shadow-[0_4px_24px_rgba(232,25,122,0.08)]"
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 id="jobs-title" className="flex items-center gap-2 text-xl font-bold">
          <ClipboardList size={20} className="text-[#E8197A]" />
          Job Postings
        </h2>
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

function MarketplaceInsights() {
  return (
    <div id="insights" className="space-y-4">
      <section
        aria-labelledby="insights-title"
        className="rounded-lg border border-[#F0D9E6] bg-white p-5 shadow-[0_4px_24px_rgba(232,25,122,0.08)]"
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 id="insights-title" className="flex items-center gap-2 text-lg font-bold">
            <BarChart3 size={18} className="text-[#087C7E]" />
            Hiring Velocity
          </h2>
          <LineChart size={18} className="text-[#1A1033]" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase text-[#9CA3AF]">Time-to-hire</p>
            <div className="mt-1 flex items-end gap-2">
              <p className="text-2xl font-bold text-[#1A1033]">18 Days</p>
              <span className="pb-1 text-xs font-bold text-[#087C7E]">-2.4%</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-[#9CA3AF]">Cost-per-hire</p>
            <div className="mt-1 flex items-end gap-2">
              <p className="text-2xl font-bold text-[#1A1033]">$4,200</p>
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
          <p className="text-sm italic leading-6 text-[#34616F]">
            Hiring velocity is <span className="font-bold">15% faster</span> for candidates with existing skill
            certifications.
          </p>
          <button className="mt-3 inline-flex items-center gap-1 text-xs font-bold uppercase text-[#0891B2]">
            AI strategy insight
            <ArrowUpRight size={13} />
          </button>
        </div>
      </section>

      <section
        aria-labelledby="talent-acquisition-title"
        className="rounded-lg bg-[#E8195E] p-5 text-white shadow-[0_8px_24px_rgba(232,25,94,0.2)]"
      >
        <h2 id="talent-acquisition-title" className="text-lg font-bold">
          Talent Acquisition Tips
        </h2>
        <div className="mt-4 space-y-3">
          {acquisitionTips.map((tip) => (
            <div key={tip} className="flex gap-2 text-sm leading-5">
              <ShieldCheck size={15} className="mt-0.5 shrink-0" />
              <span>{tip}</span>
            </div>
          ))}
        </div>
        <button className="mt-5 w-full rounded-lg bg-white px-4 py-3 text-sm font-bold text-[#E8195E]">
          Go to Tasks
        </button>
      </section>
    </div>
  );
}

function TalentMatches() {
  return (
    <section
      id="matches"
      aria-labelledby="matches-title"
      className="rounded-lg border border-[#DDD0F8] bg-[#F9F2FF] p-5"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 id="matches-title" className="flex items-center gap-2 text-xl font-bold">
          <Sparkles size={20} className="text-[#6B46C1]" />
          Top Talent Matches (Internal)
        </h2>
        <button className="text-sm font-bold text-[#0891B2]">View all</button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {talentMatches.map((talent) => (
          <article
            key={talent.name}
            className="flex items-center justify-between gap-3 rounded-lg bg-white p-4 shadow-[0_4px_18px_rgba(26,16,51,0.08)]"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${toneStyles[talent.tone]}`}
              >
                {talent.initials}
              </div>
              <div className="min-w-0">
                <p className="truncate font-bold">{talent.name}</p>
                <p className="truncate text-xs font-semibold text-[#6B7280]">Current: {talent.current}</p>
                <Pill tone="teal">
                  {talent.match} Match: {talent.role}
                </Pill>
              </div>
            </div>
            <button
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#6B46C1] text-white"
              aria-label={`Review ${talent.name}`}
            >
              <Handshake size={17} />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function DemographicClock() {
  return (
    <section
      aria-labelledby="demographic-clock-title"
      className="overflow-hidden rounded-lg border border-[#F0EBF8] bg-white shadow-[0_4px_24px_rgba(232,25,122,0.08)]"
    >
      <div className="grid gap-0 lg:grid-cols-[240px_minmax(0,1fr)]">
        <div className="bg-[#1A1033] p-5 text-white">
          <h2 id="demographic-clock-title" className="flex items-center gap-2 text-xl font-bold">
            <LineChart size={20} className="text-[#39BFE8]" />
            Demographic Clock
          </h2>
          <p className="mt-3 text-sm leading-6 text-white/70">
            Workforce availability forecast for aging Asian labor markets.
          </p>
          <div className="mt-8">
            <p className="text-xs font-bold uppercase text-white/45">Projected decline</p>
            <p className="mt-2 text-5xl font-bold text-[#39BFE8]">31%</p>
            <p className="mt-2 text-sm font-semibold text-white/70">Working-age population by 2050</p>
          </div>
          <div className="mt-8 rounded-lg bg-white/10 p-4">
            <p className="text-xs font-bold uppercase text-white/45">Planning signal</p>
            <p className="mt-2 text-sm leading-6 text-white/75">
              Build internal mobility and skills transfer before hiring demand peaks.
            </p>
          </div>
        </div>

        <div className="p-5">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-xl font-bold">Workforce Availability Forecast</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]">
                Working-age population trend from 2026 to 2050.
              </p>
            </div>
            <Pill tone="pink">2026 - 2050</Pill>
          </div>

          <div className="rounded-lg border border-[#F0EBF8] bg-[#FDFCFF] p-4">
            <div className="relative h-56">
              <div className="absolute inset-x-0 top-4 border-t border-dashed border-[#E5DDEC]" />
              <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-[#E5DDEC]" />
              <div className="absolute inset-x-0 bottom-8 border-t border-dashed border-[#E5DDEC]" />

              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 420 210" role="img" aria-label="Working age population declines from 10,000 in 2026 to 6,900 in 2050">
                <defs>
                  <linearGradient id="workforceLine" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#087C7E" />
                    <stop offset="55%" stopColor="#E8197A" />
                    <stop offset="100%" stopColor="#6B46C1" />
                  </linearGradient>
                </defs>
                <polyline
                  points="28,38 152,73 276,116 392,145"
                  fill="none"
                  stroke="url(#workforceLine)"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="7"
                />
                <polyline points="28,38 152,73 276,116 392,145 392,178 28,178" fill="rgba(232,25,122,0.08)" />
                {[
                  ["28", "38", "#087C7E"],
                  ["152", "73", "#E8197A"],
                  ["276", "116", "#6B46C1"],
                  ["392", "145", "#1A1033"],
                ].map(([cx, cy, color]) => (
                  <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="8" fill={color} stroke="#FFFFFF" strokeWidth="4" />
                ))}
              </svg>

              <div className="absolute bottom-0 left-0 right-0 grid grid-cols-4 gap-2">
                {workforceForecast.map((point) => (
                  <div key={point.year} className="text-center">
                    <p className="text-sm font-bold text-[#1A1033]">{point.year}</p>
                    <p className="text-xs font-semibold text-[#6B7280]">{point.population}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            {workforceForecast.map((point) => (
              <div key={point.year} className="rounded-lg bg-[#FFF8FC] p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#6B46C1]">{point.year}</span>
                  <span className="text-xs font-bold text-[#E8197A]">{point.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-[#EFE7F4]">
                  <div className="h-2 rounded-full bg-[#E8197A]" style={{ width: `${point.value}%` }} />
                </div>
              </div>
            ))}
          </div>

          <Link
            href={routes.employerSimulator}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#1A1033] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(26,16,51,0.16)]"
          >
            Checkout workforce simulator
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function WorkforcePlanner() {
  return (
    <section
      id="planner"
      aria-labelledby="planner-title"
      className="rounded-lg border-2 border-dashed border-[#C8DEF8] bg-white p-5 shadow-[0_4px_24px_rgba(6,182,212,0.08)]"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 id="planner-title" className="flex items-center gap-2 text-xl font-bold">
          <Map size={20} className="text-[#06B6D4]" />
          Workforce Planner
        </h2>
        <Link href={routes.employerActionEngine} className="text-sm font-bold text-[#0891B2]">
          Open
        </Link>
      </div>

      <div className="rounded-lg border border-[#F0EBF8] bg-[#FDFCFF] p-4">
        <p className="text-xs font-bold uppercase text-[#9CA3AF]">Next planning cycle</p>
        <p className="mt-2 text-3xl font-bold text-[#1A1033]">Q3 Hiring Mix</p>
        <p className="mt-2 text-sm leading-6 text-[#6B7280]">
          Balance internal mobility, upskilling, and external hiring before publishing new roles.
        </p>
      </div>

      <div className="mt-4 space-y-3">
        {plannerItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center justify-between gap-3 rounded-lg bg-[#FDFCFF] p-3">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${toneStyles[item.tone]}`}>
                  <Icon size={18} />
                </div>
                <p className="text-sm font-semibold text-[#6B7280]">{item.label}</p>
              </div>
              <span className="text-xl font-bold">{item.value}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function EmployerDashboardPage() {
  return (
    <main className="min-h-screen bg-[#FDFCFF] text-[#1A1033]">
      <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#BAF3FF] bg-[#E0F9FF] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#0891B2]">
              <Sparkles size={14} />
              Employer marketplace
            </div>
            <h1 className="text-3xl font-bold sm:text-4xl">
              Welcome back, <span className="text-[#E8197A]">Layer 2 Team</span>!
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]">
              Your talent marketplace is humming. You have 12 active roles and 45 new applications waiting for review.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-[#EF6DB9] p-5 text-center shadow-[0_8px_24px_rgba(232,25,122,0.18)]">
              <p className="text-3xl font-bold text-[#1A1033]">124</p>
              <p className="mt-1 text-xs font-bold uppercase text-[#7B285A]">Applications</p>
            </div>
            <div className="rounded-lg bg-[#39BFE8] p-5 text-center shadow-[0_8px_24px_rgba(6,182,212,0.18)]">
              <p className="text-3xl font-bold text-[#1A1033]">18</p>
              <p className="mt-1 text-xs font-bold uppercase text-[#115A70]">Hired</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-lg border border-[#F0EBF8] bg-white p-3 shadow-[0_4px_24px_rgba(232,25,122,0.08)] lg:flex-row">
          <label className="flex min-h-12 flex-1 items-center gap-3 rounded-lg bg-[#FDFCFF] px-4 text-sm text-[#9CA3AF]">
            <Search size={18} />
            <input
              className="w-full bg-transparent text-[#1A1033] outline-none placeholder:text-[#9CA3AF]"
              placeholder="Search job postings, candidates, skills, or departments..."
            />
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex">
            {["Status", "Department", "Role type"].map((filter) => (
              <button
                key={filter}
                className="rounded-lg bg-[#F8F5FC] px-4 py-3 text-sm font-semibold text-[#6B7280]"
              >
                {filter}
              </button>
            ))}
            <button className="rounded-lg bg-[#06B6D4] px-5 py-3 text-sm font-bold text-white shadow-sm">
              Find Talent
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.75fr)_minmax(320px,0.9fr)]">
          <div className="space-y-6">
            <JobPostingTable />
            <TalentMatches />
            <DemographicClock />
          </div>

          <aside className="space-y-6">
            <MarketplaceInsights />
            <WorkforcePlanner />
          </aside>
        </div>

      </section>
    </main>
  );
}
