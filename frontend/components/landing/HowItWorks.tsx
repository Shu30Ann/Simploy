"use client";

import { motion } from "framer-motion";
import SectionLabel from "@/components/ui/SectionLabel";

const cards = [
  {
    number: "01",
    title: "Career Marketplace",
    subtitle: "The live talent graph",
    body: "Every employee profile, skill, certification, and career path — always current. It's the LinkedIn + Workday layer that continuously feeds your workforce intelligence.",
    tags: ["Employee profiles", "Skills inventory", "Job marketplace", "Internal mobility"],
  },
  {
    number: "02",
    title: "Workforce Gap Simulator",
    subtitle: "Model any future scenario",
    body: "What if 20% of your engineers leave? AI automates 30% of finance tasks? Simploy runs the scenarios and shows you exactly what your workforce looks like in 1, 3, 5, or 10 years.",
    tags: ["What-if scenarios", "Supply/demand charts", "Risk scoring", "Regional gaps"],
  },
  {
    number: "03",
    title: "Action Engine",
    subtitle: "A plan, not just a report",
    body: "After detecting a gap, Simploy doesn't stop at the warning. It generates a concrete action plan: who to hire, who to upskill, who to move, and what to automate.",
    tags: ["Hire recommendations", "Upskill plans", "Internal mobility", "Automation insights"],
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
    <section id="how-it-works" className="bg-[#F7F3EA] py-24">
      <div className="max-w-2xl mx-auto px-6">
        <div className="flex justify-center">
          <SectionLabel>How It Works</SectionLabel>
        </div>
        <h2 className="font-serif text-[40px] font-bold text-[#1E2A44] leading-tight text-center">
          We hold your hand,{" "}
          <em className="text-[#B08A44] font-medium">every step</em>.
        </h2>
        <p className="text-lg text-[#5D6470] mt-3 text-center">
          Three layers. One intelligent system. Most platforms give you data —
          Simploy gives you answers.
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
            className="relative bg-white border border-[#EAE3D3] rounded-2xl p-7 shadow-[0_4px_24px_rgba(70,60,35,0.06)] overflow-hidden"
          >
            {/* Gold gradient top edge */}
            <span
              className="absolute top-0 left-0 right-0 h-[3px]"
              style={{
                background:
                  "linear-gradient(90deg, #C8A45F 0%, #B08A44 50%, #17694F 100%)",
              }}
              aria-hidden
            />
            <p className="font-serif text-6xl font-black mb-4 text-[#B08A44] opacity-20">
              {card.number}
            </p>
            <p className="font-serif text-xl font-bold text-[#1E2A44]">
              {card.title}
            </p>
            <p className="text-sm font-medium mt-1 text-[#17694F]">
              {card.subtitle}
            </p>
            <p className="text-sm text-[#5D6470] mt-3 leading-relaxed">
              {card.body}
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {card.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full px-3 py-1 text-xs bg-[#F6F1E4] text-[#5D6470] border border-[#EAE3D3]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Flow connector */}
      <div className="mt-12 flex items-center justify-center flex-wrap gap-2 font-mono text-xs text-[#8B7434] px-6">
        {flowItems.map((item, i) =>
          item === "→" ? (
            <span key={i} className="text-[#B08A44]">
              →
            </span>
          ) : (
            <span
              key={i}
              className="px-3 py-1 bg-white border border-[#EAE3D3] rounded-full"
            >
              {item}
            </span>
          )
        )}
      </div>
    </section>
  );
}
