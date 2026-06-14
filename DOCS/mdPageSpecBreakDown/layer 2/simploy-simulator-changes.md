# Simploy — Simulator Changes Spec
> Apply these changes ON TOP of the existing `simploy-simulator-spec.md` build.
> Do not rebuild from scratch — this file is a delta of additions and modifications only.

---

## Priority Guide

- 🔴 **HIGH** — Build these first. Biggest demo impact for judges.
- 🟡 **MEDIUM** — Build after HIGH items if time allows.
- 🟢 **EASY WIN** — Small additions, high credibility. Slot in wherever.

---

## Change 1 — Role-Level Gap Table 🔴

**What**: Replace the generic "38 High-Risk Roles / Across 3 depts" stat card with a full breakdown table. This is the single biggest gap — HR cannot act on a number without knowing which roles.

**Where**: A new card below `<SupplyDemandChart />`, above `<StrategyPanel />` in the center column.

**New file**: `components/simulator/RoleGapTable.tsx`

### Layout

```
┌──────────────────────────────────────────────────────────────────────────┐
│ High-Risk Roles Breakdown                              ↓ Export CSV      │
├────────────────────────┬──────────┬───────────┬───────┬─────────────────┤
│ ROLE                   │ CURRENT  │ 2030 NEED │  GAP  │ MARKET SUPPLY   │
├────────────────────────┼──────────┼───────────┼───────┼─────────────────┤
│ Sr. Software Engineer  │   120    │    340    │  -220 │ 🔴 Critical     │
│ Data Analyst           │    85    │    180    │   -95 │ 🟡 Scarce       │
│ DevOps Engineer        │    40    │    110    │   -70 │ 🔴 Critical     │
│ Product Manager        │    62    │    115    │   -53 │ 🟢 Balanced     │
│ ML Engineer            │    18    │     65    │   -47 │ 🔴 Critical     │
│ Sales Engineer         │    55    │     90    │   -35 │ 🟡 Scarce       │
└────────────────────────┴──────────┴───────────┴───────┴─────────────────┘
```

### Component Code

```tsx
"use client";

interface RoleGap {
  role:          string;
  dept:          string;
  current:       number;
  projected:     number;
  gap:           number;
  marketSupply:  "Critical" | "Scarce" | "Balanced" | "Abundant";
}

const MARKET_SUPPLY_STYLE = {
  Critical:  { label: "Critical",  dot: "#E8197A", bg: "#FFF0F5" },
  Scarce:    { label: "Scarce",    dot: "#F59E0B", bg: "#FFFBEB" },
  Balanced:  { label: "Balanced",  dot: "#06B6D4", bg: "#F0FDFF" },
  Abundant:  { label: "Abundant",  dot: "#10B981", bg: "#F0FDF4" },
};

// Mock data — update via mockCompute.ts result in real app
export const MOCK_ROLE_GAPS: RoleGap[] = [
  { role: "Sr. Software Engineer", dept: "Engineering", current: 120, projected: 340, gap: -220, marketSupply: "Critical"  },
  { role: "Data Analyst",          dept: "Engineering", current: 85,  projected: 180, gap: -95,  marketSupply: "Scarce"    },
  { role: "DevOps Engineer",       dept: "Engineering", current: 40,  projected: 110, gap: -70,  marketSupply: "Critical"  },
  { role: "Product Manager",       dept: "Sales",       current: 62,  projected: 115, gap: -53,  marketSupply: "Balanced"  },
  { role: "ML Engineer",           dept: "Engineering", current: 18,  projected: 65,  gap: -47,  marketSupply: "Critical"  },
  { role: "Sales Engineer",        dept: "Sales",       current: 55,  projected: 90,  gap: -35,  marketSupply: "Scarce"    },
];

export default function RoleGapTable({ roles = MOCK_ROLE_GAPS }: { roles?: RoleGap[] }) {
  return (
    <div className="bg-white rounded-2xl border border-[--border] p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-base font-semibold text-[--text-primary]">High-Risk Roles Breakdown</p>
          <p className="text-xs text-[--text-muted] mt-0.5">
            {roles.length} roles projected to face shortages · sorted by gap severity
          </p>
        </div>
        <button className="flex items-center gap-1.5 text-xs text-[--text-secondary]
          hover:text-[--pink] border border-[--border] rounded-lg px-3 py-1.5 transition-colors">
          <Download size={12} />
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[--border]">
              {["Role", "Department", "Current", "2030 Need", "Gap", "Market Supply"].map(h => (
                <th key={h} className="text-left text-[10px] font-semibold tracking-widest
                  uppercase text-[--text-muted] pb-3 pr-4 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roles.map((r, i) => {
              const ms = MARKET_SUPPLY_STYLE[r.marketSupply];
              return (
                <tr key={i} className="border-b border-[#F5F3EE] hover:bg-[#FAFAF9] transition-colors">
                  <td className="py-3 pr-4 font-medium text-[--text-primary] text-sm whitespace-nowrap">
                    {r.role}
                  </td>
                  <td className="py-3 pr-4 text-xs text-[--text-secondary]">{r.dept}</td>
                  <td className="py-3 pr-4 text-sm text-[--text-secondary] tabular-nums">{r.current}</td>
                  <td className="py-3 pr-4 text-sm text-[--text-secondary] tabular-nums">{r.projected}</td>
                  <td className="py-3 pr-4">
                    <span className="text-sm font-semibold text-[--risk-critical] tabular-nums">
                      {r.gap}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{ background: ms.bg, color: ms.dot }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: ms.dot }} />
                      {ms.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

**Insert in `page.tsx`** center column between `<SupplyDemandChart />` and `<StrategyPanel />`:
```tsx
<RoleGapTable roles={result.roleGaps} />
```

Add `roleGaps: RoleGap[]` to `SimResult` type and return `MOCK_ROLE_GAPS` from `runMockSimulation()`.

---

## Change 2 — Cost Breakdown Expansion 🔴

**What**: The `$161M Cost of Inaction` stat is unexplained. Clicking it opens a breakdown panel showing where the number comes from. HR needs to defend this to a CFO.

**Where**: Modify the existing stat bar in `<SupplyDemandChart />`. Make the Cost of Inaction card clickable. Add a dropdown/expandable panel beneath it.

**No new file needed** — modify `SupplyDemandChart.tsx`.

### Expanded Cost Panel (renders below stat bar when card is clicked)

```tsx
const [showCostBreakdown, setShowCostBreakdown] = useState(false);

// Toggle on click of the Cost of Inaction stat card
```

Breakdown panel layout (`mt-3 p-4 bg-[--bg-pink-soft] rounded-xl border border-[--pink-border]`):

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Cost of Inaction — Breakdown                                             │
├──────────────────────────────────┬───────────────────────────────────────┤
│ Lost productivity (gap × salary) │ $89.4M                               │
│ Contractor/overtime backfill     │ $34.2M                               │
│ Emergency recruitment (agencies) │ $22.8M                               │
│ Onboarding + ramp time           │ $14.6M                               │
├──────────────────────────────────┼───────────────────────────────────────┤
│ Total Cost of Inaction           │ $161.0M                              │
│ vs. Upskill + Hire plan cost     │ $23.4M                               │
│ Potential savings                │ $137.6M  ← highlight green          │
└──────────────────────────────────┴───────────────────────────────────────┘
```

```tsx
{showCostBreakdown && (
  <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    className="mt-3 p-4 bg-[--bg-pink-soft] rounded-xl border border-[--pink-border]"
  >
    <p className="text-xs font-semibold text-[--text-primary] mb-3">
      Cost of Inaction — Breakdown
    </p>
    {[
      { label: "Lost productivity (gap × avg. salary)",  value: "$89.4M"  },
      { label: "Contractor / overtime backfill",          value: "$34.2M"  },
      { label: "Emergency agency recruitment",            value: "$22.8M"  },
      { label: "Onboarding and ramp time cost",           value: "$14.6M"  },
    ].map(item => (
      <div key={item.label} className="flex justify-between py-1.5 border-b border-[--pink-border] last:border-0">
        <span className="text-xs text-[--text-secondary]">{item.label}</span>
        <span className="text-xs font-semibold text-[--text-primary] tabular-nums">{item.value}</span>
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
```

Add `cursor-pointer hover:bg-[--bg-pink-soft] rounded-lg transition-colors px-2 -mx-2` to the Cost of Inaction stat card div, with `onClick={() => setShowCostBreakdown(!showCostBreakdown)}`.

---

## Change 3 — "Right Now" Urgency Tiers in Action Engine 🔴

**What**: The Action Engine currently lists 4 actions with no timeline. Real HR needs to know what to do immediately vs later.

**Where**: Modify `ActionEngine.tsx`. Add a 3-tab header above the action list:

```
[ This Quarter ] [ This Year ] [ 3-Year Plan ]
```

Each tab shows different action items with more specificity.

### New Action Engine Content

```tsx
const URGENCY_TABS = {
  "This Quarter": [
    {
      id: "q-hire",
      icon: UserPlus,
      iconBg: "#FFF0F8",
      iconColor: "#E8197A",
      title: "Post 23 engineering roles",
      detail: "Focus: Sr. Software Engineer (×12) and DevOps Engineer (×11). Start by April 1.",
      tag: "Immediate",
      tagColor: "#E8197A",
    },
    {
      id: "q-audit",
      icon: ClipboardList,
      iconBg: "#EEEDFE",
      iconColor: "#7F77DD",
      title: "Audit upskill candidates",
      detail: "Identify 45 analysts eligible for ML Engineer retraining. Use Skills Center data.",
      tag: "Immediate",
      tagColor: "#E8197A",
    },
  ],
  "This Year": [
    {
      id: "y-upskill",
      icon: GraduationCap,
      iconBg: "#EEEDFE",
      iconColor: "#7F77DD",
      title: "Launch AI upskilling cohort",
      detail: "Retrain 800 analysts into AI specialists. Estimated cost: $4.2M. ROI vs hiring: 4.4×.",
      tag: "Q2 2025",
      tagColor: "#F59E0B",
    },
    {
      id: "y-mobility",
      icon: ArrowLeftRight,
      iconBg: "#FAEEDA",
      iconColor: "#BA7517",
      title: "Internal mobility program",
      detail: "Move 34 employees from Operations (low-demand) into Sales Engineering pipeline.",
      tag: "Q3 2025",
      tagColor: "#F59E0B",
    },
    {
      id: "y-automate",
      icon: Bot,
      iconBg: "#E0F9FF",
      iconColor: "#06B6D4",
      title: "Automate repetitive HR tasks",
      detail: "15% of admin overhead automatable. Target: reduce HR ops headcount need by 12 roles.",
      tag: "Q4 2025",
      tagColor: "#F59E0B",
    },
  ],
  "3-Year Plan": [
    {
      id: "3y-hire",
      icon: UserPlus,
      iconBg: "#FFF0F8",
      iconColor: "#E8197A",
      title: "Hire 1,200 software engineers",
      detail: "Phased hiring: 400 in 2025, 500 in 2026, 300 in 2027. Budget: $18.7M.",
      tag: "2025–2027",
      tagColor: "#06B6D4",
    },
    {
      id: "3y-succession",
      icon: Award,
      iconBg: "#E1F5EE",
      iconColor: "#1D9E75",
      title: "Succession planning for 18 senior roles",
      detail: "12 Engineering leads + 6 Sales directors are retirement-eligible by 2027.",
      tag: "Ongoing",
      tagColor: "#06B6D4",
    },
  ],
};
```

### Tab UI

```tsx
const [urgencyTab, setUrgencyTab] = useState<"This Quarter" | "This Year" | "3-Year Plan">("This Quarter");

// Replace the static action list with:

{/* Tabs */}
<div className="flex bg-[#F1EFE8] rounded-lg p-0.5 mb-4 mt-2">
  {Object.keys(URGENCY_TABS).map(tab => (
    <button
      key={tab}
      onClick={() => setUrgencyTab(tab as any)}
      className={`flex-1 py-1.5 px-2 rounded-md text-[11px] font-medium transition-all
        ${urgencyTab === tab
          ? "bg-white text-[--pink] shadow-sm"
          : "text-[--text-secondary] hover:text-[--text-primary]"
        }`}
    >
      {tab}
    </button>
  ))}
</div>

{/* Action list */}
<AnimatePresence mode="wait">
  <motion.div
    key={urgencyTab}
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
    className="flex flex-col gap-3"
  >
    {URGENCY_TABS[urgencyTab].map(action => (
      <div key={action.id} className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: action.iconBg }}>
          <action.icon size={15} style={{ color: action.iconColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-sm font-semibold text-[--text-primary] leading-tight">{action.title}</p>
          </div>
          <p className="text-[11px] text-[--text-muted] leading-relaxed">{action.detail}</p>
          <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: action.tagColor + "18", color: action.tagColor }}>
            {action.tag}
          </span>
        </div>
      </div>
    ))}
  </motion.div>
</AnimatePresence>
```

---

## Change 4 — Internal Talent Pool Overlay 🟡

**What**: Add a callout inside the chart card showing how many gap roles can be filled internally before defaulting to external hiring.

**Where**: Add to `SupplyDemandChart.tsx` — a small banner between the legend row and the chart itself.

```tsx
<div className="flex items-center gap-3 bg-[--bg-purple-soft] border border-[--purple-border]
  rounded-xl px-4 py-2.5 mb-3">
  <div className="w-7 h-7 rounded-lg bg-[#7F77DD] flex items-center justify-center flex-shrink-0">
    <Users size={14} color="white" />
  </div>
  <p className="text-xs text-[--text-secondary] leading-relaxed">
    <span className="font-semibold text-[--text-primary]">14 of 38 gap roles</span>
    {" "}can be filled internally · 45 current employees are eligible for upskilling.{" "}
    <button className="text-[#7F77DD] font-medium hover:underline">View candidates →</button>
  </p>
</div>
```

Add this directly above the `<ResponsiveContainer>` inside the chart card.

---

## Change 5 — Quarterly Urgency Timeline 🟡

**What**: A visual timeline showing WHEN each gap hits, not just IF. HR plans in quarters — "by 2030" isn't a trigger for action, "Q3 2026" is.

**New file**: `components/simulator/GapTimeline.tsx`

**Where**: Add to the center column between `<RoleGapTable />` and `<StrategyPanel />`.

### Layout

```
Gap Timeline — When shortages hit

Q2 2025          Q3 2026          Q1 2027          Q4 2028          2030
   │                │                │                │               │
   ●────────────────●────────────────●────────────────●───────────────●
   │                │                │                │               │
Start hiring    Engineering      Sales gap        Finance gap    Full gap
now or gap      goes critical    appears          appears        realized
doubles                                                          (-11,340)
```

```tsx
const TIMELINE_EVENTS = [
  { date: "Q2 2025", label: "Start hiring or gap doubles",  severity: "warning", icon: AlertTriangle },
  { date: "Q3 2026", label: "Engineering goes critical",    severity: "critical", icon: Flame        },
  { date: "Q1 2027", label: "Sales gap appears",            severity: "warning", icon: AlertTriangle },
  { date: "Q4 2028", label: "Finance gap appears",          severity: "medium",  icon: Info          },
  { date: "2030",    label: "Full gap realized (−11,340)",  severity: "critical", icon: Flame        },
];

const SEVERITY_STYLE = {
  critical: { dot: "#E8197A", line: "#FFD0E8", text: "#E8197A"  },
  warning:  { dot: "#F59E0B", line: "#FEE4A0", text: "#854F0B"  },
  medium:   { dot: "#06B6D4", line: "#BAF3FF", text: "#0C447C"  },
};
```

Render as a horizontal scrollable row of connected dots with labels below:

```tsx
<div className="bg-white rounded-2xl border border-[--border] p-5">
  <p className="text-base font-semibold text-[--text-primary] mb-1">Gap Timeline</p>
  <p className="text-xs text-[--text-muted] mb-5">When shortages hit — plan backwards from these dates</p>

  <div className="relative flex items-start gap-0 overflow-x-auto pb-2">
    {TIMELINE_EVENTS.map((event, i) => {
      const s = SEVERITY_STYLE[event.severity];
      return (
        <div key={i} className="flex flex-col items-center flex-1 min-w-[120px]">
          {/* Connector line + dot */}
          <div className="flex items-center w-full">
            {i > 0 && (
              <div className="flex-1 h-0.5" style={{ background: s.line }} />
            )}
            <div className="w-3 h-3 rounded-full border-2 border-white flex-shrink-0 shadow-sm"
              style={{ background: s.dot }} />
            {i < TIMELINE_EVENTS.length - 1 && (
              <div className="flex-1 h-0.5 bg-[--border]" />
            )}
          </div>

          {/* Label */}
          <div className="mt-3 text-center px-1">
            <p className="text-[11px] font-bold" style={{ color: s.dot }}>{event.date}</p>
            <p className="text-[10px] text-[--text-secondary] mt-0.5 leading-tight">{event.label}</p>
          </div>
        </div>
      );
    })}
  </div>
</div>
```

---

## Change 6 — Industry Benchmarks on Sliders 🟢

**What**: Each slider currently shows your value but gives no sense of whether it's good or bad. Add a tiny benchmark indicator below each slider.

**Where**: Modify `ScenarioSlider.tsx` — add an optional `benchmark` prop.

### Prop addition

```tsx
interface SliderProps {
  // ... existing props
  benchmark?: {
    value:   number;
    label:   string;   // e.g. "Industry avg"
    format:  (v: number) => string;
  };
}
```

### Render below the range input

```tsx
{benchmark && (
  <div className="flex items-center justify-between mt-1">
    <span className="text-[10px] text-[--text-muted]">
      {benchmark.label}: {benchmark.format(benchmark.value)}
    </span>
    <span className={`text-[10px] font-semibold ${
      value > benchmark.value ? "text-[--risk-critical]" : "text-[--risk-growing]"
    }`}>
      {value > benchmark.value ? "▲" : "▼"} {Math.abs(value - benchmark.value).toFixed(1)} vs avg
    </span>
  </div>
)}
```

### Pass benchmarks from `SimulatorSidebar.tsx`

```tsx
// Attrition Rate slider
benchmark={{ value: 11.2, label: "Industry avg", format: v => `${v}%` }}

// AI Automation slider
benchmark={{ value: 1, label: "Industry avg", format: v => ["Low","Med","High","Aggressive"][v] }}

// Hiring Budget slider
benchmark={{ value: 0, label: "Industry avg", format: v => `${v > 0 ? "+" : ""}$${v}M` }}

// Growth Target slider
benchmark={{ value: 5.5, label: "Industry avg", format: v => `${v}%` }}
```

---

## Change 7 — Time-to-Fill Context in Stat Bar 🟢

**What**: Add a fifth stat to the existing 4-stat bar in `SupplyDemandChart.tsx`. HR needs to know when to start recruiting based on how long hiring takes.

**Where**: Modify the `grid grid-cols-4` to `grid grid-cols-5` and add:

```tsx
{
  label: "Avg Time-to-Fill",
  value: "4.2 mo",
  sub: "Start hiring by Q2 2025",
  highlight: true,   // renders sub text in amber to signal urgency
}
```

Sub-text style when `highlight: true`:
```tsx
<p className="text-[11px] font-medium text-[--slider-budget] flex items-center gap-0.5 mt-0.5">
  <Clock size={10} />
  {stat.sub}
</p>
```

---

## Change 8 — Voluntary vs Involuntary Attrition Split 🟢

**What**: The attrition slider treats all departures the same. Add a small breakdown note below the Attrition Rate slider in the sidebar so HR knows what's actually driving the number.

**Where**: Modify `SimulatorSidebar.tsx`. After the Attrition Rate slider, add:

```tsx
{/* Attrition split breakdown — only shows when attritionRate > 0 */}
<div className="bg-[--bg-pink-soft] rounded-lg p-2.5 -mt-2 border border-[--pink-border]">
  <p className="text-[10px] text-[--text-muted] mb-1.5 font-semibold uppercase tracking-wide">
    Breakdown
  </p>
  {[
    { label: "Voluntary (resignation)",   pct: 8,  color: "#E8197A", tip: "Fixable with retention"    },
    { label: "Retirement-eligible",       pct: 3,  color: "#F59E0B", tip: "Succession planning needed" },
    { label: "Performance / involuntary", pct: 2,  color: "#06B6D4", tip: "Manageable"                },
  ].map(item => (
    <div key={item.label} className="flex items-center justify-between mb-1 last:mb-0">
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: item.color }} />
        <span className="text-[10px] text-[--text-secondary]">{item.label}</span>
      </div>
      <span className="text-[10px] font-semibold" style={{ color: item.color }}>{item.pct}%</span>
    </div>
  ))}
</div>
```

This is static mock data — in a real app it would come from HR system integration.

---

## Change 9 — Data Freshness & Confidence Indicator 🟢

**What**: HR won't trust a simulation without knowing the data quality behind it. Add a small indicator to `SimulatorHeader.tsx`.

**Where**: Add below the subtitle line in the header.

```tsx
<div className="flex items-center gap-3 mt-2">
  {/* Data freshness */}
  <div className="flex items-center gap-1.5">
    <div className="w-1.5 h-1.5 rounded-full bg-[--risk-growing] animate-pulse" />
    <span className="text-[11px] text-[--text-muted]">
      Based on <span className="font-medium text-[--text-secondary]">4,200 employee profiles</span>
    </span>
  </div>

  <span className="text-[--border] text-xs">·</span>

  {/* Last synced */}
  <span className="text-[11px] text-[--text-muted]">
    Last synced <span className="font-medium text-[--text-secondary]">2 days ago</span>
  </span>

  <span className="text-[--border] text-xs">·</span>

  {/* Model confidence */}
  <div className="flex items-center gap-1">
    <span className="text-[11px] text-[--text-muted]">Model confidence:</span>
    <span className="text-[11px] font-semibold text-[--risk-growing]">87%</span>
  </div>
</div>
```

---

## Change 10 — Scenario Compare Mode Toggle 🟡

**What**: Let HR run two simulations and compare results side by side. This is a key differentiator — no basic HR tool does this.

**Where**: Add a toggle button to `SimulatorHeader.tsx`. When active, the sidebar splits into two mini-sidebars ("Scenario A" / "Scenario B") and the chart shows two sets of lines.

**This is the most complex change. Build it last.**

### Header toggle button

Add to the right of the timeframe tabs:

```tsx
<button
  onClick={() => setCompareMode(!compareMode)}
  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium
    border transition-all ${compareMode
      ? "bg-[--pink] text-white border-[--pink]"
      : "bg-white text-[--text-secondary] border-[--border] hover:border-[--pink-border]"
    }`}
>
  <Columns2 size={13} />
  {compareMode ? "Exit Compare" : "Compare Scenarios"}
</button>
```

### When compareMode is true

**Sidebar** splits into two columns labeled `Scenario A` (pink) and `Scenario B` (purple), each with its own set of sliders and its own resilience score. Use `grid grid-cols-2 gap-3` inside the sidebar, with condensed slider labels.

**Chart** shows 6 lines instead of 3 — supply/demand/net for both scenarios, with scenario B lines slightly thinner and using purple/lilac tones:
```
Scenario A Supply  — gray dashed
Scenario A Demand  — #E8197A (pink)
Scenario A Net     — #7F77DD (purple)
Scenario B Supply  — #D3D3D8 dotted (lighter gray)
Scenario B Demand  — #FF7BAE (light pink)
Scenario B Net     — #A9A5EC (light purple)
```

**Below chart**: A simple comparison callout:
```tsx
<div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-[--border]">
  <div className="p-3 bg-[--bg-pink-soft] rounded-xl border border-[--pink-border]">
    <p className="text-xs font-semibold text-[--pink] mb-1">Scenario A</p>
    <p className="text-sm font-bold text-[--text-primary]">Gap: −3,400 roles</p>
    <p className="text-xs text-[--text-secondary]">Resilience: 45.2 / 100</p>
  </div>
  <div className="p-3 bg-[--bg-purple-soft] rounded-xl border border-[--purple-border]">
    <p className="text-xs font-semibold text-[#7F77DD] mb-1">Scenario B</p>
    <p className="text-sm font-bold text-[--text-primary]">Gap: −1,100 roles</p>
    <p className="text-xs text-[--text-secondary]">Resilience: 72.8 / 100</p>
  </div>
</div>
```

---

## Summary — Build Order for Hackathon

Build in this order to maximize what's demo-ready under time pressure:

| # | Change | Priority | Est. effort |
|---|--------|----------|-------------|
| 1 | Role-Level Gap Table | 🔴 HIGH | ~45 min |
| 2 | Cost Breakdown Panel | 🔴 HIGH | ~20 min |
| 3 | Action Engine Urgency Tiers | 🔴 HIGH | ~30 min |
| 6 | Industry Benchmarks on Sliders | 🟢 EASY | ~10 min |
| 7 | Time-to-Fill Stat | 🟢 EASY | ~10 min |
| 8 | Attrition Type Split | 🟢 EASY | ~10 min |
| 9 | Data Freshness Indicator | 🟢 EASY | ~10 min |
| 4 | Internal Talent Pool Overlay | 🟡 MEDIUM | ~15 min |
| 5 | Quarterly Gap Timeline | 🟡 MEDIUM | ~30 min |
| 10 | Compare Mode Toggle | 🟡 MEDIUM | ~60 min |

The first 7 changes (all 🔴 and 🟢 items) take under 2.5 hours and will make the simulator feel like a real enterprise tool, not a demo.
