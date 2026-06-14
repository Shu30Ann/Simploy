"use client";

import { useState } from "react";
import { UserPlus, GraduationCap, ArrowLeftRight, Bot, Zap } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { SimResult } from "@/lib/simulator/types";

const ACTIONS = [
  {
    id:        "hire",
    icon:      UserPlus,
    iconBg:    "#FFF0F8",
    iconColor: "#E8197A",
    title:     "Hire",
    detail:    "Need 1,200 software engineers by 2030",
  },
  {
    id:        "upskill",
    icon:      GraduationCap,
    iconBg:    "#EEEDFE",
    iconColor: "#7F77DD",
    title:     "Upskill",
    detail:    "Retrain 800 analysts into AI specialists",
  },
  {
    id:        "mobility",
    icon:      ArrowLeftRight,
    iconBg:    "#FAEEDA",
    iconColor: "#BA7517",
    title:     "Internal Mobility",
    detail:    "Move employees from low demand functions",
  },
  {
    id:        "automate",
    icon:      Bot,
    iconBg:    "#E0F9FF",
    iconColor: "#06B6D4",
    title:     "Automate",
    detail:    "Automate 15% of repetitive HR tasks",
  },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function ActionEngine({ result: _result }: { result: SimResult }) {
  const [toastVisible, setToastVisible] = useState(false);

  const onDeploy = () => {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  return (
    <>
      <div className="bg-white rounded-2xl border p-5 flex flex-col gap-4"
        style={{ borderColor: "var(--border)" }}>

        {/* Header */}
        <div>
          <p className="text-base font-semibold leading-snug" style={{ color: "var(--text-primary)" }}>
            Action Engine:<br />Recommended Interventions
          </p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Automated recommendations based on detected {new Date().getFullYear() + 6} gaps.
          </p>
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

        {/* Deploy button */}
        <button
          onClick={onDeploy}
          className="w-full text-white font-medium py-3 rounded-full text-sm transition-colors
            flex items-center justify-center gap-2 mt-auto"
          style={{ background: "var(--pink)" }}
        >
          <Zap size={14} fill="white" />
          Deploy Action Engine
        </button>

      </div>

      {/* Toast */}
      <AnimatePresence>
        {toastVisible && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-5 right-5 text-white text-sm px-4 py-3 rounded-xl z-50"
            style={{ background: "var(--text-primary)" }}
          >
            ✓ Action plan created · 4 tasks added to your pipeline
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
