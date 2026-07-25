"use client";

import { useState } from "react";
import { EllipsisVertical, FilePenLine, X } from "lucide-react";
import { Pill, toneStyles, type EmployerJobView } from "@/components/employer/shared";

export function JobPostingTable({ jobs }: { jobs: EmployerJobView[] }) {
  const [selectedJob, setSelectedJob] = useState<EmployerJobView | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const hiringCount = jobs.filter((job) => job.hiringStatus === "Hiring").length;
  const draftCount = jobs.filter((job) => job.hiringStatus === "Draft").length;

  return (
    <>
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
          <Pill tone="pink">Hiring ({hiringCount})</Pill>
          <Pill tone="purple">Draft ({draftCount})</Pill>
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
                <td className="border-b border-[#F7F3EA] px-1 py-4">
                  <p className="font-bold">{job.title}</p>
                  <p className="mt-1 text-xs font-semibold text-[#9CA3AF]">
                    {job.department} - {job.workStyle}
                  </p>
                </td>
                <td className="border-b border-[#F7F3EA] px-4 py-4">
                  <Pill tone={job.hiringStatus === "Hiring" ? "pink" : "purple"}>{job.hiringStatus}</Pill>
                </td>
                <td className="border-b border-[#F7F3EA] px-4 py-4 text-center text-sm font-bold">
                  {job.appsReceived}
                </td>
                <td className="border-b border-[#F7F3EA] px-4 py-4">
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
                <td className="border-b border-[#F7F3EA] px-1 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedJob(job);
                      setActionMessage(null);
                    }}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#17694F] hover:bg-[#F1EDE0]"
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

      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E2A44]/45 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-[0_24px_80px_rgba(26,16,51,0.28)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#B08A44]">
                  {selectedJob.hiringStatus === "Draft" ? "Draft job post" : "Hiring actions"}
                </p>
                <h3 className="mt-1 text-xl font-bold text-[#1E2A44]">{selectedJob.title}</h3>
                <p className="mt-2 text-sm font-semibold text-[#6B7280]">
                  {selectedJob.department} / {selectedJob.workStyle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedJob(null);
                  setActionMessage(null);
                }}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F7F3EA]"
                aria-label="Close job action preview"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 grid gap-3">
              {[
                ["Applications", selectedJob.appsReceived.toString()],
                ["Qualified matches", selectedJob.matches.length ? selectedJob.matches.join(", ") : "Pending"],
                ["Recommended next step", selectedJob.hiringStatus === "Draft" ? "Review draft and publish" : "Shortlist top matches"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-[#EAE3D3] bg-[#F7F3EA] p-3">
                  <p className="text-[10px] font-bold uppercase text-[#9CA3AF]">{label}</p>
                  <p className="mt-1 text-sm font-bold text-[#1E2A44]">{value}</p>
                </div>
              ))}
            </div>

            {actionMessage && (
              <div className="mt-4 rounded-lg border border-[#CBDFD4] bg-[#EFF5F0] px-4 py-3 text-sm font-bold text-[#17694F]">
                {actionMessage}
              </div>
            )}

            <button
              type="button"
              onClick={() =>
                setActionMessage(
                  selectedJob.hiringStatus === "Draft"
                    ? `${selectedJob.title} is ready for publish review.`
                    : `Shortlist preview opened for ${selectedJob.title}.`,
                )
              }
              className="mt-5 w-full rounded-lg bg-[#B08A44] px-4 py-3 text-sm font-bold text-white"
            >
              {selectedJob.hiringStatus === "Draft" ? "Preview Publish Flow" : "Preview Shortlist Flow"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
