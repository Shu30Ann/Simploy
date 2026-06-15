"use client";

import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  Search,
  Send,
} from "lucide-react";

const applications = [
  {
    title: "Lead UX Researcher",
    company: "Internal - Talent & Culture",
    status: "Interviewing",
    date: "Next: Jun 18, 2026",
    type: "Internal",
    accent: "green",
  },
  {
    title: "VP of Experience",
    company: "External - BrightFuture Tech",
    status: "Applied",
    date: "Sent 3 days ago",
    type: "External",
    accent: "pink",
  },
  {
    title: "Product Analytics Fellow",
    company: "Internal - Growth Lab",
    status: "Reviewed",
    date: "Updated yesterday",
    type: "Internal",
    accent: "teal",
  },
];

const toneStyles: Record<string, string> = {
  pink: "bg-[#FFF0F8] text-[#E8197A] border-[#FFD0E8]",
  teal: "bg-[#E0F9FF] text-[#0891B2] border-[#BAF3FF]",
  green: "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]",
};

function Pill({ children, tone = "pink" }: { children: React.ReactNode; tone?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${toneStyles[tone]}`}
    >
      {children}
    </span>
  );
}

export default function EmployeeApplicationsPage() {
  return (
    <main className="min-h-screen bg-[#FDFCFF] text-[#1A1033]">
      <header className="border-b border-[#F0EBF8] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-8">
            <a href="/" className="text-xl font-bold text-[#E8197A]">
              Simploy
            </a>
            <nav className="hidden items-center gap-1 text-sm font-semibold text-[#6B7280] md:flex">
              <a href="/employee/dashboard#asia-market-title" className="rounded-full px-4 py-2 hover:bg-[#F8F5FC]">
                Asia Market Insight
              </a>
              <a href="/employee/applications" className="rounded-full bg-[#FFF0F8] px-4 py-2 text-[#E8197A]">
                Applications
              </a>
              <a href="/employee/dashboard#skills" className="rounded-full px-4 py-2 hover:bg-[#F8F5FC]">
                Skill gaps
              </a>
              <a href="/employee/dashboard#roadmap" className="rounded-full px-4 py-2 hover:bg-[#F8F5FC]">
                Roadmap
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/employee/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-[#DDD0F8] bg-white px-4 py-2 text-sm font-semibold text-[#6B46C1] shadow-sm"
            >
              <ArrowLeft size={16} />
              Back to marketplace
            </a>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1A1033] text-sm font-bold text-white">
              A
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#FFD0E8] bg-[#FFF0F8] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#E8197A]">
              <ClipboardCheck size={14} />
              Submitted opportunities
            </div>
            <h1 className="text-3xl font-bold sm:text-4xl">Applications</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]">
              Track submitted internal gigs and external roles from one focused workspace.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              ["Total", applications.length.toString()],
              ["Active", "2"],
              ["Next step", "Jun 18"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-[#F0EBF8] bg-white px-4 py-3 shadow-[0_4px_24px_rgba(232,25,122,0.08)]">
                <p className="text-xs font-semibold uppercase text-[#9CA3AF]">{label}</p>
                <p className="mt-1 text-xl font-bold text-[#1A1033]">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-lg border border-[#F0EBF8] bg-white p-3 shadow-[0_4px_24px_rgba(232,25,122,0.08)] lg:flex-row">
          <label className="flex min-h-12 flex-1 items-center gap-3 rounded-lg bg-[#FDFCFF] px-4 text-sm text-[#9CA3AF]">
            <Search size={18} />
            <input
              className="w-full bg-transparent text-[#1A1033] outline-none placeholder:text-[#9CA3AF]"
              placeholder="Search applications..."
            />
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex">
            {["All", "Internal", "External", "Interviewing"].map((filter, index) => (
              <button
                key={filter}
                className={`rounded-lg px-4 py-3 text-sm font-semibold ${
                  index === 0 ? "bg-[#06B6D4] text-white" : "bg-[#F8F5FC] text-[#6B7280]"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <section
          aria-labelledby="applications-title"
          className="mt-8 rounded-lg border border-[#F0EBF8] bg-white p-5 shadow-[0_4px_24px_rgba(232,25,122,0.08)]"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 id="applications-title" className="flex items-center gap-2 text-xl font-bold">
              <Send size={20} className="text-[#6B46C1]" />
              Submitted Job Opportunities
            </h2>
            <button className="text-sm font-bold text-[#0891B2]">Export</button>
          </div>

          <div className="space-y-3">
            {applications.map((application) => (
              <article
                key={application.title}
                className="flex flex-col gap-4 rounded-lg bg-[#FDFCFF] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-lg border ${toneStyles[application.accent]}`}
                  >
                    <BriefcaseBusiness size={18} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold">{application.title}</p>
                      <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-[#6B7280]">
                        {application.type}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[#6B7280]">{application.company}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4 sm:justify-end">
                  <Pill tone={application.accent}>{application.status}</Pill>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#9CA3AF]">
                    <CalendarDays size={13} />
                    {application.date}
                  </span>
                  <button aria-label={`Open ${application.title}`} className="rounded-full p-1 text-[#9CA3AF] hover:bg-white">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
