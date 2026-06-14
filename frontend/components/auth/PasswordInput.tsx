"use client";

import { useState } from "react";
import { Eye, EyeOff, Check } from "lucide-react";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { type UseFormRegister } from "react-hook-form";

const inputBase =
  "w-full px-4 py-3 rounded-xl border text-sm transition-all duration-150 focus:outline-none focus:ring-2";

const rules = (value: string) => [
  { label: "8+ characters",     met: value.length >= 8 },
  { label: "Uppercase letter",  met: /[A-Z]/.test(value) },
  { label: "Number",            met: /[0-9]/.test(value) },
  { label: "Special character", met: /[^a-zA-Z0-9]/.test(value) },
];

const strengthConfig: Record<number, { label: string; color: string }> = {
  0: { label: "",       color: "" },
  1: { label: "Weak",   color: "#EF4444" },
  2: { label: "Fair",   color: "#F59E0B" },
  3: { label: "Good",   color: "#06B6D4" },
  4: { label: "Strong", color: "#10B981" },
};

interface PasswordInputProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>;
  name: string;
  id?: string;
  watchedValue?: string;
  showStrength?: boolean;
  hasError?: boolean;
}

export default function PasswordInput({
  register,
  name,
  id,
  watchedValue = "",
  showStrength,
  hasError,
}: PasswordInputProps) {
  const [show, setShow] = useState(false);

  const ruleList = rules(watchedValue);
  const strength = ruleList.filter((r) => r.met).length;

  return (
    <div>
      <div className="relative">
        <input
          id={id ?? name}
          type={show ? "text" : "password"}
          placeholder="••••••••"
          className={inputBase}
          style={{
            borderColor: hasError ? "var(--input-border-error)" : "var(--input-border)",
            background: "var(--input-bg)",
            color: "var(--text-primary)",
          }}
          {...register(name)}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
          style={{ color: "var(--text-muted)" }}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {showStrength && watchedValue && (
        <div className="mt-2">
          <div className="flex gap-1 mb-2">
            {[1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className="h-1 flex-1 rounded-full transition-all duration-300"
                style={{
                  background:
                    strength >= level
                      ? strengthConfig[strength].color
                      : "var(--divider-color)",
                }}
              />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {ruleList.map((rule) => (
              <div key={rule.label} className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-full flex items-center justify-center"
                  style={{ background: rule.met ? "var(--teal)" : "var(--divider-color)" }}
                >
                  {rule.met && <Check size={8} color="white" strokeWidth={3} />}
                </div>
                <span
                  className="text-[11px]"
                  style={{ color: rule.met ? "var(--teal)" : "var(--text-muted)" }}
                >
                  {rule.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
