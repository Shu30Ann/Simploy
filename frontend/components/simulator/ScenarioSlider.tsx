"use client";

interface Benchmark {
  value:  number;
  label:  string;
  format: (v: number) => string;
}

interface SliderProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  color: string;
  formatValue: (v: number) => string;
  benchmark?: Benchmark;
}

export default function ScenarioSlider({
  label, min, max, step, value, onChange, color, formatValue, benchmark,
}: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  const aboveAvg = benchmark ? value > benchmark.value : false;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{label}</span>
        <span className="text-xs font-semibold" style={{ color }}>{formatValue(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="sim-slider w-full cursor-pointer"
        style={{
          // @ts-expect-error css custom property
          "--thumb-color": color,
          background: `linear-gradient(to right, ${color} ${pct}%, #E8E6E0 ${pct}%)`,
        }}
      />
      {benchmark && (
        <div className="flex items-center justify-between -mt-1">
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
            {benchmark.label}: {benchmark.format(benchmark.value)}
          </span>
          <span className="text-[10px] font-semibold"
            style={{ color: aboveAvg ? "var(--risk-critical)" : "var(--risk-growing)" }}>
            {aboveAvg ? "▲" : "▼"} {Math.abs(value - benchmark.value).toFixed(1)} vs avg
          </span>
        </div>
      )}
    </div>
  );
}
