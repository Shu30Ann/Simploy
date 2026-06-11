"use client";

import { Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";
import FadeUp from "@/components/ui/FadeUp";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="bg-[#FDFCFF] pt-32 pb-20 text-center overflow-hidden relative">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(232,25,122,0.06) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative z-10 px-4">
        {/* Eyebrow */}
        <FadeUp delay={0}>
          <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium bg-[#FFF5FA] text-[#E8197A] border border-[#FFD0E8] mb-6">
            <Sparkles size={14} /> Introducing the Career OS
          </span>
        </FadeUp>

        {/* Headline */}
        <FadeUp delay={0.05}>
          <h1
            className="font-bold leading-[1.1] tracking-tight text-[#1A1033]"
            style={{ fontSize: "clamp(36px, 6vw, 64px)" }}
          >
            The Career{" "}
            <span className="text-[#E8197A]">OS</span> your
            <br />
            workforce deserves.
          </h1>
        </FadeUp>

        {/* Subheadline */}
        <FadeUp delay={0.1}>
          <p className="text-lg text-[#6B7280] max-w-[540px] mx-auto mt-4 leading-relaxed">
            Simploy maps your live talent graph, simulates future workforce gaps,
            and recommends the exact actions to close them — before they become
            crises.
          </p>
        </FadeUp>

        {/* CTAs */}
        <FadeUp delay={0.15}>
          <div className="flex items-center justify-center gap-3 mt-8 flex-wrap">
            <Link href="/signup?role=employee">
              <Button variant="outline">I&apos;m an Employee</Button>
            </Link>
            <Link href="/signup?role=employer">
              <Button variant="primary">I&apos;m an Employer</Button>
            </Link>
          </div>
        </FadeUp>

        {/* Sub-CTA */}
        <FadeUp delay={0.2}>
          <p className="text-xs text-[#9CA3AF] mt-3">
            Free for employees · No credit card required
          </p>
        </FadeUp>

        {/* Hero mockup */}
        <FadeUp delay={0.25}>
          <div className="mt-16 max-w-[900px] mx-auto px-4 relative">
            <div className="rounded-2xl border border-[#F0EBF8] shadow-[0_8px_48px_rgba(232,25,122,0.12)] overflow-hidden bg-white text-left">
              {/* Mock navbar */}
              <div className="bg-[#1A1033] px-4 py-2.5 flex items-center gap-6">
                <span className="text-white font-bold text-xs">Simploy</span>
                {["Jobs", "Applications", "Pipeline", "Analytics"].map((item) => (
                  <span key={item} className="text-white/50 text-[11px]">
                    {item}
                  </span>
                ))}
              </div>

              {/* Mock body */}
              <div className="p-5">
                <p className="text-[13px] font-semibold text-[#1A1033]">
                  Welcome back, Acme Corp Team!
                </p>
                <p className="text-[11px] text-[#6B7280] mt-0.5">
                  Your talent marketplace is live.
                </p>

                {/* Stat cards */}
                <div className="flex gap-3 mt-4">
                  <div className="bg-[#E8197A] text-white rounded-xl px-5 py-3 min-w-[100px]">
                    <p className="text-xl font-bold">124</p>
                    <p className="text-[10px] uppercase tracking-wider opacity-80 mt-0.5">
                      Applications
                    </p>
                  </div>
                  <div className="bg-[#06B6D4] text-white rounded-xl px-5 py-3 min-w-[100px]">
                    <p className="text-xl font-bold">18</p>
                    <p className="text-[10px] uppercase tracking-wider opacity-80 mt-0.5">
                      Hired
                    </p>
                  </div>
                </div>

                {/* Job postings table */}
                <div className="mt-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[12px] font-semibold text-[#1A1033]">
                      Job Postings
                    </p>
                    <div className="flex gap-2">
                      <span className="text-[10px] px-2 py-0.5 bg-[#FFF0F8] text-[#E8197A] rounded-full border border-[#FFD0E8]">
                        Active (8)
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-[#F0EBF8] text-[#6B7280] rounded-full border border-[#E2D9F3]">
                        Draft (3)
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-[#F0EBF8]" />
                  {[
                    { title: "Senior Protocol Engineer", status: "Active", apps: 42, dots: 3 },
                    { title: "DevRel Lead", status: "Active", apps: 15, dots: 2 },
                    { title: "Product Designer (v2)", status: "Draft", apps: 0, dots: 0 },
                  ].map((job) => (
                    <div
                      key={job.title}
                      className="flex items-center justify-between py-2 border-b border-[#F0EBF8] last:border-0"
                    >
                      <p className="text-[11px] text-[#1A1033] font-medium">{job.title}</p>
                      <div className="flex items-center gap-4">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full ${
                            job.status === "Active"
                              ? "bg-[#E0F9FF] text-[#06B6D4]"
                              : "bg-[#F0EBF8] text-[#9CA3AF]"
                          }`}
                        >
                          {job.status}
                        </span>
                        <span className="text-[11px] text-[#6B7280] w-6 text-right">
                          {job.apps}
                        </span>
                        <span className="text-[#E8197A] text-xs">
                          {job.dots > 0 ? "●".repeat(job.dots) : "Pending"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Insights panel */}
                <div className="mt-4 border border-[#F0EBF8] rounded-xl p-4">
                  <p className="text-[12px] font-semibold text-[#1A1033] mb-3">
                    Marketplace Insights
                  </p>
                  {[
                    { label: "Rust / Wasm Demand", level: "HIGH", width: "80%" },
                    { label: "Solidity Skills", level: "MED", width: "50%" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3 mb-2">
                      <p className="text-[11px] text-[#6B7280] w-36">{item.label}</p>
                      <div className="flex-1 bg-[#F0EBF8] rounded-full h-1.5">
                        <div
                          className="bg-[#E8197A] h-1.5 rounded-full"
                          style={{ width: item.width }}
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-[#E8197A]">
                        {item.level}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Frosted bottom edge */}
            <div
              className="absolute bottom-0 left-4 right-4 h-24 pointer-events-none"
              style={{
                background:
                  "linear-gradient(to top, rgba(253,252,255,1) 0%, transparent 100%)",
              }}
            />
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
