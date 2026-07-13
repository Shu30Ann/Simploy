"use client";

import { useCallback, useEffect, useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import worldCountries from "world-atlas/countries-110m.json";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  ClipboardCheck,
  ExternalLink,
  Globe2,
  MapPin,
  Search,
  Sparkles,
} from "lucide-react";
import { ProfileMenu } from "@/components/ProfileMenu";
import RiasecAssessment from "@/components/RiasecAssessment";
import CareerGpsRoadmapPanel from "@/components/career-gps/CareerGpsRoadmapPanel";
import CareerNorthStarPanel from "@/components/career-gps/CareerNorthStarPanel";
import { getAuthToken, getJson, postJson } from "@/lib/api";
import type { BackendApplication, BackendJob, EmployeeDashboardData } from "@/lib/backendTypes";
import {
  demoEmployeeProfile,
  demoInternalGigs,
  marketplaceCompanies,
  marketplaceJobs,
} from "@/lib/mock-data";
import {
  loadRiasecResult,
  markRiasecSkipped,
  RIASEC_SKIPPED_KEY,
  saveRiasecResult,
  type RiasecResult,
} from "@/lib/riasec";

const careerCommandCenter = {
  readiness: demoEmployeeProfile.readinessScore,
  nextRole: demoEmployeeProfile.targetRole,
  missingSkills: demoEmployeeProfile.missingSkills.length,
  nextAction: demoEmployeeProfile.nextAction,
};

const opportunities = [
  ...demoInternalGigs.map((gig) => ({
    title: gig.title,
    company: gig.team,
    type: "Internal",
    match: `${gig.matchScore}%`,
    location: gig.duration,
    tags: gig.skills,
    tone: gig.tone,
  })),
  ...marketplaceJobs.slice(2, 7).map((job, index) => ({
    title: job.title,
    company: marketplaceCompanies.find((company) => company.id === job.companyId)?.name ?? "Hiring Company",
    type: "External",
    match: `${Math.max(72, 94 - index * 3)}%`,
    location: `${job.workStyle} - ${job.region}`,
    tags: job.requiredSkills.slice(0, 3),
    tone: ["teal", "green", "blue", "pink", "teal"][index],
  })),
];

type Opportunity = (typeof opportunities)[number] & { jobId?: number; applied?: boolean };

function opportunityFromJob(job: BackendJob, applications: BackendApplication[]): Opportunity {
  const hasApplied = applications.some((application) => application.job_id === job.id);
  return {
    title: job.title,
    company: job.department_name ? `${job.department_name} Team` : "Hiring Team",
    type: "External",
    match: `${Math.max(68, 94 - job.required_skills.length * 4)}%`,
    location: job.location ?? job.work_style,
    tags: job.required_skills.slice(0, 3),
    tone: hasApplied ? "green" : "teal",
    jobId: job.id,
    applied: hasApplied,
  };
}

const marketMetrics = [
  { key: "growth", label: "Job growth", suffix: "%", legend: "Where jobs are growing" },
  { key: "skillNeed", label: "Skills needed", suffix: "%", legend: "Countries that need your skills" },
  { key: "salary", label: "Salary gap", suffix: "%", legend: "Salary difference vs. current market" },
  { key: "shortage", label: "Shortages", suffix: "%", legend: "Skill shortage intensity" },
  { key: "visa", label: "Visa friendly", suffix: "/100", legend: "Visa friendliness for skilled workers" },
  { key: "remote", label: "Remote roles", suffix: "%", legend: "Remote opportunity share" },
  { key: "future", label: "Future demand", suffix: "%", legend: "Future demand prediction" },
] as const;

type MarketMetricKey = (typeof marketMetrics)[number]["key"];

const asiaGeo = worldCountries;

const asiaMarkets: Array<{
  country: string;
  city: string;
  tooltipPosition: string;
  growth: number;
  skillNeed: number;
  salary: number;
  shortage: number;
  visa: number;
  remote: number;
  future: number;
  fitScore: number;
  demand: string;
  salaryUpside: string;
  visaFriendliness: string;
  remoteRoles: string;
  recommendedRating: string;
  averageSalary: string;
  employability: number;
  topSkills: string[];
}> = [
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
    demand: "Very high",
    salaryUpside: "+36%",
    visaFriendliness: "Excellent",
    remoteRoles: "1,240",
    recommendedRating: "Strong",
    averageSalary: "SGD 124k",
    employability: 92,
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
    demand: "High",
    salaryUpside: "+28%",
    visaFriendliness: "Moderate",
    remoteRoles: "680",
    recommendedRating: "Good",
    averageSalary: "JPY 11.2m",
    employability: 78,
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
    demand: "High",
    salaryUpside: "+24%",
    visaFriendliness: "Moderate",
    remoteRoles: "740",
    recommendedRating: "Strong",
    averageSalary: "KRW 92m",
    employability: 83,
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
    demand: "Very high",
    salaryUpside: "+18%",
    visaFriendliness: "Developing",
    remoteRoles: "2,180",
    recommendedRating: "Strong",
    averageSalary: "INR 34L",
    employability: 88,
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
    demand: "High",
    salaryUpside: "+21%",
    visaFriendliness: "Moderate",
    remoteRoles: "910",
    recommendedRating: "Good",
    averageSalary: "USD 38k",
    employability: 81,
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
    demand: "Growing",
    salaryUpside: "+15%",
    visaFriendliness: "Developing",
    remoteRoles: "860",
    recommendedRating: "Good",
    averageSalary: "IDR 520m",
    employability: 77,
    topSkills: ["fintech", "mobile", "customer success"],
  },
];

const toneStyles: Record<string, string> = {
  pink: "bg-[#F6F1E4] text-[#B08A44] border-[#E3D8BC]",
  teal: "bg-[#E7F0E9] text-[#114F3B] border-[#CBDFD4]",
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

function OpportunityCard({ job, onApply }: { job: Opportunity; onApply?: (job: Opportunity) => void }) {
  const isInternal = job.type === "Internal";

  return (
    <article className="rounded-lg border border-[#EAE3D3] bg-white p-5 shadow-[0_4px_24px_rgba(70,60,35,0.08)]">
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
      <div className="mt-5 flex items-center justify-between border-t border-[#EAE3D3] pt-4">
        <span className="text-sm font-bold text-[#114F3B]">
          {job.match} {isInternal ? "skill fit" : "match"}
        </span>
        <button
          type="button"
          onClick={() => onApply?.(job)}
          disabled={job.applied}
          className="inline-flex items-center gap-1 rounded-lg bg-[#F6F1E4] px-3 py-2 text-sm font-bold text-[#B08A44] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {job.applied ? "Applied" : isInternal ? "Join Gig" : "Apply"}
          <ArrowUpRight size={14} />
        </button>
      </div>
    </article>
  );
}

function AsiaMarketMap() {
  const [selectedMetric, setSelectedMetric] = useState<MarketMetricKey>("growth");
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>("Singapore");
  const [activeMetricInfo, setActiveMetricInfo] = useState<MarketMetricKey | null>(null);
  const metric = marketMetrics.find((item) => item.key === selectedMetric) ?? marketMetrics[0];
  const infoMetric = marketMetrics.find((item) => item.key === activeMetricInfo) ?? null;
  const rankedMarkets = [...asiaMarkets].sort((a, b) => b[selectedMetric] - a[selectedMetric]);
  const leadingMarket = rankedMarkets[0];
  const activeMarket =
    asiaMarkets.find((market) => market.country === hoveredCountry) ??
    asiaMarkets.find((market) => market.country === selectedCountry) ??
    leadingMarket;
  const marketByCountry = new Map(asiaMarkets.map((market) => [market.country, market]));

  const getCountryColor = (value: number) => {
    if (value >= 85) return "#B08A44";
    if (value >= 75) return "#17694F";
    if (value >= 65) return "#22C55E";
    if (value >= 55) return "#F59E0B";
    return "#DFD6BE";
  };

  return (
    <section
      aria-labelledby="asia-market-title"
      className="w-full rounded-lg border border-[#CBDFD4] bg-white p-4 shadow-[0_4px_24px_rgba(70,60,35,0.08)] xl:col-span-2 xl:order-last"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#CBDFD4] bg-[#E7F0E9] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#114F3B]">
            <Globe2 size={14} />
            Asia market signals
          </p>
          <h2 id="asia-market-title" className="mt-2 text-xl font-bold">
            Where jobs are growing across Asia
          </h2>
        </div>
        <div className="rounded-lg border border-[#EAE3D3] bg-[#F7F3EA] px-4 py-3">
          <p className="text-xs font-bold uppercase text-[#9CA3AF]">Top market</p>
          <p className="mt-1 text-lg font-bold text-[#1E2A44]">{leadingMarket.country}</p>
          <p className="text-sm font-semibold text-[#114F3B]">
            {leadingMarket[selectedMetric]}
            {metric.suffix}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {marketMetrics.map((item) => (
          <div key={item.key} className="relative">
            <button
              type="button"
              onClick={() => {
                setSelectedMetric(item.key);
                setActiveMetricInfo(activeMetricInfo === item.key ? null : item.key);
              }}
              onMouseEnter={() => setActiveMetricInfo(item.key)}
              className={`rounded-full border px-3 py-2 text-xs font-bold transition ${
                selectedMetric === item.key
                  ? "border-[#17694F] bg-[#17694F] text-white"
                  : "border-[#DFD6C2] bg-white text-[#6B7280] hover:border-[#CBDFD4] hover:bg-[#EFF5F0]"
              }`}
              aria-expanded={activeMetricInfo === item.key}
            >
              {item.label}
            </button>
            {activeMetricInfo === item.key && (
              <div className="absolute left-0 top-11 z-20 w-56 rounded-lg border border-[#EAE3D3] bg-white p-3 text-xs font-semibold leading-5 text-[#6B7280] shadow-[0_16px_44px_rgba(26,16,51,0.14)]">
                <p className="font-bold text-[#1E2A44]">{item.label}</p>
                <p className="mt-1">{item.legend}.</p>
                <p className="mt-2 text-[#114F3B]">
                  {leadingMarket.country} leads with {leadingMarket[item.key]}
                  {item.suffix}.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {infoMetric && (
        <button
          type="button"
          onClick={() => setActiveMetricInfo(null)}
          className="mt-3 text-xs font-bold text-[#9CA3AF] hover:text-[#6B7280]"
        >
          Hide metric note
        </button>
      )}

      <div className="mt-4 grid items-stretch gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.7fr)]">
        <div className="relative w-full overflow-hidden rounded-lg border border-[#EAE3D3] bg-[#F7FBFF]">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ center: [95, 22], scale: 460 }}
            width={920}
            height={520}
            className="h-auto w-full"
            role="img"
            aria-label="Interactive Asia map colored by selected career metric"
          >
            <Geographies geography={asiaGeo}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const countryName = geo.properties.name as string;
                  const market = marketByCountry.get(countryName);
                  const isActive = market?.country === activeMarket.country;
                  const value = market?.[selectedMetric] ?? 0;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      tabIndex={market ? 0 : -1}
                      aria-label={
                        market
                          ? `${market.country}: ${metric.label} ${value}${metric.suffix}, skill shortage ${market.shortage}%, average salary ${market.averageSalary}, employability ${market.employability}%`
                          : countryName
                      }
                      onMouseEnter={() => market && setHoveredCountry(market.country)}
                      onMouseLeave={() => setHoveredCountry(null)}
                      onClick={() => market && setSelectedCountry(market.country)}
                      onFocus={() => market && setHoveredCountry(market.country)}
                      onBlur={() => market && setHoveredCountry(null)}
                      style={{
                        default: {
                          fill: market ? getCountryColor(value) : "#E8F1F5",
                          stroke: isActive ? "#1E2A44" : "#FFFFFF",
                          strokeWidth: isActive ? 1.8 : 0.8,
                          outline: "none",
                        },
                        hover: {
                          fill: market ? getCountryColor(value) : "#DCEAF0",
                          stroke: "#1E2A44",
                          strokeWidth: market ? 1.8 : 0.8,
                          outline: "none",
                          cursor: market ? "pointer" : "default",
                        },
                        pressed: {
                          fill: market ? getCountryColor(value) : "#DCEAF0",
                          outline: "none",
                        },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>

          <div className={`absolute z-10 w-56 rounded-lg border border-[#EAE3D3] bg-white p-4 shadow-[0_16px_44px_rgba(26,16,51,0.16)] ${activeMarket.tooltipPosition}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-[#1E2A44]">{activeMarket.country}</p>
                <p className="mt-1 text-xs font-semibold text-[#9CA3AF]">{activeMarket.city}</p>
              </div>
              <span className="rounded-full bg-[#EFF5F0] px-2 py-1 text-xs font-bold text-[#114F3B]">
                {activeMarket[selectedMetric]}
                {metric.suffix}
              </span>
            </div>
            <div className="mt-3 grid gap-2 text-xs font-semibold text-[#6B7280]">
              <div className="flex items-center justify-between">
                <span>Skill shortages</span>
                <span className="font-bold text-[#B08A44]">{activeMarket.shortage}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Your fit score</span>
                <span className="font-bold text-[#114F3B]">{activeMarket.fitScore}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Average salary</span>
                <span className="font-bold text-[#1E2A44]">{activeMarket.averageSalary}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Employability</span>
                <span className="font-bold text-[#059669]">{activeMarket.employability}%</span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-4 left-4 right-4 rounded-lg border border-white/80 bg-white/90 p-3 backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-bold text-[#1E2A44]">{metric.legend}</p>
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#6B7280]">
                {[
                  ["Low", "#DFD6BE"],
                  ["Medium", "#F59E0B"],
                  ["Strong", "#22C55E"],
                  ["High", "#17694F"],
                  ["Highest", "#B08A44"],
                ].map(([label, color]) => (
                  <span key={label} className="inline-flex items-center gap-1">
                    <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: color }} />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex max-h-[520px] flex-col gap-3 overflow-y-auto pr-1">
          <div className="rounded-lg border border-[#CBDFD4] bg-[#EFF5F0] p-4">
            <p className="text-xs font-bold uppercase text-[#114F3B]">Selected market</p>
            <p className="mt-2 text-lg font-bold text-[#1E2A44]">{activeMarket.country}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs font-bold sm:grid-cols-3 xl:grid-cols-2">
              <div className="rounded-lg bg-white p-2 text-[#114F3B]">
                {activeMarket.fitScore}%
                <span className="mt-1 block text-[10px] text-[#9CA3AF]">fit score</span>
              </div>
              <div className="rounded-lg bg-white p-2 text-[#B08A44]">
                {activeMarket.demand}
                <span className="mt-1 block text-[10px] text-[#9CA3AF]">demand</span>
              </div>
              <div className="rounded-lg bg-white p-2 text-[#1E2A44]">
                {activeMarket.salaryUpside}
                <span className="mt-1 block text-[10px] text-[#9CA3AF]">salary upside</span>
              </div>
              <div className="rounded-lg bg-white p-2 text-[#059669]">
                {activeMarket.visaFriendliness}
                <span className="mt-1 block text-[10px] text-[#9CA3AF]">visa</span>
              </div>
              <div className="rounded-lg bg-white p-2 text-[#6B46C1]">
                {activeMarket.remoteRoles}
                <span className="mt-1 block text-[10px] text-[#9CA3AF]">remote roles</span>
              </div>
              <div className="rounded-lg bg-white p-2 text-[#B08A44]">
                {activeMarket.recommendedRating}
                <span className="mt-1 block text-[10px] text-[#9CA3AF]">recommended</span>
              </div>
            </div>
            <p className="mt-3 rounded-lg bg-white px-3 py-2 text-xs font-semibold leading-5 text-[#6B7280]">
              Recommended for you: {activeMarket.recommendedRating} based on your product, analytics, and leadership
              skill profile.
            </p>
          </div>

          {rankedMarkets.slice(0, 3).map((market) => (
            <button
              type="button"
              key={market.country}
              onMouseEnter={() => setHoveredCountry(market.country)}
              onMouseLeave={() => setHoveredCountry(null)}
              onFocus={() => setHoveredCountry(market.country)}
              onBlur={() => setHoveredCountry(null)}
              onClick={() => setSelectedCountry(market.country)}
              className={`w-full rounded-lg border p-4 text-left transition hover:border-[#CBDFD4] hover:bg-white ${
                selectedCountry === market.country
                  ? "border-[#17694F] bg-white"
                  : "border-[#EAE3D3] bg-[#F7F3EA]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold">{market.country}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-[#9CA3AF]">
                    <MapPin size={13} />
                    {market.city}
                  </p>
                </div>
                <span className="text-lg font-bold text-[#114F3B]">
                  {market[selectedMetric]}
                  {metric.suffix}
                </span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-[#E7F0E9]">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${Math.min(market[selectedMetric], 100)}%`,
                    backgroundColor: getCountryColor(market[selectedMetric]),
                  }}
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {market.topSkills.map((skill) => (
                  <span key={skill} className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-[#6B7280]">
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

function SkillRoadmapModule({ onStartRoadmap }: { onStartRoadmap: () => void }) {
  const [hoveredMilestone, setHoveredMilestone] = useState<number | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<number | null>(null);
  const activeMilestone = hoveredMilestone ?? selectedMilestone;

  return (
    <section
      id="skills"
      aria-labelledby="skills-title"
      className="mt-8 rounded-2xl border border-[#EAE3D3] bg-white p-5 shadow-[0_8px_48px_rgba(70,60,35,0.08)] sm:p-7"
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-[#DFD6BE] bg-[#F1EDE0] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#6B46C1]">
            <GraduationCap size={14} />
            Skill Gaps and Roadmap
          </p>
          <h2 id="skills-title" className="mt-3 text-3xl font-bold tracking-tight sm:text-[40px]">
            Your clearest path to Product Manager.
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#6B7280] sm:text-base">
            Close the priority gaps, follow the recommended learning sequence, and unlock stronger internal gigs and
            external roles.
          </p>
        </div>
        <button
          type="button"
          onClick={onStartRoadmap}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#B08A44] px-6 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(70,60,35,0.18)]"
        >
          Start roadmap
          <ArrowUpRight size={16} />
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <article className="rounded-lg border border-[#E3D8BC] bg-[#FFF8FC] p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-[#9CA3AF]">Career readiness</p>
          <div className="mt-4 flex items-end gap-2">
            <p className="text-5xl font-bold text-[#B08A44]">{careerCommandCenter.readiness}%</p>
            <span className="pb-2 text-xs font-bold text-[#059669]">+12% after roadmap</span>
          </div>
          <div className="mt-4 h-3 rounded-full bg-white">
            <div className="h-3 rounded-full bg-[#B08A44]" style={{ width: `${careerCommandCenter.readiness}%` }} />
          </div>
        </article>

        <article className="rounded-lg border border-[#DFD6BE] bg-[#F7F3EA] p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-[#9CA3AF]">Missing skills</p>
          <p className="mt-4 text-4xl font-bold text-[#6B46C1]">{careerCommandCenter.missingSkills}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {skillGaps.slice(0, 2).map((gap) => (
              <span key={gap.skill} className="rounded-full bg-[#F1EDE0] px-3 py-1 text-xs font-bold text-[#6B46C1]">
                {gap.skill.replace(",", "")}
              </span>
            ))}
          </div>
        </article>

        <article className="rounded-lg border border-[#CBDFD4] bg-[#EFF5F0] p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-[#9CA3AF]">Recommended next role</p>
          <p className="mt-4 text-2xl font-bold leading-tight text-[#114F3B]">{careerCommandCenter.nextRole}</p>
          <p className="mt-3 text-sm leading-6 text-[#6B7280]">Best fit based on analytics, leadership, and customer insight.</p>
        </article>

        <article className="rounded-lg border border-[#EAE3D3] bg-[#F7F3EA] p-5 xl:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-wide text-[#9CA3AF]">Roadmap overview</p>
            <MapIcon size={18} className="text-[#17694F]" />
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              ["18", "Weeks"],
              ["4", "Milestones"],
              ["12+", "Skills to build"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-lg bg-white p-3">
                <p className="text-xl font-bold text-[#6B46C1]">{value}</p>
                <p className="mt-1 text-xs font-bold text-[#9CA3AF]">{label}</p>
              </div>
            ))}
          </div>
        </article>
      </div>

      <section
        aria-labelledby="learning-roadmap-title"
        className="mt-6 overflow-hidden rounded-lg border border-[#CBDFD4] bg-[#EFF5F0] p-4 sm:p-5"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#6B46C1]">Your learning roadmap</p>
            <h3 id="learning-roadmap-title" className="mt-1 text-xl font-bold text-[#1E2A44]">
              Follow the path from skill gaps to Product Manager ready.
            </h3>
            <p className="mt-2 hidden text-sm font-semibold text-[#6B7280] lg:block">
              Click or hover over numbers 1-4 to view milestone insights.
            </p>
            <p className="mt-2 text-sm font-semibold text-[#6B7280] lg:hidden">
              Milestone insights are expanded below for easier mobile scanning.
            </p>
          </div>
          <Pill tone="teal">18 weeks</Pill>
        </div>

        <div className="relative hidden min-h-[430px] overflow-hidden rounded-lg bg-gradient-to-b from-white via-[#F7FDFF] to-[#E7F0E9] lg:block">
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 1200 430"
            role="img"
            aria-label="Winding learning path with four milestones leading to Product Manager ready"
            preserveAspectRatio="none"
          >
            <path
              d="M-20 324 C 130 282, 194 386, 330 318 S 514 186, 665 256 S 874 356, 1028 244 S 1138 167, 1224 210"
              fill="none"
              stroke="#C9C8FF"
              strokeLinecap="round"
              strokeWidth="64"
            />
            <path
              d="M-20 324 C 130 282, 194 386, 330 318 S 514 186, 665 256 S 874 356, 1028 244 S 1138 167, 1224 210"
              fill="none"
              stroke="#FFFFFF"
              strokeDasharray="18 24"
              strokeLinecap="round"
              strokeWidth="5"
            />
            {[90, 160, 720, 790, 1110].map((x) => (
              <g key={x} opacity="0.7">
                <path d={`M${x} 338 l16 -38 l16 38 z`} fill="#9FE7CA" />
                <rect x={x + 14} y="338" width="4" height="18" rx="2" fill="#7BC8AE" />
              </g>
            ))}
            <path d="M1042 143 l58 -22 v58 l-58 22 z" fill="#B08A44" opacity="0.9" />
            <line x1="1042" x2="1042" y1="143" y2="235" stroke="#6B46C1" strokeWidth="6" strokeLinecap="round" />
          </svg>

          {learningPathMilestones.map((item, index) => (
            <div
              key={item.stage}
              className={`absolute z-10 ${item.markerPosition}`}
              onMouseEnter={() => setHoveredMilestone(index)}
              onMouseLeave={() => setHoveredMilestone(null)}
            >
              <button
                type="button"
                onClick={() => setSelectedMilestone(selectedMilestone === index ? null : index)}
                onFocus={() => setHoveredMilestone(index)}
                onBlur={() => setHoveredMilestone(null)}
                className="flex h-11 w-11 items-center justify-center rounded-full border-[5px] border-white bg-[#6B46C1] text-sm font-bold text-white shadow-[0_10px_24px_rgba(26,16,51,0.2)] transition hover:bg-[#B08A44] focus:outline-none focus:ring-4 focus:ring-[#E3D8BC]"
                aria-expanded={activeMilestone === index}
                aria-label={`Open ${item.stage} milestone details`}
              >
                {index + 1}
              </button>

              {activeMilestone === index && (
                <article
                  className={`absolute bottom-14 w-[240px] rounded-lg border border-[#EAE3D3] bg-white p-4 shadow-[0_18px_44px_rgba(26,16,51,0.16)] ${
                    index === 0 ? "left-0" : index === learningPathMilestones.length - 1 ? "right-0" : "left-1/2 -translate-x-1/2"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F1EDE0] text-xs font-bold text-[#6B46C1]">
                      {index + 1}
                    </span>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#9CA3AF]">{item.timeframe}</p>
                  </div>
                  <h4 className="mt-3 font-bold text-[#1E2A44]">{item.stage}</h4>
                  <p className="mt-1 text-xs leading-5 text-[#6B7280]">{item.description}</p>
                  <div className="mt-3 flex items-center justify-between text-xs font-bold">
                    <span className="text-[#6B46C1]">Skill progress</span>
                    <span className="text-[#B08A44]">{item.progress}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-[#E9DFF8]">
                    <div className="h-2 rounded-full bg-[#B08A44]" style={{ width: `${item.progress}%` }} />
                  </div>
                </article>
              )}
            </div>
          ))}

          <div className="absolute right-5 top-20 w-48 rounded-lg border border-[#E3D8BC] bg-white p-4 shadow-[0_12px_36px_rgba(26,16,51,0.12)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F6F1E4] text-[#B08A44]">
              <Flag size={19} />
            </div>
            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-[#9CA3AF]">Goal</p>
            <p className="mt-1 text-lg font-bold text-[#1E2A44]">Product Manager ready</p>
            <p className="mt-2 text-xs leading-5 text-[#6B7280]">Readiness above 88% with a product case study.</p>
          </div>
        </div>

        <div className="grid gap-4 lg:hidden">
          {learningPathMilestones.map((item, index) => (
            <article key={item.stage} className="rounded-lg border border-[#EAE3D3] bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F1EDE0] text-sm font-bold text-[#6B46C1]">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-[#9CA3AF]">{item.timeframe}</p>
                    <h4 className="font-bold text-[#1E2A44]">{item.stage}</h4>
                  </div>
                </div>
                <span className="rounded-full bg-[#F6F1E4] px-2 py-1 text-xs font-bold text-[#B08A44]">
                  {item.progress}%
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#6B7280]">{item.description}</p>
              <div className="mt-3 h-2.5 rounded-full bg-[#E9DFF8]">
                <div className="h-2.5 rounded-full bg-[#B08A44]" style={{ width: `${item.progress}%` }} />
              </div>
            </article>
          ))}
          <article className="rounded-lg border border-[#E3D8BC] bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F6F1E4] text-[#B08A44]">
                <Flag size={19} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#9CA3AF]">Goal</p>
                <h4 className="font-bold text-[#1E2A44]">Product Manager ready</h4>
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-[#6B7280]">Readiness above 88% with a product case study.</p>
          </article>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-4 md:grid-cols-3">
          {skillGaps.map((gap) => (
            <article key={gap.skill} className="rounded-lg border border-[#EAE3D3] bg-[#F7F3EA] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold">{gap.skill.replace(",", "")}</p>
                  <p className="mt-1 text-xs font-bold text-[#6B46C1]">{gap.impact}</p>
                </div>
                <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-[#B08A44]">{gap.progress}%</span>
              </div>
              <div className="mt-4 h-2.5 rounded-full bg-[#E9DFF8]">
                <div className="h-2.5 rounded-full bg-[#6B46C1]" style={{ width: `${gap.progress}%` }} />
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {gap.rolesUnlocked.map((role) => (
                  <span key={role} className="rounded-full bg-[#E7F0E9] px-2 py-1 text-xs font-bold text-[#114F3B]">
                    {role}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>

        <aside className="rounded-lg bg-[#1E2A44] p-5 text-white">
          <p className="text-xs font-bold uppercase tracking-wide text-white/45">Next action</p>
          <h3 className="mt-3 text-2xl font-bold">Start with Product Analytics.</h3>
          <p className="mt-3 text-sm leading-6 text-white/75">
            Build the analytics foundation first, then add stakeholder storytelling to raise readiness above 88%.
          </p>
          <button
            type="button"
            onClick={onStartRoadmap}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-bold text-[#1E2A44]"
          >
            Start roadmap
            <ChevronRight size={16} />
          </button>
        </aside>
      </div>
    </section>
  );
}

export default function EmployeeDashboardPage() {
  const [dashboard, setDashboard] = useState<EmployeeDashboardData | null>(null);
  const [applyMessage, setApplyMessage] = useState<string | null>(null);
  const [storedDisplayName, setStoredDisplayName] = useState("Alex");
  const [interestResult, setInterestResult] = useState<RiasecResult | null>(null);
  const [hasSkippedInterestTest, setHasSkippedInterestTest] = useState(false);

  useEffect(() => {
    if (!getAuthToken()) return;
    getJson<EmployeeDashboardData>("/dashboard/employee", { auth: true })
      .then(setDashboard)
      .catch(() => setDashboard(null));
  }, []);

  useEffect(() => {
    const savedName = window.localStorage.getItem("simploy-display-name");
    if (savedName) {
      setStoredDisplayName(savedName);
    }
    setInterestResult(loadRiasecResult());
    setHasSkippedInterestTest(window.localStorage.getItem(RIASEC_SKIPPED_KEY) === "true");
  }, []);

  const mockInternalOpportunities = opportunities.filter((job) => job.type === "Internal");
  const fallbackExternalOpportunities = opportunities.filter((job) => job.type === "External");
  const externalSource = dashboard?.jobs.length
    ? dashboard.jobs.map((job) => opportunityFromJob(job, dashboard.applications))
    : fallbackExternalOpportunities;
  const dynamicOpportunities = [...mockInternalOpportunities, ...externalSource];
  const internalOpportunities = dynamicOpportunities.filter((job) => job.type === "Internal");
  const externalOpportunities = dynamicOpportunities.filter((job) => job.type === "External");
  const fullName = dashboard?.full_name ?? storedDisplayName;
  const displayName = fullName.split(" ")[0] || "Alex";
  const profileInitials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name[0]?.toUpperCase())
    .join("") || "A";

  const handleDashboardInterestResult = useCallback((result: RiasecResult | null) => {
    if (!result) return;
    saveRiasecResult(result);
    setInterestResult(result);
    setHasSkippedInterestTest(false);
  }, []);

  const handleDashboardInterestSkip = useCallback(() => {
    markRiasecSkipped();
    setInterestResult(null);
    setHasSkippedInterestTest(true);
  }, []);

  const handleApply = async (job: Opportunity) => {
    if (!job.jobId || job.applied || !getAuthToken()) return;
    try {
      await postJson(`/jobs/${job.jobId}/apply`, {}, { auth: true });
      const nextDashboard = await getJson<EmployeeDashboardData>("/dashboard/employee", { auth: true });
      setDashboard(nextDashboard);
      setApplyMessage(`Application submitted for ${job.title}.`);
    } catch (error) {
      setApplyMessage(error instanceof Error ? error.message : "Unable to submit application.");
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F3EA] text-[#1E2A44]">
      <header className="border-b border-[#EAE3D3] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-8">
            <a href="/" className="text-xl font-bold text-[#B08A44]">
              Simploy
            </a>
            <nav className="hidden items-center gap-1 text-sm font-semibold text-[#6B7280] md:flex">
              <a href="#asia-market-title" className="rounded-full px-4 py-2 hover:bg-[#F8F5FC]">
                Asia Market Insight
              </a>
              <a href="/employee/applications" className="rounded-full px-4 py-2 hover:bg-[#F8F5FC]">
                Applications
              </a>
              <a href="#career-north-star" className="rounded-full px-4 py-2 hover:bg-[#F8F5FC]">
                Career GPS
              </a>
              <a href="#career-gps-roadmap" className="rounded-full px-4 py-2 hover:bg-[#F8F5FC]">
                Roadmap
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-[#DFD6BE] bg-white px-4 py-2 text-sm font-semibold text-[#6B46C1] shadow-sm"
            >
              <Building2 size={16} />
              Switch Portal
            </a>
            <ProfileMenu role="employee" initials={profileInitials} name={fullName} label="Open employee profile menu" />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#CBDFD4] bg-[#E7F0E9] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#114F3B]">
              <Sparkles size={14} />
              Career marketplace
            </div>
            <h1 className="text-3xl font-bold sm:text-4xl">
              Level up, <span className="text-[#B08A44]">{displayName}</span>.
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]">
              Explore internal mobility and external career opportunities, track submitted applications, and close the
              skill gaps that unlock your next move.
            </p>
          </div>
          <div className="rounded-lg border border-[#EAE3D3] bg-white px-4 py-3 shadow-[0_4px_24px_rgba(70,60,35,0.08)]">
            <p className="text-xs font-semibold uppercase text-[#9CA3AF]">Profile Strength</p>
            <div className="mt-1 flex items-center gap-3">
              <p className="text-2xl font-bold text-[#1E2A44]">94%</p>
              {interestResult && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#F6F1E4] px-2.5 py-1 text-sm font-bold text-[#B08A44]">
                  <span aria-hidden="true">{interestResult.animal}</span>
                  {interestResult.animalName}
                </span>
              )}
            </div>
            <p className="mt-1 max-w-56 text-xs font-semibold leading-5 text-[#6B7280]">
              {interestResult
                ? `${interestResult.hollandCode} profile: ${interestResult.label}`
                : "Add the career interest check to unlock an avatar"}
            </p>
          </div>
        </div>

        <section
          aria-label="Career Command Center"
          className="mt-6 rounded-lg border border-[#CBDFD4] bg-white p-4 shadow-[0_4px_24px_rgba(70,60,35,0.08)]"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-[#E3D8BC] bg-[#F6F1E4] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#B08A44]">
                <ClipboardCheck size={14} />
                Career Command Center
              </p>
              <p className="mt-3 text-lg font-bold text-[#1E2A44]">
                {careerCommandCenter.readiness}% ready / {careerCommandCenter.nextRole} /{" "}
                {careerCommandCenter.missingSkills} skills missing
              </p>
            </div>
            <div className="grid gap-2 text-sm font-bold sm:grid-cols-3 lg:min-w-[520px]">
              <div className="rounded-lg bg-[#F6F1E4] px-4 py-3 text-[#B08A44]">
                {careerCommandCenter.readiness}%
                <span className="mt-1 block text-xs text-[#9CA3AF]">Career readiness</span>
              </div>
              <div className="rounded-lg bg-[#E7F0E9] px-4 py-3 text-[#114F3B]">
                {careerCommandCenter.nextRole}
                <span className="mt-1 block text-xs text-[#9CA3AF]">Recommended next role</span>
              </div>
              <div className="rounded-lg bg-[#F1EDE0] px-4 py-3 text-[#6B46C1]">
                {careerCommandCenter.missingSkills}
                <span className="mt-1 block text-xs text-[#9CA3AF]">Missing skills</span>
              </div>
            </div>
            <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1E2A44] px-5 py-3 text-sm font-bold text-white">
              {careerCommandCenter.nextAction}
              <ArrowUpRight size={16} />
            </button>
          </div>
        </section>

        <section id="settings" className="mt-6 scroll-mt-24">
          <CareerNorthStarPanel />
        </section>

        <CareerGpsRoadmapPanel />

        <section className="mt-6">
          <RiasecAssessment
            initialResult={interestResult}
            skipped={hasSkippedInterestTest}
            allowSkip
            onResultChange={handleDashboardInterestResult}
            onSkip={handleDashboardInterestSkip}
          />
        </section>

        {applyMessage && (
          <div className="mt-6 rounded-lg border border-[#CBDFD4] bg-[#EFF5F0] px-4 py-3 text-sm font-bold text-[#087C7E]">
            {applyMessage}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 rounded-lg border border-[#EAE3D3] bg-white p-3 shadow-[0_4px_24px_rgba(70,60,35,0.08)] lg:flex-row">
          <label className="flex min-h-12 flex-1 items-center gap-3 rounded-lg bg-[#F7F3EA] px-4 text-sm text-[#9CA3AF]">
            <Search size={18} />
            <input
              className="w-full bg-transparent text-[#1E2A44] outline-none placeholder:text-[#9CA3AF]"
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
            <button className="rounded-lg bg-[#17694F] px-5 py-3 text-sm font-bold text-white shadow-sm">
              Find Match
            </button>
          </div>
        </div>

        <div className="mt-8 space-y-8">
          <section
            aria-labelledby="opportunities-title"
            className="rounded-2xl border border-[#EAE3D3] bg-white p-5 shadow-[0_8px_48px_rgba(70,60,35,0.08)] sm:p-7"
          >
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#B08A44]">Matched opportunities</p>
                <h2 id="opportunities-title" className="mt-2 flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
                  <BriefcaseBusiness size={20} className="text-[#B08A44]" />
                  Opportunities unlocked by this roadmap
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]">
                  These internal gigs and external roles become stronger matches as you complete the roadmap skills.
                </p>
              </div>
              <button className="hidden text-sm font-bold text-[#114F3B] sm:inline-flex">View all matches</button>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
                <div className="rounded-lg border border-[#E3D8BC] bg-[#FFF8FC] p-3">
                  <div className="mb-3 flex items-center justify-between rounded-lg bg-white px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Building2 size={18} className="text-[#B08A44]" />
                      <h3 className="font-bold">Internal Skill Gigs</h3>
                    </div>
                    <Pill tone="pink">{internalOpportunities.length} gigs</Pill>
                  </div>
                  <p className="mb-3 px-1 text-sm leading-6 text-[#6B7280]">
                    Short company needs that use current employee skills before hiring externally.
                  </p>
                  <div className="space-y-4">
                    {internalOpportunities.map((job) => (
                      <OpportunityCard key={job.title} job={job} onApply={handleApply} />
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-[#CBDFD4] bg-[#F3FCFF] p-3">
                  <div className="mb-3 flex items-center justify-between rounded-lg bg-white px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ExternalLink size={18} className="text-[#114F3B]" />
                      <h3 className="font-bold">External Opportunities</h3>
                    </div>
                    <Pill tone="teal">{externalOpportunities.length} roles</Pill>
                  </div>
                  <div className="space-y-4">
                    {externalOpportunities.map((job) => (
                      <OpportunityCard key={job.title} job={job} onApply={handleApply} />
                    ))}
                  </div>
                </div>
            </div>
          </section>

          <AsiaMarketMap />
        </div>
      </section>

      {isRoadmapOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E2A44]/55 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-roadmap-title"
        >
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-[0_24px_80px_rgba(26,16,51,0.28)]">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#EAE3D3] bg-white px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#114F3B]">Career roadmap</p>
                <h2 id="product-roadmap-title" className="mt-1 text-2xl font-bold text-[#1E2A44]">
                  Product Manager Pathway
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]">
                  A focused plan to move from applicant readiness into product management roles.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRoadmapOpen(false)}
                className="rounded-full border border-[#EAE3D3] px-3 py-1.5 text-sm font-bold text-[#6B7280] hover:bg-[#F8F5FC]"
                aria-label="Close roadmap"
              >
                Close
              </button>
            </div>

            <div className="p-5 sm:p-6">
              <div className="grid gap-4 md:grid-cols-4">
                {[
                  ["Target role", "Product Manager"],
                  ["Timeline", "18 weeks"],
                  ["Current readiness", "76%"],
                  ["Priority gap", "Product Analytics"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-[#EAE3D3] bg-[#F7F3EA] p-4">
                    <p className="text-xs font-bold uppercase text-[#9CA3AF]">{label}</p>
                    <p className="mt-2 text-lg font-bold text-[#1E2A44]">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-5">
                {consultantRoadmap.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.stage}
                      className="grid gap-4 rounded-lg border border-[#EAE3D3] bg-white p-4 md:grid-cols-[160px_minmax(0,1fr)]"
                    >
                      <div className="flex items-center gap-3 md:block">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#E7F0E9] text-[#114F3B]">
                          <Icon size={22} />
                        </div>
                        <div className="md:mt-3">
                          <p className="text-xs font-bold uppercase text-[#9CA3AF]">{item.timeframe}</p>
                          <p className="font-bold text-[#114F3B]">{item.stage}</p>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-start gap-3">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F6F1E4] text-sm font-bold text-[#B08A44]">
                            {index + 1}
                          </span>
                          <div>
                            <h3 className="text-lg font-bold text-[#1E2A44]">{item.title}</h3>
                            <ul className="mt-3 space-y-2">
                              {item.tasks.map((task) => (
                                <li key={task} className="flex gap-2 text-sm leading-6 text-[#6B7280]">
                                  <ChevronRight size={16} className="mt-1 shrink-0 text-[#B08A44]" />
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

              <div className="mt-6 rounded-lg bg-[#1E2A44] p-5 text-white">
                <p className="text-sm font-bold">Next recommended action</p>
                <p className="mt-2 text-sm leading-6 text-white/75">
                  Start with product analytics, then turn one insight into a decision-ready product case study.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
