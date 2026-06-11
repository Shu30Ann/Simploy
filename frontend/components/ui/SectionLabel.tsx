import React from "react";

export default function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold tracking-widest uppercase text-[#E8197A] mb-3">
      {children}
    </p>
  );
}
