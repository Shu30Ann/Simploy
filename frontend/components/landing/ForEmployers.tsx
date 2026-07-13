"use client";

import { Database, Sliders, AlertTriangle, Zap, ArrowRight } from "lucide-react";
import SectionLabel from "@/components/ui/SectionLabel";
import FadeUp from "@/components/ui/FadeUp";
import Link from "next/link";

const features = [
  {
    icon: Database,
    title: "Live Workforce Data",
    description:
      "A real-time talent graph of your entire organization — skills, headcount, demand, and gaps.",
  },
  {
    icon: Sliders,
    title: "Scenario Simulation",
    description:
      "Model attrition, automation, hiring freezes, and retirement waves across any timeframe.",
  },
  {
    icon: AlertTriangle,
    title: "Risk Scoring",
    description:
      "Automatically surface high-risk roles, departments, and regions before they impact operations.",
  },
  {
    icon: Zap,
    title: "Action Recommendations",
    description:
      "From gap to plan in one click. Hire, upskill, redeploy, or automate — with specific targets.",
  },
];

const whatIfTabs = ["Attrition Spike", "AI Automation", "Hiring Freeze"];

export default function ForEmployers() {
  return (
    <section className="bg-[#F7F3EA] py-24">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        {/* Left — Gap Simulator mockup (desktop) / shown first on mobile via order */}
        <FadeUp delay={0.1} className="order-2 md:order-1">
          <div className="rounded-2xl border border-[#EAE3D3] shadow-[0_4px_24px_rgba(70,60,35,0.08)] bg-white overflow-hidden">
            {/* What-if tabs */}
            <div className="p-4 border-b border-[#EAE3D3]">
              <p className="text-[12px] font-semibold text-[#1E2A44] mb-3">What if...</p>
              <div className="flex flex-wrap gap-2">
                {whatIfTabs.map((tab, i) => (
                  <span
                    key={tab}
                    className={`rounded-full px-3 py-1 text-xs font-medium cursor-pointer border ${
                      i === 0
                        ? "bg-[#B08A44] text-white border-[#B08A44]"
                        : "bg-[#F6F1E4] text-[#B08A44] border-[#E3D8BC]"
                    }`}
                  >
                    {tab}
                  </span>
                ))}
              </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-4 gap-2 p-4 border-b border-[#EAE3D3]">
              {[
                { metric: "4,250", label: "Projected Supply", sub: "▼ -5% YoY" },
                { metric: "5,100", label: "Projected Demand", sub: "▲ +12% YoY" },
                { metric: "14", label: "High-Risk Roles", sub: "3 Depts" },
                { metric: "$14.2M", label: "Cost of Inaction", sub: "" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-[#F6F1E4] rounded-lg p-3 text-center"
                >
                  <p className="text-[13px] font-bold text-[#1E2A44]">{s.metric}</p>
                  <p className="text-[9px] text-[#6B7280] leading-tight mt-0.5">
                    {s.label}
                  </p>
                  {s.sub && (
                    <p className="text-[9px] text-[#B08A44] font-medium mt-0.5">
                      {s.sub}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Supply vs Demand chart */}
            <div className="p-4 border-b border-[#EAE3D3]">
              <p className="text-[12px] font-semibold text-[#1E2A44] mb-3">
                Supply vs Demand Gap
              </p>
              <div className="space-y-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="h-3 bg-[#B08A44] rounded-full"
                      style={{ width: "68%" }}
                    />
                    <span className="text-[10px] text-[#B08A44]">Supply</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 bg-[#17694F] rounded-full"
                      style={{ width: "85%" }}
                    />
                    <span className="text-[10px] text-[#17694F]">Demand</span>
                  </div>
                </div>
                <div className="flex justify-between text-[10px] text-[#9CA3AF] mt-2 px-0.5">
                  <span>2022</span>
                  <span>2025</span>
                  <span>2030</span>
                </div>
              </div>
            </div>

            {/* Risk table */}
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] font-semibold text-[#1E2A44] mb-2">
                    Dept Risk
                  </p>
                  {[
                    { dept: "Engineering", pct: 80, color: "#B08A44" },
                    { dept: "Sales", pct: 45, color: "#F59E0B" },
                    { dept: "Operations", pct: 30, color: "#10B981" },
                  ].map((r) => (
                    <div key={r.dept} className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-[#6B7280]">{r.dept}</span>
                      <span
                        className="text-[10px] font-semibold"
                        style={{ color: r.color }}
                      >
                        {r.pct}%
                      </span>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#1E2A44] mb-2">
                    Regional Shortfall
                  </p>
                  {[
                    { region: "North America", val: "-450", color: "#B08A44" },
                    { region: "EMEA", val: "-120", color: "#F59E0B" },
                    { region: "APAC", val: "+85", color: "#10B981" },
                  ].map((r) => (
                    <div key={r.region} className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-[#6B7280]">{r.region}</span>
                      <span
                        className="text-[10px] font-semibold"
                        style={{ color: r.color }}
                      >
                        {r.val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </FadeUp>

        {/* Right — content */}
        <FadeUp delay={0} className="order-1 md:order-2">
          <SectionLabel>For Employers</SectionLabel>
          <h2 className="font-serif text-[40px] font-bold text-[#1E2A44] leading-tight">
            Know your gaps <em className="text-[#B08A44] font-medium">before</em>
            <br />
            they become crises.
          </h2>
          <p className="text-lg text-[#6B7280] mt-3 leading-relaxed">
            Simploy gives HR teams and executives a real-time view of workforce health —
            and a simulation engine to plan 5 years ahead.
          </p>

          <div className="mt-8 flex flex-col gap-6">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex gap-4">
                <div className="w-9 h-9 rounded-lg bg-[#F6F1E4] flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-[#B08A44]" />
                </div>
                <div>
                  <p className="font-semibold text-[#1E2A44] text-sm">{title}</p>
                  <p className="text-sm text-[#6B7280] mt-1">{description}</p>
                </div>
              </div>
            ))}
          </div>

          <Link href="/signup?role=employer">
            <button className="text-sm text-[#B08A44] font-medium hover:underline flex items-center gap-1 mt-6">
              Start Simulating <ArrowRight size={14} />
            </button>
          </Link>
        </FadeUp>
      </div>
    </section>
  );
}
