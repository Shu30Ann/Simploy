"use client";

import { AlertTriangle, ArrowRight, BadgeCheck, Building2, Coins, Users } from "lucide-react";
import Link from "next/link";
import { manufacturingEmployerProfile } from "@/lib/mock-data";
import { routes } from "@/lib/routes";
import type { SimResult } from "@/lib/simulator/types";

export function SimulationRunSummary({
  result,
  hasSimulated,
}: {
  result: SimResult;
  hasSimulated: boolean;
}) {
  const residualGap = Math.max(0, result.projectedGap - result.gapReductionPotential);
  const confidence = result.resilienceScore >= 75 ? "Managed" : result.resilienceScore >= 55 ? "Exposed" : "Critical";

  return (
    <section className="rounded-2xl border bg-white p-5 shadow-[0_8px_28px_rgba(70,60,35,0.06)]" style={{ borderColor: "var(--border)" }}>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wide" style={{ background: "var(--bg-pink-soft)", borderColor: "var(--pink-border)", color: "var(--pink)" }}>
              <Building2 size={13} />
              {manufacturingEmployerProfile.name}
            </span>
            <span className="inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wide" style={{ background: "var(--bg-teal-soft)", borderColor: "var(--teal-border)", color: "var(--teal)" }}>
              {manufacturingEmployerProfile.employeeCount.toLocaleString()} employees
            </span>
          </div>
          <h2 className="mt-3 text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            {hasSimulated ? "Simulation result ready" : "Model Aster's workforce risk before committing a plan"}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
            {hasSimulated
              ? result.modelNarrative
              : "Run the model to reveal the projected shortage, internal mobility pool, cost of inaction, and recommended intervention mix."}
          </p>
        </div>

        <Link
          href={routes.employerActionEngine}
          className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold transition ${
            hasSimulated ? "text-white" : "pointer-events-none opacity-55"
          }`}
          style={{ background: hasSimulated ? "var(--pink)" : "var(--border)", color: hasSimulated ? "white" : "var(--text-muted)" }}
          aria-disabled={!hasSimulated}
        >
          Generate Action Plan
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Projected gap",
            value: `${result.projectedGap.toLocaleString()} roles`,
            detail: hasSimulated ? "Shortage after current levers" : "Run simulation to validate",
            icon: AlertTriangle,
            tone: "var(--risk-critical)",
          },
          {
            label: "Gap reduction potential",
            value: `${result.gapReductionPotential.toLocaleString()} roles`,
            detail: `Residual risk: ${residualGap.toLocaleString()} roles`,
            icon: BadgeCheck,
            tone: "var(--risk-growing)",
          },
          {
            label: "Internal pool",
            value: `${result.internalReadyNow + result.internalTrainable}`,
            detail: `${result.internalReadyNow} ready now, ${result.internalTrainable} trainable`,
            icon: Users,
            tone: "#56618C",
          },
          {
            label: "Cost exposure",
            value: `RM ${(result.costOfInaction / 1e6).toFixed(1)}M`,
            detail: `${confidence} resilience posture`,
            icon: Coins,
            tone: "var(--pink)",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.label} className="rounded-xl border p-3" style={{ borderColor: "var(--border)", background: "var(--bg-page)" }}>
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white" style={{ color: item.tone }}>
                  <Icon size={17} />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                    {item.label}
                  </p>
                  <p className="mt-1 text-lg font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
                    {item.value}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-4" style={{ color: "var(--text-secondary)" }}>
                    {item.detail}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
