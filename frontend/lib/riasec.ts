export type RiasecCode = "R" | "I" | "A" | "S" | "E" | "C";

export type RiasecScores = Record<RiasecCode, number>;

export type RiasecQuestion = {
  id: string;
  code: RiasecCode;
  text: string;
};

export type RiasecProfile = {
  code: RiasecCode;
  name: string;
  label: string;
  animal: string;
  animalName: string;
  summary: string;
  jobThemes: string[];
};

export type RiasecResult = {
  primaryCode: RiasecCode;
  secondaryCode: RiasecCode;
  hollandCode: string;
  scores: RiasecScores;
  animal: string;
  animalName: string;
  label: string;
  summary: string;
  jobThemes: string[];
};

export const RIASEC_STORAGE_KEY = "simploy-riasec-result";
export const RIASEC_SKIPPED_KEY = "simploy-riasec-skipped";

export const riasecProfiles: Record<RiasecCode, RiasecProfile> = {
  R: {
    code: "R",
    name: "Realistic",
    label: "Practical Builder",
    animal: "🐻",
    animalName: "Bear",
    summary: "You prefer practical work, tangible outcomes, tools, systems, and hands-on problem solving.",
    jobThemes: ["Engineering support", "Operations", "Field technician", "Facilities", "Logistics"],
  },
  I: {
    code: "I",
    name: "Investigative",
    label: "Analytical Thinker",
    animal: "🐘",
    animalName: "Elephant",
    summary: "You enjoy analysis, research, evidence, complex problems, and understanding how things work.",
    jobThemes: ["Data analyst", "Business analyst", "Research", "Software", "Risk analyst"],
  },
  A: {
    code: "A",
    name: "Artistic",
    label: "Creative Maker",
    animal: "🦚",
    animalName: "Peacock",
    summary: "You like original ideas, visual expression, storytelling, design, and work with room for imagination.",
    jobThemes: ["UX/UI design", "Content", "Brand", "Product design", "Creative marketing"],
  },
  S: {
    code: "S",
    name: "Social",
    label: "People Helper",
    animal: "🐬",
    animalName: "Dolphin",
    summary: "You are drawn to helping, teaching, advising, supporting, and improving other people's experience.",
    jobThemes: ["Customer success", "HR", "Training", "Healthcare support", "Community operations"],
  },
  E: {
    code: "E",
    name: "Enterprising",
    label: "Persuasive Leader",
    animal: "🦁",
    animalName: "Lion",
    summary: "You enjoy leading, persuading, selling, presenting, negotiating, and moving people toward goals.",
    jobThemes: ["Sales", "Business development", "Product management", "Recruitment", "Management trainee"],
  },
  C: {
    code: "C",
    name: "Conventional",
    label: "Structured Organizer",
    animal: "🦉",
    animalName: "Owl",
    summary: "You prefer organized workflows, reliable processes, records, details, and clear standards.",
    jobThemes: ["Finance operations", "Project coordination", "Compliance", "Admin operations", "Reporting"],
  },
};

export const riasecQuestions: RiasecQuestion[] = [
  { id: "r-tools", code: "R", text: "Fixing, building, or improving something practical with tools or systems." },
  { id: "i-data", code: "I", text: "Finding patterns in data and using evidence to explain what is happening." },
  { id: "a-design", code: "A", text: "Creating a visual, written, or digital idea from a blank page." },
  { id: "s-coach", code: "S", text: "Helping someone learn a skill or feel more confident at work." },
  { id: "e-pitch", code: "E", text: "Pitching an idea and convincing others to support it." },
  { id: "c-organize", code: "C", text: "Organizing information so a team can follow a clean process." },
  { id: "r-outdoors", code: "R", text: "Working with equipment, spaces, products, or physical operations." },
  { id: "i-research", code: "I", text: "Researching a hard question before deciding what action to take." },
  { id: "a-brand", code: "A", text: "Shaping the look, tone, or story of a product or campaign." },
  { id: "s-support", code: "S", text: "Listening to people and guiding them toward the right next step." },
  { id: "e-lead", code: "E", text: "Taking charge when a group needs direction and momentum." },
  { id: "c-detail", code: "C", text: "Checking details, rules, and records so nothing important is missed." },
];

export const emptyRiasecScores: RiasecScores = {
  R: 0,
  I: 0,
  A: 0,
  S: 0,
  E: 0,
  C: 0,
};

export function scoreRiasec(answers: Record<string, number>): RiasecResult | null {
  if (riasecQuestions.some((question) => answers[question.id] === undefined)) {
    return null;
  }

  const scores = { ...emptyRiasecScores };
  riasecQuestions.forEach((question) => {
    scores[question.code] += answers[question.id] ?? 0;
  });

  const rankedCodes = (Object.keys(scores) as RiasecCode[]).sort((a, b) => scores[b] - scores[a]);
  const primaryCode = rankedCodes[0];
  const secondaryCode = rankedCodes[1];
  const profile = riasecProfiles[primaryCode];

  return {
    primaryCode,
    secondaryCode,
    hollandCode: `${primaryCode}${secondaryCode}`,
    scores,
    animal: profile.animal,
    animalName: profile.animalName,
    label: profile.label,
    summary: profile.summary,
    jobThemes: profile.jobThemes,
  };
}

export function loadRiasecResult(): RiasecResult | null {
  if (typeof window === "undefined") return null;

  try {
    const rawResult = window.localStorage.getItem(RIASEC_STORAGE_KEY);
    return rawResult ? (JSON.parse(rawResult) as RiasecResult) : null;
  } catch {
    return null;
  }
}

export function saveRiasecResult(result: RiasecResult) {
  window.localStorage.setItem(RIASEC_STORAGE_KEY, JSON.stringify(result));
  window.localStorage.removeItem(RIASEC_SKIPPED_KEY);
}

export function markRiasecSkipped() {
  window.localStorage.removeItem(RIASEC_STORAGE_KEY);
  window.localStorage.setItem(RIASEC_SKIPPED_KEY, "true");
}
