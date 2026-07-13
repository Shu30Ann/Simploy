import React from "react";

export default function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-3 text-xs font-mono font-semibold tracking-[0.25em] uppercase text-[#8B7434] mb-4">
      <span className="inline-block w-6 h-px bg-[#17694F]" aria-hidden />
      {children}
    </p>
  );
}
