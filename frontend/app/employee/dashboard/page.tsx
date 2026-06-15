"use client";

import { useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import worldCountries from "world-atlas/countries-110m.json";
import {
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  ExternalLink,
  FileBadge,
  Flag,
  GraduationCap,
  Globe2,
  Map as MapIcon,
  MapPin,
  Search,
  Sparkles,
} from "lucide-react";
import { ProfileMenu } from "@/components/ProfileMenu";

const careerCommandCenter = {
  readiness: 76,
  nextRole: "Product Manager",
  missingSkills: 2,
  nextAction: "Start Product Analytics Path",
};

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
  {
    title: "AI Product Marketing Lead",
    company: "OrbitScale Asia",
    type: "External",
    match: "79%",
    location: "Hybrid - Seoul",
    tags: ["Product Marketing", "AI Tools", "Go-to-market"],
    tone: "pink",
  },
];

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

const skillGaps = [
  {
    skill: "Product Discovery",
    impact: "+5 product roles",
    rolesUnlocked: ["Interactive Product Designer", "Creative Strategy Lead"],
    progress: 42,
    roadmapSteps: ["Run customer problem interviews", "Frame opportunity statements", "Publish one product discovery brief"],
  },
  {
    skill: "Product Analytics",
    impact: "+7 matching roles",
    rolesUnlocked: ["Product Manager", "AI Product Marketing Lead"],
    progress: 58,
    roadmapSteps: ["Build funnel and activation dashboards", "Practice cohort analysis", "Present one product insight memo"],
  },
  {
    skill: "Stakeholder Storytelling",
    impact: "+4 leadership roles",
    rolesUnlocked: ["UX Research Manager", "Strategy Lead"],
    progress: 74,
    roadmapSteps: ["Convert research into an exec narrative", "Run a mock steering update", "Create a decision-ready recommendation"],
  },
];

const consultantRoadmap = [
  {
    stage: "Foundation",
    timeframe: "Weeks 1-4",
    title: "Build product discovery foundations",
    tasks: ["Interview users and map pain points", "Prioritize problems with impact sizing", "Write a clear product opportunity brief"],
    icon: BookOpen,
  },
  {
    stage: "Analytics",
    timeframe: "Weeks 5-10",
    title: "Turn product data into decisions",
    tasks: ["Build funnel and activation dashboards", "Practice cohort analysis", "Present one product insight memo"],
    icon: FileBadge,
  },
  {
    stage: "Influence",
    timeframe: "Weeks 11-14",
    title: "Strengthen stakeholder storytelling",
    tasks: ["Convert research into an executive narrative", "Run a mock steering update", "Create a decision-ready recommendation"],
    icon: ClipboardCheck,
  },
  {
    stage: "Market Ready",
    timeframe: "Weeks 15-18",
    title: "Apply for Product Manager roles",
    tasks: ["Prepare a product case-study portfolio", "Target internal PM gigs and external PM roles", "Track applications and interviews"],
    icon: CircleDollarSign,
  },
];

const learningPathMilestones = consultantRoadmap.map((item, index) => ({
  ...item,
  progress: [34, 58, 74, 88][index],
  description: [
    "Build a strong base in product thinking.",
    "Learn to use data to drive product decisions.",
    "Influence stakeholders through clear product narratives.",
    "Package proof and apply for stronger PM matches.",
  ][index],
  markerPosition: [
    "left-[7%] top-[71%]",
    "left-[31%] top-[67%]",
    "left-[53%] top-[55%]",
    "left-[75%] top-[67%]",
  ][index],
}));

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
    if (value >= 85) return "#E8197A";
    if (value >= 75) return "#06B6D4";
    if (value >= 65) return "#22C55E";
    if (value >= 55) return "#F59E0B";
    return "#DDD0F8";
  };

  return (
    <section
      aria-labelledby="asia-market-title"
      className="w-full rounded-lg border border-[#BAF3FF] bg-white p-4 shadow-[0_4px_24px_rgba(232,25,122,0.08)] xl:col-span-2 xl:order-last"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#BAF3FF] bg-[#E0F9FF] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#0891B2]">
            <Globe2 size={14} />
            Asia market signals
          </p>
          <h2 id="asia-market-title" className="mt-2 text-xl font-bold">
            Where jobs are growing across Asia
          </h2>
        </div>
        <div className="rounded-lg border border-[#F0EBF8] bg-[#FDFCFF] px-4 py-3">
          <p className="text-xs font-bold uppercase text-[#9CA3AF]">Top market</p>
          <p className="mt-1 text-lg font-bold text-[#1A1033]">{leadingMarket.country}</p>
          <p className="text-sm font-semibold text-[#0891B2]">
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
                  ? "border-[#06B6D4] bg-[#06B6D4] text-white"
                  : "border-[#E2D9F3] bg-white text-[#6B7280] hover:border-[#BAF3FF] hover:bg-[#F0FDFF]"
              }`}
              aria-expanded={activeMetricInfo === item.key}
            >
              {item.label}
            </button>
            {activeMetricInfo === item.key && (
              <div className="absolute left-0 top-11 z-20 w-56 rounded-lg border border-[#F0EBF8] bg-white p-3 text-xs font-semibold leading-5 text-[#6B7280] shadow-[0_16px_44px_rgba(26,16,51,0.14)]">
                <p className="font-bold text-[#1A1033]">{item.label}</p>
                <p className="mt-1">{item.legend}.</p>
                <p className="mt-2 text-[#0891B2]">
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
        <div className="relative w-full overflow-hidden rounded-lg border border-[#F0EBF8] bg-[#F7FBFF]">
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
                          stroke: isActive ? "#1A1033" : "#FFFFFF",
                          strokeWidth: isActive ? 1.8 : 0.8,
                          outline: "none",
                        },
                        hover: {
                          fill: market ? getCountryColor(value) : "#DCEAF0",
                          stroke: "#1A1033",
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

          <div className={`absolute z-10 w-56 rounded-lg border border-[#F0EBF8] bg-white p-4 shadow-[0_16px_44px_rgba(26,16,51,0.16)] ${activeMarket.tooltipPosition}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-[#1A1033]">{activeMarket.country}</p>
                <p className="mt-1 text-xs font-semibold text-[#9CA3AF]">{activeMarket.city}</p>
              </div>
              <span className="rounded-full bg-[#F0FDFF] px-2 py-1 text-xs font-bold text-[#0891B2]">
                {activeMarket[selectedMetric]}
                {metric.suffix}
              </span>
            </div>
            <div className="mt-3 grid gap-2 text-xs font-semibold text-[#6B7280]">
              <div className="flex items-center justify-between">
                <span>Skill shortages</span>
                <span className="font-bold text-[#E8197A]">{activeMarket.shortage}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Your fit score</span>
                <span className="font-bold text-[#0891B2]">{activeMarket.fitScore}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Average salary</span>
                <span className="font-bold text-[#1A1033]">{activeMarket.averageSalary}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Employability</span>
                <span className="font-bold text-[#059669]">{activeMarket.employability}%</span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-4 left-4 right-4 rounded-lg border border-white/80 bg-white/90 p-3 backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-bold text-[#1A1033]">{metric.legend}</p>
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#6B7280]">
                {[
                  ["Low", "#DDD0F8"],
                  ["Medium", "#F59E0B"],
                  ["Strong", "#22C55E"],
                  ["High", "#06B6D4"],
                  ["Highest", "#E8197A"],
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
          <div className="rounded-lg border border-[#BAF3FF] bg-[#F0FDFF] p-4">
            <p className="text-xs font-bold uppercase text-[#0891B2]">Selected market</p>
            <p className="mt-2 text-lg font-bold text-[#1A1033]">{activeMarket.country}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs font-bold sm:grid-cols-3 xl:grid-cols-2">
              <div className="rounded-lg bg-white p-2 text-[#0891B2]">
                {activeMarket.fitScore}%
                <span className="mt-1 block text-[10px] text-[#9CA3AF]">fit score</span>
              </div>
              <div className="rounded-lg bg-white p-2 text-[#E8197A]">
                {activeMarket.demand}
                <span className="mt-1 block text-[10px] text-[#9CA3AF]">demand</span>
              </div>
              <div className="rounded-lg bg-white p-2 text-[#1A1033]">
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
              <div className="rounded-lg bg-white p-2 text-[#E8197A]">
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
              className={`w-full rounded-lg border p-4 text-left transition hover:border-[#BAF3FF] hover:bg-white ${
                selectedCountry === market.country
                  ? "border-[#06B6D4] bg-white"
                  : "border-[#F0EBF8] bg-[#FDFCFF]"
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
                <span className="text-lg font-bold text-[#0891B2]">
                  {market[selectedMetric]}
                  {metric.suffix}
                </span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-[#E0F9FF]">
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
      className="mt-8 rounded-2xl border border-[#F0EBF8] bg-white p-5 shadow-[0_8px_48px_rgba(232,25,122,0.08)] sm:p-7"
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-[#DDD0F8] bg-[#F5F0FF] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#6B46C1]">
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
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#E8197A] px-6 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(232,25,122,0.18)]"
        >
          Start roadmap
          <ArrowUpRight size={16} />
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <article className="rounded-lg border border-[#FFD0E8] bg-[#FFF8FC] p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-[#9CA3AF]">Career readiness</p>
          <div className="mt-4 flex items-end gap-2">
            <p className="text-5xl font-bold text-[#E8197A]">{careerCommandCenter.readiness}%</p>
            <span className="pb-2 text-xs font-bold text-[#059669]">+12% after roadmap</span>
          </div>
          <div className="mt-4 h-3 rounded-full bg-white">
            <div className="h-3 rounded-full bg-[#E8197A]" style={{ width: `${careerCommandCenter.readiness}%` }} />
          </div>
        </article>

        <article className="rounded-lg border border-[#DDD0F8] bg-[#FDFCFF] p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-[#9CA3AF]">Missing skills</p>
          <p className="mt-4 text-4xl font-bold text-[#6B46C1]">{careerCommandCenter.missingSkills}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {skillGaps.slice(0, 2).map((gap) => (
              <span key={gap.skill} className="rounded-full bg-[#F5F0FF] px-3 py-1 text-xs font-bold text-[#6B46C1]">
                {gap.skill.replace(",", "")}
              </span>
            ))}
          </div>
        </article>

        <article className="rounded-lg border border-[#BAF3FF] bg-[#F0FDFF] p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-[#9CA3AF]">Recommended next role</p>
          <p className="mt-4 text-2xl font-bold leading-tight text-[#0891B2]">{careerCommandCenter.nextRole}</p>
          <p className="mt-3 text-sm leading-6 text-[#6B7280]">Best fit based on analytics, leadership, and customer insight.</p>
        </article>

        <article className="rounded-lg border border-[#F0EBF8] bg-[#FDFCFF] p-5 xl:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-wide text-[#9CA3AF]">Roadmap overview</p>
            <MapIcon size={18} className="text-[#06B6D4]" />
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
        className="mt-6 overflow-hidden rounded-lg border border-[#BAF3FF] bg-[#F0FDFF] p-4 sm:p-5"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#6B46C1]">Your learning roadmap</p>
            <h3 id="learning-roadmap-title" className="mt-1 text-xl font-bold text-[#1A1033]">
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

        <div className="relative hidden min-h-[430px] overflow-hidden rounded-lg bg-gradient-to-b from-white via-[#F7FDFF] to-[#E0F9FF] lg:block">
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
            <path d="M1042 143 l58 -22 v58 l-58 22 z" fill="#E8197A" opacity="0.9" />
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
                className="flex h-11 w-11 items-center justify-center rounded-full border-[5px] border-white bg-[#6B46C1] text-sm font-bold text-white shadow-[0_10px_24px_rgba(26,16,51,0.2)] transition hover:bg-[#E8197A] focus:outline-none focus:ring-4 focus:ring-[#FFD0E8]"
                aria-expanded={activeMilestone === index}
                aria-label={`Open ${item.stage} milestone details`}
              >
                {index + 1}
              </button>

              {activeMilestone === index && (
                <article
                  className={`absolute bottom-14 w-[240px] rounded-lg border border-[#F0EBF8] bg-white p-4 shadow-[0_18px_44px_rgba(26,16,51,0.16)] ${
                    index === 0 ? "left-0" : index === learningPathMilestones.length - 1 ? "right-0" : "left-1/2 -translate-x-1/2"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F5F0FF] text-xs font-bold text-[#6B46C1]">
                      {index + 1}
                    </span>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#9CA3AF]">{item.timeframe}</p>
                  </div>
                  <h4 className="mt-3 font-bold text-[#1A1033]">{item.stage}</h4>
                  <p className="mt-1 text-xs leading-5 text-[#6B7280]">{item.description}</p>
                  <div className="mt-3 flex items-center justify-between text-xs font-bold">
                    <span className="text-[#6B46C1]">Skill progress</span>
                    <span className="text-[#E8197A]">{item.progress}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-[#E9DFF8]">
                    <div className="h-2 rounded-full bg-[#E8197A]" style={{ width: `${item.progress}%` }} />
                  </div>
                </article>
              )}
            </div>
          ))}

          <div className="absolute right-5 top-20 w-48 rounded-lg border border-[#FFD0E8] bg-white p-4 shadow-[0_12px_36px_rgba(26,16,51,0.12)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFF0F8] text-[#E8197A]">
              <Flag size={19} />
            </div>
            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-[#9CA3AF]">Goal</p>
            <p className="mt-1 text-lg font-bold text-[#1A1033]">Product Manager ready</p>
            <p className="mt-2 text-xs leading-5 text-[#6B7280]">Readiness above 88% with a product case study.</p>
          </div>
        </div>

        <div className="grid gap-4 lg:hidden">
          {learningPathMilestones.map((item, index) => (
            <article key={item.stage} className="rounded-lg border border-[#F0EBF8] bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F5F0FF] text-sm font-bold text-[#6B46C1]">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-[#9CA3AF]">{item.timeframe}</p>
                    <h4 className="font-bold text-[#1A1033]">{item.stage}</h4>
                  </div>
                </div>
                <span className="rounded-full bg-[#FFF0F8] px-2 py-1 text-xs font-bold text-[#E8197A]">
                  {item.progress}%
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#6B7280]">{item.description}</p>
              <div className="mt-3 h-2.5 rounded-full bg-[#E9DFF8]">
                <div className="h-2.5 rounded-full bg-[#E8197A]" style={{ width: `${item.progress}%` }} />
              </div>
            </article>
          ))}
          <article className="rounded-lg border border-[#FFD0E8] bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFF0F8] text-[#E8197A]">
                <Flag size={19} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#9CA3AF]">Goal</p>
                <h4 className="font-bold text-[#1A1033]">Product Manager ready</h4>
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-[#6B7280]">Readiness above 88% with a product case study.</p>
          </article>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-4 md:grid-cols-3">
          {skillGaps.map((gap) => (
            <article key={gap.skill} className="rounded-lg border border-[#F0EBF8] bg-[#FDFCFF] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold">{gap.skill.replace(",", "")}</p>
                  <p className="mt-1 text-xs font-bold text-[#6B46C1]">{gap.impact}</p>
                </div>
                <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-[#E8197A]">{gap.progress}%</span>
              </div>
              <div className="mt-4 h-2.5 rounded-full bg-[#E9DFF8]">
                <div className="h-2.5 rounded-full bg-[#6B46C1]" style={{ width: `${gap.progress}%` }} />
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {gap.rolesUnlocked.map((role) => (
                  <span key={role} className="rounded-full bg-[#E0F9FF] px-2 py-1 text-xs font-bold text-[#0891B2]">
                    {role}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>

        <aside className="rounded-lg bg-[#1A1033] p-5 text-white">
          <p className="text-xs font-bold uppercase tracking-wide text-white/45">Next action</p>
          <h3 className="mt-3 text-2xl font-bold">Start with Product Analytics.</h3>
          <p className="mt-3 text-sm leading-6 text-white/75">
            Build the analytics foundation first, then add stakeholder storytelling to raise readiness above 88%.
          </p>
          <button
            type="button"
            onClick={onStartRoadmap}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-bold text-[#1A1033]"
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
              <a href="#asia-market-title" className="rounded-full px-4 py-2 hover:bg-[#F8F5FC]">
                Asia Market Insight
              </a>
              <a href="/employee/applications" className="rounded-full px-4 py-2 hover:bg-[#F8F5FC]">
                Applications
              </a>
              <a href="#skills" className="rounded-full px-4 py-2 hover:bg-[#F8F5FC]">
                Learning Path
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-[#DDD0F8] bg-white px-4 py-2 text-sm font-semibold text-[#6B46C1] shadow-sm"
            >
              <Building2 size={16} />
              Switch Portal
            </a>
            <ProfileMenu role="employee" initials="A" name="Alex" label="Open employee profile menu" />
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
            <p className="text-xs font-semibold uppercase text-[#9CA3AF]">Profile Strength</p>
            <p className="mt-1 text-2xl font-bold text-[#1A1033]">94%</p>
            <p className="mt-1 max-w-56 text-xs font-semibold leading-5 text-[#6B7280]">
              Add leadership experience to unlock 8 more matches
            </p>
          </div>
        </div>

        <section
          aria-label="Career Command Center"
          className="mt-6 rounded-lg border border-[#BAF3FF] bg-white p-4 shadow-[0_4px_24px_rgba(232,25,122,0.08)]"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-[#FFD0E8] bg-[#FFF0F8] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#E8197A]">
                <ClipboardCheck size={14} />
                Career Command Center
              </p>
              <p className="mt-3 text-lg font-bold text-[#1A1033]">
                {careerCommandCenter.readiness}% ready / {careerCommandCenter.nextRole} /{" "}
                {careerCommandCenter.missingSkills} skills missing
              </p>
            </div>
            <div className="grid gap-2 text-sm font-bold sm:grid-cols-3 lg:min-w-[520px]">
              <div className="rounded-lg bg-[#FFF0F8] px-4 py-3 text-[#E8197A]">
                {careerCommandCenter.readiness}%
                <span className="mt-1 block text-xs text-[#9CA3AF]">Career readiness</span>
              </div>
              <div className="rounded-lg bg-[#E0F9FF] px-4 py-3 text-[#0891B2]">
                {careerCommandCenter.nextRole}
                <span className="mt-1 block text-xs text-[#9CA3AF]">Recommended next role</span>
              </div>
              <div className="rounded-lg bg-[#F5F0FF] px-4 py-3 text-[#6B46C1]">
                {careerCommandCenter.missingSkills}
                <span className="mt-1 block text-xs text-[#9CA3AF]">Missing skills</span>
              </div>
            </div>
            <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1A1033] px-5 py-3 text-sm font-bold text-white">
              {careerCommandCenter.nextAction}
              <ArrowUpRight size={16} />
            </button>
          </div>
        </section>

        <SkillRoadmapModule onStartRoadmap={() => setIsRoadmapOpen(true)} />

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

        <div className="mt-8 space-y-8">
          <section
            aria-labelledby="opportunities-title"
            className="rounded-2xl border border-[#F0EBF8] bg-white p-5 shadow-[0_8px_48px_rgba(232,25,122,0.08)] sm:p-7"
          >
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#E8197A]">Matched opportunities</p>
                <h2 id="opportunities-title" className="mt-2 flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
                  <BriefcaseBusiness size={20} className="text-[#E8197A]" />
                  Opportunities unlocked by this roadmap
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]">
                  These internal gigs and external roles become stronger matches as you complete the roadmap skills.
                </p>
              </div>
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

          <AsiaMarketMap />
        </div>
      </section>

      {isRoadmapOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1033]/55 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-roadmap-title"
        >
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-[0_24px_80px_rgba(26,16,51,0.28)]">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#F0EBF8] bg-white px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#0891B2]">Career roadmap</p>
                <h2 id="product-roadmap-title" className="mt-1 text-2xl font-bold text-[#1A1033]">
                  Product Manager Pathway
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]">
                  A focused plan to move from applicant readiness into product management roles.
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
                  ["Target role", "Product Manager"],
                  ["Timeline", "18 weeks"],
                  ["Current readiness", "76%"],
                  ["Priority gap", "Product Analytics"],
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
