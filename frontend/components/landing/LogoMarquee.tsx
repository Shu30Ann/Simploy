"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const logos = [
  { name: "L'ORÉAL", style: "font-serif font-bold tracking-widest text-[#111111]" },
  { name: "TOYOTA", style: "font-black tracking-wider text-[#EB0A1E]" },
  { name: "Accenture", style: "font-semibold text-[#460073]" },
  { name: "DHL", style: "font-black italic tracking-widest text-[#D40511]" },
  { name: "Shell", style: "font-bold text-[#DD1D21]" },
  { name: "intel", style: "font-bold lowercase text-[#0068B5]" },
  { name: "HSBC", style: "font-bold tracking-wider text-[#DB0011]" },
  { name: "Nestlé", style: "font-serif font-bold text-[#63513D]" },
  { name: "Microsoft", style: "font-semibold text-[#5E5E5E]" },
  { name: "SAMSUNG", style: "font-black tracking-widest text-[#1428A0]" },
  { name: "Dell", style: "font-bold tracking-widest text-[#007DB8]" },
  { name: "Citi", style: "font-bold text-[#004685]" },
  { name: "Grab", style: "font-black text-[#00B14F]" },
  { name: "pwc", style: "font-bold lowercase text-[#D04A02]" },
  { name: "Siemens", style: "font-semibold text-[#009999]" },
  { name: "Maybank", style: "font-bold text-[#E8A800]" },
];

// Deterministic first paint (SSR-safe); positions randomize on every respawn
const SLOT_DEFAULTS = [
  { x: 0, y: 12, size: 100, hide: "" },
  { x: 0, y: -10, size: 168, hide: "" },
  { x: 0, y: 8, size: 92, hide: "" },
  { x: 0, y: -16, size: 190, hide: "" },
  { x: 0, y: 14, size: 112, hide: "hidden sm:block" },
  { x: 0, y: -8, size: 140, hide: "hidden md:block" },
  { x: 0, y: 10, size: 96, hide: "hidden lg:block" },
];
const CYCLE_MS = 3400;
const BURST_MS = 450;

type Pos = { x: number; y: number; size: number };

function randomPos(): Pos {
  return {
    x: Math.random() * 64 - 32,
    y: Math.random() * 56 - 28,
    size: 90 + Math.random() * 110,
  };
}

const DROPLET_ANGLES = [15, 70, 130, 195, 250, 310];

function Burst({ size }: { size: number }) {
  return (
    <>
      {/* Expanding ring */}
      <motion.span
        className="absolute rounded-full pointer-events-none"
        style={{
          width: size,
          height: size,
          border: "2px solid rgba(255,255,255,0.9)",
          boxShadow: "0 0 12px rgba(176,138,68,0.35)",
        }}
        initial={{ scale: 0.7, opacity: 0.9 }}
        animate={{ scale: 1.7, opacity: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      />
      {/* Flying droplets */}
      {DROPLET_ANGLES.map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const dist = size * 0.75 + Math.random() * 24;
        return (
          <motion.span
            key={deg}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 9 + Math.random() * 7,
              height: 9 + Math.random() * 7,
              background:
                "radial-gradient(circle at 50% 45%, rgba(255,255,255,0) 40%, rgba(255,255,255,0.5) 85%, rgba(255,255,255,0.15) 100%)",
              boxShadow: "inset 0 0 2px rgba(255,255,255,0.95)",
            }}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{
              x: Math.cos(rad) * dist,
              y: Math.sin(rad) * dist,
              scale: 0,
              opacity: 0,
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        );
      })}
    </>
  );
}

function Bubble({ slot }: { slot: number }) {
  const [idx, setIdx] = useState(slot);
  const [visible, setVisible] = useState(true);
  const [pos, setPos] = useState<Pos>(SLOT_DEFAULTS[slot]);
  const [bursting, setBursting] = useState(false);

  useEffect(() => {
    let swap: ReturnType<typeof setTimeout>;
    let calm: ReturnType<typeof setTimeout>;
    const interval = setInterval(() => {
      setVisible(false);
      setBursting(true);
      swap = setTimeout(() => {
        setIdx((i) => (i + SLOT_DEFAULTS.length) % logos.length);
        setPos(randomPos());
        setVisible(true);
      }, BURST_MS);
      calm = setTimeout(() => setBursting(false), BURST_MS + 200);
    }, CYCLE_MS + slot * 470);
    return () => {
      clearInterval(interval);
      clearTimeout(swap);
      clearTimeout(calm);
    };
  }, [slot]);

  const logo = logos[idx];

  return (
    <div className={`relative flex-1 ${SLOT_DEFAULTS[slot].hide}`} style={{ height: 260 }}>
      <div
        className="absolute left-1/2 top-1/2 flex items-center justify-center"
        style={{ transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))` }}
      >
        {bursting && <Burst size={pos.size} />}
        <AnimatePresence mode="wait">
          {visible && (
            <motion.div
              key={`${logo.name}-${idx}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, y: [-5, 7] }}
              exit={{
                scale: 1.25,
                opacity: 0,
                transition: { duration: 0.18, ease: "easeIn" },
              }}
              transition={{
                scale: { type: "spring", stiffness: 300, damping: 13 },
                opacity: { duration: 0.18 },
                y: {
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 2.2 + slot * 0.3,
                  ease: "easeInOut",
                },
              }}
              className="relative rounded-full flex items-center justify-center"
              style={{
                width: pos.size,
                height: pos.size,
                // Transparent film: invisible center, light gathers at the rim
                background:
                  "radial-gradient(circle at 50% 45%, rgba(255,255,255,0) 52%, rgba(255,255,255,0.10) 70%, rgba(255,255,255,0.40) 87%, rgba(255,255,255,0.85) 96%, rgba(255,255,255,0.35) 100%)",
                boxShadow:
                  "0 0 22px rgba(255,255,255,0.30), 0 8px 24px rgba(8,16,35,0.35), inset 0 0 14px rgba(255,255,255,0.55), inset 0 0 3px rgba(255,255,255,1)",
              }}
            >
              {/* Iridescent rim (rainbow film, masked to the edge) */}
              <span
                aria-hidden
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "conic-gradient(from 200deg, rgba(255,150,210,0.7), rgba(150,200,255,0.7), rgba(160,255,220,0.65), rgba(255,235,160,0.7), rgba(210,160,255,0.65), rgba(255,150,210,0.7))",
                  WebkitMaskImage:
                    "radial-gradient(circle, transparent 58%, black 82%, black 94%, transparent 100%)",
                  maskImage:
                    "radial-gradient(circle, transparent 58%, black 82%, black 94%, transparent 100%)",
                  filter: "blur(1px)",
                  opacity: 0.95,
                }}
              />
              {/* Top-left highlight arc */}
              <span
                aria-hidden
                className="absolute rounded-full"
                style={{
                  top: "6%",
                  left: "8%",
                  width: "55%",
                  height: "55%",
                  borderTop: "3px solid rgba(255,255,255,1)",
                  borderLeft: "2px solid transparent",
                  borderRight: "2px solid transparent",
                  borderBottom: "2px solid transparent",
                  transform: "rotate(-12deg)",
                  filter: "blur(1px)",
                }}
              />
              <span
                className={`text-center px-2 leading-tight ${logo.style}`}
                style={{
                  textShadow: "0 1px 2px rgba(255,255,255,0.6)",
                  fontSize: Math.max(9, Math.min(18, pos.size * 0.13)),
                }}
              >
                {logo.name}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function LogoMarquee() {
  return (
    <section className="relative py-10">
      {/* Strip band behind the label + bubbles */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 bottom-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(6,14,30,0.62) 18%, rgba(6,14,30,0.62) 82%, transparent 100%)",
          backdropFilter: "blur(3px)",
          WebkitBackdropFilter: "blur(3px)",
        }}
      />

      <p
        className="relative text-center font-mono text-xs font-semibold tracking-[0.3em] uppercase text-[#E8D9B8] mb-4 px-6"
        style={{ textShadow: "0 1px 10px rgba(8,16,35,0.7)" }}
      >
        Trusted by <span className="text-[#F0C77E]">Fortune 500</span> and the
        world&apos;s largest companies
      </p>

      <div className="relative w-full px-4 sm:px-8 md:px-14 flex items-center">
        {SLOT_DEFAULTS.map((_, i) => (
          <Bubble key={i} slot={i} />
        ))}
      </div>
    </section>
  );
}
