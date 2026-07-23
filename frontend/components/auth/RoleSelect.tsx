"use client";

import { ArrowRight, UserCircle2, Building2, Check } from "lucide-react";
import { motion } from "framer-motion";
import { authRouteWithRole, routes } from "@/lib/routes";

interface RoleSelectProps {
  role: "employee" | "employer" | null;
  onSelect: (role: "employee" | "employer") => void;
}

const EMPLOYEE_TAGS = ["Job matching", "Skill gaps", "Internal mobility"];
const EMPLOYER_TAGS = ["Workforce data", "Gap simulation", "Action plans"];

export default function RoleSelect({ role, onSelect }: RoleSelectProps) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-16 overflow-hidden bg-[#0B1526]">
      {/* Video background — CRT style, matches landing hero */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          filter:
            "sepia(0.3) hue-rotate(175deg) saturate(1.6) contrast(1.2) brightness(0.85)",
        }}
        src="/videos/busy_street.mp4"
      />
      <div className="absolute inset-0 bg-[#16345E]/35 mix-blend-multiply" />
      <div className="absolute inset-0 crt-scanlines" />
      <div className="absolute inset-0 crt-vignette" />
      <div className="absolute inset-0 bg-[#081022]/55" />

      <p
        className="relative z-10 text-xl font-bold mb-12 text-[#F7F3EA]"
        style={{ textShadow: "0 1px 12px rgba(8,16,35,0.7)" }}
      >
        Simploy
      </p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[600px]"
      >
        <h1
          className="text-3xl font-bold text-center text-[#F7F3EA]"
          style={{ textShadow: "0 2px 16px rgba(8,16,35,0.7)" }}
        >
          How will you use Simploy?
        </h1>
        <p
          className="text-sm mt-2 text-center text-white/80"
          style={{ textShadow: "0 1px 8px rgba(8,16,35,0.7)" }}
        >
          We&apos;ll tailor your experience based on your answer.
        </p>

        {/* Role cards */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Employee */}
          <button
            type="button"
            onClick={() => onSelect("employee")}
            className="flex flex-col items-start p-6 rounded-2xl border-2 text-left w-full
              transition-all duration-200 cursor-pointer group relative"
            style={{
              borderColor: role === "employee" ? "var(--pink)" : "var(--border)",
              background:
                role === "employee"
                  ? "var(--pink-lighter)"
                  : "white",
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors"
              style={{
                background: "var(--pink-lighter)",
                border: "1px solid var(--pink-border)",
              }}
            >
              <UserCircle2 size={24} style={{ color: "var(--pink)" }} />
            </div>
            <p className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
              I&apos;m an employee
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Looking for new roles, tracking my skills, and growing my career.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {EMPLOYEE_TAGS.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 rounded-full bg-white border"
                  style={{ borderColor: "var(--pink-border)", color: "var(--text-secondary)" }}
                >
                  {tag}
                </span>
              ))}
            </div>
            {role === "employee" && (
              <div
                className="absolute top-4 right-4 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: "var(--pink)" }}
              >
                <Check size={12} color="white" strokeWidth={3} />
              </div>
            )}
          </button>

          {/* Employer */}
          <button
            type="button"
            onClick={() => onSelect("employer")}
            className="flex flex-col items-start p-6 rounded-2xl border-2 text-left w-full
              transition-all duration-200 cursor-pointer group relative"
            style={{
              borderColor: role === "employer" ? "var(--pink)" : "var(--border)",
              background:
                role === "employer"
                  ? "var(--pink-lighter)"
                  : "white",
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors"
              style={{
                background: "var(--pink-lighter)",
                border: "1px solid var(--pink-border)",
              }}
            >
              <Building2 size={24} style={{ color: "var(--pink)" }} />
            </div>
            <p className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
              I&apos;m an employer
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Building teams, planning workforce strategy, and closing talent gaps.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {EMPLOYER_TAGS.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 rounded-full bg-white border"
                  style={{ borderColor: "var(--pink-border)", color: "var(--text-secondary)" }}
                >
                  {tag}
                </span>
              ))}
            </div>
            {role === "employer" && (
              <div
                className="absolute top-4 right-4 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: "var(--pink)" }}
              >
                <Check size={12} color="white" strokeWidth={3} />
              </div>
            )}
          </button>
        </div>

        {/* Continue */}
        <button
          type="button"
          onClick={() => role && onSelect(role)}
          disabled={!role}
          className="w-full mt-6 text-white font-medium py-3.5 rounded-xl text-sm
            transition-all disabled:opacity-40 disabled:cursor-not-allowed
            flex items-center justify-center gap-2"
          style={{ background: "var(--pink)" }}
        >
          Continue <ArrowRight size={15} />
        </button>

        <p
          className="text-sm text-center mt-5 text-white/80"
          style={{ textShadow: "0 1px 8px rgba(8,16,35,0.7)" }}
        >
          Already have an account?{" "}
          <a href={authRouteWithRole(routes.login, role)} className="font-medium hover:underline text-[#C8A45F]">
            Sign in
          </a>
        </p>
      </motion.div>
    </div>
  );
}
