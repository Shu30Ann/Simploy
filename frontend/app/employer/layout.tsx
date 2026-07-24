import type { ReactNode } from "react";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { ProfileMenu } from "@/components/ProfileMenu";
import { routes } from "@/lib/routes";

const NAV = [
  { label: "Dashboard", href: routes.employerDashboard },
  { label: "Jobs", href: routes.employerJobs },
  { label: "Market Insight", href: routes.employerMarketInsight },
  { label: "Workforce Simulator", href: routes.employerSimulator },
  { label: "Workforce Planner", href: routes.employerActionEngine },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header
        className="flex-shrink-0 border-b border-[#EAE3D3] bg-white/95 backdrop-blur"
      >
        <div className="mx-auto flex min-h-20 max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex flex-wrap items-center gap-6 lg:gap-8">
            <Link href={routes.home} className="text-xl font-bold text-[#B08A44]">
              Simploy
            </Link>

            <nav className="flex flex-wrap items-center gap-1 text-sm font-semibold text-[#6B7280]">
              {NAV.map((n) => (
                <Link
                  key={n.label}
                  href={n.href}
                  className="rounded-full px-4 py-2 transition-colors hover:bg-[#F8F5FC] hover:text-[#B08A44]"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={routes.home}
              className="inline-flex items-center gap-2 rounded-full border border-[#EAE3D3] bg-white px-4 py-2 text-sm font-bold text-[#1E2A44] shadow-sm transition hover:bg-[#F8F5FC]"
            >
              <Building2 size={16} />
              Switch Portal
            </Link>
            <Link
              href={routes.employerSimulator}
              className="hidden h-10 items-center justify-center rounded-full border border-[#EAE3D3] bg-white px-4 text-sm font-bold text-[#1E2A44] shadow-sm transition hover:bg-[#F8F5FC] sm:inline-flex"
              aria-label="Open Layer 2 workforce simulator"
            >
              L2
            </Link>
            <ProfileMenu role="employer" initials="HR" name="Hiring Team" label="Open employer profile menu" />
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {children}
      </div>

      <ChatWidget
        title="Hiring Advisor"
        assistantName="Maya"
        intro="Hi, I am Maya, your hiring advisor. Ask me about job posts, candidate matches, workforce planning, or hiring priorities."
        placeholder="Ask Maya about hiring..."
        quickPrompts={["Review applicants", "Improve a job post", "Plan workforce gaps"]}
      />
    </div>
  );
}
