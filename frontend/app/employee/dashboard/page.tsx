"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  ExternalLink,
  FileBadge,
  FileText,
  GraduationCap,
  LineChart,
  Map,
  Search,
  Sparkles,
  UserRound,
} from "lucide-react";

const opportunities = [
  {
    title: "Company Dinner Photographer Needed",
    company: "People & Culture Team",
    type: "Internal",
    match: "96%",
    location: "One-night gig",
    tags: ["Photography", "Event Coverage", "Editing"],
    tone: "pink",
  },
  {
    title: "Sales Deck Design Sprint",
    company: "Commercial Strategy Team",
    type: "Internal",
    match: "89%",
    location: "2-week gig",
    tags: ["Canva", "Storytelling", "Presentation"],
    tone: "teal",
  },
  {
    title: "Townhall Emcee Support",
    company: "Corporate Communications",
    type: "Internal",
    match: "84%",
    location: "Half-day gig",
    tags: ["Public Speaking", "Hosting", "Coordination"],
    tone: "blue",
  },
  {
    title: "Creative Strategy Lead",
    company: "BrightFuture Tech",
    type: "External",
    match: "86%",
    location: "Remote",
    tags: ["Strategy", "Leadership", "Brand"],
    tone: "blue",
  },
  {
    title: "UX Research Manager",
    company: "Nexa Talent Lab",
    type: "External",
    match: "82%",
    location: "Singapore",
    tags: ["Research Ops", "Journey Maps", "Testing"],
    tone: "green",
  },
];

const applications = [
  {
    title: "Lead UX Researcher",
    company: "Internal - Talent & Culture",
    status: "Interviewing",
    date: "Next: Jun 18, 2026",
    accent: "green",
  },
  {
    title: "VP of Experience",
    company: "External - BrightFuture Tech",
    status: "Applied",
    date: "Sent 3 days ago",
    accent: "pink",
  },
  {
    title: "Product Analytics Fellow",
    company: "Internal - Growth Lab",
    status: "Reviewed",
    date: "Updated yesterday",
    accent: "teal",
  },
];

const skillGaps = [
  {
    skill: "Three.js / WebGL",
    impact: "+5 matching roles",
    progress: 42,
    action: "Start learning path",
  },
  {
    skill: "Product Analytics",
    impact: "+7 matching roles",
    progress: 58,
    action: "Browse courses",
  },
  {
    skill: "Stakeholder Storytelling",
    impact: "+4 leadership roles",
    progress: 74,
    action: "Practice scenario",
  },
];

const roadmap = [
  {
    phase: "Step 1",
    title: "Build finance foundations",
    detail: "Strengthen financial planning, budgeting, risk, insurance, investment, and tax basics.",
    icon: BookOpen,
  },
  {
    phase: "Step 2",
    title: "Earn advisory credentials",
    detail: "Prepare for relevant licensing, ethics, compliance, and client suitability requirements.",
    icon: FileBadge,
  },
  {
    phase: "Step 3",
    title: "Practice client consultation",
    detail: "Run mock discovery calls, create sample financial plans, and learn objection handling.",
    icon: BadgeCheck,
  },
];

const consultantRoadmap = [
  {
    stage: "Foundation",
    timeframe: "Weeks 1-4",
    title: "Master personal finance and advisory basics",
    tasks: ["Budgeting and cash-flow analysis", "Insurance and risk planning", "Investment products and portfolio basics"],
    icon: BookOpen,
  },
  {
    stage: "Credentialing",
    timeframe: "Weeks 5-10",
    title: "Prepare for financial consultant licensing",
    tasks: ["Study compliance and ethics", "Review client suitability rules", "Complete mock licensing exams"],
    icon: FileBadge,
  },
  {
    stage: "Client Skills",
    timeframe: "Weeks 11-14",
    title: "Build consultation confidence",
    tasks: ["Practice discovery calls", "Create sample financial plans", "Improve presentation and objection handling"],
    icon: ClipboardCheck,
  },
  {
    stage: "Market Ready",
    timeframe: "Weeks 15-18",
    title: "Apply for financial consultant roles",
    tasks: ["Prepare a client case-study portfolio", "Target banks, advisory firms, and insurance groups", "Track applications and interviews"],
    icon: CircleDollarSign,
  },
];

const toneStyles: Record<string, string> = {
  pink: "bg-[#FFF0F8] text-[#E8197A] border-[#FFD0E8]",
  teal: "bg-[#E0F9FF] text-[#0891B2] border-[#BAF3FF]",
  blue: "bg-[#EEF6FF] text-[#2563EB] border-[#BFDBFE]",
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

function OpportunityCard({ job }: { job: (typeof opportunities)[number] }) {
  const isInternal = job.type === "Internal";

  return (
    <article className="rounded-lg border border-[#F0EBF8] bg-white p-5 shadow-[0_4px_24px_rgba(232,25,122,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg border ${toneStyles[job.tone]}`}>
          {isInternal ? <Building2 size={20} /> : <ExternalLink size={20} />}
        </div>
        <Pill tone={isInternal ? "pink" : "teal"}>{isInternal ? "Internal Gig" : "External Role"}</Pill>
      </div>
      <h3 className="mt-5 text-lg font-bold">{job.title}</h3>
      <p className="mt-1 text-sm font-semibold text-[#6B7280]">{job.company}</p>
      <p className="mt-2 text-xs font-semibold text-[#9CA3AF]">
        {isInternal ? "Duration" : "Location"}: {job.location}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {job.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-[#F8F5FC] px-2.5 py-1 text-xs font-semibold text-[#6B7280]">
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-[#F0EBF8] pt-4">
        <span className="text-sm font-bold text-[#0891B2]">
          {job.match} {isInternal ? "skill fit" : "match"}
        </span>
        <button className="inline-flex items-center gap-1 rounded-lg bg-[#FFF0F8] px-3 py-2 text-sm font-bold text-[#E8197A]">
          {isInternal ? "Join Gig" : "Explore"}
          <ArrowUpRight size={14} />
        </button>
      </div>
    </article>
  );
}

export default function EmployeeDashboardPage() {
  const [isRoadmapOpen, setIsRoadmapOpen] = useState(false);
  const internalOpportunities = opportunities.filter((job) => job.type === "Internal");
  const externalOpportunities = opportunities.filter((job) => job.type === "External");

  return (
    <main className="min-h-screen bg-[#FDFCFF] text-[#1A1033]">
      <header className="border-b border-[#F0EBF8] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-8">
            <a href="/" className="text-xl font-bold text-[#E8197A]">
              Simploy
            </a>
            <nav className="hidden items-center gap-1 text-sm font-semibold text-[#6B7280] md:flex">
              <a href="/employee/dashboard" className="rounded-full bg-[#FFF0F8] px-4 py-2 text-[#E8197A]">
                Marketplace
              </a>
              <a href="#applications" className="rounded-full px-4 py-2 hover:bg-[#F8F5FC]">
                Applications
              </a>
              <a href="#skills" className="rounded-full px-4 py-2 hover:bg-[#F8F5FC]">
                Skill gaps
              </a>
              <a href="#roadmap" className="rounded-full px-4 py-2 hover:bg-[#F8F5FC]">
                Roadmap
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-full border border-[#DDD0F8] bg-white px-4 py-2 text-sm font-semibold text-[#6B46C1] shadow-sm">
              <Building2 size={16} />
              Switch Portal
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1A1033] text-sm font-bold text-white">
              A
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#BAF3FF] bg-[#E0F9FF] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#0891B2]">
              <Sparkles size={14} />
              Career marketplace
            </div>
            <h1 className="text-3xl font-bold sm:text-4xl">
              Level up, <span className="text-[#E8197A]">Alex</span>.
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]">
              Explore internal mobility and external career opportunities, track submitted applications, and close the
              skill gaps that unlock your next move.
            </p>
          </div>
          <div className="rounded-lg border border-[#F0EBF8] bg-white px-4 py-3 shadow-[0_4px_24px_rgba(232,25,122,0.08)]">
            <p className="text-xs font-semibold uppercase text-[#9CA3AF]">Talent graph</p>
            <p className="mt-1 text-2xl font-bold text-[#1A1033]">94% complete</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-lg border border-[#F0EBF8] bg-white p-3 shadow-[0_4px_24px_rgba(232,25,122,0.08)] lg:flex-row">
          <label className="flex min-h-12 flex-1 items-center gap-3 rounded-lg bg-[#FDFCFF] px-4 text-sm text-[#9CA3AF]">
            <Search size={18} />
            <input
              className="w-full bg-transparent text-[#1A1033] outline-none placeholder:text-[#9CA3AF]"
              placeholder="Search internal and external jobs..."
            />
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex">
            {["Department", "Location", "Role type"].map((filter) => (
              <button
                key={filter}
                className="rounded-lg bg-[#F8F5FC] px-4 py-3 text-sm font-semibold text-[#6B7280]"
              >
                {filter}
              </button>
            ))}
            <button className="rounded-lg bg-[#06B6D4] px-5 py-3 text-sm font-bold text-white shadow-sm">
              Find Match
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.8fr)_minmax(320px,0.9fr)]">
          <div className="space-y-6">
            <section aria-labelledby="opportunities-title">
              <div className="mb-4 flex items-center justify-between">
                <h2 id="opportunities-title" className="flex items-center gap-2 text-xl font-bold">
                  <BriefcaseBusiness size={20} className="text-[#E8197A]" />
                  Internal Gigs and External Job Opportunities
                </h2>
                <button className="hidden text-sm font-bold text-[#0891B2] sm:inline-flex">View all matches</button>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <div className="rounded-lg border border-[#FFD0E8] bg-[#FFF8FC] p-3">
                  <div className="mb-3 flex items-center justify-between rounded-lg bg-white px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Building2 size={18} className="text-[#E8197A]" />
                      <h3 className="font-bold">Internal Skill Gigs</h3>
                    </div>
                    <Pill tone="pink">{internalOpportunities.length} gigs</Pill>
                  </div>
                  <p className="mb-3 px-1 text-sm leading-6 text-[#6B7280]">
                    Short company needs that use current employee skills before hiring externally.
                  </p>
                  <div className="space-y-4">
                    {internalOpportunities.map((job) => (
                      <OpportunityCard key={job.title} job={job} />
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-[#BAF3FF] bg-[#F3FCFF] p-3">
                  <div className="mb-3 flex items-center justify-between rounded-lg bg-white px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ExternalLink size={18} className="text-[#0891B2]" />
                      <h3 className="font-bold">External Opportunities</h3>
                    </div>
                    <Pill tone="teal">{externalOpportunities.length} roles</Pill>
                  </div>
                  <div className="space-y-4">
                    {externalOpportunities.map((job) => (
                      <OpportunityCard key={job.title} job={job} />
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section
              id="applications"
              aria-labelledby="applications-title"
              className="rounded-lg border border-[#F0EBF8] bg-white p-5 shadow-[0_4px_24px_rgba(232,25,122,0.08)]"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 id="applications-title" className="flex items-center gap-2 text-xl font-bold">
                  <FileText size={20} className="text-[#6B46C1]" />
                  Submitted Job Opportunities
                </h2>
                <button className="text-sm font-bold text-[#0891B2]">Manage</button>
              </div>
              <div className="space-y-3">
                {applications.map((application) => (
                  <div
                    key={application.title}
                    className="flex flex-col gap-3 rounded-lg bg-[#FDFCFF] p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${toneStyles[application.accent]}`}>
                        <BriefcaseBusiness size={18} />
                      </div>
                      <div>
                        <p className="font-bold">{application.title}</p>
                        <p className="text-sm text-[#6B7280]">{application.company}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <Pill tone={application.accent}>{application.status}</Pill>
                      <span className="text-xs font-semibold text-[#9CA3AF]">{application.date}</span>
                      <ChevronRight size={18} className="text-[#9CA3AF]" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section
              id="skills"
              aria-labelledby="skills-title"
              className="rounded-lg border border-[#DDD0F8] bg-[#F5F0FF] p-5 shadow-[0_4px_24px_rgba(232,25,122,0.08)]"
            >
              <h2 id="skills-title" className="flex items-center gap-2 text-xl font-bold">
                <GraduationCap size={21} className="text-[#6B46C1]" />
                Skill Gaps Required
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                Unlock 12 new opportunities by improving these skills.
              </p>

              <div className="mt-5 space-y-4">
                {skillGaps.map((gap) => (
                  <div key={gap.skill} className="rounded-lg bg-white/75 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold">{gap.skill}</p>
                        <button className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#6B46C1]">
                          {gap.action}
                          <ChevronRight size={13} />
                        </button>
                      </div>
                      <span className="text-xs font-bold text-[#6B46C1]">{gap.impact}</span>
                    </div>
                    <div className="mt-4 h-2 rounded-full bg-[#E9DFF8]">
                      <div
                        className="h-2 rounded-full bg-[#6B46C1]"
                        style={{ width: `${gap.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section
              id="roadmap"
              aria-labelledby="roadmap-title"
              role="button"
              tabIndex={0}
              onClick={() => setIsRoadmapOpen(true)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setIsRoadmapOpen(true);
                }
              }}
              className="cursor-pointer rounded-lg border border-[#F0EBF8] bg-white p-5 text-left shadow-[0_4px_24px_rgba(232,25,122,0.08)] transition hover:-translate-y-0.5 hover:border-[#BAF3FF] hover:shadow-[0_8px_30px_rgba(6,182,212,0.12)]"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 id="roadmap-title" className="flex items-center gap-2 text-xl font-bold">
                  <Map size={20} className="text-[#06B6D4]" />
                  Improvement Roadmap
                </h2>
                <LineChart size={20} className="text-[#9CA3AF]" />
              </div>

              <div className="mt-5 rounded-lg border border-[#F0EBF8] bg-[#FDFCFF] p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold">Career readiness</p>
                    <p className="text-xs text-[#9CA3AF]">Based on current marketplace matches</p>
                  </div>
                  <span className="text-2xl font-bold text-[#E8197A]">76%</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                  <div className="rounded-lg bg-[#FFF0F8] p-2 text-[#E8197A]">Creative</div>
                  <div className="rounded-lg bg-[#E0F9FF] p-2 text-[#0891B2]">Technical</div>
                  <div className="rounded-lg bg-[#ECFDF5] p-2 text-[#059669]">Leadership</div>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {roadmap.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="relative flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E0F9FF] text-[#0891B2]">
                          <Icon size={17} />
                        </div>
                        {index < roadmap.length - 1 && <div className="mt-2 h-full min-h-10 w-px bg-[#E2D9F3]" />}
                      </div>
                      <div className="pb-2">
                        <p className="text-xs font-bold uppercase text-[#9CA3AF]">{item.phase}</p>
                        <p className="mt-1 font-bold">{item.title}</p>
                        <p className="mt-1 text-sm leading-6 text-[#6B7280]">{item.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#1A1033] px-4 py-3 text-sm font-bold text-white">
                <CalendarDays size={16} />
                View Financial Consultant Roadmap
              </div>
            </section>
          </aside>
        </div>
      </section>

      {isRoadmapOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1033]/55 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="financial-roadmap-title"
        >
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-[0_24px_80px_rgba(26,16,51,0.28)]">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#F0EBF8] bg-white px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#0891B2]">Career roadmap</p>
                <h2 id="financial-roadmap-title" className="mt-1 text-2xl font-bold text-[#1A1033]">
                  Financial Consultant Pathway
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]">
                  A focused plan to move from applicant readiness into financial consulting roles.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRoadmapOpen(false)}
                className="rounded-full border border-[#F0EBF8] px-3 py-1.5 text-sm font-bold text-[#6B7280] hover:bg-[#F8F5FC]"
                aria-label="Close roadmap"
              >
                Close
              </button>
            </div>

            <div className="p-5 sm:p-6">
              <div className="grid gap-4 md:grid-cols-4">
                {[
                  ["Target role", "Financial Consultant"],
                  ["Timeline", "18 weeks"],
                  ["Current readiness", "62%"],
                  ["Priority gap", "Licensing"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-[#F0EBF8] bg-[#FDFCFF] p-4">
                    <p className="text-xs font-bold uppercase text-[#9CA3AF]">{label}</p>
                    <p className="mt-2 text-lg font-bold text-[#1A1033]">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-5">
                {consultantRoadmap.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.stage}
                      className="grid gap-4 rounded-lg border border-[#F0EBF8] bg-white p-4 md:grid-cols-[160px_minmax(0,1fr)]"
                    >
                      <div className="flex items-center gap-3 md:block">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#E0F9FF] text-[#0891B2]">
                          <Icon size={22} />
                        </div>
                        <div className="md:mt-3">
                          <p className="text-xs font-bold uppercase text-[#9CA3AF]">{item.timeframe}</p>
                          <p className="font-bold text-[#0891B2]">{item.stage}</p>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-start gap-3">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FFF0F8] text-sm font-bold text-[#E8197A]">
                            {index + 1}
                          </span>
                          <div>
                            <h3 className="text-lg font-bold text-[#1A1033]">{item.title}</h3>
                            <ul className="mt-3 space-y-2">
                              {item.tasks.map((task) => (
                                <li key={task} className="flex gap-2 text-sm leading-6 text-[#6B7280]">
                                  <ChevronRight size={16} className="mt-1 shrink-0 text-[#E8197A]" />
                                  <span>{task}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 rounded-lg bg-[#1A1033] p-5 text-white">
                <p className="text-sm font-bold">Next recommended action</p>
                <p className="mt-2 text-sm leading-6 text-white/75">
                  Start with finance foundations, then shortlist the exact licensing requirement for the country and
                  firm type you want to apply to.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <button className="fixed bottom-5 right-5 hidden rounded-full bg-[#E8197A] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(232,25,122,0.24)] md:inline-flex md:items-center md:gap-2">
        <UserRound size={16} />
        Career coach
      </button>
    </main>
  );
}
