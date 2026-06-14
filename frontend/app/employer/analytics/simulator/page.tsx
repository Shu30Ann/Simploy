"use client";

import { useState } from "react";
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

export default function SimulatorPage() {
  const [simState, setSimState]   = useState<SimState>(DEFAULT_STATE);
  const [result, setResult]       = useState<SimResult>(DEFAULT_RESULT);
  const [isRunning, setIsRunning] = useState(false);
  const [hasSimulated, setHasSimulated] = useState(false);

  // Compare mode
  const [compareMode, setCompareMode] = useState(false);
  const [stateB, setStateB]     = useState<SimState>(DEFAULT_STATE_B);
  const [resultB, setResultB]   = useState<SimResult>(() => runMockSimulation(DEFAULT_STATE_B));

  const handleRunSimulation = async () => {
    setIsRunning(true);
    await new Promise(res => setTimeout(res, 1500));
    const r = runMockSimulation(simState);
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
