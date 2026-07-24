"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowRight, BriefcaseBusiness, ClipboardList, Loader2, Plus, X } from "lucide-react";
import { JobPostingTable } from "@/components/employer/JobPostingTable";
import { fallbackJobs, jobFromBackend, useEmployerDashboard } from "@/components/employer/shared";
import { getAuthToken, postJson } from "@/lib/api";
import type { BackendJob } from "@/lib/backendTypes";
import type { HiringPlanDraft, WorkStyle } from "@/lib/mock-data";

const HIRING_PLAN_KEY = "simploy-employer-hiring-plan";
const LOCAL_POSTED_JOBS_KEY = "simploy-employer-posted-jobs";

type HiringPlanContext = {
  createdAt: string;
  draft: HiringPlanDraft;
  sourceAction: string;
};

type JobPostForm = {
  title: string;
  department: string;
  workStyle: WorkStyle;
  location: string;
  employmentType: string;
  status: "draft" | "open";
  salaryMin: string;
  salaryMax: string;
  requiredSkills: string;
  description: string;
};

const INITIAL_JOB_FORM: JobPostForm = {
  title: "",
  department: "",
  workStyle: "Hybrid",
  location: "",
  employmentType: "Full-time",
  status: "draft",
  salaryMin: "",
  salaryMax: "",
  requiredSkills: "",
  description: "",
};

export default function EmployerJobsPage() {
  const { dashboard, loadState } = useEmployerDashboard();
  const [hiringPlan, setHiringPlan] = useState<HiringPlanContext | null>(null);
  const [draftMessage, setDraftMessage] = useState<string | null>(null);
  const [postedJobs, setPostedJobs] = useState(() => fallbackJobs.slice(0, 0));
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [jobForm, setJobForm] = useState<JobPostForm>(INITIAL_JOB_FORM);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof JobPostForm, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postMessage, setPostMessage] = useState<string | null>(null);
  const baseJobs = dashboard?.jobs.length ? dashboard.jobs.map(jobFromBackend) : fallbackJobs;
  const visibleJobs = useMemo(() => [...postedJobs, ...baseJobs], [baseJobs, postedJobs]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(HIRING_PLAN_KEY);
      if (raw) {
        setHiringPlan(JSON.parse(raw) as HiringPlanContext);
      }
    } catch {
      setHiringPlan(null);
    }
  }, []);

  useEffect(() => {
    if (getAuthToken()) {
      setPostedJobs([]);
      return;
    }
    try {
      const raw = window.localStorage.getItem(LOCAL_POSTED_JOBS_KEY);
      if (raw) {
        setPostedJobs(JSON.parse(raw));
      }
    } catch {
      setPostedJobs([]);
    }
  }, []);

  const updateForm = (key: keyof JobPostForm, value: string) => {
    setJobForm((current) => ({ ...current, [key]: value }));
    setFormErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validateForm = () => {
    const errors: Partial<Record<keyof JobPostForm, string>> = {};
    if (!jobForm.title.trim()) errors.title = "Job title is required.";
    if (!jobForm.department.trim()) errors.department = "Department is required.";
    if (!jobForm.location.trim()) errors.location = "Location is required.";
    if (!jobForm.description.trim()) errors.description = "Description is required.";
    if (!jobForm.requiredSkills.trim()) errors.requiredSkills = "Add at least one required skill.";
    const salaryMin = jobForm.salaryMin ? Number(jobForm.salaryMin) : null;
    const salaryMax = jobForm.salaryMax ? Number(jobForm.salaryMax) : null;
    if (salaryMin !== null && Number.isNaN(salaryMin)) errors.salaryMin = "Use a number.";
    if (salaryMax !== null && Number.isNaN(salaryMax)) errors.salaryMax = "Use a number.";
    if (salaryMin !== null && salaryMax !== null && salaryMax < salaryMin) {
      errors.salaryMax = "Maximum salary must be higher than minimum.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const persistPostedJobs = (jobs: typeof postedJobs) => {
    setPostedJobs(jobs);
    window.localStorage.setItem(LOCAL_POSTED_JOBS_KEY, JSON.stringify(jobs));
  };

  const handleSubmitJob = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const requiredSkills = jobForm.requiredSkills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
    const salaryMin = jobForm.salaryMin ? Number(jobForm.salaryMin) : null;
    const salaryMax = jobForm.salaryMax ? Number(jobForm.salaryMax) : null;
    const payload = {
      title: jobForm.title.trim(),
      department_name: jobForm.department.trim(),
      work_style: jobForm.workStyle,
      location: jobForm.location.trim(),
      status: jobForm.status,
      salary_min: salaryMin,
      salary_max: salaryMax,
      required_skills: requiredSkills,
      description: `${jobForm.description.trim()}\n\nEmployment type: ${jobForm.employmentType}`,
    };

    try {
      let nextJob;
      if (getAuthToken()) {
        const createdJob = await postJson<BackendJob, typeof payload>("/jobs", payload, { auth: true });
        nextJob = jobFromBackend(createdJob);
        setPostedJobs([nextJob, ...postedJobs]);
      } else {
        nextJob = {
          title: payload.title,
          department: payload.department_name,
          workStyle: payload.work_style,
          hiringStatus: payload.status === "open" ? "Hiring" : "Draft",
          appsReceived: 0,
          matches: [],
          matchTone: payload.status === "open" ? "pink" : "purple",
        };
        persistPostedJobs([nextJob, ...postedJobs]);
      }
      setPostMessage(`${payload.title} was saved as ${payload.status === "open" ? "an active hiring post" : "a draft"}.`);
      setJobForm(INITIAL_JOB_FORM);
      setIsPostModalOpen(false);
    } catch (error) {
      setPostMessage(error instanceof Error ? error.message : "Unable to create this job post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F3EA] text-[#1E2A44]">
      {loadState === "loaded" && (
        <div className="border-b border-[#CBDFD4] bg-[#EFF5F0] px-4 py-3 text-center text-sm font-bold text-[#087C7E]">
          Jobs loaded from database for {dashboard?.company_name}.
        </div>
      )}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-[#EAE3D3] bg-white p-5 shadow-[0_8px_28px_rgba(70,60,35,0.08)] sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#F6F1E4] text-[#B08A44]">
                <BriefcaseBusiness size={20} />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#B08A44]">Jobs workspace</p>
                <h1 className="mt-1 text-2xl font-bold text-[#1E2A44]">Manage job posts</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5D6470]">
                  Create a draft, publish an active hiring post, and track the candidate flow from this page.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setPostMessage(null);
                setIsPostModalOpen(true);
              }}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#B08A44] px-5 text-sm font-bold text-white transition-colors hover:bg-[#97742F]"
            >
              <Plus size={16} />
              Post a Job
            </button>
          </div>

          {postMessage && (
            <div className="mb-6 rounded-lg border border-[#CBDFD4] bg-[#EFF5F0] px-4 py-3 text-sm font-bold text-[#087C7E]">
              {postMessage}
            </div>
          )}

          {hiringPlan && (
            <section className="mb-6 rounded-2xl border border-[#E3D8BC] bg-white p-5 shadow-[0_8px_28px_rgba(70,60,35,0.08)]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#F6F1E4] text-[#B08A44]">
                    <ClipboardList size={20} />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-[#B08A44]">Hiring plan draft</p>
                    <h1 className="mt-1 text-2xl font-bold text-[#1E2A44]">{hiringPlan.draft.role}</h1>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5D6470]">
                      Created from {hiringPlan.sourceAction}. Target {hiringPlan.draft.targetHires} hires by {hiringPlan.draft.targetStart} with {hiringPlan.draft.budget} budget.
                    </p>
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[430px]">
                  {[
                    ["Priority", hiringPlan.draft.priority],
                    ["Channels", hiringPlan.draft.channels.slice(0, 2).join(", ")],
                    ["Metric", hiringPlan.draft.successMetric],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg bg-[#F7F3EA] p-3">
                      <p className="text-[10px] font-bold uppercase text-[#9CA3AF]">{label}</p>
                      <p className="mt-1 line-clamp-2 text-xs font-bold leading-5 text-[#1E2A44]">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDraftMessage(`Draft job post prepared for ${hiringPlan.draft.role}. Hiring team can review and publish next.`)}
                className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#B08A44] px-4 text-sm font-bold text-white"
              >
                Convert Draft to Job Post
                <ArrowRight size={15} />
              </button>
              {draftMessage && (
                <div className="mt-3 rounded-lg border border-[#CBDFD4] bg-[#EFF5F0] px-4 py-3 text-sm font-bold text-[#087C7E]">
                  {draftMessage}
                </div>
              )}
            </section>
          )}
          <JobPostingTable jobs={visibleJobs} />
        </div>
      </section>

      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E2A44]/45 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="post-job-title">
          <form onSubmit={handleSubmitJob} className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 shadow-[0_24px_80px_rgba(26,16,51,0.28)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#B08A44]">Create role</p>
                <h2 id="post-job-title" className="mt-1 text-2xl font-bold text-[#1E2A44]">Post a Job</h2>
                <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                  Save the role as a draft or open it immediately for candidates.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPostModalOpen(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F7F3EA]"
                aria-label="Close post a job form"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Job title" error={formErrors.title}>
                <input value={jobForm.title} onChange={(event) => updateForm("title", event.target.value)} className="form-input" placeholder="Senior Maintenance Technician" />
              </Field>
              <Field label="Department" error={formErrors.department}>
                <input value={jobForm.department} onChange={(event) => updateForm("department", event.target.value)} className="form-input" placeholder="Manufacturing" />
              </Field>
              <Field label="Work style">
                <select value={jobForm.workStyle} onChange={(event) => updateForm("workStyle", event.target.value)} className="form-input">
                  <option>On-site</option>
                  <option>Hybrid</option>
                  <option>Remote</option>
                </select>
              </Field>
              <Field label="Location" error={formErrors.location}>
                <input value={jobForm.location} onChange={(event) => updateForm("location", event.target.value)} className="form-input" placeholder="Penang, Malaysia" />
              </Field>
              <Field label="Employment type">
                <select value={jobForm.employmentType} onChange={(event) => updateForm("employmentType", event.target.value)} className="form-input">
                  <option>Full-time</option>
                  <option>Contract</option>
                  <option>Part-time</option>
                  <option>Internship</option>
                </select>
              </Field>
              <Field label="Status">
                <select value={jobForm.status} onChange={(event) => updateForm("status", event.target.value)} className="form-input">
                  <option value="draft">Draft</option>
                  <option value="open">Hiring</option>
                </select>
              </Field>
              <Field label="Salary minimum" error={formErrors.salaryMin}>
                <input value={jobForm.salaryMin} onChange={(event) => updateForm("salaryMin", event.target.value)} className="form-input" inputMode="numeric" placeholder="4500" />
              </Field>
              <Field label="Salary maximum" error={formErrors.salaryMax}>
                <input value={jobForm.salaryMax} onChange={(event) => updateForm("salaryMax", event.target.value)} className="form-input" inputMode="numeric" placeholder="6800" />
              </Field>
              <Field label="Required skills" error={formErrors.requiredSkills} wide>
                <input value={jobForm.requiredSkills} onChange={(event) => updateForm("requiredSkills", event.target.value)} className="form-input" placeholder="PLC troubleshooting, preventive maintenance, safety audits" />
              </Field>
              <Field label="Description" error={formErrors.description} wide>
                <textarea value={jobForm.description} onChange={(event) => updateForm("description", event.target.value)} className="form-input min-h-28 resize-y" placeholder="Describe the role, responsibilities, and success outcomes." />
              </Field>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsPostModalOpen(false)}
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#EAE3D3] px-5 text-sm font-bold text-[#6B7280] hover:bg-[#F7F3EA]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#B08A44] px-5 text-sm font-bold text-white transition-colors hover:bg-[#97742F] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                Save Job Post
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}

function Field({
  label,
  error,
  wide = false,
  children,
}: {
  label: string;
  error?: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${wide ? "sm:col-span-2" : ""}`}>
      <span className="text-xs font-bold uppercase tracking-wide text-[#6B7280]">{label}</span>
      <div className="mt-1">{children}</div>
      {error && <span className="mt-1 block text-xs font-bold text-[#B42318]">{error}</span>}
    </label>
  );
}
