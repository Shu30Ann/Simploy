"use client";

import { useState } from "react";
import { getAuthToken, postJson } from "@/lib/api";
import { DEFAULT_STATE, DEFAULT_RESULT, runMockSimulation } from "@/lib/simulator/mockCompute";
import type { SimState, SimResult } from "@/lib/simulator/types";
import SimulatorSidebar        from "@/components/simulator/SimulatorSidebar";
import SimulatorHeader         from "@/components/simulator/SimulatorHeader";
import DepartmentPieChart      from "@/components/simulator/DepartmentPieChart";
import SupplyDemandChart       from "@/components/simulator/SupplyDemandChart";
import RoleGapTable            from "@/components/simulator/RoleGapTable";
import GapTimeline             from "@/components/simulator/GapTimeline";
import StrategyPanel           from "@/components/simulator/StrategyPanel";
import DemographicContextPanel from "@/components/simulator/DemographicContextPanel";
import ActionEngine            from "@/components/simulator/ActionEngine";

const DEFAULT_STATE_B: SimState = {
  ...DEFAULT_STATE,
  attritionRate: 25,
  aiLevel: 3,
};

interface SimulationRecord {
  id: number;
  result: SimResult;
}

export default function SimulatorPage() {
  const [simState, setSimState]   = useState<SimState>(DEFAULT_STATE);
  const [result, setResult]       = useState<SimResult>(DEFAULT_RESULT);
  const [isRunning, setIsRunning] = useState(false);
  const [hasSimulated, setHasSimulated] = useState(false);
  const [lastSavedSimulationId, setLastSavedSimulationId] = useState<number | null>(null);

  // Compare mode
  const [compareMode, setCompareMode] = useState(false);
  const [stateB, setStateB]     = useState<SimState>(DEFAULT_STATE_B);
  const [resultB, setResultB]   = useState<SimResult>(() => runMockSimulation(DEFAULT_STATE_B));

  const handleRunSimulation = async () => {
    setIsRunning(true);
    let r: SimResult;
    try {
      const payload = {
        name: `Workforce scenario ${new Date().toLocaleDateString()}`,
        input: simState,
      };
      if (getAuthToken()) {
        const saved = await postJson<SimulationRecord, typeof payload>("/simulations", payload, { auth: true });
        r = saved.result;
        setLastSavedSimulationId(saved.id);
      } else {
        r = await postJson<SimResult, typeof payload>("/simulations/preview", payload);
        setLastSavedSimulationId(null);
      }
    } catch {
      await new Promise(res => setTimeout(res, 700));
      r = runMockSimulation(simState);
      setLastSavedSimulationId(null);
    }
    setResult(r);
    setHasSimulated(true);
    if (compareMode) setResultB(runMockSimulation(stateB));
    setIsRunning(false);
  };

  const handleTimeframeChange = (t: SimState["timeframe"]) => {
    const next = { ...simState, timeframe: t };
    setSimState(next);
    const r = runMockSimulation(next);
    setResult(r);
    if (compareMode) {
      const nextB = { ...stateB, timeframe: t };
      setStateB(nextB);
      setResultB(runMockSimulation(nextB));
    }
  };

  const handleToggleCompare = () => {
    const entering = !compareMode;
    setCompareMode(entering);
    if (entering) setResultB(runMockSimulation(stateB));
  };

  return (
    <div className="flex h-full overflow-hidden" style={{ background: "var(--sim-sidebar-bg)" }}>
      <SimulatorSidebar
        state={simState}
        setState={setSimState}
        isRunning={isRunning}
        onRun={handleRunSimulation}
        compareMode={compareMode}
        stateB={stateB}
        setStateB={setStateB}
      />

      <div className="flex flex-1 overflow-auto gap-5 p-5 pt-4">
        {/* Center column */}
        <div className="flex flex-col flex-1 gap-4 min-w-0">
          <SimulatorHeader
            result={result}
            timeframe={simState.timeframe}
            onTimeframeChange={handleTimeframeChange}
            compareMode={compareMode}
            onToggleCompare={handleToggleCompare}
          />
          {lastSavedSimulationId && (
            <div className="rounded-lg border border-[#BAF3FF] bg-[#E0F9FF] px-4 py-3 text-sm font-bold text-[#087C7E]">
              Saved simulation #{lastSavedSimulationId} to the database.
            </div>
          )}
          <DepartmentPieChart hasSimulated={hasSimulated} />
          <SupplyDemandChart
            result={result}
            aiPresetActive={simState.presets.aiAutomation}
            timeframe={simState.timeframe}
            compareMode={compareMode}
            resultB={compareMode ? resultB : undefined}
          />
          {hasSimulated && <RoleGapTable roleGaps={result.roleGaps} />}
          {hasSimulated && <GapTimeline />}
          <StrategyPanel />
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4 flex-shrink-0" style={{ width: "var(--sim-right-w)" }}>
          <DemographicContextPanel />
          <ActionEngine result={result} />
        </div>
      </div>
    </div>
  );
}
