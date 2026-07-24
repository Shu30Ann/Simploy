import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BriefcaseBusiness,
  LineChart,
  ShieldCheck,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { routes } from "@/lib/routes";
import {
  employerAttentionItems,
  industrySignals,
  manufacturingEmployerProfile,
  manufacturingForecast,
  manufacturingSimulationSummary,
  marketplaceSkills,
  marketplaceSummary,
} from "@/lib/mock-data";

const toneStyles: Record<string, string> = {
  pink: "border-[#E3D8BC] bg-[#F6F1E4] text-[#B08A44]",
  teal: "border-[#CBDFD4] bg-[#E7F0E9] text-[#114F3B]",
  purple: "border-[#DFD6BE] bg-[#F1EDE0] text-[#6B46C1]",
  orange: "border-[#FED7AA] bg-[#FFF7ED] text-[#C2410C]",
};

function Pill({ children, tone = "pink" }: { children: React.ReactNode; tone?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${toneStyles[tone]}`}>
      {children}
    </span>
  );
}

const velocitySignals = [
  { label: "Engineering", benchmark: "14 days", value: 86, color: "bg-[#087C7E]" },
  { label: "Sales", benchmark: "22 days", value: 58, color: "bg-[#B08A44]" },
  { label: "Marketing", benchmark: "19 days", value: 72, color: "bg-[#6B46C1]" },
];

const marketSnapshot = [
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
    detail: "Best response is hire + upskill + mobility",
    icon: ShieldCheck,
    tone: "teal",
  },
];

const workforceForecast = manufacturingForecast
  .filter((_, index) => [0, 2, 4, 5].includes(index))
  .map((point) => ({
    year: point.year,
    population: point.supply.toLocaleString(),
    value: Math.round((point.supply / manufacturingForecast[0].supply) * 100),
  }));

const attentionLinks: Record<string, string> = {
  "Open hiring plan": routes.employerActionEngine,
  "View transition pool": routes.employerActionEngine,
  "Find candidates": routes.employerJobs,
};

export default function EmployerMarketInsightPage() {
  const topIndustries = industrySignals.slice().sort((a, b) => b.shortageIndex - a.shortageIndex).slice(0, 5);

  return (
    <main className="min-h-screen bg-[#F7F3EA] text-[#1E2A44]">
      <section className="border-b border-[#EAE3D3] bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end lg:px-8">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#E3D8BC] bg-[#F6F1E4] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#B08A44]">
              <BarChart3 size={14} />
              Market Insight
            </p>
            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-5xl">Talent market signals in one operating view.</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[#5D6470] sm:text-lg">
              Combine urgent workforce alerts, hiring velocity, talent supply, industry shortage pressure, and long-range forecast signals before deciding whether to hire, upskill, or mobilize internally.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={routes.employerSimulator} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#B08A44] px-5 text-sm font-bold text-white hover:bg-[#97742F]">
                Run Simulation
                <ArrowRight size={16} />
              </Link>
              <Link href={routes.employerActionEngine} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#B08A44] bg-white px-5 text-sm font-bold text-[#B08A44] hover:bg-[#F6F1E4]">
                Open Workforce Planner
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>

          <aside className="grid gap-3 rounded-lg border border-[#EAE3D3] bg-[#F7F3EA] p-4">
            {[
              ["Projected workforce gap", manufacturingSimulationSummary.projectedGap.toLocaleString(), "roles by 2031"],
              ["Cost exposure", `RM ${(manufacturingSimulationSummary.costOfInaction / 1e6).toFixed(1)}M`, "inaction risk"],
              ["Company profile", manufacturingEmployerProfile.name, `${manufacturingEmployerProfile.employeeCount.toLocaleString()} employees`],
            ].map(([label, value, detail]) => (
              <div key={label} className="rounded-lg bg-white p-4">
                <p className="text-[10px] font-bold uppercase tracking-wide text-[#9CA3AF]">{label}</p>
                <p className="mt-1 text-xl font-black text-[#1E2A44]">{value}</p>
                <p className="mt-1 text-xs font-semibold text-[#6B7280]">{detail}</p>
              </div>
            ))}
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-3">
          {employerAttentionItems.map((item) => (
            <article key={item.id} className="rounded-lg border border-[#EAE3D3] bg-white p-5 shadow-[0_8px_24px_rgba(70,60,35,0.06)]">
              <div className="flex items-start justify-between gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${toneStyles[item.tone]}`}>
                  <AlertTriangle size={18} />
                </div>
                <Pill tone={item.tone}>{item.meta}</Pill>
              </div>
              <h2 className="mt-4 text-lg font-bold text-[#1E2A44]">{item.title}</h2>
              <p className="mt-2 min-h-[72px] text-sm leading-6 text-[#5D6470]">{item.detail}</p>
              <Link href={attentionLinks[item.action] ?? routes.employerActionEngine} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#B08A44] hover:underline">
                {item.action}
                <ArrowUpRight size={15} />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-[#EAE3D3] bg-white py-8">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:px-8">
          <article className="rounded-lg border border-[#EAE3D3] bg-[#F7F3EA] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#B08A44]">Hiring velocity</p>
                <h2 className="mt-2 text-2xl font-bold text-[#1E2A44]">Role speed and cost signals</h2>
              </div>
              <LineChart size={22} className="text-[#087C7E]" />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-white p-4">
                <p className="text-[10px] font-bold uppercase text-[#9CA3AF]">Time-to-hire</p>
                <p className="mt-1 text-3xl font-bold text-[#1E2A44]">18 Days</p>
                <p className="mt-1 text-xs font-bold text-[#087C7E]">2.4% faster</p>
              </div>
              <div className="rounded-lg bg-white p-4">
                <p className="text-[10px] font-bold uppercase text-[#9CA3AF]">Cost-per-hire</p>
                <p className="mt-1 text-3xl font-bold text-[#1E2A44]">$4,200</p>
                <p className="mt-1 text-xs font-bold text-[#B08A44]">1.2% higher</p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {velocitySignals.map((signal) => (
                <div key={signal.label}>
                  <div className="mb-2 flex items-center justify-between text-xs font-bold">
                    <span>{signal.label}</span>
                    <span className="text-[#6B7280]">{signal.benchmark}</span>
                  </div>
                  <div className="h-3 rounded-full bg-[#E8E3EA]">
                    <div className={`h-3 rounded-full ${signal.color}`} style={{ width: `${signal.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-lg border border-[#EAE3D3] bg-white p-5 shadow-[0_8px_24px_rgba(70,60,35,0.06)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#B08A44]">Marketplace snapshot</p>
                <h2 className="mt-2 text-2xl font-bold text-[#1E2A44]">Supply, demand, and pressure points</h2>
              </div>
              <BriefcaseBusiness size={22} className="text-[#B08A44]" />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {marketSnapshot.map(({ label, value, detail, icon: Icon, tone }) => (
                <div key={label} className="rounded-lg border border-[#EAE3D3] bg-[#F7F3EA] p-4">
                  <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg border ${toneStyles[tone]}`}>
                    <Icon size={16} />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#9CA3AF]">{label}</p>
                  <p className="mt-1 text-xl font-bold text-[#1E2A44]">{value}</p>
                  <p className="mt-2 text-sm leading-6 text-[#5D6470]">{detail}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.75fr)] lg:px-8">
        <article className="rounded-lg border border-[#EAE3D3] bg-white p-5 shadow-[0_8px_24px_rgba(70,60,35,0.06)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#B08A44]">Industry shortage index</p>
              <h2 className="mt-2 text-2xl font-bold text-[#1E2A44]">Where competition is tightening</h2>
            </div>
            <Link href={routes.employerJobs} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#EAE3D3] bg-white px-4 text-sm font-bold text-[#1E2A44] hover:bg-[#F7F3EA]">
              Review Jobs
              <ArrowUpRight size={15} />
            </Link>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[720px] border-separate border-spacing-0 text-left">
              <thead>
                <tr className="text-xs font-bold uppercase text-[#9CA3AF]">
                  <th className="border-b border-[#EAE3D3] pb-3">Industry</th>
                  <th className="border-b border-[#EAE3D3] px-4 pb-3">Open Roles</th>
                  <th className="border-b border-[#EAE3D3] px-4 pb-3">Candidate Supply</th>
                  <th className="border-b border-[#EAE3D3] px-4 pb-3">Shortage Index</th>
                  <th className="border-b border-[#EAE3D3] pb-3">Priority Skills</th>
                </tr>
              </thead>
              <tbody>
                {topIndustries.map((industry) => (
                  <tr key={industry.industry}>
                    <td className="border-b border-[#F1EDE0] py-4">
                      <p className="font-bold text-[#1E2A44]">{industry.industry}</p>
                      <p className="mt-1 text-xs font-semibold text-[#6B7280]">{industry.topRoles.slice(0, 2).join(", ")}</p>
                    </td>
                    <td className="border-b border-[#F1EDE0] px-4 py-4 text-sm font-bold">{industry.openRoles}</td>
                    <td className="border-b border-[#F1EDE0] px-4 py-4 text-sm font-bold">{industry.candidateSupply.toLocaleString()}</td>
                    <td className="border-b border-[#F1EDE0] px-4 py-4">
                      <div className="flex items-center gap-3">
                        <span className="w-9 text-sm font-bold text-[#B08A44]">{industry.shortageIndex}</span>
                        <div className="h-2 w-28 rounded-full bg-[#F1EDE0]">
                          <div className="h-2 rounded-full bg-[#B08A44]" style={{ width: `${industry.shortageIndex}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="border-b border-[#F1EDE0] py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {industry.topSkills.slice(0, 3).map((skill) => (
                          <span key={skill} className="rounded-full bg-[#EFF5F0] px-2.5 py-1 text-xs font-bold text-[#087C7E]">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-lg border border-[#EAE3D3] bg-[#1E2A44] p-5 text-white shadow-[0_8px_24px_rgba(26,16,51,0.16)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-white/50">Workforce forecast</p>
              <h2 className="mt-2 text-2xl font-bold">Demographic Clock</h2>
            </div>
            <LineChart size={22} className="text-[#39BFE8]" />
          </div>
          <p className="mt-4 text-sm leading-6 text-white/75">
            Workforce availability forecast for aging Asian labor markets. Plan mobility and skills transfer before hiring demand peaks.
          </p>
          <div className="mt-5 rounded-lg bg-white/10 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wide text-white/45">Projected decline</p>
            <p className="mt-2 text-5xl font-bold text-[#39BFE8]">31%</p>
            <p className="mt-2 text-sm font-semibold text-white/70">Working-age population by 2050</p>
          </div>
          <div className="mt-5 grid gap-3">
            {workforceForecast.map((point) => (
              <div key={point.year} className="rounded-lg bg-white p-3 text-[#1E2A44]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold">{point.year}</p>
                    <p className="text-xs font-semibold text-[#6B7280]">{point.population}</p>
                  </div>
                  <span className="text-sm font-bold text-[#B08A44]">{point.value}%</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-[#F1EDE0]">
                  <div className="h-2 rounded-full bg-[#B08A44]" style={{ width: `${point.value}%` }} />
                </div>
              </div>
            ))}
          </div>
          <Link href={routes.employerSimulator} className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-bold text-[#1E2A44] hover:bg-[#F6F1E4]">
            Open Workforce Simulator
            <ArrowUpRight size={15} />
          </Link>
        </article>
      </section>
    </main>
  );
}
