"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  ArrowRight,
  Award,
  Bot,
  BriefcaseBusiness,
  CalendarCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock3,
  Compass,
  FileText,
  Flag,
  Gauge,
  GitBranch,
  ListChecks,
  Loader2,
  Map,
  MapPin,
  Play,
  RefreshCw,
  Route,
  Save,
  Send,
  ShieldCheck,
  SkipForward,
  SlidersHorizontal,
  Sparkles,
  Target,
  TrendingUp,
  X,
} from "lucide-react";
import { EmployeeTopNav } from "@/components/employee/EmployeeTopNav";
import RiasecAssessment from "@/components/RiasecAssessment";
import { getAuthToken, getJson, postJson, putJson } from "@/lib/api";
import type {
  CareerGpsMilestone,
  CareerGpsMilestoneDetail,
  CareerBuddyConversation,
  CareerBuddyConversationDetail,
  CareerBuddyMessage,
  CareerBuddyMessagePayload,
  CareerBuddyReply,
  CareerGpsNextBestActionDetail,
  CareerGpsNextBestActionStatusPayload,
  CareerGpsOccupationSummary,
  CareerGpsProfile,
  CareerGpsProgressEntry,
  CareerGpsProgressResponse,
  CareerGpsProgressStatus,
  CareerGpsProgressUpdatePayload,
  CareerGpsRoadmap,
  CareerGpsRoute,
  CareerGpsRouteScoreComponent,
  CareerGpsRouteType,
  CareerGpsScenarioCode,
  CareerGpsSelectedRoutePayload,
  CareerGpsWhatIfApplyResponse,
  CareerGpsWhatIfPreview,
  CareerGpsWhatIfScenarioPayload,
} from "@/lib/backendTypes";
import { loadRiasecResult, riasecProfiles, saveRiasecResult, type RiasecCode, type RiasecResult } from "@/lib/riasec";
import { routes } from "@/lib/routes";

type ShellState = {
  profile: CareerGpsProfile | null;
  roadmap: CareerGpsRoadmap | null;
};

type JourneyNodeStatus = "start" | "completed" | "active" | "future" | "locked" | "destination";
type JourneyMapMode = "roadmap" | "skills" | "decisions";
type JourneyMapFocus = "overview" | "current" | "destination";

type JourneyNode = {
  id: string;
  title: string;
  stage: string;
  timing: string;
  readiness: number;
  status: JourneyNodeStatus;
  missingRequirement: string;
  milestone: CareerGpsMilestone | null;
  sequence: number;
  desktop: { x: number; y: number };
  lane: number;
  mapModeHint: JourneyMapMode;
};

type JourneyNodeMeta = {
  sharedCompleted: boolean;
  changedFromRecommended: boolean;
};

type ProgressEntriesByKey = Record<string, CareerGpsProgressEntry>;

type SkillReadinessStatus = "achieved" | "in_progress" | "missing";

type SkillReadinessItem = {
  name: string;
  status: SkillReadinessStatus;
  priority: number;
  label: string;
  evidenceUrl: string | null;
};

type SaveProgressHandler = (
  kind: "action" | "milestone",
  payload: CareerGpsProgressUpdatePayload,
) => Promise<void>;

const routeLabels = {
  recommended: "Recommended Route",
  accelerated: "Accelerated Route",
  balanced: "Balanced Route",
} as const;

const routeTone: Record<
  CareerGpsRouteType,
  { accent: string; bg: string; border: string; ring: string; line: string }
> = {
  recommended: {
    accent: "text-[#B08A44]",
    bg: "bg-[#F6F1E4]",
    border: "border-[#E3D8BC]",
    ring: "ring-[#B08A44]/20",
    line: "bg-[#B08A44]",
  },
  accelerated: {
    accent: "text-[#114F3B]",
    bg: "bg-[#E7F0E9]",
    border: "border-[#CBDFD4]",
    ring: "ring-[#17694F]/20",
    line: "bg-[#17694F]",
  },
  balanced: {
    accent: "text-[#17694F]",
    bg: "bg-[#E7F0E9]",
    border: "border-[#DFD6BE]",
    ring: "ring-[#17694F]/20",
    line: "bg-[#17694F]",
  },
};

const routeHexColor: Record<CareerGpsRouteType, string> = {
  recommended: "#B08A44",
  accelerated: "#17694F",
  balanced: "#17694F",
};

const journeyMapModes: Array<{ value: JourneyMapMode; label: string; description: string }> = [
  {
    value: "roadmap",
    label: "Route",
    description: "See the complete path from current role to destination.",
  },
  {
    value: "skills",
    label: "Skills",
    description: "Highlight the missing skill or evidence behind each stop.",
  },
  {
    value: "decisions",
    label: "Decisions",
    description: "Emphasize branch points and route trade-offs.",
  },
];

const journeyMapFocusModes: Array<{ value: JourneyMapFocus; label: string }> = [
  { value: "overview", label: "Overview" },
  { value: "current", label: "Current" },
  { value: "destination", label: "Goal" },
];

const scenarioOptions: { code: CareerGpsScenarioCode; label: string; description: string }[] = [
  {
    code: "prioritise_salary",
    label: "Prioritise salary",
    description: "Raises income priority and risk tolerance for higher-earning paths.",
  },
  {
    code: "prioritise_work_life_balance",
    label: "Prioritise work-life balance",
    description: "Raises balance, remote-work, and lower-risk preferences.",
  },
  {
    code: "avoid_management",
    label: "Avoid management",
    description: "Adds a blocking individual-contributor constraint.",
  },
  {
    code: "relocate_country",
    label: "Move to another country",
    description: "Tests relocation openness and international mobility.",
  },
  {
    code: "change_industry",
    label: "Change industry",
    description: "Temporarily shifts the target industry before rescoring routes.",
  },
  {
    code: "retire_earlier",
    label: "Retire earlier",
    description: "Compresses timeline and raises income priority.",
  },
  {
    code: "complete_masters_degree",
    label: "Complete a master's degree",
    description: "Treats degree-related analytics and research evidence as complete.",
  },
  {
    code: "focus_entrepreneurship",
    label: "Focus on entrepreneurship",
    description: "Shifts preference toward startup, ownership, and higher-risk routes.",
  },
];

const careerBuddyPrompts = [
  "Why was this route recommended?",
  "What should I do in the next 90 days?",
  "What skill is holding me back?",
  "Can I achieve my goal without becoming a manager?",
  "What changes if I move to Singapore?",
  "Show me a more balanced route.",
];

const riasecCodeOrder: RiasecCode[] = ["R", "I", "A", "S", "E", "C"];

const DEMO_ROADMAP_ID = -3100;

const demoRiasecResult: RiasecResult = {
  primaryCode: "I",
  secondaryCode: "S",
  hollandCode: "IS",
  scores: { R: 4, I: 10, A: 6, S: 8, E: 5, C: 7 },
  animal: "IS",
  animalName: "Analyst Guide",
  label: "Analytical Collaborator",
  summary: "A demo career personality marker for a computer science student who enjoys evidence, systems, and team learning.",
  jobThemes: ["Software engineering", "Data products", "Developer tooling", "Technical leadership"],
};

const demoProfile: CareerGpsProfile = {
  employee: {
    id: -101,
    user_id: -101,
    full_name: "Aisha Demo",
    location: "Kuala Lumpur",
    target_role: "Technical Lead",
    experience_years: 1,
    skills: ["Python", "JavaScript", "Git", "Data structures", "Team projects"],
    created_at: "2026-07-13T00:00:00Z",
  },
  onboarding_progress: {
    id: -101,
    employee_profile_id: -101,
    current_step: "complete",
    completed_steps: ["career_ambition", "lifestyle_priorities", "constraints", "route_review"],
    is_complete: true,
    last_completed_at: "2026-07-13T00:00:00Z",
  },
  goals: {
    id: -101,
    employee_profile_id: -101,
    career_ambition: "Grow from computer science student into a technical leader who builds reliable products and mentors engineers.",
    target_role: "Technical Lead",
    target_industry: "Technology",
    target_retirement_age: 60,
    target_timeline_months: 72,
    motivation: "Build production software, gain leadership range, and keep learning sustainable.",
    status: "active",
  },
  lifestyle_priorities: {
    id: -101,
    employee_profile_id: -101,
    income_priority: 7,
    work_life_balance_priority: 8,
    leadership_priority: 7,
    job_security_priority: 7,
    remote_work_priority: 8,
    international_mobility: true,
    risk_tolerance: "moderate",
    learning_budget: 1200,
    preferred_company_type: "Product company",
    willing_to_relocate: true,
    preferred_locations: ["Kuala Lumpur", "Singapore", "Remote"],
    preferred_work_styles: ["hybrid", "remote"],
    top_two_non_negotiable_priorities: ["work_life_balance", "learning_growth"],
  },
  constraints: [
    {
      id: -101,
      employee_profile_id: -101,
      constraint_type: "demo_boundary",
      label: "Use only illustrative demo data",
      value: { demo: true },
      is_blocking: true,
    },
  ],
  north_star: {
    employee_profile_id: -101,
    career_ambition: "Become a technical leader who can choose between engineering management and principal IC leadership.",
    target_role: "Technical Lead",
    target_industry: "Technology",
    target_retirement_age: 60,
    target_timeline_months: 72,
    income_priority: 7,
    work_life_balance_priority: 8,
    leadership_priority: 7,
    job_security_priority: 7,
    remote_work_priority: 8,
    international_mobility: true,
    risk_tolerance: "moderate",
    learning_budget: 1200,
    preferred_company_type: "Product company",
    willing_to_relocate: true,
    top_two_non_negotiable_priorities: ["work_life_balance", "learning_growth"],
    is_onboarding_complete: true,
    missing_sections: [],
  },
};

function demoAction(action_type: string, title: string, sequence: number, description: string, estimated_hours = 6) {
  return {
    action_type,
    title,
    description,
    sequence,
    estimated_hours,
    resource_url: null,
  };
}

function demoMilestone(
  sequence: number,
  title: string,
  focusSkill: string,
  durationWeeks: number,
  actions: CareerGpsMilestone["actions"],
): CareerGpsMilestone {
  return {
    title,
    description: `Illustrative demo milestone focused on ${focusSkill}.`,
    sequence,
    duration_weeks: durationWeeks,
    focus_skill_name: focusSkill,
    actions,
  };
}

function demoScoreComponents(values: Partial<Record<string, number>>): CareerGpsRouteScoreComponent[] {
  const defaults = {
    skill_fit: 72,
    lifestyle_fit: 76,
    work_life_balance_fit: 78,
    market_opportunity: 74,
    transition_difficulty: 68,
  };
  return Object.entries({ ...defaults, ...values }).map(([key, score]) => ({
    key,
    label: key.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
    score,
    weight: 0.2,
    explanation: `Illustrative demo ${key.replace(/_/g, " ")} score based on the safe demo journey.`,
  }));
}

function demoOccupation(id: number, slug: string, title: string, seniority: string): CareerGpsOccupationSummary {
  return {
    id,
    slug,
    title,
    family: "Software Engineering",
    seniority_level: seniority,
    source_label: "illustrative_demo",
  };
}

const demoRecommendedMilestones = [
  demoMilestone(1, "Computer Science Student", "Data structures", 4, [
    demoAction("learning", "Complete an algorithms revision sprint", 1, "Refresh arrays, graphs, complexity, and testing fundamentals.", 8),
    demoAction("project", "Publish a small full-stack portfolio project", 2, "Show Git history, README quality, and deployed functionality.", 10),
  ]),
  demoMilestone(2, "Software Engineering Intern", "Code review", 6, [
    demoAction("project", "Ship one reviewed feature in a team repo", 1, "Use pull requests, tests, and reviewer feedback as evidence.", 12),
    demoAction("reflection", "Write a post-internship engineering journal", 2, "Capture debugging patterns, team rituals, and strengths to repeat.", 3),
  ]),
  demoMilestone(3, "Junior Software Engineer", "Testing", 8, [
    demoAction("learning", "Add automated tests to two product areas", 1, "Practice unit, integration, and regression coverage on realistic code.", 10),
    demoAction("project", "Own a small production bug fix cycle", 2, "Document reproduction, fix, rollout, and monitoring evidence.", 6),
  ]),
  demoMilestone(4, "Software Engineer", "System design", 10, [
    demoAction("project", "Design and implement a service boundary", 1, "Create a concise design note and measure reliability after launch.", 14),
    demoAction("mentoring", "Pair with a newer engineer for one sprint", 2, "Build coaching evidence before the branch decision.", 4),
  ]),
  demoMilestone(5, "Branch Decision: Tech Lead or Principal IC", "Technical leadership", 6, [
    demoAction("decision", "Compare manager and principal-engineer evidence", 1, "Choose the leadership route using values, proof, and work-life fit.", 4),
    demoAction("project", "Facilitate one architecture review", 2, "Practice influence without relying only on authority.", 6),
  ]),
  demoMilestone(6, "Technical Lead", "Architecture facilitation", 12, [
    demoAction("project", "Lead a cross-team delivery plan", 1, "Coordinate roadmap, risks, and engineering trade-offs.", 16),
    demoAction("mentoring", "Mentor two engineers through promotion packets", 2, "Collect evidence of coaching and delivery outcomes.", 8),
  ]),
  demoMilestone(7, "Engineering Manager or Principal Engineer", "People leadership", 16, [
    demoAction("leadership", "Run a quarterly technical strategy review", 1, "Show decision quality, prioritisation, and stakeholder alignment.", 12),
    demoAction("reflection", "Document leadership operating principles", 2, "Clarify whether management or principal IC is the better branch.", 4),
  ]),
  demoMilestone(8, "Head of Engineering or CTO", "Organisational strategy", 24, [
    demoAction("strategy", "Create a three-year engineering capability plan", 1, "Connect hiring, architecture, delivery, and culture outcomes.", 18),
  ]),
];

const demoRoutes: CareerGpsRoute[] = [
  {
    route_type: "recommended",
    title: "Recommended route: Product Engineering Leadership",
    summary: "A steady path from CS foundations to technical leadership with a branch point between Engineering Manager and Principal Engineer.",
    score: 84,
    estimated_months: 72,
    target_occupation: demoOccupation(-201, "technical-lead", "Technical Lead", "Senior leadership track"),
    transition: { source_label: "illustrative_demo", branch_decision: "Engineering Manager or Principal Engineer" },
    skill_gaps: [
      { skill_name: "Code review", skill_type: "engineering_practice", priority: 5, proficiency_level: "developing" },
      { skill_name: "Testing", skill_type: "engineering_practice", priority: 5, proficiency_level: "developing" },
      { skill_name: "System design", skill_type: "technical_leadership", priority: 4, proficiency_level: "early" },
      { skill_name: "Technical leadership", skill_type: "leadership", priority: 4, proficiency_level: "early" },
      { skill_name: "Architecture facilitation", skill_type: "leadership", priority: 3, proficiency_level: "future" },
    ],
    milestones: demoRecommendedMilestones,
    score_components: demoScoreComponents({ skill_fit: 78, lifestyle_fit: 84, work_life_balance_fit: 82, market_opportunity: 76, transition_difficulty: 72 }),
    explanation: "Recommended because it balances technical depth, leadership evidence, and sustainable pacing for the demo employee.",
  },
  {
    route_type: "accelerated",
    title: "Accelerated route: Startup Engineering Fast Track",
    summary: "A faster path through internship, junior delivery, high-ownership product work, and early lead responsibilities.",
    score: 79,
    estimated_months: 48,
    target_occupation: demoOccupation(-202, "startup-tech-lead", "Startup Technical Lead", "Fast-track leadership"),
    transition: { source_label: "illustrative_demo", branch_decision: "Lead engineer in a high-growth team" },
    skill_gaps: [
      { skill_name: "Production ownership", skill_type: "delivery", priority: 5, proficiency_level: "developing" },
      { skill_name: "System design", skill_type: "technical_leadership", priority: 5, proficiency_level: "early" },
      { skill_name: "Incident response", skill_type: "operations", priority: 4, proficiency_level: "future" },
      { skill_name: "Stakeholder communication", skill_type: "leadership", priority: 4, proficiency_level: "developing" },
    ],
    milestones: [
      demoRecommendedMilestones[0],
      demoRecommendedMilestones[1],
      demoMilestone(3, "Junior Engineer With Production Ownership", "Production ownership", 6, [
        demoAction("project", "Own a release with rollback notes", 1, "Build confidence with deployment, measurement, and recovery.", 10),
        demoAction("learning", "Study incident reviews from mature engineering teams", 2, "Learn how fast teams protect reliability.", 5),
      ]),
      demoMilestone(4, "Software Engineer in a High-Growth Team", "Incident response", 8, [
        demoAction("project", "Join one on-call or reliability improvement rotation", 1, "Collect evidence of calm production judgement.", 8),
        demoAction("communication", "Present a post-launch learning review", 2, "Practice concise stakeholder updates.", 4),
      ]),
      demoMilestone(5, "Startup Technical Lead", "Stakeholder communication", 10, [
        demoAction("leadership", "Lead a cross-functional feature discovery sprint", 1, "Turn ambiguity into a sequenced product and engineering plan.", 12),
      ]),
    ],
    score_components: demoScoreComponents({ skill_fit: 70, lifestyle_fit: 61, work_life_balance_fit: 58, market_opportunity: 83, transition_difficulty: 60 }),
    explanation: "Accelerated because it compresses leadership exposure, but the trade-off is higher ambiguity and lower work-life balance.",
  },
  {
    route_type: "balanced",
    title: "Balanced route: Sustainable Senior Engineer",
    summary: "A slower route that protects learning quality, hybrid work preferences, and deep IC credibility before leadership branching.",
    score: 82,
    estimated_months: 84,
    target_occupation: demoOccupation(-203, "senior-software-engineer", "Senior Software Engineer", "Senior individual contributor"),
    transition: { source_label: "illustrative_demo", branch_decision: "Senior IC before management decision" },
    skill_gaps: [
      { skill_name: "Testing", skill_type: "engineering_practice", priority: 5, proficiency_level: "developing" },
      { skill_name: "Maintainable architecture", skill_type: "technical_depth", priority: 4, proficiency_level: "early" },
      { skill_name: "Mentoring", skill_type: "collaboration", priority: 4, proficiency_level: "early" },
      { skill_name: "Workload planning", skill_type: "sustainability", priority: 3, proficiency_level: "developing" },
    ],
    milestones: [
      demoRecommendedMilestones[0],
      demoRecommendedMilestones[1],
      demoRecommendedMilestones[2],
      demoMilestone(4, "Software Engineer With Reliable Delivery Habits", "Workload planning", 12, [
        demoAction("project", "Plan a six-week delivery cycle with clear scope", 1, "Practice sustainable commitments and stakeholder updates.", 8),
        demoAction("reflection", "Review weekly energy and learning patterns", 2, "Make work-life balance measurable before taking on more scope.", 3),
      ]),
      demoMilestone(5, "Senior Software Engineer", "Maintainable architecture", 16, [
        demoAction("project", "Refactor one high-change module with tests", 1, "Show senior-level quality without rushing leadership scope.", 14),
        demoAction("mentoring", "Run a monthly code review clinic", 2, "Build mentoring evidence at a sustainable cadence.", 6),
      ]),
      demoMilestone(6, "Technical Lead Readiness Review", "Mentoring", 12, [
        demoAction("decision", "Decide between Tech Lead and Principal IC readiness", 1, "Use evidence, preferences, and workload fit before branching.", 4),
      ]),
    ],
    score_components: demoScoreComponents({ skill_fit: 76, lifestyle_fit: 90, work_life_balance_fit: 92, market_opportunity: 70, transition_difficulty: 78 }),
    explanation: "Balanced because it preserves skill depth and work-life fit while keeping the technical leadership branch open.",
  },
];

function buildDemoRoadmap(selectedRouteType: CareerGpsRouteType = "recommended", version = 1): CareerGpsRoadmap {
  return {
    roadmap_id: DEMO_ROADMAP_ID,
    version,
    scoring_version: "demo-phase-3j",
    title: "Safe Demo Journey: Computer Science Student to Engineering Leadership",
    summary: "Illustrative hackathon demo data only. This route is separate from production user records and is not written to the backend.",
    fit_score: 84,
    target_occupation_id: -201,
    routes: demoRoutes,
    score_components: demoRoutes.flatMap((route) =>
      route.score_components.map((componentItem) => ({
        route_type: route.route_type,
        component_key: componentItem.key,
        label: componentItem.label,
        score: componentItem.score,
        weight: componentItem.weight,
        explanation: componentItem.explanation,
      })),
    ),
    next_best_action: {
      title: "Ship one reviewed feature in a team repo",
      description: "Use pull requests, tests, and reviewer feedback as evidence for the active intern milestone.",
      route_type: "recommended",
    },
    selected_route_type: selectedRouteType,
    source_note: "Demo mode: all Career GPS data shown here is illustrative seed data for a hackathon presentation. It is not production user data and is not saved to Supabase.",
  };
}

const demoProgressEntries: CareerGpsProgressEntry[] = [
  {
    id: -1,
    roadmap_id: DEMO_ROADMAP_ID,
    route_type: "recommended",
    milestone_sequence: 1,
    action_sequence: 1,
    status: "completed",
    progress_percent: 100,
    notes: "Completed algorithms revision for the demo journey.",
    evidence_url: "https://example.com/demo-algorithms-notes",
    completed_at: "2026-07-01",
    updated_at: "2026-07-01T00:00:00Z",
  },
  {
    id: -2,
    roadmap_id: DEMO_ROADMAP_ID,
    route_type: "recommended",
    milestone_sequence: 1,
    action_sequence: 2,
    status: "completed",
    progress_percent: 100,
    notes: "Portfolio project shipped with a README and deployment link.",
    evidence_url: "https://example.com/demo-portfolio",
    completed_at: "2026-07-05",
    updated_at: "2026-07-05T00:00:00Z",
  },
  {
    id: -3,
    roadmap_id: DEMO_ROADMAP_ID,
    route_type: "recommended",
    milestone_sequence: 1,
    action_sequence: null,
    status: "completed",
    progress_percent: 100,
    notes: "Completed foundation milestone.",
    evidence_url: null,
    completed_at: "2026-07-05",
    updated_at: "2026-07-05T00:00:00Z",
  },
  {
    id: -4,
    roadmap_id: DEMO_ROADMAP_ID,
    route_type: "recommended",
    milestone_sequence: 2,
    action_sequence: 1,
    status: "in_progress",
    progress_percent: 50,
    notes: "Feature branch is under review in the demo flow.",
    evidence_url: null,
    completed_at: null,
    updated_at: "2026-07-13T00:00:00Z",
  },
  {
    id: -5,
    roadmap_id: DEMO_ROADMAP_ID,
    route_type: "recommended",
    milestone_sequence: 2,
    action_sequence: null,
    status: "in_progress",
    progress_percent: 50,
    notes: "Active milestone for avatar positioning.",
    evidence_url: null,
    completed_at: null,
    updated_at: "2026-07-13T00:00:00Z",
  },
];

const demoNextBestAction: CareerGpsNextBestActionDetail = {
  roadmap_id: DEMO_ROADMAP_ID,
  route_type: "recommended",
  milestone_sequence: 2,
  action_sequence: 1,
  action_title: "Ship one reviewed feature in a team repo",
  why_it_matters: "This creates concrete internship-level evidence: a pull request, review feedback, tests, and a deployed or merged feature.",
  estimated_effort: "6-12 focused hours",
  target_completion_date: "2026-07-27",
  expected_impact: "Moves the active milestone from planning to credible engineering proof.",
  related_milestone: "Software Engineering Intern",
  status: "in_progress",
  recommended_skill_gained: "Code review",
  selection_reason: "Demo mode selected the active milestone's highest-priority incomplete action.",
  is_alternative: false,
};

function initialsFromName(name: string | null | undefined) {
  const initials = (name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "E";
}

function careerStage(experienceYears: number | null | undefined) {
  const years = Math.max(0, experienceYears ?? 0);
  if (years >= 10) return "Advanced career";
  if (years >= 6) return "Senior contributor";
  if (years >= 3) return "Building momentum";
  if (years > 0) return "Early career";
  return "Career foundation";
}

function setupReadiness(profile: CareerGpsProfile | null) {
  if (!profile) return 0;
  if (profile.north_star.is_onboarding_complete) return 100;
  const required = ["career_ambition", "target_role", "target_industry", "top_two_non_negotiable_priorities"];
  const missing = new Set(profile.north_star.missing_sections);
  const completed = required.filter((section) => !missing.has(section)).length;
  return Math.round((completed / required.length) * 100);
}

function formatPriority(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function selectedRoute(roadmap: CareerGpsRoadmap | null, routeType?: CareerGpsRouteType | null) {
  return (
    roadmap?.routes.find((route) => route.route_type === routeType) ??
    roadmap?.routes.find((route) => route.route_type === roadmap.selected_route_type) ??
    roadmap?.routes.find((route) => route.route_type === "recommended") ??
    roadmap?.routes[0] ??
    null
  );
}

function weakestComponent(route: CareerGpsRoute) {
  return [...route.score_components].sort((a, b) => a.score - b.score)[0] ?? null;
}

function strongestComponent(route: CareerGpsRoute) {
  return [...route.score_components].sort((a, b) => b.score - a.score)[0] ?? null;
}

function component(route: CareerGpsRoute, key: string) {
  return route.score_components.find((item) => item.key === key);
}

function metricValue(route: CareerGpsRoute, key: string) {
  return Math.round(component(route, key)?.score ?? route.score);
}

function readinessFromRoute(route: CareerGpsRoute) {
  return metricValue(route, "skill_fit");
}

function statusLabel(status: JourneyNodeStatus) {
  if (status === "start") return "Starting point";
  if (status === "completed") return "Completed";
  if (status === "active") return "Active now";
  if (status === "locked") return "Locked";
  if (status === "destination") return "Destination";
  return "Future";
}

function progressStatusLabel(status: CareerGpsProgressStatus | null | undefined) {
  if (status === "completed") return "Complete";
  if (status === "in_progress") return "In progress";
  if (status === "skipped") return "Skipped";
  return "Not started";
}

function progressKey(routeType: CareerGpsRouteType, milestoneSequence: number, actionSequence?: number | null) {
  return actionSequence
    ? `${routeType}-${milestoneSequence}-action-${actionSequence}`
    : `${routeType}-${milestoneSequence}-milestone`;
}

function progressEntriesByKey(entries: CareerGpsProgressEntry[]) {
  return entries.reduce<ProgressEntriesByKey>((accumulator, entry) => {
    accumulator[progressKey(entry.route_type, entry.milestone_sequence, entry.action_sequence)] = entry;
    return accumulator;
  }, {});
}

function normalizeSkill(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function employeeHasSkill(profile: CareerGpsProfile | null, skillName: string | null | undefined) {
  const normalized = normalizeSkill(skillName);
  if (!profile || !normalized) return false;
  return profile.employee.skills.some((skill) => normalizeSkill(skill) === normalized);
}

function priorityLabel(priority: number) {
  if (priority >= 5) return "Critical";
  if (priority >= 4) return "High";
  if (priority >= 3) return "Medium";
  return "Low";
}

function missingRequirement(milestone: CareerGpsMilestone | null, route: CareerGpsRoute) {
  if (!milestone) return route.skill_gaps[0]?.skill_name ?? "Role evidence";
  const focus = milestone.focus_skill_name;
  const exact = route.skill_gaps.find((gap) => gap.skill_name === focus);
  return exact?.skill_name ?? focus ?? route.skill_gaps[0]?.skill_name ?? "Role evidence";
}

function milestoneTiming(milestone: CareerGpsMilestone | null, route: CareerGpsRoute) {
  if (!milestone) return `${route.estimated_months} months`;
  return `${milestone.duration_weeks ?? 4} weeks`;
}

function confidenceLevel(score: number) {
  if (score >= 82) return "High";
  if (score >= 68) return "Medium";
  if (score >= 52) return "Developing";
  return "Low";
}

function componentText(componentItem: CareerGpsRouteScoreComponent | null) {
  if (!componentItem) return "Overall fit";
  return `${componentItem.label} (${Math.round(componentItem.score)}%)`;
}

function routeRiskLabel(route: CareerGpsRoute) {
  const difficulty = metricValue(route, "transition_difficulty");
  const lifestyle = metricValue(route, "lifestyle_fit");
  const blendedRisk = Math.round((100 - difficulty + Math.max(0, 70 - lifestyle)) / 2);
  if (blendedRisk >= 45) return "High career risk";
  if (blendedRisk >= 28) return "Moderate career risk";
  return "Lower career risk";
}

function routeSkillGapDelta(route: CareerGpsRoute, baseline: CareerGpsRoute) {
  const baselineSkills = new Set(baseline.skill_gaps.map((gap) => normalizeSkill(gap.skill_name)));
  const changedSkills = route.skill_gaps
    .filter((gap) => !baselineSkills.has(normalizeSkill(gap.skill_name)))
    .slice(0, 2)
    .map((gap) => gap.skill_name);
  return changedSkills.length ? changedSkills.join(", ") : "Similar priority gaps";
}

function routeBranchDecision(route: CareerGpsRoute) {
  const transition = route.transition as { branch_decision?: string | null } | null | undefined;
  return (
    transition?.branch_decision ??
    route.milestones.find((milestone) => /branch|decision/i.test(milestone.title))?.title ??
    route.target_occupation.title
  );
}

function routeTimelineDifference(route: CareerGpsRoute, baseline: CareerGpsRoute) {
  const difference = route.estimated_months - baseline.estimated_months;
  if (difference === 0) return "Same timeline";
  return `${Math.abs(difference)} months ${difference > 0 ? "slower" : "faster"}`;
}

function routeMetricDifference(route: CareerGpsRoute, baseline: CareerGpsRoute, key: string) {
  const difference = metricValue(route, key) - metricValue(baseline, key);
  if (difference === 0) return "Same";
  return `${difference > 0 ? "+" : ""}${difference} pts`;
}

function routeDestinationDifference(route: CareerGpsRoute, baseline: CareerGpsRoute) {
  if (route.target_occupation.title === baseline.target_occupation.title) return "Same destination";
  return route.target_occupation.title;
}

function routeMilestoneSignature(milestone: CareerGpsMilestone | null | undefined) {
  if (!milestone) return "";
  return [
    milestone.sequence,
    normalizeSkill(milestone.focus_skill_name),
    milestone.title.trim().toLowerCase(),
  ].join("|");
}

function milestonesMatch(left: CareerGpsMilestone | null | undefined, right: CareerGpsMilestone | null | undefined) {
  if (!left || !right) return false;
  return (
    left.sequence === right.sequence ||
    normalizeSkill(left.focus_skill_name) === normalizeSkill(right.focus_skill_name) ||
    left.title.trim().toLowerCase() === right.title.trim().toLowerCase()
  );
}

function isCompletedOnAnyRoute(
  milestone: CareerGpsMilestone,
  roadmap: CareerGpsRoadmap,
  progressByKey: ProgressEntriesByKey,
) {
  return roadmap.routes.some((route) =>
    route.milestones.some(
      (candidate) =>
        milestonesMatch(candidate, milestone) &&
        progressByKey[progressKey(route.route_type, candidate.sequence)]?.status === "completed",
    ),
  );
}

function isChangedFutureMilestone(
  node: JourneyNode,
  activeRoute: CareerGpsRoute,
  baselineRoute: CareerGpsRoute | null,
) {
  if (!node.milestone || !baselineRoute || activeRoute.route_type === baselineRoute.route_type) return false;
  if (node.status === "completed" || node.status === "start" || node.status === "destination") return false;
  const baselineMilestone = baselineRoute.milestones.find((milestone) => milestone.sequence === node.milestone?.sequence);
  return routeMilestoneSignature(node.milestone) !== routeMilestoneSignature(baselineMilestone);
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function formatActionDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function demoMilestoneDetail(
  roadmap: CareerGpsRoadmap,
  route: CareerGpsRoute,
  milestone: CareerGpsMilestone,
  progressByKey: ProgressEntriesByKey,
): CareerGpsMilestoneDetail {
  const missingSkills = route.skill_gaps
    .filter((gap) => normalizeSkill(gap.skill_name) === normalizeSkill(milestone.focus_skill_name) || gap.priority >= 4)
    .map((gap) => gap.skill_name)
    .slice(0, 4);
  const existingSkills = demoProfile.employee.skills.filter((skill) => normalizeSkill(skill) !== normalizeSkill(milestone.focus_skill_name));
  return {
    roadmap_id: roadmap.roadmap_id,
    route_type: route.route_type,
    milestone_sequence: milestone.sequence,
    title: milestone.title,
    why_recommended: `Demo detail: this stop builds ${milestone.focus_skill_name ?? "career evidence"} before the next route decision.`,
    estimated_timeline: `${milestone.duration_weeks ?? 4} weeks`,
    required_skills: [milestone.focus_skill_name ?? "Role evidence", ...missingSkills].filter(Boolean),
    existing_skills: existingSkills.slice(0, 4),
    missing_skills: missingSkills.length ? missingSkills : [milestone.focus_skill_name ?? "Role evidence"],
    recommended_certification: "No mandatory certification is claimed in demo mode; use the stored learning action as practice evidence.",
    recommended_experience: `Complete one applied ${milestone.focus_skill_name ?? "engineering"} activity and save proof before moving on.`,
    suggested_project: milestone.actions.find((action) => action.action_type === "project")?.title ?? milestone.actions[0]?.title ?? "Create one evidence-backed work sample.",
    relevant_target_roles: roadmap.routes.map((item) => item.target_occupation.title),
    transition_difficulty: componentText(component(route, "transition_difficulty") ?? null),
    lifestyle_impact: `${componentText(component(route, "lifestyle_fit") ?? null)} with ${componentText(component(route, "work_life_balance_fit") ?? null)}`,
    confidence_level: confidenceLevel(route.score),
    main_assumptions: [
      "Demo mode uses illustrative route data only and does not represent live labor-market or salary data.",
      "Progress updates in demo mode are local to the browser session and are not written to Supabase.",
    ],
    immediate_actions: milestone.actions.map((action) => ({
      ...action,
      progress: progressByKey[progressKey(route.route_type, milestone.sequence, action.sequence)] ?? null,
    })),
    milestone_progress: progressByKey[progressKey(route.route_type, milestone.sequence)] ?? null,
  };
}

function demoProgressPercent(statusValue: CareerGpsProgressStatus) {
  if (statusValue === "completed") return 100;
  if (statusValue === "in_progress") return 50;
  return 0;
}

function demoProgressEntry(payload: CareerGpsProgressUpdatePayload): CareerGpsProgressEntry {
  return {
    id: -Date.now(),
    roadmap_id: DEMO_ROADMAP_ID,
    route_type: payload.route_type,
    milestone_sequence: payload.milestone_sequence,
    action_sequence: payload.action_sequence ?? null,
    status: payload.status,
    progress_percent: demoProgressPercent(payload.status),
    notes: payload.notes ?? null,
    evidence_url: payload.evidence_url ?? null,
    completed_at: payload.completed_at ?? null,
    updated_at: new Date().toISOString(),
  };
}

function demoWhatIfPreview(currentRoadmap: CareerGpsRoadmap, payload: CareerGpsWhatIfScenarioPayload): CareerGpsWhatIfPreview {
  const workLife = payload.adjustments.includes("prioritise_work_life_balance");
  const accelerated = payload.adjustments.includes("prioritise_salary") || payload.adjustments.includes("retire_earlier");
  const selectedRouteType: CareerGpsRouteType = workLife ? "balanced" : accelerated ? "accelerated" : currentRoadmap.selected_route_type;
  const previewRoadmap = buildDemoRoadmap(selectedRouteType, currentRoadmap.version + 1);
  const currentRoute = selectedRoute(currentRoadmap, currentRoadmap.selected_route_type) ?? currentRoadmap.routes[0];
  const previewRoute = selectedRoute(previewRoadmap, selectedRouteType) ?? previewRoadmap.routes[0];
  const scenarioName =
    payload.scenario_name ??
    (workLife ? "Work-life balance scenario" : accelerated ? "Accelerated demo scenario" : "Demo scenario preview");

  return {
    scenario: {
      scenario_name: scenarioName,
      adjustments: payload.adjustments,
      applied_overrides: [
        workLife
          ? "Raised work-life balance and remote-work priority in the demo preview."
          : accelerated
            ? "Raised timeline compression and opportunity priority in the demo preview."
            : "Preview keeps the active route because no route-changing demo adjustment was selected.",
      ],
    },
    preview_roadmap: previewRoadmap,
    comparison: {
      current_roadmap_id: currentRoadmap.roadmap_id,
      current_version: currentRoadmap.version,
      preview_version: previewRoadmap.version,
      changes: [
        {
          category: "recommended_route",
          label: "Recommended route",
          before: routeLabels[currentRoadmap.selected_route_type],
          after: routeLabels[selectedRouteType],
          changed: currentRoadmap.selected_route_type !== selectedRouteType,
          explanation: "Demo mode recalculates the route view locally from the selected scenario priority.",
        },
        {
          category: "target_roles",
          label: "Target role",
          before: currentRoute?.target_occupation.title ?? "Current route",
          after: previewRoute?.target_occupation.title ?? "Preview route",
          changed: currentRoute?.target_occupation.title !== previewRoute?.target_occupation.title,
          explanation: "The destination can shift when the scenario changes pace or lifestyle priority.",
        },
        {
          category: "timeline",
          label: "Timeline",
          before: `${currentRoute?.estimated_months ?? 0} months`,
          after: `${previewRoute?.estimated_months ?? 0} months`,
          changed: currentRoute?.estimated_months !== previewRoute?.estimated_months,
          explanation: "Balanced routes take longer; accelerated routes compress milestones.",
        },
        {
          category: "skill_priorities",
          label: "Skill priorities",
          before: currentRoute?.skill_gaps.slice(0, 3).map((gap) => gap.skill_name).join(", ") ?? "No gaps",
          after: previewRoute?.skill_gaps.slice(0, 3).map((gap) => gap.skill_name).join(", ") ?? "No gaps",
          changed: currentRoute?.route_type !== previewRoute?.route_type,
          explanation: "Skill priorities follow the selected route's stored illustrative gaps.",
        },
        {
          category: "tradeoffs",
          label: "Trade-offs",
          before: componentText(currentRoute ? weakestComponent(currentRoute) : null),
          after: componentText(previewRoute ? weakestComponent(previewRoute) : null),
          changed: currentRoute?.route_type !== previewRoute?.route_type,
          explanation: "Trade-offs are illustrative and deterministic in demo mode.",
        },
      ],
    },
  };
}

function demoBuddyReply(question: string, activeRoute: CareerGpsRoute): string {
  const lower = question.toLowerCase();
  if (lower.includes("balanced") || lower.includes("work-life") || lower.includes("work life")) {
    return "In demo mode, the Balanced Route protects sustainable pacing. It keeps the leadership branch open while prioritising testing, maintainable architecture, mentoring, and workload planning.";
  }
  if (lower.includes("90") || lower.includes("next")) {
    return "For the next 90 days, finish the active internship milestone: ship one reviewed feature, save the pull request as evidence, and write a short reflection on review feedback.";
  }
  if (lower.includes("skill")) {
    return `The biggest demo blocker on ${routeLabels[activeRoute.route_type]} is ${activeRoute.skill_gaps[0]?.skill_name ?? "role evidence"}. Build one small proof artifact before moving to the next stop.`;
  }
  return `Demo answer: ${routeLabels[activeRoute.route_type]} is recommended because it connects the active milestone to visible engineering evidence without inventing salary or live-market claims.`;
}

function progressStatusTone(status: CareerGpsProgressStatus | null | undefined) {
  if (status === "completed") return "border-[#CBDFD4] bg-[#EFF5F0] text-[#114F3B]";
  if (status === "in_progress") return "border-[#CBDFD4] bg-[#E7F0E9] text-[#114F3B]";
  if (status === "skipped") return "border-[#DFD6BE] bg-[#F7F3EA] text-[#6B7280]";
  return "border-[#E3D8BC] bg-[#F6F1E4] text-[#B08A44]";
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-gradient-to-r from-[#F1EDE0] via-[#F7F3EA] to-[#F1EDE0] ${className}`} />;
}

function LoadingShell() {
  return (
    <div className="space-y-4" aria-label="Loading Career GPS">
      <section className="rounded-lg border border-[#EAE3D3] bg-white p-5 shadow-[0_4px_20px_rgba(26,16,51,0.05)]">
        <SkeletonBlock className="h-5 w-36" />
        <SkeletonBlock className="mt-4 h-10 w-72 max-w-full" />
        <SkeletonBlock className="mt-3 h-4 w-full max-w-2xl" />
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <SkeletonBlock className="h-20" />
          <SkeletonBlock className="h-20" />
          <SkeletonBlock className="h-20" />
        </div>
      </section>
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <SkeletonBlock className="h-[420px] lg:h-[560px]" />
        <div className="space-y-3">
          <SkeletonBlock className="h-32" />
          <SkeletonBlock className="h-48" />
          <SkeletonBlock className="h-24" />
        </div>
      </section>
    </div>
  );
}

function AlertMessage({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-[#FECACA] bg-[#FFF5F5] px-4 py-3 text-sm font-bold leading-6 text-[#B91C1C]" role="alert">
      <AlertCircle size={17} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

function EmptyPanel({
  icon: Icon,
  label,
  title,
  description,
}: {
  icon: LucideIcon;
  label: string;
  title: string;
  description: string;
}) {
  return (
    <section className="rounded-lg border border-dashed border-[#DFD6BE] bg-white p-5 shadow-[0_4px_20px_rgba(26,16,51,0.04)]">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#E7F0E9] text-[#17694F]">
          <Icon size={20} />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#9CA3AF]">{label}</p>
          <h2 className="mt-1 text-lg font-bold leading-6 text-[#1E2A44]">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-[#6B7280]">{description}</p>
        </div>
      </div>
    </section>
  );
}

function DemoModeBanner() {
  return (
    <section className="rounded-lg border border-[#E3D8BC] bg-[#F6F1E4] p-4 shadow-[0_4px_24px_rgba(232,25,122,0.08)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#B08A44]">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#B08A44]">Safe demo mode</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-[#1E2A44]">
              Showing one illustrative employee journey. Route switches, progress updates, what-if results, and Career Buddy replies stay local and do not overwrite real users.
            </p>
          </div>
        </div>
        <span className="inline-flex w-fit rounded-full border border-[#E3D8BC] bg-white px-3 py-1 text-xs font-bold text-[#B08A44]">
          illustrative_demo
        </span>
      </div>
    </section>
  );
}

function CareerGpsHeader({
  profile,
  roadmap,
  isRefreshing,
  isDemoMode,
  onRefresh,
}: {
  profile: CareerGpsProfile;
  roadmap: CareerGpsRoadmap | null;
  isRefreshing: boolean;
  isDemoMode: boolean;
  onRefresh: () => void;
}) {
  const destination = profile.north_star.target_role ?? profile.employee.target_role ?? "Set a target role";
  const stage = careerStage(profile.employee.experience_years);
  const readiness = roadmap ? Math.round(roadmap.fit_score) : setupReadiness(profile);

  return (
    <section className="rounded-lg border border-[#EAE3D3] bg-white px-4 py-4 shadow-[0_4px_20px_rgba(26,16,51,0.06)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#CBDFD4] bg-[#E7F0E9] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#114F3B]">
            <Compass size={14} />
            {isDemoMode ? "Career GPS Demo" : "Career GPS"}
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#1E2A44] sm:text-3xl">
            {destination}
          </h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-[#6B7280]">
            {isDemoMode
              ? "A polished hackathon demo flow from computer science student to engineering leadership."
              : "Your main visual route, active milestone, and next progress stops."}
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[520px]">
          <div className="rounded-lg border border-[#E3D8BC] bg-[#F6F1E4] px-3 py-2">
            <p className="text-[11px] font-bold uppercase text-[#9CA3AF]">Stage</p>
            <p className="mt-1 truncate text-sm font-bold text-[#B08A44]">{stage}</p>
          </div>
          <div className="rounded-lg border border-[#CBDFD4] bg-[#EFF5F0] px-3 py-2">
            <p className="text-[11px] font-bold uppercase text-[#9CA3AF]">Readiness</p>
            <p className="mt-1 text-sm font-bold text-[#17694F]">{readiness}% {roadmap ? "fit" : "setup"}</p>
          </div>
          <div className="flex gap-2">
            <Link
              href={routes.employeeSettings}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#1E2A44] px-3 text-sm font-bold text-white outline-none transition hover:bg-[#16233C] focus-visible:ring-2 focus-visible:ring-[#B08A44] focus-visible:ring-offset-2"
            >
              <Target size={16} />
              Goals
            </Link>
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-[#DFD6BE] bg-white px-3 text-sm font-bold text-[#17694F] outline-none transition hover:border-[#B08A44] hover:text-[#B08A44] focus-visible:ring-2 focus-visible:ring-[#B08A44] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRefreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              Refresh
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function NorthStarSummary({ profile }: { profile: CareerGpsProfile }) {
  const summary = profile.north_star;
  const priorities = summary.top_two_non_negotiable_priorities.length
    ? summary.top_two_non_negotiable_priorities.slice(0, 2).map(formatPriority)
    : ["Not set"];
  const constraints = profile.constraints.length ? profile.constraints.slice(0, 3) : [];
  const modeParts = [
    summary.preferred_company_type,
    summary.willing_to_relocate ? "Open to relocation" : null,
    summary.international_mobility ? "International mobility" : null,
  ].filter(Boolean);
  const mode = modeParts.length ? modeParts.join(" / ") : "Flexible";
  const readiness = setupReadiness(profile);

  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.6fr)]">
      <div className="rounded-lg border border-[#EAE3D3] bg-white p-5 shadow-[0_4px_24px_rgba(232,25,122,0.08)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#E3D8BC] bg-[#F6F1E4] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#B08A44]">
              <Flag size={14} />
              Career North Star
            </p>
            <h2 className="mt-3 text-2xl font-bold text-[#1E2A44]">{summary.career_ambition ?? "Define your main goal"}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B7280]">
              This summary uses your saved Career GPS profile and existing employee data.
            </p>
          </div>
          <Link href={routes.employeeSettings} className="text-sm font-bold text-[#114F3B]">
            Update summary
          </Link>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-lg bg-[#FFFFFF] p-4">
            <p className="text-xs font-bold uppercase text-[#9CA3AF]">Target role</p>
            <p className="mt-2 text-base font-bold text-[#1E2A44]">{summary.target_role ?? profile.employee.target_role ?? "Not set"}</p>
          </div>
          <div className="rounded-lg bg-[#FFFFFF] p-4">
            <p className="text-xs font-bold uppercase text-[#9CA3AF]">Top priorities</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {priorities.map((priority) => (
                <span key={priority} className="rounded-full bg-[#E7F0E9] px-3 py-1 text-xs font-bold text-[#114F3B]">
                  {priority}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-lg bg-[#FFFFFF] p-4">
            <p className="text-xs font-bold uppercase text-[#9CA3AF]">Preferred career mode</p>
            <p className="mt-2 text-base font-bold text-[#1E2A44]">{mode}</p>
          </div>
          <div className="rounded-lg bg-[#FFFFFF] p-4 xl:col-span-2">
            <p className="text-xs font-bold uppercase text-[#9CA3AF]">Important constraints</p>
            {constraints.length ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {constraints.map((constraint) => (
                  <span
                    key={`${constraint.constraint_type}-${constraint.label}`}
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      constraint.is_blocking ? "bg-[#F6F1E4] text-[#B08A44]" : "bg-[#E7F0E9] text-[#17694F]"
                    }`}
                  >
                    {constraint.label}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm font-semibold text-[#6B7280]">No important constraints saved yet.</p>
            )}
          </div>
          <div className="rounded-lg bg-[#FFFFFF] p-4">
            <p className="text-xs font-bold uppercase text-[#9CA3AF]">Profile completion</p>
            <p className="mt-2 text-base font-bold text-[#1E2A44]">{readiness}% ready</p>
          </div>
        </div>
      </div>

      <aside className="rounded-lg border border-[#CBDFD4] bg-[#EFF5F0] p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#114F3B]">
            <ShieldCheck size={19} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#114F3B]">Setup state</p>
            <h3 className="mt-1 text-lg font-bold text-[#1E2A44]">
              {summary.is_onboarding_complete ? "North Star complete" : "North Star needs detail"}
            </h3>
            <p className="mt-2 text-sm leading-6 text-[#6B7280]">
              {summary.is_onboarding_complete
                ? "Your goals and priorities are ready to support the Career GPS shell."
                : `Missing: ${summary.missing_sections.map((section) => section.replace(/_/g, " ")).join(", ") || "profile details"}.`}
            </p>
          </div>
        </div>
      </aside>
    </section>
  );
}

function RiasecScoreBar({ code, score, maxScore }: { code: RiasecCode; score: number; maxScore: number }) {
  const profile = riasecProfiles[code];
  const width = Math.max(4, Math.round((score / Math.max(maxScore, 1)) * 100));
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-xs font-bold text-[#6B7280]">
        <span>
          {code} - {profile.name}
        </span>
        <span className="text-[#1E2A44]">{score}</span>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#EAE3D3]">
        <div className="h-full rounded-full bg-[#B08A44]" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function riasecCareerThemes(result: RiasecResult | null, activeRoute: CareerGpsRoute | null) {
  const themes = [
    ...(result?.jobThemes ?? []),
    activeRoute?.target_occupation.title,
    activeRoute?.target_occupation.family,
  ].filter(Boolean) as string[];
  return Array.from(new Set(themes)).slice(0, 7);
}

function riasecRouteFitSummary(result: RiasecResult | null, activeRoute: CareerGpsRoute | null) {
  if (!result) {
    return "Complete the interest check so Career GPS can show how your work-style signal connects to recommended roles and milestones.";
  }

  const primary = riasecProfiles[result.primaryCode];
  const secondary = riasecProfiles[result.secondaryCode];
  const routeTitle = activeRoute?.target_occupation.title ?? "your selected route";
  return `${result.hollandCode} combines ${primary.name.toLowerCase()} and ${secondary.name.toLowerCase()} preferences. For ${routeTitle}, use this as a fit lens alongside skills, lifestyle priorities, and evidence progress.`;
}

function RiasecCareerFitSection({
  riasecResult,
  activeRoute,
  onResultChange,
}: {
  riasecResult: RiasecResult | null;
  activeRoute: CareerGpsRoute | null;
  onResultChange: (result: RiasecResult | null, isComplete: boolean) => void;
}) {
  const primaryProfile = riasecResult ? riasecProfiles[riasecResult.primaryCode] : null;
  const secondaryProfile = riasecResult ? riasecProfiles[riasecResult.secondaryCode] : null;
  const maxScore = riasecResult ? Math.max(8, ...Object.values(riasecResult.scores)) : 8;
  const themes = riasecCareerThemes(riasecResult, activeRoute);
  const pathPreview = activeRoute?.milestones.slice(0, 5) ?? [];

  return (
    <section className="rounded-lg border border-[#E7F0E9] bg-[#EFF5F0] p-5 shadow-[0_4px_24px_rgba(8,124,126,0.08)]">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start">
        <div className="min-w-0 flex-1">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#CBDFD4] bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#114F3B]">
            <Sparkles size={14} />
            RAISEC career fit
          </p>
          <h2 className="mt-3 text-2xl font-bold text-[#1E2A44]">
            {riasecResult ? `${riasecResult.hollandCode} - ${riasecResult.label}` : "Connect your interests to the GPS route"}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5D6470]">
            {riasecRouteFitSummary(riasecResult, activeRoute)}
          </p>

          {riasecResult ? (
            <>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-[#CBDFD4] bg-white p-4">
                  <p className="text-xs font-bold uppercase text-[#114F3B]">Primary signal</p>
                  <h3 className="mt-2 text-lg font-bold text-[#1E2A44]">{primaryProfile?.name}</h3>
                  <p className="mt-1 text-sm font-semibold leading-6 text-[#6B7280]">{primaryProfile?.summary}</p>
                </div>
                <div className="rounded-lg border border-[#CBDFD4] bg-white p-4">
                  <p className="text-xs font-bold uppercase text-[#17694F]">Secondary signal</p>
                  <h3 className="mt-2 text-lg font-bold text-[#1E2A44]">{secondaryProfile?.name}</h3>
                  <p className="mt-1 text-sm font-semibold leading-6 text-[#6B7280]">{secondaryProfile?.summary}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
                <div className="rounded-lg border border-[#EAE3D3] bg-white p-4">
                  <p className="text-xs font-bold uppercase text-[#9CA3AF]">Score pattern</p>
                  <div className="mt-4 grid gap-3">
                    {riasecCodeOrder.map((code) => (
                      <RiasecScoreBar key={code} code={code} score={riasecResult.scores[code]} maxScore={maxScore} />
                    ))}
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-lg border border-[#EAE3D3] bg-white p-4">
                    <p className="text-xs font-bold uppercase text-[#9CA3AF]">Suitable work themes</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {themes.map((theme) => (
                        <span key={theme} className="rounded-full bg-[#EFF5F0] px-3 py-1.5 text-xs font-bold text-[#114F3B]">
                          {theme}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border border-[#EAE3D3] bg-white p-4">
                    <p className="text-xs font-bold uppercase text-[#9CA3AF]">Career path lens</p>
                    {pathPreview.length ? (
                      <ol className="mt-3 grid gap-2">
                        {pathPreview.map((milestone) => (
                          <li key={milestone.sequence} className="flex gap-3 text-sm font-semibold leading-5 text-[#1E2A44]">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E7F0E9] text-xs font-black text-[#17694F]">
                              {milestone.sequence}
                            </span>
                            <span>
                              {milestone.title}
                              {milestone.focus_skill_name && (
                                <span className="block text-xs font-bold text-[#6B7280]">Build: {milestone.focus_skill_name}</span>
                              )}
                            </span>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="mt-3 text-sm font-semibold leading-6 text-[#6B7280]">
                        Generate or load a roadmap to connect your interest profile to a milestone path.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="mt-5 rounded-lg border border-dashed border-[#CBDFD4] bg-white p-4 text-sm font-semibold leading-6 text-[#5D6470]">
              Your route can still work without this result, but the report will be stronger after the quick interest check.
            </div>
          )}
        </div>

        <div className="xl:w-[360px]">
          <RiasecAssessment
            initialResult={riasecResult}
            compact
            allowSkip={false}
            onResultChange={onResultChange}
          />
        </div>
      </div>
    </section>
  );
}

function NextBestAction({
  roadmap,
  action,
  isLoading,
  isUpdating,
  error,
  onUpdateStatus,
  onRequestAlternative,
}: {
  roadmap: CareerGpsRoadmap | null;
  action: CareerGpsNextBestActionDetail | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  onUpdateStatus: (action: CareerGpsNextBestActionDetail, status: CareerGpsProgressStatus) => Promise<void>;
  onRequestAlternative: () => Promise<void>;
}) {
  if (!roadmap) {
    return (
      <EmptyPanel
        icon={Flag}
        label="Next Best Action"
        title="Generate a roadmap to unlock the first action"
        description="The shell is ready, but no stored roadmap was found. This phase does not generate a new route."
      />
    );
  }

  if (isLoading) {
    return (
      <section className="rounded-lg border border-[#EAE3D3] bg-white p-5 shadow-[0_4px_24px_rgba(232,25,122,0.08)]">
        <SkeletonBlock className="h-6 w-44" />
        <SkeletonBlock className="mt-4 h-8 w-full max-w-xl" />
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <SkeletonBlock className="h-16" />
          <SkeletonBlock className="h-16" />
          <SkeletonBlock className="h-16" />
          <SkeletonBlock className="h-16" />
        </div>
      </section>
    );
  }

  if (!action) {
    return (
      <EmptyPanel
        icon={CheckCircle2}
        label="Next Best Action"
        title="No available next action"
        description={error ?? "All stored actions for this selected roadmap route are complete or skipped."}
      />
    );
  }

  const routeColor = routeHexColor[action.route_type];
  const disabled = isUpdating;

  return (
    <section className="overflow-hidden rounded-lg border border-[#CBDFD4] bg-white shadow-[0_8px_48px_rgba(6,182,212,0.12)]">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="p-5 lg:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-[#CBDFD4] bg-[#E7F0E9] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#114F3B]">
                <Flag size={14} />
                Your Next Best Action
              </p>
              <h2 className="mt-3 text-2xl font-bold leading-tight text-[#1E2A44]">{action.action_title}</h2>
            </div>
            <span className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-bold ${progressStatusTone(action.status)}`}>
              {progressStatusLabel(action.status)}
            </span>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-[#FECACA] bg-[#FFF5F5] px-3 py-2 text-xs font-bold text-[#DC2626]">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <p className="mt-4 max-w-3xl text-sm leading-6 text-[#6B7280]">{action.why_it_matters}</p>

          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <ActionMetric icon={Clock3} label="Effort" value={action.estimated_effort} />
            <ActionMetric icon={CalendarCheck} label="Target date" value={formatActionDate(action.target_completion_date)} />
            <ActionMetric icon={Route} label="Related milestone" value={action.related_milestone} />
            <ActionMetric icon={Gauge} label="Skill gained" value={action.recommended_skill_gained} />
          </div>

          <div className="mt-5 rounded-lg border border-[#EAE3D3] bg-[#FFFFFF] p-4">
            <p className="text-xs font-bold uppercase text-[#9CA3AF]">Expected impact</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#1E2A44]">{action.expected_impact}</p>
          </div>
        </div>

        <aside className="border-t border-[#EAE3D3] bg-[#EFF5F0] p-5 lg:border-l lg:border-t-0 lg:p-6">
          <div className="rounded-lg bg-white p-4">
            <p className="text-xs font-bold uppercase text-[#9CA3AF]">Route context</p>
            <p className="mt-1 text-sm font-bold" style={{ color: routeColor }}>
              {routeLabels[action.route_type]}
            </p>
            <p className="mt-3 text-xs font-semibold leading-5 text-[#6B7280]">{action.selection_reason}</p>
            {action.is_alternative && (
              <p className="mt-3 inline-flex rounded-full bg-[#E7F0E9] px-3 py-1 text-xs font-bold text-[#17694F]">
                Alternative option
              </p>
            )}
          </div>

          <div className="mt-4 grid gap-2">
            <button
              type="button"
              onClick={() => onUpdateStatus(action, "in_progress")}
              disabled={disabled || action.status === "in_progress"}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#1E2A44] px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
              Start
            </button>
            <button
              type="button"
              onClick={() => onUpdateStatus(action, "completed")}
              disabled={disabled}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#CBDFD4] bg-[#EFF5F0] px-4 py-2.5 text-sm font-bold text-[#114F3B] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CheckCircle2 size={16} />
              Mark complete
            </button>
            <button
              type="button"
              onClick={() => onUpdateStatus(action, "skipped")}
              disabled={disabled}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#DFD6BE] bg-white px-4 py-2.5 text-sm font-bold text-[#17694F] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <SkipForward size={16} />
              Skip
            </button>
            <button
              type="button"
              onClick={onRequestAlternative}
              disabled={disabled}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#E3D8BC] bg-[#F6F1E4] px-4 py-2.5 text-sm font-bold text-[#B08A44] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={16} />
              Request alternative
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}

function ActionMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-[#EAE3D3] bg-white p-3">
      <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#9CA3AF]">
        <Icon size={14} />
        {label}
      </div>
      <p className="mt-2 text-sm font-bold leading-5 text-[#1E2A44]">{value}</p>
    </div>
  );
}

function MetricBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-xs font-bold text-[#6B7280]">
        <span>{label}</span>
        <span className="text-[#1E2A44]">{value}%</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-[#EAE3D3]">
        <div className="h-2 rounded-full bg-[#B08A44]" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}

function RouteSelectorMetric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-md bg-white/80 px-2 py-1.5">
      <p className="text-[10px] font-bold uppercase text-[#9CA3AF]">{label}</p>
      <div className="mt-0.5 line-clamp-2 text-xs font-bold leading-4 text-[#1E2A44]">{value}</div>
    </div>
  );
}

function RouteComparisonMatrix({
  routes: routeOptions,
  activeRoute,
}: {
  routes: CareerGpsRoute[];
  activeRoute: CareerGpsRoute;
}) {
  const baseline = routeOptions.find((route) => route.route_type === "recommended") ?? routeOptions[0] ?? activeRoute;
  const rows = [
    {
      label: "Timeline",
      value: (route: CareerGpsRoute) => routeTimelineDifference(route, baseline),
    },
    {
      label: "Skill gaps",
      value: (route: CareerGpsRoute) => routeSkillGapDelta(route, baseline),
    },
    {
      label: "Lifestyle",
      value: (route: CareerGpsRoute) => routeMetricDifference(route, baseline, "lifestyle_fit"),
    },
    {
      label: "Career risk",
      value: (route: CareerGpsRoute) => routeRiskLabel(route),
    },
    {
      label: "Destination",
      value: (route: CareerGpsRoute) => routeDestinationDifference(route, baseline),
    },
  ];

  return (
    <div className="mt-3 rounded-lg border border-[#EAE3D3] bg-[#FFFFFF] p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#9CA3AF]">Route comparison</p>
          <p className="mt-1 text-sm font-semibold leading-5 text-[#6B7280]">
            Differences are shown against the Recommended Route baseline and use stored route data only.
          </p>
        </div>
        <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-bold text-[#17694F]">
          Active: {routeLabels[activeRoute.route_type]}
        </span>
      </div>

      <div className="mt-3 overflow-x-auto">
        <div className="min-w-[720px] overflow-hidden rounded-lg border border-[#EAE3D3] bg-white">
          <div className="grid grid-cols-[130px_repeat(3,minmax(0,1fr))] border-b border-[#EAE3D3] bg-[#F7F3EA] text-xs font-bold uppercase text-[#9CA3AF]">
            <div className="px-3 py-2">Signal</div>
            {routeOptions.map((route) => (
              <div
                key={route.route_type}
                className={`px-3 py-2 ${route.route_type === activeRoute.route_type ? routeTone[route.route_type].accent : ""}`}
              >
                {routeLabels[route.route_type]}
              </div>
            ))}
          </div>
          {rows.map((row) => (
            <div key={row.label} className="grid grid-cols-[130px_repeat(3,minmax(0,1fr))] border-b border-[#EAE3D3] last:border-b-0">
              <div className="px-3 py-2 text-xs font-bold uppercase text-[#9CA3AF]">{row.label}</div>
              {routeOptions.map((route) => (
                <div
                  key={`${row.label}-${route.route_type}`}
                  className={`px-3 py-2 text-xs font-semibold leading-5 ${
                    route.route_type === activeRoute.route_type ? "bg-[#F6F1E4] text-[#1E2A44]" : "text-[#6B7280]"
                  }`}
                >
                  {row.value(route)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RouteSelectorShell({
  roadmap,
  selectedRouteType,
  isSavingSelectedRoute,
  routeSelectionError,
  onSelectRoute,
}: {
  roadmap: CareerGpsRoadmap | null;
  selectedRouteType: CareerGpsRouteType;
  isSavingSelectedRoute: boolean;
  routeSelectionError: string | null;
  onSelectRoute: (routeType: CareerGpsRouteType) => void;
}) {
  if (!roadmap) {
    return (
      <EmptyPanel
        icon={Route}
        label="Route selector"
        title="Route choices will appear here"
        description="Recommended, accelerated, and balanced routes will use stored backend route data once a roadmap exists."
      />
    );
  }

  const activeRoute = selectedRoute(roadmap, selectedRouteType) ?? roadmap.routes[0];

  if (!activeRoute) {
    return (
      <EmptyPanel
        icon={Route}
        label="Route selector"
        title="No routes are stored on this roadmap"
        description="Regenerate the roadmap from the existing dashboard roadmap panel when route generation is in scope."
      />
    );
  }

  return (
    <section className="rounded-lg border border-[#EAE3D3] bg-white p-4 shadow-[0_4px_20px_rgba(26,16,51,0.06)]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E7F0E9] text-[#114F3B]">
            <Route size={18} />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-[#9CA3AF]">Route selector</p>
            <h2 className="truncate text-lg font-bold text-[#1E2A44]">{activeRoute.title}</h2>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-3 xl:min-w-[880px]">
          {roadmap.routes.map((route) => {
            const selected = route.route_type === selectedRouteType;
            const tone = routeTone[route.route_type];
            const advantage = strongestComponent(route);
            const tradeoff = weakestComponent(route);
            return (
              <button
                key={route.route_type}
                type="button"
                onClick={() => onSelectRoute(route.route_type)}
                disabled={isSavingSelectedRoute}
                aria-pressed={selected}
                className={`min-h-[184px] rounded-lg border px-3 py-3 text-left outline-none transition hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#B08A44] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70 ${
                  selected
                    ? `${tone.border} ${tone.bg} ring-2 ${tone.ring} shadow-[0_8px_24px_rgba(26,16,51,0.07)]`
                    : "border-[#EAE3D3] bg-[#FFFFFF] hover:border-[#DFD6BE] hover:shadow-[0_8px_24px_rgba(26,16,51,0.06)]"
                }`}
              >
                <span className={`flex items-center justify-between gap-2 text-xs font-bold ${selected ? tone.accent : "text-[#6B7280]"}`}>
                  {routeLabels[route.route_type]}
                  {selected && <CheckCircle2 size={15} className="shrink-0 text-[#17694F]" />}
                </span>
                <span className="mt-1 block line-clamp-2 text-sm font-bold leading-5 text-[#1E2A44]">
                  {route.target_occupation.title}
                </span>
                <span className="mt-1 block line-clamp-2 text-xs font-semibold leading-5 text-[#8B7434]">
                  Branch: {routeBranchDecision(route)}
                </span>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <RouteSelectorMetric label="Timeline" value={`${route.estimated_months} months`} />
                  <RouteSelectorMetric label="Overall fit" value={`${Math.round(route.score)}%`} />
                  <RouteSelectorMetric label="Advantage" value={componentText(advantage)} />
                  <RouteSelectorMetric label="Trade-off" value={componentText(tradeoff)} />
                  <RouteSelectorMetric label="Confidence" value={confidenceLevel(route.score)} />
                  <RouteSelectorMetric label="Risk" value={routeRiskLabel(route)} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {routeSelectionError && (
        <div className="mt-3">
          <AlertMessage>{routeSelectionError}</AlertMessage>
        </div>
      )}
      <RouteComparisonMatrix routes={roadmap.routes} activeRoute={activeRoute} />
    </section>
  );
}

function nodePositions(milestoneCount: number) {
  const milestoneSlots = Math.max(1, milestoneCount);
  const yPattern = [28, 64, 36, 70, 32, 60, 42, 66];
  return {
    start: { x: 7, y: 54 },
    milestones: Array.from({ length: milestoneCount }, (_, index) => ({
      x: 18 + ((index + 0.5) * 61) / milestoneSlots,
      y: yPattern[index % yPattern.length],
    })),
    destination: { x: 93, y: 46 },
  };
}

function buildJourneyNodes(
  route: CareerGpsRoute,
  progressByKey: ProgressEntriesByKey,
  demoMode = false,
  roadmap: CareerGpsRoadmap | null = null,
) {
  const positions = nodePositions(route.milestones.length);
  const readiness = readinessFromRoute(route);
  const activeProgressIndex = route.milestones.findIndex(
    (milestone) => progressByKey[progressKey(route.route_type, milestone.sequence)]?.status === "in_progress",
  );
  const firstIncompleteIndex = route.milestones.findIndex(
    (milestone) =>
      progressByKey[progressKey(route.route_type, milestone.sequence)]?.status !== "completed" &&
      !(roadmap && isCompletedOnAnyRoute(milestone, roadmap, progressByKey)),
  );
  const activeIndex = activeProgressIndex >= 0 ? activeProgressIndex : firstIncompleteIndex;
  const milestoneNodes: JourneyNode[] = route.milestones.map((milestone, index) => ({
    id: `${route.route_type}-milestone-${milestone.sequence}`,
    title: milestone.title,
    stage: `Milestone ${milestone.sequence}`,
    timing: milestoneTiming(milestone, route),
    readiness,
    status:
      progressByKey[progressKey(route.route_type, milestone.sequence)]?.status === "completed" ||
      (roadmap && isCompletedOnAnyRoute(milestone, roadmap, progressByKey))
        ? "completed"
        : index === activeIndex
          ? "active"
          : demoMode && activeIndex >= 0 && index > activeIndex + 1
            ? "locked"
          : "future",
    missingRequirement: missingRequirement(milestone, route),
    milestone,
    sequence: milestone.sequence,
    desktop: positions.milestones[index],
    lane: index % 3,
    mapModeHint: isDecisionNode({ title: milestone.title } as JourneyNode) ? "decisions" : "skills",
  }));

  return [
    {
      id: `${route.route_type}-start`,
      title: "Career GPS start",
      stage: "Starting point",
      timing: "Now",
      readiness: Math.round(route.score),
      status: "start",
      missingRequirement: route.skill_gaps[0]?.skill_name ?? "Target role evidence",
      milestone: null,
      sequence: 0,
      desktop: positions.start,
      lane: 1,
      mapModeHint: "roadmap",
    },
    ...milestoneNodes,
    {
      id: `${route.route_type}-destination`,
      title: route.target_occupation.title,
      stage: route.target_occupation.seniority_level ?? "Destination",
      timing: `${route.estimated_months} months`,
      readiness: Math.round(route.score),
      status: "destination",
      missingRequirement: route.skill_gaps[0]?.skill_name ?? "Role evidence",
      milestone: null,
      sequence: route.milestones.length + 1,
      desktop: positions.destination,
      lane: 1,
      mapModeHint: "roadmap",
    },
  ] satisfies JourneyNode[];
}

function isDecisionNode(node: JourneyNode) {
  return /branch|decision/i.test(node.title);
}

function DetailBlock({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-lg bg-[#FFFFFF] p-3">
      <p className="text-xs font-bold uppercase text-[#9CA3AF]">{label}</p>
      <div className="mt-1 text-sm font-bold leading-5 text-[#1E2A44]">{value}</div>
    </div>
  );
}

function DetailMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#EAE3D3] bg-[#FFFFFF] px-3 py-2">
      <p className="text-[11px] font-bold uppercase text-[#9CA3AF]">{label}</p>
      <p className="mt-1 truncate text-sm font-black text-[#1E2A44]">{value}</p>
    </div>
  );
}

function milestoneEvidenceReadinessFromDetail(
  node: JourneyNode,
  milestoneProgress: CareerGpsProgressEntry | null,
  actionProgressEntries: Array<CareerGpsProgressEntry | null>,
) {
  if (milestoneProgress?.status === "completed") return 100;
  const actionScores = actionProgressEntries.map((entry) => readinessScoreForStatus(entry?.status));
  if (!actionScores.length) return node.readiness;
  return Math.round(actionScores.reduce((total, value) => total + value, 0) / actionScores.length);
}

function ChipList({ items, emptyLabel }: { items: string[]; emptyLabel: string }) {
  if (!items.length) return <span className="text-[#6B7280]">{emptyLabel}</span>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-[#17694F]">
          {item}
        </span>
      ))}
    </div>
  );
}

function ActionProgressEditor({
  action,
  progress,
  routeType,
  milestoneSequence,
  isSaving,
  onSaveProgress,
}: {
  action: CareerGpsMilestone["actions"][number];
  progress: CareerGpsProgressEntry | null;
  routeType: CareerGpsRouteType;
  milestoneSequence: number;
  isSaving: boolean;
  onSaveProgress: SaveProgressHandler;
}) {
  const reduceMotion = useReducedMotion() ?? false;
  const [notes, setNotes] = useState(progress?.notes ?? "");
  const [evidenceUrl, setEvidenceUrl] = useState(progress?.evidence_url ?? "");
  const [completedAt, setCompletedAt] = useState(progress?.completed_at?.slice(0, 10) ?? "");

  useEffect(() => {
    setNotes(progress?.notes ?? "");
    setEvidenceUrl(progress?.evidence_url ?? "");
    setCompletedAt(progress?.completed_at?.slice(0, 10) ?? "");
  }, [progress?.id, progress?.notes, progress?.evidence_url, progress?.completed_at]);

  const save = (statusValue: CareerGpsProgressStatus) =>
    onSaveProgress("action", {
      route_type: routeType,
      milestone_sequence: milestoneSequence,
      action_sequence: action.sequence,
      status: statusValue,
      notes,
      evidence_url: evidenceUrl,
      completed_at: statusValue === "completed" ? completedAt || todayIsoDate() : null,
    });
  const isStarted = progress?.status === "in_progress" || progress?.status === "completed";

  return (
    <motion.div
      layout
      animate={
        reduceMotion
          ? { opacity: 1 }
          : progress?.status === "completed"
            ? { scale: [1, 1.015, 1], borderColor: ["#EAE3D3", "#17694F", "#EAE3D3"] }
            : { scale: 1 }
      }
      transition={{ duration: 0.36, ease: "easeOut" }}
      className="rounded-lg border border-[#EAE3D3] bg-white p-3"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-[#9CA3AF]">{action.action_type}</p>
          <h4 className="mt-1 text-sm font-bold leading-5 text-[#1E2A44]">{action.title}</h4>
          {action.description && <p className="mt-1 text-xs font-semibold leading-5 text-[#6B7280]">{action.description}</p>}
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-[#E7F0E9] px-2.5 py-1 text-xs font-bold text-[#17694F]">
          {progress?.status === "completed" && (
            <motion.span
              initial={reduceMotion ? false : { scale: 0, rotate: -18 }}
              animate={reduceMotion ? { scale: 1 } : { scale: [0, 1.2, 1], rotate: [-18, 8, 0] }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="flex text-[#17694F]"
            >
              <CheckCircle2 size={13} />
            </motion.span>
          )}
          {progressStatusLabel(progress?.status)}
        </span>
      </div>

      <div className="mt-3 grid gap-2">
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={2}
          maxLength={600}
          placeholder="Short progress note"
          className="w-full rounded-lg border border-[#DFD6BE] px-3 py-2 text-sm font-semibold text-[#1E2A44] outline-none placeholder:text-[#9CA3AF] focus:border-[#B08A44] focus:ring-2 focus:ring-[#B08A44]/15"
        />
        <input
          value={evidenceUrl}
          onChange={(event) => setEvidenceUrl(event.target.value)}
          placeholder="Evidence URL or internal proof link"
          className="min-h-10 rounded-lg border border-[#DFD6BE] px-3 text-sm font-semibold text-[#1E2A44] outline-none placeholder:text-[#9CA3AF] focus:border-[#B08A44] focus:ring-2 focus:ring-[#B08A44]/15"
        />
        <label className="grid gap-1 text-xs font-bold uppercase text-[#9CA3AF]">
          Completion date
          <input
            type="date"
            value={completedAt}
            onChange={(event) => setCompletedAt(event.target.value)}
            className="min-h-10 rounded-lg border border-[#DFD6BE] px-3 text-sm font-semibold normal-case text-[#1E2A44] outline-none focus:border-[#B08A44] focus:ring-2 focus:ring-[#B08A44]/15"
          />
        </label>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {!isStarted && (
          <button
            type="button"
            onClick={() => save("in_progress")}
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-1 rounded-lg bg-[#B08A44] px-2 py-2 text-xs font-bold text-white outline-none transition hover:bg-[#97742F] focus-visible:ring-2 focus-visible:ring-[#1E2A44] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
          >
            <Play size={13} />
            Start action
          </button>
        )}
        {(["in_progress", "completed"] as CareerGpsProgressStatus[]).map((statusValue) => (
          <button
            key={statusValue}
            type="button"
            onClick={() => save(statusValue)}
            disabled={isSaving}
            className={`rounded-lg border px-2 py-2 text-xs font-bold outline-none transition focus-visible:ring-2 focus-visible:ring-[#B08A44] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60 ${
              progress?.status === statusValue
                ? "border-[#B08A44] bg-[#F6F1E4] text-[#B08A44]"
                : "border-[#DFD6BE] bg-white text-[#17694F] hover:border-[#B08A44]"
            }`}
          >
            {statusValue === "in_progress" ? "Mark in progress" : "Mark complete"}
          </button>
        ))}
        <button
          type="button"
          onClick={() => save(progress?.status ?? "not_started")}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-1 rounded-lg bg-[#1E2A44] px-2 py-2 text-xs font-bold text-white outline-none transition hover:bg-[#16233C] focus-visible:ring-2 focus-visible:ring-[#B08A44] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
        >
          {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          Save
        </button>
      </div>
    </motion.div>
  );
}

function JourneyDetailPanel({
  node,
  route,
  roadmap,
  progressByKey,
  milestoneDetail,
  isDetailLoading,
  detailError,
  isSavingProgress,
  progressError,
  onSaveProgress,
  onClose,
  onPrevious,
  onNext,
  canPrevious,
  canNext,
}: {
  node: JourneyNode;
  route: CareerGpsRoute;
  roadmap: CareerGpsRoadmap;
  progressByKey: ProgressEntriesByKey;
  milestoneDetail: CareerGpsMilestoneDetail | null;
  isDetailLoading: boolean;
  detailError: string | null;
  isSavingProgress: boolean;
  progressError: string | null;
  onSaveProgress: SaveProgressHandler;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  canPrevious: boolean;
  canNext: boolean;
}) {
  const reduceMotion = useReducedMotion() ?? false;
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const milestone = node.milestone;
  const routeRoles = roadmap.routes.map((item) => item.target_occupation.title);
  const requiredSkills = milestoneDetail?.required_skills ?? route.skill_gaps.map((gap) => gap.skill_name);
  const existingSkills = milestoneDetail?.existing_skills ?? [];
  const missingSkills = milestoneDetail?.missing_skills ?? route.skill_gaps.map((gap) => gap.skill_name);
  const milestoneProgress = milestone
    ? progressByKey[progressKey(route.route_type, milestone.sequence)] ?? null
    : null;
  const actionProgressEntries = milestone?.actions.map((action) => progressByKey[progressKey(route.route_type, milestone.sequence, action.sequence)] ?? null) ?? [];
  const canCompleteMilestone =
    !!milestone &&
    milestone.actions.length > 0 &&
    actionProgressEntries.every((entry) => entry?.status === "completed");
  const readiness = milestone ? milestoneEvidenceReadinessFromDetail(node, milestoneProgress, actionProgressEntries) : Math.round(route.score);
  const recommendedAction = milestoneDetail?.immediate_actions[0] ?? milestone?.actions[0] ?? null;
  const validCertification = milestoneDetail?.recommended_certification && !/no mandatory|no required|none/i.test(milestoneDetail.recommended_certification)
    ? milestoneDetail.recommended_certification
    : null;

  useEffect(() => {
    setActionMessage(null);
  }, [node.id]);

  const saveMilestone = (statusValue: CareerGpsProgressStatus) => {
    if (!milestone) return Promise.resolve();
    return onSaveProgress("milestone", {
      route_type: route.route_type,
      milestone_sequence: milestone.sequence,
      action_sequence: null,
      status: statusValue,
      notes: milestoneProgress?.notes ?? null,
      evidence_url: milestoneProgress?.evidence_url ?? null,
      completed_at: statusValue === "completed" ? milestoneProgress?.completed_at?.slice(0, 10) ?? todayIsoDate() : null,
    });
  };

  return (
    <motion.aside
      layout
      initial={reduceMotion ? false : { opacity: 0, x: 18 }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 18 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="mx-auto max-w-6xl rounded-lg border border-[#EAE3D3] bg-white p-4 shadow-[0_6px_24px_rgba(26,16,51,0.07)] sm:p-5"
      aria-label="Selected milestone detail"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-[#CBDFD4] bg-[#E7F0E9] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#114F3B]">
            <Map size={14} />
            Milestone details
          </p>
          <h3 className="mt-3 text-xl font-bold leading-7 text-[#1E2A44]">{node.title}</h3>
          {isDetailLoading && (
            <p className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-[#6B7280]">
              <Loader2 size={13} className="animate-spin text-[#B08A44]" />
              Loading detail...
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <motion.span
            key={milestone ? progressStatusLabel(milestoneProgress?.status) : statusLabel(node.status)}
            initial={reduceMotion ? false : { opacity: 0.7, scale: 0.96 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.18 }}
            className="rounded-lg bg-[#FFFFFF] px-3 py-2 text-xs font-bold text-[#17694F]"
          >
            {milestone ? progressStatusLabel(milestoneProgress?.status) : statusLabel(node.status)}
          </motion.span>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#EAE3D3] bg-white text-[#6B7280] outline-none transition hover:border-[#B08A44] hover:text-[#B08A44] focus-visible:ring-2 focus-visible:ring-[#B08A44] focus-visible:ring-offset-2"
            aria-label="Close milestone detail panel"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <motion.div layout className="mt-3 grid grid-cols-3 gap-2">
        <DetailMetric label="Status" value={milestone ? progressStatusLabel(milestoneProgress?.status) : statusLabel(node.status)} />
        <DetailMetric label="Readiness" value={`${readiness}%`} />
        <DetailMetric label="Timing" value={milestoneDetail?.estimated_timeline ?? node.timing} />
      </motion.div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <Link
          href={routes.employeeCareerBuddy}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#E3D8BC] bg-[#F6F1E4] px-3 text-xs font-bold text-[#B08A44] outline-none transition hover:border-[#B08A44] focus-visible:ring-2 focus-visible:ring-[#B08A44] focus-visible:ring-offset-2"
        >
          <Bot size={15} />
          Ask Buddy
        </Link>
        <button
          type="button"
          onClick={() => setActionMessage(`Focus saved for ${node.title}. Demo mode would pin this station to your weekly plan.`)}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#CBDFD4] bg-[#E7F0E9] px-3 text-xs font-bold text-[#17694F] outline-none transition hover:border-[#17694F] focus-visible:ring-2 focus-visible:ring-[#17694F] focus-visible:ring-offset-2"
        >
          <Save size={15} />
          Save Focus
        </button>
        <button
          type="button"
          onClick={() => setActionMessage(`${routeLabels[route.route_type]} comparison opened for ${node.title}. Demo proof uses stored route scores and milestones.`)}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#DFD6BE] bg-[#E7F0E9] px-3 text-xs font-bold text-[#17694F] outline-none transition hover:border-[#17694F] focus-visible:ring-2 focus-visible:ring-[#17694F] focus-visible:ring-offset-2"
        >
          <SlidersHorizontal size={15} />
          Compare
        </button>
      </div>

      <AnimatePresence>
        {actionMessage && (
          <motion.div
            key={actionMessage}
            initial={reduceMotion ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="mt-3 flex items-start justify-between gap-3 rounded-lg border border-[#CBDFD4] bg-[#EFF5F0] px-3 py-2 text-xs font-bold leading-5 text-[#114F3B]"
            role="status"
          >
            <span>{actionMessage}</span>
            <button
              type="button"
              onClick={() => setActionMessage(null)}
              className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[#114F3B] outline-none transition hover:bg-white focus-visible:ring-2 focus-visible:ring-[#114F3B]"
              aria-label="Dismiss action confirmation"
            >
              <X size={13} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onPrevious}
          disabled={!canPrevious}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#DFD6BE] bg-white px-3 text-xs font-bold text-[#17694F] outline-none transition hover:border-[#B08A44] hover:text-[#B08A44] focus-visible:ring-2 focus-visible:ring-[#B08A44] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft size={15} />
          Previous
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canNext}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#DFD6BE] bg-white px-3 text-xs font-bold text-[#17694F] outline-none transition hover:border-[#B08A44] hover:text-[#B08A44] focus-visible:ring-2 focus-visible:ring-[#B08A44] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
          <ChevronRight size={15} />
        </button>
      </div>

      {(detailError || progressError) && (
        <div className="mt-3 rounded-lg border border-[#FECACA] bg-[#FFF5F5] px-3 py-2 text-xs font-bold leading-5 text-[#DC2626]">
          {detailError ?? progressError}
        </div>
      )}

      <p className="mt-3 max-w-4xl text-sm font-semibold leading-6 text-[#6B7280]">
        {milestoneDetail?.why_recommended ?? milestone?.description ?? route.summary}
      </p>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <DetailBlock label="Why it matters" value={milestoneDetail?.why_recommended ?? milestone?.description ?? route.summary} />
        <DetailBlock label="Missing skills" value={<ChipList items={missingSkills} emptyLabel="No major missing skill stored." />} />
        <DetailBlock
          label="Recommended action"
          value={
            recommendedAction ? (
              <div>
                <p>{recommendedAction.title}</p>
                {recommendedAction.description && <p className="mt-1 text-xs font-semibold leading-5 text-[#6B7280]">{recommendedAction.description}</p>}
              </div>
            ) : (
              "No immediate action is stored for this milestone."
            )
          }
        />
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <DetailBlock label="Required skills" value={<ChipList items={requiredSkills} emptyLabel="No required skills stored." />} />
        <DetailBlock label="Existing skills" value={<ChipList items={existingSkills} emptyLabel="No existing skills stored on profile." />} />
      </div>

      <details className="group mt-3 rounded-lg border border-[#EAE3D3] bg-[#FFFFFF] p-3">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-[#1E2A44]">
          More context
          <ChevronDown size={16} className="transition group-open:rotate-180" />
        </summary>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <DetailBlock
            label="Certification"
            value={validCertification ?? "No valid required certification is stored for this milestone."}
          />
          <DetailBlock
            label="Experience"
            value={milestoneDetail?.recommended_experience ?? `Complete one applied ${route.target_occupation.family} work sample.`}
          />
          <DetailBlock
            label="Suggested project"
            value={milestoneDetail?.suggested_project ?? milestone?.actions.find((action) => action.action_type === "project")?.title ?? "No project action stored for this milestone."}
          />
          <DetailBlock label="Target roles" value={<ChipList items={milestoneDetail?.relevant_target_roles ?? routeRoles} emptyLabel="No target roles stored." />} />
          <DetailBlock label="Difficulty" value={milestoneDetail?.transition_difficulty ?? componentText(component(route, "transition_difficulty") ?? null)} />
          <DetailBlock
            label="Lifestyle impact"
            value={milestoneDetail?.lifestyle_impact ?? `${componentText(component(route, "lifestyle_fit") ?? null)} / ${componentText(component(route, "work_life_balance_fit") ?? null)}`}
          />
          <DetailBlock label="Confidence" value={milestoneDetail?.confidence_level ?? confidenceLevel(route.score)} />
          <DetailBlock
            label="Assumptions"
            value={
              <ul className="list-disc space-y-1 pl-4">
                {(milestoneDetail?.main_assumptions ?? [
                  "Scores are deterministic planning scores from saved profile, route, and illustrative occupation data.",
                  "No salary data is shown because no validated salary source is attached to this roadmap.",
                ]).map((assumption) => (
                  <li key={assumption}>{assumption}</li>
                ))}
              </ul>
            }
          />
        </div>
      </details>

      {milestone ? (
        <details className="group mt-4 rounded-lg border border-[#CBDFD4] bg-[#EFF5F0] p-3">
          <summary className="flex cursor-pointer list-none flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-bold uppercase text-[#17694F]">
                <ListChecks size={14} />
                Update actions
              </p>
              <p className="mt-1 text-xs font-semibold leading-5 text-[#17694F]">
                {milestone.actions.length} saved actions. Expand when you want to add notes, evidence, or progress.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-bold text-[#17694F]">
              Show progress controls
              <ChevronDown size={15} className="transition group-open:rotate-180" />
            </span>
          </summary>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-semibold leading-5 text-[#17694F]">
              Complete all actions before marking the milestone complete.
            </p>
            <button
              type="button"
              onClick={() => saveMilestone("completed")}
              disabled={!canCompleteMilestone || isSavingProgress}
              className={`relative inline-flex min-h-10 items-center justify-center gap-2 overflow-hidden rounded-lg bg-[#17694F] px-3 py-2 text-xs font-bold text-white outline-none transition hover:bg-[#17694F] focus-visible:ring-2 focus-visible:ring-[#114F3B] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                milestoneProgress?.status === "completed" ? "ring-2 ring-[#CBDFD4]" : ""
              }`}
            >
              {milestoneProgress?.status === "completed" && (
                <motion.span
                  className="absolute inset-0 bg-white/25"
                  initial={reduceMotion ? false : { x: "-100%" }}
                  animate={reduceMotion ? { opacity: 0 } : { x: "100%" }}
                  transition={{ duration: 0.55, ease: "easeOut" }}
                  aria-hidden="true"
                />
              )}
              {isSavingProgress ? <Loader2 size={14} className="animate-spin" /> : <CalendarCheck size={14} />}
              Mark milestone complete
            </button>
          </div>

          <div className="mt-3 grid gap-3 xl:grid-cols-2">
            {milestone.actions.map((action) => (
              <ActionProgressEditor
                key={action.sequence}
                action={action}
                progress={progressByKey[progressKey(route.route_type, milestone.sequence, action.sequence)] ?? null}
                routeType={route.route_type}
                milestoneSequence={milestone.sequence}
                isSaving={isSavingProgress}
                onSaveProgress={onSaveProgress}
              />
            ))}
          </div>
        </details>
      ) : (
        <div className="mt-4 rounded-lg border border-[#EAE3D3] bg-[#FFFFFF] p-3 text-sm font-semibold leading-6 text-[#6B7280]">
          <FileText size={16} className="mb-2 text-[#17694F]" />
          Select a milestone station to update action progress and evidence.
        </div>
      )}
    </motion.aside>
  );
}

type CareerPathPoint = {
  id: string;
  x: number;
  y: number;
  node: JourneyNode;
};

type CareerRouteBranch = {
  route: CareerGpsRoute;
  path: string;
  labelX: number;
  labelY: number;
};

const careerMapHeight = 580;

function buildCareerPathPoints(nodes: JourneyNode[]) {
  const width = Math.max(1060, 260 + Math.max(0, nodes.length - 1) * 210);
  const yPattern = [332, 218, 350, 244, 374, 256, 330, 226, 358, 270];
  const usableWidth = width - 240;
  const interval = nodes.length > 1 ? usableWidth / (nodes.length - 1) : 0;
  const points = nodes.map<CareerPathPoint>((node, index) => ({
    id: node.id,
    x: 120 + index * interval,
    y: node.status === "start" ? 332 : node.status === "destination" ? 292 : yPattern[index % yPattern.length],
    node,
  }));
  return { width, height: careerMapHeight, points };
}

function smoothPath(points: Array<Pick<CareerPathPoint, "x" | "y">>) {
  if (!points.length) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  return points.slice(1).reduce((path, point, index) => {
    const previous = points[index];
    const distance = Math.max(90, Math.abs(point.x - previous.x) * 0.52);
    return `${path} C ${previous.x + distance} ${previous.y}, ${point.x - distance} ${point.y}, ${point.x} ${point.y}`;
  }, `M ${points[0].x} ${points[0].y}`);
}

function buildCareerRouteBranches({
  roadmap,
  activeRoute,
  points,
  width,
}: {
  roadmap: CareerGpsRoadmap;
  activeRoute: CareerGpsRoute;
  points: CareerPathPoint[];
  width: number;
}) {
  const origin = points[Math.min(1, Math.max(0, points.length - 1))] ?? points[0];
  const tracks = [112, 492];
  return roadmap.routes
    .filter((route) => route.route_type !== activeRoute.route_type)
    .map<CareerRouteBranch>((route, index) => {
      const trackY = tracks[index % tracks.length];
      const bendX = Math.min(origin.x + 220, width - 560);
      const labelX = width - 210;
      return {
        route,
        path: smoothPath([
          { x: origin.x, y: origin.y },
          { x: bendX, y: trackY },
          { x: Math.max(bendX + 260, width - 430), y: trackY },
          { x: labelX, y: trackY + (index % 2 === 0 ? 20 : -20) },
        ]),
        labelX,
        labelY: trackY,
      };
    });
}

function CareerPath({
  points,
  width,
  height,
  activeRoute,
  branches,
  activeIndex,
  reduceMotion,
  onSelectRoute,
}: {
  points: CareerPathPoint[];
  width: number;
  height: number;
  activeRoute: CareerGpsRoute;
  branches: CareerRouteBranch[];
  activeIndex: number;
  reduceMotion: boolean;
  onSelectRoute: (routeType: CareerGpsRouteType) => void;
}) {
  const routeColor = routeHexColor[activeRoute.route_type];
  const fullPath = smoothPath(points);
  const progressPath = smoothPath(points.slice(0, Math.max(2, activeIndex + 1)));

  return (
    <>
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${routeLabels[activeRoute.route_type]} career route path`}
      >
        <defs>
          <linearGradient id="career-gps-active-gradient" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="#17694F" />
            <stop offset="52%" stopColor={routeColor} />
            <stop offset="100%" stopColor="#B08A44" />
          </linearGradient>
          <filter id="career-gps-path-glow" x="-10%" y="-60%" width="120%" height="220%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="0 0 0 0 0.91 0 0 0 0 0.10 0 0 0 0 0.48 0 0 0 0.22 0"
            />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path d={fullPath} fill="none" stroke="#EAE3D3" strokeLinecap="round" strokeWidth="34" />
        <motion.path
          d={fullPath}
          fill="none"
          stroke="#FFFFFF"
          strokeLinecap="round"
          strokeWidth="20"
          initial={reduceMotion ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.95, ease: "easeOut" }}
        />
        <motion.path
          d={fullPath}
          fill="none"
          stroke="url(#career-gps-active-gradient)"
          strokeLinecap="round"
          strokeWidth="12"
          initial={reduceMotion ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.08 }}
          opacity={0.24}
        />
        <motion.path
          d={progressPath}
          fill="none"
          filter="url(#career-gps-path-glow)"
          stroke="url(#career-gps-active-gradient)"
          strokeLinecap="round"
          strokeWidth="12"
          initial={reduceMotion ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.95, ease: "easeOut", delay: 0.2 }}
        />

        {branches.map((branch) => (
          <motion.path
            key={branch.route.route_type}
            d={branch.path}
            fill="none"
            stroke={routeHexColor[branch.route.route_type]}
            strokeLinecap="round"
            strokeDasharray="12 16"
            strokeWidth="6"
            initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.42 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.35 }}
          />
        ))}
      </svg>

      {branches.map((branch, index) => (
        <motion.button
          key={branch.route.route_type}
          type="button"
          onClick={() => onSelectRoute(branch.route.route_type)}
          initial={reduceMotion ? false : { opacity: 0, y: index % 2 === 0 ? -8 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut", delay: 0.55 + index * 0.08 }}
          className={`absolute z-10 w-[190px] -translate-x-1/2 rounded-lg border bg-white/95 px-3 py-2 text-left shadow-[0_10px_26px_rgba(26,16,51,0.10)] backdrop-blur outline-none transition hover:-translate-y-1 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-[#B08A44] focus-visible:ring-offset-2 ${routeTone[branch.route.route_type].border}`}
          style={{ left: branch.labelX, top: branch.labelY }}
        >
          <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase ${routeTone[branch.route.route_type].accent}`}>
            <GitBranch size={12} />
            Optional route
          </span>
          <span className="mt-1 block text-xs font-black leading-4 text-[#1E2A44]">{routeLabels[branch.route.route_type]}</span>
          <span className="mt-1 block text-[11px] font-bold leading-4 text-[#6B7280]">
            {branch.route.estimated_months} mo / {Math.round(branch.route.score)}% fit
          </span>
        </motion.button>
      ))}
    </>
  );
}

function CareerAvatar({
  label,
  sublabel,
  reduceMotion,
}: {
  label: string;
  sublabel: string | null;
  reduceMotion: boolean;
}) {
  return (
    <div className="relative flex h-16 w-16 items-center justify-center">
      {!reduceMotion && (
        <motion.span
          className="absolute inset-0 rounded-full border border-[#B08A44]/50"
          animate={{ scale: [1, 1.35, 1], opacity: [0.55, 0, 0.55] }}
          transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden="true"
        />
      )}
      <div className="relative flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-[#F6F1E4] text-2xl font-black text-[#1E2A44] shadow-[0_14px_32px_rgba(232,25,122,0.26)]">
        <span className="leading-none">{label}</span>
        {sublabel && (
          <span className="absolute -bottom-2 rounded-full border border-[#E3D8BC] bg-white px-2 py-0.5 text-[10px] font-black leading-none text-[#B08A44]">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}

function CompletedBurst({ reduceMotion }: { reduceMotion: boolean }) {
  if (reduceMotion) return null;
  return (
    <span className="pointer-events-none absolute inset-0" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, index) => {
        const angle = (Math.PI * 2 * index) / 6;
        return (
          <motion.span
            key={index}
            className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-[#B08A44]"
            initial={{ x: "-50%", y: "-50%", scale: 0, opacity: 0 }}
            animate={{
              x: Math.cos(angle) * 32 - 3,
              y: Math.sin(angle) * 32 - 3,
              scale: [0, 1, 0],
              opacity: [0, 0.8, 0],
            }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.45 + index * 0.03 }}
          />
        );
      })}
    </span>
  );
}

function CareerMilestone({
  point,
  selected,
  active,
  next,
  meta,
  reduceMotion,
  avatarLabel,
  avatarSublabel,
  mapMode,
  onSelect,
}: {
  point: CareerPathPoint;
  selected: boolean;
  active: boolean;
  next: boolean;
  meta: JourneyNodeMeta;
  reduceMotion: boolean;
  avatarLabel: string;
  avatarSublabel: string | null;
  mapMode: JourneyMapMode;
  onSelect: (node: JourneyNode) => void;
}) {
  const node = point.node;
  const isDestination = node.status === "destination";
  const isStart = node.status === "start";
  const locked = node.status === "locked";
  const completed = node.status === "completed";
  const nodeLabel = mapMode === "skills" && node.milestone ? node.missingRequirement : node.title;
  const buttonSize = isDestination ? "w-[240px]" : active ? "w-[156px]" : "w-[178px]";

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(node)}
      initial={reduceMotion ? false : { opacity: 0, scale: 0.88, y: 12 }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
      whileHover={reduceMotion ? undefined : { y: -6, scale: active ? 1.02 : 1.04 }}
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.28, ease: "easeOut", delay: Math.min(0.55, point.node.sequence * 0.06) }}
      aria-pressed={selected}
      className={`absolute z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 outline-none ${buttonSize} ${
        locked ? "opacity-55" : ""
      }`}
      style={{ left: point.x, top: point.y }}
    >
      <span
        className={`relative flex items-center justify-center rounded-full border bg-white shadow-[0_14px_32px_rgba(26,16,51,0.13)] transition ${
          isDestination
            ? "h-20 w-20 border-[#1E2A44] bg-[#1E2A44] text-white"
            : active
              ? "h-20 w-20 border-[#B08A44] bg-[#F6F1E4] text-[#B08A44] ring-8 ring-[#B08A44]/15"
              : completed
                ? "h-14 w-14 border-[#17694F] bg-[#17694F] text-white"
                : next
                  ? "h-14 w-14 border-[#17694F] bg-white text-[#17694F] ring-4 ring-[#17694F]/15"
                  : isStart
                    ? "h-14 w-14 border-[#CBDFD4] bg-[#E7F0E9] text-[#17694F]"
                    : "h-14 w-14 border-[#DFD6BE] bg-white text-[#17694F]"
        } ${selected ? "ring-4 ring-[#B08A44]/25" : ""}`}
      >
        {active ? (
          <CareerAvatar label={avatarLabel} sublabel={avatarSublabel} reduceMotion={reduceMotion} />
        ) : isDestination ? (
          <Flag size={24} />
        ) : completed ? (
          <>
            <CheckCircle2 size={23} />
            <CompletedBurst reduceMotion={reduceMotion} />
          </>
        ) : isStart ? (
          <BriefcaseBusiness size={20} />
        ) : (
          <span className="text-sm font-black">{node.sequence}</span>
        )}
        {next && !reduceMotion && (
          <motion.span
            className="absolute -inset-2 rounded-full border border-[#17694F]/45"
            animate={{ scale: [1, 1.16, 1], opacity: [0.8, 0.25, 0.8] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden="true"
          />
        )}
      </span>

      <span
        className={`rounded-lg border bg-white/95 px-3 py-2 text-center shadow-sm backdrop-blur ${
          selected ? "border-[#B08A44]" : "border-[#EAE3D3]"
        }`}
      >
        <span className="block text-[10px] font-black uppercase text-[#9CA3AF]">
          {active ? "Current" : next ? "Next available" : node.status === "destination" ? "Final target" : statusLabel(node.status)}
        </span>
        <span className="mt-0.5 line-clamp-2 block text-xs font-black leading-4 text-[#1E2A44]">{nodeLabel}</span>
        {(meta.changedFromRecommended || meta.sharedCompleted) && (
          <span className="mt-1 flex justify-center gap-1">
            {meta.changedFromRecommended && <span className="rounded-full bg-[#F6F1E4] px-2 py-0.5 text-[9px] font-black uppercase text-[#B08A44]">Changed</span>}
            {meta.sharedCompleted && <span className="rounded-full bg-[#EFF5F0] px-2 py-0.5 text-[9px] font-black uppercase text-[#114F3B]">Shared</span>}
          </span>
        )}
      </span>
    </motion.button>
  );
}

function CareerGPSLegend() {
  const items = [
    { label: "Completed", className: "border-[#17694F] bg-[#17694F]", icon: <CheckCircle2 size={10} className="text-white" /> },
    { label: "Current", className: "border-[#B08A44] bg-[#F6F1E4] ring-2 ring-[#B08A44]/25" },
    { label: "Next", className: "border-[#17694F] bg-white ring-2 ring-[#17694F]/20" },
    { label: "Locked", className: "border-[#DFD6BE] bg-[#F1EDE0] opacity-60" },
    { label: "Destination", className: "border-[#1E2A44] bg-[#1E2A44]" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-2 rounded-full border border-[#EAE3D3] bg-white px-3 py-1 text-xs font-bold text-[#6B7280]">
          <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${item.className}`}>{item.icon}</span>
          {item.label}
        </span>
      ))}
    </div>
  );
}

function CareerGPSMap({
  roadmap,
  activeRoute,
  nodes,
  selectedNode,
  activeNode,
  nextNode,
  nodeMetaById,
  mapMode,
  mapModeSummary,
  reduceMotion,
  employeeName,
  riasecResult,
  onSelectRoute,
  onSelectNode,
}: {
  roadmap: CareerGpsRoadmap;
  activeRoute: CareerGpsRoute;
  nodes: JourneyNode[];
  selectedNode: JourneyNode;
  activeNode: JourneyNode;
  nextNode: JourneyNode | null;
  nodeMetaById: Record<string, JourneyNodeMeta>;
  mapMode: JourneyMapMode;
  mapModeSummary: string;
  reduceMotion: boolean;
  employeeName: string | null | undefined;
  riasecResult: RiasecResult | null;
  onSelectRoute: (routeType: CareerGpsRouteType) => void;
  onSelectNode: (node: JourneyNode) => void;
}) {
  const routeColor = routeHexColor[activeRoute.route_type];
  const { width, height, points } = useMemo(() => buildCareerPathPoints(nodes), [nodes]);
  const activeIndex = Math.max(0, points.findIndex((point) => point.node.id === activeNode.id));
  const branches = useMemo(
    () => buildCareerRouteBranches({ roadmap, activeRoute, points, width }),
    [roadmap, activeRoute, points, width],
  );
  const avatarLabel = riasecResult
    ? riasecProfiles[riasecResult.primaryCode]?.animal || riasecResult.animal || riasecResult.hollandCode
    : initialsFromName(employeeName ?? "Me");
  const avatarSublabel = riasecResult?.hollandCode ?? null;

  return (
    <section className="mt-4 rounded-lg border border-[#EAE3D3] bg-white p-4 shadow-[0_8px_30px_rgba(26,16,51,0.07)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase text-[#5D6470]">
            <Route size={14} />
            Animated career route
          </p>
          <h3 className="mt-2 text-xl font-bold text-[#1E2A44]">Career GPS journey map</h3>
          <p className="mt-1 max-w-3xl text-sm font-semibold leading-6 text-[#5D6470]">
            {mapModeSummary} Click a stop to open milestone details.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex rounded-full border border-[#CBDFD4] bg-[#EFF5F0] px-3 py-1 text-xs font-bold text-[#17694F]">
            {journeyMapModes.find((mode) => mode.value === mapMode)?.label} lens
          </span>
          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${routeTone[activeRoute.route_type].border} ${routeTone[activeRoute.route_type].bg} ${routeTone[activeRoute.route_type].accent}`}>
            {routeLabels[activeRoute.route_type]}
          </span>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-[#EAE3D3] bg-[#F7F3EA] pb-2" tabIndex={0} aria-label="Scrollable animated Career GPS map">
        <div className="relative" style={{ width, height }}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(6,182,212,0.13),transparent_24%),radial-gradient(circle_at_72%_16%,rgba(176,138,68,0.13),transparent_25%),linear-gradient(180deg,#FFFFFF_0%,#F7F3EA_100%)]" />
          <CareerPath
            points={points}
            width={width}
            height={height}
            activeRoute={activeRoute}
            branches={branches}
            activeIndex={activeIndex}
            reduceMotion={reduceMotion}
            onSelectRoute={onSelectRoute}
          />

          {points.map((point) => (
            <CareerMilestone
              key={point.id}
              point={point}
              selected={selectedNode.id === point.node.id}
              active={activeNode.id === point.node.id}
              next={nextNode?.id === point.node.id}
              meta={nodeMetaById[point.node.id] ?? { sharedCompleted: false, changedFromRecommended: false }}
              reduceMotion={reduceMotion}
              avatarLabel={avatarLabel}
              avatarSublabel={avatarSublabel}
              mapMode={mapMode}
              onSelect={onSelectNode}
            />
          ))}

          <div className="pointer-events-none absolute left-6 top-5 rounded-lg border border-white/80 bg-white/90 px-3 py-2 text-xs font-bold leading-5 text-[#5D6470] shadow-sm backdrop-blur">
            <span className="block text-[10px] uppercase text-[#9CA3AF]">Route progress</span>
            <span className="text-[#1E2A44]" style={{ color: routeColor }}>
              {Math.max(0, activeIndex)} of {Math.max(0, points.length - 1)} stops reached
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <CareerGPSLegend />
        <p className="text-xs font-semibold leading-5 text-[#9CA3AF]">
          The map keeps a wide GPS canvas on smaller screens, so use horizontal scroll to follow long routes.
        </p>
      </div>
    </section>
  );
}

type MilestoneDetailsDrawerProps = Parameters<typeof JourneyDetailPanel>[0] & {
  isOpen: boolean;
};

function MilestoneDetailsDrawer({ isOpen, onClose, ...panelProps }: MilestoneDetailsDrawerProps) {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex justify-end bg-[#1E2A44]/28 p-3 backdrop-blur-sm sm:p-5"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          role="dialog"
          aria-modal="true"
          aria-label="Milestone details drawer"
        >
          <button type="button" className="absolute inset-0 cursor-default" onClick={onClose} aria-label="Close milestone details" />
          <motion.div
            className="relative z-10 h-full w-full max-w-[760px] overflow-y-auto rounded-lg bg-white shadow-[0_24px_70px_rgba(26,16,51,0.24)]"
            initial={reduceMotion ? false : { x: 36, opacity: 0.8 }}
            animate={{ x: 0, opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { x: 36, opacity: 0 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
          >
            <div className="p-3 sm:p-4">
              <JourneyDetailPanel {...panelProps} onClose={onClose} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CareerJourneyMap({
  roadmap,
  activeRoute,
  progressEntries,
  isSavingProgress,
  progressError,
  isDemoMode,
  employeeName,
  riasecResult,
  onSelectRoute,
  onSaveProgress,
}: {
  roadmap: CareerGpsRoadmap | null;
  activeRoute: CareerGpsRoute | null;
  progressEntries: CareerGpsProgressEntry[];
  isSavingProgress: boolean;
  progressError: string | null;
  isDemoMode: boolean;
  employeeName?: string | null;
  riasecResult: RiasecResult | null;
  onSelectRoute: (routeType: CareerGpsRouteType) => void;
  onSaveProgress: SaveProgressHandler;
}) {
  const reduceMotion = useReducedMotion() ?? false;
  const progressByKey = useMemo(() => progressEntriesByKey(progressEntries), [progressEntries]);
  const journeyNodesByRoute = useMemo(() => {
    if (!roadmap) return {};
    return roadmap.routes.reduce<Partial<Record<CareerGpsRouteType, JourneyNode[]>>>((accumulator, route) => {
      accumulator[route.route_type] = buildJourneyNodes(route, progressByKey, isDemoMode, roadmap);
      return accumulator;
    }, {});
  }, [roadmap, progressByKey, isDemoMode]);
  const nodes = useMemo(
    () => (activeRoute ? journeyNodesByRoute[activeRoute.route_type] ?? [] : []),
    [activeRoute, journeyNodesByRoute],
  );
  const activeNode = nodes.find((node) => node.status === "active") ?? nodes.find((node) => node.status === "destination") ?? nodes[0];
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [mapMode, setMapMode] = useState<JourneyMapMode>("roadmap");
  const [mapFocus, setMapFocus] = useState<JourneyMapFocus>("overview");
  const [milestoneDetail, setMilestoneDetail] = useState<CareerGpsMilestoneDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedNodeId((currentSelectedNodeId) => {
      if (!currentSelectedNodeId) return null;
      const selectedSequence = currentSelectedNodeId
        ? Number(currentSelectedNodeId.match(/(?:milestone-|destination$|start$)(\d+)?/)?.[1] ?? NaN)
        : NaN;
      const sameSequenceNode = Number.isFinite(selectedSequence)
        ? nodes.find((node) => node.sequence === selectedSequence && node.status !== "locked")
        : null;
      return sameSequenceNode?.id ?? null;
    });
  }, [activeRoute?.route_type, nodes]);

  const selectedNode = nodes.find((node) => node.id === selectedNodeId) ?? activeNode;
  const isDetailOpen = Boolean(selectedNodeId && selectedNode);
  const milestoneNavNodes = nodes.filter((node) => node.milestone && node.status !== "locked");
  const milestoneNavIndex = milestoneNavNodes.findIndex((node) => node.id === selectedNode?.id);
  const previousMilestoneNode =
    milestoneNavIndex > 0
      ? milestoneNavNodes[milestoneNavIndex - 1]
      : selectedNode
        ? [...milestoneNavNodes].reverse().find((node) => node.sequence < selectedNode.sequence) ?? null
        : null;
  const nextMilestoneNode =
    milestoneNavIndex >= 0 && milestoneNavIndex < milestoneNavNodes.length - 1
      ? milestoneNavNodes[milestoneNavIndex + 1]
      : selectedNode
        ? milestoneNavNodes.find((node) => node.sequence > selectedNode.sequence) ?? null
        : null;
  const closeDetailPanel = () => setSelectedNodeId(null);
  const selectPreviousMilestone = () => {
    if (previousMilestoneNode) setSelectedNodeId(previousMilestoneNode.id);
  };
  const selectNextMilestone = () => {
    if (nextMilestoneNode) setSelectedNodeId(nextMilestoneNode.id);
  };

  useEffect(() => {
    if (!isDetailOpen || !roadmap || !activeRoute || !selectedNode?.milestone) {
      setMilestoneDetail(null);
      setDetailError(null);
      setIsDetailLoading(false);
      return;
    }
    if (isDemoMode) {
      setMilestoneDetail(demoMilestoneDetail(roadmap, activeRoute, selectedNode.milestone, progressByKey));
      setDetailError(null);
      setIsDetailLoading(false);
      return;
    }
    let cancelled = false;
    setIsDetailLoading(true);
    setDetailError(null);
    getJson<CareerGpsMilestoneDetail>(
      `/career-gps/roadmaps/${roadmap.roadmap_id}/milestones/${activeRoute.route_type}/${selectedNode.milestone.sequence}`,
      { auth: true },
    )
      .then((detail) => {
        if (!cancelled) setMilestoneDetail(detail);
      })
      .catch((detailLoadError) => {
        if (!cancelled) {
          setMilestoneDetail(null);
          setDetailError(detailLoadError instanceof Error ? detailLoadError.message : "Unable to load milestone detail.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsDetailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [roadmap, activeRoute, selectedNode?.id, selectedNode?.milestone, isDetailOpen, isDemoMode, progressByKey]);

  const routeColor = activeRoute ? routeHexColor[activeRoute.route_type] : "#B08A44";
  const activeIndex = activeNode ? Math.max(0, nodes.findIndex((node) => node.id === activeNode.id)) : -1;
  const nextNode = activeIndex >= 0 ? nodes.find((node, index) => index > activeIndex && node.status !== "locked") ?? null : null;
  const baselineRoute = roadmap?.routes.find((route) => route.route_type === "recommended") ?? roadmap?.routes[0] ?? null;

  if (!roadmap || !activeRoute || !nodes.length || !activeNode) {
    return (
      <EmptyPanel
        icon={Map}
        label="Journey map"
        title="Generate a roadmap to see the journey map"
        description="The visual journey needs a stored route and milestones. This phase does not generate a new roadmap."
      />
    );
  }

  const nodeMetaById = nodes.reduce<Record<string, JourneyNodeMeta>>((accumulator, node) => {
    const ownCompleted = node.milestone
      ? progressByKey[progressKey(activeRoute.route_type, node.milestone.sequence)]?.status === "completed"
      : false;
    accumulator[node.id] = {
      sharedCompleted: Boolean(node.milestone && !ownCompleted && isCompletedOnAnyRoute(node.milestone, roadmap, progressByKey)),
      changedFromRecommended: isChangedFutureMilestone(node, activeRoute, baselineRoute),
    };
    return accumulator;
  }, {});
  const changedFutureNodes = nodes.filter((node) => nodeMetaById[node.id]?.changedFromRecommended);
  const sharedCompletedNodes = nodes.filter((node) => nodeMetaById[node.id]?.sharedCompleted);
  const routeSummary = routeProgressSummary(activeRoute, progressByKey);
  const focusNodeByMode: Record<JourneyMapFocus, JourneyNode | null> = {
    overview: null,
    current: activeNode,
    destination: nodes[nodes.length - 1] ?? null,
  };
  const mapModeSummary =
    mapMode === "skills"
      ? "Skill lens is on: each stop emphasizes the missing proof or capability behind the next move."
      : mapMode === "decisions"
        ? "Decision lens is on: branch points and route trade-offs are emphasized for comparison."
        : "Route lens is on: follow the full GPS path from today to the target role.";
  const handleMapFocus = (focus: JourneyMapFocus) => {
    setMapFocus(focus);
    const focusNode = focusNodeByMode[focus];
    if (focusNode && focusNode.status !== "locked") setSelectedNodeId(focusNode.id);
  };
  const handleSelectJourneyNode = (node: JourneyNode) => {
    setSelectedNodeId(node.id);
    if (node.id === activeNode.id) {
      setMapFocus("current");
      return;
    }
    if (node.status === "destination") {
      setMapFocus("destination");
      return;
    }
    setMapFocus("overview");
  };

  return (
    <section
      className="rounded-lg border border-[#EAE3D3] bg-white p-4 shadow-[0_8px_36px_rgba(232,25,122,0.09)] sm:p-5"
      aria-labelledby="career-gps-map-heading"
      aria-describedby="career-gps-map-summary"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-[#E3D8BC] bg-[#F6F1E4] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#B08A44]">
            <Map size={14} />
            Main journey map
          </p>
          <h2 id="career-gps-map-heading" className="mt-2 text-2xl font-bold leading-tight tracking-tight text-[#1E2A44] sm:text-3xl">
            {activeRoute.title}
          </h2>
          <p id="career-gps-map-summary" className="mt-1 max-w-3xl text-sm leading-6 text-[#6B7280]">
            Stored milestones rendered as a curved route. Completed progress, active segment, route alternatives, and the current marker all use real roadmap state.
          </p>
          <p className="sr-only" aria-live="polite">
            {mapModeSummary}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center sm:min-w-[340px]">
          <div className="rounded-lg border border-[#EAE3D3] bg-[#FFFFFF] px-3 py-2">
            <p className="text-lg font-bold text-[#1E2A44]">{routeSummary.percent}%</p>
            <p className="text-[11px] font-bold uppercase text-[#9CA3AF]">Progress</p>
          </div>
          <div className="rounded-lg border border-[#EAE3D3] bg-[#FFFFFF] px-3 py-2">
            <p className="text-lg font-bold text-[#1E2A44]">{routeSummary.inProgress}</p>
            <p className="text-[11px] font-bold uppercase text-[#9CA3AF]">Active</p>
          </div>
          <div className="rounded-lg border border-[#EAE3D3] bg-[#FFFFFF] px-3 py-2">
            <p className="text-lg font-bold" style={{ color: routeColor }}>{activeRoute.milestones.length}</p>
            <p className="text-[11px] font-bold uppercase text-[#9CA3AF]">Stops</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 rounded-lg border border-[#EAE3D3] bg-[#FFFFFF] p-3 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="flex flex-wrap gap-2" aria-label="Career GPS map mode">
          {journeyMapModes.map((mode) => (
            <button
              key={mode.value}
              type="button"
              onClick={() => setMapMode(mode.value)}
              aria-pressed={mapMode === mode.value}
              title={mode.description}
              className={`inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 text-xs font-bold outline-none transition focus-visible:ring-2 focus-visible:ring-[#B08A44] focus-visible:ring-offset-2 ${
                mapMode === mode.value
                  ? "border-[#B08A44] bg-[#F6F1E4] text-[#B08A44]"
                  : "border-[#EAE3D3] bg-white text-[#6B7280] hover:border-[#DFD6BE] hover:text-[#1E2A44]"
              }`}
            >
              {mode.value === "roadmap" ? <Route size={14} /> : mode.value === "skills" ? <Target size={14} /> : <GitBranch size={14} />}
              {mode.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 lg:justify-end" aria-label="Career GPS map focus">
          {journeyMapFocusModes.map((focus) => (
            <button
              key={focus.value}
              type="button"
              onClick={() => handleMapFocus(focus.value)}
              aria-pressed={mapFocus === focus.value}
              className={`inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 text-xs font-bold outline-none transition focus-visible:ring-2 focus-visible:ring-[#B08A44] focus-visible:ring-offset-2 ${
                mapFocus === focus.value
                  ? "border-[#17694F] bg-[#E7F0E9] text-[#17694F]"
                  : "border-[#EAE3D3] bg-white text-[#6B7280] hover:border-[#CBDFD4] hover:text-[#17694F]"
              }`}
            >
              {focus.value === "overview" ? <Map size={14} /> : focus.value === "current" ? <MapPin size={14} /> : <Flag size={14} />}
              {focus.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.42fr)]">
        <div className="rounded-lg border border-[#EAE3D3] bg-[#FFFFFF] p-3">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase text-[#9CA3AF]">
            <GitBranch size={14} />
            Active branch decision
          </p>
          <p className="mt-2 text-sm font-bold leading-5 text-[#1E2A44]">{routeBranchDecision(activeRoute)}</p>
          <p className="mt-1 text-xs font-semibold leading-5 text-[#6B7280]">
            Future route differences are marked against the Recommended Route baseline.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-lg border border-[#CBDFD4] bg-[#EFF5F0] px-3 py-2">
            <p className="text-[11px] font-bold uppercase text-[#114F3B]">Shared completed stops</p>
            <p className="mt-1 text-sm font-black text-[#1E2A44]">{sharedCompletedNodes.length}</p>
          </div>
          <div className="rounded-lg border border-[#E3D8BC] bg-[#F6F1E4] px-3 py-2">
            <p className="text-[11px] font-bold uppercase text-[#B08A44]">Changed future stops</p>
            <p className="mt-1 text-sm font-black text-[#1E2A44]">{changedFutureNodes.length}</p>
          </div>
        </div>
      </div>

      <CareerGPSMap
        roadmap={roadmap}
        activeRoute={activeRoute}
        nodes={nodes}
        selectedNode={selectedNode}
        activeNode={activeNode}
        nextNode={nextNode}
        nodeMetaById={nodeMetaById}
        mapMode={mapMode}
        mapModeSummary={mapModeSummary}
        reduceMotion={reduceMotion}
        employeeName={employeeName}
        riasecResult={riasecResult}
        onSelectRoute={onSelectRoute}
        onSelectNode={handleSelectJourneyNode}
      />

      <MilestoneDetailsDrawer
        isOpen={isDetailOpen}
        node={selectedNode}
        route={activeRoute}
        roadmap={roadmap}
        progressByKey={progressByKey}
        milestoneDetail={milestoneDetail}
        isDetailLoading={isDetailLoading}
        detailError={detailError}
        isSavingProgress={isSavingProgress}
        progressError={progressError}
        onSaveProgress={onSaveProgress}
        onClose={closeDetailPanel}
        onPrevious={selectPreviousMilestone}
        onNext={selectNextMilestone}
        canPrevious={Boolean(previousMilestoneNode)}
        canNext={Boolean(nextMilestoneNode)}
      />
    </section>
  );
}

function readinessScoreForStatus(statusValue: CareerGpsProgressStatus | null | undefined): number {
  if (statusValue === "completed") return 100;
  if (statusValue === "in_progress") return 50;
  return 0;
}

function nextMilestone(route: CareerGpsRoute, progressByKey: ProgressEntriesByKey) {
  const inProgress = route.milestones.find(
    (milestone) => progressByKey[progressKey(route.route_type, milestone.sequence)]?.status === "in_progress",
  );
  if (inProgress) return inProgress;
  return (
    route.milestones.find(
      (milestone) => progressByKey[progressKey(route.route_type, milestone.sequence)]?.status !== "completed",
    ) ??
    route.milestones[route.milestones.length - 1] ??
    null
  );
}

function milestoneEvidenceReadiness(
  profile: CareerGpsProfile,
  route: CareerGpsRoute,
  milestone: CareerGpsMilestone | null,
  progressByKey: ProgressEntriesByKey,
) {
  if (!milestone) return Math.round(route.score);
  const milestoneProgress = progressByKey[progressKey(route.route_type, milestone.sequence)];
  if (milestoneProgress?.status === "completed") return 100;
  const skillScore = employeeHasSkill(profile, milestone.focus_skill_name) ? 100 : 0;
  const actionScores = milestone.actions.map(
    (action) => readinessScoreForStatus(progressByKey[progressKey(route.route_type, milestone.sequence, action.sequence)]?.status),
  );
  const actionScore = actionScores.length ? actionScores.reduce((total, value) => total + value, 0) / actionScores.length : skillScore;
  return Math.round((skillScore + actionScore) / 2);
}

function routeProgressSummary(route: CareerGpsRoute, progressByKey: ProgressEntriesByKey) {
  const actionRefs = route.milestones.flatMap((milestone) =>
    milestone.actions.map((action) => ({
      milestone,
      action,
      progress: progressByKey[progressKey(route.route_type, milestone.sequence, action.sequence)],
    })),
  );
  const total = actionRefs.length;
  const completed = actionRefs.filter((item) => item.progress?.status === "completed").length;
  const inProgress = actionRefs.filter((item) => item.progress?.status === "in_progress").length;
  const evidence = actionRefs.filter((item) => item.progress?.evidence_url).length;
  return {
    total,
    completed,
    inProgress,
    evidence,
    percent: total ? Math.round((completed / total) * 100) : 0,
  };
}

function skillEvidenceLinks(route: CareerGpsRoute, progressEntries: CareerGpsProgressEntry[]) {
  return progressEntries
    .filter((entry) => entry.route_type === route.route_type && entry.evidence_url)
    .map((entry) => {
      const milestone = route.milestones.find((item) => item.sequence === entry.milestone_sequence);
      return {
        skill: milestone?.focus_skill_name ?? "Role evidence",
        milestone: milestone?.title ?? `Milestone ${entry.milestone_sequence}`,
        evidenceUrl: entry.evidence_url,
        status: entry.status,
      };
    })
    .slice(0, 4);
}

function skillReadinessItems(
  profile: CareerGpsProfile,
  route: CareerGpsRoute,
  progressByKey: ProgressEntriesByKey,
): SkillReadinessItem[] {
  return route.skill_gaps
    .map((gap) => {
      const relatedMilestones = route.milestones.filter(
        (milestone) => normalizeSkill(milestone.focus_skill_name) === normalizeSkill(gap.skill_name),
      );
      const relatedProgress = relatedMilestones.flatMap((milestone) =>
        milestone.actions.map((action) => progressByKey[progressKey(route.route_type, milestone.sequence, action.sequence)]).filter(Boolean),
      );
      const completed = relatedProgress.some((entry) => entry.status === "completed");
      const inProgress = relatedProgress.some((entry) => entry.status === "in_progress");
      const evidenceUrl = relatedProgress.find((entry) => entry.evidence_url)?.evidence_url ?? null;
      const achieved = employeeHasSkill(profile, gap.skill_name) || completed;
      return {
        name: gap.skill_name,
        status: achieved ? "achieved" : inProgress ? "in_progress" : "missing",
        priority: gap.priority,
        label: priorityLabel(gap.priority),
        evidenceUrl,
      } satisfies SkillReadinessItem;
    })
    .sort((a, b) => b.priority - a.priority || a.name.localeCompare(b.name));
}

function ReadinessRing({
  label,
  value,
  tone = "pink",
}: {
  label: string;
  value: number;
  tone?: "pink" | "teal" | "purple";
}) {
  const reduceMotion = useReducedMotion() ?? false;
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const color = tone === "teal" ? "#17694F" : tone === "purple" ? "#17694F" : "#B08A44";
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (clamped / 100) * circumference;
  return (
    <div className="rounded-lg border border-[#EAE3D3] bg-white p-4">
      <div className="flex items-center gap-4">
        <svg width="88" height="88" viewBox="0 0 88 88" role="img" aria-label={`${label}: ${clamped}%`}>
          <circle cx="44" cy="44" r="36" fill="none" stroke="#EAE3D3" strokeWidth="8" />
          <motion.circle
            cx="44"
            cy="44"
            r="36"
            fill="none"
            stroke={color}
            strokeLinecap="round"
            strokeWidth="8"
            strokeDasharray={circumference}
            initial={reduceMotion ? false : { strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.42, ease: "easeOut" }}
            transform="rotate(-90 44 44)"
          />
          <text x="44" y="48" textAnchor="middle" className="fill-[#1E2A44] text-xl font-black">
            {clamped}%
          </text>
        </svg>
        <div>
          <p className="text-xs font-bold uppercase text-[#9CA3AF]">{label}</p>
          <p className="mt-1 text-sm font-semibold leading-5 text-[#6B7280]">
            {clamped >= 75 ? "Ready to move with evidence" : clamped >= 45 ? "Building enough proof" : "Needs more evidence"}
          </p>
        </div>
      </div>
    </div>
  );
}

function SkillChip({ item }: { item: SkillReadinessItem }) {
  const tone =
    item.status === "achieved"
      ? "border-[#CBDFD4] bg-[#EFF5F0] text-[#114F3B]"
      : item.status === "in_progress"
        ? "border-[#CBDFD4] bg-[#E7F0E9] text-[#114F3B]"
        : "border-[#E3D8BC] bg-[#F6F1E4] text-[#B08A44]";
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${tone}`}>
      {item.name}
      <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] uppercase">{item.label}</span>
    </span>
  );
}

function SkillsReadinessSection({
  profile,
  activeRoute,
  progressEntries,
}: {
  profile: CareerGpsProfile;
  activeRoute: CareerGpsRoute | null;
  progressEntries: CareerGpsProgressEntry[];
}) {
  const reduceMotion = useReducedMotion() ?? false;
  if (!activeRoute) {
    return (
      <EmptyPanel
        icon={Gauge}
        label="Skills and readiness"
        title="Generate a roadmap to see readiness"
        description="Readiness needs a stored route, employee skills, and roadmap milestones."
      />
    );
  }

  const progressByKey = progressEntriesByKey(progressEntries);
  const milestone = nextMilestone(activeRoute, progressByKey);
  const routeReadiness = readinessFromRoute(activeRoute);
  const milestoneReadiness = milestoneEvidenceReadiness(profile, activeRoute, milestone, progressByKey);
  const skillItems = skillReadinessItems(profile, activeRoute, progressByKey);
  const achievedRouteSkills = skillItems.filter((item) => item.status === "achieved").slice(0, 5);
  const inProgressSkills = skillItems.filter((item) => item.status === "in_progress").slice(0, 5);
  const missingPrioritySkills = skillItems.filter((item) => item.status === "missing").slice(0, 5);
  const profileSkills = profile.employee.skills.slice(0, 6).map((skill) => ({
    name: skill,
    status: "achieved" as const,
    priority: 2,
    label: "Profile",
    evidenceUrl: null,
  }));
  const achievedSkills = achievedRouteSkills.length ? achievedRouteSkills : profileSkills;
  const progress = routeProgressSummary(activeRoute, progressByKey);
  const evidenceLinks = skillEvidenceLinks(activeRoute, progressEntries);
  const learningAction = milestone?.actions.find((action) => action.action_type === "learning");
  const certificationText = learningAction
    ? `${learningAction.description ?? "Use the stored learning action"} for ${milestone?.focus_skill_name ?? "the next milestone"}.`
    : "No mandatory certification is stored for this route.";

  return (
    <section className="rounded-lg border border-[#EAE3D3] bg-white p-5 shadow-[0_4px_24px_rgba(232,25,122,0.08)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-[#CBDFD4] bg-[#E7F0E9] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#114F3B]">
            <Gauge size={14} />
            Skills and readiness
          </p>
          <h2 className="mt-3 text-2xl font-bold text-[#1E2A44]">Why you are ready for the next stop</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B7280]">
            Readiness uses your saved employee skills, stored route skill gaps, milestone focus skills, and persisted evidence.
          </p>
        </div>
        <div className="rounded-lg bg-[#FFFFFF] px-4 py-3">
          <p className="text-xs font-bold uppercase text-[#9CA3AF]">Next milestone</p>
          <p className="mt-1 text-sm font-bold text-[#1E2A44]">{milestone?.title ?? activeRoute.target_occupation.title}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <ReadinessRing label="Overall route readiness" value={routeReadiness} tone="pink" />
          <ReadinessRing label="Next milestone readiness" value={milestoneReadiness} tone="teal" />
        </div>

        <div className="rounded-lg border border-[#EAE3D3] bg-[#FFFFFF] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-bold uppercase text-[#9CA3AF]">
                <TrendingUp size={14} />
                Progress trend
              </p>
              <p className="mt-2 text-lg font-bold text-[#1E2A44]">
                {progress.completed} of {progress.total || activeRoute.milestones.length} stored actions complete
              </p>
              <p className="mt-1 text-sm font-semibold leading-5 text-[#6B7280]">
                {progress.inProgress} in progress / {progress.evidence} with evidence links
              </p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#17694F]">
              {routeLabels[activeRoute.route_type]}
            </span>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-white">
            <motion.div
              className="h-full rounded-full bg-[#17694F]"
              initial={reduceMotion ? false : { width: 0 }}
              animate={{ width: `${progress.percent}%` }}
              transition={{ duration: 0.38, ease: "easeOut" }}
            />
          </div>
          <p className="mt-3 text-xs font-semibold leading-5 text-[#9CA3AF]">
            Route readiness is the stored deterministic Skill fit score. Milestone readiness is recalculated from focus-skill match and action progress.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <SkillGroup
          icon={CheckCircle2}
          title="Skills already achieved"
          emptyText="No matching profile skills are stored yet."
          items={achievedSkills}
        />
        <SkillGroup
          icon={Clock3}
          title="Skills in progress"
          emptyText="Start or complete an action to move a priority skill here."
          items={inProgressSkills}
        />
        <SkillGroup
          icon={AlertCircle}
          title="Missing priority skills"
          emptyText="No priority gaps remain on this route."
          items={missingPrioritySkills}
        />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-lg border border-[#DFD6BE] bg-[#FFFFFF] p-4">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase text-[#17694F]">
            <Award size={14} />
            Optional certification recommendation
          </p>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#1E2A44]">{certificationText}</p>
          <p className="mt-2 text-xs font-semibold leading-5 text-[#9CA3AF]">
            No certification requirement is invented here; this uses the stored milestone learning action when available.
          </p>
        </div>

        <details className="group rounded-lg border border-[#EAE3D3] bg-white p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-[#1E2A44]">
            Evidence linked to skills
            <ChevronDown size={16} className="transition group-open:rotate-180" />
          </summary>
          {evidenceLinks.length ? (
            <div className="mt-3 grid gap-2">
              {evidenceLinks.map((item) => (
                <a
                  key={`${item.milestone}-${item.evidenceUrl}`}
                  href={item.evidenceUrl ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col gap-1 rounded-lg border border-[#EAE3D3] bg-[#FFFFFF] p-3 text-sm font-semibold text-[#1E2A44] hover:border-[#CBDFD4]"
                >
                  <span>{item.skill}</span>
                  <span className="text-xs text-[#6B7280]">
                    {item.milestone} / {progressStatusLabel(item.status)}
                  </span>
                </a>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm font-semibold leading-6 text-[#6B7280]">
              No evidence links are saved yet. Add an evidence URL in a milestone action to connect proof to a skill.
            </p>
          )}
        </details>
      </div>

      <details className="group mt-4 rounded-lg border border-[#EAE3D3] bg-[#FFFFFF] p-4">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-[#1E2A44]">
          How readiness is calculated
          <ChevronDown size={16} className="transition group-open:rotate-180" />
        </summary>
        <div className="mt-3 grid gap-2 text-sm font-semibold leading-6 text-[#6B7280]">
          <p>Overall route readiness uses the stored deterministic Skill fit component from the selected route.</p>
          <p>
            Next milestone readiness averages focus-skill match from the employee profile and saved action progress
            where not started is 0%, in progress is 50%, and complete is 100%.
          </p>
          <p>Skill chips are limited to the highest-priority stored gaps and saved profile skills to avoid a long list.</p>
        </div>
      </details>
    </section>
  );
}

function SkillGroup({
  icon: Icon,
  title,
  items,
  emptyText,
}: {
  icon: LucideIcon;
  title: string;
  items: SkillReadinessItem[];
  emptyText: string;
}) {
  return (
    <div className="rounded-lg border border-[#EAE3D3] bg-white p-4">
      <p className="inline-flex items-center gap-2 text-xs font-bold uppercase text-[#9CA3AF]">
        <Icon size={14} />
        {title}
      </p>
      {items.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {items.map((item) => (
            <SkillChip key={`${title}-${item.name}`} item={item} />
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm font-semibold leading-6 text-[#6B7280]">{emptyText}</p>
      )}
    </div>
  );
}

function changeByCategory(preview: CareerGpsWhatIfPreview | null, category: string) {
  return preview?.comparison.changes.find((change) => change.category === category) ?? null;
}

function WhatIfCareerSimulator({
  roadmap,
  activeRoute,
  preview,
  isPreviewing,
  isApplying,
  error,
  message,
  onPreview,
  onApply,
  onDiscard,
}: {
  roadmap: CareerGpsRoadmap | null;
  activeRoute: CareerGpsRoute | null;
  preview: CareerGpsWhatIfPreview | null;
  isPreviewing: boolean;
  isApplying: boolean;
  error: string | null;
  message: string | null;
  onPreview: (payload: CareerGpsWhatIfScenarioPayload) => Promise<void>;
  onApply: (payload: CareerGpsWhatIfScenarioPayload) => Promise<void>;
  onDiscard: () => void;
}) {
  const [scenarioName, setScenarioName] = useState("");
  const [adjustments, setAdjustments] = useState<CareerGpsScenarioCode[]>(["prioritise_work_life_balance"]);
  const [targetCountry, setTargetCountry] = useState("Singapore");
  const [targetIndustry, setTargetIndustry] = useState("data");
  const [targetRetirementAge, setTargetRetirementAge] = useState("50");
  const [targetTimelineMonths, setTargetTimelineMonths] = useState("18");

  if (!roadmap || !activeRoute) {
    return (
      <EmptyPanel
        icon={SlidersHorizontal}
        label="What-if simulator"
        title="Generate a roadmap to run scenarios"
        description="Scenario previews need a stored roadmap so the deterministic route engine has a baseline to compare."
      />
    );
  }

  const hasAdjustment = (code: CareerGpsScenarioCode) => adjustments.includes(code);
  const toggleAdjustment = (code: CareerGpsScenarioCode) => {
    setAdjustments((current) => (current.includes(code) ? current.filter((item) => item !== code) : [...current, code]));
  };
  const numberOrNull = (value: string) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  };
  const payload = (): CareerGpsWhatIfScenarioPayload => ({
    scenario_name: scenarioName.trim() || null,
    adjustments,
    target_country: hasAdjustment("relocate_country") ? targetCountry.trim() || null : null,
    target_industry: hasAdjustment("change_industry") ? targetIndustry.trim() || null : null,
    target_retirement_age: hasAdjustment("retire_earlier") ? numberOrNull(targetRetirementAge) : null,
    target_timeline_months: hasAdjustment("retire_earlier") ? numberOrNull(targetTimelineMonths) : null,
  });

  const previewRoute = preview ? selectedRoute(preview.preview_roadmap, preview.preview_roadmap.selected_route_type) : null;
  const changedCount = preview?.comparison.changes.filter((change) => change.changed).length ?? 0;
  const destinationChange = changeByCategory(preview, "target_roles");
  const timelineChange = changeByCategory(preview, "timeline");
  const skillsChange = changeByCategory(preview, "skill_priorities");
  const tradeoffChange = changeByCategory(preview, "tradeoffs");
  const routeChange = changeByCategory(preview, "recommended_route");
  const lifestyleBefore = `${metricValue(activeRoute, "lifestyle_fit")}% lifestyle fit`;
  const lifestyleAfter = previewRoute ? `${metricValue(previewRoute, "lifestyle_fit")}% lifestyle fit` : "No preview";
  const mainReason = preview?.scenario.applied_overrides[0] ?? routeChange?.explanation ?? "Run a preview to compare deterministic route changes.";
  const currentSkillSummary = activeRoute.skill_gaps.slice(0, 4).map((gap) => gap.skill_name).join(", ") || "No major gaps";
  const previewSkillSummary = previewRoute?.skill_gaps.slice(0, 4).map((gap) => gap.skill_name).join(", ") || "No major gaps";

  return (
    <section className="rounded-lg border border-[#EAE3D3] bg-white p-5 shadow-[0_4px_24px_rgba(232,25,122,0.08)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-[#E3D8BC] bg-[#F6F1E4] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#B08A44]">
            <SlidersHorizontal size={14} />
            What-if Career Simulator
          </p>
          <h2 className="mt-3 text-2xl font-bold text-[#1E2A44]">Preview a priority shift before applying it</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B7280]">
            Preview uses the deterministic Career GPS engine with temporary profile changes. It does not overwrite your active roadmap until you apply it.
          </p>
        </div>
        <div className="rounded-lg bg-[#FFFFFF] px-4 py-3">
          <p className="text-xs font-bold uppercase text-[#9CA3AF]">Active version</p>
          <p className="mt-1 text-sm font-bold text-[#1E2A44]">Version {roadmap.version}</p>
        </div>
      </div>

      {(error || message) && (
        <div className={`mt-4 rounded-lg border px-4 py-3 text-sm font-bold ${error ? "border-[#FECACA] bg-[#FFF5F5] text-[#DC2626]" : "border-[#CBDFD4] bg-[#EFF5F0] text-[#17694F]"}`}>
          {error ?? message}
        </div>
      )}

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <label className="block">
            <span className="text-xs font-bold uppercase text-[#9CA3AF]">Scenario name</span>
            <input
              value={scenarioName}
              onChange={(event) => setScenarioName(event.target.value)}
              placeholder="Optional name for this preview"
              className="mt-2 w-full rounded-lg border border-[#EAE3D3] bg-white px-3 py-2 text-sm font-semibold text-[#1E2A44] outline-none focus:border-[#B08A44]"
            />
          </label>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {scenarioOptions.map((option) => {
              const active = hasAdjustment(option.code);
              return (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => toggleAdjustment(option.code)}
                  className={`min-h-[118px] rounded-lg border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B08A44] ${
                    active ? "border-[#B08A44] bg-[#F6F1E4] ring-2 ring-[#B08A44]/15" : "border-[#EAE3D3] bg-[#FFFFFF] hover:border-[#DFD6BE]"
                  }`}
                  aria-pressed={active}
                >
                  <span className={`inline-flex h-5 w-5 items-center justify-center rounded border ${active ? "border-[#B08A44] bg-[#B08A44]" : "border-[#DFD6BE] bg-white"}`}>
                    {active && <CheckCircle2 size={14} className="text-white" />}
                  </span>
                  <span className="mt-3 block text-sm font-bold text-[#1E2A44]">{option.label}</span>
                  <span className="mt-1 block text-xs font-semibold leading-5 text-[#6B7280]">{option.description}</span>
                </button>
              );
            })}
          </div>

          {(hasAdjustment("relocate_country") || hasAdjustment("change_industry") || hasAdjustment("retire_earlier")) && (
            <div className="grid gap-3 rounded-lg border border-[#EAE3D3] bg-[#FFFFFF] p-4 md:grid-cols-2 xl:grid-cols-4">
              {hasAdjustment("relocate_country") && (
                <label className="block">
                  <span className="text-xs font-bold uppercase text-[#9CA3AF]">Target country</span>
                  <input
                    value={targetCountry}
                    onChange={(event) => setTargetCountry(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-[#EAE3D3] bg-white px-3 py-2 text-sm font-semibold text-[#1E2A44] outline-none focus:border-[#B08A44]"
                  />
                </label>
              )}
              {hasAdjustment("change_industry") && (
                <label className="block">
                  <span className="text-xs font-bold uppercase text-[#9CA3AF]">Target industry</span>
                  <select
                    value={targetIndustry}
                    onChange={(event) => setTargetIndustry(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-[#EAE3D3] bg-white px-3 py-2 text-sm font-semibold text-[#1E2A44] outline-none focus:border-[#B08A44]"
                  >
                    <option value="technology">Technology</option>
                    <option value="data">Data</option>
                    <option value="project-management">Project management</option>
                  </select>
                </label>
              )}
              {hasAdjustment("retire_earlier") && (
                <>
                  <label className="block">
                    <span className="text-xs font-bold uppercase text-[#9CA3AF]">Retirement age</span>
                    <input
                      value={targetRetirementAge}
                      type="number"
                      min={45}
                      max={80}
                      onChange={(event) => setTargetRetirementAge(event.target.value)}
                      className="mt-2 w-full rounded-lg border border-[#EAE3D3] bg-white px-3 py-2 text-sm font-semibold text-[#1E2A44] outline-none focus:border-[#B08A44]"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold uppercase text-[#9CA3AF]">Timeline months</span>
                    <input
                      value={targetTimelineMonths}
                      type="number"
                      min={1}
                      max={480}
                      onChange={(event) => setTargetTimelineMonths(event.target.value)}
                      className="mt-2 w-full rounded-lg border border-[#EAE3D3] bg-white px-3 py-2 text-sm font-semibold text-[#1E2A44] outline-none focus:border-[#B08A44]"
                    />
                  </label>
                </>
              )}
            </div>
          )}
        </div>

        <aside className="rounded-lg border border-[#EAE3D3] bg-[#FFFFFF] p-4">
          <p className="text-xs font-bold uppercase text-[#9CA3AF]">Current route</p>
          <h3 className="mt-2 text-lg font-bold text-[#1E2A44]">{activeRoute.title}</h3>
          <p className="mt-1 text-sm font-semibold text-[#6B7280]">{activeRoute.target_occupation.title}</p>
          <div className="mt-4 space-y-3">
            <MetricBar label="Route readiness" value={Math.round(activeRoute.score)} />
            <MetricBar label="Lifestyle score" value={metricValue(activeRoute, "lifestyle_fit")} />
          </div>
          <div className="mt-4 grid gap-2">
            <button
              type="button"
              onClick={() => onPreview(payload())}
              disabled={!adjustments.length || isPreviewing || isApplying}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#1E2A44] px-4 py-2.5 text-sm font-bold text-white outline-none focus-visible:ring-2 focus-visible:ring-[#B08A44] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPreviewing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              Preview Scenario
            </button>
            <button
              type="button"
              onClick={onDiscard}
              disabled={!preview || isPreviewing || isApplying}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#DFD6BE] bg-white px-4 py-2.5 text-sm font-bold text-[#17694F] outline-none hover:border-[#B08A44] focus-visible:ring-2 focus-visible:ring-[#B08A44] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Discard Preview
            </button>
          </div>
        </aside>
      </div>

      {preview && previewRoute && (
        <div className="mt-5 rounded-lg border border-[#CBDFD4] bg-[#EFF5F0] p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-[#114F3B]">Preview route</p>
              <h3 className="mt-2 text-xl font-bold text-[#1E2A44]">{previewRoute.title}</h3>
              <p className="mt-1 text-sm font-semibold text-[#6B7280]">
                {preview.scenario.scenario_name} previews version {preview.comparison.preview_version}; active roadmap remains version {preview.comparison.current_version}.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => onApply(payload())}
                disabled={isApplying || isPreviewing}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#B08A44] px-4 py-2.5 text-sm font-bold text-white outline-none focus-visible:ring-2 focus-visible:ring-[#1E2A44] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isApplying ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                Apply This Scenario
              </button>
              <button
                type="button"
                onClick={onDiscard}
                disabled={isApplying || isPreviewing}
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#DFD6BE] bg-white px-4 py-2.5 text-sm font-bold text-[#17694F] outline-none hover:border-[#B08A44] focus-visible:ring-2 focus-visible:ring-[#B08A44] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Discard Preview
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <ComparisonTile label="Changed destination" before={destinationChange?.before ?? activeRoute.target_occupation.title} after={destinationChange?.after ?? previewRoute.target_occupation.title} changed={destinationChange?.changed ?? false} />
            <ComparisonTile label="Changed timeline" before={timelineChange?.before ?? `${activeRoute.estimated_months} months`} after={timelineChange?.after ?? `${previewRoute.estimated_months} months`} changed={timelineChange?.changed ?? false} />
            <ComparisonTile label="Lifestyle score" before={lifestyleBefore} after={lifestyleAfter} changed={lifestyleBefore !== lifestyleAfter} />
            <ComparisonTile label="Changed trade-offs" before={tradeoffChange?.before ?? componentText(weakestComponent(activeRoute))} after={tradeoffChange?.after ?? componentText(weakestComponent(previewRoute))} changed={tradeoffChange?.changed ?? false} />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="rounded-lg bg-white p-4">
              <p className="text-xs font-bold uppercase text-[#9CA3AF]">Changed skill priorities</p>
              <div className="mt-3 grid gap-2 text-sm font-semibold leading-6 text-[#6B7280] md:grid-cols-2">
                <p>
                  <span className="font-bold text-[#1E2A44]">Current:</span> {skillsChange?.before ?? currentSkillSummary}
                </p>
                <p>
                  <span className="font-bold text-[#1E2A44]">Preview:</span> {skillsChange?.after ?? previewSkillSummary}
                </p>
              </div>
            </div>
            <div className="rounded-lg bg-white p-4">
              <p className="text-xs font-bold uppercase text-[#9CA3AF]">Main reason for change</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#1E2A44]">{mainReason}</p>
              <p className="mt-3 text-xs font-bold text-[#114F3B]">
                {changedCount} of {preview.comparison.changes.length} route signals changed.
              </p>
            </div>
          </div>

          <details className="group mt-4 rounded-lg bg-white p-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-[#1E2A44]">
              Scenario overrides and full comparison
              <ChevronDown size={16} className="transition group-open:rotate-180" />
            </summary>
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              {preview.scenario.applied_overrides.map((override) => (
                <p key={override} className="rounded-lg bg-[#FFFFFF] p-3 text-xs font-bold leading-5 text-[#6B7280]">
                  {override}
                </p>
              ))}
              {preview.comparison.changes.map((change) => (
                <div key={change.category} className="rounded-lg border border-[#EAE3D3] p-3">
                  <p className={`text-xs font-bold uppercase ${change.changed ? "text-[#B08A44]" : "text-[#9CA3AF]"}`}>
                    {change.changed ? "Changed" : "No change"}
                  </p>
                  <p className="mt-1 text-sm font-bold text-[#1E2A44]">{change.label}</p>
                  <p className="mt-2 text-xs font-semibold leading-5 text-[#6B7280]">{change.explanation}</p>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
    </section>
  );
}

function ComparisonTile({
  label,
  before,
  after,
  changed,
}: {
  label: string;
  before: string;
  after: string;
  changed: boolean;
}) {
  return (
    <div className={`rounded-lg border p-4 ${changed ? "border-[#E3D8BC] bg-[#F6F1E4]" : "border-[#EAE3D3] bg-white"}`}>
      <p className={`text-xs font-bold uppercase ${changed ? "text-[#B08A44]" : "text-[#9CA3AF]"}`}>{label}</p>
      <div className="mt-3 grid gap-2 text-xs font-semibold leading-5 text-[#6B7280]">
        <p>
          <span className="font-bold text-[#1E2A44]">Current:</span> {before}
        </p>
        <p>
          <span className="font-bold text-[#1E2A44]">Preview:</span> {after}
        </p>
      </div>
    </div>
  );
}

export function CareerBuddyPanel({
  roadmap,
  activeRoute,
  riasecResult,
  isDemoMode,
  defaultOpen = false,
}: {
  roadmap: CareerGpsRoadmap | null;
  activeRoute: CareerGpsRoute | null;
  riasecResult: RiasecResult | null;
  isDemoMode: boolean;
  defaultOpen?: boolean;
}) {
  const [conversation, setConversation] = useState<CareerBuddyConversation | null>(null);
  const [messages, setMessages] = useState<CareerBuddyMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);

  const loadConversation = useCallback(async () => {
    if (!roadmap) return;
    if (isDemoMode) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const conversations = await getJson<CareerBuddyConversation[]>("/career-gps/career-buddy/conversations", {
        auth: true,
      });
      const latest =
        conversations.find((item) => item.roadmap_id === roadmap.roadmap_id && item.status === "active") ??
        null;
      if (!latest) {
        setConversation(null);
        setMessages([]);
        setProvider(null);
        setModel(null);
        setRemaining(null);
        return;
      }
      const detail = await getJson<CareerBuddyConversationDetail>(
        `/career-gps/career-buddy/conversations/${latest.id}`,
        { auth: true },
      );
      setConversation(detail);
      setMessages(detail.messages);
      const latestAssistant = [...detail.messages].reverse().find((message) => message.sender === "assistant");
      setProvider(latestAssistant?.provider ?? null);
      setModel(latestAssistant?.model ?? null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load Career Buddy conversation.");
    } finally {
      setIsLoading(false);
    }
  }, [roadmap, isDemoMode]);

  useEffect(() => {
    setConversation(null);
    setMessages([]);
    setProvider(null);
    setModel(null);
    setRemaining(null);
    setError(null);
    loadConversation();
  }, [loadConversation]);

  const sendCareerBuddyMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || !roadmap || !activeRoute || isSending) return;
    setIsOpen(true);
    setIsSending(true);
    setError(null);
    if (isDemoMode) {
      const now = new Date().toISOString();
      const userMessage: CareerBuddyMessage = {
        id: -Date.now(),
        conversation_id: -1,
        sender: "employee",
        content: trimmed,
        structured_response: {},
        provider: "demo",
        model: null,
        created_at: now,
      };
      const assistantMessage: CareerBuddyMessage = {
        id: -Date.now() - 1,
        conversation_id: -1,
        sender: "assistant",
        content: demoBuddyReply(trimmed, activeRoute),
        structured_response: {
          confidence: "high",
          referenced_route_type: activeRoute.route_type,
          safety_notes: ["Demo mode uses illustrative stored context only."],
        },
        provider: "demo_template",
        model: "local-demo",
        created_at: now,
      };
      setConversation({
        id: -1,
        employee_profile_id: -101,
        roadmap_id: roadmap.roadmap_id,
        title: "Demo Career Buddy conversation",
        status: "active",
        created_at: now,
        updated_at: now,
      });
      setMessages((current) => [...current, userMessage, assistantMessage]);
      setProvider("demo_template");
      setModel("local-demo");
      setRemaining(null);
      setDraft("");
      setIsSending(false);
      return;
    }
    try {
      const payload: CareerBuddyMessagePayload = {
        conversation_id: conversation?.id ?? null,
        roadmap_id: roadmap.roadmap_id,
        route_type: activeRoute.route_type,
        message: trimmed,
      };
      const reply = await postJson<CareerBuddyReply, CareerBuddyMessagePayload>(
        "/career-gps/career-buddy/messages",
        payload,
        { auth: true },
      );
      setConversation(reply.conversation);
      setMessages((current) => [...current, reply.user_message, reply.assistant_message]);
      setProvider(reply.provider);
      setModel(reply.model ?? reply.assistant_message.model);
      setRemaining(reply.rate_limit_remaining);
      setDraft("");
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Unable to send Career Buddy message.");
    } finally {
      setIsSending(false);
    }
  };

  if (!roadmap || !activeRoute) {
    return (
      <div id="career-buddy" className="scroll-mt-24">
        <EmptyPanel
          icon={Bot}
          label="Career Buddy"
          title="Generate a roadmap to ask Career Buddy"
          description="Career Buddy needs a stored roadmap so it can answer from deterministic route, milestone, and skill-gap context."
        />
      </div>
    );
  }

  const assistantAvatar = riasecResult?.animal || null;
  const providerLabel = isDemoMode
    ? "Demo template"
    : provider === "template"
      ? "Template fallback"
      : provider ?? "Backend AI or fallback";
  const latestAssistant = [...messages].reverse().find((message) => message.sender === "assistant");

  return (
    <section id="career-buddy" className="scroll-mt-24 rounded-lg border border-[#EAE3D3] bg-white p-4 shadow-[0_4px_24px_rgba(232,25,122,0.08)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#DFD6BE] bg-[#E7F0E9] text-[#17694F]">
            {assistantAvatar ? (
              <span className="text-xl" aria-hidden="true">
                {assistantAvatar}
              </span>
            ) : (
              <Bot size={20} />
            )}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#17694F]">Career Buddy</p>
            <h2 className="mt-1 text-lg font-bold text-[#1E2A44]">Ask about this roadmap</h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-[#6B7280]">
              {isDemoMode
                ? "Demo replies are generated locally from the illustrative route and do not call Gemini or save a conversation."
                : "Answers use the selected route, skill gaps, milestones, Next Best Action, and saved preferences. Scoring stays deterministic."}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#DFD6BE] bg-[#FFFFFF] px-4 py-2 text-sm font-bold text-[#17694F] outline-none hover:border-[#B08A44] hover:text-[#B08A44] focus-visible:ring-2 focus-visible:ring-[#B08A44]"
          aria-expanded={isOpen}
        >
          {isOpen ? "Hide Buddy" : "Open Buddy"}
          <ChevronDown size={16} className={`transition ${isOpen ? "rotate-180" : ""}`} />
        </button>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-3 xl:grid-cols-6">
        {careerBuddyPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => sendCareerBuddyMessage(prompt)}
            disabled={isSending}
            className="rounded-lg border border-[#EAE3D3] bg-[#FFFFFF] px-3 py-2 text-left text-xs font-bold leading-5 text-[#1E2A44] outline-none hover:border-[#B08A44] hover:text-[#B08A44] focus-visible:ring-2 focus-visible:ring-[#B08A44] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {prompt}
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-[#FECACA] bg-[#FFF5F5] px-4 py-3 text-sm font-bold text-[#DC2626]">
          {error}
        </div>
      )}

      {isOpen && (
        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="rounded-lg border border-[#EAE3D3] bg-[#FFFFFF]">
            <div className="max-h-[320px] min-h-[180px] space-y-3 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex items-center gap-2 text-sm font-bold text-[#6B7280]">
                  <Loader2 size={16} className="animate-spin text-[#B08A44]" />
                  Loading Career Buddy...
                </div>
              ) : messages.length ? (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "employee" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-lg px-3 py-2 text-sm leading-6 ${
                        message.sender === "employee"
                          ? "bg-[#B08A44] text-white"
                          : "border border-[#EAE3D3] bg-white text-[#1E2A44]"
                      }`}
                    >
                      <p>{message.content}</p>
                      {message.sender === "assistant" && message.provider && (
                        <p className="mt-2 text-[11px] font-bold uppercase text-[#9CA3AF]">
                          Provider: {message.provider}
                          {message.model ? ` / ${message.model}` : ""}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-[#CBDFD4] bg-[#EFF5F0] p-4 text-sm font-semibold leading-6 text-[#17694F]">
                  {isDemoMode
                    ? "Choose a suggested question or ask your own. Demo answers stay local to this browser session."
                    : "Choose a suggested question or ask your own. Career Buddy will use only stored Career GPS context."}
                </div>
              )}
              {isSending && (
                <p className="inline-flex items-center gap-2 rounded-lg border border-[#EAE3D3] bg-white px-3 py-2 text-sm font-bold text-[#6B7280]">
                  <Loader2 size={15} className="animate-spin text-[#B08A44]" />
                  Career Buddy is thinking...
                </p>
              )}
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                sendCareerBuddyMessage(draft);
              }}
              className="flex items-center gap-2 border-t border-[#EAE3D3] bg-white p-3"
            >
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Ask about your route..."
                className="min-h-11 flex-1 rounded-lg border border-[#DFD6BE] px-3 text-sm font-semibold text-[#1E2A44] outline-none placeholder:text-[#9CA3AF] focus:border-[#B08A44]"
              />
              <button
                type="submit"
                disabled={!draft.trim() || isSending}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#17694F] text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Send message to Career Buddy"
              >
                {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </form>
          </div>

          <aside className="rounded-lg border border-[#EAE3D3] bg-white p-4">
            <p className="text-xs font-bold uppercase text-[#9CA3AF]">Context</p>
            <p className="mt-2 text-sm font-bold text-[#1E2A44]">{activeRoute.title}</p>
            <p className="mt-1 text-xs font-semibold leading-5 text-[#6B7280]">
              {activeRoute.target_occupation.title} - version {roadmap.version}
            </p>
            <div className="mt-4 rounded-lg bg-[#FFFFFF] p-3 text-xs font-semibold leading-5 text-[#6B7280]">
              <p>
                Provider: <span className="font-bold text-[#1E2A44]">{providerLabel}</span>
              </p>
              {model && (
                <p className="mt-1">
                  Model: <span className="font-bold text-[#1E2A44]">{model}</span>
                </p>
              )}
              {remaining !== null && (
                <p className="mt-1">
                  Messages left this hour: <span className="font-bold text-[#1E2A44]">{remaining}</span>
                </p>
              )}
            </div>
            {latestAssistant && (
              <p className="mt-3 rounded-lg bg-[#F6F1E4] p-3 text-xs font-semibold leading-5 text-[#6B7280]">
                {isDemoMode
                  ? "Latest answer is part of the local demo conversation and is not saved to production data."
                  : "Latest answer is saved in your Career Buddy conversation and can be reloaded after refresh."}
              </p>
            )}
          </aside>
        </div>
      )}
    </section>
  );
}

function CareerBuddyHandoff({ activeRoute }: { activeRoute: CareerGpsRoute | null }) {
  return (
    <section className="rounded-lg border border-[#E7F0E9] bg-[#EFF5F0] p-4 shadow-[0_4px_24px_rgba(8,124,126,0.08)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-[#17694F] shadow-sm">
            <Bot size={20} />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#17694F]">Career Buddy</p>
            <h2 className="mt-1 text-lg font-bold text-[#1E2A44]">Need an explanation for this route?</h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-[#5D6470]">
              Career GPS stays focused on the map. Open Career Buddy when you want coaching, explanations, or help
              deciding what to do next{activeRoute ? ` for ${activeRoute.title}` : ""}.
            </p>
          </div>
        </div>
        <Link
          href={routes.employeeCareerBuddy}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#17694F] px-4 text-sm font-bold text-white shadow-sm"
        >
          Open Career Buddy
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}

const reportPrintDocumentStyles = `
  @page { margin: 14mm; size: A4; }
  body { margin: 0; background: #FFFFFF; color: #1E2A44; font-family: Arial, sans-serif; line-height: 1.45; }
  #career-gps-pdf-report { display: block; width: 100%; background: #FFFFFF; color: #1E2A44; }
  #career-gps-pdf-report article { max-width: 760px; margin: 0 auto; }
  #career-gps-pdf-report header {
    border: 1px solid #EAE3D3;
    border-top: 7px solid #B08A44;
    border-radius: 14px;
    padding: 18px;
    margin-bottom: 14px;
    background: #FFFFFF;
  }
  #career-gps-pdf-report .report-brand { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; }
  #career-gps-pdf-report .report-logo-img {
    display: block; width: 86px; height: auto;
  }
  #career-gps-pdf-report .report-kicker {
    margin: 0 0 6px; color: #B08A44; font-size: 11px; font-weight: 800;
    letter-spacing: 0.08em; text-transform: uppercase;
  }
  #career-gps-pdf-report .report-title-row { display: flex; align-items: flex-end; justify-content: space-between; gap: 18px; }
  #career-gps-pdf-report .report-date-card {
    min-width: 116px; border-radius: 10px; background: #FFFFFF; border: 1px solid #EAE3D3; padding: 10px; text-align: right;
  }
  #career-gps-pdf-report .report-date-card span {
    display: block; color: #6b7280; font-size: 10px; font-weight: 800; text-transform: uppercase;
  }
  #career-gps-pdf-report .report-date-card strong { display: block; color: #1E2A44; font-size: 12px; margin-top: 4px; }
  #career-gps-pdf-report h1 { margin: 0; font-size: 28px; line-height: 1.15; }
  #career-gps-pdf-report .report-section {
    border: 1px solid #EAE3D3; border-radius: 12px; padding: 12px 14px; margin-top: 10px; break-inside: avoid;
  }
  #career-gps-pdf-report .report-summary { background: #F6F1E4; border-color: #E3D8BC; }
  #career-gps-pdf-report h2 { margin: 0 0 8px; color: #1E2A44; font-size: 16px; line-height: 1.25; }
  #career-gps-pdf-report p, #career-gps-pdf-report li { font-size: 12px; }
  #career-gps-pdf-report ul, #career-gps-pdf-report ol { margin: 8px 0 0; padding-left: 18px; }
  #career-gps-pdf-report li { margin-bottom: 7px; }
  #career-gps-pdf-report .report-grid {
    display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px 18px; margin-top: 8px;
  }
  #career-gps-pdf-report .report-card-grid {
    display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 8px;
  }
  #career-gps-pdf-report .report-card {
    display: block; margin: 0; border-radius: 10px; border: 1px solid #EAE3D3; background: #FFFFFF; padding: 9px;
  }
  #career-gps-pdf-report .report-card span {
    display: block; color: #6b7280; font-size: 10px; font-weight: 800; text-transform: uppercase;
  }
  #career-gps-pdf-report .report-card strong { display: block; margin-top: 3px; color: #1E2A44; font-size: 12px; }
  #career-gps-pdf-report .report-chip-list {
    display: flex; flex-wrap: wrap; gap: 6px; list-style: none; margin: 8px 0 0; padding: 0;
  }
  #career-gps-pdf-report .report-chip-list li {
    border-radius: 999px; background: #EFF5F0; color: #114F3B; font-size: 11px; font-weight: 700; margin: 0; padding: 5px 8px;
  }
  #career-gps-pdf-report .report-milestone-list { list-style: none; margin: 8px 0 0; padding: 0; }
  #career-gps-pdf-report .report-milestone-list li {
    border-left: 3px solid #B08A44; margin: 0 0 8px; padding: 0 0 2px 9px;
  }
  #career-gps-pdf-report footer {
    border-top: 1px solid #DFD6C2; margin-top: 18px; padding-top: 10px; color: #5D6470;
  }
`;

function CareerGpsReportExport({
  profile,
  roadmap,
  activeRoute,
  riasecResult,
  progressEntries,
}: {
  profile: CareerGpsProfile;
  roadmap: CareerGpsRoadmap | null;
  activeRoute: CareerGpsRoute | null;
  riasecResult: RiasecResult | null;
  progressEntries: CareerGpsProgressEntry[];
}) {
  const progressByKey = progressEntriesByKey(progressEntries);
  const progress = activeRoute ? routeProgressSummary(activeRoute, progressByKey) : null;
  const themes = riasecCareerThemes(riasecResult, activeRoute);
  const strongest = activeRoute ? strongestComponent(activeRoute) : null;
  const tradeoff = activeRoute ? weakestComponent(activeRoute) : null;
  const generatedOn = todayIsoDate();

  const exportReport = () => {
    const report = document.getElementById("career-gps-pdf-report");
    if (!report) return;

    const printWindow = window.open("", "_blank", "width=900,height=1200");
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.open();
    printWindow.document.write(`<!doctype html>
      <html>
        <head>
          <title>Simploy Career GPS Report</title>
          <style>${reportPrintDocumentStyles}</style>
        </head>
        <body>
          <div id="career-gps-pdf-report">${report.innerHTML}</div>
        </body>
      </html>`);
    printWindow.document.close();
    printWindow.focus();
    window.setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <section className="rounded-lg border border-[#1E2A44] bg-white p-5 shadow-[0_10px_36px_rgba(26,16,51,0.12)]">
      <div className="career-gps-no-print flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#1E2A44] text-white">
            <FileText size={20} />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#1E2A44]">Career report</p>
            <h2 className="mt-1 text-xl font-bold text-[#1E2A44]">Export PDF report</h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-[#5D6470]">
              Creates a printable report with your RAISEC result, suitable work themes, selected route, skill gaps,
              career path, milestones, and progress.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={exportReport}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#B08A44] px-4 text-sm font-bold text-white shadow-sm outline-none transition hover:bg-[#97742F] focus-visible:ring-2 focus-visible:ring-[#1E2A44] focus-visible:ring-offset-2"
        >
          <FileText size={16} />
          Export PDF Report
        </button>
      </div>

      <div id="career-gps-pdf-report" className="career-gps-print-report">
        <article>
          <header>
            <div className="report-brand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="report-logo-img" src="/brand/simploy-logo.png" alt="Simploy" />
              <div>
                <p className="report-kicker">Career GPS Report</p>
              </div>
            </div>
            <div className="report-title-row">
              <div>
                <h1>{profile.employee.full_name || "Employee"} career path report</h1>
                <p>
                  Target role:{" "}
                  {profile.north_star.target_role ?? profile.employee.target_role ?? activeRoute?.target_occupation.title ?? "Not set"}
                </p>
              </div>
              <div className="report-date-card">
                <span>Generated</span>
                <strong>{generatedOn}</strong>
              </div>
            </div>
          </header>

          <section className="report-section report-summary">
            <h2>Career Snapshot</h2>
            <div className="report-card-grid">
              <div className="report-card">
                <span>Selected route</span>
                <strong>{activeRoute ? routeLabels[activeRoute.route_type] : "No route"}</strong>
              </div>
              <div className="report-card">
                <span>Readiness</span>
                <strong>{activeRoute ? `${readinessFromRoute(activeRoute)}%` : "Not ready"}</strong>
              </div>
              <div className="report-card">
                <span>Progress</span>
                <strong>{progress ? `${progress.completed}/${progress.total}` : "0/0"} actions</strong>
              </div>
              <div className="report-card">
                <span>RAISEC</span>
                <strong>{riasecResult ? riasecResult.hollandCode : "Not taken"}</strong>
              </div>
            </div>
          </section>

          <section className="report-section">
            <h2>RAISEC Result</h2>
            {riasecResult ? (
              <>
                <p>
                  Holland code: <strong>{riasecResult.hollandCode}</strong> / {riasecResult.label}
                </p>
                <p>{riasecResult.summary}</p>
                <div className="report-grid report-score-grid">
                  {riasecCodeOrder.map((code) => (
                    <p key={code}>
                      <strong>{code}</strong> {riasecProfiles[code].name}: {riasecResult.scores[code]}
                    </p>
                  ))}
                </div>
              </>
            ) : (
              <p>No RAISEC result is saved yet. Take the interest check on the Career GPS page to complete this section.</p>
            )}
          </section>

          <section className="report-section">
            <h2>Suitable Work Themes</h2>
            {themes.length ? (
              <ul className="report-chip-list">
                {themes.map((theme) => (
                  <li key={theme}>{theme}</li>
                ))}
              </ul>
            ) : (
              <p>No work themes are available yet.</p>
            )}
          </section>

          <section className="report-section">
            <h2>Recommended Career Path</h2>
            {activeRoute ? (
              <>
                <p>
                  Selected route: <strong>{routeLabels[activeRoute.route_type]}</strong> / {activeRoute.target_occupation.title}
                </p>
                <p>{activeRoute.summary}</p>
                <div className="report-card-grid">
                  <p className="report-card">
                    <strong>Route score:</strong> {Math.round(activeRoute.score)}%
                  </p>
                  <p className="report-card">
                    <strong>Estimated timeline:</strong> {activeRoute.estimated_months} months
                  </p>
                  <p className="report-card">
                    <strong>Progress:</strong> {progress?.completed ?? 0} of {progress?.total ?? 0} actions complete
                  </p>
                  <p className="report-card">
                    <strong>Best signal:</strong> {componentText(strongest)}
                  </p>
                  <p className="report-card">
                    <strong>Main trade-off:</strong> {componentText(tradeoff)}
                  </p>
                </div>
              </>
            ) : (
              <p>No selected route is available yet.</p>
            )}
          </section>

          {activeRoute && (
            <>
              <section className="report-section">
                <h2>Skill Gaps</h2>
                <ul className="report-chip-list">
                  {activeRoute.skill_gaps.map((gap) => (
                    <li key={`${gap.skill_name}-${gap.priority}`}>
                      {gap.skill_name} / {priorityLabel(gap.priority)} priority / {gap.proficiency_level}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="report-section">
                <h2>Milestones</h2>
                <ol className="report-milestone-list">
                  {activeRoute.milestones.map((milestone) => {
                    const milestoneProgress = progressByKey[progressKey(activeRoute.route_type, milestone.sequence)];
                    return (
                      <li key={milestone.sequence}>
                        <strong>{milestone.title}</strong>
                        <p>
                          Timeline: {milestoneTiming(milestone, activeRoute)} / Focus:{" "}
                          {milestone.focus_skill_name ?? "Career evidence"} / Status:{" "}
                          {progressStatusLabel(milestoneProgress?.status)}
                        </p>
                        {milestone.description && <p>{milestone.description}</p>}
                      </li>
                    );
                  })}
                </ol>
              </section>
            </>
          )}

          <section className="report-section">
            <h2>Next Step</h2>
            <p>{roadmap?.next_best_action.title ?? "No next best action is available yet."}</p>
            {roadmap?.next_best_action.description && <p>{roadmap.next_best_action.description}</p>}
          </section>

          <footer>
            <p>{roadmap?.source_note ?? "Report uses saved Career GPS profile and roadmap data available on this page."}</p>
          </footer>
        </article>
      </div>

      <style jsx global>{`
        .career-gps-print-report {
          display: none;
        }

        @media print {
          @page {
            margin: 14mm;
            size: A4;
          }

          body {
            background: #FFFFFF !important;
          }

          body * {
            visibility: hidden !important;
          }

          #career-gps-pdf-report,
          #career-gps-pdf-report * {
            visibility: visible !important;
          }

          #career-gps-pdf-report {
            display: block !important;
            position: absolute;
            inset: 0 auto auto 0;
            width: 100%;
            background: #FFFFFF;
            color: #1E2A44;
            font-family: Arial, sans-serif;
            line-height: 1.45;
          }

          #career-gps-pdf-report article {
            max-width: 760px;
            margin: 0 auto;
          }

          #career-gps-pdf-report header {
            border: 1px solid #EAE3D3;
            border-top: 7px solid #B08A44;
            border-radius: 14px;
            padding: 18px;
            margin-bottom: 14px;
            background: #FFFFFF;
          }

          #career-gps-pdf-report .report-brand {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 18px;
          }

          #career-gps-pdf-report .report-logo-img {
            display: block;
            width: 86px;
            height: auto;
          }

          #career-gps-pdf-report .report-kicker {
            margin: 0 0 6px;
            color: #B08A44;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }

          #career-gps-pdf-report .report-title-row {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            gap: 18px;
          }

          #career-gps-pdf-report .report-date-card {
            min-width: 116px;
            border-radius: 10px;
            background: #FFFFFF;
            border: 1px solid #EAE3D3;
            padding: 10px;
            text-align: right;
          }

          #career-gps-pdf-report .report-date-card span {
            display: block;
            color: #6b7280;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
          }

          #career-gps-pdf-report .report-date-card strong {
            display: block;
            color: #1E2A44;
            font-size: 12px;
            margin-top: 4px;
          }

          #career-gps-pdf-report h1 {
            margin: 0;
            font-size: 28px;
            line-height: 1.15;
          }

          #career-gps-pdf-report .report-section {
            border: 1px solid #EAE3D3;
            border-radius: 12px;
            padding: 12px 14px;
            margin-top: 10px;
            break-inside: avoid;
          }

          #career-gps-pdf-report .report-summary {
            background: #F6F1E4;
            border-color: #E3D8BC;
          }

          #career-gps-pdf-report h2 {
            margin: 0 0 8px;
            color: #1E2A44;
            font-size: 16px;
            line-height: 1.25;
          }

          #career-gps-pdf-report p,
          #career-gps-pdf-report li {
            font-size: 12px;
          }

          #career-gps-pdf-report ul,
          #career-gps-pdf-report ol {
            margin: 8px 0 0;
            padding-left: 18px;
          }

          #career-gps-pdf-report li {
            margin-bottom: 7px;
          }

          #career-gps-pdf-report .report-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 6px 18px;
            margin-top: 8px;
          }

          #career-gps-pdf-report .report-card-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
            margin-top: 8px;
          }

          #career-gps-pdf-report .report-card {
            display: block;
            margin: 0;
            border-radius: 10px;
            border: 1px solid #EAE3D3;
            background: #FFFFFF;
            padding: 9px;
          }

          #career-gps-pdf-report .report-card span {
            display: block;
            color: #6b7280;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
          }

          #career-gps-pdf-report .report-card strong {
            display: block;
            margin-top: 3px;
            color: #1E2A44;
            font-size: 12px;
          }

          #career-gps-pdf-report .report-chip-list {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            list-style: none;
            margin: 8px 0 0;
            padding: 0;
          }

          #career-gps-pdf-report .report-chip-list li {
            border-radius: 999px;
            background: #EFF5F0;
            color: #114F3B;
            font-size: 11px;
            font-weight: 700;
            margin: 0;
            padding: 5px 8px;
          }

          #career-gps-pdf-report .report-milestone-list {
            list-style: none;
            margin: 8px 0 0;
            padding: 0;
          }

          #career-gps-pdf-report .report-milestone-list li {
            border-left: 3px solid #B08A44;
            margin: 0 0 8px;
            padding: 0 0 2px 9px;
          }

          #career-gps-pdf-report footer {
            border-top: 1px solid #DFD6C2;
            margin-top: 18px;
            padding-top: 10px;
            color: #5D6470;
          }

          .career-gps-no-print {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}

export default function CareerGpsPageShell({ demoMode = false }: { demoMode?: boolean }) {
  const [clientDemoMode] = useState(
    () => typeof window !== "undefined" && new URLSearchParams(window.location.search).get("demo") === "1",
  );
  const isDemoMode = demoMode || clientDemoMode || process.env.NEXT_PUBLIC_CAREER_GPS_DEMO_MODE === "true";
  const [state, setState] = useState<ShellState>({ profile: null, roadmap: null });
  const [selectedRouteType, setSelectedRouteType] = useState<CareerGpsRouteType>("recommended");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSavingSelectedRoute, setIsSavingSelectedRoute] = useState(false);
  const [routeSelectionError, setRouteSelectionError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [riasecResult, setRiasecResult] = useState<RiasecResult | null>(null);
  const [progressEntries, setProgressEntries] = useState<CareerGpsProgressEntry[]>([]);
  const [progressError, setProgressError] = useState<string | null>(null);
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const [nextBestAction, setNextBestAction] = useState<CareerGpsNextBestActionDetail | null>(null);
  const [nextBestActionError, setNextBestActionError] = useState<string | null>(null);
  const [isNextBestActionLoading, setIsNextBestActionLoading] = useState(false);
  const [isUpdatingNextBestAction, setIsUpdatingNextBestAction] = useState(false);
  const [whatIfPreview, setWhatIfPreview] = useState<CareerGpsWhatIfPreview | null>(null);
  const [whatIfPreviewPayload, setWhatIfPreviewPayload] = useState<CareerGpsWhatIfScenarioPayload | null>(null);
  const [whatIfError, setWhatIfError] = useState<string | null>(null);
  const [whatIfMessage, setWhatIfMessage] = useState<string | null>(null);
  const [isPreviewingScenario, setIsPreviewingScenario] = useState(false);
  const [isApplyingScenario, setIsApplyingScenario] = useState(false);

  const loadProgress = useCallback(async (roadmapId: number) => {
    try {
      const progress = await getJson<CareerGpsProgressResponse>(
        `/career-gps/roadmaps/${roadmapId}/progress`,
        { auth: true },
      );
      setProgressEntries(progress.entries);
      setProgressError(null);
    } catch (progressLoadError) {
      setProgressEntries([]);
      setProgressError(
        progressLoadError instanceof Error ? progressLoadError.message : "Unable to load roadmap progress.",
      );
    }
  }, []);

  const loadNextBestAction = useCallback(async (roadmapId: number) => {
    setIsNextBestActionLoading(true);
    setNextBestActionError(null);
    try {
      const action = await getJson<CareerGpsNextBestActionDetail>(
        `/career-gps/roadmaps/${roadmapId}/next-best-action`,
        { auth: true },
      );
      setNextBestAction(action);
    } catch (actionLoadError) {
      setNextBestAction(null);
      setNextBestActionError(
        actionLoadError instanceof Error ? actionLoadError.message : "Unable to load your next best action.",
      );
    } finally {
      setIsNextBestActionLoading(false);
    }
  }, []);

  const loadShell = useCallback(async (refreshing = false) => {
    if (isDemoMode) {
      if (refreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      const demoRoadmap = buildDemoRoadmap("recommended", 1);
      setState({ profile: demoProfile, roadmap: demoRoadmap });
      setSelectedRouteType("recommended");
      setProgressEntries(demoProgressEntries);
      setProgressError(null);
      setNextBestAction(demoNextBestAction);
      setNextBestActionError(null);
      setIsNextBestActionLoading(false);
      setRouteSelectionError(null);
      setWhatIfPreview(null);
      setWhatIfPreviewPayload(null);
      setWhatIfError(null);
      setWhatIfMessage(null);
      setError(null);
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    if (!getAuthToken()) {
      setIsLoading(false);
      setError("Sign in as an employee to view your Career GPS.");
      return;
    }

    if (refreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const profile = await getJson<CareerGpsProfile>("/career-gps/profile", { auth: true });
      let roadmap: CareerGpsRoadmap | null = null;
      try {
        roadmap = await getJson<CareerGpsRoadmap>("/career-gps/roadmaps/latest", { auth: true });
      } catch {
        roadmap = null;
      }
      if (roadmap) {
        await Promise.all([loadProgress(roadmap.roadmap_id), loadNextBestAction(roadmap.roadmap_id)]);
      } else {
        setProgressEntries([]);
        setProgressError(null);
        setNextBestAction(null);
        setNextBestActionError(null);
        setIsNextBestActionLoading(false);
        setWhatIfPreview(null);
        setWhatIfPreviewPayload(null);
        setWhatIfError(null);
        setWhatIfMessage(null);
      }
      setState({ profile, roadmap });
      setSelectedRouteType(roadmap?.selected_route_type ?? "recommended");
      setRouteSelectionError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load Career GPS.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isDemoMode, loadNextBestAction, loadProgress]);

  useEffect(() => {
    loadShell();
  }, [loadShell]);

  useEffect(() => {
    setRiasecResult(loadRiasecResult() ?? (isDemoMode ? demoRiasecResult : null));
  }, [isDemoMode]);

  const handleRiasecResultChange = useCallback((result: RiasecResult | null, isComplete: boolean) => {
    if (!result || !isComplete) return;
    saveRiasecResult(result);
    setRiasecResult(result);
  }, []);

  const profileName = state.profile?.employee.full_name ?? "Employee";
  const profileInitials = useMemo(() => initialsFromName(profileName), [profileName]);
  const activeRoute = useMemo(
    () => selectedRoute(state.roadmap, selectedRouteType),
    [state.roadmap, selectedRouteType],
  );

  const handleSelectRoute = async (routeType: CareerGpsRouteType) => {
    if (!state.roadmap || routeType === selectedRouteType || isSavingSelectedRoute) return;
    const previousRouteType = selectedRouteType;
    const previousRoadmap = state.roadmap;
    setSelectedRouteType(routeType);
    setState((current) => ({
      ...current,
      roadmap: current.roadmap ? { ...current.roadmap, selected_route_type: routeType } : current.roadmap,
    }));
    if (isDemoMode) {
      setNextBestAction((current) =>
        current
          ? {
              ...current,
              route_type: routeType,
              selection_reason: `Demo mode switched to ${routeLabels[routeType]} without saving to production data.`,
            }
          : current,
      );
      setRouteSelectionError(null);
      setWhatIfPreview(null);
      setWhatIfPreviewPayload(null);
      setWhatIfMessage(null);
      return;
    }
    setIsSavingSelectedRoute(true);
    setRouteSelectionError(null);
    try {
      const updatedRoadmap = await putJson<CareerGpsRoadmap, CareerGpsSelectedRoutePayload>(
        `/career-gps/roadmaps/${state.roadmap.roadmap_id}/selected-route`,
        { selected_route_type: routeType },
        { auth: true },
      );
      setState((current) => ({ ...current, roadmap: updatedRoadmap }));
      setSelectedRouteType(updatedRoadmap.selected_route_type);
      await loadNextBestAction(updatedRoadmap.roadmap_id);
      setWhatIfPreview(null);
      setWhatIfPreviewPayload(null);
      setWhatIfMessage(null);
    } catch (selectionError) {
      setSelectedRouteType(previousRouteType);
      setState((current) => ({ ...current, roadmap: previousRoadmap }));
      setRouteSelectionError(
        selectionError instanceof Error ? selectionError.message : "Unable to save the selected route.",
      );
    } finally {
      setIsSavingSelectedRoute(false);
    }
  };

  const handleNextBestActionStatus = async (
    action: CareerGpsNextBestActionDetail,
    statusValue: CareerGpsProgressStatus,
  ) => {
    if (!state.roadmap || isUpdatingNextBestAction) return;
    setIsUpdatingNextBestAction(true);
    setNextBestActionError(null);
    if (isDemoMode) {
      const updatedAction = { ...action, status: statusValue };
      const updatedProgress = demoProgressEntry({
        route_type: action.route_type,
        milestone_sequence: action.milestone_sequence,
        action_sequence: action.action_sequence,
        status: statusValue,
        notes: `Demo mode marked this action ${progressStatusLabel(statusValue).toLowerCase()}.`,
        evidence_url: statusValue === "completed" ? "https://example.com/demo-reviewed-feature" : null,
        completed_at: statusValue === "completed" ? todayIsoDate() : null,
      });
      setNextBestAction(updatedAction);
      setProgressEntries((current) => {
        const key = progressKey(updatedProgress.route_type, updatedProgress.milestone_sequence, updatedProgress.action_sequence);
        const filtered = current.filter(
          (entry) => progressKey(entry.route_type, entry.milestone_sequence, entry.action_sequence) !== key,
        );
        return [...filtered, updatedProgress];
      });
      setIsUpdatingNextBestAction(false);
      return;
    }
    try {
      const updatedAction = await putJson<CareerGpsNextBestActionDetail, CareerGpsNextBestActionStatusPayload>(
        `/career-gps/roadmaps/${state.roadmap.roadmap_id}/next-best-action/status`,
        {
          route_type: action.route_type,
          milestone_sequence: action.milestone_sequence,
          action_sequence: action.action_sequence,
          status: statusValue,
        },
        { auth: true },
      );
      setNextBestAction(updatedAction);
      await loadProgress(state.roadmap.roadmap_id);
    } catch (updateError) {
      setNextBestActionError(
        updateError instanceof Error ? updateError.message : "Unable to update your next best action.",
      );
      await loadProgress(state.roadmap.roadmap_id);
    } finally {
      setIsUpdatingNextBestAction(false);
    }
  };

  const handleRequestAlternativeAction = async () => {
    if (!state.roadmap || isUpdatingNextBestAction) return;
    setIsUpdatingNextBestAction(true);
    setNextBestActionError(null);
    if (isDemoMode) {
      setNextBestAction((current) =>
        current
          ? {
              ...current,
              action_sequence: 2,
              action_title: "Write a post-internship engineering journal",
              why_it_matters:
                "This alternative builds reflective evidence about debugging, collaboration, and review feedback from the same active milestone.",
              estimated_effort: "2-3 focused hours",
              expected_impact: "Gives the demo employee a concise story for interviews and mentor discussions.",
              recommended_skill_gained: "Reflection",
              status: "not_started",
              selection_reason: "Demo mode selected the second incomplete action from the active milestone.",
              is_alternative: true,
            }
          : current,
      );
      setIsUpdatingNextBestAction(false);
      return;
    }
    try {
      const alternative = await postJson<CareerGpsNextBestActionDetail, Record<string, never>>(
        `/career-gps/roadmaps/${state.roadmap.roadmap_id}/next-best-action/alternative`,
        {},
        { auth: true },
      );
      setNextBestAction(alternative);
    } catch (alternativeError) {
      setNextBestActionError(
        alternativeError instanceof Error ? alternativeError.message : "Unable to find an alternative action.",
      );
    } finally {
      setIsUpdatingNextBestAction(false);
    }
  };

  const handlePreviewScenario = async (payload: CareerGpsWhatIfScenarioPayload) => {
    if (isPreviewingScenario || isApplyingScenario) return;
    setIsPreviewingScenario(true);
    setWhatIfError(null);
    setWhatIfMessage(null);
    if (isDemoMode && state.roadmap) {
      const preview = demoWhatIfPreview(state.roadmap, payload);
      setWhatIfPreview(preview);
      setWhatIfPreviewPayload(payload);
      setWhatIfMessage(`Demo preview ready for ${preview.scenario.scenario_name}.`);
      setIsPreviewingScenario(false);
      return;
    }
    try {
      const preview = await postJson<CareerGpsWhatIfPreview, CareerGpsWhatIfScenarioPayload>(
        "/career-gps/roadmaps/what-if/preview",
        payload,
        { auth: true },
      );
      setWhatIfPreview(preview);
      setWhatIfPreviewPayload(payload);
      setWhatIfMessage(`Preview ready for ${preview.scenario.scenario_name}.`);
    } catch (previewError) {
      setWhatIfError(previewError instanceof Error ? previewError.message : "Unable to preview what-if scenario.");
    } finally {
      setIsPreviewingScenario(false);
    }
  };

  const handleApplyScenario = async (payload: CareerGpsWhatIfScenarioPayload) => {
    if (isPreviewingScenario || isApplyingScenario) return;
    const applyPayload = whatIfPreviewPayload ?? payload;
    setIsApplyingScenario(true);
    setWhatIfError(null);
    setWhatIfMessage(null);
    if (isDemoMode && state.roadmap) {
      const preview = whatIfPreview ?? demoWhatIfPreview(state.roadmap, applyPayload);
      const appliedRoadmap = {
        ...preview.preview_roadmap,
        version: state.roadmap.version + 1,
      };
      setState((current) => ({ ...current, roadmap: appliedRoadmap }));
      setSelectedRouteType(appliedRoadmap.selected_route_type);
      setWhatIfPreview(null);
      setWhatIfPreviewPayload(null);
      setWhatIfMessage("Demo scenario applied locally. Production roadmap data was not changed.");
      setIsApplyingScenario(false);
      return;
    }
    try {
      const response = await postJson<CareerGpsWhatIfApplyResponse, CareerGpsWhatIfScenarioPayload>(
        "/career-gps/roadmaps/what-if/apply",
        applyPayload,
        { auth: true },
      );
      setState((current) => ({ ...current, roadmap: response.applied_roadmap }));
      setSelectedRouteType(response.applied_roadmap.selected_route_type ?? "recommended");
      setWhatIfPreview(null);
      setWhatIfPreviewPayload(null);
      setWhatIfMessage(response.message);
      await Promise.all([
        loadProgress(response.applied_roadmap.roadmap_id),
        loadNextBestAction(response.applied_roadmap.roadmap_id),
      ]);
    } catch (applyError) {
      setWhatIfError(applyError instanceof Error ? applyError.message : "Unable to apply what-if scenario.");
    } finally {
      setIsApplyingScenario(false);
    }
  };

  const handleDiscardScenario = () => {
    setWhatIfPreview(null);
    setWhatIfPreviewPayload(null);
    setWhatIfError(null);
    setWhatIfMessage(null);
  };

  const handleSaveProgress: SaveProgressHandler = async (kind, payload) => {
    if (!state.roadmap || isSavingProgress) return;
    setIsSavingProgress(true);
    setProgressError(null);
    if (isDemoMode) {
      const updated = demoProgressEntry(payload);
      setProgressEntries((current) => {
        const key = progressKey(updated.route_type, updated.milestone_sequence, updated.action_sequence);
        const filtered = current.filter(
          (entry) => progressKey(entry.route_type, entry.milestone_sequence, entry.action_sequence) !== key,
        );
        return [...filtered, updated];
      });
      if (nextBestAction && payload.route_type === nextBestAction.route_type && payload.milestone_sequence === nextBestAction.milestone_sequence && payload.action_sequence === nextBestAction.action_sequence) {
        setNextBestAction({ ...nextBestAction, status: payload.status });
      }
      setIsSavingProgress(false);
      return;
    }
    try {
      const updated = await putJson<CareerGpsProgressEntry, CareerGpsProgressUpdatePayload>(
        `/career-gps/roadmaps/${state.roadmap.roadmap_id}/progress/${kind === "action" ? "actions" : "milestones"}`,
        payload,
        { auth: true },
      );
      setProgressEntries((current) => {
        const key = progressKey(updated.route_type, updated.milestone_sequence, updated.action_sequence);
        const filtered = current.filter(
          (entry) => progressKey(entry.route_type, entry.milestone_sequence, entry.action_sequence) !== key,
        );
        return [...filtered, updated];
      });
    } catch (saveError) {
      setProgressError(saveError instanceof Error ? saveError.message : "Unable to save roadmap progress.");
    } finally {
      setIsSavingProgress(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FFFFFF] text-[#1E2A44]">
      <EmployeeTopNav initials={profileInitials} name={profileName} />

      <section className="mx-auto max-w-7xl space-y-4 px-4 py-5 sm:px-6 lg:px-8">
        {isLoading ? (
          <LoadingShell />
        ) : error ? (
          <div className="space-y-4">
            <AlertMessage>{error}</AlertMessage>
            <Link
              href={routes.login}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1E2A44] px-4 py-2.5 text-sm font-bold text-white"
            >
              Go to login
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : state.profile ? (
          <>
            <CareerGpsHeader
              profile={state.profile}
              roadmap={state.roadmap}
              isRefreshing={isRefreshing}
              isDemoMode={isDemoMode}
              onRefresh={() => loadShell(true)}
            />
            {isDemoMode && <DemoModeBanner />}
            <RouteSelectorShell
              roadmap={state.roadmap}
              selectedRouteType={selectedRouteType}
              isSavingSelectedRoute={isSavingSelectedRoute}
              routeSelectionError={routeSelectionError}
              onSelectRoute={handleSelectRoute}
            />
            <RiasecCareerFitSection
              riasecResult={riasecResult}
              activeRoute={activeRoute}
              onResultChange={handleRiasecResultChange}
            />
            <CareerJourneyMap
              roadmap={state.roadmap}
              activeRoute={activeRoute}
              progressEntries={progressEntries}
              isSavingProgress={isSavingProgress}
              progressError={progressError}
              isDemoMode={isDemoMode}
              employeeName={state.profile.employee.full_name}
              riasecResult={riasecResult}
              onSelectRoute={handleSelectRoute}
              onSaveProgress={handleSaveProgress}
            />
            <NextBestAction
              roadmap={state.roadmap}
              action={nextBestAction}
              isLoading={isNextBestActionLoading}
              isUpdating={isUpdatingNextBestAction}
              error={nextBestActionError}
              onUpdateStatus={handleNextBestActionStatus}
              onRequestAlternative={handleRequestAlternativeAction}
            />
            <NorthStarSummary profile={state.profile} />
            <SkillsReadinessSection
              profile={state.profile}
              activeRoute={activeRoute}
              progressEntries={progressEntries}
            />
            <WhatIfCareerSimulator
              roadmap={state.roadmap}
              activeRoute={activeRoute}
              preview={whatIfPreview}
              isPreviewing={isPreviewingScenario}
              isApplying={isApplyingScenario}
              error={whatIfError}
              message={whatIfMessage}
              onPreview={handlePreviewScenario}
              onApply={handleApplyScenario}
              onDiscard={handleDiscardScenario}
            />
            <CareerBuddyHandoff activeRoute={activeRoute} />
            <section className="rounded-lg border border-[#CBDFD4] bg-[#EFF5F0] p-4 text-sm font-semibold leading-6 text-[#17694F]">
              <div className="flex items-start gap-2">
                <Sparkles size={17} className="mt-0.5 shrink-0" />
                <p>
                  {state.roadmap?.source_note ??
                    "Career GPS shell loaded from saved profile data. Route generation is intentionally outside this phase."}
                </p>
              </div>
            </section>
            <CareerGpsReportExport
              profile={state.profile}
              roadmap={state.roadmap}
              activeRoute={activeRoute}
              riasecResult={riasecResult}
              progressEntries={progressEntries}
            />
          </>
        ) : (
          <AlertMessage>Career GPS profile was not available.</AlertMessage>
        )}
      </section>
    </main>
  );
}
