"use client";

import type { SimState } from "@/lib/simulator/types";

const TIMEFRAMES: SimState["timeframe"][] = ["6month", "1 yr", "3 yr", "5 yr"];

interface Props {
  value: SimState["timeframe"];
  onChange: (v: SimState["timeframe"]) => void;
}

export default function TimeframeSelector({ value, onChange }: Props) {
  return (
    <div className="flex rounded-xl p-1 gap-0.5" style={{ background: "#F7F3EA" }}>
      {TIMEFRAMES.map(t => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap"
          style={
            value === t
              ? { background: "white", color: "var(--pink)", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }
              : { color: "var(--text-secondary)" }
          }
        >
          {t}
        </button>
      ))}
    </div>
  );
}
