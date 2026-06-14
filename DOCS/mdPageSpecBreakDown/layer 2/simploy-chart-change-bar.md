# Prompt for Claude Code — Change Supply vs Demand Chart to Bar Chart

## What to change

In `components/simulator/SupplyDemandChart.tsx`, replace the existing `LineChart` implementation with a grouped bar chart using recharts `ComposedChart`. Everything else in the file stays the same — the internal talent pool banner, the stat bar, the cost breakdown panel, the compare mode logic. Only the chart visualization itself changes.

---

## Chart type

Use `ComposedChart` from recharts. This allows two `Bar` components (Supply and Demand) with a `Line` overlay for Net Position — all in the same chart.

Change the import from:
```ts
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";
```

to:
```ts
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Cell } from "recharts";
```

---

## Bar design

**Supply bar**
```
dataKey:   "supply"
fill:      #E8E6E0   (light gray)
radius:    [6, 6, 0, 0]   (rounded top corners only)
maxBarSize: 40
```

**Demand bar**
```
dataKey:   "demand"
fill:      #E8197A   (brand pink)
radius:    [6, 6, 0, 0]
maxBarSize: 40
```

Bars are grouped side by side per year (default recharts grouped behavior — do not stack them).

**Net Position line** — keep as a line overlay on top of the bars:
```
dataKey:     "net"
stroke:      #7F77DD   (purple)
strokeWidth: 2
dot:         false
type:        "monotone"
```

This gives a clean visual: two bars show the raw supply vs demand volume, and the purple line shows whether the net position is positive or negative (above or below zero).

---

## Color the Demand bars by gap severity

If `demand > supply` for a given data point (a shortage), color that demand bar `#E8197A` (pink). If `demand <= supply` (surplus), color it `#10B981` (green). Use the `Cell` component inside the Demand `<Bar>`:

```tsx
<Bar dataKey="demand" radius={[6, 6, 0, 0]} maxBarSize={40}>
  {chartData.map((entry, index) => (
    <Cell
      key={index}
      fill={entry.demand > entry.supply ? "#E8197A" : "#10B981"}
    />
  ))}
</Bar>
```

---

## Y-axis and grid

```
YAxis:
  tickFormatter: v => `${(v / 1000).toFixed(0)}k`
  axisLine: false
  tickLine: false
  tick: { fontSize: 11, fill: "#9CA3AF" }

CartesianGrid:
  strokeDasharray: "3 3"
  stroke: "#F1EFE8"
  vertical: false
```

Add a zero reference line to make the net position line readable:
```tsx
<ReferenceLine y={0} stroke="#E8E6E0" strokeWidth={1} />
```

---

## Tooltip

Keep the existing tooltip style. Update the formatter labels to match bars:

```tsx
formatter={(value, name) => [
  `${Number(value).toLocaleString()} roles`,
  name === "supply"  ? "Projected Supply"
  : name === "demand" ? "Projected Demand"
  : "Net Position"
]}
```

---

## Legend update

Update the legend row above the chart to reflect bar icons instead of line icons:

```tsx
{[
  { color: "#E8E6E0", label: "Projected Supply",  shape: "bar"  },
  { color: "#E8197A", label: "Projected Demand",  shape: "bar"  },
  { color: "#7F77DD", label: "Net Position",       shape: "line" },
].map(item => (
  <div key={item.label} className="flex items-center gap-1.5">
    {item.shape === "bar" ? (
      <div className="w-3 h-3 rounded-sm" style={{ background: item.color }} />
    ) : (
      <div className="w-4 h-0.5 rounded-full" style={{ background: item.color }} />
    )}
    <span className="text-[11px] text-[--text-secondary]">{item.label}</span>
  </div>
))}
```

---

## Compare mode

When `compareMode` is true and `resultB` is passed in, render a second set of bars at reduced opacity alongside the first set. Use the lighter color variants:

```
Scenario B Supply bar fill:  #F1EFE8   (lighter gray)
Scenario B Demand bar fill:  #FF7BAE   (light pink)  
Scenario B Net line stroke:  #B0ACEE   (light purple)
Scenario B bar opacity:      0.6
```

Merge both datasets into a single array keyed by year before passing to the chart:
```ts
const mergedData = resultA.chartData.map((point, i) => ({
  year:       point.year,
  supplyA:    point.supply,
  demandA:    point.demand,
  netA:       point.net,
  supplyB:    resultB?.chartData[i]?.supply,
  demandB:    resultB?.chartData[i]?.demand,
  netB:       resultB?.chartData[i]?.net,
}));
```

Then render 4 bars (supplyA, demandA, supplyB, demandB) and 2 lines (netA, netB).

---

## Chart height

Keep the existing `h-[240px]` container height. The bars will naturally fit within this height — no adjustment needed.

---

## Nothing else changes

- The `Today` ReferenceLine stays
- The `Automation Inflection` ReferenceLine stays (when AI preset is active)
- The internal talent pool banner above the chart stays
- The 5-stat bar below the chart stays
- The cost breakdown expandable panel stays
- Animation: set `animationBegin={0}` and `animationDuration={600}` on each `<Bar>`
