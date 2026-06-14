"use client";

import { Sparkles, BarChart3, Zap } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthLeftPanel from "@/components/auth/AuthLeftPanel";
import LoginForm from "@/components/auth/LoginForm";

const DEFAULT_FEATURES = [
  { icon: Sparkles,  text: "AI-powered job matching" },
  { icon: BarChart3, text: "Workforce gap simulation" },
  { icon: Zap,       text: "Automated action plans" },
];

export default function LoginPage({
  searchParams,
}: {
  searchParams: { role?: string };
}) {
  return (
    <AuthLayout
      leftPanel={
        <AuthLeftPanel
          headline="Welcome back."
          subtext="The career OS for modern teams."
          features={DEFAULT_FEATURES}
        />
      }
    >
      <LoginForm initialRole={searchParams.role} />
    </AuthLayout>
  );
}
