"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Clock, Users } from "lucide-react";
import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from "recharts";
import type { SimResult, SimState, ChartPoint } from "@/lib/simulator/types";

interface Props {
  result: SimResult;
  aiPresetActive: boolean;
  timeframe: SimState["timeframe"];
  compareMode?: boolean;
  resultB?: SimResult;
}

const LEGEND = [
  { color: "#D3D3D8", label: "Projected Supply", dashed: true  },
  { color: "#E8197A", label: "Projected Demand", dashed: false },
  { color: "#7F77DD", label: "Net Position",     dashed: false },
];

const LEGEND_B = [
  { color: "#BEBEC2", label: "B Supply", dashed: true  },
  { color: "#FF7BAE", label: "B Demand", dashed: false },
  { color: "#A9A5EC", label: "B Net",    dashed: false },
];

function mergeChartData(a: ChartPoint[], b: ChartPoint[]): ChartPoint[] {
  return a.map((pt, i) => ({
    ...pt,
    supply_b: b[i]?.supply,
    demand_b: b[i]?.demand,
    net_b:    b[i]?.net,
  }));
}

export default function SupplyDemandChart({ result, aiPresetActive, compareMode, resultB }: Props) {
  const [showCostBreakdown, setShowCostBreakdown] = useState(false);
  const { chartData } = result;
  const lastPoint = chartData[chartData.length - 1];
  const lastB = resultB?.chartData[resultB.chartData.length - 1];

  const mergedData = compareMode && resultB
    ? mergeChartData(chartData, resultB.chartData)
    : chartData;

  const stats = [
    { label: "Projected Supply", value: lastPoint.supply.toLocaleString(), change: "-5% YoY", down: true },
    { label: "Projected Demand", value: lastPoint.demand.toLocaleString(), change: "+12% YoY", down: false },
    { label: "High-Risk Roles",  value: result.highRiskRoles.toString(), sub: "Across 3 depts" },
    {
      label: "Cost of Inaction",
      value: `$${(result.costOfInaction / 1e6).toFixed(1)}M`,
      sub: "Est. by 2030",
      clickable: true,
    },
    { label: "Avg Time-to-Fill", value: "4.2 mo", sub: "Start hiring by Q2 2025", highlight: true },
  ];

  return (
    <div className="bg-white rounded-2xl border p-5" style={{ borderColor: "var(--border)" }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3 flex-wrap gap-3">
        <p className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
          Supply vs Demand Dynamics
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          {LEGEND.map(item => (
            <div key={item.label} className="flex items-center gap-1.5">
              {item.dashed
                ? <svg width="16" height="4" viewBox="0 0 16 4"><line x1="0" y1="2" x2="16" y2="2" stroke={item.color} strokeWidth="2" strokeDasharray="4 2" /></svg>
                : <div className="h-0.5 w-4 rounded-full" style={{ background: item.color }} />
              }
              <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>{item.label}</span>
            </div>
          ))}
          {compareMode && LEGEND_B.map(item => (
            <div key={item.label} className="flex items-center gap-1.5">
              {item.dashed
                ? <svg width="16" height="4" viewBox="0 0 16 4"><line x1="0" y1="2" x2="16" y2="2" stroke={item.color} strokeWidth="2" strokeDasharray="2 2" /></svg>
                : <div className="h-0.5 w-4 rounded-full" style={{ background: item.color }} />
              }
              <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Change 4 — Internal talent pool overlay */}
      <div className="flex items-center gap-3 rounded-xl px-4 py-2.5 mb-3 border"
        style={{ background: "var(--bg-purple-soft)", borderColor: "var(--purple-border)" }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "#7F77DD" }}>
          <Users size={14} color="white" />
        </div>
        <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          <span className="font-semibold" style={{ color: "var(--text-primary)" }}>14 of 38 gap roles</span>
          {" "}can be filled internally · 45 current employees are eligible for upskilling.{" "}
          <button className="font-medium hover:underline" style={{ color: "#7F77DD" }}>View candidates →</button>
        </p>
      </div>

      {/* Chart */}
      <div style={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mergedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1EFE8" vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false}
              tickFormatter={v => `${(v / 1000).toFixed(1)}k`} />
            <Tooltip
              contentStyle={{ background: "white", border: "0.5px solid #E8E6E0", borderRadius: 10, fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
              formatter={(value, name) => [
                `${Number(value ?? 0).toLocaleString()} roles`,
                name === "supply" ? "Supply A" : name === "demand" ? "Demand A" : name === "net" ? "Net A"
                  : name === "supply_b" ? "Supply B" : name === "demand_b" ? "Demand B" : "Net B",
              ]}
            />
            <ReferenceLine x="2024" stroke="#E8E6E0" strokeDasharray="4 4"
              label={{ value: "Today", position: "top", fontSize: 10, fill: "#9CA3AF" }} />
            {aiPresetActive && (
              <ReferenceLine x="2027" stroke="#E8197A" strokeDasharray="3 3" strokeOpacity={0.5}
                label={{ value: "AUTOMATION INFLECTION (2027)", position: "insideTopLeft", fontSize: 9, fill: "#E8197A", fontWeight: 600 }} />
            )}
            <Line type="monotone" dataKey="supply" stroke="#D3D3D8" strokeWidth={2} strokeDasharray="6 3" dot={false} animationDuration={800} />
            <Line type="monotone" dataKey="demand" stroke="#E8197A" strokeWidth={2.5} dot={false} animationDuration={800} />
            <Line type="monotone" dataKey="net"    stroke="#7F77DD" strokeWidth={2}   dot={false} animationDuration={800} />
            {compareMode && <>
              <Line type="monotone" dataKey="supply_b" stroke="#BEBEC2" strokeWidth={1.5} strokeDasharray="3 3" dot={false} animationDuration={800} />
              <Line type="monotone" dataKey="demand_b" stroke="#FF7BAE" strokeWidth={1.5} dot={false} animationDuration={800} />
              <Line type="monotone" dataKey="net_b"    stroke="#A9A5EC" strokeWidth={1.5} dot={false} animationDuration={800} />
            </>}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Stat bar — 5 cols */}
      <motion.div
        key={chartData.length + lastPoint.supply}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid gap-3 mt-4 pt-4 border-t"
        style={{ borderColor: "var(--border)", gridTemplateColumns: "repeat(5, 1fr)" }}
      >
        {stats.map(stat => (
          <div
            key={stat.label}
            className="flex flex-col gap-0.5 rounded-lg transition-colors"
            style={stat.clickable ? { cursor: "pointer" } : {}}
            onClick={stat.clickable ? () => setShowCostBreakdown(v => !v) : undefined}
          >
            <p className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              {stat.label}
            </p>
            <p className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
              {stat.value}
            </p>
            {"change" in stat && stat.change && (
              <p className="text-[11px] font-medium flex items-center gap-0.5"
                style={{ color: stat.down ? "var(--risk-critical)" : "var(--risk-growing)" }}>
                {stat.down ? <TrendingDown size={10} /> : <TrendingUp size={10} />}
                {stat.change}
              </p>
            )}
            {"highlight" in stat && stat.highlight && stat.sub ? (
              <p className="text-[11px] font-medium flex items-center gap-0.5"
                style={{ color: "var(--slider-budget)" }}>
                <Clock size={10} />{stat.sub}
              </p>
            ) : ("sub" in stat && stat.sub && !stat.highlight && (
              <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{stat.sub}</p>
            ))}
          </div>
        ))}
      </motion.div>

      {/* Change 2 — Cost breakdown panel */}
      {showCostBreakdown && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-4 rounded-xl border"
          style={{ background: "var(--bg-pink-soft)", borderColor: "var(--pink-border)" }}
        >
          <p className="text-xs font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
            Cost of Inaction — Breakdown
          </p>
          {[
            { label: "Lost productivity (gap × avg. salary)", value: "$89.4M" },
            { label: "Contractor / overtime backfill",        value: "$34.2M" },
            { label: "Emergency agency recruitment",          value: "$22.8M" },
            { label: "Onboarding and ramp time cost",         value: "$14.6M" },
          ].map(item => (
            <div key={item.label} className="flex justify-between py-1.5 border-b last:border-0"
              style={{ borderColor: "var(--pink-border)" }}>
              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{item.label}</span>
              <span className="text-xs font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>{item.value}</span>
            </div>
          ))}
          <div className="flex justify-between pt-3 mt-1">
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>vs. Upskill + Hire plan cost</span>
            <span className="text-xs font-semibold tabular-nums" style={{ color: "var(--teal)" }}>$23.4M</span>
          </div>
          <div className="flex justify-between items-center mt-2 pt-2 border-t" style={{ borderColor: "var(--pink-border)" }}>
            <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>Potential savings</span>
            <span className="text-sm font-bold tabular-nums" style={{ color: "var(--risk-growing)" }}>$137.6M</span>
          </div>
        </motion.div>
      )}

      {/* Compare mode summary */}
      {compareMode && resultB && lastB && (
        <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
          <div className="p-3 rounded-xl border"
            style={{ background: "var(--bg-pink-soft)", borderColor: "var(--pink-border)" }}>
            <p className="text-xs font-semibold mb-1" style={{ color: "var(--pink)" }}>Scenario A</p>
            <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
              Gap: −{result.projectedGap.toLocaleString()} roles
            </p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Resilience: {result.resilienceScore.toFixed(1)} / 100
            </p>
          </div>
          <div className="p-3 rounded-xl border"
            style={{ background: "var(--bg-purple-soft)", borderColor: "var(--purple-border)" }}>
            <p className="text-xs font-semibold mb-1" style={{ color: "#7F77DD" }}>Scenario B</p>
            <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
              Gap: −{resultB.projectedGap.toLocaleString()} roles
            </p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Resilience: {resultB.resilienceScore.toFixed(1)} / 100
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
