"use client";

import { useEffect, useState } from "react";
import type { DeptRisk, SimResult } from "@/lib/simulator/types";

function getRiskStyle(stability: DeptRisk["stability"]) {
  return ({
    Critical: { color: "#E8197A" },
    "At Risk": { color: "#F59E0B" },
    Stable:   { color: "#06B6D4" },
    Growing:  { color: "#10B981" },
  } as const)[stability];
}

function AnimatedScore({ target }: { target: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 600;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setDisplay(Math.round(progress * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target]);

  return <>{display}</>;
}

export default function DepartmentRiskPanel({ result }: { result: SimResult }) {
  return (
    <div className="bg-white rounded-2xl border p-5" style={{ borderColor: "var(--border)" }}>
      <p className="text-[10px] font-semibold tracking-widest uppercase"
        style={{ color: "var(--text-muted)" }}>
        Department Risk Profile
      </p>

      <div className="flex flex-col gap-3 mt-4">
        {result.deptRisks.map(dept => {
          const { color } = getRiskStyle(dept.stability);
          return (
            <div key={dept.id} className="flex items-center gap-3">
              {/* Avatar */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0
                  text-[11px] font-bold border-2"
                style={{
                  background: `${color}22`,
                  borderColor: color,
                  color,
                }}
              >
                {dept.abbr}
              </div>

              {/* Label */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  {dept.label}
                </p>
                <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                  Stability: {dept.stability}
                </p>
              </div>

              {/* Score */}
              <div className="text-right">
                <p className="text-base font-bold" style={{ color }}>
                  <AnimatedScore target={dept.score} />%
                </p>
                <p className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                  risk score
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
