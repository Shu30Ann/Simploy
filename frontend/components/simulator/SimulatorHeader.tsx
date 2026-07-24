"use client";

import { useState } from "react";
import { AlertTriangle, ArrowRight, BadgeCheck, Building2, ChevronDown, Coins, Columns2, Users } from "lucide-react";
import Link from "next/link";
import { manufacturingEmployerProfile } from "@/lib/mock-data";
import { routes } from "@/lib/routes";
import type { SimResult, SimState } from "@/lib/simulator/types";
import TimeframeSelector from "./TimeframeSelector";

interface Props {
  result: SimResult;
  hasSimulated: boolean;
  timeframe: SimState["timeframe"];
  onTimeframeChange: (t: SimState["timeframe"]) => void;
  compareMode: boolean;
  onToggleCompare: () => void;
}

export default function SimulatorHeader({ result, hasSimulated, timeframe, onTimeframeChange, compareMode, onToggleCompare }: Props) {
  const [showModelInfo, setShowModelInfo] = useState(false);
  const score = result.resilienceScore;
  const scoreColor = score >= 80 ? "var(--pink)" : score >= 50 ? "var(--slider-budget)" : "var(--risk-critical)";
  const residualGap = Math.max(0, result.projectedGap - result.gapReductionPotential);
  const confidence = score >= 75 ? "Managed" : score >= 55 ? "Exposed" : "Critical";

  return (
    <section className="rounded-2xl border bg-white p-5 shadow-[0_8px_28px_rgba(70,60,35,0.06)]" style={{ borderColor: "var(--border)" }}>
      {/* Top row: title + controls + resilience score */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wide" style={{ background: "var(--bg-pink-soft)", borderColor: "var(--pink-border)", color: "var(--pink)" }}>
              <Building2 size={13} />
              {manufacturingEmployerProfile.name}
            </span>
            <span className="inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wide" style={{ background: "var(--bg-teal-soft)", borderColor: "var(--teal-border)", color: "var(--teal)" }}>
              {manufacturingEmployerProfile.employeeCount.toLocaleString()} employees
            </span>
            <button
              type="button"
              onClick={() => setShowModelInfo((v) => !v)}
              className="inline-flex items-center gap-1 text-[11px]"
              style={{ color: "var(--text-muted)" }}
            >
              Model info
              <ChevronDown size={12} className="transition-transform" style={{ transform: showModelInfo ? "rotate(180deg)" : "none" }} />
            </button>
          </div>
          <h1 className="mt-2 text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            {hasSimulated ? "Simulation result ready" : "Model your workforce risk before committing a plan"}
          </h1>
          {showModelInfo && (
            <div className="mt-2 flex flex-wrap items-center gap-3 rounded-lg border px-3 py-2" style={{ borderColor: "var(--border)", background: "var(--bg-page)" }}>
              <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                Last synced <span className="font-medium" style={{ color: "var(--text-secondary)" }}>2 days ago</span>
              </span>
              <span className="text-xs" style={{ color: "var(--border)" }}>/</span>
              <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                Model confidence <span className="font-semibold" style={{ color: "var(--risk-growing)" }}>87%</span>
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <TimeframeSelector value={timeframe} onChange={onTimeframeChange} />
          <button
            type="button"
            onClick={onToggleCompare}
            className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all"
            style={
              compareMode
                ? { background: "var(--pink)", color: "white", borderColor: "var(--pink)" }
                : { background: "white", color: "var(--text-secondary)", borderColor: "var(--border)" }
            }
          >
            <Columns2 size={13} />
            {compareMode ? "Exit Compare" : "Compare Scenarios"}
          </button>
        </div>

        <div className="text-right">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
            Resilience Score
          </p>
          <div className="flex items-center justify-end gap-2">
            <p className="text-2xl font-bold" style={{ color: scoreColor }}>
              {score.toFixed(1)}
            </p>
            <p className="text-lg font-medium" style={{ color: "var(--text-secondary)" }}>
              / 100
            </p>
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full border-2 text-[10px] font-bold"
              style={{ background: "var(--pink-lighter)", borderColor: scoreColor, color: scoreColor }}
            >
              {Math.round(score)}
            </div>
          </div>
        </div>
      </div>

      {/* Narrative + CTA */}
      <div className="mt-4 grid gap-4 border-t pt-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center" style={{ borderColor: "var(--border)" }}>
        <p className="max-w-3xl text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
          {hasSimulated
            ? result.modelNarrative
            : "Run the model to reveal the projected shortage, internal mobility pool, cost of inaction, and recommended intervention mix."}
        </p>
        <Link
          href={routes.employerActionEngine}
          className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold transition ${
            hasSimulated ? "text-white" : "pointer-events-none opacity-55"
          }`}
          style={{ background: hasSimulated ? "var(--pink)" : "var(--border)", color: hasSimulated ? "white" : "var(--text-muted)" }}
          aria-disabled={!hasSimulated}
        >
          Generate Action Plan
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Stat tiles */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Projected gap",
            value: `${result.projectedGap.toLocaleString()} roles`,
            detail: hasSimulated ? "Shortage after current levers" : "Run simulation to validate",
            icon: AlertTriangle,
            tone: "var(--risk-critical)",
          },
          {
            label: "Gap reduction potential",
            value: `${result.gapReductionPotential.toLocaleString()} roles`,
            detail: `Residual risk: ${residualGap.toLocaleString()} roles`,
            icon: BadgeCheck,
            tone: "var(--risk-growing)",
          },
          {
            label: "Internal pool",
            value: `${result.internalReadyNow + result.internalTrainable}`,
            detail: `${result.internalReadyNow} ready now, ${result.internalTrainable} trainable`,
            icon: Users,
            tone: "#56618C",
          },
          {
            label: "Cost exposure",
            value: `RM ${(result.costOfInaction / 1e6).toFixed(1)}M`,
            detail: `${confidence} resilience posture`,
            icon: Coins,
            tone: "var(--pink)",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.label} className="rounded-xl border p-3" style={{ borderColor: "var(--border)", background: "var(--bg-page)" }}>
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white" style={{ color: item.tone }}>
                  <Icon size={17} />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                    {item.label}
                  </p>
                  <p className="mt-1 text-lg font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
                    {item.value}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-4" style={{ color: "var(--text-secondary)" }}>
                    {item.detail}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
