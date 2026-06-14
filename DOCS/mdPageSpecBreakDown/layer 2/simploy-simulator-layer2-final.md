# Simploy — Layer 2 Simulator: Full Changes & Additions Spec
> This file covers all changes and new additions to the existing simulator build.
> Build on top of `simploy-simulator-spec.md`. Do not rebuild from scratch.
> Apply changes in the order listed — sidebar first, header second, then new components.

---

## 1. Updated Page Layout

The center column order changes. New order top to bottom:

```
CENTER COLUMN                         RIGHT COLUMN
─────────────────────────────────     ─────────────────────────
1. SimulatorHeader (modified)         1. DemographicContextPanel (NEW)
2. DepartmentPieChart (NEW ← first)   2. ActionEngine (existing, trimmed)
3. SupplyDemandChart (modified)
4. RoleGapTable (NEW)
5. GapTimeline (NEW)
6. StrategyPanel (existing)
```

**Right column change**: Remove `DepartmentRiskPanel` entirely. The interactive pie chart now covers department data in more depth. Replace it with `DemographicContextPanel` at the top of the right column.

---

## 2. Sidebar Changes — `SimulatorSidebar.tsx`

### 2.1 Add Two New Sliders

Keep all 4 existing sliders. Add 2 new ones below them under a new sub-label `DEMOGRAPHIC LEVERS`:

```tsx
// Existing sliders stay under "SIMULATION VARIABLES"
// New sliders go under this new label:
<p className="text-[10px] font-semibold tracking-widest uppercase text-[--text-muted] mt-6 mb-4">
  DEMOGRAPHIC LEVERS
</p>
```

**New Slider 5 — Retirement Extension**
```
label:         "Retirement Extension"
min:           0
max:           10
step:          1
defaultValue:  3
unit:          " yrs"
prefix:        "+"
color:         #A855F7   (purple)
valueLabel:    "+3 yrs"
tooltip:       "Extra years employees work beyond standard retirement age"
```

**New Slider 6 — Migration Impact**
```
label:         "Migration Impact"
min:           -5
max:           20
step:          1
defaultValue:  12
unit:          "%"
prefix:        "+"
color:         #06B6D4   (teal)
valueLabel:    "+12% Inflow"
tooltip:       "% of talent gaps filled via international hiring"
```

Both sliders use the existing `<ScenarioSlider />` component. Pass the new `color` and `benchmark` props.

---

### 2.2 Industry Benchmarks on All Sliders

Add a `benchmark` prop to every slider. Renders a comparison line below each slider track.

```tsx
// Attrition Rate
benchmark={{ value: 11.2, label: "Industry avg", format: v => `${v}%` }}

// AI Automation
benchmark={{ value: 1, label: "Industry avg", format: v => ["Low","Med","High","Aggressive"][v] }}

// Hiring Budget
benchmark={{ value: 0, label: "Industry avg", format: v => `${v >= 0 ? "+" : ""}$${v}M` }}

// Growth Target
benchmark={{ value: 5.5, label: "Industry avg", format: v => `${v}%` }}

// Retirement Extension
benchmark={{ value: 1.5, label: "Regional avg", format: v => `+${v} yrs` }}

// Migration Impact
benchmark={{ value: 8, label: "Regional avg", format: v => `+${v}%` }}
```

Render below each slider track inside `ScenarioSlider.tsx`:

```tsx
{benchmark && (
  <div className="flex items-center justify-between mt-1.5">
    <span className="text-[10px] text-[--text-muted]">
      {benchmark.label}: {benchmark.format(benchmark.value)}
    </span>
    <span className={`text-[10px] font-semibold ${
      value > benchmark.value
        ? "text-[--risk-critical]"
        : "text-[--risk-growing]"
    }`}>
      {value > benchmark.value ? "▲" : "▼"} {Math.abs(value - benchmark.value).toFixed(1)} vs avg
    </span>
  </div>
)}
```

---

### 2.3 Attrition Split Breakdown

Add directly below the Attrition Rate slider. Static mock data — always visible when `attritionRate > 0`.

```tsx
<div className="bg-[--bg-pink-soft] rounded-lg p-2.5 border border-[--pink-border] -mt-2">
  <p className="text-[10px] font-semibold text-[--text-muted] uppercase tracking-wide mb-2">
    Attrition Breakdown
  </p>
  {[
    { label: "Voluntary resignation",    pct: 8, color: "#E8197A", note: "Retention programs can reduce"   },
    { label: "Retirement-eligible",      pct: 3, color: "#A855F7", note: "Succession planning needed"       },
    { label: "Performance / involuntary",pct: 2, color: "#06B6D4", note: "Manageable"                      },
  ].map(item => (
    <div key={item.label} className="mb-1.5 last:mb-0">
      <div className="flex items-center justify-between mb-0.5">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
          <span className="text-[10px] text-[--text-secondary]">{item.label}</span>
        </div>
        <span className="text-[10px] font-semibold" style={{ color: item.color }}>{item.pct}%</span>
      </div>
      <p className="text-[9px] text-[--text-muted] pl-3">{item.note}</p>
    </div>
  ))}
</div>
```

---

## 3. Header Changes — `SimulatorHeader.tsx`

### 3.1 Extend Timeframe Selector

Modify `TimeframeSelector.tsx`. Change the options array from:
```ts
// OLD
const TIMEFRAMES = ["CURRENT", "1Y", "3Y", "5Y", "10Y"];
```
to:
```ts
// NEW
const TIMEFRAMES = ["CURRENT", "1Y", "3Y", "5Y", "10Y", "20Y", "30Y"];
```

No other changes to the component. The wider array means the pill group will be slightly wider — ensure the header row still fits on one line at 1280px+. If it wraps, reduce tab `px-3` to `px-2.5`.

---

### 3.2 Scenario Compare Mode Toggle

Add a toggle button to the right of the timeframe selector in `SimulatorHeader.tsx`.

```tsx
// Props addition:
interface SimulatorHeaderProps {
  // ... existing props
  compareMode:    boolean;
  onToggleCompare: () => void;
}
```

Button:
```tsx
<button
  onClick={onToggleCompare}
  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
    border transition-all whitespace-nowrap ${
    compareMode
      ? "bg-[--pink] text-white border-[--pink]"
      : "bg-white text-[--text-secondary] border-[--border] hover:border-[--pink-border] hover:text-[--pink]"
  }`}
>
  <Columns2 size={13} />
  {compareMode ? "Exit Compare" : "Compare Scenarios"}
</button>
```

**When `compareMode` is true**, the sidebar splits into two columns:

```tsx
// In SimulatorSidebar.tsx
{compareMode ? (
  <div className="grid grid-cols-2 gap-2">
    {/* Scenario A */}
    <div>
      <p className="text-[10px] font-bold text-[--pink] mb-3 uppercase tracking-wide">
        Scenario A
      </p>
      {/* All sliders, condensed (label only, no benchmark text) */}
    </div>
    {/* Scenario B */}
    <div>
      <p className="text-[10px] font-bold text-[#7F77DD] mb-3 uppercase tracking-wide">
        Scenario B
      </p>
      {/* Same sliders, independent state */}
    </div>
  </div>
) : (
  // Normal single-column sidebar
)}
```

State in `page.tsx`:
```ts
const [compareMode,  setCompareMode]  = useState(false);
const [simStateA,    setSimStateA]    = useState<SimState>(DEFAULT_STATE);
const [simStateB,    setSimStateB]    = useState<SimState>({ ...DEFAULT_STATE, attritionRate: 25, aiLevel: 3 });
const [resultA,      setResultA]      = useState<SimResult>(DEFAULT_RESULT);
const [resultB,      setResultB]      = useState<SimResult>(runMockSimulation({ ...DEFAULT_STATE, attritionRate: 25, aiLevel: 3 }));
```

**Chart in compare mode** — pass both datasets to `SupplyDemandChart` and render 6 lines:

```tsx
// Scenario A lines (existing colors)
<Line dataKey="supply" stroke="#D3D3D8" strokeDasharray="6 3" data={resultA.chartData} />
<Line dataKey="demand" stroke="#E8197A"                       data={resultA.chartData} />
<Line dataKey="net"    stroke="#7F77DD"                       data={resultA.chartData} />

// Scenario B lines (lighter variants, thinner)
<Line dataKey="supply" stroke="#E8E8EC" strokeDasharray="4 4" strokeWidth={1.5} data={resultB.chartData} />
<Line dataKey="demand" stroke="#FF7BAE"                       strokeWidth={1.5} data={resultB.chartData} />
<Line dataKey="net"    stroke="#B0ACEE"                       strokeWidth={1.5} data={resultB.chartData} />
```

**Compare summary card** — add below the chart stat bar when `compareMode` is true:

```tsx
{compareMode && (
  <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-[--border]">
    <div className="p-3 rounded-xl border-2 border-[--pink] bg-[--bg-pink-soft]">
      <p className="text-[10px] font-bold text-[--pink] uppercase tracking-wide mb-1">Scenario A</p>
      <p className="text-sm font-bold text-[--text-primary]">
        Gap: {resultA.projectedGap > 0 ? "−" : "+"}{Math.abs(resultA.projectedGap).toLocaleString()} roles
      </p>
      <p className="text-xs text-[--text-secondary]">Resilience: {resultA.resilienceScore} / 100</p>
      <p className="text-xs text-[--text-secondary]">
        Cost of inaction: ${(resultA.costOfInaction / 1e6).toFixed(1)}M
      </p>
    </div>
    <div className="p-3 rounded-xl border-2 border-[#7F77DD] bg-[--bg-purple-soft]">
      <p className="text-[10px] font-bold text-[#7F77DD] uppercase tracking-wide mb-1">Scenario B</p>
      <p className="text-sm font-bold text-[--text-primary]">
        Gap: {resultB.projectedGap > 0 ? "−" : "+"}{Math.abs(resultB.projectedGap).toLocaleString()} roles
      </p>
      <p className="text-xs text-[--text-secondary]">Resilience: {resultB.resilienceScore} / 100</p>
      <p className="text-xs text-[--text-secondary]">
        Cost of inaction: ${(resultB.costOfInaction / 1e6).toFixed(1)}M
      </p>
    </div>
  </div>
)}
```

---

## 4. New Component: DepartmentPieChart — `components/simulator/DepartmentPieChart.tsx`

**"use client"**

This is the most significant new addition. It goes **first** in the center column — before the supply/demand chart — so HR can understand the current department breakdown before running any simulation.

**It has two states:**
- **Pre-simulation**: clicking a slice shows known facts only (real data from the database)
- **Post-simulation**: clicking a slice shows known facts + simulated outlook for that department

---

### 4.1 Mock Data

```ts
interface DeptData {
  id:         string;
  label:      string;
  headcount:  number;
  color:      string;
  // Known facts (always shown)
  avgAge:             number;
  retirementsThisYear: number;
  pendingResignations: number;
  openRoles:           number;
  attritionRate:       number;   // trailing 12 months, %
  avgTenure:           number;   // years
  withinTenYrsRetirement: number; // headcount
  inUpskilling:        number;
  flightRiskCount:     number;   // no promotion 3+ yrs
  topSkills:           string[];
  // Simulated outlook (shown after Run Simulation)
  projectedHeadcount:  number;
  projectedGap:        number;
  projectedRetirements: number;
  internalCandidates:  number;
  timeToCloseGap:      string;
  deptCostOfInaction:  string;
  recommendedAction:   "Hire" | "Upskill" | "Redeploy" | "Automate";
}

export const DEPT_DATA: DeptData[] = [
  {
    id: "eng", label: "Engineering", headcount: 420, color: "#E8197A",
    avgAge: 34, retirementsThisYear: 2, pendingResignations: 1,
    openRoles: 14, attritionRate: 18, avgTenure: 3.2,
    withinTenYrsRetirement: 38, inUpskilling: 12, flightRiskCount: 22,
    topSkills: ["React", "Python", "Kubernetes"],
    projectedHeadcount: 280, projectedGap: -220, projectedRetirements: 34,
    internalCandidates: 8, timeToCloseGap: "3.5 yrs at current velocity",
    deptCostOfInaction: "$89.4M", recommendedAction: "Hire",
  },
  {
    id: "sls", label: "Sales", headcount: 264, color: "#7F77DD",
    avgAge: 31, retirementsThisYear: 0, pendingResignations: 3,
    openRoles: 8, attritionRate: 22, avgTenure: 2.1,
    withinTenYrsRetirement: 12, inUpskilling: 5, flightRiskCount: 31,
    topSkills: ["CRM", "Negotiation", "SaaS Sales"],
    projectedHeadcount: 198, projectedGap: -95, projectedRetirements: 10,
    internalCandidates: 14, timeToCloseGap: "1.8 yrs at current velocity",
    deptCostOfInaction: "$34.2M", recommendedAction: "Upskill",
  },
  {
    id: "ops", label: "Operations", headcount: 240, color: "#06B6D4",
    avgAge: 38, retirementsThisYear: 4, pendingResignations: 1,
    openRoles: 5, attritionRate: 10, avgTenure: 5.8,
    withinTenYrsRetirement: 64, inUpskilling: 3, flightRiskCount: 18,
    topSkills: ["Logistics", "Process Design", "ERP"],
    projectedHeadcount: 190, projectedGap: -70, projectedRetirements: 58,
    internalCandidates: 22, timeToCloseGap: "2.2 yrs at current velocity",
    deptCostOfInaction: "$22.8M", recommendedAction: "Redeploy",
  },
  {
    id: "fin", label: "Finance", headcount: 156, color: "#F59E0B",
    avgAge: 41, retirementsThisYear: 3, pendingResignations: 0,
    openRoles: 3, attritionRate: 8, avgTenure: 7.4,
    withinTenYrsRetirement: 52, inUpskilling: 8, flightRiskCount: 9,
    topSkills: ["Financial Modeling", "SQL", "FP&A"],
    projectedHeadcount: 120, projectedGap: -53, projectedRetirements: 48,
    internalCandidates: 5, timeToCloseGap: "4.1 yrs at current velocity",
    deptCostOfInaction: "$14.6M", recommendedAction: "Automate",
  },
  {
    id: "hr", label: "HR", headcount: 120, color: "#10B981",
    avgAge: 35, retirementsThisYear: 1, pendingResignations: 1,
    openRoles: 2, attritionRate: 13, avgTenure: 4.1,
    withinTenYrsRetirement: 18, inUpskilling: 6, flightRiskCount: 7,
    topSkills: ["HRIS", "Talent Acquisition", "L&D"],
    projectedHeadcount: 100, projectedGap: -35, projectedRetirements: 16,
    internalCandidates: 4, timeToCloseGap: "1.5 yrs at current velocity",
    deptCostOfInaction: "$8.2M", recommendedAction: "Upskill",
  },
];

const TOTAL_HEADCOUNT = DEPT_DATA.reduce((s, d) => s + d.headcount, 0);
```

---

### 4.2 Component Structure

```tsx
export default function DepartmentPieChart({
  hasSimulated = false,
}: {
  hasSimulated?: boolean;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeDept = DEPT_DATA.find(d => d.id === activeId) ?? null;

  // Pie data — slice sizes change post-simulation (projected headcount)
  const pieData = DEPT_DATA.map(d => ({
    ...d,
    value: hasSimulated ? Math.max(d.projectedHeadcount, 50) : d.headcount,
  }));

  return (
    <div className="bg-white rounded-2xl border border-[--border] p-5">
      {/* Card header */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <p className="text-base font-semibold text-[--text-primary]">
            Department Breakdown
          </p>
          <p className="text-xs text-[--text-muted] mt-0.5">
            {TOTAL_HEADCOUNT.toLocaleString()} employees total ·{" "}
            {hasSimulated
              ? "Click a department to see current facts and simulation outlook"
              : "Click a department to see current facts — run simulation to unlock outlook"
            }
          </p>
        </div>
        {hasSimulated && (
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full
            bg-[--bg-purple-soft] text-[#7F77DD] border border-[--purple-border]">
            Showing projected sizes
          </span>
        )}
      </div>

      {/* 2-column layout: chart left, popup right */}
      <div className="grid grid-cols-2 gap-6 mt-4 items-start">

        {/* Left — Pie chart */}
        <div className="flex flex-col items-center">
          <div className="h-[240px] w-full">
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
                  onClick={(data) => setActiveId(
                    activeId === data.id ? null : data.id
                  )}
                  activeIndex={DEPT_DATA.findIndex(d => d.id === activeId)}
                  activeShape={renderActiveShape}
                  animationBegin={0}
                  animationDuration={600}
                >
                  {pieData.map(entry => (
                    <Cell
                      key={entry.id}
                      fill={entry.color}
                      opacity={activeId && activeId !== entry.id ? 0.35 : 1}
                      className="cursor-pointer transition-opacity duration-200"
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend below chart */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-2">
            {DEPT_DATA.map(d => (
              <button
                key={d.id}
                onClick={() => setActiveId(activeId === d.id ? null : d.id)}
                className="flex items-center gap-1.5 text-xs text-[--text-secondary]
                  hover:text-[--text-primary] transition-colors"
              >
                <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                {d.label}
                <span className="text-[--text-muted]">
                  {Math.round((d.headcount / TOTAL_HEADCOUNT) * 100)}%
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right — Popup panel */}
        <div className="min-h-[240px]">
          {!activeDept ? (
            // Empty state
            <div className="h-full flex flex-col items-center justify-center
              text-center border-2 border-dashed border-[--border] rounded-xl p-6">
              <div className="w-10 h-10 rounded-full bg-[--bg-page] flex items-center
                justify-center mb-3">
                <MousePointer2 size={18} className="text-[--text-muted]" />
              </div>
              <p className="text-sm font-medium text-[--text-secondary]">
                Click a department slice
              </p>
              <p className="text-xs text-[--text-muted] mt-1">
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
```

---

### 4.3 Active Shape (lifted slice effect)

```tsx
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx} cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}   // lifts slice outward
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};
```

---

### 4.4 DeptPopup Sub-component

```tsx
function DeptPopup({
  dept,
  hasSimulated,
}: {
  dept: DeptData;
  hasSimulated: boolean;
}) {
  const pct = Math.round((dept.headcount / TOTAL_HEADCOUNT) * 100);

  return (
    <motion.div
      key={dept.id}
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="rounded-xl border-2 overflow-hidden h-full"
      style={{ borderColor: dept.color + "40" }}
    >
      {/* Dept header strip */}
      <div className="px-4 py-3 flex items-center gap-3"
        style={{ background: dept.color + "15" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
          style={{ background: dept.color }}>
          {dept.id.toUpperCase().slice(0, 3)}
        </div>
        <div>
          <p className="text-sm font-bold text-[--text-primary]">{dept.label}</p>
          <p className="text-xs text-[--text-muted]">
            {dept.headcount.toLocaleString()} employees · {pct}% of company
          </p>
        </div>
      </div>

      <div className="px-4 py-3 overflow-y-auto max-h-[280px]">

        {/* ── KNOWN FACTS ── */}
        <p className="text-[10px] font-bold uppercase tracking-widest text-[--text-muted] mb-2">
          Known Today
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
          {[
            { label: "Avg age",               value: `${dept.avgAge} yrs`              },
            { label: "Avg tenure",             value: `${dept.avgTenure} yrs`           },
            { label: "Retirements this yr",    value: dept.retirementsThisYear,
              alert: dept.retirementsThisYear > 2                                        },
            { label: "Pending resignations",   value: dept.pendingResignations,
              alert: dept.pendingResignations > 1                                        },
            { label: "Open roles",             value: dept.openRoles                    },
            { label: "Attrition rate",         value: `${dept.attritionRate}%`,
              alert: dept.attritionRate > 15                                             },
            { label: "Retire-eligible (10yr)", value: dept.withinTenYrsRetirement,
              alert: dept.withinTenYrsRetirement > 30                                    },
            { label: "In upskilling",          value: dept.inUpskilling                 },
            { label: "Flight risk",            value: dept.flightRiskCount,
              alert: dept.flightRiskCount > 15                                           },
          ].map(item => (
            <div key={item.label}>
              <p className="text-[10px] text-[--text-muted]">{item.label}</p>
              <p className={`text-sm font-semibold ${
                item.alert ? "text-[--risk-critical]" : "text-[--text-primary]"
              }`}>
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Top skills */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {dept.topSkills.map(s => (
            <span key={s} className="text-[10px] px-2 py-0.5 rounded-full
              bg-[--bg-page] border border-[--border] text-[--text-secondary]">
              {s}
            </span>
          ))}
        </div>

        {/* ── SIMULATED OUTLOOK ── */}
        {hasSimulated ? (
          <>
            <div className="border-t border-[--border] pt-3 mt-1">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2"
                style={{ color: dept.color }}>
                Simulated Outlook
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  { label: "Projected headcount", value: dept.projectedHeadcount.toLocaleString() },
                  { label: "Expected gap",
                    value: dept.projectedGap < 0
                      ? `${dept.projectedGap.toLocaleString()} roles`
                      : `+${dept.projectedGap} roles`,
                    alert: dept.projectedGap < -50 },
                  { label: "Projected retirements", value: dept.projectedRetirements, alert: dept.projectedRetirements > 30 },
                  { label: "Internal candidates",   value: dept.internalCandidates                },
                  { label: "Time to close gap",     value: dept.timeToCloseGap, wide: true        },
                  { label: "Dept. cost of inaction",value: dept.deptCostOfInaction, wide: true    },
                ].map(item => (
                  <div key={item.label} className={item.wide ? "col-span-2" : ""}>
                    <p className="text-[10px] text-[--text-muted]">{item.label}</p>
                    <p className={`text-sm font-semibold ${
                      item.alert ? "text-[--risk-critical]" : "text-[--text-primary]"
                    }`}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Recommended action chip */}
              <div className="mt-3 flex items-center gap-2">
                <p className="text-[10px] text-[--text-muted]">Recommended action:</p>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full text-white"
                  style={{ background: dept.color }}>
                  {dept.recommendedAction}
                </span>
              </div>
            </div>
          </>
        ) : (
          // Pre-simulation locked state
          <div className="border-t border-[--border] pt-3 mt-1 flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[--bg-page] border border-[--border]
              flex items-center justify-center flex-shrink-0">
              <Lock size={11} className="text-[--text-muted]" />
            </div>
            <p className="text-[11px] text-[--text-muted] leading-relaxed">
              Run the simulation to unlock the projected outlook for this department.
            </p>
          </div>
        )}

      </div>
    </motion.div>
  );
}
```

---

### 4.5 Connecting hasSimulated to page.tsx

In `page.tsx`, track whether a simulation has been run:
```ts
const [hasSimulated, setHasSimulated] = useState(false);

const handleRunSimulation = async () => {
  setIsRunning(true);
  await new Promise(res => setTimeout(res, 1500));
  const newResult = runMockSimulation(simState);
  setResult(newResult);
  setHasSimulated(true);   // ← unlock the simulated outlook in pie chart
  setIsRunning(false);
};
```

Pass to pie chart:
```tsx
<DepartmentPieChart hasSimulated={hasSimulated} />
```

---

## 5. SupplyDemandChart Modifications — `SupplyDemandChart.tsx`

### 5.1 Internal Talent Pool Banner

Add this between the legend row and the `<ResponsiveContainer>`:

```tsx
<div className="flex items-center gap-3 bg-[--bg-purple-soft] border border-[--purple-border]
  rounded-xl px-4 py-2.5 mb-3">
  <div className="w-7 h-7 rounded-lg bg-[#7F77DD] flex items-center justify-center flex-shrink-0">
    <Users size={14} color="white" />
  </div>
  <p className="text-xs text-[--text-secondary] leading-relaxed">
    <span className="font-semibold text-[--text-primary]">14 of 38 gap roles</span>
    {" "}can be filled internally · 45 current employees are eligible for upskilling.{" "}
    <button className="text-[#7F77DD] font-medium hover:underline">
      View candidates →
    </button>
  </p>
</div>
```

### 5.2 Expand Stat Bar to 5 Columns

Change `grid-cols-4` to `grid-cols-5`. Add the 5th stat:

```tsx
{
  label: "Avg Time-to-Fill",
  value: "4.2 mo",
  sub: "Start hiring by Q2 2025",
  subColor: "#F59E0B",
  icon: Clock,
}
```

Sub-text with urgency color:
```tsx
<p className="text-[11px] font-medium flex items-center gap-0.5 mt-0.5"
  style={{ color: stat.subColor ?? "var(--text-muted)" }}>
  {stat.icon && <stat.icon size={10} />}
  {stat.sub}
</p>
```

### 5.3 Cost Breakdown Expandable Panel

Make the Cost of Inaction stat card clickable:

```tsx
const [showCostBreakdown, setShowCostBreakdown] = useState(false);

// Add to the Cost of Inaction stat div:
onClick={() => setShowCostBreakdown(!showCostBreakdown)}
className="... cursor-pointer hover:bg-[--bg-pink-soft] rounded-lg px-2 -mx-2 transition-colors"
```

Below the stat bar, after the grid:

```tsx
<AnimatePresence>
  {showCostBreakdown && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-3 p-4 bg-[--bg-pink-soft] rounded-xl border border-[--pink-border] overflow-hidden"
    >
      <p className="text-xs font-semibold text-[--text-primary] mb-3">
        Cost of Inaction — Where the number comes from
      </p>
      {[
        { label: "Lost productivity (gap × avg. salary)",  value: "$89.4M"  },
        { label: "Contractor / overtime backfill",          value: "$34.2M"  },
        { label: "Emergency agency recruitment fees",       value: "$22.8M"  },
        { label: "Onboarding and ramp time cost",           value: "$14.6M"  },
      ].map(item => (
        <div key={item.label}
          className="flex justify-between py-1.5 border-b border-[--pink-border] last:border-0">
          <span className="text-xs text-[--text-secondary]">{item.label}</span>
          <span className="text-xs font-semibold text-[--text-primary] tabular-nums">
            {item.value}
          </span>
        </div>
      ))}
      <div className="flex justify-between pt-3 mt-1">
        <span className="text-xs text-[--text-secondary]">vs. Upskill + Hire plan cost</span>
        <span className="text-xs font-semibold text-[--teal] tabular-nums">$23.4M</span>
      </div>
      <div className="flex justify-between items-center mt-2 pt-2 border-t border-[--pink-border]">
        <span className="text-xs font-semibold text-[--text-primary]">Potential savings</span>
        <span className="text-sm font-bold text-[--risk-growing] tabular-nums">$137.6M</span>
      </div>
    </motion.div>
  )}
</AnimatePresence>
```

---

## 6. New Component: RoleGapTable — `components/simulator/RoleGapTable.tsx`

Place in center column between `SupplyDemandChart` and `GapTimeline`.

```tsx
const MOCK_ROLE_GAPS = [
  { role: "Sr. Software Engineer", dept: "Engineering", current: 120, projected: 340, gap: -220, marketSupply: "Critical"  },
  { role: "Data Analyst",          dept: "Engineering", current: 85,  projected: 180, gap: -95,  marketSupply: "Scarce"    },
  { role: "DevOps Engineer",       dept: "Engineering", current: 40,  projected: 110, gap: -70,  marketSupply: "Critical"  },
  { role: "Product Manager",       dept: "Sales",       current: 62,  projected: 115, gap: -53,  marketSupply: "Balanced"  },
  { role: "ML Engineer",           dept: "Engineering", current: 18,  projected: 65,  gap: -47,  marketSupply: "Critical"  },
  { role: "Sales Engineer",        dept: "Sales",       current: 55,  projected: 90,  gap: -35,  marketSupply: "Scarce"    },
];

const SUPPLY_STYLE = {
  Critical: { dot: "#E8197A", bg: "#FFF0F5" },
  Scarce:   { dot: "#F59E0B", bg: "#FFFBEB" },
  Balanced: { dot: "#06B6D4", bg: "#F0FDFF" },
  Abundant: { dot: "#10B981", bg: "#F0FDF4" },
};
```

Card: `bg-white rounded-2xl border border-[--border] p-5`

Header row: "High-Risk Roles Breakdown" title + count subtitle + Export CSV button (right-aligned, `border border-[--border] rounded-lg px-3 py-1.5 text-xs`).

Table columns: Role · Department · Current · 2030 Need · Gap · Market Supply

Gap column: always render in `text-[--risk-critical] font-semibold tabular-nums`.
Market Supply column: colored dot + label pill using `SUPPLY_STYLE`.

---

## 7. New Component: GapTimeline — `components/simulator/GapTimeline.tsx`

Place in center column between `RoleGapTable` and `StrategyPanel`.

```tsx
const TIMELINE_EVENTS = [
  { date: "Q2 2025", label: "Start hiring or gap doubles",  severity: "warning"  },
  { date: "Q3 2026", label: "Engineering goes critical",    severity: "critical" },
  { date: "Q1 2027", label: "Sales gap appears",            severity: "warning"  },
  { date: "Q4 2028", label: "Finance gap emerges",          severity: "medium"   },
  { date: "2030",    label: "Full gap realized (−11,340)",  severity: "critical" },
];

const SEV = {
  critical: { dot: "#E8197A", track: "#FFD0E8", text: "#E8197A" },
  warning:  { dot: "#F59E0B", track: "#FEE4A0", text: "#854F0B" },
  medium:   { dot: "#06B6D4", track: "#BAF3FF", text: "#0C447C" },
};
```

Card: `bg-white rounded-2xl border border-[--border] p-5`

Title: "Gap Timeline" + subtitle "When shortages hit — plan backwards from these dates"

Render as a horizontal connected dot timeline (see `simploy-simulator-changes.md` Change 5 for the full JSX).

---

## 8. New Component: DemographicContextPanel — `components/simulator/DemographicContextPanel.tsx`

Replaces `DepartmentRiskPanel` in the right column.

Card: `bg-white rounded-2xl border border-[--border] p-5`

Section label: `DEMOGRAPHIC CONTEXT`

Subtitle: `Working-age population trends for markets you operate in`

Two groups of country rows, separated by a divider:

**Declining markets** (labeled `DECLINING` in a small red pill):
```ts
[
  { code: "JP", country: "Japan",       change: "-1.3%/yr", status: "Critical"  },
  { code: "KR", country: "South Korea", change: "-0.9%/yr", status: "Critical"  },
  { code: "CN", country: "China",       change: "-0.7%/yr", status: "At Risk"   },
  { code: "SG", country: "Singapore",   change: "-0.4%/yr", status: "At Risk"   },
]
```

**Opportunity markets** (labeled `GROWING` in a small green pill):
```ts
[
  { code: "IN", country: "India",       change: "+1.1%/yr", status: "Growing"  },
  { code: "VN", country: "Vietnam",     change: "+0.8%/yr", status: "Growing"  },
  { code: "PH", country: "Philippines", change: "+1.9%/yr", status: "Growing"  },
  { code: "ID", country: "Indonesia",   change: "+1.2%/yr", status: "Growing"  },
]
```

Each row (`flex items-center gap-3 py-2 border-b border-[#F5F3EE] last:border-0`):
```tsx
<div className="w-8 h-8 rounded-full bg-[--bg-page] border border-[--border]
  flex items-center justify-center text-[10px] font-bold text-[--text-secondary]">
  {country.code}
</div>
<span className="flex-1 text-sm text-[--text-primary]">{country.country}</span>
<span className="text-sm font-semibold tabular-nums"
  style={{ color: country.status === "Growing" ? "#10B981" : "#E8197A" }}>
  {country.change}
</span>
```

Add a note at the bottom of the card:
```tsx
<p className="text-[10px] text-[--text-muted] mt-3 leading-relaxed border-t border-[--border] pt-3">
  Opportunity markets can offset declining local supply. Adjust the Migration Impact slider to model this.
</p>
```

---

## 9. Updated `page.tsx` — Final Assembly

```tsx
<div className="flex h-screen overflow-hidden bg-[#FAFAF9]">
  <SimulatorSidebar
    simState={simState}
    onStateChange={setSimState}
    isRunning={isRunning}
    onRun={handleRunSimulation}
    compareMode={compareMode}
    simStateB={simStateB}
    onStateBChange={setSimStateB}
  />
  <div className="flex flex-1 overflow-auto gap-5 p-5 pt-4">
    {/* Center column */}
    <div className="flex flex-col flex-1 gap-4 min-w-0">
      <SimulatorHeader
        score={result.resilienceScore}
        timeframe={simState.timeframe}
        onTimeframeChange={tf => setSimState(s => ({ ...s, timeframe: tf }))}
        compareMode={compareMode}
        onToggleCompare={() => setCompareMode(c => !c)}
      />
      <DepartmentPieChart hasSimulated={hasSimulated} />        {/* ← NEW, first */}
      <SupplyDemandChart
        result={result}
        resultB={compareMode ? resultB : undefined}
        compareMode={compareMode}
      />
      {hasSimulated && <RoleGapTable roles={result.roleGaps} />} {/* shows after sim */}
      {hasSimulated && <GapTimeline />}
      <StrategyPanel />
    </div>
    {/* Right column */}
    <div className="flex flex-col gap-4 w-[268px] flex-shrink-0">
      <DemographicContextPanel />                                {/* ← replaces dept risk */}
      <ActionEngine result={result} />
    </div>
  </div>
</div>
```

`RoleGapTable` and `GapTimeline` only render after `hasSimulated === true`. Before the first simulation run, the center column shows: Header → Pie Chart → Supply/Demand Chart → Strategy Panel. This keeps the pre-simulation view clean and gives HR the context they need before running anything.

---

## 10. New Lucide Icons Required

Add these imports where not already present:
```ts
import {
  Columns2, MousePointer2, Lock, Clock, Users,
  TrendingUp, TrendingDown, Download
} from "lucide-react";
```

---

## 11. Build Order

```
1. Sidebar changes (new sliders, benchmarks, attrition breakdown)
2. Header changes (20Y/30Y + compare toggle)
3. DepartmentPieChart (largest new component — build this standalone first, then wire up)
4. SupplyDemandChart modifications (overlay banner, 5th stat, cost breakdown)
5. RoleGapTable
6. GapTimeline
7. DemographicContextPanel (right panel)
8. Wire everything in page.tsx
9. Compare mode (last — depends on everything else working)
```
