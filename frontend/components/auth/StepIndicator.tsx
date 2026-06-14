export default function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            width: i + 1 === current ? 20 : 8,
            height: 8,
            background:
              i + 1 <= current ? "var(--pink)" : "var(--divider-color)",
          }}
        />
      ))}
      <span className="text-xs ml-1" style={{ color: "var(--text-muted)" }}>
        Step {current} of {total}
      </span>
    </div>
  );
}
