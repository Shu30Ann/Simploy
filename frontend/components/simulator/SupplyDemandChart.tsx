"use client";

import { useEffect, useState } from "react";
import { Clock, TrendingDown, TrendingUp, Users, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SimResult, SimState } from "@/lib/simulator/types";

interface Props {
  result: SimResult;
  aiPresetActive: boolean;
  timeframe: SimState["timeframe"];
  compareMode?: boolean;
  resultB?: SimResult;
}

const LEGEND = [
  { color: "#EAE3D3", label: "Projected Supply", shape: "bar" },
  { color: "#B08A44", label: "Projected Demand", shape: "bar" },
  { color: "#56618C", label: "Net Position", shape: "line" },
];

export default function SupplyDemandChart({ result, aiPresetActive, compareMode, resultB }: Props) {
  const [showCostBreakdown, setShowCostBreakdown] = useState(false);
  const [showTalentPools, setShowTalentPools] = useState(false);
  const [chartReady, setChartReady] = useState(false);

  useEffect(() => {
    setChartReady(true);
  }, []);

  const { chartData } = result;
  const lastPoint = chartData[chartData.length - 1];
  const mergedData = chartData.map((pt, index) => ({
    year: pt.year,
    supplyA: pt.supply,
    demandA: pt.demand,
    netA: pt.net,
    supplyB: resultB?.chartData[index]?.supply,
    demandB: resultB?.chartData[index]?.demand,
    netB: resultB?.chartData[index]?.net,
  }));

  const stats = [
    { label: "Projected Supply", value: lastPoint.supply.toLocaleString(), change: "-5% YoY", down: true },
    { label: "Projected Demand", value: lastPoint.demand.toLocaleString(), change: "+12% YoY", down: false },
    { label: "High-Risk Roles", value: result.highRiskRoles.toString(), sub: "Across critical roles" },
    {
      label: "Cost of Inaction",
      value: `RM ${(result.costOfInaction / 1e6).toFixed(1)}M`,
      sub: "By 2031",
      clickable: true,
    },
    { label: "Avg Time-to-Fill", value: "4.2 mo", sub: "Start hiring by Q2 2026", highlight: true },
  ];

  return (
    <div className="rounded-2xl border bg-white p-5" style={{ borderColor: "var(--border)" }}>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
            Workforce Supply vs Demand Dynamics
          </p>
          <p className="mt-1 max-w-2xl text-xs leading-5" style={{ color: "var(--text-muted)" }}>
            {result.modelNarrative}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {LEGEND.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              {item.shape === "bar" ? (
                <div className="h-3 w-3 rounded-sm" style={{ background: item.color }} />
              ) : (
                <div className="h-0.5 w-4 rounded-full" style={{ background: item.color }} />
              )}
              <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                {item.label}
              </span>
            </div>
          ))}
          {compareMode && (
            <>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-sm opacity-60" style={{ background: "#F7F3EA" }} />
                <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                  B Supply
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-sm opacity-60" style={{ background: "#C8A45F" }} />
                <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                  B Demand
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <div
        className="mb-3 flex items-center gap-3 rounded-xl border px-4 py-2.5"
        style={{ background: "var(--bg-purple-soft)", borderColor: "var(--purple-border)" }}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: "#56618C" }}>
          <Users size={14} color="white" />
        </div>
        <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
            {result.internalReadyNow.toLocaleString()} employees ready now
          </span>{" "}
          and {result.internalTrainable.toLocaleString()} trainable employees can offset priority gaps.{" "}
          <button
            type="button"
            onClick={() => setShowTalentPools(true)}
            className="font-medium hover:underline"
            style={{ color: "#56618C" }}
          >
            View candidates
          </button>
        </p>
      </div>

      <div style={{ height: 240 }}>
        {chartReady && (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={mergedData} barCategoryGap="35%" margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F7F3EA" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${(Number(value) / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  background: "white",
                  border: "0.5px solid #EAE3D3",
                  borderRadius: 10,
                  fontSize: 12,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
                formatter={(value, name) => [
                  `${Number(value ?? 0).toLocaleString()} roles`,
                  name === "supplyA"
                    ? "Projected Supply"
                    : name === "demandA"
                      ? "Projected Demand"
                      : name === "netA"
                        ? "Net Position"
                        : name === "supplyB"
                          ? "B Supply"
                          : name === "demandB"
                            ? "B Demand"
                            : name === "netB"
                              ? "B Net"
                              : String(name),
                ]}
              />
              <ReferenceLine y={0} stroke="#EAE3D3" strokeWidth={1} />
              {aiPresetActive && (
                <ReferenceLine
                  x="2028"
                  stroke="#B08A44"
                  strokeDasharray="3 3"
                  strokeOpacity={0.5}
                  label={{
                    value: "AUTOMATION INFLECTION",
                    position: "insideTopLeft",
                    fontSize: 9,
                    fill: "#B08A44",
                    fontWeight: 600,
                  }}
                />
              )}
              <Bar dataKey="supplyA" fill="#EAE3D3" radius={[6, 6, 0, 0]} maxBarSize={40} animationDuration={600} />
              <Bar dataKey="demandA" fill="#B08A44" radius={[6, 6, 0, 0]} maxBarSize={40} animationDuration={600} />
              <Line type="monotone" dataKey="netA" stroke="#56618C" strokeWidth={2} dot={false} animationDuration={800} />
              {compareMode && resultB && (
                <>
                  <Bar dataKey="supplyB" fill="#F7F3EA" radius={[6, 6, 0, 0]} maxBarSize={40} opacity={0.6} />
                  <Bar dataKey="demandB" fill="#C8A45F" radius={[6, 6, 0, 0]} maxBarSize={40} opacity={0.6} />
                  <Line type="monotone" dataKey="netB" stroke="#56618C" strokeWidth={1.5} dot={false} />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      <motion.div
        key={`${chartData.length}-${lastPoint.supply}-${result.projectedGap}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-4 grid gap-3 border-t pt-4"
        style={{ borderColor: "var(--border)", gridTemplateColumns: "repeat(5, 1fr)" }}
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col gap-0.5 rounded-lg transition-colors"
            style={stat.clickable ? { cursor: "pointer" } : {}}
            onClick={stat.clickable ? () => setShowCostBreakdown((value) => !value) : undefined}
          >
            <p className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              {stat.label}
            </p>
            <p className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
              {stat.value}
            </p>
            {"change" in stat && stat.change && (
              <p
                className="flex items-center gap-0.5 text-[11px] font-medium"
                style={{ color: stat.down ? "var(--risk-critical)" : "var(--risk-growing)" }}
              >
                {stat.down ? <TrendingDown size={10} /> : <TrendingUp size={10} />}
                {stat.change}
              </p>
            )}
            {"highlight" in stat && stat.highlight && stat.sub ? (
              <p className="flex items-center gap-0.5 text-[11px] font-medium" style={{ color: "var(--slider-budget)" }}>
                <Clock size={10} />
                {stat.sub}
              </p>
            ) : (
              "sub" in stat &&
              stat.sub &&
              !("highlight" in stat && stat.highlight) && (
                <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                  {stat.sub}
                </p>
              )
            )}
          </div>
        ))}
      </motion.div>

      <AnimatePresence>
        {showCostBreakdown && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 rounded-xl border p-4" style={{ background: "var(--bg-pink-soft)", borderColor: "var(--pink-border)" }}>
              <p className="mb-3 text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                Cost of Inaction: where the number comes from
              </p>
              {result.costBreakdown.map((item) => (
                <div key={item.label} className="border-b py-1.5 last:border-0" style={{ borderColor: "var(--pink-border)" }}>
                  <div className="flex justify-between gap-4">
                    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      {item.label}
                    </span>
                    <span className="text-xs font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>
                      RM {(item.value / 1e6).toFixed(1)}M
                    </span>
                  </div>
                  <p className="mt-1 text-[10px]" style={{ color: "var(--text-muted)" }}>
                    {item.detail}
                  </p>
                </div>
              ))}
              <div className="mt-1 flex justify-between pt-3">
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  vs. Upskill + Hire plan cost
                </span>
                <span className="text-xs font-semibold tabular-nums" style={{ color: "var(--teal)" }}>
                  RM {(result.planCost / 1e6).toFixed(1)}M
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between border-t pt-2" style={{ borderColor: "var(--pink-border)" }}>
                <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                  Potential savings
                </span>
                <span className="text-sm font-bold tabular-nums" style={{ color: "var(--risk-growing)" }}>
                  RM {Math.max(0, (result.costOfInaction - result.planCost) / 1e6).toFixed(1)}M
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {compareMode && resultB && (
        <div className="mt-3 grid grid-cols-2 gap-3 border-t pt-3" style={{ borderColor: "var(--border)" }}>
          <div className="rounded-xl border-2 p-3" style={{ borderColor: "var(--pink)", background: "var(--bg-pink-soft)" }}>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--pink)" }}>
              Scenario A
            </p>
            <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
              Gap: {result.projectedGap > 0 ? "-" : "+"}
              {Math.abs(result.projectedGap).toLocaleString()} roles
            </p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Resilience: {result.resilienceScore.toFixed(1)} / 100
            </p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Cost of inaction: RM {(result.costOfInaction / 1e6).toFixed(1)}M
            </p>
          </div>
          <div className="rounded-xl border-2 p-3" style={{ borderColor: "#56618C", background: "var(--bg-purple-soft)" }}>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wide" style={{ color: "#56618C" }}>
              Scenario B
            </p>
            <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
              Gap: {resultB.projectedGap > 0 ? "-" : "+"}
              {Math.abs(resultB.projectedGap).toLocaleString()} roles
            </p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Resilience: {resultB.resilienceScore.toFixed(1)} / 100
            </p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Cost of inaction: RM {(resultB.costOfInaction / 1e6).toFixed(1)}M
            </p>
          </div>
        </div>
      )}

      {showTalentPools && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E2A44]/45 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-[0_24px_80px_rgba(26,16,51,0.28)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--pink)" }}>
                  Internal talent pool
                </p>
                <h3 className="mt-1 text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  Candidates to offset priority gaps
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTalentPools(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg hover:bg-[#F7F3EA]"
                aria-label="Close internal talent pool preview"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-5 grid gap-3">
              {result.talentPools.map((pool) => (
                <div key={pool.id} className="rounded-xl border p-4" style={{ borderColor: "var(--border)", background: "var(--bg-page)" }}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-bold" style={{ color: "var(--text-primary)" }}>
                        {pool.sourceRole} to {pool.targetRole}
                      </p>
                      <p className="mt-1 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                        {pool.department} / {pool.program}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold" style={{ color: "var(--teal)" }}>
                      {pool.readinessScore}% readiness
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
                    {pool.employeesReadyNow} ready now, {pool.employeesTrainable} trainable in {pool.timeToProductive}. Cost: {pool.estimatedCost}.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
