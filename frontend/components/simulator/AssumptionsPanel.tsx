"use client";

import { useState } from "react";
import { ChevronDown, Info, SlidersHorizontal } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { SimulatorAssumption } from "@/lib/simulator/types";

export function AssumptionsPanel({ assumptions }: { assumptions: SimulatorAssumption[] }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="rounded-2xl border bg-white p-5" style={{ borderColor: "var(--border)" }}>
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-start gap-3 text-left">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: "var(--bg-purple-soft)", color: "#56618C" }}>
          <SlidersHorizontal size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
            Model Assumptions
          </p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
              Why the numbers move
            </p>
            <ChevronDown
              size={14}
              className="shrink-0"
              style={{ color: "var(--text-muted)", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}
            />
          </div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 grid gap-3">
              {assumptions.map((assumption) => (
                <div key={assumption.id} className="rounded-xl border p-3" style={{ borderColor: "var(--border)", background: "var(--bg-page)" }}>
                  <div className="flex items-start gap-2">
                    <Info size={14} className="mt-0.5 shrink-0" style={{ color: "var(--pink)" }} />
                    <div className="min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
                          {assumption.label}
                        </p>
                        <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold" style={{ color: "var(--pink)" }}>
                          {assumption.value}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] leading-4" style={{ color: "var(--text-secondary)" }}>
                        {assumption.detail}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
