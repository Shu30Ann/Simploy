import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  leftPanel: ReactNode;
}

export default function AuthLayout({ children, leftPanel }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — hidden on mobile */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-[#0B1526]">
        {/* Video background — CRT style, matches landing hero */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            filter:
              "sepia(0.3) hue-rotate(175deg) saturate(1.6) contrast(1.2) brightness(0.85)",
          }}
          src="/videos/busy_street.mp4"
        />
        {/* Blue tint */}
        <div className="absolute inset-0 bg-[#16345E]/35 mix-blend-multiply" />
        {/* CRT scanlines + vignette */}
        <div className="absolute inset-0 crt-scanlines" />
        <div className="absolute inset-0 crt-vignette" />
        {/* Dark scrim for text legibility */}
        <div className="absolute inset-0 bg-[#081022]/45" />

        <div className="relative z-10 w-full">{leftPanel}</div>
      </div>

      {/* Right panel */}
      <div className="w-full md:w-1/2 flex items-center justify-center min-h-screen bg-white px-8 py-12">
        <div className="w-full max-w-[420px]">{children}</div>
      </div>
    </div>
  );
}
