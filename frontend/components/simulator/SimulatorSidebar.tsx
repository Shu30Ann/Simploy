"use client";

import { Check, Loader2, Play } from "lucide-react";
import { motion } from "framer-motion";
import type { SimState } from "@/lib/simulator/types";
import ScenarioSlider from "./ScenarioSlider";

const AI_OPTIONS = ["Low", "Medium", "High", "Aggressive"];

const PRESETS = [
  { key: "attritionSpike"  as const, label: "Attrition Spike" },
  { key: "aiAutomation"    as const, label: "AI Automation"   },
  { key: "hiringFreeze"    as const, label: "Hiring Freeze"   },
  { key: "massRetirement"  as const, label: "Mass Retirement" },
];

const ATTRITION_SPLIT = [
  { label: "Voluntary resignation",      pct: 8, color: "#E8197A", note: "Retention programs can reduce"  },
  { label: "Retirement-eligible",        pct: 3, color: "#A855F7", note: "Succession planning needed"      },
  { label: "Performance / involuntary",  pct: 2, color: "#06B6D4", note: "Manageable"                     },
];

interface Props {
  state: SimState;
  setState: (s: SimState) => void;
  isRunning: boolean;
  onRun: () => void;
  compareMode?: boolean;
  stateB?: SimState;
  setStateB?: (s: SimState) => void;
}

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] font-semibold tracking-widest uppercase mb-3"
    style={{ color: "var(--text-muted)" }}>
    {children}
  </p>
);

function SliderSet({
  state, setState, showAttritionSplit = false, condensed = false,
}: {
  state: SimState;
  setState: (s: SimState) => void;
  showAttritionSplit?: boolean;
  condensed?: boolean;
}) {
  const set = <K extends keyof SimState>(key: K, val: SimState[K]) =>
    setState({ ...state, [key]: val });

  return (
    <div className="flex flex-col gap-5">
      {/* ── Simulation Variables ── */}
      <div className="flex flex-col gap-2">
        <ScenarioSlider
          label={condensed ? "Attrition" : "Attrition Rate"}
          min={0} max={40} step={1}
          value={state.attritionRate}
          onChange={v => set("attritionRate", v)}
          color="var(--slider-attrition)"
          formatValue={v => `${v}%`}
          benchmark={condensed ? undefined : { value: 11.2, label: "Industry avg", format: v => `${v}%` }}
        />
        {showAttritionSplit && state.attritionRate > 0 && (
          <div className="rounded-lg p-2.5 border -mt-1"
            style={{ background: "var(--bg-pink-soft)", borderColor: "var(--pink-border)" }}>
            <p className="text-[10px] font-semibold uppercase tracking-wide mb-2"
              style={{ color: "var(--text-muted)" }}>Attrition Breakdown</p>
            {ATTRITION_SPLIT.map(item => (
              <div key={item.label} className="mb-1.5 last:mb-0">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                    <span className="text-[10px]" style={{ color: "var(--text-secondary)" }}>{item.label}</span>
                  </div>
                  <span className="text-[10px] font-semibold" style={{ color: item.color }}>{item.pct}%</span>
                </div>
                <p className="text-[9px] pl-3" style={{ color: "var(--text-muted)" }}>{item.note}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <ScenarioSlider
        label={condensed ? "AI Level" : "AI Automation"}
        min={0} max={3} step={1}
        value={state.aiLevel}
        onChange={v => set("aiLevel", v)}
        color="var(--slider-ai)"
        formatValue={v => AI_OPTIONS[v]}
        benchmark={condensed ? undefined : { value: 1, label: "Industry avg", format: v => ["Low", "Med", "High", "Agg"][v] }}
      />

      <ScenarioSlider
        label={condensed ? "Budget" : "Hiring Budget"}
        min={-5} max={5} step={0.5}
        value={state.hiringBudget}
        onChange={v => set("hiringBudget", v)}
        color="var(--slider-budget)"
        formatValue={v => `${v >= 0 ? "+" : ""}$${v}M`}
        benchmark={condensed ? undefined : { value: 0, label: "Industry avg", format: v => `${v > 0 ? "+" : ""}$${v}M` }}
      />

      <ScenarioSlider
        label={condensed ? "Growth" : "Growth Target"}
        min={0} max={20} step={1}
        value={state.growthTarget}
        onChange={v => set("growthTarget", v)}
        color="var(--slider-growth)"
        formatValue={v => `${v}%`}
        benchmark={condensed ? undefined : { value: 5.5, label: "Industry avg", format: v => `${v}%` }}
      />

      {/* ── Demographic Levers ── */}
      {!condensed && (
        <>
          <p className="text-[10px] font-semibold tracking-widest uppercase mt-1"
            style={{ color: "var(--text-muted)" }}>
            Demographic Levers
          </p>
          <ScenarioSlider
            label="Retirement Extension"
            min={0} max={10} step={1}
            value={state.retirementExtension}
            onChange={v => set("retirementExtension", v)}
            color="#A855F7"
            formatValue={v => `+${v} yrs`}
            benchmark={{ value: 1.5, label: "Regional avg", format: v => `+${v} yrs` }}
          />
          <ScenarioSlider
            label="Migration Impact"
            min={-5} max={20} step={1}
            value={state.migrationImpact}
            onChange={v => set("migrationImpact", v)}
            color="var(--teal)"
            formatValue={v => `${v >= 0 ? "+" : ""}${v}% Inflow`}
            benchmark={{ value: 8, label: "Regional avg", format: v => `+${v}%` }}
          />
        </>
      )}
    </div>
  );
}

export default function SimulatorSidebar({ state, setState, isRunning, onRun, compareMode, stateB, setStateB }: Props) {
  const togglePreset = (key: keyof SimState["presets"]) =>
    setState({ ...state, presets: { ...state.presets, [key]: !state.presets[key] } });

  return (
    <div
      className="relative flex-shrink-0 h-full flex flex-col px-4 py-6 overflow-y-auto border-r transition-all"
      style={{
        width: compareMode ? 420 : "var(--sim-sidebar-w)",
        background: "white",
        borderColor: "var(--border)",
      }}
    >
      {/* Loading bar */}
      {isRunning && (
        <div className="absolute top-0 left-0 right-0 h-0.5 overflow-hidden"
          style={{ background: "var(--pink-light)" }}>
          <motion.div
            className="h-full"
            style={{ background: "var(--pink)" }}
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      )}

      {compareMode && stateB && setStateB ? (
        /* Compare mode — two columns */
        <>
          <div className="grid grid-cols-2 gap-3 flex-1">
            <div>
              <div className="flex items-center gap-1.5 mb-4">
                <div className="w-2 h-2 rounded-full" style={{ background: "var(--pink)" }} />
                <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--pink)" }}>Scenario A</span>
              </div>
              <SliderSet state={state} setState={setState} condensed />
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-4">
                <div className="w-2 h-2 rounded-full" style={{ background: "#7F77DD" }} />
                <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "#7F77DD" }}>Scenario B</span>
              </div>
              <SliderSet state={stateB} setState={setStateB} condensed />
            </div>
          </div>
        </>
      ) : (
        /* Normal mode */
        <>
          <SectionLabel>Simulation Variables</SectionLabel>
          <SliderSet state={state} setState={setState} showAttritionSplit />

          {/* Presets */}
          <div className="mt-6">
            <SectionLabel>Scenario Presets</SectionLabel>
            <div className="flex flex-col gap-3">
              {PRESETS.map(({ key, label }) => {
                const checked = state.presets[key];
                return (
                  <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                    <div
                      className="w-4 h-4 rounded flex items-center justify-center transition-all flex-shrink-0"
                      style={{
                        background: checked ? "var(--pink)" : "white",
                        border: `1px solid ${checked ? "var(--pink)" : "#D3D1C7"}`,
                      }}
                      onClick={() => togglePreset(key)}
                    >
                      {checked && <Check size={10} color="white" strokeWidth={3} />}
                    </div>
                    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Run button */}
      <div className="mt-auto pt-6">
        <button
          onClick={onRun}
          disabled={isRunning}
          className="w-full text-white font-medium py-3 rounded-full text-sm transition-all
            disabled:opacity-70 flex items-center justify-center gap-2"
          style={{ background: "var(--pink)" }}
        >
          {isRunning ? (
            <><Loader2 size={14} className="animate-spin" /> Simulating...</>
          ) : (
            <><Play size={14} fill="white" /> Run Simulation</>
          )}
        </button>
      </div>
    </div>
  );
}
