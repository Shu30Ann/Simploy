import type {
  EmployeeDemoProfile,
  EmployerAttentionItem,
  EmployerDashboardMetric,
  IndustrySignal,
  InternalGig,
} from "./types";

export const demoEmployeeProfile: EmployeeDemoProfile = {
  id: "candidate-001",
  fullName: "Aina Rahman",
  initials: "AR",
  region: "Klang Valley",
  currentRole: "Graduate Trainee",
  targetRole: "Business Analyst",
  readinessScore: 78,
  profileStrength: 94,
  skills: ["Data Analysis", "Power BI", "Advanced Excel", "Communication"],
  missingSkills: ["Stakeholder Management", "Process Mapping"],
  nextAction: "Start Business Analyst Readiness Path",
};

export const demoInternalGigs: InternalGig[] = [
  {
    id: "gig-001",
    title: "Sales Forecast Dashboard Sprint",
    team: "Commercial Strategy",
    duration: "2-week gig",
    matchScore: 92,
    skills: ["Power BI", "Advanced Excel", "Data Analysis"],
    businessNeed: "Convert weekly sales exports into a dashboard for regional managers.",
    tone: "teal",
  },
  {
    id: "gig-002",
    title: "Graduate Hiring Campaign Support",
    team: "People & Culture",
    duration: "3-week gig",
    matchScore: 86,
    skills: ["Communication", "Content Planning", "Event Coordination"],
    businessNeed: "Support campus engagement content and candidate follow-up workflows.",
    tone: "pink",
  },
  {
    id: "gig-003",
    title: "Procurement Process Mapping",
    team: "Operations Excellence",
    duration: "10-day gig",
    matchScore: 83,
    skills: ["Process Mapping", "Stakeholder Interviews", "Documentation"],
    businessNeed: "Map purchase request bottlenecks before automation rollout.",
    tone: "blue",
  },
];

export const employerDashboardMetrics: EmployerDashboardMetric[] = [
  {
    label: "Active Roles",
    value: "18",
    detail: "12 live, 4 drafts, 2 offer-stage",
    tone: "pink",
  },
  {
    label: "Applications",
    value: "426",
    detail: "91 new this week",
    tone: "teal",
  },
  {
    label: "Qualified Matches",
    value: "42",
    detail: "Ready for hiring manager review",
    tone: "purple",
  },
  {
    label: "Workforce Gap",
    value: "1,110",
    detail: "Projected shortage by 2031",
    tone: "orange",
  },
];

export const employerAttentionItems: EmployerAttentionItem[] = [
  {
    id: "attention-001",
    title: "Critical technician shortage",
    detail: "Maintenance Technician has only 7 qualified matches for 130 projected missing roles.",
    meta: "Critical",
    action: "Open hiring plan",
    tone: "pink",
  },
  {
    id: "attention-002",
    title: "Production mobility opportunity",
    detail: "Automation creates 280 surplus operator roles that can be converted into technical pathways.",
    meta: "Mobility",
    action: "View transition pool",
    tone: "teal",
  },
  {
    id: "attention-003",
    title: "Marketing demand rising",
    detail: "Digital Marketing Specialist demand grows from 12 to 35 roles as export channels expand.",
    meta: "Growth",
    action: "Find candidates",
    tone: "purple",
  },
];

export const industrySignals: IndustrySignal[] = [
  {
    industry: "Manufacturing",
    openRoles: 48,
    candidateSupply: 1320,
    shortageIndex: 76,
    topRoles: ["Maintenance Technician", "Automation Engineer", "Supply Chain Planner"],
    topSkills: ["PLC Troubleshooting", "Supply Chain Planning", "Power BI"],
  },
  {
    industry: "Banking",
    openRoles: 61,
    candidateSupply: 2180,
    shortageIndex: 63,
    topRoles: ["Finance Associate", "Risk Analyst", "Business Analyst"],
    topSkills: ["Financial Analysis", "Advanced Excel", "AI Literacy"],
  },
  {
    industry: "Aviation",
    openRoles: 34,
    candidateSupply: 860,
    shortageIndex: 58,
    topRoles: ["Customer Experience Executive", "Operations Planner", "Safety Coordinator"],
    topSkills: ["Communication", "CRM", "Operations"],
  },
  {
    industry: "Technology",
    openRoles: 72,
    candidateSupply: 1490,
    shortageIndex: 82,
    topRoles: ["Data Analyst", "Cybersecurity Analyst", "Software Engineer"],
    topSkills: ["Data Analysis", "SQL", "Cybersecurity Basics"],
  },
  {
    industry: "Construction",
    openRoles: 39,
    candidateSupply: 930,
    shortageIndex: 60,
    topRoles: ["Civil Engineer", "Project Coordinator", "Sustainability Analyst"],
    topSkills: ["Project Management", "Safety Compliance", "Sustainability Reporting"],
  },
];

export const demoApplicationTimeline = [
  {
    id: "timeline-001",
    title: "Business Analyst",
    company: "Petronas Digital",
    status: "reviewed",
    matchScore: 85,
    nextStep: "Hiring team review",
    dateLabel: "Submitted 9 days ago",
  },
  {
    id: "timeline-002",
    title: "Data Analyst",
    company: "Grab Malaysia",
    status: "shortlisted",
    matchScore: 89,
    nextStep: "Technical interview",
    dateLabel: "Submitted 2 days ago",
  },
  {
    id: "timeline-003",
    title: "Finance Associate",
    company: "Maybank",
    status: "interviewing",
    matchScore: 82,
    nextStep: "Panel interview",
    dateLabel: "Submitted 7 days ago",
  },
];
