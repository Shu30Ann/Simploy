"use client";

import { Columns2 } from "lucide-react";
import { manufacturingEmployerProfile } from "@/lib/mock-data";
import type { SimResult, SimState } from "@/lib/simulator/types";
import TimeframeSelector from "./TimeframeSelector";

interface Props {
  result: SimResult;
  timeframe: SimState["timeframe"];
  onTimeframeChange: (t: SimState["timeframe"]) => void;
  compareMode: boolean;
  onToggleCompare: () => void;
}

export default function SimulatorHeader({ result, timeframe, onTimeframeChange, compareMode, onToggleCompare }: Props) {
  const score = result.resilienceScore;
  const scoreColor = score >= 80 ? "var(--pink)" : score >= 50 ? "var(--slider-budget)" : "var(--risk-critical)";

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Workforce Gap Simulator
        </h1>
        <p className="mt-0.5 text-sm" style={{ color: "var(--text-secondary)" }}>
          Strategic workforce simulation for {manufacturingEmployerProfile.name}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: "var(--risk-growing)" }} />
            <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              Based on{" "}
              <span className="font-medium" style={{ color: "var(--text-secondary)" }}>
                {manufacturingEmployerProfile.employeeCount.toLocaleString()} employee records
              </span>
            </span>
          </div>
          <span className="text-xs" style={{ color: "var(--border)" }}>
            /
          </span>
          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            Last synced{" "}
            <span className="font-medium" style={{ color: "var(--text-secondary)" }}>
              2 days ago
            </span>
          </span>
          <span className="text-xs" style={{ color: "var(--border)" }}>
            /
          </span>
          <div className="flex items-center gap-1">
            <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              Model confidence:
            </span>
            <span className="text-[11px] font-semibold" style={{ color: "var(--risk-growing)" }}>
              87%
            </span>
          </div>
        </div>
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
  );
}
