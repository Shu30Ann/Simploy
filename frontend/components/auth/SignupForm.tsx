"use client";

import { useState } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronLeft, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import PasswordInput from "./PasswordInput";
import FormError from "./FormError";
import StepIndicator from "./StepIndicator";
import GoogleAuthButton from "./GoogleAuthButton";
import { postJson, storeAuthSession, type AuthResponse } from "@/lib/api";
import { authRouteWithRole, dashboardRouteFor, routes } from "@/lib/routes";

const baseSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Must be at least 8 characters"),
  terms: z.literal<boolean>(true, {
    message: "You must accept the terms to continue",
  }),
});

const employerSchema = baseSchema.extend({
  companyName: z.string().min(2, "Please enter your company name"),
});

type FormData = z.infer<typeof employerSchema>;

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

interface SignupFormProps {
  role: "employee" | "employer";
  onBack: () => void;
}

export default function SignupForm({ role, onBack }: SignupFormProps) {
  const schema = role === "employer" ? employerSchema : baseSchema;
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as unknown as Resolver<FormData>,
  });

  const passwordValue: string = useWatch({ control, name: "password", defaultValue: "" }) ?? "";

  const onSubmit = async (data: FormData) => {
    setSubmitError(null);
    const payload = {
      email: data.email,
      password: data.password,
      role,
      full_name: data.fullName,
      company_name: role === "employer" ? data.companyName : undefined,
    };

    try {
      const session = await postJson<AuthResponse, typeof payload>("/auth/signup", payload);
      storeAuthSession(session);
      window.location.replace(dashboardRouteFor(session.user.role === "admin" ? role : session.user.role));
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to create account. Please try again.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm hover:opacity-70 transition-opacity"
          style={{ color: "var(--text-secondary)" }}
        >
          <ChevronLeft size={16} />
          Back
        </button>
        <StepIndicator current={2} total={2} />
      </div>

      <p className="text-xl font-bold mb-4 md:hidden" style={{ color: "var(--pink)" }}>
        Simploy
      </p>

      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          {role === "employee" ? "Create your account" : "Set up your employer account"}
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          {role === "employee"
            ? "Start finding better opportunities today."
            : "Start simulating your workforce in minutes."}
        </p>
      </div>

      <GoogleAuthButton />
      <Divider />

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {submitError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {submitError}
          </div>
        )}

        {/* Full name */}
        <div>
          <label htmlFor="fullName" className={labelBase} style={{ color: "var(--label-color)" }}>
            Full name
          </label>
          <input
            id="fullName"
            type="text"
            placeholder="Alex Johnson"
            className={inputBase}
            style={{
              borderColor: errors.fullName ? "var(--input-border-error)" : "var(--input-border)",
              background: "var(--input-bg)",
              color: "var(--text-primary)",
            }}
            {...register("fullName")}
          />
          <FormError error={errors.fullName} />
        </div>

        {/* Company name (employer only) */}
        {role === "employer" && (
          <div>
            <label
              htmlFor="companyName"
              className={labelBase}
              style={{ color: "var(--label-color)" }}
            >
              Company name
            </label>
            <input
              id="companyName"
              type="text"
              placeholder="Acme Corp"
              className={inputBase}
              style={{
                borderColor: errors.companyName
                  ? "var(--input-border-error)"
                  : "var(--input-border)",
                background: "var(--input-bg)",
                color: "var(--text-primary)",
              }}
              {...register("companyName")}
            />
            <FormError error={errors.companyName} />
          </div>
        )}

        {/* Work email */}
        <div>
          <label htmlFor="email" className={labelBase} style={{ color: "var(--label-color)" }}>
            Work email
          </label>
          <input
            id="email"
            type="email"
            placeholder="alex@company.com"
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
          <label htmlFor="password" className={labelBase} style={{ color: "var(--label-color)" }}>
            Password
          </label>
          <PasswordInput
            register={register}
            name="password"
            watchedValue={passwordValue}
            showStrength
            hasError={!!errors.password}
          />
          <FormError error={errors.password} />
        </div>

        {/* Terms */}
        <div>
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="terms"
              className="w-4 h-4 mt-0.5 rounded flex-shrink-0"
              style={{ accentColor: "var(--pink)" }}
              {...register("terms")}
            />
            <label
              htmlFor="terms"
              className="text-sm leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              I agree to Simploy&apos;s{" "}
              <a href="#" className="hover:underline" style={{ color: "var(--pink)" }}>
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="hover:underline" style={{ color: "var(--pink)" }}>
                Privacy Policy
              </a>
              .
            </label>
          </div>
          <FormError error={errors.terms} />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full text-white font-medium py-3 rounded-xl text-sm transition-colors
            disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
          style={{ background: "var(--pink)" }}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Creating your account...
            </>
          ) : role === "employee" ? (
            "Create free account"
          ) : (
            "Create employer account"
          )}
        </button>
      </form>

      <p className="text-center text-sm mt-4" style={{ color: "var(--text-secondary)" }}>
        Already have an account?{" "}
        <a href={authRouteWithRole(routes.login, role)} className="font-medium hover:underline" style={{ color: "var(--pink)" }}>
          Sign in
        </a>
      </p>
    </motion.div>
  );
}
