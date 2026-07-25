"use client";

import { useEffect, useState } from "react";
import { MousePointer2, Lock } from "lucide-react";
import { motion } from "framer-motion";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";
import { manufacturingDepartments, manufacturingRoleGaps } from "@/lib/mock-data";

interface DeptData {
  id:    string;
  label: string;
  headcount: number;
  color: string;
  // Known facts
  avgAge:                  number;
  retirementsThisYear:     number;
  pendingResignations:     number;
  openRoles:               number;
  attritionRate:           number;
  avgTenure:               number;
  withinTenYrsRetirement:  number;
  inUpskilling:            number;
  flightRiskCount:         number;
  topSkills:               string[];
  // Simulated outlook
  projectedHeadcount:  number;
  projectedGap:        number;
  projectedRetirements: number;
  internalCandidates:  number;
  timeToCloseGap:      string;
  deptCostOfInaction:  string;
  recommendedAction:   "Hire" | "Upskill" | "Redeploy" | "Automate";
}

const DEPT_DATA: DeptData[] = ["#B08A44", "#56618C", "#17694F", "#F59E0B", "#17694F", "#8B7434"].map((color, index) => {
  const dept = manufacturingDepartments[index];
  const deptRoles = manufacturingRoleGaps.filter((role) => role.department === dept.name);
  const largestShortage = deptRoles.reduce((min, role) => Math.min(min, role.gap), 0);
  const recommendedAction = deptRoles.find((role) => role.gap < 0)?.recommendedAction ?? "Upskill";
  const displayAction =
    recommendedAction === "Mobility" ? "Redeploy" :
    recommendedAction === "Retain" ? "Upskill" : recommendedAction;

  return {
    id: dept.id,
    label: dept.name,
    headcount: dept.currentHeadcount,
    color,
    avgAge: 34 + index,
    retirementsThisYear: Math.round(dept.retirementRisk / 6),
    pendingResignations: Math.round(dept.attritionRisk / 7),
    openRoles: deptRoles.filter((role) => role.gap < 0).length * 3,
    attritionRate: dept.attritionRisk,
    avgTenure: Number((3.4 + index * 0.4).toFixed(1)),
    withinTenYrsRetirement: Math.round(dept.currentHeadcount * dept.retirementRisk / 100),
    inUpskilling: Math.round(dept.currentHeadcount * (100 - dept.skillReadiness) / 300),
    flightRiskCount: Math.round(dept.currentHeadcount * dept.attritionRisk / 100),
    topSkills: deptRoles.flatMap((role) => role.prioritySkills).slice(0, 3),
    projectedHeadcount: dept.projectedDemand,
    projectedGap: dept.currentHeadcount - dept.projectedDemand + largestShortage,
    projectedRetirements: Math.round(dept.currentHeadcount * dept.retirementRisk / 100),
    internalCandidates: deptRoles.filter((role) => role.recommendedAction === "Mobility" || role.recommendedAction === "Upskill").length * 12,
    timeToCloseGap: largestShortage < -80 ? "18 months with active intervention" : "6-12 months with current pipeline",
    deptCostOfInaction: `RM ${Math.max(0, Math.abs(largestShortage) * 120000).toLocaleString()}`,
    recommendedAction: displayAction,
  };
});

const TOTAL_HEADCOUNT = DEPT_DATA.reduce((s, d) => s + d.headcount, 0);


function DeptPopup({ dept, hasSimulated }: { dept: DeptData; hasSimulated: boolean }) {
  const pct = Math.round((dept.headcount / TOTAL_HEADCOUNT) * 100);

  const knownFacts = [
    { label: "Avg age",                value: `${dept.avgAge} yrs`        },
    { label: "Avg tenure",             value: `${dept.avgTenure} yrs`     },
    { label: "Retirements this yr",    value: dept.retirementsThisYear,   alert: dept.retirementsThisYear > 2 },
    { label: "Pending resignations",   value: dept.pendingResignations,   alert: dept.pendingResignations > 1 },
    { label: "Open roles",             value: dept.openRoles              },
    { label: "Attrition rate",         value: `${dept.attritionRate}%`,   alert: dept.attritionRate > 15 },
    { label: "Retire-eligible (10yr)", value: dept.withinTenYrsRetirement,alert: dept.withinTenYrsRetirement > 30 },
    { label: "In upskilling",          value: dept.inUpskilling           },
    { label: "Flight risk",            value: dept.flightRiskCount,       alert: dept.flightRiskCount > 15 },
  ];

  const simFacts = [
    { label: "Projected headcount",    value: dept.projectedHeadcount.toLocaleString()              },
    { label: "Expected gap",           value: dept.projectedGap < 0 ? `${dept.projectedGap.toLocaleString()} roles` : `+${dept.projectedGap} roles`, alert: dept.projectedGap < -50 },
    { label: "Projected retirements",  value: dept.projectedRetirements,  alert: dept.projectedRetirements > 30 },
    { label: "Internal candidates",    value: dept.internalCandidates     },
    { label: "Time to close gap",      value: dept.timeToCloseGap,        wide: true },
    { label: "Dept. cost of inaction", value: dept.deptCostOfInaction,    wide: true },
  ];

  return (
    <motion.div
      key={dept.id}
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="rounded-xl border-2 overflow-hidden h-full"
      style={{ borderColor: dept.color + "40" }}
    >
      {/* Header strip */}
      <div className="px-4 py-3 flex items-center gap-3" style={{ background: dept.color + "15" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          style={{ background: dept.color }}>
          {dept.id.toUpperCase().slice(0, 3)}
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{dept.label}</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {dept.headcount.toLocaleString()} employees · {pct}% of company
          </p>
        </div>
      </div>

      <div className="px-4 py-3 overflow-y-auto" style={{ maxHeight: 300 }}>
        {/* Known facts */}
        <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
          Known Today
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
          {knownFacts.map(item => (
            <div key={item.label}>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{item.label}</p>
              <p className="text-sm font-semibold"
                style={{ color: item.alert ? "var(--risk-critical)" : "var(--text-primary)" }}>
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {dept.topSkills.map(s => (
            <span key={s} className="text-[10px] px-2 py-0.5 rounded-full border"
              style={{ background: "var(--bg-page)", borderColor: "var(--border)", color: "var(--text-secondary)" }}>
              {s}
            </span>
          ))}
        </div>

        {/* Simulated outlook */}
        {hasSimulated ? (
          <div className="border-t pt-3 mt-1" style={{ borderColor: "var(--border)" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2"
              style={{ color: dept.color }}>
              Simulated Outlook
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {simFacts.map(item => (
                <div key={item.label} className={item.wide ? "col-span-2" : ""}>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{item.label}</p>
                  <p className="text-sm font-semibold"
                    style={{ color: item.alert ? "var(--risk-critical)" : "var(--text-primary)" }}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Recommended action:</p>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full text-white"
                style={{ background: dept.color }}>
                {dept.recommendedAction}
              </span>
            </div>
          </div>
        ) : (
          <div className="border-t pt-3 mt-1 flex items-center gap-2" style={{ borderColor: "var(--border)" }}>
            <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "var(--bg-page)", border: "1px solid var(--border)" }}>
              <Lock size={11} style={{ color: "var(--text-muted)" }} />
            </div>
            <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Run the simulation to unlock the projected outlook for this department.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function DepartmentPieChart({ hasSimulated = false }: { hasSimulated?: boolean }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [chartReady, setChartReady] = useState(false);
  const activeDept = DEPT_DATA.find(d => d.id === activeId) ?? null;

  useEffect(() => {
    setChartReady(true);
  }, []);

  const pieData = DEPT_DATA.map(d => ({
    ...d,
    value: hasSimulated ? Math.max(d.projectedHeadcount, 50) : d.headcount,
  }));


  return (
    <div className="bg-white rounded-2xl border p-5" style={{ borderColor: "var(--border)" }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-1 flex-wrap gap-3">
        <div>
          <p className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
            Department Breakdown
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            {TOTAL_HEADCOUNT.toLocaleString()} employees total ·{" "}
            {hasSimulated
              ? "Click a department to see current facts and simulation outlook"
              : "Click a department to see current facts — run simulation to unlock outlook"
            }
          </p>
        </div>
        {hasSimulated && (
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full border"
            style={{ background: "var(--bg-purple-soft)", color: "#56618C", borderColor: "var(--purple-border)" }}>
            Showing projected sizes
          </span>
        )}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-2 gap-6 mt-4 items-start">
        {/* Left — pie chart */}
        <div className="flex flex-col items-center">
          <div style={{ height: 240, width: "100%" }}>
            {chartReady && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onClick={(data: any) => setActiveId((prev: string | null) => prev === data.id ? null : data.id)}
                  animationBegin={0}
                  animationDuration={600}
                >
                  {pieData.map(entry => (
                    <Cell
                      key={entry.id}
                      fill={entry.color}
                      opacity={activeId && activeId !== entry.id ? 0.35 : 1}
                      style={{ cursor: "pointer", transition: "opacity 0.2s" }}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            )}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-2">
            {DEPT_DATA.map(d => (
              <button
                key={d.id}
                onClick={() => setActiveId(prev => prev === d.id ? null : d.id)}
                className="flex items-center gap-1.5 transition-colors"
                style={{ color: activeId === d.id ? "var(--text-primary)" : "var(--text-secondary)", fontSize: 12 }}
              >
                <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                {d.label}
                <span style={{ color: "var(--text-muted)", fontSize: 11 }}>
                  {Math.round((d.headcount / TOTAL_HEADCOUNT) * 100)}%
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right — popup panel */}
        <div style={{ minHeight: 240 }}>
          {!activeDept ? (
            <div className="h-full flex flex-col items-center justify-center text-center rounded-xl p-6"
              style={{ border: "2px dashed var(--border)", minHeight: 240 }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
                style={{ background: "var(--bg-page)" }}>
                <MousePointer2 size={18} style={{ color: "var(--text-muted)" }} />
              </div>
              <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                Click a department slice
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                to see its breakdown
              </p>
            </div>
          ) : (
            <DeptPopup dept={activeDept} hasSimulated={hasSimulated} />
          )}
        </div>
      </div>
    </div>
  );
}
