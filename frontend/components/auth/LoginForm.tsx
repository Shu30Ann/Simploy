"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import GoogleAuthButton from "./GoogleAuthButton";
import PasswordInput from "./PasswordInput";
import FormError from "./FormError";
import { authRouteWithRole, dashboardRouteFor, routes, type UserRole } from "@/lib/routes";

const schema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormData = z.infer<typeof schema>;

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
  const router = useRouter();
  const validInitialRole = initialRole === "employee" || initialRole === "employer" ? initialRole : null;
  const [role, setRole] = useState<UserRole>(validInitialRole ?? "employee");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

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
    await new Promise((res) => setTimeout(res, 1200));
    window.localStorage.setItem("simploy-role", role);
    router.push(dashboardRouteFor(role));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="mb-8">
        <p className="text-xl font-bold mb-6 md:hidden" style={{ color: "var(--pink)" }}>
          Simploy
        </p>
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

      <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl border border-[#F0EBF8] bg-[#FDFCFF] p-1">
        {(["employee", "employer"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => {
              setRole(option);
              window.localStorage.setItem("simploy-role", option);
            }}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              role === option ? "bg-white text-[#E8197A] shadow-sm" : "text-[#6B7280] hover:bg-white/70"
            }`}
          >
            {option === "employee" ? "Employee" : "Employer"}
          </button>
        ))}
      </div>

      <GoogleAuthButton />
      <Divider />

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
            type="email"
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
