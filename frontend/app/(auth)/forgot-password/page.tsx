"use client";

import { Sparkles, BarChart3, Zap } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthLeftPanel from "@/components/auth/AuthLeftPanel";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

const DEFAULT_FEATURES = [
  { icon: Sparkles,  text: "AI-powered job matching" },
  { icon: BarChart3, text: "Workforce gap simulation" },
  { icon: Zap,       text: "Automated action plans" },
];

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      leftPanel={
        <AuthLeftPanel
          headline="We've got you."
          subtext="Password resets are quick and secure."
          features={DEFAULT_FEATURES}
        />
      }
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
