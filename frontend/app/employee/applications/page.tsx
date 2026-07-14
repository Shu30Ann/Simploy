"use client";

import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  Search,
  Send,
} from "lucide-react";
import { EmployeeTopNav } from "@/components/employee/EmployeeTopNav";
import { getAuthToken, getJson } from "@/lib/api";
import type { BackendApplication } from "@/lib/backendTypes";
import { demoApplicationTimeline } from "@/lib/mock-data";

const applications = [
  ...demoApplicationTimeline.map((application) => ({
    title: application.title,
    company: `External - ${application.company}`,
    status:
      application.status === "submitted" ? "Applied" :
      application.status === "reviewed" ? "Reviewed" :
      application.status === "shortlisted" ? "Shortlisted" :
      application.status === "interviewing" ? "Interviewing" : application.status,
    date: application.dateLabel,
    type: "External",
    accent: application.matchScore >= 88 ? "green" : application.matchScore >= 84 ? "teal" : "pink",
  })),
];

type ApplicationView = (typeof applications)[number];

function applicationFromBackend(application: BackendApplication): ApplicationView {
  return {
    title: application.job_title,
    company: application.company_name ? `External - ${application.company_name}` : "External",
    status: application.status === "submitted" ? "Applied" : application.status,
    date: `Submitted ${new Date(application.created_at).toLocaleDateString()}`,
    type: "External",
    accent: application.match_score >= 80 ? "green" : application.match_score >= 65 ? "teal" : "pink",
  };
}

const toneStyles: Record<string, string> = {
  pink: "bg-[#F6F1E4] text-[#B08A44] border-[#E3D8BC]",
  teal: "bg-[#E7F0E9] text-[#114F3B] border-[#CBDFD4]",
  green: "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]",
};

function Pill({ children, tone = "pink" }: { children: React.ReactNode; tone?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${toneStyles[tone]}`}
    >
      {children}
    </span>
  );
}

export default function EmployeeApplicationsPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationView | null>(null);
  const [dbApplications, setDbApplications] = useState<ApplicationView[] | null>(null);

  useEffect(() => {
    if (!getAuthToken()) return;
    getJson<BackendApplication[]>("/applications/me", { auth: true })
      .then((items) => setDbApplications(items.map(applicationFromBackend)))
      .catch(() => setDbApplications(null));
  }, []);

  const visibleApplications = dbApplications?.length ? dbApplications : applications;
  const filteredApplications = visibleApplications.filter((application) => {
    if (activeFilter === "All") return true;
    return application.type === activeFilter || application.status === activeFilter;
  });

  return (
    <main className="min-h-screen bg-[#F7F3EA] text-[#1E2A44]">
      <EmployeeTopNav initials="A" name="Alex" />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#E3D8BC] bg-[#F6F1E4] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#B08A44]">
              <ClipboardCheck size={14} />
              Submitted opportunities
            </div>
            <h1 className="text-3xl font-bold sm:text-4xl">Applications</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]">
              Track submitted internal gigs and external roles from one focused workspace.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              ["Total", visibleApplications.length.toString()],
              ["Active", visibleApplications.filter((application) => application.status !== "Rejected").length.toString()],
              ["Next step", "Jun 18"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-[#EAE3D3] bg-white px-4 py-3 shadow-[0_4px_24px_rgba(70,60,35,0.08)]">
                <p className="text-xs font-semibold uppercase text-[#9CA3AF]">{label}</p>
                <p className="mt-1 text-xl font-bold text-[#1E2A44]">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-lg border border-[#EAE3D3] bg-white p-3 shadow-[0_4px_24px_rgba(70,60,35,0.08)] lg:flex-row">
          <label className="flex min-h-12 flex-1 items-center gap-3 rounded-lg bg-[#F7F3EA] px-4 text-sm text-[#9CA3AF]">
            <Search size={18} />
            <input
              className="w-full bg-transparent text-[#1E2A44] outline-none placeholder:text-[#9CA3AF]"
              placeholder="Search applications..."
            />
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex">
            {["All", "Internal", "External", "Interviewing"].map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${
                  activeFilter === filter ? "bg-[#17694F] text-white" : "bg-[#F8F5FC] text-[#6B7280] hover:bg-[#EFF5F0]"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 rounded-lg border border-[#CBDFD4] bg-[#EFF5F0] px-4 py-3 text-sm font-semibold text-[#114F3B]">
          Showing {filteredApplications.length} {activeFilter === "All" ? "applications" : activeFilter.toLowerCase() + " applications"}.
        </div>

        <section
          aria-labelledby="applications-title"
          className="mt-8 rounded-lg border border-[#EAE3D3] bg-white p-5 shadow-[0_4px_24px_rgba(70,60,35,0.08)]"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 id="applications-title" className="flex items-center gap-2 text-xl font-bold">
              <Send size={20} className="text-[#6B46C1]" />
              Submitted Job Opportunities
            </h2>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsExportOpen((value) => !value)}
                className="text-sm font-bold text-[#114F3B]"
                aria-expanded={isExportOpen}
              >
                Export
              </button>
              {isExportOpen && (
                <div className="absolute right-0 top-8 z-20 w-64 rounded-lg border border-[#EAE3D3] bg-white p-4 text-sm shadow-[0_16px_44px_rgba(26,16,51,0.14)]">
                  <p className="font-bold text-[#1E2A44]">Export preview ready</p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-[#6B7280]">
                    This would export {filteredApplications.length} visible application records.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsExportOpen(false)}
                    className="mt-3 rounded-lg bg-[#1E2A44] px-3 py-2 text-xs font-bold text-white"
                  >
                    Got it
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {filteredApplications.map((application) => (
              <article
                key={application.title}
                className="flex flex-col gap-4 rounded-lg bg-[#F7F3EA] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-lg border ${toneStyles[application.accent]}`}
                  >
                    <BriefcaseBusiness size={18} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold">{application.title}</p>
                      <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-[#6B7280]">
                        {application.type}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[#6B7280]">{application.company}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4 sm:justify-end">
                  <Pill tone={application.accent}>{application.status}</Pill>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#9CA3AF]">
                    <CalendarDays size={13} />
                    {application.date}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedApplication(application)}
                    aria-label={`Open ${application.title}`}
                    className="rounded-full p-1 text-[#9CA3AF] hover:bg-white"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>

      {selectedApplication && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E2A44]/45 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="application-popup-title"
        >
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-[0_24px_80px_rgba(26,16,51,0.28)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#114F3B]">{selectedApplication.type}</p>
                <h3 id="application-popup-title" className="mt-1 text-xl font-bold text-[#1E2A44]">
                  {selectedApplication.title}
                </h3>
                <p className="mt-2 text-sm font-semibold text-[#6B7280]">{selectedApplication.company}</p>
              </div>
              <Pill tone={selectedApplication.accent}>{selectedApplication.status}</Pill>
            </div>
            <div className="mt-5 rounded-lg border border-[#EAE3D3] bg-[#F7F3EA] p-4">
              <p className="text-xs font-bold uppercase text-[#9CA3AF]">Next update</p>
              <p className="mt-2 flex items-center gap-2 text-sm font-bold text-[#1E2A44]">
                <CalendarDays size={15} className="text-[#B08A44]" />
                {selectedApplication.date}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedApplication(null)}
              className="mt-5 w-full rounded-lg bg-[#1E2A44] px-4 py-3 text-sm font-bold text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
