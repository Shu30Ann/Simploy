"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  BriefcaseBusiness,
  Building2,
  ClipboardCheck,
  Compass,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { ProfileMenu } from "@/components/ProfileMenu";
import { BrandLogo } from "@/components/BrandLogo";
import { routes } from "@/lib/routes";

type EmployeeNavKey = "dashboard" | "career-gps" | "marketplace" | "applications" | "career-buddy" | "settings";

type EmployeeTopNavProps = {
  initials: string;
  name: string;
};

const navItems: Array<{
  key: EmployeeNavKey;
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}> = [
  { key: "dashboard", label: "Dashboard", href: routes.employeeDashboard, icon: LayoutDashboard },
  { key: "career-gps", label: "Career GPS", href: routes.employeeCareerGps, icon: Compass },
  { key: "marketplace", label: "Marketplace", href: routes.employeeMarketplace, icon: BriefcaseBusiness },
  { key: "applications", label: "Applications", href: routes.employeeApplications, icon: ClipboardCheck },
  { key: "career-buddy", label: "Career Buddy", href: routes.employeeCareerBuddy, icon: Bot },
  { key: "settings", label: "Settings", href: routes.employeeSettings, icon: Settings },
];

function activeKeyFor(pathname: string, hash: string): EmployeeNavKey | null {
  if (pathname === routes.employeeCareerGps) {
    return "career-gps";
  }

  if (pathname === routes.employeeDashboard) {
    if (hash === "#settings") return "settings";
    return "dashboard";
  }

  if (pathname === routes.employeeMarketplace) {
    return "marketplace";
  }

  if (pathname === routes.employeeApplications) {
    return "applications";
  }

  if (pathname === routes.employeeCareerBuddy) {
    return "career-buddy";
  }

  if (pathname === routes.employeeSettings) {
    return "settings";
  }

  return null;
}

export function EmployeeTopNav({ initials, name }: EmployeeTopNavProps) {
  const pathname = usePathname();
  const [hash, setHash] = useState("");

  useEffect(() => {
    const updateHash = () => setHash(window.location.hash);
    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, []);

  const activeKey = activeKeyFor(pathname, hash);

  return (
    <header className="border-b border-[#EAE3D3] bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:min-h-20 lg:justify-center lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-4">
            <BrandLogo imageClassName="h-14 w-auto" />
            <div className="flex shrink-0 items-center gap-3 lg:hidden">
              <Link
                href="/"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-[#DFD6BE] bg-white px-3 text-sm font-semibold text-[#17694F] shadow-sm"
              >
                <Building2 size={16} />
                Portal
              </Link>
              <ProfileMenu role="employee" initials={initials} name={name} label="Open employee profile menu" />
            </div>
          </div>

          <nav className="hidden items-center gap-1 text-sm font-semibold text-[#6B7280] lg:flex" aria-label="Employee navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.key === activeKey;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 transition ${
                    active ? "bg-[#F6F1E4] text-[#B08A44]" : "hover:bg-[#F7F3EA] hover:text-[#1E2A44]"
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-[#DFD6BE] bg-white px-4 py-2 text-sm font-semibold text-[#17694F] shadow-sm"
            >
              <Building2 size={16} />
              Switch Portal
            </Link>
            <ProfileMenu role="employee" initials={initials} name={name} label="Open employee profile menu" />
          </div>
        </div>

        <nav className="grid grid-cols-2 gap-2 text-sm font-semibold text-[#6B7280] sm:grid-cols-3 lg:hidden" aria-label="Employee mobile navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.key === activeKey;
            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center justify-center gap-2 rounded-lg border px-3 py-2 transition ${
                  active
                    ? "border-[#E3D8BC] bg-[#F6F1E4] text-[#B08A44]"
                    : "border-[#EAE3D3] bg-white hover:border-[#DFD6BE] hover:bg-[#F7F3EA]"
                }`}
              >
                <Icon size={16} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
