import type { ReactNode } from "react";
import Link from "next/link";

const NAV = [
  { label: "Dashboard",  href: "/employer/dashboard" },
  { label: "Analytics",  href: "/employer/analytics/simulator" },
  { label: "Jobs",       href: "#" },
  { label: "Team",       href: "#" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Top navbar */}
      <header
        className="flex-shrink-0 flex items-center justify-between px-6 border-b"
        style={{
          height: 56,
          background: "white",
          borderColor: "var(--border)",
        }}
      >
        {/* Logo */}
        <span className="text-lg font-bold" style={{ color: "var(--pink)" }}>Simploy</span>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV.map(n => (
            <Link
              key={n.label}
              href={n.href}
              className="text-sm transition-colors hover:opacity-80"
              style={{ color: "var(--text-secondary)" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        {/* User badge */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium hidden sm:block"
            style={{ color: "var(--text-secondary)" }}>
            Acme Corp
          </span>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: "var(--pink)" }}
          >
            AC
          </div>
        </div>
      </header>

      {/* Page content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
