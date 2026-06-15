import type { ReactNode } from "react";
import Link from "next/link";
import { BriefcaseBusiness, Building2 } from "lucide-react";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { routes } from "@/lib/routes";

const NAV = [
  { label: "Jobs", href: `${routes.employerDashboard}#jobs` },
  { label: "Workforce Simulator", href: routes.employerSimulator },
  { label: "Workforce Planner", href: routes.employerActionEngine },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header
        className="flex-shrink-0 border-b border-[#F0EBF8] bg-white/95 backdrop-blur"
      >
        <div className="mx-auto flex min-h-20 max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex flex-wrap items-center gap-6 lg:gap-8">
            <Link href={routes.employerDashboard} className="text-xl font-bold text-[#E8197A]">
              Simploy
            </Link>

            <nav className="flex flex-wrap items-center gap-1 text-sm font-semibold text-[#6B7280]">
              {NAV.map((n) => (
                <Link
                  key={n.label}
                  href={n.href}
                  className="rounded-full px-4 py-2 transition-colors hover:bg-[#F8F5FC] hover:text-[#E8197A]"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={routes.home}
              className="inline-flex items-center gap-2 rounded-full border border-[#6B46C1] bg-white px-4 py-2 text-sm font-bold text-[#6B46C1] shadow-sm"
            >
              <Building2 size={16} />
              Switch Portal
            </Link>
            <Link
              href={`${routes.employerDashboard}#jobs`}
              className="inline-flex items-center gap-2 rounded-full bg-[#E8197A] px-4 py-2 text-sm font-bold text-white shadow-[0_8px_20px_rgba(232,25,122,0.22)]"
            >
              <BriefcaseBusiness size={16} />
              Post a Job
            </Link>
            <Link
              href={routes.employerSimulator}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1A1033] text-sm font-bold text-white"
              aria-label="Open Layer 2 workforce simulator"
            >
              L2
            </Link>
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
