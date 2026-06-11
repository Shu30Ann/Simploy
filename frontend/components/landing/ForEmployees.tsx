"use client";

import { Sparkles, TrendingUp, Building2, Network, ArrowRight } from "lucide-react";
import SectionLabel from "@/components/ui/SectionLabel";
import FadeUp from "@/components/ui/FadeUp";
import Link from "next/link";

const features = [
  {
    icon: Sparkles,
    title: "AI Job Matching",
    description:
      "Get matched to internal and external roles based on your actual skills, not just your job title.",
  },
  {
    icon: TrendingUp,
    title: "Skill Gap Analysis",
    description:
      "See the exact skills standing between you and your next role, with a clear learning path to close them.",
  },
  {
    icon: Building2,
    title: "Internal Mobility",
    description:
      "Discover opportunities inside your own company before they're ever posted externally.",
  },
  {
    icon: Network,
    title: "Talent Graph",
    description:
      "Your skills, certifications, and career arc — visualized as a living graph that grows with you.",
  },
];

export default function ForEmployees() {
  return (
    <section id="solutions" className="bg-white py-24">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        {/* Left — content */}
        <FadeUp delay={0}>
          <SectionLabel>For Employees</SectionLabel>
          <h2 className="text-[40px] font-bold text-[#1A1033] leading-tight">
            Your career, intelligently guided.
          </h2>
          <p className="text-lg text-[#6B7280] mt-3 leading-relaxed">
            Simploy shows you exactly where you stand, what skills will unlock new
            opportunities, and surfaces roles — both inside and outside your company.
          </p>

          <div className="mt-8 flex flex-col gap-6">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex gap-4">
                <div className="w-9 h-9 rounded-lg bg-[#FFF5FA] flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-[#E8197A]" />
                </div>
                <div>
                  <p className="font-semibold text-[#1A1033] text-sm">{title}</p>
                  <p className="text-sm text-[#6B7280] mt-1">{description}</p>
                </div>
              </div>
            ))}
          </div>

          <Link href="/signup?role=employee">
            <button className="text-sm text-[#E8197A] font-medium hover:underline flex items-center gap-1 mt-6">
              Find Your Next Role <ArrowRight size={14} />
            </button>
          </Link>
        </FadeUp>

        {/* Right — employee mockup */}
        <FadeUp delay={0.1}>
          <div className="rounded-2xl border border-[#F0EBF8] shadow-[0_4px_24px_rgba(232,25,122,0.08)] bg-white p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-[13px] font-semibold text-[#1A1033] flex items-center gap-1">
                <span className="text-[#E8197A]">✦</span> Matching for You
              </p>
              <span className="text-[11px] text-[#E8197A] font-medium cursor-pointer">
                View All →
              </span>
            </div>

            {/* Job cards */}
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  badge: "INTERNAL",
                  badgeBg: "bg-[#FFF5FA] text-[#E8197A]",
                  title: "Sr. Product Designer",
                  company: "Layer 1 Core",
                  match: 98,
                },
                {
                  badge: "EXTERNAL",
                  badgeBg: "bg-[#E0F9FF] text-[#06B6D4]",
                  title: "Creative Director",
                  company: "Stellar Labs",
                  match: 85,
                },
              ].map((job) => (
                <div
                  key={job.title}
                  className="bg-white rounded-xl border border-[#F0EBF8] p-4"
                >
                  <span
                    className={`${job.badgeBg} text-[10px] font-semibold rounded px-2 py-0.5`}
                  >
                    {job.badge}
                  </span>
                  <p className="text-[12px] font-semibold text-[#1A1033] mt-2">
                    {job.title}
                  </p>
                  <p className="text-[11px] text-[#6B7280] mt-0.5">{job.company}</p>
                  <p className="text-[11px] text-[#E8197A] font-medium mt-2">
                    ⚡ {job.match}% Match
                  </p>
                </div>
              ))}
            </div>

            {/* Skill gap panel */}
            <div className="bg-[#F5F0FF] rounded-xl border border-[#DDD0F8] p-4 mt-3">
              <p className="text-[12px] font-semibold text-[#1A1033] flex items-center gap-1 mb-1">
                🎯 Skill Gap
              </p>
              <p className="text-[11px] text-[#6B7280] mb-3">
                Unlock 12 new roles with these skills
              </p>
              {[
                { skill: "Three.js / WebGL", matches: "+5 matches", width: "72%" },
                { skill: "Product Analytics", matches: "+7 matches", width: "40%" },
              ].map((s) => (
                <div key={s.skill} className="flex items-center gap-3 mb-2">
                  <p className="text-[11px] text-[#6B7280] w-36">{s.skill}</p>
                  <span className="text-[10px] text-[#7F77DD] font-medium w-16">
                    {s.matches}
                  </span>
                  <div className="flex-1 bg-[#DDD0F8] rounded-full h-1.5">
                    <div
                      className="bg-[#7F77DD] h-1.5 rounded-full"
                      style={{ width: s.width }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
