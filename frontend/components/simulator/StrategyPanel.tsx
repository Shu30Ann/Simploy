import { AlertTriangle, ArrowRight } from "lucide-react";

export default function StrategyPanel() {
  return (
    <div className="bg-white rounded-2xl border p-5" style={{ borderColor: "var(--border)" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
          Strategic Action Panel
        </p>
        <span
          className="flex items-center gap-1.5 text-white text-[10px] font-semibold px-3 py-1 rounded-full"
          style={{ background: "var(--pink)" }}
        >
          <AlertTriangle size={10} />
          3 PRIORITY ALERTS
        </span>
      </div>

      {/* Two cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Card 1 */}
        <div className="rounded-xl border p-4 relative overflow-hidden"
          style={{ borderColor: "var(--border)" }}>
          <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-60"
            style={{ background: "var(--pink-lighter)" }} />
          <p className="text-sm font-semibold mb-2 relative z-10"
            style={{ color: "var(--text-primary)" }}>
            Talent Pipeline Strategy
          </p>
          <p className="text-xs leading-relaxed relative z-10"
            style={{ color: "var(--text-secondary)" }}>
            Accelerate engineering hiring by 40% over 18 months to offset projected attrition in senior roles.
          </p>
          <button className="text-xs font-medium mt-3 flex items-center gap-1 hover:underline"
            style={{ color: "var(--pink)" }}>
            Execute Plan <ArrowRight size={11} />
          </button>
        </div>

        {/* Card 2 */}
        <div className="rounded-xl border p-4 relative overflow-hidden"
          style={{ borderColor: "var(--border)" }}>
          <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-60"
            style={{ background: "var(--purple-light)" }} />
          <p className="text-sm font-semibold mb-2 relative z-10"
            style={{ color: "var(--text-primary)" }}>
            AI Upskilling Program
          </p>
          <p className="text-xs leading-relaxed relative z-10"
            style={{ color: "var(--text-secondary)" }}>
            Deploy AI training for 800 analysts in Sales and Finance to offset automation displacement.
          </p>
          <button className="text-xs font-medium mt-3 flex items-center gap-1 hover:underline"
            style={{ color: "var(--pink)" }}>
            Allocate Budget <ArrowRight size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}
