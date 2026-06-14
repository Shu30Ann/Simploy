# Simploy — Supply vs Demand Bar Chart Fixes
> Apply these 4 changes to `components/simulator/SupplyDemandChart.tsx` only.

---

## Change 1 — Remove green demand bar logic

The demand bar should never turn green. Remove the `Cell` color-switching logic entirely and replace with a single solid fill on the `<Bar>` component.

Remove this:
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

Replace with:
```tsx
<Bar
  dataKey="demand"
  radius={[6, 6, 0, 0]}
  maxBarSize={40}
  fill="#E8197A"
/>
```

---

## Change 2 — Add bar category gap

Add `barCategoryGap="35%"` to the `<ComposedChart>` opening tag to space out the year groups.

```tsx
<ComposedChart
  data={chartData}
  barCategoryGap="35%"
  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
>
```

---

## Change 3 — Fix "Today" reference line label clipping

Find the existing `Today` ReferenceLine and update the label prop:

```tsx
// Before
<ReferenceLine
  x="2024"
  stroke="#E8E6E0"
  strokeDasharray="4 4"
  label={{ value: "Today", position: "top", fontSize: 10, fill: "#9CA3AF" }}
/>

// After
<ReferenceLine
  x="2024"
  stroke="#E8E6E0"
  strokeDasharray="4 4"
  label={{ value: "Today", position: "insideTopRight", fontSize: 10, fill: "#9CA3AF", dy: 8 }}
/>
```

---

## Change 4 — Add "Break-even" label on the zero line

Add a new `ReferenceLine` at `y={0}` with a "Break-even" label so HR users understand what the net position line crossing zero means.

```tsx
<ReferenceLine
  y={0}
  stroke="#E8E6E0"
  strokeWidth={1}
  label={{
    value: "Break-even",
    position: "insideBottomLeft",
    fontSize: 10,
    fill: "#9CA3AF",
    dy: -4,
  }}
/>
```

Place this after the existing `x="2024"` ReferenceLine and before the `<Bar>` components.
