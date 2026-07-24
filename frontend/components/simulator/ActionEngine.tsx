"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, UserPlus, GraduationCap, ArrowLeftRight, Bot, Zap } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { SimResult } from "@/lib/simulator/types";
import { routes } from "@/lib/routes";
import { manufacturingRecommendations } from "@/lib/mock-data";

const ACTIONS = [
  {
    id:        "hire",
    icon:      UserPlus,
    iconBg:    "#F6F1E4",
    iconColor: "#B08A44",
    title:     "Hire",
    detail:    manufacturingRecommendations[0].problem,
  },
  {
    id:        "upskill",
    icon:      GraduationCap,
    iconBg:    "#F1EDE0",
    iconColor: "#56618C",
    title:     "Upskill",
    detail:    manufacturingRecommendations[3].recommendation,
  },
  {
    id:        "mobility",
    icon:      ArrowLeftRight,
    iconBg:    "#FAEEDA",
    iconColor: "#BA7517",
    title:     "Internal Mobility",
    detail:    manufacturingRecommendations[2].recommendation,
  },
  {
    id:        "automate",
    icon:      Bot,
    iconBg:    "#E7F0E9",
    iconColor: "#17694F",
    title:     "Automate",
    detail:    manufacturingRecommendations[5].recommendation,
  },
];

const STRATEGIES = [
  {
    title: "Technician Pipeline Strategy",
    detail: "Build TVET and regional hiring channels for maintenance technicians before the 2031 shortage peaks.",
    button: "Execute Plan",
    message: "Technician pipeline created: 58 hires and 72 operator conversions queued for planning.",
    accent: "var(--pink-lighter)",
  },
  {
    title: "Operator Mobility Program",
    detail: "Convert production operator surplus into QA, line supervisor, and technician pathways.",
    button: "Allocate Budget",
    message: "Mobility budget preview allocated: RM 1.1M across three transition cohorts.",
    accent: "var(--purple-light)",
  },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function ActionEngine({ result: _result }: { result: SimResult }) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <>
      <div className="bg-white rounded-2xl border p-5 flex flex-col gap-4"
        style={{ borderColor: "var(--border)" }}>

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-base font-semibold leading-snug" style={{ color: "var(--text-primary)" }}>
              Action Engine:<br />Recommended Interventions
            </p>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Automated recommendations based on detected {new Date().getFullYear() + 6} gaps.
            </p>
          </div>
          <span
            className="flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold text-white"
            style={{ background: "var(--pink)" }}
          >
            <AlertTriangle size={10} />
            3 ALERTS
          </span>
        </div>

        {/* Action list */}
        <div className="flex flex-col gap-4">
          {ACTIONS.map(action => (
            <div key={action.id} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: action.iconBg }}>
                <action.icon size={15} style={{ color: action.iconColor }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{action.title}</p>
                <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--text-muted)" }}>{action.detail}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Strategy cards */}
        <div className="flex flex-col gap-3 border-t pt-4" style={{ borderColor: "var(--border)" }}>
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
            Strategic Plans
          </p>
          {STRATEGIES.map((strategy) => (
            <div key={strategy.title} className="relative overflow-hidden rounded-xl border p-3" style={{ borderColor: "var(--border)" }}>
              <div className="absolute -right-4 -top-4 h-14 w-14 rounded-full opacity-60" style={{ background: strategy.accent }} />
              <p className="relative z-10 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                {strategy.title}
              </p>
              <p className="relative z-10 mt-1 text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {strategy.detail}
              </p>
              <button
                type="button"
                onClick={() => showToast(strategy.message)}
                className="relative z-10 mt-2 flex items-center gap-1 text-xs font-medium hover:underline"
                style={{ color: "var(--pink)" }}
              >
                {strategy.button} <ArrowRight size={11} />
              </button>
            </div>
          ))}
        </div>

        {/* Deploy button */}
        <Link
          href={routes.employerActionEngine}
          onClick={() => showToast("Action plan created - 4 tasks added to your pipeline")}
          className="w-full text-white font-medium py-3 rounded-full text-sm transition-colors
            flex items-center justify-center gap-2 mt-auto"
          style={{ background: "var(--pink)" }}
        >
          <Zap size={14} fill="white" />
          Deploy Action Engine
        </Link>

      </div>

      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-5 right-5 text-white text-sm px-4 py-3 rounded-xl z-50"
            style={{ background: "var(--text-primary)" }}
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
