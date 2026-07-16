"use client";

import { JobPostingTable } from "@/components/employer/JobPostingTable";
import { fallbackJobs, jobFromBackend, useEmployerDashboard } from "@/components/employer/shared";

export default function EmployerJobsPage() {
  const { dashboard, loadState } = useEmployerDashboard();
  const visibleJobs = dashboard?.jobs.length ? dashboard.jobs.map(jobFromBackend) : fallbackJobs;

  return (
    <main className="min-h-screen bg-[#F7F3EA] text-[#1E2A44]">
      {loadState === "loaded" && (
        <div className="border-b border-[#CBDFD4] bg-[#EFF5F0] px-4 py-3 text-center text-sm font-bold text-[#087C7E]">
          Jobs loaded from database for {dashboard?.company_name}.
        </div>
      )}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <JobPostingTable jobs={visibleJobs} />
        </div>
      </section>
    </main>
  );
}
