"use client";

import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDot,
  ClipboardList,
  Eye,
  MoreVertical,
  Pencil,
  Plus,
  Sparkles,
  UsersRound,
  WandSparkles,
} from "lucide-react";

const jobPostings = [
  {
    role: "Senior Protocol Engineer",
    team: "Core Infrastructure",
    work: "Hybrid",
    status: "Active",
    apps: 42,
    matches: ["JE", "MF", "+3"],
    accent: "pink",
  },
  {
    role: "DevRel Lead",
    team: "Ecosystem Growth",
    work: "Remote",
    status: "Active",
    apps: 15,
    matches: ["AN", "SR"],
    accent: "teal",
  },
  {
    role: "Product Designer (v2)",
    team: "UI/UX",
    work: "On-site",
    status: "Draft",
    apps: 0,
    matches: ["Pending post"],
    accent: "purple",
  },
];

const insightBars = [
  {
    label: "Rust/Wasm Demand",
    value: 86,
    note: "High Supply Need",
    color: "bg-[#E8197A]",
  },
  {
    label: "Solidity Skills",
    value: 45,
    note: "Balanced",
    color: "bg-[#06B6D4]",
  },
  {
    label: "GoLang Experts",
    value: 21,
    note: "Low Volume",
    color: "bg-[#6B46C1]",
  },
];

const talentMatches = [
  {
    name: "Sarah Chen",
    current: "Current: Jr. Blockchain Dev",
    match: "98% Match: Senior Protocol",
    initials: "SC",
    tone: "pink",
  },
  {
    name: "Marcus Wright",
    current: "Current: Community Lead",
    match: "92% Match: DevRel Lead",
    initials: "MW",
    tone: "teal",
  },
];

const pipeline = [
  ["New applications", "45"],
  ["Screening", "18"],
  ["Interviewing", "9"],
  ["Offer stage", "4"],
];

const toneStyles: Record<string, string> = {
  pink: "bg-[#FFF0F8] text-[#E8197A] border-[#FFD0E8]",
  teal: "bg-[#E0F9FF] text-[#0891B2] border-[#BAF3FF]",
  purple: "bg-[#F5F0FF] text-[#6B46C1] border-[#DDD0F8]",
};

function StatusPill({ status }: { status: string }) {
  const isActive = status === "Active";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
        isActive ? "bg-[#FFF0F8] text-[#E8197A]" : "bg-[#F5F0FF] text-[#6B46C1]"
      }`}
    >
      {status}
    </span>
  );
}

function AvatarChip({ label, tone = "purple" }: { label: string; tone?: string }) {
  return (
    <span
      className={`inline-flex h-7 min-w-7 items-center justify-center rounded-full border px-2 text-[11px] font-bold ${toneStyles[tone]}`}
    >
      {label}
    </span>
  );
}

export default function EmployeeDashboardPage() {
  return (
    <main className="min-h-screen bg-[#FDFCFF] text-[#1A1033]">
      <header className="sticky top-0 z-30 border-b border-[#F0EBF8] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
            <a href="/" className="text-xl font-bold text-[#E8197A]">
              Simploy
            </a>
            <nav className="flex flex-wrap items-center gap-1 text-sm font-semibold text-[#6B7280]">
              <a href="#jobs" className="rounded-full bg-[#E0F9FF] px-4 py-2 text-[#0891B2]">
                Jobs
              </a>
              <a href="#applications" className="rounded-full px-4 py-2 hover:bg-[#F8F5FC]">
                Applications
              </a>
              <a href="#skills" className="rounded-full px-4 py-2 hover:bg-[#F8F5FC]">
                Skills
              </a>
              <a href="#pipeline" className="rounded-full px-4 py-2 text-[#E8197A] hover:bg-[#FFF0F8]">
                Pipeline
              </a>
              <a href="#insights" className="rounded-full px-4 py-2 hover:bg-[#F8F5FC]">
                Analytics
              </a>
              <a href="/employer/action-engine" className="rounded-full bg-[#1A1033] px-4 py-2 text-white hover:bg-[#111827]">
                Action Engine
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-full border border-[#DDD0F8] bg-white px-4 py-2 text-sm font-bold text-[#6B46C1] shadow-sm">
              <UsersRound size={16} />
              Switch Portal
            </button>
            <button className="inline-flex items-center gap-2 rounded-full bg-[#E8197A] px-4 py-2 text-sm font-bold text-white shadow-[0_8px_24px_rgba(232,25,122,0.18)]">
              <Plus size={16} />
              Post a Job
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1A1033] text-sm font-bold text-white">
              L2
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px_280px] lg:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#FFD0E8] bg-[#FFF0F8] px-3 py-1 text-xs font-bold uppercase text-[#E8197A]">
              <Building2 size={14} />
              Employer marketplace
            </div>
            <h1 className="text-3xl font-bold sm:text-4xl">
              Welcome back, <span className="text-[#E8197A]">Layer 2 Team</span>.
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]">
              Your talent marketplace is humming. You have 12 active roles and 45 new applications waiting for review.
            </p>
          </div>

          <div className="rounded-lg bg-[#E86DB7] p-5 text-center text-white shadow-[0_10px_28px_rgba(232,25,122,0.22)]">
            <p className="text-4xl font-bold">124</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-wide text-white/80">Applications</p>
          </div>
          <div className="rounded-lg bg-[#38BEE8] p-5 text-center text-[#07364A] shadow-[0_10px_28px_rgba(6,182,212,0.18)]">
            <p className="text-4xl font-bold">18</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[#07364A]/70">Hired</p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.85fr)]">
          <div className="space-y-6">
            <section
              id="jobs"
              aria-labelledby="jobs-title"
              className="rounded-lg border border-[#F0EBF8] bg-white p-5 shadow-[0_4px_24px_rgba(232,25,122,0.08)]"
            >
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 id="jobs-title" className="flex items-center gap-2 text-xl font-bold">
                  <BriefcaseBusiness size={21} className="text-[#E8197A]" />
                  Job Postings
                </h2>
                <div className="flex gap-2">
                  <span className="rounded-full bg-[#FFF0F8] px-3 py-1 text-xs font-bold text-[#E8197A]">
                    Active (8)
                  </span>
                  <span className="rounded-full bg-[#F5F0FF] px-3 py-1 text-xs font-bold text-[#6B46C1]">
                    Draft (3)
                  </span>
                </div>
              </div>

              <div className="overflow-hidden rounded-lg border border-[#F0EBF8]">
                <div className="grid grid-cols-[minmax(220px,1.3fr)_90px_70px_minmax(120px,0.7fr)_54px] bg-[#FDFCFF] px-4 py-3 text-xs font-bold uppercase text-[#9CA3AF]">
                  <span>Role title</span>
                  <span>Status</span>
                  <span>Apps</span>
                  <span>Matches</span>
                  <span className="text-right">Action</span>
                </div>
                {jobPostings.map((job) => (
                  <div
                    key={job.role}
                    className="grid grid-cols-[minmax(220px,1.3fr)_90px_70px_minmax(120px,0.7fr)_54px] items-center border-t border-[#F0EBF8] px-4 py-4"
                  >
                    <div>
                      <p className="font-bold">{job.role}</p>
                      <p className="mt-1 text-xs font-semibold text-[#9CA3AF]">
                        {job.team} - {job.work}
                      </p>
                    </div>
                    <StatusPill status={job.status} />
                    <span className="font-bold text-[#1A1033]">{job.apps}</span>
                    <div className="flex items-center gap-1">
                      {job.matches.map((match) => (
                        <AvatarChip key={match} label={match} tone={job.accent} />
                      ))}
                    </div>
                    <button
                      className="ml-auto flex h-9 w-9 items-center justify-center rounded-full text-[#9B75AD] hover:bg-[#F8F5FC]"
                      aria-label={`${job.status === "Draft" ? "Edit" : "Open"} ${job.role}`}
                    >
                      {job.status === "Draft" ? <Pencil size={17} /> : <MoreVertical size={18} />}
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section
              id="pipeline"
              aria-labelledby="pipeline-title"
              className="rounded-lg border border-[#E9D8FF] bg-[#FBF2FF] p-5 shadow-[0_4px_24px_rgba(107,70,193,0.08)]"
            >
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 id="pipeline-title" className="flex items-center gap-2 text-xl font-bold">
                  <CircleDot size={21} className="text-[#6B46C1]" />
                  Hiring Pipeline
                </h2>
                <button className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-bold text-[#6B46C1]">
                  <Eye size={15} />
                  View candidates
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-4">
                {pipeline.map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-[#E9D8FF] bg-white p-4">
                    <p className="text-2xl font-bold text-[#1A1033]">{value}</p>
                    <p className="mt-1 text-xs font-bold uppercase text-[#9CA3AF]">{label}</p>
                  </div>
                ))}
              </div>
            </section>

            <section
              id="applications"
              aria-labelledby="matches-title"
              className="rounded-lg border border-[#F0EBF8] bg-white p-5 shadow-[0_4px_24px_rgba(232,25,122,0.08)]"
            >
              <h2 id="matches-title" className="flex items-center gap-2 text-xl font-bold">
                <Sparkles size={21} className="text-[#6B46C1]" />
                Top Talent Matches
              </h2>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {talentMatches.map((candidate) => (
                  <article key={candidate.name} className="rounded-lg border border-[#F0EBF8] bg-[#FDFCFF] p-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-full border text-sm font-bold ${toneStyles[candidate.tone]}`}>
                        {candidate.initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold">{candidate.name}</p>
                        <p className="truncate text-xs font-semibold text-[#6B7280]">{candidate.current}</p>
                        <p className="mt-1 inline-flex rounded-full bg-[#E0F9FF] px-2 py-1 text-[11px] font-bold text-[#0891B2]">
                          {candidate.match}
                        </p>
                      </div>
                      <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[#6B46C1] text-white">
                        <ClipboardList size={16} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section
              id="insights"
              aria-labelledby="insights-title"
              className="rounded-lg border border-[#F0EBF8] bg-white p-5 shadow-[0_4px_24px_rgba(232,25,122,0.08)]"
            >
              <h2 id="insights-title" className="flex items-center gap-2 text-xl font-bold">
                <BarChart3 size={21} className="text-[#06B6D4]" />
                Marketplace Insights
              </h2>

              <div className="mt-5 space-y-4">
                {insightBars.map((item) => (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="text-xs font-bold text-[#1A1033]">{item.label}</p>
                      <p className="text-xs font-bold text-[#9B4DB1]">{item.note}</p>
                    </div>
                    <div className="h-3 rounded-full bg-[#F1E7F3]">
                      <div className={`h-3 rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-lg border border-[#BAF3FF] bg-[#E0F9FF] p-4">
                <p className="text-sm italic leading-6 text-[#0C5870]">
                  Internal mobility candidates are 30% more likely to close open Protocol Engineering roles this quarter.
                </p>
                <p className="mt-3 text-xs font-bold uppercase text-[#0891B2]">AI Strategy Insight</p>
              </div>
            </section>

            <section
              id="skills"
              aria-labelledby="planner-title"
              className="rounded-lg border-2 border-dashed border-[#BAF3FF] bg-white p-5 shadow-[0_4px_24px_rgba(6,182,212,0.1)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase text-[#0891B2]">Layer 2</p>
                  <h2 id="planner-title" className="mt-1 flex items-center gap-2 text-xl font-bold">
                    <WandSparkles size={21} className="text-[#E8197A]" />
                    Workforce Planner
                  </h2>
                </div>
                <CalendarDays size={20} className="text-[#9CA3AF]" />
              </div>

              <div className="mt-5 space-y-4">
                <div className="rounded-lg bg-[#FDFCFF] p-4">
                  <p className="text-sm font-bold">Next quarter gap</p>
                  <p className="mt-1 text-3xl font-bold text-[#E8197A]">7 roles</p>
                  <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                    Rust, DevRel, and protocol QA hiring need the fastest coverage.
                  </p>
                </div>

                <div className="space-y-3">
                  {["Move 3 internal engineers into Rust upskilling", "Open 2 contract protocol QA seats", "Prioritize DevRel Lead interviews"].map((task) => (
                    <div key={task} className="flex items-start gap-2 text-sm font-semibold text-[#1A1033]">
                      <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-[#06B6D4]" />
                      <span>{task}</span>
                    </div>
                  ))}
                </div>

                <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1A1033] px-4 py-3 text-sm font-bold text-white">
                  <BarChart3 size={16} />
                  Open planning board
                </button>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
