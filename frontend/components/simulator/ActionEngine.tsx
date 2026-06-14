"use client";

import { useState } from "react";
import {
  UserPlus, GraduationCap, ArrowLeftRight, Bot, Zap,
  ClipboardList, Award,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { SimResult } from "@/lib/simulator/types";

type UrgencyTab = "This Quarter" | "This Year" | "3-Year Plan";

const URGENCY_TABS: Record<UrgencyTab, {
  id: string; icon: React.ElementType; iconBg: string; iconColor: string;
  title: string; detail: string; tag: string; tagColor: string;
}[]> = {
  "This Quarter": [
    {
      id: "q-hire", icon: UserPlus, iconBg: "#FFF0F8", iconColor: "#E8197A",
      title: "Post 23 engineering roles",
      detail: "Focus: Sr. Software Engineer (×12) and DevOps Engineer (×11). Start by April 1.",
      tag: "Immediate", tagColor: "#E8197A",
    },
    {
      id: "q-audit", icon: ClipboardList, iconBg: "#EEEDFE", iconColor: "#7F77DD",
      title: "Audit upskill candidates",
      detail: "Identify 45 analysts eligible for ML Engineer retraining. Use Skills Center data.",
      tag: "Immediate", tagColor: "#E8197A",
    },
  ],
  "This Year": [
    {
      id: "y-upskill", icon: GraduationCap, iconBg: "#EEEDFE", iconColor: "#7F77DD",
      title: "Launch AI upskilling cohort",
      detail: "Retrain 800 analysts into AI specialists. Estimated cost: $4.2M. ROI vs hiring: 4.4×.",
      tag: "Q2 2025", tagColor: "#F59E0B",
    },
    {
      id: "y-mobility", icon: ArrowLeftRight, iconBg: "#FAEEDA", iconColor: "#BA7517",
      title: "Internal mobility program",
      detail: "Move 34 employees from Operations (low-demand) into Sales Engineering pipeline.",
      tag: "Q3 2025", tagColor: "#F59E0B",
    },
    {
      id: "y-automate", icon: Bot, iconBg: "#E0F9FF", iconColor: "#06B6D4",
      title: "Automate repetitive HR tasks",
      detail: "15% of admin overhead automatable. Target: reduce HR ops headcount need by 12 roles.",
      tag: "Q4 2025", tagColor: "#F59E0B",
    },
  ],
  "3-Year Plan": [
    {
      id: "3y-hire", icon: UserPlus, iconBg: "#FFF0F8", iconColor: "#E8197A",
      title: "Hire 1,200 software engineers",
      detail: "Phased hiring: 400 in 2025, 500 in 2026, 300 in 2027. Budget: $18.7M.",
      tag: "2025–2027", tagColor: "#06B6D4",
    },
    {
      id: "3y-succession", icon: Award, iconBg: "#E1F5EE", iconColor: "#1D9E75",
      title: "Succession planning for 18 senior roles",
      detail: "12 Engineering leads + 6 Sales directors are retirement-eligible by 2027.",
      tag: "Ongoing", tagColor: "#06B6D4",
    },
  ],
};

const TABS = Object.keys(URGENCY_TABS) as UrgencyTab[];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function ActionEngine({ result: _result }: { result: SimResult }) {
  const [tab, setTab] = useState<UrgencyTab>("This Quarter");
  const [toastVisible, setToastVisible] = useState(false);
  const currentYear = new Date().getFullYear();

  const handleDeploy = () => {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  return (
    <>
      <div className="bg-white rounded-2xl border p-5 flex flex-col"
        style={{ borderColor: "var(--border)" }}>
        {/* Header */}
        <div className="mb-3">
          <p className="text-base font-semibold leading-snug" style={{ color: "var(--text-primary)" }}>
            Action Engine:<br />Recommended Interventions
          </p>
          <p className="text-[11px] mt-1 leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Automated recommendations based on detected {currentYear + 6} gaps.
          </p>
        </div>

        {/* Urgency tabs */}
        <div className="flex rounded-lg p-0.5 mb-4" style={{ background: "#F1EFE8" }}>
          {TABS.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className="flex-1 py-1.5 px-1 rounded-md text-[10px] font-medium transition-all"
              style={tab === t
                ? { background: "white", color: "var(--pink)", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }
                : { color: "var(--text-secondary)" }
              }
            >
              {t}
            </button>
          ))}
        </div>

        {/* Action list */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-3 flex-1"
          >
            {URGENCY_TABS[tab].map(action => (
              <div key={action.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: action.iconBg }}>
                  <action.icon size={15} style={{ color: action.iconColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-tight" style={{ color: "var(--text-primary)" }}>
                    {action.title}
                  </p>
                  <p className="text-[11px] leading-relaxed mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {action.detail}
                  </p>
                  <span
                    className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: action.tagColor + "18", color: action.tagColor }}
                  >
                    {action.tag}
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Deploy button */}
        <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={handleDeploy}
            className="w-full text-white font-medium py-3 rounded-full text-sm transition-colors
              flex items-center justify-center gap-2"
            style={{ background: "var(--pink)" }}
          >
            <Zap size={14} fill="white" />
            Deploy Action Engine
          </button>
        </div>
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
