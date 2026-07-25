"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  Loader2,
  Pencil,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  Target,
  WalletCards,
} from "lucide-react";
import { getAuthToken, getJson, putJson } from "@/lib/api";
import type {
  CareerGpsConstraintPayload,
  CareerGpsConstraintsPayload,
  CareerGpsGoals,
  CareerGpsGoalsPayload,
  CareerGpsLifestylePriorities,
  CareerGpsLifestylePrioritiesPayload,
  CareerGpsNorthStarSummary,
  CareerGpsOnboardingProgress,
  CareerGpsOnboardingProgressPayload,
  CareerGpsProfile,
  CareerGpsRiskTolerance,
} from "@/lib/backendTypes";

const steps = [
  { id: "current_situation", label: "Current situation", icon: Compass },
  { id: "career_ambition", label: "Career ambition", icon: Target },
  { id: "lifestyle_priorities", label: "Lifestyle priorities", icon: SlidersHorizontal },
  { id: "constraints", label: "Constraints", icon: ShieldCheck },
  { id: "financial_targets", label: "Financial targets", icon: WalletCards },
  { id: "review", label: "Review and save", icon: CheckCircle2 },
] as const;

const priorityOptions = [
  { key: "income", label: "Income growth" },
  { key: "work_life_balance", label: "Work-life balance" },
  { key: "leadership", label: "Leadership track" },
  { key: "job_security", label: "Job security" },
  { key: "remote_work", label: "Remote work" },
] as const;

const workStyleOptions = ["Remote", "Hybrid", "On-site", "Flexible"];
const companyTypeOptions = ["Startup", "Scale-up", "Enterprise", "Government", "Non-profit"];
const constraintTypeOptions = ["location", "time", "family", "health", "visa", "financial", "other"];

type StepId = (typeof steps)[number]["id"];
type PriorityKey = (typeof priorityOptions)[number]["key"];

interface DraftConstraint {
  clientId: string;
  constraint_type: string;
  label: string;
  is_blocking: boolean;
}

interface CareerNorthStarFormState {
  career_ambition: string;
  target_role: string;
  target_industry: string;
  target_retirement_age: string;
  target_timeline_months: string;
  motivation: string;
  income_priority: number;
  work_life_balance_priority: number;
  leadership_priority: number;
  job_security_priority: number;
  remote_work_priority: number;
  international_mobility: boolean;
  risk_tolerance: CareerGpsRiskTolerance;
  learning_budget: string;
  preferred_company_type: string;
  willing_to_relocate: boolean;
  preferred_locations_text: string;
  preferred_work_styles: string[];
  top_two_non_negotiable_priorities: PriorityKey[];
  constraints: DraftConstraint[];
}

const defaultForm: CareerNorthStarFormState = {
  career_ambition: "",
  target_role: "",
  target_industry: "",
  target_retirement_age: "",
  target_timeline_months: "",
  motivation: "",
  income_priority: 50,
  work_life_balance_priority: 50,
  leadership_priority: 50,
  job_security_priority: 50,
  remote_work_priority: 50,
  international_mobility: false,
  risk_tolerance: "moderate",
  learning_budget: "",
  preferred_company_type: "",
  willing_to_relocate: false,
  preferred_locations_text: "",
  preferred_work_styles: [],
  top_two_non_negotiable_priorities: [],
  constraints: [],
};

function stepIndexFromId(stepId: string | null | undefined) {
  const index = steps.findIndex((step) => step.id === stepId);
  return index >= 0 ? index : 0;
}

function textOrEmpty(value: string | null | undefined) {
  return value ?? "";
}

function nullableText(value: string) {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function nullableInt(value: string) {
  const trimmed = value.trim();
  return trimmed.length ? Number.parseInt(trimmed, 10) : null;
}

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item, index, list) => list.indexOf(item) === index);
}

function formatPriorityLabel(value: string) {
  const option = priorityOptions.find((item) => item.key === value);
  return option?.label ?? value.replace(/_/g, " ");
}

function formFromProfile(profile: CareerGpsProfile): CareerNorthStarFormState {
  const { goals, lifestyle_priorities: lifestyle } = profile;
  return {
    career_ambition: textOrEmpty(goals.career_ambition),
    target_role: textOrEmpty(goals.target_role),
    target_industry: textOrEmpty(goals.target_industry),
    target_retirement_age: goals.target_retirement_age ? String(goals.target_retirement_age) : "",
    target_timeline_months: goals.target_timeline_months ? String(goals.target_timeline_months) : "",
    motivation: textOrEmpty(goals.motivation),
    income_priority: lifestyle.income_priority,
    work_life_balance_priority: lifestyle.work_life_balance_priority,
    leadership_priority: lifestyle.leadership_priority,
    job_security_priority: lifestyle.job_security_priority,
    remote_work_priority: lifestyle.remote_work_priority,
    international_mobility: lifestyle.international_mobility,
    risk_tolerance: lifestyle.risk_tolerance,
    learning_budget: lifestyle.learning_budget === null ? "" : String(lifestyle.learning_budget),
    preferred_company_type: textOrEmpty(lifestyle.preferred_company_type),
    willing_to_relocate: lifestyle.willing_to_relocate,
    preferred_locations_text: lifestyle.preferred_locations.join(", "),
    preferred_work_styles: lifestyle.preferred_work_styles,
    top_two_non_negotiable_priorities: lifestyle.top_two_non_negotiable_priorities
      .filter((item): item is PriorityKey => priorityOptions.some((option) => option.key === item))
      .slice(0, 2),
    constraints: profile.constraints.map((constraint, index) => ({
      clientId: `${constraint.id ?? "new"}-${index}`,
      constraint_type: constraint.constraint_type,
      label: constraint.label,
      is_blocking: constraint.is_blocking,
    })),
  };
}

function goalsPayload(form: CareerNorthStarFormState): CareerGpsGoalsPayload {
  return {
    career_ambition: nullableText(form.career_ambition),
    target_role: nullableText(form.target_role),
    target_industry: nullableText(form.target_industry),
    target_retirement_age: nullableInt(form.target_retirement_age),
    target_timeline_months: nullableInt(form.target_timeline_months),
    motivation: nullableText(form.motivation),
  };
}

function lifestylePayload(form: CareerNorthStarFormState): CareerGpsLifestylePrioritiesPayload {
  return {
    income_priority: form.income_priority,
    work_life_balance_priority: form.work_life_balance_priority,
    leadership_priority: form.leadership_priority,
    job_security_priority: form.job_security_priority,
    remote_work_priority: form.remote_work_priority,
    international_mobility: form.international_mobility,
    risk_tolerance: form.risk_tolerance,
    learning_budget: nullableInt(form.learning_budget),
    preferred_company_type: nullableText(form.preferred_company_type),
    willing_to_relocate: form.willing_to_relocate,
    preferred_locations: splitList(form.preferred_locations_text).slice(0, 12),
    preferred_work_styles: form.preferred_work_styles,
    top_two_non_negotiable_priorities: form.top_two_non_negotiable_priorities,
  };
}

function constraintsPayload(form: CareerNorthStarFormState): CareerGpsConstraintsPayload {
  return {
    constraints: form.constraints
      .filter((constraint) => constraint.label.trim())
      .map((constraint): CareerGpsConstraintPayload => ({
        constraint_type: constraint.constraint_type,
        label: constraint.label.trim(),
        value: {},
        is_blocking: constraint.is_blocking,
      })),
  };
}

function summaryPriorityEntries(summary: CareerGpsNorthStarSummary) {
  return [
    { key: "income", label: "Income", value: summary.income_priority },
    { key: "work_life_balance", label: "Work-life", value: summary.work_life_balance_priority },
    { key: "leadership", label: "Leadership", value: summary.leadership_priority },
    { key: "job_security", label: "Security", value: summary.job_security_priority },
    { key: "remote_work", label: "Remote", value: summary.remote_work_priority },
  ].sort((a, b) => b.value - a.value);
}

function fieldClass(hasError = false) {
  return `mt-2 w-full rounded-lg border bg-white px-3 py-2.5 text-sm font-semibold text-[#1E2A44] outline-none transition placeholder:text-[#9CA3AF] ${
    hasError ? "border-[#FCA5A5] focus:border-[#DC2626]" : "border-[#DFD6BE] focus:border-[#B08A44]"
  }`;
}

function AlertMessage({ tone, children }: { tone: "error" | "success"; children: React.ReactNode }) {
  const styles =
    tone === "success"
      ? "border-[#CBDFD4] bg-[#EFF5F0] text-[#17694F]"
      : "border-[#FECACA] bg-[#FFF5F5] text-[#DC2626]";
  return (
    <div className={`flex items-start gap-2 rounded-lg border px-4 py-3 text-sm font-bold ${styles}`}>
      {tone === "success" ? <CheckCircle2 size={17} className="mt-0.5 shrink-0" /> : <AlertCircle size={17} className="mt-0.5 shrink-0" />}
      <span>{children}</span>
    </div>
  );
}

function StepBadge({
  step,
  index,
  active,
  complete,
  onClick,
}: {
  step: (typeof steps)[number];
  index: number;
  active: boolean;
  complete: boolean;
  onClick: () => void;
}) {
  const Icon = step.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-16 items-center gap-3 rounded-lg border px-3 py-3 text-left transition ${
        active
          ? "border-[#B08A44] bg-[#F6F1E4] text-[#B08A44]"
          : complete
            ? "border-[#CBDFD4] bg-[#EFF5F0] text-[#114F3B]"
            : "border-[#EAE3D3] bg-white text-[#6B7280] hover:border-[#DFD6BE]"
      }`}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">
        {complete ? <CheckCircle2 size={18} /> : <Icon size={18} />}
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-bold uppercase text-[#9CA3AF]">Step {index + 1}</span>
        <span className="block text-sm font-bold leading-5">{step.label}</span>
      </span>
    </button>
  );
}

function SummaryCard({
  profile,
  onEdit,
}: {
  profile: CareerGpsProfile;
  onEdit: () => void;
}) {
  const summary = profile.north_star;
  const constraints = profile.constraints;
  const topPriorityLabels = summary.top_two_non_negotiable_priorities.length
    ? summary.top_two_non_negotiable_priorities.map(formatPriorityLabel)
    : summaryPriorityEntries(summary)
        .slice(0, 2)
        .map((item) => item.label);
  const completionLabel = summary.is_onboarding_complete
    ? "Complete"
    : `${Math.max(0, steps.length - summary.missing_sections.length)}/${steps.length} setup areas ready`;

  return (
    <section
      id="career-north-star"
      aria-labelledby="career-north-star-title"
      className="rounded-lg border border-[#CBDFD4] bg-white p-5 shadow-[0_4px_24px_rgba(232,25,122,0.08)]"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-[#CBDFD4] bg-[#E7F0E9] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#114F3B]">
            <Compass size={14} />
            Career GPS
          </p>
          <h2 id="career-north-star-title" className="mt-3 text-2xl font-bold text-[#1E2A44]">
            Career North Star
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]">
            Your saved direction for Career GPS personalization. Roadmaps and scoring are intentionally not generated in this phase.
          </p>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#DFD6BE] bg-white px-4 py-2.5 text-sm font-bold text-[#17694F] hover:bg-[#F7F3EA]"
        >
          <Pencil size={16} />
          Edit North Star
        </button>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-lg border border-[#EAE3D3] bg-[#FFFFFF] p-4 xl:col-span-2">
          <p className="text-xs font-bold uppercase text-[#9CA3AF]">Main goal</p>
          <p className="mt-2 text-lg font-bold text-[#1E2A44]">
            {summary.career_ambition ?? "Define your main career goal"}
          </p>
          {summary.target_industry && (
            <p className="mt-2 text-sm font-semibold text-[#6B7280]">Target industry: {summary.target_industry}</p>
          )}
        </div>
        <div className="rounded-lg border border-[#E3D8BC] bg-[#F6F1E4] p-4">
          <p className="text-xs font-bold uppercase text-[#9CA3AF]">Readiness state</p>
          <p className="mt-2 text-lg font-bold text-[#B08A44]">{completionLabel}</p>
          {!summary.is_onboarding_complete && summary.missing_sections.length > 0 && (
            <p className="mt-2 text-xs font-semibold leading-5 text-[#6B7280]">
              Missing: {summary.missing_sections.map((item) => item.replace(/_/g, " ")).join(", ")}
            </p>
          )}
        </div>
        <div className="rounded-lg border border-[#EAE3D3] bg-white p-4">
          <p className="text-xs font-bold uppercase text-[#9CA3AF]">Target role</p>
          <p className="mt-2 text-lg font-bold text-[#1E2A44]">{summary.target_role ?? "Not set"}</p>
          {summary.target_timeline_months && (
            <p className="mt-2 text-sm font-semibold text-[#114F3B]">{summary.target_timeline_months} month timeline</p>
          )}
        </div>
        <div className="rounded-lg border border-[#EAE3D3] bg-white p-4">
          <p className="text-xs font-bold uppercase text-[#9CA3AF]">Top priorities</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {topPriorityLabels.map((priority) => (
              <span key={priority} className="rounded-full bg-[#E7F0E9] px-3 py-1 text-xs font-bold text-[#114F3B]">
                {priority}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-[#EAE3D3] bg-white p-4">
          <p className="text-xs font-bold uppercase text-[#9CA3AF]">Constraints</p>
          {constraints.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {constraints.slice(0, 4).map((constraint) => (
                <span
                  key={`${constraint.constraint_type}-${constraint.label}`}
                  className="rounded-full bg-[#F7F3EA] px-3 py-1 text-xs font-bold text-[#17694F]"
                >
                  {constraint.label}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm font-semibold text-[#6B7280]">No constraints saved</p>
          )}
        </div>
        <div className="rounded-lg border border-[#EAE3D3] bg-white p-4">
          <p className="text-xs font-bold uppercase text-[#9CA3AF]">Retirement target</p>
          <p className="mt-2 text-lg font-bold text-[#1E2A44]">
            {summary.target_retirement_age ? `Age ${summary.target_retirement_age}` : "Not set"}
          </p>
          {summary.learning_budget !== null && (
            <p className="mt-2 text-sm font-semibold text-[#6B7280]">Learning budget: {summary.learning_budget}</p>
          )}
        </div>
      </div>
    </section>
  );
}

export default function CareerNorthStarPanel() {
  const [profile, setProfile] = useState<CareerGpsProfile | null>(null);
  const [form, setForm] = useState<CareerNorthStarFormState>(defaultForm);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<StepId[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const activeStep = steps[activeStepIndex];

  const loadProfile = useCallback(async () => {
    if (!getAuthToken()) {
      setIsLoading(false);
      setError("Sign in as an employee to set up Career GPS.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const nextProfile = await getJson<CareerGpsProfile>("/career-gps/profile", { auth: true });
      setProfile(nextProfile);
      setForm(formFromProfile(nextProfile));
      setCompletedSteps(
        nextProfile.onboarding_progress.completed_steps.filter((step): step is StepId =>
          steps.some((item) => item.id === step),
        ),
      );
      setActiveStepIndex(stepIndexFromId(nextProfile.onboarding_progress.current_step));
      setIsEditing(!nextProfile.north_star.is_onboarding_complete);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load Career GPS profile.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const completionPercent = useMemo(() => {
    if (!profile) return 0;
    if (profile.north_star.is_onboarding_complete) return 100;
    const requiredSections = ["career_ambition", "target_role", "target_industry", "top_two_non_negotiable_priorities"];
    const completed = requiredSections.filter((section) => !profile.north_star.missing_sections.includes(section)).length;
    return Math.round((completed / requiredSections.length) * 100);
  }, [profile]);

  const updateForm = <TKey extends keyof CareerNorthStarFormState>(key: TKey, value: CareerNorthStarFormState[TKey]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const toggleArrayValue = (key: "preferred_work_styles" | "top_two_non_negotiable_priorities", value: string) => {
    setForm((current) => {
      const existing = current[key] as string[];
      const hasValue = existing.includes(value);
      const next = hasValue ? existing.filter((item) => item !== value) : [...existing, value];
      return {
        ...current,
        [key]: key === "top_two_non_negotiable_priorities" ? next.slice(0, 2) : next,
      };
    });
  };

  const validateStep = (stepId: StepId) => {
    const nextErrors: Record<string, string> = {};
    const retirementAge = nullableInt(form.target_retirement_age);
    const timelineMonths = nullableInt(form.target_timeline_months);
    const learningBudget = nullableInt(form.learning_budget);

    if (stepId === "career_ambition" || stepId === "review") {
      if (!form.career_ambition.trim()) nextErrors.career_ambition = "Add your main career ambition.";
      if (!form.target_role.trim()) nextErrors.target_role = "Add a target role.";
      if (!form.target_industry.trim()) nextErrors.target_industry = "Add a target industry.";
    }

    if (stepId === "lifestyle_priorities" || stepId === "review") {
      if (form.top_two_non_negotiable_priorities.length === 0) {
        nextErrors.top_two_non_negotiable_priorities = "Choose up to two non-negotiable priorities.";
      }
    }

    if (stepId === "constraints" || stepId === "review") {
      const hasBlankConstraint = form.constraints.some((constraint) => !constraint.label.trim() || !constraint.constraint_type.trim());
      if (hasBlankConstraint) nextErrors.constraints = "Remove blank constraints or complete their labels.";
    }

    if (stepId === "financial_targets" || stepId === "review") {
      if (retirementAge !== null && (retirementAge < 45 || retirementAge > 80)) {
        nextErrors.target_retirement_age = "Retirement age must be between 45 and 80.";
      }
      if (timelineMonths !== null && (timelineMonths < 1 || timelineMonths > 480)) {
        nextErrors.target_timeline_months = "Timeline must be between 1 and 480 months.";
      }
      if (learningBudget !== null && (learningBudget < 0 || learningBudget > 1000000)) {
        nextErrors.learning_budget = "Learning budget must be between 0 and 1,000,000.";
      }
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const saveProgress = async (currentStep: StepId, completed: StepId[], isComplete: boolean) => {
    const payload: CareerGpsOnboardingProgressPayload = {
      current_step: currentStep,
      completed_steps: completed,
      is_complete: isComplete,
    };
    return putJson<CareerGpsOnboardingProgress, CareerGpsOnboardingProgressPayload>(
      "/career-gps/onboarding-progress",
      payload,
      { auth: true },
    );
  };

  const refreshSummary = async (baseProfile: CareerGpsProfile) => {
    const northStar = await getJson<CareerGpsNorthStarSummary>("/career-gps/north-star", { auth: true });
    setProfile({ ...baseProfile, north_star: northStar });
  };

  const saveStepData = async (stepId: StepId, completeOnboarding: boolean) => {
    if (!profile) return;
    if (!validateStep(stepId)) return;

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      let nextProfile = profile;
      if (stepId === "career_ambition" || stepId === "financial_targets" || stepId === "review") {
        const goals = await putJson<CareerGpsGoals, CareerGpsGoalsPayload>("/career-gps/goals", goalsPayload(form), {
          auth: true,
        });
        nextProfile = { ...nextProfile, goals };
      }

      if (stepId === "lifestyle_priorities" || stepId === "financial_targets" || stepId === "review") {
        const lifestyle = await putJson<CareerGpsLifestylePriorities, CareerGpsLifestylePrioritiesPayload>(
          "/career-gps/lifestyle-priorities",
          lifestylePayload(form),
          { auth: true },
        );
        nextProfile = { ...nextProfile, lifestyle_priorities: lifestyle };
      }

      if (stepId === "constraints" || stepId === "review") {
        const constraints = await putJson<CareerGpsProfile["constraints"], CareerGpsConstraintsPayload>(
          "/career-gps/constraints",
          constraintsPayload(form),
          { auth: true },
        );
        nextProfile = { ...nextProfile, constraints };
      }

      const nextStepIndex = completeOnboarding ? activeStepIndex : Math.min(activeStepIndex + 1, steps.length - 1);
      const nextCompletedSteps = Array.from(new Set([...completedSteps, stepId]));
      const progress = await saveProgress(steps[nextStepIndex].id, nextCompletedSteps, completeOnboarding);
      nextProfile = { ...nextProfile, onboarding_progress: progress };
      setProfile(nextProfile);
      setCompletedSteps(nextCompletedSteps);
      setActiveStepIndex(nextStepIndex);
      await refreshSummary(nextProfile);

      if (completeOnboarding) {
        setIsEditing(false);
        setSuccessMessage("Career North Star saved.");
      } else {
        setSuccessMessage("Progress saved.");
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save Career GPS changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const goBack = async () => {
    if (activeStepIndex === 0) return;
    const nextIndex = activeStepIndex - 1;
    setActiveStepIndex(nextIndex);
    setError(null);
    setSuccessMessage(null);
    try {
      await saveProgress(steps[nextIndex].id, completedSteps, false);
    } catch {
      // Non-blocking: the next explicit save will persist the current step.
    }
  };

  const addConstraint = () => {
    setForm((current) => ({
      ...current,
      constraints: [
        ...current.constraints,
        {
          clientId: `constraint-${Date.now()}`,
          constraint_type: "other",
          label: "",
          is_blocking: false,
        },
      ],
    }));
  };

  const updateConstraint = (clientId: string, patch: Partial<DraftConstraint>) => {
    setForm((current) => ({
      ...current,
      constraints: current.constraints.map((constraint) =>
        constraint.clientId === clientId ? { ...constraint, ...patch } : constraint,
      ),
    }));
  };

  const removeConstraint = (clientId: string) => {
    setForm((current) => ({
      ...current,
      constraints: current.constraints.filter((constraint) => constraint.clientId !== clientId),
    }));
  };

  if (isLoading) {
    return (
      <section className="rounded-lg border border-[#EAE3D3] bg-white p-5 shadow-[0_4px_24px_rgba(232,25,122,0.08)]">
        <div className="flex items-center gap-3 text-sm font-bold text-[#6B7280]">
          <Loader2 size={18} className="animate-spin text-[#B08A44]" />
          Loading Career GPS...
        </div>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="rounded-lg border border-[#FECACA] bg-white p-5 shadow-[0_4px_24px_rgba(232,25,122,0.08)]">
        {error && <AlertMessage tone="error">{error}</AlertMessage>}
        <button
          type="button"
          onClick={loadProfile}
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-[#1E2A44] px-4 py-2.5 text-sm font-bold text-white"
        >
          Retry
        </button>
      </section>
    );
  }

  if (!isEditing && profile.north_star.is_onboarding_complete) {
    return (
      <div className="space-y-4">
        {successMessage && <AlertMessage tone="success">{successMessage}</AlertMessage>}
        <SummaryCard
          profile={profile}
          onEdit={() => {
            setIsEditing(true);
            setActiveStepIndex(stepIndexFromId(profile.onboarding_progress.current_step));
            setSuccessMessage(null);
          }}
        />
      </div>
    );
  }

  return (
    <section
      id="career-north-star"
      aria-labelledby="career-north-star-title"
      className="rounded-lg border border-[#CBDFD4] bg-white p-5 shadow-[0_4px_24px_rgba(232,25,122,0.08)]"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-[#CBDFD4] bg-[#E7F0E9] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#114F3B]">
            <Compass size={14} />
            Career GPS setup
          </p>
          <h2 id="career-north-star-title" className="mt-3 text-2xl font-bold text-[#1E2A44]">
            Set your Career North Star
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]">
            Save the goal, priorities, constraints, and financial targets that future Career GPS phases will use.
          </p>
        </div>
        <div className="rounded-lg border border-[#EAE3D3] bg-[#FFFFFF] px-4 py-3">
          <p className="text-xs font-bold uppercase text-[#9CA3AF]">Profile completion</p>
          <p className="mt-1 text-2xl font-bold text-[#B08A44]">{completionPercent}%</p>
        </div>
      </div>

      <div className="mt-5 h-2 rounded-full bg-[#F7F3EA]">
        <div
          className="h-2 rounded-full bg-[#B08A44] transition-all"
          style={{ width: `${Math.round(((activeStepIndex + 1) / steps.length) * 100)}%` }}
        />
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {steps.map((step, index) => (
          <StepBadge
            key={step.id}
            step={step}
            index={index}
            active={index === activeStepIndex}
            complete={completedSteps.includes(step.id)}
            onClick={() => {
              setActiveStepIndex(index);
              setError(null);
              setSuccessMessage(null);
            }}
          />
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-[#EAE3D3] bg-[#FFFFFF] p-4 sm:p-5">
        {activeStep.id === "current_situation" && (
          <div className="grid gap-4 lg:grid-cols-3">
            {[
              ["Name", profile.employee.full_name],
              ["Location", profile.employee.location ?? "Not set"],
              ["Current target role", profile.employee.target_role ?? "Not set"],
              ["Experience", `${profile.employee.experience_years} years`],
              ["Skills", profile.employee.skills.length ? profile.employee.skills.join(", ") : "No skills saved"],
              ["Profile source", "Employee profile"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-[#EAE3D3] bg-white p-4">
                <p className="text-xs font-bold uppercase text-[#9CA3AF]">{label}</p>
                <p className="mt-2 text-sm font-bold leading-6 text-[#1E2A44]">{value}</p>
              </div>
            ))}
          </div>
        )}

        {activeStep.id === "career_ambition" && (
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="block lg:col-span-2">
              <span className="text-sm font-bold text-[#1E2A44]">Main career goal</span>
              <textarea
                value={form.career_ambition}
                onChange={(event) => updateForm("career_ambition", event.target.value)}
                className={`${fieldClass(Boolean(fieldErrors.career_ambition))} min-h-28 resize-y`}
                maxLength={500}
                placeholder="Example: Become a product leader in climate technology within the next three years."
              />
              {fieldErrors.career_ambition && <p className="mt-1 text-xs font-bold text-[#DC2626]">{fieldErrors.career_ambition}</p>}
            </label>
            <label className="block">
              <span className="text-sm font-bold text-[#1E2A44]">Target role</span>
              <input
                value={form.target_role}
                onChange={(event) => updateForm("target_role", event.target.value)}
                className={fieldClass(Boolean(fieldErrors.target_role))}
                maxLength={160}
                placeholder="Product Manager"
              />
              {fieldErrors.target_role && <p className="mt-1 text-xs font-bold text-[#DC2626]">{fieldErrors.target_role}</p>}
            </label>
            <label className="block">
              <span className="text-sm font-bold text-[#1E2A44]">Target industry</span>
              <input
                value={form.target_industry}
                onChange={(event) => updateForm("target_industry", event.target.value)}
                className={fieldClass(Boolean(fieldErrors.target_industry))}
                maxLength={120}
                placeholder="Technology"
              />
              {fieldErrors.target_industry && <p className="mt-1 text-xs font-bold text-[#DC2626]">{fieldErrors.target_industry}</p>}
            </label>
            <label className="block lg:col-span-2">
              <span className="text-sm font-bold text-[#1E2A44]">Motivation</span>
              <textarea
                value={form.motivation}
                onChange={(event) => updateForm("motivation", event.target.value)}
                className={`${fieldClass()} min-h-24 resize-y`}
                maxLength={1000}
                placeholder="Why this direction matters to you."
              />
            </label>
          </div>
        )}

        {activeStep.id === "lifestyle_priorities" && (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[
                ["income_priority", "Income growth", form.income_priority],
                ["work_life_balance_priority", "Work-life balance", form.work_life_balance_priority],
                ["leadership_priority", "Leadership", form.leadership_priority],
                ["job_security_priority", "Job security", form.job_security_priority],
                ["remote_work_priority", "Remote work", form.remote_work_priority],
              ].map(([key, label, value]) => (
                <label key={key} className="rounded-lg border border-[#EAE3D3] bg-white p-4">
                  <span className="flex items-center justify-between gap-3 text-sm font-bold text-[#1E2A44]">
                    {label}
                    <span className="rounded-full bg-[#F6F1E4] px-2 py-1 text-xs text-[#B08A44]">{value}</span>
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={Number(value)}
                    onChange={(event) =>
                      updateForm(key as keyof CareerNorthStarFormState, Number(event.target.value) as never)
                    }
                    className="mt-4 w-full accent-[#B08A44]"
                  />
                </label>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <label className="block">
                <span className="text-sm font-bold text-[#1E2A44]">Preferred locations</span>
                <input
                  value={form.preferred_locations_text}
                  onChange={(event) => updateForm("preferred_locations_text", event.target.value)}
                  className={fieldClass()}
                  placeholder="Kuala Lumpur, Singapore, Remote"
                />
                <span className="mt-1 block text-xs font-semibold text-[#9CA3AF]">Separate multiple locations with commas.</span>
              </label>
              <label className="block">
                <span className="text-sm font-bold text-[#1E2A44]">Risk tolerance</span>
                <select
                  value={form.risk_tolerance}
                  onChange={(event) => updateForm("risk_tolerance", event.target.value as CareerGpsRiskTolerance)}
                  className={fieldClass()}
                >
                  <option value="low">Low</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                </select>
              </label>
            </div>

            <div>
              <p className="text-sm font-bold text-[#1E2A44]">Top non-negotiable priorities</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {priorityOptions.map((option) => {
                  const selected = form.top_two_non_negotiable_priorities.includes(option.key);
                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => toggleArrayValue("top_two_non_negotiable_priorities", option.key)}
                      className={`rounded-full border px-3 py-2 text-sm font-bold ${
                        selected
                          ? "border-[#B08A44] bg-[#F6F1E4] text-[#B08A44]"
                          : "border-[#DFD6BE] bg-white text-[#6B7280]"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
              {fieldErrors.top_two_non_negotiable_priorities && (
                <p className="mt-2 text-xs font-bold text-[#DC2626]">{fieldErrors.top_two_non_negotiable_priorities}</p>
              )}
            </div>

            <div>
              <p className="text-sm font-bold text-[#1E2A44]">Preferred work styles</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {workStyleOptions.map((option) => {
                  const selected = form.preferred_work_styles.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleArrayValue("preferred_work_styles", option)}
                      className={`rounded-full border px-3 py-2 text-sm font-bold ${
                        selected
                          ? "border-[#17694F] bg-[#E7F0E9] text-[#114F3B]"
                          : "border-[#DFD6BE] bg-white text-[#6B7280]"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeStep.id === "constraints" && (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#1E2A44]">Constraints</h3>
                <p className="mt-1 text-sm leading-6 text-[#6B7280]">
                  Add hard or soft constraints that should shape future recommendations.
                </p>
              </div>
              <button
                type="button"
                onClick={addConstraint}
                className="inline-flex items-center justify-center rounded-lg bg-[#1E2A44] px-4 py-2.5 text-sm font-bold text-white"
              >
                Add constraint
              </button>
            </div>
            {fieldErrors.constraints && <AlertMessage tone="error">{fieldErrors.constraints}</AlertMessage>}
            {form.constraints.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[#DFD6BE] bg-white p-5 text-sm font-semibold text-[#6B7280]">
                No constraints added. You can continue without constraints.
              </div>
            ) : (
              <div className="space-y-3">
                {form.constraints.map((constraint) => (
                  <div
                    key={constraint.clientId}
                    className="grid gap-3 rounded-lg border border-[#EAE3D3] bg-white p-4 lg:grid-cols-[160px_minmax(0,1fr)_160px_80px]"
                  >
                    <select
                      value={constraint.constraint_type}
                      onChange={(event) => updateConstraint(constraint.clientId, { constraint_type: event.target.value })}
                      className={fieldClass()}
                      aria-label="Constraint type"
                    >
                      {constraintTypeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <input
                      value={constraint.label}
                      onChange={(event) => updateConstraint(constraint.clientId, { label: event.target.value })}
                      className={fieldClass()}
                      maxLength={160}
                      placeholder="Example: Must stay in Malaysia"
                      aria-label="Constraint label"
                    />
                    <label className="mt-2 flex items-center gap-2 text-sm font-bold text-[#6B7280]">
                      <input
                        type="checkbox"
                        checked={constraint.is_blocking}
                        onChange={(event) => updateConstraint(constraint.clientId, { is_blocking: event.target.checked })}
                        className="h-4 w-4 accent-[#B08A44]"
                      />
                      Blocking
                    </label>
                    <button
                      type="button"
                      onClick={() => removeConstraint(constraint.clientId)}
                      className="mt-2 rounded-lg border border-[#EAE3D3] px-3 py-2 text-sm font-bold text-[#DC2626] hover:bg-[#FFF5F5]"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeStep.id === "financial_targets" && (
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="block">
              <span className="text-sm font-bold text-[#1E2A44]">Target retirement age</span>
              <input
                type="number"
                min={45}
                max={80}
                value={form.target_retirement_age}
                onChange={(event) => updateForm("target_retirement_age", event.target.value)}
                className={fieldClass(Boolean(fieldErrors.target_retirement_age))}
                placeholder="60"
              />
              {fieldErrors.target_retirement_age && (
                <p className="mt-1 text-xs font-bold text-[#DC2626]">{fieldErrors.target_retirement_age}</p>
              )}
            </label>
            <label className="block">
              <span className="text-sm font-bold text-[#1E2A44]">Target timeline in months</span>
              <input
                type="number"
                min={1}
                max={480}
                value={form.target_timeline_months}
                onChange={(event) => updateForm("target_timeline_months", event.target.value)}
                className={fieldClass(Boolean(fieldErrors.target_timeline_months))}
                placeholder="24"
              />
              {fieldErrors.target_timeline_months && (
                <p className="mt-1 text-xs font-bold text-[#DC2626]">{fieldErrors.target_timeline_months}</p>
              )}
            </label>
            <label className="block">
              <span className="text-sm font-bold text-[#1E2A44]">Learning budget</span>
              <input
                type="number"
                min={0}
                max={1000000}
                value={form.learning_budget}
                onChange={(event) => updateForm("learning_budget", event.target.value)}
                className={fieldClass(Boolean(fieldErrors.learning_budget))}
                placeholder="3000"
              />
              {fieldErrors.learning_budget && <p className="mt-1 text-xs font-bold text-[#DC2626]">{fieldErrors.learning_budget}</p>}
            </label>
            <label className="block">
              <span className="text-sm font-bold text-[#1E2A44]">Preferred company type</span>
              <select
                value={form.preferred_company_type}
                onChange={(event) => updateForm("preferred_company_type", event.target.value)}
                className={fieldClass()}
              >
                <option value="">No preference</option>
                {companyTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid gap-3 sm:grid-cols-2 lg:col-span-2">
              <label className="flex items-center gap-3 rounded-lg border border-[#EAE3D3] bg-white p-4 text-sm font-bold text-[#1E2A44]">
                <input
                  type="checkbox"
                  checked={form.willing_to_relocate}
                  onChange={(event) => updateForm("willing_to_relocate", event.target.checked)}
                  className="h-4 w-4 accent-[#B08A44]"
                />
                Willing to relocate
              </label>
              <label className="flex items-center gap-3 rounded-lg border border-[#EAE3D3] bg-white p-4 text-sm font-bold text-[#1E2A44]">
                <input
                  type="checkbox"
                  checked={form.international_mobility}
                  onChange={(event) => updateForm("international_mobility", event.target.checked)}
                  className="h-4 w-4 accent-[#B08A44]"
                />
                Open to international mobility
              </label>
            </div>
          </div>
        )}

        {activeStep.id === "review" && (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-[#EAE3D3] bg-white p-4">
              <p className="text-xs font-bold uppercase text-[#9CA3AF]">Goal</p>
              <p className="mt-2 text-base font-bold text-[#1E2A44]">{form.career_ambition || "Not set"}</p>
              <p className="mt-2 text-sm font-semibold text-[#6B7280]">
                {form.target_role || "No target role"} in {form.target_industry || "no target industry"}
              </p>
            </div>
            <div className="rounded-lg border border-[#EAE3D3] bg-white p-4">
              <p className="text-xs font-bold uppercase text-[#9CA3AF]">Priorities</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(form.top_two_non_negotiable_priorities.length
                  ? form.top_two_non_negotiable_priorities.map(formatPriorityLabel)
                  : ["No priorities selected"]
                ).map((item) => (
                  <span key={item} className="rounded-full bg-[#E7F0E9] px-3 py-1 text-xs font-bold text-[#114F3B]">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-[#EAE3D3] bg-white p-4">
              <p className="text-xs font-bold uppercase text-[#9CA3AF]">Constraints</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#6B7280]">
                {form.constraints.length ? form.constraints.map((constraint) => constraint.label).join(", ") : "None"}
              </p>
            </div>
            <div className="rounded-lg border border-[#EAE3D3] bg-white p-4">
              <p className="text-xs font-bold uppercase text-[#9CA3AF]">Financial and retirement targets</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#6B7280]">
                Retirement age: {form.target_retirement_age || "not set"}; timeline:{" "}
                {form.target_timeline_months || "not set"} months; learning budget: {form.learning_budget || "not set"}.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 space-y-3">
        {error && <AlertMessage tone="error">{error}</AlertMessage>}
        {successMessage && <AlertMessage tone="success">{successMessage}</AlertMessage>}
      </div>

      <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={goBack}
            disabled={activeStepIndex === 0 || isSaving}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#DFD6BE] bg-white px-4 py-2.5 text-sm font-bold text-[#17694F] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft size={16} />
            Back
          </button>
          {profile.north_star.is_onboarding_complete && (
            <button
              type="button"
              onClick={() => {
                setForm(formFromProfile(profile));
                setIsEditing(false);
                setError(null);
                setSuccessMessage(null);
              }}
              disabled={isSaving}
              className="inline-flex items-center justify-center rounded-lg border border-[#EAE3D3] bg-white px-4 py-2.5 text-sm font-bold text-[#6B7280] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => saveStepData(activeStep.id, activeStep.id === "review")}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1E2A44] px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : activeStep.id === "review" ? <Save size={16} /> : <ChevronRight size={16} />}
          {activeStep.id === "review" ? "Save North Star" : "Save and continue"}
        </button>
      </div>
    </section>
  );
}
