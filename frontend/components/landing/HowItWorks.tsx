"use client";

import { motion } from "framer-motion";
import SectionLabel from "@/components/ui/SectionLabel";

const cards = [
  {
    number: "01",
    title: "Career Marketplace",
    subtitle: "The live talent graph",
    subtitleColor: "#E8197A",
    body: "Every employee profile, skill, certification, and career path — always current. It's the LinkedIn + Workday layer that continuously feeds your workforce intelligence.",
    tags: ["Employee profiles", "Skills inventory", "Job marketplace", "Internal mobility"],
    bg: "var(--bg-pink-soft)",
    border: "var(--pink-border)",
    numColor: "#E8197A",
    tagBorder: "var(--pink-border)",
  },
  {
    number: "02",
    title: "Workforce Gap Simulator",
    subtitle: "Model any future scenario",
    subtitleColor: "#7F77DD",
    body: "What if 20% of your engineers leave? AI automates 30% of finance tasks? Simploy runs the scenarios and shows you exactly what your workforce looks like in 1, 3, 5, or 10 years.",
    tags: ["What-if scenarios", "Supply/demand charts", "Risk scoring", "Regional gaps"],
    bg: "var(--bg-purple-soft)",
    border: "var(--purple-border)",
    numColor: "#7F77DD",
    tagBorder: "var(--purple-border)",
  },
  {
    number: "03",
    title: "Action Engine",
    subtitle: "A plan, not just a report",
    subtitleColor: "#06B6D4",
    body: "After detecting a gap, Simploy doesn't stop at the warning. It generates a concrete action plan: who to hire, who to upskill, who to move, and what to automate.",
    tags: ["Hire recommendations", "Upskill plans", "Internal mobility", "Automation insights"],
    bg: "var(--bg-teal-soft)",
    border: "var(--teal-border)",
    numColor: "#06B6D4",
    tagBorder: "var(--teal-border)",
  },
];

const flowItems = [
  "Career Marketplace",
  "→",
  "Live Talent Data",
  "→",
  "Gap Simulator",
  "→",
  "Risk Predictions",
  "→",
  "Action Engine",
  "→",
  "Outcomes",
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-[#FDFCFF] py-24">
      <div className="max-w-2xl mx-auto text-center px-6">
        <SectionLabel>How It Works</SectionLabel>
        <h2 className="text-[40px] font-bold text-[#1A1033] leading-tight">
          Three layers. One intelligent system.
        </h2>
        <p className="text-lg text-[#6B7280] mt-3">
          Most platforms give you data. Simploy gives you answers.
        </p>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-6xl mx-auto px-6"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        {cards.map((card) => (
          <motion.div
            key={card.number}
            variants={item}
            style={{
              background: card.bg,
              border: `1px solid ${card.border}`,
              borderRadius: 20,
              padding: 28,
            }}
          >
            <p
              className="text-6xl font-black mb-4"
              style={{ color: card.numColor, opacity: 0.15 }}
            >
              {card.number}
            </p>
            <p className="text-xl font-semibold text-[#1A1033]">{card.title}</p>
            <p className="text-sm font-medium mt-1" style={{ color: card.subtitleColor }}>
              {card.subtitle}
            </p>
            <p className="text-sm text-[#6B7280] mt-3 leading-relaxed">{card.body}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {card.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full px-3 py-1 text-xs bg-white text-[#6B7280]"
                  style={{ border: `1px solid ${card.tagBorder}` }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Flow connector */}
      <div className="mt-12 flex items-center justify-center flex-wrap gap-2 text-xs text-[#9CA3AF] px-6">
        {flowItems.map((item, i) =>
          item === "→" ? (
            <span key={i} className="text-[#9CA3AF]">
              →
            </span>
          ) : (
            <span
              key={i}
              className="px-3 py-1 bg-white border border-[#F0EBF8] rounded-full"
            >
              {item}
            </span>
          )
        )}
      </div>
    </section>
  );
}
