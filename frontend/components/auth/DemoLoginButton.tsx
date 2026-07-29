"use client";

import { useState } from "react";
import type React from "react";
import { Loader2 } from "lucide-react";
import { postJson, storeAuthSession, type AuthResponse } from "@/lib/api";
import { dashboardRouteFor, type UserRole } from "@/lib/routes";

type DemoLoginButtonProps = {
  role: UserRole;
  className: string;
  redirectTo?: string;
  children: React.ReactNode;
};

const defaultLoginEmailByRole: Record<UserRole, string> = {
  employee: "abc@gmail.com",
  employer: "xyz@gmail.com",
};

export default function DemoLoginButton({ role, className, redirectTo, children }: DemoLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const session = await postJson<AuthResponse, { email: string; password: string; role: UserRole }>("/auth/login", {
        email: defaultLoginEmailByRole[role],
        password: "",
        role,
      });
      storeAuthSession(session);
      window.location.replace(redirectTo ?? dashboardRouteFor(role));
    } catch {
      setIsLoading(false);
    }
  }

  return (
    <button type="button" onClick={handleClick} disabled={isLoading} className={className}>
      {isLoading ? (
        <span className="inline-flex items-center justify-center gap-2">
          <Loader2 size={15} className="animate-spin" />
          Entering...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
