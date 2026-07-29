"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import GoogleAuthButton, { isGoogleAuthEnabled } from "./GoogleAuthButton";
import PasswordInput from "./PasswordInput";
import FormError from "./FormError";
import { BrandLogo } from "@/components/BrandLogo";
import { postJson, storeAuthSession, type AuthResponse } from "@/lib/api";
import { authRouteWithRole, dashboardRouteFor, routes, type UserRole } from "@/lib/routes";

type FormData = {
  email: string;
  password: string;
};
type LoginPayload = FormData & { role: UserRole };

const defaultLoginEmailByRole: Record<UserRole, string> = {
  employee: "abc@gmail.com",
  employer: "xyz@gmail.com",
};

const inputBase =
  "w-full px-4 py-3 rounded-xl border text-sm transition-all duration-150 focus:outline-none focus:ring-2";
const labelBase = "block text-sm font-medium mb-1.5";

function Divider() {
  return (
    <div className="relative my-5">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t" style={{ borderColor: "var(--divider-color)" }} />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-white px-3 text-xs" style={{ color: "var(--text-muted)" }}>
          or continue with email
        </span>
      </div>
    </div>
  );
}

interface LoginFormProps {
  initialRole?: string;
}

export default function LoginForm({ initialRole }: LoginFormProps) {
  const validInitialRole = initialRole === "employee" || initialRole === "employer" ? initialRole : null;
  const [role, setRole] = useState<UserRole>(validInitialRole ?? "employee");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const showGoogleAuth = isGoogleAuthEnabled();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (validInitialRole) {
      window.localStorage.setItem("simploy-role", validInitialRole);
      setRole(validInitialRole);
      return;
    }

    const savedRole = window.localStorage.getItem("simploy-role");
    if (savedRole === "employee" || savedRole === "employer") {
      setRole(savedRole);
    }
  }, [validInitialRole]);

  const onSubmit = async () => {
    setSubmitError(null);
    try {
      const payload: LoginPayload = {
        email: defaultLoginEmailByRole[role],
        password: "",
        role,
      };
      const session = await postJson<AuthResponse, LoginPayload>("/auth/login", payload);
      if (session.user.role !== role) {
        setSubmitError(`This account is registered as ${session.user.role}. Switch portal and try again.`);
        return;
      }
      storeAuthSession(session);
      window.location.replace(dashboardRouteFor(session.user.role));
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to sign in. Please try again.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="mb-6">
        <BrandLogo className="mb-6 md:hidden" imageClassName="h-16 w-auto" />
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Sign in
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Don&apos;t have an account?{" "}
          <a href={authRouteWithRole(routes.signup, role)} className="font-medium hover:underline" style={{ color: "var(--pink)" }}>
            Create one free
          </a>
        </p>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl border border-[#EAE3D3] bg-[#F7F3EA] p-1">
        {(["employee", "employer"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => {
              setRole(option);
              window.localStorage.setItem("simploy-role", option);
            }}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              role === option ? "bg-white text-[#B08A44] shadow-sm" : "text-[#6B7280] hover:bg-white/70"
            }`}
          >
            {option === "employee" ? "Employee" : "Employer"}
          </button>
        ))}
      </div>

      {showGoogleAuth && (
        <>
          <GoogleAuthButton />
          <Divider />
        </>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        {submitError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {submitError}
          </div>
        )}

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className={labelBase}
            style={{ color: "var(--label-color)" }}
          >
            Email address
          </label>
          <input
            id="email"
            type="text"
            placeholder="you@company.com"
            className={inputBase}
            style={{
              borderColor: errors.email ? "var(--input-border-error)" : "var(--input-border)",
              background: "var(--input-bg)",
              color: "var(--text-primary)",
            }}
            {...register("email")}
          />
          <FormError error={errors.email} />
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className={labelBase} style={{ color: "var(--label-color)", marginBottom: 0 }}>
              Password
            </label>
            <a
              href="/forgot-password"
              className="text-xs hover:underline"
              style={{ color: "var(--pink)" }}
            >
              Forgot password?
            </a>
          </div>
          <PasswordInput register={register} name="password" hasError={!!errors.password} />
          <FormError error={errors.password} />
        </div>

        {/* Remember me */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="remember"
            className="w-4 h-4 rounded"
            style={{ accentColor: "var(--pink)" }}
          />
          <label htmlFor="remember" className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Remember me for 30 days
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full text-white font-medium py-3 rounded-xl text-sm transition-colors
            disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          style={{ background: isSubmitting ? "var(--pink-hover)" : "var(--pink)" }}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      {/* Footer */}
      <p className="text-xs text-center mt-8" style={{ color: "var(--text-muted)" }}>
        By signing in you agree to our{" "}
        <a href="#" className="underline hover:opacity-70">Terms</a>
        {" "}and{" "}
        <a href="#" className="underline hover:opacity-70">Privacy Policy</a>.
      </p>
    </motion.div>
  );
}
