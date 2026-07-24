"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import type { SimulatorTimelineEvent } from "@/lib/simulator/types";
import { manufacturingTimelineEvents } from "@/lib/mock-data";

const SEV = {
  critical: { dot: "var(--risk-critical)", track: "var(--risk-critical-border)", text: "var(--risk-critical)", badge: "var(--risk-critical-bg)" },
  warning: { dot: "var(--risk-at-risk)", track: "var(--risk-at-risk-border)", text: "var(--risk-at-risk)", badge: "var(--risk-at-risk-bg)" },
  medium: { dot: "var(--risk-stable)", track: "var(--risk-stable-border)", text: "var(--risk-stable)", badge: "var(--risk-stable-bg)" },
};

export default function GapTimeline({ events = manufacturingTimelineEvents }: { events?: SimulatorTimelineEvent[] }) {
  const [message, setMessage] = useState<string | null>(null);
  const exportTimeline = () => {
    setMessage(`Timeline export preview ready: ${events.length} planning milestones prepared.`);
    window.setTimeout(() => setMessage(null), 2800);
  };

  return (
    <div className="rounded-2xl border bg-white p-5" style={{ borderColor: "var(--border)" }}>
      <div className="mb-1 flex items-start justify-between">
        <div>
          <p className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
            Gap Timeline
          </p>
          <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
            When manufacturing shortages hit - plan backwards from these dates.
          </p>
        </div>
        <button
          type="button"
          onClick={exportTimeline}
          className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors"
          style={{ color: "var(--text-secondary)", borderColor: "var(--border)" }}
        >
          <Download size={12} />
          Export
        </button>
      </div>
      {message && (
        <div className="mt-3 rounded-lg border px-3 py-2 text-xs font-bold" style={{ borderColor: "var(--teal-border)", background: "var(--bg-teal-soft)", color: "var(--teal)" }}>
          {message}
        </div>
      )}

      <div className="relative mt-6">
        <div className="absolute left-0 right-0 top-3 h-px" style={{ background: "var(--border)" }} />

        <div className="relative flex justify-between">
          {events.map((event, index) => {
            const severity = SEV[event.severity];
            return (
              <motion.div
                key={`${event.date}-${event.label}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.25 }}
                className="flex flex-col items-center"
                style={{ flex: 1 }}
              >
                <div
                  className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white"
                  style={{ background: severity.dot, boxShadow: `0 0 0 3px ${severity.track}` }}
                >
                  <div className="h-2 w-2 rounded-full bg-white" />
                </div>

                <div className="mt-3 px-1 text-center">
                  <span
                    className="mb-1 inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold"
                    style={{ background: severity.badge, color: severity.text }}
                  >
                    {event.date}
                  </span>
                  <p className="text-[11px] font-semibold leading-tight" style={{ color: "var(--text-secondary)" }}>
                    {event.label}
                  </p>
                  <p className="mt-1 line-clamp-3 text-[10px] leading-4" style={{ color: "var(--text-muted)" }}>
                    {event.detail}
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
