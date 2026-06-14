"use client";

import { motion } from "framer-motion";
import { Download } from "lucide-react";

interface TimelineEvent {
  date:     string;
  label:    string;
  severity: "critical" | "warning" | "medium";
}

const TIMELINE_EVENTS: TimelineEvent[] = [
  { date: "Q2 2025", label: "Start hiring or gap doubles",  severity: "warning"  },
  { date: "Q3 2026", label: "Engineering goes critical",    severity: "critical" },
  { date: "Q1 2027", label: "Sales gap appears",            severity: "warning"  },
  { date: "Q4 2028", label: "Finance gap emerges",          severity: "medium"   },
  { date: "2030",    label: "Full gap realized (−11,340)",  severity: "critical" },
];

const SEV = {
  critical: { dot: "#E8197A", track: "#FFD0E8", text: "#E8197A",  badge: "#FFF0F5" },
  warning:  { dot: "#F59E0B", track: "#FEE4A0", text: "#854F0B",  badge: "#FFFBEB" },
  medium:   { dot: "#06B6D4", track: "#BAF3FF", text: "#0C447C",  badge: "#F0FDFF" },
};

export default function GapTimeline() {
  return (
    <div className="bg-white rounded-2xl border p-5" style={{ borderColor: "var(--border)" }}>
      <div className="flex items-start justify-between mb-1">
        <div>
          <p className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
            Gap Timeline
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            When shortages hit — plan backwards from these dates
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-colors"
          style={{ color: "var(--text-secondary)", borderColor: "var(--border)" }}>
          <Download size={12} />
          Export
        </button>
      </div>

      {/* Horizontal connected timeline */}
      <div className="mt-6 relative">
        {/* Track line */}
        <div className="absolute top-3 left-0 right-0 h-px" style={{ background: "var(--border)" }} />

        <div className="flex justify-between relative">
          {TIMELINE_EVENTS.map((ev, i) => {
            const s = SEV[ev.severity];
            return (
              <motion.div
                key={ev.date}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.25 }}
                className="flex flex-col items-center"
                style={{ flex: 1 }}
              >
                {/* Dot */}
                <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center z-10 relative"
                  style={{ background: s.dot, boxShadow: `0 0 0 3px ${s.track}` }}>
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>

                {/* Label below */}
                <div className="mt-3 text-center px-1">
                  <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold mb-1"
                    style={{ background: s.badge, color: s.text }}>
                    {ev.date}
                  </span>
                  <p className="text-[11px] leading-tight" style={{ color: "var(--text-secondary)" }}>
                    {ev.label}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
