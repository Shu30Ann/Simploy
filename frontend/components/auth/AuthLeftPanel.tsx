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
      <p
        className="text-xl font-bold text-[#F7F3EA]"
        style={{ textShadow: "0 1px 12px rgba(8,16,35,0.7)" }}
      >
        Simploy
      </p>

      {/* Middle */}
      <div className="flex-1 flex flex-col justify-center">
        <h2
          className="font-bold leading-[1.2] text-[#F7F3EA]"
          style={{ fontSize: 32, maxWidth: 280, textShadow: "0 2px 20px rgba(8,16,35,0.7)" }}
        >
          {headline}
        </h2>
        <p
          className="text-sm mt-3 leading-relaxed text-white/80"
          style={{ maxWidth: 260, textShadow: "0 1px 10px rgba(8,16,35,0.7)" }}
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
              className="flex items-center gap-3 rounded-xl px-4 py-3 w-fit border"
              style={{
                background: "rgba(20,30,55,0.45)",
                borderColor: "rgba(255,255,255,0.18)",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
              }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/10">
                <f.icon size={15} className="text-[#C8A45F]" />
              </div>
              <p className="text-sm font-medium text-[#F7F3EA]">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div
        className="flex items-center gap-2 text-xs mt-auto text-white/65"
        style={{ textShadow: "0 1px 8px rgba(8,16,35,0.7)" }}
      >
        <Lock size={11} />
        <span>Your data is encrypted and never sold.</span>
      </div>
    </div>
  );
}
