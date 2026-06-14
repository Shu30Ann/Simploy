"use client";

import { Download, AlertTriangle } from "lucide-react";
import type { RoleGap } from "@/lib/simulator/types";

const SUPPLY_STYLE: Record<RoleGap["marketSupply"], { dot: string; bg: string; text: string }> = {
  Critical: { dot: "#E8197A", bg: "#FFF0F5", text: "#E8197A" },
  Scarce:   { dot: "#F59E0B", bg: "#FFFBEB", text: "#D97706" },
  Balanced: { dot: "#06B6D4", bg: "#F0FDFF", text: "#0E7490" },
  Abundant: { dot: "#10B981", bg: "#F0FDF4", text: "#065F46" },
};

interface Props {
  roleGaps: RoleGap[];
}

export default function RoleGapTable({ roleGaps }: Props) {
  const criticalCount = roleGaps.filter(r => r.marketSupply === "Critical").length;

  return (
    <div className="bg-white rounded-2xl border p-5" style={{ borderColor: "var(--border)" }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <div>
          <p className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
            High-Risk Roles Breakdown
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            {criticalCount} critical roles with no viable market supply
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-colors hover:bg-gray-50"
          style={{ color: "var(--text-secondary)", borderColor: "var(--border)" }}>
          <Download size={12} />
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["Role", "Department", "Current", "2030 Need", "Gap", "Market Supply"].map(col => (
                <th key={col} className="text-left pb-2 pr-4"
                  style={{ color: "var(--text-muted)", fontSize: 10, fontWeight: 600,
                    letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roleGaps.map((row, i) => {
              const isCritical = row.marketSupply === "Critical";
              const s = SUPPLY_STYLE[row.marketSupply];
              return (
                <tr key={row.role + i} className="border-b last:border-0 transition-colors hover:bg-gray-50"
                  style={{ borderColor: "var(--border)" }}>
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-1.5">
                      {isCritical && <AlertTriangle size={11} color="#E8197A" />}
                      <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                        {row.role}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-4">
                    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{row.dept}</span>
                  </td>
                  <td className="py-2.5 pr-4">
                    <span className="text-xs tabular-nums" style={{ color: "var(--text-secondary)" }}>
                      {row.current.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4">
                    <span className="text-xs tabular-nums" style={{ color: "var(--text-secondary)" }}>
                      {row.projected.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4">
                    <span className="text-xs font-semibold tabular-nums"
                      style={{ color: "var(--risk-critical)" }}>
                      {row.gap}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                      style={{ background: s.bg, color: s.text }}>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
                      {row.marketSupply}
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
