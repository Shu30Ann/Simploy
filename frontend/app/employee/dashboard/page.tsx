"use client";

import { useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import worldCountries from "world-atlas/countries-110m.json";
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
  GraduationCap,
  Globe2,
  LineChart,
  Map as MapIcon,
  MapPin,
  Search,
  Sparkles,
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
    averageSalary: "IDR 520m",
    employability: 77,
    topSkills: ["fintech", "mobile", "customer success"],
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

function AsiaMarketMap() {
  const [selectedMetric, setSelectedMetric] = useState<MarketMetricKey>("growth");
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const metric = marketMetrics.find((item) => item.key === selectedMetric) ?? marketMetrics[0];
  const rankedMarkets = [...asiaMarkets].sort((a, b) => b[selectedMetric] - a[selectedMetric]);
  const leadingMarket = rankedMarkets[0];
  const activeMarket = asiaMarkets.find((market) => market.country === hoveredCountry) ?? leadingMarket;
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
      className="w-full rounded-lg border border-[#BAF3FF] bg-white p-5 shadow-[0_4px_24px_rgba(232,25,122,0.08)] xl:col-span-2 xl:order-last"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-[#BAF3FF] bg-[#E0F9FF] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#0891B2]">
            <Globe2 size={14} />
            Asia market signals
          </p>
          <h2 id="asia-market-title" className="mt-3 text-xl font-bold">
            Where jobs are growing across Asia
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]">
            Choose a metric to compare demand, salary upside, visa friendliness, remote work, and future demand by
            country.
          </p>
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
          <button
            key={item.key}
            type="button"
            onClick={() => setSelectedMetric(item.key)}
            className={`rounded-full border px-3 py-2 text-xs font-bold transition ${
              selectedMetric === item.key
                ? "border-[#06B6D4] bg-[#06B6D4] text-white"
                : "border-[#E2D9F3] bg-white text-[#6B7280] hover:border-[#BAF3FF] hover:bg-[#F0FDFF]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.7fr)]">
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
                      onMouseLeave={() => market && setHoveredCountry(null)}
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

        <div className="space-y-3">
          <div className="rounded-lg border border-[#BAF3FF] bg-[#F0FDFF] p-4">
            <p className="text-xs font-bold uppercase text-[#0891B2]">Hovering</p>
            <p className="mt-2 text-lg font-bold text-[#1A1033]">{activeMarket.country}</p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs font-bold">
              <div className="rounded-lg bg-white p-2 text-[#E8197A]">
                {activeMarket.shortage}%
                <span className="mt-1 block text-[10px] text-[#9CA3AF]">shortage</span>
              </div>
              <div className="rounded-lg bg-white p-2 text-[#1A1033]">
                {activeMarket.averageSalary}
                <span className="mt-1 block text-[10px] text-[#9CA3AF]">salary</span>
              </div>
              <div className="rounded-lg bg-white p-2 text-[#059669]">
                {activeMarket.employability}%
                <span className="mt-1 block text-[10px] text-[#9CA3AF]">employable</span>
              </div>
            </div>
          </div>

          {rankedMarkets.slice(0, 4).map((market) => (
            <div
              key={market.country}
              onMouseEnter={() => setHoveredCountry(market.country)}
              onMouseLeave={() => setHoveredCountry(null)}
              className="rounded-lg border border-[#F0EBF8] bg-[#FDFCFF] p-4 transition hover:border-[#BAF3FF] hover:bg-white"
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
            </div>
          ))}
        </div>
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
                Skill gaps
              </a>
              <a href="#roadmap" className="rounded-full px-4 py-2 hover:bg-[#F8F5FC]">
                Roadmap
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
          <div className="space-y-6 xl:contents">
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

            <AsiaMarketMap />
          </div>

          <aside className="space-y-6 xl:col-start-2 xl:row-start-1">
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
                  <MapIcon size={20} className="text-[#06B6D4]" />
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
    </main>
  );
}
