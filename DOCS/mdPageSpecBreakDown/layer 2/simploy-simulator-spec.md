# Simploy — Workforce Gap Simulator Spec (Layer 2)
> Hand this file to Claude Code. Build the simulator page at `/employer/analytics/simulator`.
> Reference images: The "Workforce Resilience Planner" screenshots from Candy Career — adapt all copy and terminology for Simploy as specified below.

---

## 1. Page Context

This is the core of Layer 2. Employers adjust "what-if" simulation variables via sliders, run a computation, and see:
- A supply vs demand projection chart over time
- A department risk score breakdown
- An automatically generated action plan (Layer 3 integration)

**Route**: `/employer/analytics/simulator`
**Access**: Employer portal only. Must be inside the employer dashboard layout (with top navbar).

---

## 2. Tech Stack

Same as other pages, plus:
- **recharts** — for the supply/demand line chart (`LineChart`, `Line`, `ReferenceLine`, `ResponsiveContainer`, `Tooltip`, `XAxis`, `YAxis`)
- **framer-motion** — for loading states and result animations

---

## 3. File Structure

```
app/
  (dashboard)/
    employer/
      analytics/
        simulator/
          page.tsx                  ← Assembles the 3-column layout

components/
  simulator/
    SimulatorSidebar.tsx            ← Left panel: sliders + presets + run button
    SimulatorHeader.tsx             ← Title, timeframe tabs, resilience score
    SupplyDemandChart.tsx           ← recharts line chart (center)
    StrategyPanel.tsx               ← "Strategic Action Panel" cards (center bottom)
    DepartmentRiskPanel.tsx         ← Right panel top: risk scores by dept
    ActionEngine.tsx                ← Right panel bottom: hire/upskill/redeploy/automate
    ScenarioSlider.tsx              ← Reusable styled range slider
    TimeframeSelector.tsx           ← CURRENT / 1Y / 3Y / 5Y / 10Y tabs

lib/
  simulator/
    mockCompute.ts                  ← Mock simulation functions (no real API)
    types.ts                        ← SimState, ChartPoint, RiskScore types
```

---

## 4. Design Tokens

Same CSS variables as the landing page. Add these simulator-specific tokens to `globals.css`:

```css
:root {
  /* Simulator-specific */
  --sim-sidebar-bg:    #FAFAF9;
  --sim-sidebar-w:     220px;
  --sim-right-w:       268px;

  /* Chart line colors */
  --chart-supply:      #D3D3D8;   /* gray dashed — projected supply */
  --chart-demand:      #E8197A;   /* brand pink  — projected demand */
  --chart-net:         #7F77DD;   /* purple      — net position     */

  /* Slider track colors (per lever) */
  --slider-attrition:  #E8197A;
  --slider-ai:         #7F77DD;
  --slider-budget:     #F59E0B;
  --slider-growth:     #06B6D4;

  /* Risk score colors */
  --risk-critical:     #E8197A;
  --risk-at-risk:      #F59E0B;
  --risk-stable:       #06B6D4;
  --risk-growing:      #10B981;
}
```

---

## 5. Page Layout

Three fixed-column grid. The sidebar is sticky; center + right scroll.

```
┌──────────────────┬─────────────────────────────────────┬──────────────────┐
│ SIDEBAR          │ CENTER                               │ RIGHT            │
│ 220px · sticky   │ flex-1 · scrollable                  │ 268px · scroll   │
│                  │                                      │                  │
│ Simulation       │ SimulatorHeader (title + tabs)       │ Department Risk  │
│ Variables        │ SupplyDemandChart                    │ Profile          │
│                  │ StrategyPanel                        │                  │
│ Scenario         │                                      │ Action Engine    │
│ Presets          │                                      │                  │
│                  │                                      │                  │
│ [Run Simulation] │                                      │                  │
└──────────────────┴─────────────────────────────────────┴──────────────────┘
```

**Outer page wrapper** (`page.tsx`):
```tsx
<div className="flex h-screen overflow-hidden bg-[#FAFAF9]">
  <SimulatorSidebar ... />
  <div className="flex flex-1 overflow-auto gap-5 p-5 pt-4">
    <div className="flex flex-col flex-1 gap-4 min-w-0">
      <SimulatorHeader ... />
      <SupplyDemandChart ... />
      <StrategyPanel ... />
    </div>
    <div className="flex flex-col gap-4 w-[268px] flex-shrink-0">
      <DepartmentRiskPanel ... />
      <ActionEngine ... />
    </div>
  </div>
</div>
```

The outer employer dashboard navbar sits above this — do NOT include a navbar inside this component. This component fills the content area below the employer navbar.

---

## 6. SimulatorSidebar.tsx

**"use client"**

**Outer**: `w-[220px] flex-shrink-0 h-full bg-white border-r border-[--border] flex flex-col px-5 py-6 overflow-y-auto`

### 6.1 Section Label Style (reuse)
```tsx
<p className="text-[10px] font-semibold tracking-widest uppercase text-[--text-muted] mb-4">
  {label}
</p>
```

---

### 6.2 Simulation Variables (sliders)

Section label: `SIMULATION VARIABLES`

Four sliders, each using `<ScenarioSlider />`. Stack with `gap-6`.

**Slider 1 — Attrition Rate**
```
label: "Attrition Rate"
min: 0, max: 40, step: 1
defaultValue: 12
unit: "%"
color: var(--slider-attrition)  → #E8197A
valueLabel: "12%"
```

**Slider 2 — AI Automation Level**
```
label: "AI Automation"
type: "discrete"   ← 4 discrete steps instead of continuous
options: ["Low", "Medium", "High", "Aggressive"]
defaultIndex: 2    ← "High" selected
color: var(--slider-ai) → #7F77DD
```

**Slider 3 — Hiring Budget**
```
label: "Hiring Budget"
min: -5, max: 5, step: 0.5
defaultValue: -2
unit: "M"
prefix: "$"
color: var(--slider-budget) → #F59E0B
valueLabel: "-$2M"
positivePrefix: "+"
```

**Slider 4 — Growth Target**
```
label: "Growth Target"
min: 0, max: 20, step: 1
defaultValue: 8
unit: "%"
color: var(--slider-growth) → #06B6D4
valueLabel: "8%"
```

---

### 6.3 ScenarioSlider.tsx Component

**"use client"**

```tsx
interface SliderProps {
  label: string;
  min?: number;
  max?: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
  color: string;
  formatValue: (v: number) => string;
}
```

**Layout** (`flex flex-col gap-2`):

Row 1 — label + value:
```tsx
<div className="flex justify-between items-center">
  <span className="text-xs text-[--text-secondary]">{label}</span>
  <span className="text-xs font-semibold" style={{ color }}>{formatValue(value)}</span>
</div>
```

Row 2 — the range input:
```tsx
<input
  type="range"
  min={min} max={max} step={step}
  value={value}
  onChange={e => onChange(Number(e.target.value))}
  className="w-full h-1 rounded-full appearance-none cursor-pointer"
  style={{
    background: `linear-gradient(to right, ${color} ${pct}%, #E8E6E0 ${pct}%)`,
  }}
/>
```

Style the thumb via a `<style>` tag or global CSS:
```css
input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--thumb-color, #E8197A);
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 1px 4px rgba(0,0,0,0.15);
}
```

Each slider's thumb color is set via `style="--thumb-color: {color}"` on the input.

---

### 6.4 Scenario Presets

Section label: `SCENARIO PRESETS` (mt-6 above)

Four checkbox items:
```
☑ Attrition Spike
☑ AI Automation
☐ Hiring Freeze
☐ Mass Retirement
```

Each item:
```tsx
<label className="flex items-center gap-2.5 cursor-pointer group">
  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all
    ${checked
      ? "bg-[--pink] border-[--pink]"
      : "border-[#D3D1C7] bg-white group-hover:border-[--pink-border]"
    }`}>
    {checked && <Check size={10} color="white" strokeWidth={3} />}
  </div>
  <span className="text-xs text-[--text-secondary]">{label}</span>
</label>
```

---

### 6.5 Run Simulation Button

Push to bottom with `mt-auto pt-6`:

```tsx
<button
  onClick={onRunSimulation}
  disabled={isRunning}
  className="w-full bg-[--pink] hover:bg-[--pink-hover] text-white font-medium
    py-3 rounded-full text-sm transition-all disabled:opacity-70
    flex items-center justify-center gap-2"
>
  {isRunning ? (
    <>
      <Loader2 size={14} className="animate-spin" />
      Simulating...
    </>
  ) : (
    <>
      <Play size={14} fill="white" />
      Run Simulation
    </>
  )}
</button>
```

**Loading state**: While `isRunning`, also show a thin animated progress bar at the very top of the sidebar:
```tsx
{isRunning && (
  <div className="absolute top-0 left-0 right-0 h-0.5 bg-[--pink-light] overflow-hidden">
    <motion.div
      className="h-full bg-[--pink]"
      initial={{ x: "-100%" }}
      animate={{ x: "100%" }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  </div>
)}
```

---

## 7. SimulatorHeader.tsx

**Outer**: `flex items-start justify-between`

**Left — title block**:
```tsx
<div>
  <h1 className="text-2xl font-bold text-[--text-primary]">Workforce Gap Simulator</h1>
  <p className="text-sm text-[--text-secondary] mt-0.5">
    Strategic workforce simulation · predict and close talent gaps
  </p>
</div>
```

**Center — Timeframe selector** (`<TimeframeSelector />`):

```tsx
// Props: { value, onChange }
// Options:
const TIMEFRAMES = ["CURRENT", "1Y", "3Y", "5Y", "10Y"];
```

Render as a pill-group:
```tsx
<div className="flex bg-[#F1EFE8] rounded-xl p-1 gap-0.5">
  {TIMEFRAMES.map(t => (
    <button
      key={t}
      onClick={() => onChange(t)}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
        ${value === t
          ? "bg-white text-[--pink] shadow-sm"
          : "text-[--text-secondary] hover:text-[--text-primary]"
        }`}
    >
      {t}
    </button>
  ))}
</div>
```

The active tab has an underline/indicator. When `1Y` is selected, the 1Y button gets `bg-white text-[--pink]`.

**Right — Resilience Score**:
```tsx
<div className="text-right">
  <p className="text-[10px] font-semibold tracking-widest uppercase text-[--text-muted] mb-1">
    Resilience Score
  </p>
  <div className="flex items-center gap-2 justify-end">
    <p className="text-2xl font-bold text-[--pink]">{score.toFixed(1)}</p>
    <p className="text-lg text-[--text-secondary] font-medium">/ 100</p>
    {/* Circular indicator */}
    <div className="w-8 h-8 rounded-full bg-[--pink-lighter] border-2 border-[--pink]
      flex items-center justify-center text-[10px] font-bold text-[--pink]">
      {Math.round(score)}
    </div>
  </div>
</div>
```

Score color changes:
- 80–100: `text-[--pink]` (good)
- 50–79: `text-[--slider-budget]` (amber, warning)
- 0–49: `text-[--risk-critical]` (red/pink, danger)

---

## 8. SupplyDemandChart.tsx

**"use client"**

**Outer card**: `bg-white rounded-2xl border border-[--border] p-5`

**Card header** (`flex items-start justify-between mb-4`):

Left:
```tsx
<div>
  <p className="text-base font-semibold text-[--text-primary]">Supply vs Demand Dynamics</p>
</div>
```

Right — legend:
```tsx
<div className="flex items-center gap-4">
  {[
    { color: "#D3D3D8", label: "Projected Supply", dashed: true },
    { color: "#E8197A", label: "Projected Demand"  },
    { color: "#7F77DD", label: "Net Position"      },
  ].map(item => (
    <div key={item.label} className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        <div className="h-0.5 w-4" style={{
          background: item.color,
          borderTop: item.dashed ? `2px dashed ${item.color}` : undefined,
          background: item.dashed ? "none" : item.color,
        }} />
      </div>
      <span className="text-[11px] text-[--text-secondary]">{item.label}</span>
    </div>
  ))}
</div>
```

**Chart** (`h-[240px] mt-2`):

```tsx
<ResponsiveContainer width="100%" height="100%">
  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
    <CartesianGrid
      strokeDasharray="3 3"
      stroke="#F1EFE8"
      vertical={false}
    />
    <XAxis
      dataKey="year"
      tick={{ fontSize: 11, fill: "#9CA3AF" }}
      axisLine={false}
      tickLine={false}
    />
    <YAxis
      tick={{ fontSize: 11, fill: "#9CA3AF" }}
      axisLine={false}
      tickLine={false}
      tickFormatter={v => `${(v/1000).toFixed(1)}k`}
    />
    <Tooltip
      contentStyle={{
        background: "white",
        border: "0.5px solid #E8E6E0",
        borderRadius: 10,
        fontSize: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}
      formatter={(value, name) => [
        `${Number(value).toLocaleString()} roles`,
        name === "supply" ? "Projected Supply"
          : name === "demand" ? "Projected Demand"
          : "Net Position"
      ]}
    />

    {/* "Today" reference line */}
    <ReferenceLine
      x="2024"
      stroke="#E8E6E0"
      strokeDasharray="4 4"
      label={{ value: "Today", position: "top", fontSize: 10, fill: "#9CA3AF" }}
    />

    {/* Automation Inflection annotation (only show when AI preset active) */}
    {aiPresetActive && (
      <ReferenceLine
        x="2027"
        stroke="#E8197A"
        strokeDasharray="3 3"
        strokeOpacity={0.5}
        label={{
          value: "AUTOMATION INFLECTION (2027)",
          position: "insideTopLeft",
          fontSize: 9,
          fill: "#E8197A",
          fontWeight: 600,
        }}
      />
    )}

    {/* Supply line — gray dashed */}
    <Line
      type="monotone"
      dataKey="supply"
      stroke="#D3D3D8"
      strokeWidth={2}
      strokeDasharray="6 3"
      dot={false}
      animationDuration={800}
    />

    {/* Demand line — hot pink */}
    <Line
      type="monotone"
      dataKey="demand"
      stroke="#E8197A"
      strokeWidth={2.5}
      dot={false}
      animationDuration={800}
    />

    {/* Net position — purple */}
    <Line
      type="monotone"
      dataKey="net"
      stroke="#7F77DD"
      strokeWidth={2}
      dot={false}
      animationDuration={800}
    />
  </LineChart>
</ResponsiveContainer>
```

---

### 8.1 Chart Data Model (`lib/simulator/types.ts`)

```ts
export interface ChartPoint {
  year: string;
  supply: number;
  demand: number;
  net: number;
}

export interface SimState {
  attritionRate: number;       // 0–40 (%)
  aiLevel: number;             // 0=Low 1=Med 2=High 3=Aggressive
  hiringBudget: number;        // -5 to +5 (millions)
  growthTarget: number;        // 0–20 (%)
  presets: {
    attritionSpike: boolean;
    aiAutomation:   boolean;
    hiringFreeze:   boolean;
    massRetirement: boolean;
  };
  timeframe: "CURRENT" | "1Y" | "3Y" | "5Y" | "10Y";
}

export interface SimResult {
  chartData:        ChartPoint[];
  resilienceScore:  number;
  deptRisks:        DeptRisk[];
  projectedGap:     number;
  costOfInaction:   number;
  highRiskRoles:    number;
}

export interface DeptRisk {
  id:        string;
  label:     string;
  abbr:      string;
  score:     number;       // 0–100
  stability: "Critical" | "At Risk" | "Stable" | "Growing";
}
```

---

### 8.2 Mock Computation (`lib/simulator/mockCompute.ts`)

```ts
export function runMockSimulation(state: SimState): SimResult {
  const { attritionRate, aiLevel, hiringBudget, growthTarget, presets, timeframe } = state;

  // How many years to project
  const yearCount = { CURRENT: 1, "1Y": 2, "3Y": 3, "5Y": 4, "10Y": 5 }[timeframe];
  const years = ["2024", "2026", "2028", "2030", "2032"].slice(0, yearCount + 1);

  // AI multiplier: more AI = higher supply preservation
  const aiMult = [0.8, 1.0, 1.2, 1.5][aiLevel];

  // Preset boosts
  const attritionBoost = presets.attritionSpike   ? 1.4 : 1.0;
  const hiringPenalty  = presets.hiringFreeze      ? -3  : 0;
  const retirePenalty  = presets.massRetirement    ? 1.3 : 1.0;

  const chartData: ChartPoint[] = years.map((year, i) => {
    const supply = Math.max(1500, Math.round(
      5000
      - (attritionRate * 85 * i * attritionBoost * retirePenalty)
      + ((hiringBudget + hiringPenalty) * 180 * i)
      + (aiMult * 120 * i)
    ));
    const demand = Math.round(4200 + (growthTarget * 160 * i));
    return { year, supply, demand, net: supply - demand };
  });

  const lastPoint = chartData[chartData.length - 1];
  const gap = lastPoint.demand - lastPoint.supply;

  // Resilience score (higher gap = lower score)
  const resilienceScore = Math.min(100, Math.max(10,
    100 - (gap / 80) - (attritionRate * 0.5)
  ));

  // Department risks
  const deptRisks: DeptRisk[] = [
    {
      id: "eng", abbr: "ENG", label: "Engineering",
      score: Math.min(95, Math.round(30 + attritionRate * 1.8 + (aiLevel === 3 ? 15 : 0))),
      stability: "Critical"
    },
    {
      id: "sls", abbr: "SLS", label: "Sales",
      score: Math.min(80, Math.round(20 + attritionRate * 1.2)),
      stability: "At Risk"
    },
    {
      id: "ops", abbr: "OPS", label: "Operations",
      score: Math.round(10 + attritionRate * 0.6),
      stability: "Stable"
    },
    {
      id: "fin", abbr: "FIN", label: "Finance",
      score: Math.max(5, Math.round(25 - hiringBudget * 2)),
      stability: "Growing"
    },
  ].map(d => ({
    ...d,
    stability: d.score >= 60 ? "Critical"
      : d.score >= 35 ? "At Risk"
      : d.score >= 20 ? "Stable"
      : "Growing"
  }));

  return {
    chartData,
    resilienceScore: Math.round(resilienceScore * 10) / 10,
    deptRisks,
    projectedGap: Math.max(0, gap),
    costOfInaction: Math.round(gap * 14200),    // mock dollar calc
    highRiskRoles: Math.max(0, Math.round(gap / 300)),
  };
}
```

**Default state** used on first render (before any simulation is run):
```ts
export const DEFAULT_STATE: SimState = {
  attritionRate: 12,
  aiLevel: 2,
  hiringBudget: -2,
  growthTarget: 8,
  presets: { attritionSpike: true, aiAutomation: true, hiringFreeze: false, massRetirement: false },
  timeframe: "1Y",
};

export const DEFAULT_RESULT: SimResult = runMockSimulation(DEFAULT_STATE);
```

---

### 8.3 Stat Bar Below Chart

Below the chart area, inside the same white card, add a row of 4 quick stats:

```tsx
<div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-[--border]">
  {[
    { label: "Projected Supply", value: lastPoint.supply.toLocaleString(), change: "-5% YoY",  down: true  },
    { label: "Projected Demand", value: lastPoint.demand.toLocaleString(), change: "+12% YoY", down: false },
    { label: "High-Risk Roles",  value: result.highRiskRoles.toString(),   sub: "Across 3 depts"           },
    { label: "Cost of Inaction", value: `$${(result.costOfInaction/1e6).toFixed(1)}M`, sub: "Est. by 2030" },
  ].map(stat => (
    <div key={stat.label} className="flex flex-col gap-0.5">
      <p className="text-[11px] text-[--text-muted] uppercase tracking-wide">{stat.label}</p>
      <p className="text-lg font-bold text-[--text-primary]">{stat.value}</p>
      {stat.change && (
        <p className={`text-[11px] font-medium flex items-center gap-0.5
          ${stat.down ? "text-[--risk-critical]" : "text-[--risk-growing]"}`}>
          {stat.down ? <TrendingDown size={10} /> : <TrendingUp size={10} />}
          {stat.change}
        </p>
      )}
      {stat.sub && <p className="text-[11px] text-[--text-muted]">{stat.sub}</p>}
    </div>
  ))}
</div>
```

---

## 9. StrategyPanel.tsx

**Outer card**: `bg-white rounded-2xl border border-[--border] p-5`

**Header row** (`flex items-center justify-between mb-4`):
```tsx
<div className="flex items-center justify-between">
  <p className="text-base font-semibold text-[--text-primary]">Strategic Action Panel</p>
  <span className="flex items-center gap-1.5 bg-[--pink] text-white
    text-[10px] font-semibold px-3 py-1 rounded-full">
    <AlertTriangle size={10} />
    3 PRIORITY ALERTS
  </span>
</div>
```

**Two strategy cards** (`grid grid-cols-2 gap-4`):

**Card 1 — Talent Pipeline**
```tsx
<div className="rounded-xl border border-[--border] p-4 relative overflow-hidden">
  {/* Decorative blob */}
  <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-[--pink-lighter] opacity-60" />

  <p className="text-sm font-semibold text-[--text-primary] mb-2 relative z-10">
    Talent Pipeline Strategy
  </p>
  <p className="text-xs text-[--text-secondary] leading-relaxed relative z-10">
    Accelerate engineering hiring by 40% over 18 months to offset projected attrition in senior roles.
  </p>
  <button className="text-xs text-[--pink] font-medium mt-3 flex items-center gap-1 hover:underline">
    Execute Plan <ArrowRight size={11} />
  </button>
</div>
```

**Card 2 — AI Upskilling**
```tsx
<div className="rounded-xl border border-[--border] p-4 relative overflow-hidden">
  <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-[--purple-light] opacity-60" />

  <p className="text-sm font-semibold text-[--text-primary] mb-2 relative z-10">
    AI Upskilling Program
  </p>
  <p className="text-xs text-[--text-secondary] leading-relaxed relative z-10">
    Deploy AI training for 800 analysts in Sales and Finance to offset automation displacement.
  </p>
  <button className="text-xs text-[--pink] font-medium mt-3 flex items-center gap-1 hover:underline">
    Allocate Budget <ArrowRight size={11} />
  </button>
</div>
```

---

## 10. DepartmentRiskPanel.tsx

**Outer card**: `bg-white rounded-2xl border border-[--border] p-5`

**Header**: `DEPARTMENT RISK PROFILE` in section-label style (uppercase, muted, tracking-widest)

**Four department rows** (`flex flex-col gap-3 mt-4`):

Each row (`flex items-center gap-3`):
```tsx
{deptRisks.map(dept => {
  const { color, borderColor } = getRiskStyle(dept.stability);
  return (
    <div key={dept.id} className="flex items-center gap-3">
      {/* Dept avatar circle */}
      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0
        text-[11px] font-bold border-2 text-white"
        style={{ background: color, borderColor }}>
        {dept.abbr}
      </div>

      {/* Label + stability */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[--text-primary]">{dept.label}</p>
        <p className="text-[11px] text-[--text-muted]">Stability: {dept.stability}</p>
      </div>

      {/* Risk % */}
      <div className="text-right">
        <p className="text-base font-bold" style={{ color }}>{dept.score}%</p>
        <p className="text-[10px] text-[--text-muted] uppercase tracking-wide">risk score</p>
      </div>
    </div>
  );
})}
```

**getRiskStyle helper**:
```ts
function getRiskStyle(stability: DeptRisk["stability"]) {
  return {
    Critical: { color: "#E8197A", borderColor: "#E8197A" },
    "At Risk": { color: "#F59E0B", borderColor: "#F59E0B" },
    Stable:   { color: "#06B6D4", borderColor: "#06B6D4" },
    Growing:  { color: "#10B981", borderColor: "#10B981" },
  }[stability];
}
```

**Default 4 departments** (from `DEFAULT_RESULT`):
| Abbr | Dept | Score | Stability |
|------|------|-------|-----------|
| ENG | Engineering | 68% | Critical |
| SLS | Sales | 45% | At Risk |
| OPS | Operations | 30% | Stable |
| FIN | Finance | 14% | Growing |

Ring border color on the avatar circle matches the risk color (thin colored ring = `border-2 border-[riskColor]`, bg can be the same color at low opacity: `background: ${color}22`).

For Critical: bright pink ring. For At Risk: amber. For Stable: teal. For Growing: green.

---

## 11. ActionEngine.tsx

**Outer card**: `bg-white rounded-2xl border border-[--border] p-5 flex flex-col`

**Header**:
```tsx
<div className="mb-4">
  <p className="text-base font-semibold text-[--text-primary] leading-snug">
    Action Engine:<br />Recommended Interventions
  </p>
  <p className="text-[11px] text-[--text-muted] mt-1 leading-relaxed">
    Automated recommendations based on detected {currentYear + 6} gaps.
  </p>
</div>
```

**Four action rows** (`flex flex-col gap-3`):

```ts
const ACTIONS = [
  {
    id: "hire",
    icon: UserPlus,
    iconBg: "#FFF0F8",
    iconColor: "#E8197A",
    title: "Hire",
    detail: "Need 1,200 software engineers by 2030",
  },
  {
    id: "upskill",
    icon: GraduationCap,
    iconBg: "#EEEDFE",
    iconColor: "#7F77DD",
    title: "Upskill",
    detail: "Retrain 800 analysts into AI specialists",
  },
  {
    id: "mobility",
    icon: ArrowLeftRight,
    iconBg: "#FAEEDA",
    iconColor: "#BA7517",
    title: "Internal Mobility",
    detail: "Move employees from low-demand functions",
  },
  {
    id: "automate",
    icon: Bot,
    iconBg: "#E0F9FF",
    iconColor: "#06B6D4",
    title: "Automate",
    detail: "Automate 15% of repetitive HR tasks",
  },
];
```

Each action row (`flex items-start gap-3`):
```tsx
<div key={action.id} className="flex items-start gap-3">
  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
    style={{ background: action.iconBg }}>
    <action.icon size={15} style={{ color: action.iconColor }} />
  </div>
  <div>
    <p className="text-sm font-semibold text-[--text-primary]">{action.title}</p>
    <p className="text-[11px] text-[--text-muted] leading-relaxed mt-0.5">{action.detail}</p>
  </div>
</div>
```

**Deploy Action Engine button** (`mt-auto pt-5`):
```tsx
<button className="w-full bg-[--pink] hover:bg-[--pink-hover] text-white font-medium
  py-3 rounded-full text-sm transition-colors flex items-center justify-center gap-2">
  <Zap size={14} fill="white" />
  Deploy Action Engine
</button>
```

On click (prototype): show a success toast notification (`fixed bottom-5 right-5`) that says:
```
✓ Action plan created · 4 tasks added to your pipeline
```
Style: `bg-[--text-primary] text-white text-sm px-4 py-3 rounded-xl` with a Framer Motion slide-up + fade that auto-dismisses after 3 seconds.

---

## 12. Simulation State Flow (page.tsx)

Wire all the state in `page.tsx`:

```tsx
"use client";

const [simState, setSimState] = useState<SimState>(DEFAULT_STATE);
const [result, setResult]     = useState<SimResult>(DEFAULT_RESULT);
const [isRunning, setIsRunning] = useState(false);

const handleRunSimulation = async () => {
  setIsRunning(true);
  await new Promise(res => setTimeout(res, 1500));          // mock compute delay
  const newResult = runMockSimulation(simState);
  setResult(newResult);
  setIsRunning(false);
};
```

Pass down:
- `simState` and `setSimState` to `SimulatorSidebar`
- `result` to `SupplyDemandChart`, `DepartmentRiskPanel`, `ActionEngine`
- `isRunning` to `SimulatorSidebar` (disables button, shows progress)
- `handleRunSimulation` to `SimulatorSidebar`

---

## 13. Animations

**Chart update** — when `result.chartData` changes, recharts re-renders with `animationDuration={800}` already set on each `<Line>`. No extra Framer needed.

**Sidebar sliders** — value labels update in real-time as sliders move (no animation needed, just fast).

**Result stats** — wrap the stat bar in `<motion.div key={result.chartData.length} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>` so it fades in when new results arrive.

**Risk scores** — animate numbers counting up using a simple useEffect that increments to the target value over 600ms.

**Deploy toast** — `AnimatePresence` with `initial={{ y: 20, opacity: 0 }}` → `animate={{ y: 0, opacity: 1 }}` → `exit={{ opacity: 0 }}`.

---

## 14. Responsive Rules

| Breakpoint | Changes |
|------------|---------|
| `< 768px` | Stack all 3 columns vertically. Sidebar becomes a top panel (collapsible). Chart full width. Right panel below center. |
| `768–1024px` | 2 columns: sidebar + (center+right stacked). |
| `> 1024px` | Full 3-column layout as specified. |

---

## 15. Build Notes for Claude Code

1. **This page replaces Image 3 from the reference screenshots**. The reference shows "Workforce Resilience Planner" — build it as `Workforce Gap Simulator` for Simploy with the adaptations throughout this spec.

2. **Chart requires recharts**. Run `npm install recharts` if not already installed. Import only the components needed: `LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer`.

3. **Mock data only**. No API calls. All simulation output comes from `runMockSimulation()` in `lib/simulator/mockCompute.ts`. The function runs synchronously; the 1500ms delay is simulated with `setTimeout`.

4. **All state lives in `page.tsx`**. Sliders update `simState` in real time. The chart and risk panel only update when `handleRunSimulation` completes.

5. **Default results show immediately**. Do not render an empty state — run `DEFAULT_RESULT = runMockSimulation(DEFAULT_STATE)` at module level and use it as the initial `result` state. The page should always show data.

6. **Lucide icons needed** (not exhaustive): `Play`, `Loader2`, `AlertTriangle`, `TrendingUp`, `TrendingDown`, `ArrowRight`, `UserPlus`, `GraduationCap`, `ArrowLeftRight`, `Bot`, `Zap`, `Check`.

7. **Slider thumb color** — the native range input thumb needs a CSS variable trick or a wrapper `<style>` tag per slider since Tailwind can't target `::webkit-slider-thumb` directly without a plugin. Use a `<style jsx>` block or a global CSS class with a data attribute.

8. **The employer dashboard navbar** sits above this page. This component renders inside the existing employer layout — do not duplicate the navbar here.
