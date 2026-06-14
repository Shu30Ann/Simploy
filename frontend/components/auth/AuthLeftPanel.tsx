"use client";

import { motion } from "framer-motion";
import { Lock, type LucideIcon } from "lucide-react";

interface AuthLeftPanelProps {
  headline: string;
  subtext: string;
  features: Array<{ icon: LucideIcon; text: string }>;
}

export default function AuthLeftPanel({ headline, subtext, features }: AuthLeftPanelProps) {
  return (
    <div className="flex flex-col h-full p-10">
      {/* Logo */}
      <p className="text-xl font-bold" style={{ color: "var(--pink)" }}>
        Simploy
      </p>

      {/* Middle */}
      <div className="flex-1 flex flex-col justify-center">
        <h2
          className="font-bold leading-[1.2]"
          style={{ fontSize: 32, maxWidth: 280, color: "var(--text-primary)" }}
        >
          {headline}
        </h2>
        <p
          className="text-sm mt-3 leading-relaxed"
          style={{ maxWidth: 260, color: "var(--text-secondary)" }}
        >
          {subtext}
        </p>

        <div className="mt-10 flex flex-col gap-3">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.4 }}
              className="flex items-center gap-3 backdrop-blur-sm rounded-xl px-4 py-3 w-fit border"
              style={{
                background: "rgba(255,255,255,0.7)",
                borderColor: "var(--border)",
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--pink-lighter)" }}
              >
                <f.icon size={15} style={{ color: "var(--pink)" }} />
              </div>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {f.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div
        className="flex items-center gap-2 text-xs mt-auto"
        style={{ color: "var(--text-muted)" }}
      >
        <Lock size={11} />
        <span>Your data is encrypted and never sold.</span>
      </div>
    </div>
  );
}
