"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  Building2,
  BarChart3,
  Sliders,
  Zap,
} from "lucide-react";
import AuthLayout from "./AuthLayout";
import AuthLeftPanel from "./AuthLeftPanel";
import RoleSelect from "./RoleSelect";
import SignupForm from "./SignupForm";

const EMPLOYEE_FEATURES = [
  { icon: Sparkles,   text: "AI-powered job matching" },
  { icon: TrendingUp, text: "Skill gap analysis" },
  { icon: Building2,  text: "Internal mobility alerts" },
];

const EMPLOYER_FEATURES = [
  { icon: BarChart3, text: "Live workforce analytics" },
  { icon: Sliders,   text: "What-if gap simulation" },
  { icon: Zap,       text: "Automated action plans" },
];

interface SignupFlowProps {
  initialRole?: string;
}

export default function SignupFlow({ initialRole }: SignupFlowProps) {
  const validRole =
    initialRole === "employee" || initialRole === "employer" ? initialRole : null;

  const [step, setStep] = useState<1 | 2>(validRole ? 2 : 1);
  const [role, setRole] = useState<"employee" | "employer" | null>(validRole);

  const handleSelect = (r: "employee" | "employer") => {
    window.localStorage.setItem("simploy-role", r);
    setRole(r);
    setStep(2);
  };

  return (
    <AnimatePresence mode="wait">
      {step === 1 ? (
        <motion.div
          key="step1"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          <RoleSelect role={role} onSelect={handleSelect} />
        </motion.div>
      ) : (
        <motion.div
          key="step2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          <AuthLayout
            leftPanel={
              <AuthLeftPanel
                headline={
                  role === "employee"
                    ? "Your next career move starts here."
                    : "Build the workforce you need."
                }
                subtext={
                  role === "employee"
                    ? "Join thousands of professionals growing smarter with Simploy."
                    : "230+ companies already simulate their workforce with Simploy."
                }
                features={role === "employee" ? EMPLOYEE_FEATURES : EMPLOYER_FEATURES}
              />
            }
          >
            <SignupForm role={role!} onBack={() => setStep(1)} />
          </AuthLayout>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
