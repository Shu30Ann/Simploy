"use client";

import { Sparkles } from "lucide-react";
import FadeUp from "@/components/ui/FadeUp";
import DemoLoginButton from "@/components/auth/DemoLoginButton";

export default function Hero() {
  return (
    <section className="pt-32 pb-20 text-center relative">
      <div className="relative z-10 px-4">
        {/* Eyebrow */}
        <FadeUp delay={0}>
          <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium bg-[#F6F1E4] text-[#B08A44] border border-[#E3D8BC] mb-6">
            <Sparkles size={14} /> Introducing the Career OS
          </span>
        </FadeUp>

        {/* Headline */}
        <FadeUp delay={0.05}>
          <h1
            className="font-bold leading-[1.1] tracking-tight text-[#F7F3EA]"
            style={{
              fontSize: "clamp(36px, 6vw, 64px)",
              textShadow: "0 2px 24px rgba(8,16,35,0.6)",
            }}
          >
            The Career{" "}
            <span className="text-[#C8A45F]">OS</span> your
            <br />
            workforce deserves.
          </h1>
        </FadeUp>

        {/* Subheadline */}
        <FadeUp delay={0.1}>
          <p
            className="text-lg text-white/85 max-w-[540px] mx-auto mt-4 leading-relaxed"
            style={{ textShadow: "0 1px 12px rgba(8,16,35,0.7)" }}
          >
            Simploy maps your live talent graph, simulates future workforce gaps,
            and recommends the exact actions to close them — before they become
            crises.
          </p>
        </FadeUp>

        {/* CTAs */}
        <FadeUp delay={0.15}>
          <div className="flex items-center justify-center gap-3 mt-8 flex-wrap">
            <DemoLoginButton
              role="employee"
              className="border border-white/70 text-white hover:bg-white/10 rounded-full font-semibold transition-colors px-7 py-3 text-sm backdrop-blur-sm disabled:cursor-not-allowed disabled:opacity-70"
            >
              I&apos;m an Employee
            </DemoLoginButton>
            <DemoLoginButton
              role="employer"
              className="bg-[#F7F3EA] hover:bg-white text-[#1E2A44] rounded-full font-semibold transition-colors px-7 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-70"
            >
              I&apos;m an Employer
            </DemoLoginButton>
          </div>
        </FadeUp>

        {/* Sub-CTA */}
        <FadeUp delay={0.2}>
          <p
            className="text-xs text-white/70 mt-3"
            style={{ textShadow: "0 1px 8px rgba(8,16,35,0.7)" }}
          >
            Free for employees · No credit card required
          </p>
        </FadeUp>

      </div>
    </section>
  );
}
