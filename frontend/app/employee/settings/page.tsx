"use client";

import { Settings, ShieldCheck, SlidersHorizontal, Target } from "lucide-react";
import CareerNorthStarPanel from "@/components/career-gps/CareerNorthStarPanel";
import { EmployeeTopNav } from "@/components/employee/EmployeeTopNav";
import { routes } from "@/lib/routes";
import Link from "next/link";

export default function EmployeeSettingsPage() {
  return (
    <main className="min-h-screen bg-[#F7F3EA] text-[#1E2A44]">
      <EmployeeTopNav initials="A" name="Alex" />

      <section className="border-b border-[#EAE3D3] bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-7 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-8">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-[#E7F0E9] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#17694F]">
              <Settings size={14} />
              Employee settings
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Career goals and preferences</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#6B7280]">
              This is where your destination, priorities, lifestyle preferences, constraints, and financial targets are
              edited. The dashboard only summarizes these settings.
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Link
                href={routes.employeeDashboard}
                className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#DFD6BE] bg-white px-4 text-sm font-bold text-[#17694F] outline-none transition hover:border-[#B08A44] hover:text-[#B08A44] focus-visible:ring-2 focus-visible:ring-[#B08A44] focus-visible:ring-offset-2"
              >
                Back to dashboard
              </Link>
              <Link
                href={routes.employeeCareerGps}
                className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#1E2A44] px-4 text-sm font-bold text-white outline-none transition hover:bg-[#16233C] focus-visible:ring-2 focus-visible:ring-[#B08A44] focus-visible:ring-offset-2"
              >
                View Career GPS
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              { label: "Goal", value: "Target role", icon: Target },
              { label: "Priorities", value: "Lifestyle fit", icon: SlidersHorizontal },
              { label: "Constraints", value: "Non-negotiables", icon: ShieldCheck },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-lg border border-[#EAE3D3] bg-[#FFFFFF] p-4 shadow-[0_4px_18px_rgba(26,16,51,0.04)]">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#17694F]">
                      <Icon size={18} />
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-[#8B7434]">{item.label}</p>
                      <p className="mt-1 text-sm font-bold text-[#1E2A44]">{item.value}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-[#EAE3D3] bg-white p-3 shadow-[0_6px_24px_rgba(26,16,51,0.05)] sm:p-4">
          <CareerNorthStarPanel />
        </div>
      </section>
    </main>
  );
}
