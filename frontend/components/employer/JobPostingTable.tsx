"use client";

import { EllipsisVertical, FilePenLine } from "lucide-react";
import { Pill, toneStyles, type EmployerJobView } from "@/components/employer/shared";

export function JobPostingTable({ jobs }: { jobs: EmployerJobView[] }) {
  return (
    <section
      id="jobs"
      aria-labelledby="jobs-title"
      className="rounded-2xl border border-[#EAE3D3] bg-white p-5 shadow-[0_8px_48px_rgba(70,60,35,0.08)] sm:p-7"
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#B08A44]">Active Hiring Pipeline</p>
          <h2 id="jobs-title" className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Active Hiring Pipeline
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]">
            Track every live role, application flow, and matching signal from one focused queue.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Pill tone="pink">Hiring (8)</Pill>
          <Pill tone="purple">Draft (3)</Pill>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-separate border-spacing-0 text-left">
          <thead>
            <tr className="text-xs font-bold uppercase text-[#9CA3AF]">
              <th className="border-b border-[#EAE3D3] px-1 pb-3">Role Title</th>
              <th className="border-b border-[#EAE3D3] px-4 pb-3">Hiring Status</th>
              <th className="border-b border-[#EAE3D3] px-4 pb-3 text-center">Apps Received</th>
              <th className="border-b border-[#EAE3D3] px-4 pb-3">Matches</th>
              <th className="border-b border-[#EAE3D3] px-1 pb-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.title} className="align-middle">
                <td className="border-b border-[#F8F5FC] px-1 py-4">
                  <p className="font-bold">{job.title}</p>
                  <p className="mt-1 text-xs font-semibold text-[#9CA3AF]">
                    {job.department} - {job.workStyle}
                  </p>
                </td>
                <td className="border-b border-[#F8F5FC] px-4 py-4">
                  <Pill tone={job.hiringStatus === "Hiring" ? "pink" : "purple"}>{job.hiringStatus}</Pill>
                </td>
                <td className="border-b border-[#F8F5FC] px-4 py-4 text-center text-sm font-bold">
                  {job.appsReceived}
                </td>
                <td className="border-b border-[#F8F5FC] px-4 py-4">
                  {job.matches.length > 0 ? (
                    <div className="flex items-center">
                      {job.matches.map((match) => (
                        <span
                          key={`${job.title}-${match}`}
                          className={`-ml-1 first:ml-0 flex h-7 min-w-7 items-center justify-center rounded-full border-2 border-white px-1.5 text-[10px] font-bold ${toneStyles[job.matchTone]}`}
                        >
                          {match}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs font-semibold italic text-[#9CA3AF]">Pending post</span>
                  )}
                </td>
                <td className="border-b border-[#F8F5FC] px-1 py-4 text-right">
                  <button
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#6B46C1] hover:bg-[#F1EDE0]"
                    aria-label={job.hiringStatus === "Draft" ? `Edit ${job.title}` : `Open actions for ${job.title}`}
                  >
                    {job.hiringStatus === "Draft" ? <FilePenLine size={18} /> : <EllipsisVertical size={18} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
