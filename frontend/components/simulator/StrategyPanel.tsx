"use client";

import { useState } from "react";
import { AlertTriangle, ArrowRight } from "lucide-react";

const strategies = [
  {
    title: "Technician Pipeline Strategy",
    detail: "Build TVET and regional hiring channels for maintenance technicians before the 2031 shortage peaks.",
    button: "Execute Plan",
    message: "Technician pipeline created: 58 hires and 72 operator conversions queued for planning.",
    accent: "var(--pink-lighter)",
  },
  {
    title: "Operator Mobility Program",
    detail: "Convert production operator surplus into QA, line supervisor, and technician pathways.",
    button: "Allocate Budget",
    message: "Mobility budget preview allocated: RM 1.1M across three transition cohorts.",
    accent: "var(--purple-light)",
  },
];

export default function StrategyPanel() {
  const [message, setMessage] = useState<string | null>(null);

  const trigger = (nextMessage: string) => {
    setMessage(nextMessage);
    window.setTimeout(() => setMessage(null), 3200);
  };

  return (
    <div className="rounded-2xl border bg-white p-5" style={{ borderColor: "var(--border)" }}>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
          Strategic Action Panel
        </p>
        <span
          className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold text-white"
          style={{ background: "var(--pink)" }}
        >
          <AlertTriangle size={10} />
          3 PRIORITY ALERTS
        </span>
      </div>

      {message && (
        <div className="mb-4 rounded-lg border px-3 py-2 text-xs font-bold" style={{ borderColor: "var(--teal-border)", background: "var(--bg-teal-soft)", color: "var(--teal)" }}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {strategies.map((strategy) => (
          <div key={strategy.title} className="relative overflow-hidden rounded-xl border p-4" style={{ borderColor: "var(--border)" }}>
            <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full opacity-60" style={{ background: strategy.accent }} />
            <p className="relative z-10 mb-2 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              {strategy.title}
            </p>
            <p className="relative z-10 text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {strategy.detail}
            </p>
            <button
              type="button"
              onClick={() => trigger(strategy.message)}
              className="relative z-10 mt-3 flex items-center gap-1 text-xs font-medium hover:underline"
              style={{ color: "var(--pink)" }}
            >
              {strategy.button} <ArrowRight size={11} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
