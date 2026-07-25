"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import worldCountries from "world-atlas/countries-110m.json";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  ExternalLink,
  Globe2,
  Loader2,
  MapPin,
  Search,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { EmployeeTopNav } from "@/components/employee/EmployeeTopNav";
import { getAuthToken, getJson, postJson } from "@/lib/api";
import type { BackendApplication, BackendJob, EmployeeDashboardData } from "@/lib/backendTypes";
import {
  demoInternalGigs,
  marketplaceCompanies,
  marketplaceJobs,
  regionalTalentSignals,
} from "@/lib/mock-data";

type OpportunityType = "Internal" | "External";

type Opportunity = {
  id: string;
  jobId?: number;
  title: string;
  company: string;
  type: OpportunityType;
  matchScore: number;
  location: string;
  workStyle: string;
  salary: string;
  tags: string[];
  urgency: string;
  applied?: boolean;
};

const asiaMarkets = [
  {
    country: "Singapore",
    city: "Singapore",
    tooltipPosition: "left-[55%] top-[66%]",
    growth: 78,
    skillNeed: 91,
    salary: 36,
    shortage: 74,
    visa: 88,
    remote: 63,
    future: 82,
    fitScore: 91,
    topSkills: ["AI product", "UX research", "cybersecurity"],
  },
  {
    country: "Japan",
    city: "Tokyo",
    tooltipPosition: "left-[72%] top-[24%]",
    growth: 64,
    skillNeed: 73,
    salary: 28,
    shortage: 81,
    visa: 69,
    remote: 41,
    future: 76,
    fitScore: 78,
    topSkills: ["automation", "data analytics", "care tech"],
  },
  {
    country: "South Korea",
    city: "Seoul",
    tooltipPosition: "left-[64%] top-[34%]",
    growth: 70,
    skillNeed: 79,
    salary: 24,
    shortage: 69,
    visa: 65,
    remote: 46,
    future: 80,
    fitScore: 83,
    topSkills: ["AI tools", "growth marketing", "semiconductors"],
  },
  {
    country: "India",
    city: "Bengaluru",
    tooltipPosition: "left-[23%] top-[54%]",
    growth: 86,
    skillNeed: 84,
    salary: 18,
    shortage: 66,
    visa: 58,
    remote: 71,
    future: 89,
    fitScore: 88,
    topSkills: ["cloud", "product analytics", "full-stack"],
  },
  {
    country: "Vietnam",
    city: "Ho Chi Minh City",
    tooltipPosition: "left-[49%] top-[54%]",
    growth: 82,
    skillNeed: 76,
    salary: 21,
    shortage: 72,
    visa: 61,
    remote: 54,
    future: 85,
    fitScore: 81,
    topSkills: ["operations", "QA automation", "digital sales"],
  },
  {
    country: "Indonesia",
    city: "Jakarta",
    tooltipPosition: "left-[49%] top-[74%]",
    growth: 75,
    skillNeed: 70,
    salary: 15,
    shortage: 68,
    visa: 57,
    remote: 49,
    future: 79,
    fitScore: 77,
    topSkills: ["fintech", "mobile", "customer success"],
  },
];

const metricOptions = [
  { key: "growth", label: "Job growth", suffix: "%" },
  { key: "skillNeed", label: "Skills needed", suffix: "%" },
  { key: "shortage", label: "Shortages", suffix: "%" },
  { key: "remote", label: "Remote roles", suffix: "%" },
  { key: "future", label: "Future demand", suffix: "%" },
] as const;

type MarketMetric = (typeof metricOptions)[number]["key"];

const toneStyles: Record<string, string> = {
  pink: "border-[#E3D8BC] bg-[#F6F1E4] text-[#B08A44]",
  teal: "border-[#CBDFD4] bg-[#E7F0E9] text-[#17694F]",
  green: "border-[#CBDFD4] bg-[#EFF5F0] text-[#17694F]",
  purple: "border-[#DFD6BE] bg-[#E7F0E9] text-[#17694F]",
};

function initialsFromName(name: string) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return initials || "E";
}

function Pill({ children, tone = "purple" }: { children: ReactNode; tone?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${toneStyles[tone]}`}>
      {children}
    </span>
  );
}

function formatSalary(min?: number | null, max?: number | null) {
  if (!min && !max) return "Salary not listed";
  if (min && max) return `RM ${min.toLocaleString()}-${max.toLocaleString()}`;
  return `RM ${(min ?? max ?? 0).toLocaleString()}+`;
}

function opportunityFromBackend(job: BackendJob, applications: BackendApplication[]): Opportunity {
  const hasApplied = applications.some((application) => application.job_id === job.id);
  return {
    id: `backend-${job.id}`,
    jobId: job.id,
    title: job.title,
    company: job.department_name ? `${job.department_name} Team` : "Hiring Team",
    type: "External",
    matchScore: Math.max(68, 94 - job.required_skills.length * 4),
    location: job.location ?? "Malaysia",
    workStyle: job.work_style,
    salary: formatSalary(job.salary_min, job.salary_max),
    tags: job.required_skills.slice(0, 4),
    urgency: job.applications_count > 20 ? "High demand" : "Open",
    applied: hasApplied,
  };
}

function fallbackOpportunities(): Opportunity[] {
  const internal = demoInternalGigs.map((gig) => ({
    id: gig.id,
    title: gig.title,
    company: gig.team,
    type: "Internal" as const,
    matchScore: gig.matchScore,
    location: gig.duration,
    workStyle: "Internal gig",
    salary: "Internal mobility",
    tags: gig.skills.slice(0, 4),
    urgency: gig.businessNeed,
  }));
  const external = marketplaceJobs.map((job) => {
    const company = marketplaceCompanies.find((item) => item.id === job.companyId);
    return {
      id: job.id,
      title: job.title,
      company: company?.name ?? "Hiring Company",
      type: "External" as const,
      matchScore: Math.max(70, 96 - job.requiredSkills.length * 4),
      location: job.region,
      workStyle: job.workStyle,
      salary: `RM ${job.salaryRange[0].toLocaleString()}-${job.salaryRange[1].toLocaleString()}`,
      tags: job.requiredSkills.slice(0, 4),
      urgency: job.urgency,
    };
  });
  return [...internal, ...external];
}

function AsiaMarketMap() {
  const [selectedMetric, setSelectedMetric] = useState<MarketMetric>("growth");
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState("Singapore");
  const metric = metricOptions.find((item) => item.key === selectedMetric) ?? metricOptions[0];
  const rankedMarkets = [...asiaMarkets].sort((a, b) => b[selectedMetric] - a[selectedMetric]);
  const activeMarket =
    asiaMarkets.find((market) => market.country === hoveredCountry) ??
    asiaMarkets.find((market) => market.country === selectedCountry) ??
    rankedMarkets[0];
  const marketByCountry = new Map(asiaMarkets.map((market) => [market.country, market]));

  const getCountryColor = (value: number) => {
    if (value >= 85) return "#B08A44";
    if (value >= 75) return "#17694F";
    if (value >= 65) return "#17694F";
    if (value >= 55) return "#B08A44";
    return "#DFD6BE";
  };

  return (
    <section className="rounded-lg border border-[#EAE3D3] bg-white p-5 shadow-[0_8px_32px_rgba(26,16,51,0.06)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-[#E7F0E9] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#17694F]">
            <Globe2 size={14} />
            Asia market signals
          </p>
          <h2 className="mt-3 text-2xl font-bold text-[#1E2A44]">Where opportunities are growing</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B7280]">
            Regional signals are illustrative and help compare demand, skills, remote share, and future opportunity.
          </p>
        </div>
        <div className="rounded-lg bg-[#FFFFFF] px-4 py-3">
          <p className="text-xs font-bold uppercase text-[#9CA3AF]">Top market</p>
          <p className="mt-1 text-lg font-bold text-[#1E2A44]">{rankedMarkets[0].country}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {metricOptions.map((item) => (
          <button
            type="button"
            key={item.key}
            onClick={() => setSelectedMetric(item.key)}
            className={`rounded-full border px-3 py-2 text-xs font-bold transition ${
              selectedMetric === item.key
                ? "border-[#B08A44] bg-[#F6F1E4] text-[#B08A44]"
                : "border-[#EAE3D3] bg-white text-[#6B7280] hover:border-[#DFD6BE]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_340px]">
        <div className="relative min-h-[340px] overflow-hidden rounded-lg border border-[#EAE3D3] bg-[#F7F3EA]">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ center: [95, 22], scale: 460 }}
            width={920}
            height={520}
            className="h-auto w-full"
            role="img"
            aria-label="Interactive Asia market map"
          >
            <Geographies geography={worldCountries}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const countryName = geo.properties.name as string;
                  const market = marketByCountry.get(countryName);
                  const value = market?.[selectedMetric] ?? 0;
                  const isActive = market?.country === activeMarket.country;
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      tabIndex={market ? 0 : -1}
                      aria-label={market ? `${market.country}: ${metric.label} ${value}${metric.suffix}` : countryName}
                      onMouseEnter={() => market && setHoveredCountry(market.country)}
                      onMouseLeave={() => setHoveredCountry(null)}
                      onClick={() => market && setSelectedCountry(market.country)}
                      onFocus={() => market && setHoveredCountry(market.country)}
                      onBlur={() => setHoveredCountry(null)}
                      style={{
                        default: {
                          fill: market ? getCountryColor(value) : "#EFF5F0",
                          stroke: isActive ? "#1E2A44" : "#FFFFFF",
                          strokeWidth: isActive ? 1.8 : 0.8,
                          outline: "none",
                        },
                        hover: {
                          fill: market ? getCountryColor(value) : "#EAE3D3",
                          stroke: "#1E2A44",
                          strokeWidth: 1.8,
                          outline: "none",
                          cursor: market ? "pointer" : "default",
                        },
                        pressed: { fill: market ? getCountryColor(value) : "#EAE3D3", outline: "none" },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>
          <div className={`absolute z-10 w-56 rounded-lg border border-[#EAE3D3] bg-white p-4 shadow-[0_16px_44px_rgba(26,16,51,0.16)] ${activeMarket.tooltipPosition}`}>
            <p className="font-bold text-[#1E2A44]">{activeMarket.country}</p>
            <p className="mt-1 text-xs font-semibold text-[#9CA3AF]">{activeMarket.city}</p>
            <div className="mt-3 grid gap-2 text-xs font-semibold text-[#6B7280]">
              <div className="flex justify-between"><span>{metric.label}</span><span className="font-bold text-[#B08A44]">{activeMarket[selectedMetric]}{metric.suffix}</span></div>
              <div className="flex justify-between"><span>Skill shortage</span><span className="font-bold text-[#B08A44]">{activeMarket.shortage}%</span></div>
              <div className="flex justify-between"><span>Fit score</span><span className="font-bold text-[#17694F]">{activeMarket.fitScore}%</span></div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {rankedMarkets.slice(0, 4).map((market) => (
            <button
              type="button"
              key={market.country}
              onMouseEnter={() => setHoveredCountry(market.country)}
              onMouseLeave={() => setHoveredCountry(null)}
              onFocus={() => setHoveredCountry(market.country)}
              onBlur={() => setHoveredCountry(null)}
              onClick={() => setSelectedCountry(market.country)}
              className={`w-full rounded-lg border p-4 text-left transition ${
                selectedCountry === market.country ? "border-[#B08A44] bg-[#F6F1E4]" : "border-[#EAE3D3] bg-[#FFFFFF] hover:bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-[#1E2A44]">{market.country}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-[#9CA3AF]">
                    <MapPin size={13} />
                    {market.city}
                  </p>
                </div>
                <span className="text-lg font-black text-[#B08A44]">{market[selectedMetric]}{metric.suffix}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {market.topSkills.map((skill) => (
                  <span key={skill} className="rounded-full bg-white px-2 py-1 text-xs font-bold text-[#17694F]">
                    {skill}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function OpportunityCard({ opportunity, onApply }: { opportunity: Opportunity; onApply: (opportunity: Opportunity) => void }) {
  const isInternal = opportunity.type === "Internal";
  return (
    <article className="rounded-lg border border-[#EAE3D3] bg-white p-5 shadow-[0_8px_28px_rgba(26,16,51,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <span className={`flex h-11 w-11 items-center justify-center rounded-lg border ${isInternal ? toneStyles.pink : toneStyles.teal}`}>
          {isInternal ? <Building2 size={20} /> : <ExternalLink size={20} />}
        </span>
        <Pill tone={isInternal ? "pink" : opportunity.applied ? "green" : "teal"}>
          {opportunity.applied ? "Applied" : isInternal ? "Internal gig" : "External role"}
        </Pill>
      </div>
      <h3 className="mt-5 text-lg font-bold text-[#1E2A44]">{opportunity.title}</h3>
      <p className="mt-1 text-sm font-semibold text-[#6B7280]">{opportunity.company}</p>
      <p className="mt-2 text-xs font-bold uppercase text-[#9CA3AF]">
        {opportunity.location} / {opportunity.workStyle}
      </p>
      <p className="mt-2 text-sm font-bold text-[#1E2A44]">{opportunity.salary}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {opportunity.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-[#F7F3EA] px-2.5 py-1 text-xs font-bold text-[#17694F]">
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#EAE3D3] pt-4">
        <div>
          <p className="text-sm font-black text-[#17694F]">{opportunity.matchScore}% match</p>
          <p className="mt-1 text-xs font-semibold text-[#9CA3AF]">{opportunity.urgency}</p>
        </div>
        <button
          type="button"
          onClick={() => onApply(opportunity)}
          disabled={opportunity.applied || isInternal}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#1E2A44] px-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-55"
        >
          {opportunity.applied ? "Applied" : isInternal ? "View details" : "Apply"}
          <ArrowUpRight size={15} />
        </button>
      </div>
    </article>
  );
}

export default function EmployeeMarketplacePage() {
  const [dashboard, setDashboard] = useState<EmployeeDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"All" | OpportunityType>("All");
  const [workStyleFilter, setWorkStyleFilter] = useState("All");

  useEffect(() => {
    if (!getAuthToken()) {
      setIsLoading(false);
      return;
    }
    getJson<EmployeeDashboardData>("/dashboard/employee", { auth: true })
      .then(setDashboard)
      .catch(() => setDashboard(null))
      .finally(() => setIsLoading(false));
  }, []);

  const fullName = dashboard?.full_name ?? "Employee";
  const opportunities = useMemo(() => {
    const backendJobs = dashboard?.jobs.length
      ? dashboard.jobs.map((job) => opportunityFromBackend(job, dashboard.applications))
      : [];
    return backendJobs.length ? [...fallbackOpportunities().filter((item) => item.type === "Internal"), ...backendJobs] : fallbackOpportunities();
  }, [dashboard]);
  const workStyles = ["All", ...Array.from(new Set(opportunities.map((item) => item.workStyle)))];
  const filtered = opportunities.filter((item) => {
    const matchesQuery = `${item.title} ${item.company} ${item.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase());
    const matchesType = typeFilter === "All" || item.type === typeFilter;
    const matchesWorkStyle = workStyleFilter === "All" || item.workStyle === workStyleFilter;
    return matchesQuery && matchesType && matchesWorkStyle;
  });

  const handleApply = async (opportunity: Opportunity) => {
    if (!opportunity.jobId || opportunity.applied) return;
    if (!getAuthToken()) {
      setMessage("Sign in as an employee to apply for this role.");
      return;
    }
    try {
      await postJson(`/jobs/${opportunity.jobId}/apply`, {}, { auth: true });
      const nextDashboard = await getJson<EmployeeDashboardData>("/dashboard/employee", { auth: true });
      setDashboard(nextDashboard);
      setMessage(`Application submitted for ${opportunity.title}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to submit application.");
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F3EA] text-[#1E2A44]">
      <EmployeeTopNav initials={initialsFromName(fullName)} name={fullName} />

      <section className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-[#F6F1E4] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#B08A44]">
              <Sparkles size={14} />
              Marketplace
            </p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Jobs and opportunities</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#6B7280]">
              Compare Asia market signals, internal skill gigs, and external roles from one focused employee workspace.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-[#EAE3D3] bg-white px-4 py-3">
              <p className="text-xs font-bold uppercase text-[#9CA3AF]">Open roles</p>
              <p className="mt-1 text-2xl font-black text-[#1E2A44]">{opportunities.filter((item) => item.type === "External").length}</p>
            </div>
            <div className="rounded-lg border border-[#EAE3D3] bg-white px-4 py-3">
              <p className="text-xs font-bold uppercase text-[#9CA3AF]">Internal gigs</p>
              <p className="mt-1 text-2xl font-black text-[#B08A44]">{opportunities.filter((item) => item.type === "Internal").length}</p>
            </div>
            <div className="rounded-lg border border-[#EAE3D3] bg-white px-4 py-3">
              <p className="text-xs font-bold uppercase text-[#9CA3AF]">Regions</p>
              <p className="mt-1 text-2xl font-black text-[#17694F]">{regionalTalentSignals.length}</p>
            </div>
          </div>
        </div>

        <AsiaMarketMap />

        <section className="rounded-lg border border-[#EAE3D3] bg-white p-4 shadow-[0_8px_32px_rgba(26,16,51,0.06)]">
          <div className="flex flex-col gap-3 lg:flex-row">
            <label className="flex min-h-12 flex-1 items-center gap-3 rounded-lg bg-[#F7F3EA] px-4 text-sm text-[#9CA3AF]">
              <Search size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full bg-transparent text-[#1E2A44] outline-none placeholder:text-[#9CA3AF]"
                placeholder="Search roles, companies, or skills..."
              />
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex">
              {(["All", "Internal", "External"] as Array<"All" | OpportunityType>).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setTypeFilter(filter)}
                  className={`rounded-lg px-4 py-3 text-sm font-bold transition ${
                    typeFilter === filter ? "bg-[#B08A44] text-white" : "bg-[#F7F3EA] text-[#6B7280] hover:bg-[#F6F1E4]"
                  }`}
                >
                  {filter}
                </button>
              ))}
              <select
                value={workStyleFilter}
                onChange={(event) => setWorkStyleFilter(event.target.value)}
                className="rounded-lg border border-[#EAE3D3] bg-white px-4 py-3 text-sm font-bold text-[#6B7280] outline-none"
                aria-label="Filter by work style"
              >
                {workStyles.map((style) => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {message && (
          <div className="rounded-lg border border-[#CBDFD4] bg-[#EFF5F0] px-4 py-3 text-sm font-bold text-[#17694F]">
            {message}
          </div>
        )}

        <section className="rounded-lg border border-[#EAE3D3] bg-white p-5 shadow-[0_8px_32px_rgba(26,16,51,0.06)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-[#E7F0E9] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#17694F]">
                <BriefcaseBusiness size={14} />
                Opportunities
              </p>
              <h2 className="mt-3 text-2xl font-bold text-[#1E2A44]">Matched jobs and gigs</h2>
              <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                Showing {filtered.length} opportunities from marketplace and authenticated backend job data.
              </p>
            </div>
            {isLoading && (
              <p className="inline-flex items-center gap-2 text-sm font-bold text-[#6B7280]">
                <Loader2 size={16} className="animate-spin text-[#B08A44]" />
                Loading backend roles
              </p>
            )}
          </div>

          {!filtered.length ? (
            <div className="mt-5 rounded-lg border border-dashed border-[#DFD6BE] bg-[#F7F3EA] p-6 text-sm font-semibold leading-6 text-[#6B7280]">
              <TriangleAlert size={18} className="mb-2 text-[#B08A44]" />
              No opportunities match the current filters.
            </div>
          ) : (
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {filtered.map((opportunity) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} onApply={handleApply} />
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
