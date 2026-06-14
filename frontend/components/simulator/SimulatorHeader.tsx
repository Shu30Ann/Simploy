"use client";

import { Columns2 } from "lucide-react";
import type { SimState, SimResult } from "@/lib/simulator/types";
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
  const scoreColor =
    score >= 80 ? "var(--pink)"
    : score >= 50 ? "var(--slider-budget)"
    : "var(--risk-critical)";

  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      {/* Left */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Workforce Gap Simulator
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
          Strategic workforce simulation · predict and close talent gaps
        </p>
        {/* Change 9 — data freshness */}
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "var(--risk-growing)" }} />
            <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              Based on{" "}
              <span className="font-medium" style={{ color: "var(--text-secondary)" }}>4,200 employee profiles</span>
            </span>
          </div>
          <span className="text-xs" style={{ color: "var(--border)" }}>·</span>
          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            Last synced{" "}
            <span className="font-medium" style={{ color: "var(--text-secondary)" }}>2 days ago</span>
          </span>
          <span className="text-xs" style={{ color: "var(--border)" }}>·</span>
          <div className="flex items-center gap-1">
            <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>Model confidence:</span>
            <span className="text-[11px] font-semibold" style={{ color: "var(--risk-growing)" }}>87%</span>
          </div>
        </div>
      </div>

      {/* Center — timeframe + compare toggle */}
      <div className="flex items-center gap-2">
        <TimeframeSelector value={timeframe} onChange={onTimeframeChange} />
        <button
          onClick={onToggleCompare}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
          style={compareMode
            ? { background: "var(--pink)", color: "white", borderColor: "var(--pink)" }
            : { background: "white", color: "var(--text-secondary)", borderColor: "var(--border)" }
          }
        >
          <Columns2 size={13} />
          {compareMode ? "Exit Compare" : "Compare Scenarios"}
        </button>
      </div>

      {/* Right — resilience score */}
      <div className="text-right">
        <p className="text-[10px] font-semibold tracking-widest uppercase mb-1"
          style={{ color: "var(--text-muted)" }}>
          Resilience Score
        </p>
        <div className="flex items-center gap-2 justify-end">
          <p className="text-2xl font-bold" style={{ color: scoreColor }}>
            {score.toFixed(1)}
          </p>
          <p className="text-lg font-medium" style={{ color: "var(--text-secondary)" }}>/ 100</p>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border-2"
            style={{ background: "var(--pink-lighter)", borderColor: scoreColor, color: scoreColor }}
          >
            {Math.round(score)}
          </div>
        </div>
      </div>
    </div>
  );
}
