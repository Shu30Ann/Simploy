import { AlertCircle } from "lucide-react";
import type { FieldError } from "react-hook-form";

export default function FormError({ error }: { error?: FieldError }) {
  if (!error) return null;
  return (
    <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "var(--error-text)" }}>
      <AlertCircle size={12} />
      {error.message}
    </p>
  );
}
