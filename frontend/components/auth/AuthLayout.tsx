import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  leftPanel: ReactNode;
}

export default function AuthLayout({ children, leftPanel }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — hidden on mobile */}
      <div
        className="hidden md:flex md:w-1/2 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, var(--bg-pink-soft), var(--pink-lighter), var(--purple-light))",
        }}
      >
        {/* Background decoration */}
        <div
          className="absolute rounded-full"
          style={{
            top: -80,
            right: -80,
            width: 256,
            height: 256,
            background: "var(--pink)",
            opacity: 0.05,
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            bottom: -60,
            left: -60,
            width: 192,
            height: 192,
            background: "#a78bfa",
            opacity: 0.05,
          }}
        />
        <div className="relative z-10 w-full">{leftPanel}</div>
      </div>

      {/* Right panel */}
      <div className="w-full md:w-1/2 flex items-center justify-center min-h-screen bg-white px-8 py-12">
        <div className="w-full max-w-[420px]">{children}</div>
      </div>
    </div>
  );
}
