"use client";

import { useState } from "react";
import { ShieldCheck, Lock, Globe, Search, Sparkles } from "lucide-react";
import FadeUp from "@/components/ui/FadeUp";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Hero() {
  const [mode, setMode] = useState<"job" | "hiring">("job");
  const router = useRouter();

  return (
    <section className="bg-[#F7F3EA] pt-32 pb-20 overflow-hidden relative">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left — copy */}
        <div>
          <FadeUp delay={0}>
            <p className="flex items-center gap-3 font-mono text-xs font-semibold tracking-[0.25em] uppercase text-[#8B7434] mb-6">
              <span className="inline-block w-8 h-px bg-[#17694F]" aria-hidden />
              The home of leading brands
            </p>
          </FadeUp>

          {/* Job / hiring toggle */}
          <FadeUp delay={0.05}>
            <div className="inline-flex items-center bg-[#EFEADF] border border-[#E3DCC9] rounded-full p-1.5 mb-8">
              <button
                onClick={() => setMode("job")}
                className={`text-sm font-semibold rounded-full px-5 py-2.5 transition-colors ${
                  mode === "job"
                    ? "bg-[#1E2A44] text-white"
                    : "text-[#5D6470] hover:text-[#1E2A44]"
                }`}
              >
                I&apos;m looking for a job
              </button>
              <button
                onClick={() => setMode("hiring")}
                className={`text-sm font-semibold rounded-full px-5 py-2.5 transition-colors ${
                  mode === "hiring"
                    ? "bg-[#1E2A44] text-white"
                    : "text-[#5D6470] hover:text-[#1E2A44]"
                }`}
              >
                I&apos;m hiring
              </button>
            </div>
          </FadeUp>

          {/* Headline */}
          <FadeUp delay={0.1}>
            <h1
              className="font-serif font-bold text-[#1E2A44] leading-[1.08] tracking-tight"
              style={{ fontSize: "clamp(40px, 5.5vw, 64px)" }}
            >
              Where the world&apos;s{" "}
              <em className="text-[#B08A44] font-medium">
                most admired companies
              </em>{" "}
              hire.
            </h1>
          </FadeUp>

          {/* Subheadline */}
          <FadeUp delay={0.15}>
            <p className="text-lg text-[#5D6470] mt-5 leading-relaxed max-w-[520px]">
              From{" "}
              <em className="font-serif text-[#8B7434]">
                startups to global enterprises
              </em>
              , your next move starts at 900+ of the most admired companies,
              guided by AI.
            </p>
          </FadeUp>

          {/* Search bar */}
          <FadeUp delay={0.2}>
            <form
              className="mt-8 flex items-center bg-white rounded-full border border-[#EAE3D3] shadow-[0_4px_24px_rgba(70,60,35,0.08)] p-2 pl-6 max-w-[560px]"
              onSubmit={(e) => {
                e.preventDefault();
                router.push(
                  mode === "job" ? "/signup?role=employee" : "/signup?role=employer"
                );
              }}
            >
              <input
                type="text"
                placeholder={
                  mode === "job"
                    ? 'Try "remote data analyst"'
                    : 'Try "senior protocol engineer"'
                }
                className="flex-1 bg-transparent text-sm text-[#1E2A44] placeholder-[#9CA3AF] outline-none min-w-0"
              />
              <button
                type="submit"
                className="flex items-center gap-2 bg-[#1E2A44] hover:bg-[#16233C] text-white text-sm font-semibold rounded-full px-7 py-3 transition-colors flex-shrink-0"
              >
                <Search size={15} /> Search
              </button>
            </form>
          </FadeUp>

          {/* Trust row */}
          <FadeUp delay={0.25}>
            <div className="flex items-center gap-6 mt-6 flex-wrap text-sm text-[#5D6470]">
              <span className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#17694F]" /> Verified
                employers only
              </span>
              <span className="flex items-center gap-2">
                <Lock size={16} className="text-[#17694F]" /> Private &amp; secure
              </span>
              <span className="flex items-center gap-2">
                <Globe size={16} className="text-[#17694F]" /> Trusted worldwide
              </span>
            </div>
          </FadeUp>
        </div>

        {/* Right — AI trajectory chart */}
        <FadeUp delay={0.2}>
          <div className="relative hidden lg:block">
            <p className="flex items-center justify-center gap-2 font-mono text-xs tracking-[0.25em] uppercase text-[#9A947F] mb-6">
              <Sparkles size={12} /> Projected with AI
            </p>

            <svg viewBox="0 0 520 360" fill="none" className="w-full">
              {/* Grid lines */}
              {[170, 300, 430].map((x) => (
                <line
                  key={x}
                  x1={x}
                  y1={40}
                  x2={x}
                  y2={310}
                  stroke="#E3DCC9"
                  strokeDasharray="3 5"
                />
              ))}
              <line x1={40} y1={310} x2={480} y2={310} stroke="#D9D1BC" />

              {/* Peer curves (green) */}
              <path
                d="M60 305 C 200 290, 340 240, 470 155"
                stroke="#4E8A73"
                strokeWidth="2.5"
                opacity="0.55"
              />
              <path
                d="M60 305 C 210 296, 360 265, 470 205"
                stroke="#4E8A73"
                strokeWidth="2.5"
                opacity="0.35"
              />

              {/* Director track (gold) */}
              <path
                d="M60 305 C 200 285, 350 200, 462 75"
                stroke="#B08A44"
                strokeWidth="5"
                strokeLinecap="round"
              />

              {/* Milestone dots on gold curve */}
              <circle cx={205} cy={272} r={6} fill="#F7F3EA" stroke="#B08A44" strokeWidth="2.5" />
              <circle cx={330} cy={212} r={6} fill="#F7F3EA" stroke="#B08A44" strokeWidth="2.5" />

              {/* End point */}
              <circle cx={462} cy={75} r={12} fill="#B08A44" opacity="0.25" />
              <circle cx={462} cy={75} r={7} fill="#B08A44" stroke="#FFFFFF" strokeWidth="2.5" />

              {/* Start point (You) */}
              <circle cx={60} cy={305} r={7} fill="#1E2A44" />

              {/* Labels */}
              <text x={462} y={48} textAnchor="end" fontFamily="var(--font-mono), monospace" fontSize="14" fontWeight="700" fill="#8B6D2F">
                Director track
              </text>
              <text x={410} y={190} textAnchor="start" fontFamily="var(--font-mono), monospace" fontSize="12" fill="#7A8A80">
                Peers like you
              </text>
              <text x={60} y={340} textAnchor="middle" fontFamily="var(--font-mono), monospace" fontSize="13" fill="#1E2A44">
                You
              </text>
              <text x={170} y={340} textAnchor="middle" fontFamily="var(--font-mono), monospace" fontSize="12" fill="#9A947F">
                2 yrs
              </text>
              <text x={300} y={340} textAnchor="middle" fontFamily="var(--font-mono), monospace" fontSize="12" fill="#9A947F">
                5 yrs
              </text>
              <text x={430} y={340} textAnchor="middle" fontFamily="var(--font-mono), monospace" fontSize="12" fill="#9A947F">
                8 yrs
              </text>
            </svg>

            {/* Floating match card */}
            <div className="absolute top-16 left-2 bg-white/80 backdrop-blur rounded-2xl border border-[#EAE3D3] shadow-[0_8px_32px_rgba(70,60,35,0.10)] px-5 py-4">
              <p className="text-sm font-semibold text-[#1E2A44]">
                Great match found
              </p>
              <p className="text-xs text-[#5D6470] mt-0.5">
                98% fit · Senior Analyst
              </p>
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#17694F] mt-3 pt-3 border-t border-[#EAE3D3]">
                ✦ Simploy AI
              </p>
            </div>

            <p className="text-center text-sm text-[#5D6470] mt-6 leading-relaxed max-w-[440px] mx-auto">
              Your career trajectory,{" "}
              <em className="font-serif text-[#B08A44]">predicted</em>. Simploy
              maps where people like you went next, then walks every step with
              you.
            </p>
          </div>
        </FadeUp>
      </div>

      {/* Mobile CTA fallback */}
      <div className="lg:hidden text-center mt-10 px-6">
        <Link
          href={mode === "job" ? "/signup?role=employee" : "/signup?role=employer"}
          className="text-sm font-semibold text-[#8B6D2F] underline underline-offset-4"
        >
          See your AI-projected career path →
        </Link>
      </div>
    </section>
  );
}
