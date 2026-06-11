# Simploy — Landing Page Build Spec
> Hand this file to Claude Code. Build the public landing page at route `/`.

---

## 1. Project Context

**Simploy** is a Career OS — a three-layer platform for workforce intelligence.

| Layer | Name | What it does |
|-------|------|-------------|
| 1 | Career Marketplace | Live talent graph: employee profiles, skills, job matching, internal mobility |
| 2 | Workforce Gap Simulator | What-if scenario modeling: attrition, automation, hiring freezes, retirement waves |
| 3 | Action Engine | Automated recommendations: hire, upskill, redeploy, automate |

**Audience**: Two users — employees looking for career growth, and HR/executive teams doing workforce planning.

**Goal of landing page**: Explain the product clearly, establish credibility, and funnel visitors into signup as either an employee or employer.

---

## 2. Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom config
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Font**: Inter via `next/font/google`

---

## 3. File Structure

```
app/
  page.tsx                        ← Landing page (imports + sequences all sections)
  layout.tsx                      ← Root layout with font, metadata, globals
  globals.css                     ← CSS variables + base reset

components/
  landing/
    Navbar.tsx
    Hero.tsx
    SocialProof.tsx
    HowItWorks.tsx
    ForEmployees.tsx
    ForEmployers.tsx
    Pricing.tsx
    About.tsx
    Footer.tsx
  ui/
    Button.tsx                    ← Shared button with variant prop
    Badge.tsx                     ← Pill/tag component
    SectionLabel.tsx              ← Uppercase eyebrow label reused across sections
```

---

## 4. Design Tokens

### 4.1 Color Palette — add to `globals.css`

```css
:root {
  /* Brand */
  --pink:          #E8197A;
  --pink-hover:    #C91569;
  --pink-light:    #FFE8F2;
  --pink-lighter:  #FFF5FA;
  --pink-border:   #FFD0E8;

  --teal:          #06B6D4;
  --teal-hover:    #0891B2;
  --teal-light:    #E0F9FF;
  --teal-border:   #BAF3FF;

  --purple-light:  #F5F0FF;
  --purple-border: #DDD0F8;

  /* Text */
  --text-primary:   #1A1033;
  --text-secondary: #6B7280;
  --text-muted:     #9CA3AF;

  /* Backgrounds */
  --bg-page:         #FDFCFF;
  --bg-card:         #FFFFFF;
  --bg-pink-soft:    #FFF0F8;
  --bg-purple-soft:  #F5F0FF;
  --bg-teal-soft:    #F0FDFF;
  --bg-dark:         #1A1033;

  /* Borders */
  --border:          #F0EBF8;
  --border-strong:   #E2D9F3;

  /* Shadows */
  --shadow-card:  0 4px 24px rgba(232, 25, 122, 0.08);
  --shadow-hero:  0 8px 48px rgba(232, 25, 122, 0.12);
}
```

### 4.2 Tailwind Config extensions — `tailwind.config.ts`

```ts
theme: {
  extend: {
    colors: {
      brand: {
        pink:           "#E8197A",
        "pink-light":   "#FFE8F2",
        "pink-lighter": "#FFF5FA",
        teal:           "#06B6D4",
        "teal-light":   "#E0F9FF",
        dark:           "#1A1033",
      },
    },
    fontFamily: {
      sans: ["Inter", "system-ui", "sans-serif"],
    },
  },
}
```

### 4.3 Typography scale

| Role | Size | Weight | Usage |
|------|------|--------|-------|
| Display | 64px | 700 | Hero headline |
| H2 | 40px | 700 | Section headlines |
| H3 | 24px | 600 | Card titles |
| Body LG | 18px | 400 | Hero subtext, section subtext |
| Body | 16px | 400 | General copy |
| Small | 14px | 400 | Feature descriptions |
| Caption | 13px | 400 | Labels, sub-CTAs |

---

## 5. Shared UI Components

### Button (`components/ui/Button.tsx`)

```tsx
// Two variants:

// primary — filled pink
className="bg-[--pink] hover:bg-[--pink-hover] text-white rounded-full px-6 py-3 text-sm font-medium transition-colors"

// outline — bordered pink  
className="border border-[--pink] text-[--pink] hover:bg-[--pink-lighter] rounded-full px-6 py-3 text-sm font-medium transition-colors bg-transparent"
```

### SectionLabel (`components/ui/SectionLabel.tsx`)

Reusable eyebrow above every section headline:
```tsx
className="text-xs font-semibold tracking-widest uppercase text-[--pink] mb-3"
// Example: <SectionLabel>For Employees</SectionLabel>
```

---

## 6. Page Sections — Full Spec

---

### Section 1: Navbar (`Navbar.tsx`)

**Behavior**: Fixed top, full width, `z-50`. On scroll past 20px, add `shadow-sm`.

**Styles**: `bg-white/90 backdrop-blur-sm border-b border-[--border] px-6 py-4 flex items-center justify-between`

**Left**: Logo text — `Simploy` — `text-xl font-bold text-[--pink]`

**Center** (desktop only, `hidden md:flex gap-8`):
- Solutions
- How It Works  
- Pricing
- About

Nav link style: `text-sm text-[--text-secondary] hover:text-[--text-primary] transition-colors`

**Right** (`flex items-center gap-3`):
- `<Button variant="outline" size="sm">Sign In</Button>` — routes to `/login`
- `<Button variant="primary" size="sm">Get Started</Button>` — routes to `/signup`
- Mobile: hamburger icon (Lucide `Menu`), toggles a mobile nav drawer

---

### Section 2: Hero (`Hero.tsx`)

**Outer styles**: `bg-[--bg-page] pt-32 pb-20 text-center overflow-hidden relative`

**Background glow**: Absolutely positioned div behind content —
```tsx
<div className="absolute inset-0 pointer-events-none">
  <div style={{
    position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)",
    width: 600, height: 600, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(232,25,122,0.06) 0%, transparent 70%)",
  }} />
</div>
```

**Eyebrow badge** (Framer Motion fade-up, delay 0):
```tsx
<span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium
  bg-[--pink-lighter] text-[--pink] border border-[--pink-border] mb-6">
  <Sparkles size={14} /> Introducing the Career OS
</span>
```

**Headline** (Framer Motion fade-up, delay 0.05):
```
The Career OS your
workforce deserves.
```
Style: `text-[64px] font-bold leading-[1.1] tracking-tight text-[--text-primary]`
The word **"OS"** should be `text-[--pink]`.
Mobile: `text-[36px]`

**Subheadline** (fade-up, delay 0.1):
```
Simploy maps your live talent graph, simulates future workforce gaps, and
recommends the exact actions to close them — before they become crises.
```
Style: `text-lg text-[--text-secondary] max-w-[540px] mx-auto mt-4 leading-relaxed`

**CTA row** (fade-up, delay 0.15, `flex items-center justify-center gap-3 mt-8`):
- `<Button variant="outline">I'm an Employee</Button>` → `/signup?role=employee`
- `<Button variant="primary">I'm an Employer</Button>` → `/signup?role=employer`

**Sub-CTA** (fade-up, delay 0.2):
```
Free for employees · No credit card required
```
Style: `text-xs text-[--text-muted] mt-3`

**Hero visual mockup** (fade-up, delay 0.25, `mt-16 max-w-[900px] mx-auto px-4`):

Build a CSS div-based dashboard mockup. Do NOT use a screenshot or image. Style it as:
```
rounded-2xl border border-[--border] shadow-[--shadow-hero] overflow-hidden bg-white
```

Inside the mockup, render a simplified employer dashboard with:

```
┌─────────────────────────────────────────────────────────────────┐
│  [navbar strip: Simploy logo | Jobs Applications Pipeline ...]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Welcome back, Acme Corp Team!                                  │
│  Your talent marketplace is live.                               │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │ 124          │  │ 18           │                            │
│  │ APPLICATIONS │  │ HIRED        │                            │
│  └──────────────┘  └──────────────┘                            │
│                                                                 │
│  Job Postings                      Active (8)  Draft (3)       │
│  ──────────────────────────────────────────────────────        │
│  Senior Protocol Engineer    Active   42   ●●●                 │
│  DevRel Lead                 Active   15   ●●                  │
│  Product Designer (v2)       Draft     0   Pending             │
│                                                                 │
│  ┌───────────────────────────────────┐                         │
│  │ Marketplace Insights              │                         │
│  │ Rust/Wasm Demand    ████████ HIGH │                         │
│  │ Solidity Skills     █████    MED  │                         │
│  └───────────────────────────────────┘                         │
└─────────────────────────────────────────────────────────────────┘
```

Use real Tailwind classes, real-looking mock data, small text sizes (11–12px) inside the mockup. The stat cards use `bg-[--pink] text-white` and `bg-[--teal] text-white` respectively. This mockup is decorative — it does not need to be interactive.

Add a frosted bottom edge to the mockup: an absolutely positioned div at the bottom of the visual with a gradient from transparent to white, simulating a natural crop.

---

### Section 3: Social Proof Strip (`SocialProof.tsx`)

**Outer**: `bg-white border-y border-[--border] py-8`

**Inner**: `max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8`

Four metrics, each:
```tsx
<div className="text-center">
  <p className="text-3xl font-bold text-[--pink]">{metric}</p>
  <p className="text-sm text-[--text-secondary] mt-1">{label}</p>
</div>
```

| Metric | Label |
|--------|-------|
| 14,000+ | Skills mapped |
| 98% | Match accuracy |
| 230+ | Companies |
| $2.3B | Talent value tracked |

Add thin `border-r border-[--border]` dividers between columns on desktop (remove on mobile).

---

### Section 4: How It Works (`HowItWorks.tsx`)

**Outer**: `bg-[--bg-page] py-24`

**Section header** (centered, `max-w-2xl mx-auto text-center`):
- Eyebrow: `HOW IT WORKS`
- Headline: `Three layers. One intelligent system.`
- Subtext: `Most platforms give you data. Simploy gives you answers.`

**Three cards** (`grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-6xl mx-auto px-6`):

Animate with Framer Motion `staggerChildren` (0.1s between cards, fade-up on scroll).

**Card 1 — Career Marketplace**
```
bg: var(--bg-pink-soft)
border: 1px solid var(--pink-border)
borderRadius: 20px
padding: 28px
```
Content:
- Layer number: `01` — `text-6xl font-black text-[--pink] opacity-15 mb-4`
- Title: `Career Marketplace` — `text-xl font-semibold text-[--text-primary]`
- Subtitle: `The live talent graph` — `text-sm text-[--pink] font-medium mt-1`
- Body: `Every employee profile, skill, certification, and career path — always current. It's the LinkedIn + Workday layer that continuously feeds your workforce intelligence.`
- Tags row (mt-4, flex flex-wrap gap-2): `Employee profiles` · `Skills inventory` · `Job marketplace` · `Internal mobility`
  - Tag style: `rounded-full px-3 py-1 text-xs bg-white border border-[--pink-border] text-[--text-secondary]`

**Card 2 — Gap Simulator**
```
bg: var(--bg-purple-soft)
border: 1px solid var(--purple-border)
```
- Number: `02` in purple opacity-15
- Title: `Workforce Gap Simulator`
- Subtitle: `Model any future scenario` — `text-[#7F77DD]`
- Body: `What if 20% of your engineers leave? AI automates 30% of finance tasks? Simploy runs the scenarios and shows you exactly what your workforce looks like in 1, 3, 5, or 10 years.`
- Tags: `What-if scenarios` · `Supply/demand charts` · `Risk scoring` · `Regional gaps`
  - Tag border: `border-[--purple-border]`

**Card 3 — Action Engine**
```
bg: var(--bg-teal-soft)
border: 1px solid var(--teal-border)
```
- Number: `03` in teal opacity-15
- Title: `Action Engine`
- Subtitle: `A plan, not just a report` — `text-[--teal]`
- Body: `After detecting a gap, Simploy doesn't stop at the warning. It generates a concrete action plan: who to hire, who to upskill, who to move, and what to automate.`
- Tags: `Hire recommendations` · `Upskill plans` · `Internal mobility` · `Automation insights`
  - Tag border: `border-[--teal-border]`

**Flow connector** (below cards, `mt-12 flex items-center justify-center flex-wrap gap-2 text-xs text-[--text-muted]`):
```
Career Marketplace  →  Live Talent Data  →  Gap Simulator  →  Risk Predictions  →  Action Engine  →  Outcomes
```
Each word/phrase is a small rounded pill `px-3 py-1 bg-white border border-[--border] rounded-full`.
Arrows are plain text `→` in `text-[--text-muted]`.

---

### Section 5: For Employees (`ForEmployees.tsx`)

**Outer**: `bg-white py-24`

**Two-column layout** (`max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center`):

**Left column — content**:
- Eyebrow: `FOR EMPLOYEES`
- Headline: `Your career, intelligently guided.`
- Subtext: `Simploy shows you exactly where you stand, what skills will unlock new opportunities, and surfaces roles — both inside and outside your company.`

Feature list (mt-8, flex flex-col gap-6):

| Icon (Lucide) | Title | Description |
|---------------|-------|-------------|
| `Sparkles` | AI Job Matching | Get matched to internal and external roles based on your actual skills, not just your job title. |
| `TrendingUp` | Skill Gap Analysis | See the exact skills standing between you and your next role, with a clear learning path to close them. |
| `Building2` | Internal Mobility | Discover opportunities inside your own company before they're ever posted externally. |
| `Network` | Talent Graph | Your skills, certifications, and career arc — visualized as a living graph that grows with you. |

Each feature item layout:
```tsx
<div className="flex gap-4">
  <div className="w-9 h-9 rounded-lg bg-[--pink-lighter] flex items-center justify-center flex-shrink-0">
    <Icon size={18} className="text-[--pink]" />
  </div>
  <div>
    <p className="font-semibold text-[--text-primary] text-sm">{title}</p>
    <p className="text-sm text-[--text-secondary] mt-1">{description}</p>
  </div>
</div>
```

CTA below list:
```tsx
<button className="text-sm text-[--pink] font-medium hover:underline flex items-center gap-1 mt-6">
  Find Your Next Role <ArrowRight size={14} />
</button>
```

**Right column — employee dashboard mockup**:

Build a CSS div-based mockup (not an image). Rounded-2xl, border, shadow-[--shadow-card]:

```
┌───────────────────────────────────────────────┐
│  ✦ Matching for You           View All →      │
│                                               │
│  ┌─────────────────┐  ┌─────────────────┐    │
│  │ [INTERNAL]      │  │ [EXTERNAL]      │    │
│  │                 │  │                 │    │
│  │ Sr. Product     │  │ Creative        │    │
│  │ Designer        │  │ Director        │    │
│  │ Layer 1 Core    │  │ Stellar Labs    │    │
│  │                 │  │                 │    │
│  │ ⚡ 98% Match    │  │ ⚡ 85% Match    │    │
│  └─────────────────┘  └─────────────────┘    │
│                                               │
│  ┌───────────────────────────────────────┐   │
│  │ 🎯 Skill Gap                          │   │
│  │ Unlock 12 new roles with these skills │   │
│  │                                       │   │
│  │ Three.js / WebGL    +5 matches ████   │   │
│  │ Product Analytics   +7 matches ██     │   │
│  └───────────────────────────────────────┘   │
└───────────────────────────────────────────────┘
```

- INTERNAL badge: `bg-[--pink-lighter] text-[--pink] text-[10px] font-semibold rounded px-2 py-0.5`
- EXTERNAL badge: `bg-[--teal-light] text-[--teal] text-[10px] font-semibold rounded px-2 py-0.5`
- Job cards side by side, each: white bg, rounded-xl, border, p-4
- Skill gap panel: `bg-[--bg-purple-soft] rounded-xl border border-[--purple-border] p-4 mt-3`
- Match % bar: thin pink bar, width proportional to value

---

### Section 6: For Employers (`ForEmployers.tsx`)

**Outer**: `bg-[--bg-page] py-24`

**Two-column layout** (`grid grid-cols-1 md:grid-cols-2 gap-16 items-center`):
On desktop: left = visual mockup, right = content. On mobile: content above mockup.

**Left — Gap Simulator mockup**:

Build a CSS div-based mockup (not an image):

```
┌───────────────────────────────────────────────┐
│  What if...                                   │
│  [Attrition Spike] [AI Automation] [Freeze]   │
├───────────────────────────────────────────────┤
│  Projected    Projected    High-Risk    Cost   │
│  Supply       Demand       Roles        of     │
│  4,250        5,100        14           Inaction│
│  ▼ -5% YoY   ▲ +12% YoY  3 Depts     $14.2M  │
├───────────────────────────────────────────────┤
│  Supply vs Demand Gap                         │
│                                               │
│  ████████████████░░░░░░  ← Supply (pink)      │
│  ░░░░░░░████████████████ ← Demand (teal)      │
│  2022      2025      2030                     │
├───────────────────────────────────────────────┤
│  Dept Risk       Regional Shortfall           │
│  Engineering 80% North America  -450          │
│  Sales       45% EMEA          -120           │
│  Operations  30% APAC          +85            │
└───────────────────────────────────────────────┘
```

What-if tabs style: `rounded-full px-3 py-1 text-xs bg-[--pink-lighter] text-[--pink] border border-[--pink-border] cursor-pointer` — first tab active (filled pink bg).

Stat cards row (4 mini cards): `bg-[--bg-pink-soft] rounded-lg p-3 text-center` with metric on top, label below.

Supply/demand chart: two overlapping `div` bars with different widths, pink and teal colors, year labels below.

**Right — content**:
- Eyebrow: `FOR EMPLOYERS`
- Headline: `Know your gaps before they become crises.` (line break after "before")
- Subtext: `Simploy gives HR teams and executives a real-time view of workforce health — and a simulation engine to plan 5 years ahead.`

Feature list (same layout pattern as ForEmployees):

| Icon | Title | Description |
|------|-------|-------------|
| `Database` | Live Workforce Data | A real-time talent graph of your entire organization — skills, headcount, demand, and gaps. |
| `Sliders` | Scenario Simulation | Model attrition, automation, hiring freezes, and retirement waves across any timeframe. |
| `AlertTriangle` | Risk Scoring | Automatically surface high-risk roles, departments, and regions before they impact operations. |
| `Zap` | Action Recommendations | From gap to plan in one click. Hire, upskill, redeploy, or automate — with specific targets. |

CTA:
```tsx
<button className="text-sm text-[--pink] font-medium hover:underline flex items-center gap-1 mt-6">
  Start Simulating <ArrowRight size={14} />
</button>
```

---

### Section 7: Pricing (`Pricing.tsx`)

**Outer**: `bg-white py-24`

**Section header**:
- Eyebrow: `PRICING`
- Headline: `Simple pricing. Serious results.`
- Subtext: `Free for employees. Powerful for teams. Enterprise-grade for the orgs that need it.`

**Three cards** (`grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-5xl mx-auto px-6 items-stretch`):

**Card 1 — Individual**
```
border: 1px solid var(--border)
borderRadius: 20px
padding: 28px
```
- Label: `INDIVIDUAL` in SectionLabel style
- Price: `Free` — `text-4xl font-bold text-[--text-primary]`
- Tagline: `Forever free for employees` — `text-sm text-[--text-secondary] mt-1 mb-6`
- Divider: `border-t border-[--border] my-6`
- Features (flex col, gap-3, text-sm):
  - ✓ Full career profile
  - ✓ Skills inventory & certifications
  - ✓ AI job matching
  - ✓ Skill gap analysis
  - ✓ Apply to internal & external jobs
  - ✓ Talent graph visualization
- Checkmark style: `text-[--pink]` (Lucide `Check` icon, size 14)
- CTA: `<Button variant="outline" className="w-full mt-8">Get Started Free</Button>`

**Card 2 — Starter** ← Featured / Most Popular
```
border: 2px solid var(--pink)
borderRadius: 20px
padding: 28px
position: relative  (for the badge)
transform: scale(1.02)  on md+
boxShadow: 0 8px 32px rgba(232,25,122,0.15)
```
- "Most Popular" badge (absolutely positioned top-0 left-1/2 -translate-x-1/2 -translate-y-1/2):
  ```tsx
  <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2
    bg-[--pink] text-white text-xs font-semibold rounded-full px-4 py-1">
    Most Popular
  </span>
  ```
- Label: `STARTER`
- Price: `$499` — `text-4xl font-bold text-[--text-primary]` + `/mo` in `text-lg text-[--text-secondary]`
- Tagline: `Up to 500 employees`
- Features:
  - ✓ Everything in Individual
  - ✓ Employer dashboard
  - ✓ Job postings & applicant pipeline
  - ✓ Workforce analytics overview
  - ✓ Basic gap simulation (3-year horizon)
  - ✓ Email support
- CTA: `<Button variant="primary" className="w-full mt-8">Start Free Trial</Button>`

**Card 3 — Enterprise**
Same base style as Card 1.
- Label: `ENTERPRISE`
- Price: `Custom` — `text-4xl font-bold`
- Tagline: `Unlimited employees`
- Features:
  - ✓ Everything in Starter
  - ✓ Full Gap Simulator (10-year horizon)
  - ✓ Action Engine recommendations
  - ✓ Regional & department risk scoring
  - ✓ API access
  - ✓ Dedicated success manager
  - ✓ SSO & SCIM provisioning
- CTA: `<Button variant="outline" className="w-full mt-8">Contact Sales</Button>`

---

### Section 8: About (`About.tsx`)

**Outer**: `bg-[--bg-page] py-24`

**Layout**: `max-w-3xl mx-auto px-6 text-center`

- Eyebrow: `ABOUT`
- Headline: `Built for the future of work.`
- Body (two paragraphs, mt-6, text-body, text-secondary, leading-relaxed):

  **P1**: `Workforce planning has been broken for decades. Companies react to talent crises instead of preventing them. Simploy exists to change that — by giving every organization a live, intelligent view of their workforce.`

  **P2**: `We built the Career OS because we believe the best time to solve a talent problem is before it exists. From the individual contributor planning their next move, to the CHRO stress-testing a five-year hiring plan — Simploy is the platform that connects them.`

**Team row** (mt-14, flex justify-center gap-8, flex-wrap):

Three team cards, each (`flex flex-col items-center gap-2`):
```tsx
<div className="w-14 h-14 rounded-full bg-[--pink-lighter] flex items-center justify-center
  text-[--pink] font-semibold text-sm border-2 border-[--pink-border]">
  {initials}
</div>
<p className="text-sm font-semibold text-[--text-primary]">{name}</p>
<p className="text-xs text-[--text-secondary]">{role}</p>
```

| Initials | Name | Role |
|----------|------|------|
| AA | Alex Ahmed | CEO & Co-founder |
| SK | Sara Kim | CTO & Co-founder |
| MR | Marcus Rivera | Head of Product |

---

### Section 9: Footer (`Footer.tsx`)

**Outer**: `bg-[--bg-dark] text-white py-16`

**Grid** (`max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8`):

**Col 1**:
- `Simploy` in `text-lg font-bold text-white mb-3`
- Tagline: `The Career OS for modern teams.` — `text-sm text-white/50`
- Copyright (mt-4): `© 2025 Simploy, Inc.` — `text-xs text-white/30`

**Col 2 — Product**:
- Heading: `Product` — `text-xs font-semibold tracking-widest uppercase text-white/40 mb-4`
- Links: Jobs Marketplace · Gap Simulator · Action Engine · Pricing
- Link style: `text-sm text-white/60 hover:text-white transition-colors block mb-2`

**Col 3 — Company**:
- Heading: `Company`
- Links: About · Blog · Careers · Press

**Col 4 — Legal**:
- Heading: `Legal`
- Links: Privacy Policy · Terms of Service · Cookie Policy

**Bottom bar** (`border-t border-white/10 mt-12 pt-6 text-center`):
```
© 2025 Simploy, Inc. All rights reserved.
```
`text-xs text-white/30`

---

## 7. Animations — Framer Motion

Use a shared `FadeUp` wrapper component for reuse:
```tsx
// components/ui/FadeUp.tsx
const FadeUp = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.5, delay, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);
```

Apply across:
- Hero: wrap eyebrow, headline, subtext, CTAs, and visual each in `<FadeUp>` with staggered delays (0, 0.05, 0.1, 0.15, 0.25)
- How It Works cards: `staggerChildren` container with 0.1s between cards
- ForEmployees / ForEmployers: fade-up the content column and the mockup column with slight delays
- Pricing cards: fade-up with 0.05s stagger

---

## 8. Responsive Rules

| Breakpoint | Changes |
|------------|---------|
| `< 768px` (mobile) | Single column everywhere. Hero headline 36px. Center nav hidden. Hamburger menu. Pricing cards stack vertically. Mockups full width. |
| `768–1024px` (tablet) | ForEmployees/Employers compress to 1 col. Pricing cards in 1 col (or horizontal scroll). |
| `> 1024px` (desktop) | Full 2- and 3-column layouts as specified. Featured pricing card scales up. |

---

## 9. Routing & Links

| Element | Route |
|---------|-------|
| "I'm an Employee" CTA | `/signup?role=employee` |
| "I'm an Employer" CTA | `/signup?role=employer` |
| Navbar "Sign In" | `/login` |
| Navbar "Get Started" | `/signup` |
| All footer links | `#` (placeholder for now) |
| "Find Your Next Role" | `/signup?role=employee` |
| "Start Simulating" | `/signup?role=employer` |
| "Get Started Free" (pricing) | `/signup?role=employee` |
| "Start Free Trial" (pricing) | `/signup?role=employer` |
| "Contact Sales" (pricing) | `mailto:sales@simploy.io` |

---

## 10. SEO & Metadata (`layout.tsx`)

```tsx
export const metadata = {
  title: "Simploy — The Career OS for Modern Teams",
  description: "Simploy maps your live talent graph, simulates future workforce gaps, and recommends the exact actions to close them — before they become crises.",
  openGraph: {
    title: "Simploy — The Career OS",
    description: "Know your workforce gaps before they become crises.",
    url: "https://simploy.io",
    siteName: "Simploy",
    type: "website",
  },
};
```

---

## 11. Build Notes for Claude Code

1. **Mock visuals are divs, not images.** The hero dashboard preview, employee mockup, and employer simulator mockup are all built with Tailwind classes and real-looking mock data. No screenshots needed.

2. **This is a prototype.** No API calls on this page. All data is hardcoded mock data.

3. **Build section by section.** Scaffold all section component files first with placeholder returns, then fill them in order: Navbar → Hero → SocialProof → HowItWorks → ForEmployees → ForEmployers → Pricing → About → Footer.

4. **Framer Motion `whileInView` requires `"use client"`.** Add `"use client"` to the top of any component using Framer Motion.

5. **Tailwind custom colors.** Extend the config as specified in section 4.2 so `bg-brand-pink`, `text-brand-pink`, etc. work as utility classes. Alternatively, use the raw hex values via arbitrary class syntax `bg-[#E8197A]`.

6. **Global CSS variables.** The CSS variables in section 4.1 are defined in `:root` in `globals.css`. They are available everywhere via `var(--pink)` etc. in inline styles or Tailwind arbitrary values.

7. **Inter font.** Import via `next/font/google` in `layout.tsx` and apply to `<body>` as a className.
