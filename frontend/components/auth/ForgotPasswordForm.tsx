"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronLeft, KeyRound, Loader2, MailCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FormError from "./FormError";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type FormData = z.infer<typeof schema>;

const inputBase =
  "w-full px-4 py-3 rounded-xl border text-sm transition-all duration-150 focus:outline-none focus:ring-2";
const labelBase = "block text-sm font-medium mb-1.5";

export default function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const emailValue = watch("email");

  const onSubmit = async () => {
    await new Promise((res) => setTimeout(res, 1000));
    setSent(true);
  };

  return (
    <AnimatePresence mode="wait">
      {!sent ? (
        <motion.div
          key="idle"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          {/* Mobile logo */}
          <p className="text-xl font-bold mb-6 md:hidden" style={{ color: "var(--pink)" }}>
            Simploy
          </p>

          {/* Back to login */}
          <a
            href="/login"
            className="flex items-center gap-1.5 text-sm mb-8 hover:opacity-70 transition-opacity"
            style={{ color: "var(--text-secondary)" }}
          >
            <ChevronLeft size={16} />
            Back to sign in
          </a>

          {/* Icon */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 border"
            style={{
              background: "var(--pink-lighter)",
              borderColor: "var(--pink-border)",
            }}
          >
            <KeyRound size={22} style={{ color: "var(--pink)" }} />
          </div>

          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Forgot password?
          </h1>
          <p className="text-sm mt-1 mb-8" style={{ color: "var(--text-secondary)" }}>
            Enter your email and we&apos;ll send you a reset link.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full text-white font-medium py-3 rounded-xl text-sm transition-colors
                disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: "var(--pink)" }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Sending...
                </>
              ) : (
                "Send reset link"
              )}
            </button>
          </form>
        </motion.div>
      ) : (
        <motion.div
          key="sent"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          {/* Success icon */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 border"
            style={{
              background: "var(--success-bg)",
              borderColor: "var(--success-border)",
            }}
          >
            <MailCheck size={28} style={{ color: "var(--success-text)" }} />
          </div>

          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Check your inbox
          </h2>
          <p
            className="text-sm mt-2 mx-auto leading-relaxed"
            style={{ maxWidth: 300, color: "var(--text-secondary)" }}
          >
            We&apos;ve sent a reset link to{" "}
            <span className="font-medium" style={{ color: "var(--text-primary)" }}>
              {emailValue}
            </span>
            . It expires in 30 minutes.
          </p>

          <p className="text-sm mt-8" style={{ color: "var(--text-secondary)" }}>
            Didn&apos;t get it?{" "}
            <button
              type="button"
              onClick={() => setSent(false)}
              className="font-medium hover:underline"
              style={{ color: "var(--pink)" }}
            >
              Resend email
            </button>
          </p>

          <a
            href="/login"
            className="flex items-center justify-center gap-1.5 text-sm mt-4 hover:opacity-70 transition-opacity"
            style={{ color: "var(--text-secondary)" }}
          >
            <ChevronLeft size={15} />
            Back to sign in
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
