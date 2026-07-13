# Career GPS UI Implementation

This file is the source of truth for the employee Career GPS redesign work. Read it before each Career GPS UI phase and update it after each phase.

## Current Phase Status

- Phase 3F - Next Best Action: completed.
- Phase 3E - Milestone Details and Progress Tracking: completed.
- Phase 3D - Visual Career Journey Map: completed.
- Phase 3C - Route Selector and Comparison: completed.
- Phase 3B - Career GPS Page Shell: completed.
- Phase 3A - UI Audit and Visual Direction: completed.
- Runtime behavior changed: yes, `/employee/career-gps` now loads a backend-selected deterministic Next Best Action, lets employees start, complete, skip, or request an alternative, and persists the status through ownership-checked progress updates.
- Visible production UI changed: yes, the old static Next Best Action callout is now a prominent actionable panel directly after the Career North Star summary.
- Files changed in Phase 3F:
  - `frontend/components/career-gps/CareerGpsPageShell.tsx`
  - `frontend/lib/backendTypes.ts`
  - `backend/app/repositories/career_gps.py`
  - `backend/app/routers/career_gps.py`
  - `backend/app/schemas/career_gps.py`
  - `backend/app/services/career_gps_service.py`
  - `backend/tests/test_career_gps_integration.py`
  - `docs/career-gps-ui-implementation.md`
- Files changed in Phase 3E:
  - `frontend/components/career-gps/CareerGpsPageShell.tsx`
  - `frontend/lib/backendTypes.ts`
  - `backend/app/core/database.py`
  - `backend/app/repositories/career_gps.py`
  - `backend/app/routers/career_gps.py`
  - `backend/app/schemas/career_gps.py`
  - `backend/app/services/career_gps_service.py`
  - `backend/tests/test_career_gps_integration.py`
  - `backend/migrations/007_roadmap_progress_evidence.sql`
  - `docs/career-gps-ui-implementation.md`
- Files changed in Phase 3D:
  - `frontend/components/career-gps/CareerGpsPageShell.tsx`
  - `docs/career-gps-ui-implementation.md`
- Files changed in Phase 3C:
  - `frontend/components/career-gps/CareerGpsPageShell.tsx`
  - `frontend/lib/backendTypes.ts`
  - `backend/app/core/database.py`
  - `backend/app/repositories/career_gps.py`
  - `backend/app/routers/career_gps.py`
  - `backend/app/schemas/career_gps.py`
  - `backend/app/services/career_gps_service.py`
  - `backend/tests/test_career_gps_integration.py`
  - `backend/migrations/006_selected_route_type.sql`
  - `docs/career-gps-ui-implementation.md`
- Files changed in Phase 3B:
  - `frontend/app/employee/career-gps/page.tsx`
  - `frontend/components/career-gps/CareerGpsPageShell.tsx`
  - `frontend/app/employee/dashboard/page.tsx`
  - `frontend/lib/routes.ts`
  - `docs/career-gps-ui-implementation.md`
- Files changed in Phase 3A:
  - `docs/career-gps-ui-implementation.md`
- Repository note:
  - The repository already contains an uppercase `DOCS` directory. On this Windows workspace, the requested `docs/career-gps-ui-implementation.md` path resolves to that existing directory without renaming it.
- Prior implementation reference:
  - `DOCS/career-gps-implementation.md` contains the historical Career GPS backend, frontend, testing, and security work from earlier phases.

## Existing Frontend Architecture

- Framework: Next.js 14 App Router with React 18 and TypeScript.
- Styling: Tailwind CSS plus CSS variables in `frontend/app/globals.css`.
- Frontend package: `frontend/package.json`.
- Shared API utilities: `frontend/lib/api.ts`.
- Backend response types: `frontend/lib/backendTypes.ts`.
- Route constants: `frontend/lib/routes.ts`.
- Icons: `lucide-react`.
- Motion: `framer-motion` is available through `frontend/components/ui/FadeUp.tsx`.
- Charts/maps available: `recharts`, `react-simple-maps`, and `world-atlas`.
- No broad design-system package is present. Most UI is local Tailwind classes using shared colors and repeated patterns.

## Existing Employee Dashboard

- Employee dashboard route: `/employee/dashboard`.
- File: `frontend/app/employee/dashboard/page.tsx`.
- Layout wrapper: `frontend/app/employee/layout.tsx`.
- The employee layout mounts a floating `ChatWidget` titled "Career Coach".
- The dashboard currently includes:
  - Header and profile menu.
  - Top hero/summary area.
  - Career Command Center.
  - `CareerNorthStarPanel`.
  - `CareerGpsRoadmapPanel`.
  - `RiasecAssessment`.
  - Marketplace search/filter area.
  - Internal and external opportunity sections.
  - Asia market signal map.
- Marketplace functionality is still part of the dashboard and must not be removed during Career GPS redesign phases.

## Existing Roadmap Page Or Surface

- Standalone Career GPS shell route added in Phase 3B: `/employee/career-gps`.
- Phase 3B shell surface: `frontend/components/career-gps/CareerGpsPageShell.tsx`, mounted by `frontend/app/employee/career-gps/page.tsx`.
- Existing roadmap surface: `frontend/components/career-gps/CareerGpsRoadmapPanel.tsx`, mounted inside `/employee/dashboard`.
- Current roadmap behavior:
  - Loads Career GPS profile.
  - Loads latest roadmap.
  - Generates/regenerates roadmap.
  - Shows North Star summary.
  - Shows Next Best Action.
  - Shows what-if simulator.
  - Shows three route cards.
  - Shows a horizontal metro-style roadmap.
  - Shows milestone detail panel.
  - Shows skill readiness summary.
  - Shows Career Buddy panel.
  - Shows source note.
- Current visual issue for the redesign objective: the page is feature-complete but reads as stacked cards. The journey map is not yet the dominant first-read object.
- Phase 3B shell behavior:
  - Loads existing `GET /career-gps/profile`.
  - Attempts to load existing `GET /career-gps/roadmaps/latest`.
  - Does not call roadmap generation.
  - Uses real profile and North Star data in the header and Career North Star summary.
  - Uses real stored Next Best Action and route summaries when a saved roadmap exists.
  - Shows polished placeholders for journey map, skills/readiness, what-if simulator, and Career Buddy.
- Phase 3C route selector behavior:
  - Displays Recommended, Accelerated, and Balanced route cards from stored deterministic roadmap data.
  - Shows timeline, explanation, advantage, trade-off, skill readiness, lifestyle fit, market opportunity, confidence, recommended badge, and selected state.
  - Lets the employee switch active routes without regenerating the roadmap.
  - Persists selected route through `PUT /career-gps/roadmaps/{roadmap_id}/selected-route`.
  - Shows a comparison panel between the active route and Recommended Route.
- Phase 3D journey map behavior:
  - Replaces the placeholder with `CareerJourneyMap` on `/employee/career-gps`.
  - Uses the selected route and stored milestone data from `GET /career-gps/roadmaps/latest`.
  - Shows a desktop SVG curved route path with start, active milestone, future milestones, alternative route branches, and destination.
  - Shows a mobile vertical path without horizontal overflow.
  - Uses the local RIASEC result from `simploy-riasec-result` as the current-position marker on the active milestone.
  - Falls back to a neutral `MapPin` marker when no RIASEC result exists.
  - Clicking or keyboard-selecting a node updates a compact selected-stop panel.
  - Keeps locked styling available in the component legend but does not assign real locked milestones because the current API has no explicit lock semantics.
- Phase 3E milestone detail and progress behavior:
  - Loads `GET /career-gps/roadmaps/{roadmap_id}/progress` after loading the latest roadmap.
  - Uses persisted progress to show completed, active, future, and destination states on the journey map.
  - Fetches selected milestone details from `GET /career-gps/roadmaps/{roadmap_id}/milestones/{route_type}/{milestone_sequence}`.
  - Shows why recommended, timing, required/existing/missing skills, certification note, recommended experience, suggested project, target roles, transition difficulty, lifestyle impact, confidence, assumptions, and immediate actions.
  - Does not show salary data because no validated salary source is attached to the Career GPS roadmap.
  - Lets employees mark actions as not started, in progress, or complete.
  - Lets employees save a progress note, evidence URL, and completion date.
  - Lets employees mark a milestone complete only after all stored milestone actions are complete.
  - Persists progress in `roadmap_progress` so it survives refresh and login.
- Phase 3F Next Best Action behavior:
  - Loads `GET /career-gps/roadmaps/{roadmap_id}/next-best-action` after the latest roadmap loads.
  - Shows action title, why it matters, estimated effort, target completion date, expected impact, related milestone, status, and recommended skill gained.
  - Places the actionable panel immediately after the Career North Star summary and before the route selector and journey map.
  - Lets employees start, mark complete, skip, or request an alternative.
  - Persists start, complete, and skip through `PUT /career-gps/roadmaps/{roadmap_id}/next-best-action/status`.
  - Refreshes roadmap progress after status changes so the journey map and milestone detail panel remain in sync.
  - Uses deterministic backend selection based on selected route, active milestone, largest skill gap, incomplete action state, employee priorities, and route requirements.
  - Does not use Gemini for selection. Wording is template based, so the section still works when AI providers are unavailable.

## Existing RIASEC Character Or Personality Assets

- RIASEC logic: `frontend/lib/riasec.ts`.
- RIASEC UI: `frontend/components/RiasecAssessment.tsx`.
- Storage:
  - `simploy-riasec-result`
  - `simploy-riasec-skipped`
- Existing result fields:
  - `primaryCode`
  - `secondaryCode`
  - `hollandCode`
  - `scores`
  - `animal`
  - `animalName`
  - `label`
  - `summary`
  - `jobThemes`
- Existing avatars are emoji strings mapped to RIASEC profiles. Some emoji source strings appear mojibake-encoded in the source, but this phase does not redesign or replace them.
- Phase 3A visual decision: the existing RIASEC avatar should act as the journey map current-location marker. If there is no result, use a neutral profile/current-location marker and prompt the user to complete the career interest check outside the map.

## Existing Icons And Illustrations

- Existing icons are primarily from `lucide-react`.
- Existing map illustration is generated through `react-simple-maps` in the Asia market section.
- Existing visual styling uses CSS/Tailwind shapes, borders, shadows, badges, pills, and progress bars.
- No reusable bitmap illustration library was found in the frontend.
- Relevant existing icons for Career GPS:
  - `Compass`
  - `Target`
  - `Route`
  - `GitBranch`
  - `Map`
  - `Flag`
  - `Gauge`
  - `CheckCircle2`
  - `Lock` can be introduced from lucide-react for locked milestones if needed.
  - `Bot`
  - `Sparkles`
  - `Loader2`
  - `AlertCircle`

## Existing Design Tokens

Primary tokens live in `frontend/app/globals.css` and `frontend/tailwind.config.ts`.

- Brand colors:
  - Pink: `#E8197A`
  - Pink hover: `#C91569`
  - Pink light: `#FFE8F2`
  - Pink lighter: `#FFF5FA`
  - Teal: `#06B6D4`
  - Teal hover: `#0891B2`
  - Teal light: `#E0F9FF`
  - Dark: `#1A1033`
- Supporting colors:
  - Purple light: `#F5F0FF`
  - Purple border: `#DDD0F8`
  - Success green: `#10B981`
  - Warning amber: `#F59E0B`
  - Error red: `#DC2626`
- Text:
  - Primary: `#1A1033`
  - Secondary: `#6B7280`
  - Muted: `#9CA3AF`
- Backgrounds:
  - Page: `#FDFCFF`
  - Card: `#FFFFFF`
  - Pink soft: `#FFF0F8`
  - Purple soft: `#F5F0FF`
  - Teal soft: `#F0FDFF`
- Borders:
  - Default: `#F0EBF8`
  - Strong: `#E2D9F3`
- Shadows:
  - Card: `0 4px 24px rgba(232, 25, 122, 0.08)`
  - Hero: `0 8px 48px rgba(232, 25, 122, 0.12)`

## Current Card, Navigation, And Interaction Components

- Shared button:
  - `frontend/components/ui/Button.tsx`
  - Current shared button is landing-page oriented, rounded-full, and only supports `primary` and `outline`.
  - Dashboard/Career GPS currently uses inline Tailwind buttons instead.
- Shared labels and motion:
  - `frontend/components/ui/SectionLabel.tsx`
  - `frontend/components/ui/FadeUp.tsx`
- Dashboard cards:
  - Usually `rounded-lg border bg-white p-* shadow-[0_4px_24px_rgba(232,25,122,0.08)]`.
  - Some marketplace sections use `rounded-2xl`, but Career GPS should keep cards at 8px radius or less.
- Menus:
  - `ProfileMenu` is an accessible dropdown with outside-click and Escape handling.
- Modals:
  - `RiasecAssessment` opens a fixed dialog with `role="dialog"` and `aria-modal="true"`.
- Drawers:
  - No reusable drawer component was found.
- Tabs:
  - No reusable tabs component was found.
  - Route choice is currently implemented as selectable cards.
- Progress components:
  - Custom progress bars in RIASEC, Career North Star, roadmap score bars, and milestone progress.
  - No reusable progress component was found.
- Loading/error patterns:
  - `Loader2` spinner with concise loading text.
  - Inline error/info/success alert components local to Career GPS panels.
  - Fetch failures generally set local error state or fall back to null/demo data.

## Existing Responsive Behaviour

- The dashboard uses `max-w-7xl`, responsive padding, and Tailwind breakpoints.
- Common pattern:
  - Mobile: stacked sections.
  - Desktop: `lg:flex`, `xl:grid`, and right-side panels.
- Current roadmap:
  - Route cards stack until `xl:grid-cols-3`.
  - Metro roadmap uses horizontal overflow with `min-w-[760px]`.
  - Milestone detail moves beside the roadmap at `xl:grid-cols-[minmax(0,1fr)_390px]`.
- Current issue:
  - Horizontal scrolling works but makes the map feel like a timeline in a card, not the primary page canvas.

## Existing Backend Endpoints

Career GPS endpoints implemented in `backend/app/routers/career_gps.py`:

- `GET /career-gps/profile`
- `PUT /career-gps/onboarding-progress`
- `PUT /career-gps/goals`
- `PUT /career-gps/lifestyle-priorities`
- `PUT /career-gps/constraints`
- `GET /career-gps/north-star`
- `POST /career-gps/roadmaps/generate`
- `GET /career-gps/roadmaps/latest`
- `GET /career-gps/roadmaps/{roadmap_id}`
- `PUT /career-gps/roadmaps/{roadmap_id}/selected-route`
- `GET /career-gps/roadmaps/{roadmap_id}/next-best-action`
- `PUT /career-gps/roadmaps/{roadmap_id}/next-best-action/status`
- `POST /career-gps/roadmaps/{roadmap_id}/next-best-action/alternative`
- `GET /career-gps/roadmaps/{roadmap_id}/progress`
- `PUT /career-gps/roadmaps/{roadmap_id}/progress/actions`
- `PUT /career-gps/roadmaps/{roadmap_id}/progress/milestones`
- `GET /career-gps/roadmaps/{roadmap_id}/milestones/{route_type}/{milestone_sequence}`
- `POST /career-gps/roadmaps/what-if/preview`
- `POST /career-gps/roadmaps/what-if/apply`
- `GET /career-gps/career-buddy/conversations`
- `POST /career-gps/career-buddy/conversations`
- `GET /career-gps/career-buddy/conversations/{conversation_id}`
- `POST /career-gps/career-buddy/messages`

Other employee endpoints used by dashboard:

- `GET /dashboard/employee`
- `GET /jobs`
- `POST /jobs/{job_id}/apply`
- `GET /applications/me`

## Existing Roadmap-Related API Calls In Frontend

From `frontend/components/career-gps/CareerGpsPageShell.tsx`:

- `GET /career-gps/profile`
- `GET /career-gps/roadmaps/latest`
- `PUT /career-gps/roadmaps/{roadmap_id}/selected-route`
- `GET /career-gps/roadmaps/{roadmap_id}/next-best-action`
- `PUT /career-gps/roadmaps/{roadmap_id}/next-best-action/status`
- `POST /career-gps/roadmaps/{roadmap_id}/next-best-action/alternative`
- `GET /career-gps/roadmaps/{roadmap_id}/progress`
- `PUT /career-gps/roadmaps/{roadmap_id}/progress/actions`
- `PUT /career-gps/roadmaps/{roadmap_id}/progress/milestones`
- `GET /career-gps/roadmaps/{roadmap_id}/milestones/{route_type}/{milestone_sequence}`

From `frontend/components/career-gps/CareerGpsRoadmapPanel.tsx`:

- `GET /career-gps/profile`
- `GET /career-gps/roadmaps/latest`
- `POST /career-gps/roadmaps/generate`
- `POST /career-gps/roadmaps/what-if/preview`
- `POST /career-gps/roadmaps/what-if/apply`
- `GET /career-gps/career-buddy/conversations`
- `GET /career-gps/career-buddy/conversations/{conversation_id}`
- `POST /career-gps/career-buddy/messages`

From `frontend/components/career-gps/CareerNorthStarPanel.tsx`:

- `GET /career-gps/profile`
- `GET /career-gps/north-star`
- `PUT /career-gps/onboarding-progress`
- `PUT /career-gps/goals`
- `PUT /career-gps/lifestyle-priorities`
- `PUT /career-gps/constraints`

## Phase 3E API Contracts

- `GET /career-gps/roadmaps/{roadmap_id}/progress`
  - Auth: employee only.
  - Ownership: `roadmap_id` must belong to the authenticated employee profile.
  - Response: `{ roadmap_id, entries }`.
  - Entry fields: `id`, `roadmap_id`, `route_type`, `milestone_sequence`, `action_sequence`, `status`, `progress_percent`, `notes`, `evidence_url`, `completed_at`, `updated_at`.

- `PUT /career-gps/roadmaps/{roadmap_id}/progress/actions`
  - Auth: employee only.
  - Ownership: route, milestone, and action are resolved server-side under the owned roadmap.
  - Payload: `{ route_type, milestone_sequence, action_sequence, status, notes, evidence_url, completed_at }`.
  - Status values: `not_started`, `in_progress`, `completed`, `skipped`.
  - Response: one progress entry.

- `PUT /career-gps/roadmaps/{roadmap_id}/progress/milestones`
  - Auth: employee only.
  - Ownership: route and milestone are resolved server-side under the owned roadmap.
  - Payload: `{ route_type, milestone_sequence, action_sequence: null, status, notes, evidence_url, completed_at }`.
  - Completion rule: if the milestone has actions, all stored actions must be complete before the milestone can be marked complete.
  - Response: one progress entry.

- `GET /career-gps/roadmaps/{roadmap_id}/milestones/{route_type}/{milestone_sequence}`
  - Auth: employee only.
  - Ownership: `roadmap_id` must belong to the authenticated employee profile.
  - Response includes milestone title, why recommended, estimated timeline, required/existing/missing skills, certification note, recommended experience, suggested project, relevant target roles, transition difficulty, lifestyle impact, confidence level, assumptions, immediate actions, and current progress.
  - Salary data is intentionally omitted unless a future valid salary source is attached.

## Phase 3F API Contracts

- `GET /career-gps/roadmaps/{roadmap_id}/next-best-action`
  - Auth: employee only.
  - Ownership: `roadmap_id` must belong to the authenticated employee profile.
  - Selection: deterministic backend scoring using selected route, active milestone, largest skill gap, incomplete action status, employee priorities, and route requirements.
  - Response fields: `roadmap_id`, `route_type`, `milestone_sequence`, `action_sequence`, `action_title`, `why_it_matters`, `estimated_effort`, `target_completion_date`, `expected_impact`, `related_milestone`, `status`, `recommended_skill_gained`, `selection_reason`, `is_alternative`.

- `PUT /career-gps/roadmaps/{roadmap_id}/next-best-action/status`
  - Auth: employee only.
  - Ownership: route, milestone, and action are resolved server-side under the owned roadmap.
  - Payload: `{ route_type, milestone_sequence, action_sequence, status }`.
  - Status values: `not_started`, `in_progress`, `completed`, `skipped`.
  - Response: the current next best action after the status update.
  - Progress persistence: writes the corresponding `roadmap_progress` action row and records `completed_at` automatically for `completed`.

- `POST /career-gps/roadmaps/{roadmap_id}/next-best-action/alternative`
  - Auth: employee only.
  - Ownership: `roadmap_id` must belong to the authenticated employee profile.
  - Payload: `{}`.
  - Response: the next-ranked available action with `is_alternative: true` when at least two candidates are available.
  - Persistence: requesting an alternative does not itself change progress status.

## Existing Employee Profile State

- Backend employee dashboard state:
  - `full_name`
  - `target_role`
  - `skills`
  - jobs and applications
- Career GPS profile state:
  - employee profile
  - onboarding progress
  - goals
  - lifestyle priorities
  - constraints
  - North Star summary
- Local frontend state:
  - auth token in `localStorage`
  - display name in `simploy-display-name`
  - RIASEC result in `simploy-riasec-result`
  - RIASEC skipped state in `simploy-riasec-skipped`
- Current roadmap progress state:
  - `/employee/career-gps` loads and updates persisted `roadmap_progress` rows as of Phase 3E.
  - The older dashboard `CareerGpsRoadmapPanel` still uses local React state only and resets on refresh.

## Existing Supabase Tables Used By Career GPS

Career GPS foundation migration: `backend/migrations/001_career_gps_foundation.sql`.

- `occupations`
- `occupation_skills`
- `career_transitions`
- `career_north_star_settings`
- `career_preferences`
- `career_priority_weights`
- `career_constraints`
- `career_roadmaps`
  - Phase 3C adds `selected_route_type` with values `recommended`, `accelerated`, or `balanced`.
- `career_routes`
- `roadmap_milestones`
- `milestone_actions`
- `roadmap_score_components`
- `roadmap_progress`
  - Phase 3E adds optional `evidence_url`.
- `roadmap_versions`

Career Buddy migration: `backend/migrations/005_career_buddy.sql`.

- `career_buddy_conversations`
- `career_buddy_messages`

Base employee tables are defined in `backend/supabase_schema.sql`, including `employee_profiles`.

## Page Architecture For The Redesign

Recommended page structure for the polished Career GPS vertical slice:

1. Career GPS header
   - Purpose: establish destination, version, readiness, and regeneration/settings actions.
   - Should feel like a command header, not a marketing hero.
   - Data: employee name, selected target role, roadmap version, scoring version, RIASEC result, source note indicator.

2. Career North Star summary
   - Purpose: show the saved destination and constraints that shape the journey.
   - Data: `CareerGpsNorthStarSummary`, employee target role, priorities, timeline, missing setup sections.
   - Interaction: edit should route/scroll to the existing North Star setup, not open a new duplicate settings surface in this phase.

3. Next Best Action
   - Purpose: one clear immediate action above the map.
   - Data: `roadmap.next_best_action`, recommended route, selected route.
   - Visual: strong but compact dark panel or callout connected visually to the current marker.

4. Route selector
   - Purpose: switch between Recommended, Accelerated, and Balanced routes.
   - Data: `roadmap.routes`, score, estimated months, strongest advantage, main trade-off.
   - Visual: segmented control or compact route tabs above/inside the map, with supporting detail in a secondary row.

5. Journey map
   - Purpose: main visual focus.
   - Data: selected route, milestones, skill gaps, route score components, local/persisted progress, RIASEC avatar.
   - Visual: metro/Google Maps/game progression hybrid with route line, milestone stations, branches, current-position marker, and destination.

6. Milestone detail panel
   - Purpose: show details for the selected station without pushing the map out of view.
   - Data: selected milestone, actions, missing skill, route explanation, route metrics.
   - Visual: desktop side panel; mobile bottom sheet-like section below map.

7. Skills and readiness
   - Purpose: explain readiness and gaps for the selected route.
   - Data: `route.skill_gaps`, `route.score_components`, `skill_fit`, `lifestyle_fit`, `market_opportunity`, `work_life_balance_fit`.
   - Visual: compact readiness meters and prioritized gap chips connected to map stations.

8. What-if simulator
   - Purpose: explore deterministic scenarios after the baseline map is understood.
   - Data: scenario payload, preview roadmap, comparison changes.
   - Visual: collapsible simulator below the map or right-side utility panel; do not make it compete with the map.

9. Career Buddy
   - Purpose: ask contextual questions about the selected route and roadmap.
   - Data: conversations, messages, selected route, provider/model metadata, rate limit remaining.
   - Visual: docked panel below or beside the map; avoid duplicate conflict with the global floating `ChatWidget`.

## Recommended Component Hierarchy

Phase 3B implemented hierarchy:

- `CareerGpsPageShell`
  - `CareerGpsHeader`
  - `NorthStarSummary`
  - `NextBestAction`
  - `RouteSelectorShell`
    - `RouteCard`
    - `RouteComparison`
  - `CareerJourneyMap`
    - `JourneyMilestoneButton`
    - `JourneyCurrentMarker`
    - `MobileJourneyPath`
    - `JourneyLegend`
    - `JourneyDetailPanel`
      - `ActionProgressEditor`
  - placeholder panels for skills/readiness, what-if simulator, and Career Buddy

Target hierarchy for a future implementation phase:

- `CareerGpsExperience`
  - `CareerGpsHeader`
  - `CareerGpsNorthStarStrip`
  - `CareerGpsNextBestAction`
  - `CareerGpsRouteSelector`
  - `CareerJourneyWorkspace`
    - `CareerJourneyMap`
      - `JourneyRouteLine`
      - `JourneyMilestoneNode`
      - `JourneyCurrentMarker`
      - `JourneyBranchNode`
      - `JourneyDestinationNode`
      - `JourneyMapLegend`
    - `CareerMilestoneDetailPanel`
  - `CareerSkillsReadiness`
  - `CareerWhatIfPanel`
  - `CareerBuddyPanel`
  - `CareerGpsSourceNote`

Practical extraction path:

- Keep `CareerGpsRoadmapPanel` as the data-loading container initially.
- Extract current internal functions into separate files only when changing their UI:
  - `NorthStarSummary` to `CareerGpsNorthStarStrip`.
  - `NextBestAction` to `CareerGpsNextBestAction`.
  - `RouteCard` to `CareerGpsRouteSelector`.
  - `MetroRoadmap` to `CareerJourneyMap`.
  - `MilestoneDetailPanel` to `CareerMilestoneDetailPanel`.
  - `SkillReadinessSummary` to `CareerSkillsReadiness`.
  - `WhatIfSimulator` to `CareerWhatIfPanel`.
  - `CareerBuddyPanel` can remain but should be moved into its own file when the map redesign starts.

## Reusable Existing Components And Patterns

- Reuse `ProfileMenu` for dashboard account controls.
- Reuse `RiasecAssessment` and `frontend/lib/riasec.ts` for avatar source data.
- Reuse `getJson`, `postJson`, and `putJson` from `frontend/lib/api.ts`.
- Reuse `CareerGps*` response types from `frontend/lib/backendTypes.ts`.
- Reuse existing `InfoAlert`/`AlertMessage` patterns, but consider extracting a shared local `CareerGpsAlert`.
- Reuse existing score bar pattern for readiness meters.
- Reuse existing `Loader2` loading pattern.
- Reuse existing Tailwind color tokens and dashboard card language.
- Reuse current Career Buddy backend calls; no frontend AI calls.

## Proposed New Components

Production component added in Phase 3B:

- `CareerGpsPageShell`
  - Page-level shell for `/employee/career-gps`.
  - Handles loading, missing auth, profile fetch errors, latest-roadmap absence, and refresh/recalculate state.
  - Handles route selection and comparison as of Phase 3C.
  - Keeps journey map, skills/readiness, what-if simulator, and Career Buddy as placeholders.

Production route selector pieces added in Phase 3C:

- `RouteCard`
  - Displays one route type, explanation, estimated timeline, advantage, trade-off, skill readiness, lifestyle fit, market opportunity, confidence, recommended badge, and selected state.
- `RouteComparison`
  - Compares active route against Recommended Route across timeline, advantage, trade-off, readiness, lifestyle, and opportunity.

Production journey-map pieces added in Phase 3D inside `CareerGpsPageShell`:

- `CareerJourneyMap`
  - Large visual route canvas for the active selected route.
  - Owns SVG route-line layout, milestone click targets, current marker, destination, alternative route branch hints, mobile path, and selected-stop detail state.
- `JourneyMilestoneButton`
  - Accessible button for each milestone/station.
  - Renders status, title, timeline, gap, and selected state.
- `JourneyCurrentMarker`
  - Renders existing RIASEC avatar as the current-location marker.
  - Falls back to a neutral `MapPin` marker if no RIASEC result exists.
- `JourneyMapLegend`
  - Explains completed, active, future, locked, branch, and destination states.
- `MobileJourneyPath`
  - Vertical mobile route layout that avoids unusable horizontal overflow.
- `JourneyDetailPanel`
  - Expanded in Phase 3E into an actionable milestone detail panel with progress controls.
- `ActionProgressEditor`
  - Lets employees set action status, notes, evidence URL, and completion date.

No production component was created in Phase 3A. Proposed future components:

- `CareerGpsRouteSelector`
  - Compact route switcher replacing large route cards near the top of the map.
- `CareerGpsMetricRail`
  - Small readiness/lifestyle/market/confidence metrics aligned with selected route.
- `CareerMilestoneDetailPanel`
  - Desktop side panel and mobile below-map panel.
- `CareerGpsSourceNote`
  - Consistent note for illustrative seed data and deterministic planning scores.

## Expected Data Required By Component

- `CareerGpsHeader`
  - `EmployeeDashboardData.full_name`
  - `CareerGpsRoadmap.version`
  - `CareerGpsRoadmap.scoring_version`
  - `CareerGpsProfile.north_star`
  - `RiasecResult | null`

- `CareerGpsNorthStarStrip`
  - `CareerGpsNorthStarSummary`
  - `CareerGpsConstraint[]`

- `CareerGpsNextBestAction`
  - `CareerGpsNextBestActionDetail`
  - status update payload: `{ route_type, milestone_sequence, action_sequence, status }`
  - alternative request response: `CareerGpsNextBestActionDetail`

- `CareerGpsRouteSelector`
  - `CareerGpsRoute[]`
  - selected `CareerGpsRouteType`
  - derived strongest/weakest score components
  - `CareerGpsRoadmap.selected_route_type`
  - update payload: `{ selected_route_type: "recommended" | "accelerated" | "balanced" }`

- `CareerJourneyMap`
  - selected `CareerGpsRoute`
  - selected `CareerGpsMilestone | null`
  - progress state keyed by route type and milestone/action
  - `RiasecResult | null`
  - route colors and visual-state mapping

- `CareerMilestoneDetailPanel`
  - selected `CareerGpsMilestone`
  - selected `CareerGpsRoute`
  - derived missing requirement
  - milestone actions

- `CareerSkillsReadiness`
  - selected `CareerGpsRoute.skill_gaps`
  - selected `CareerGpsRoute.score_components`

- `CareerWhatIfPanel`
  - active `CareerGpsRoadmap`
  - preview `CareerGpsWhatIfPreview | null`
  - `CareerGpsWhatIfScenarioPayload`
  - preview/apply loading state

- `CareerBuddyPanel`
  - active roadmap ID
  - selected route type
  - conversation list/detail
  - message draft
  - provider/model/rate-limit metadata

## Journey Map Visual Language

The journey map should combine a metro map, Google Maps route, and game-style progression path while staying professional.

- Current-position marker:
  - Use the existing RIASEC avatar as the "you are here" marker.
  - Place it on the active milestone or the first incomplete milestone.
  - Use a strong circular marker with white ring, subtle shadow, and route-colored halo.
  - If no RIASEC result exists, use profile initials or a `MapPin`/`Compass` marker.
  - Do not redesign the RIASEC character in Phase 3A or the immediate next build phase unless explicitly requested.

- Completed milestone:
  - Filled green or route-color node with `CheckCircle2`.
  - Route line behind it is solid.
  - Label can be visually quieter but still readable.

- Active milestone:
  - Larger station node with RIASEC current marker attached.
  - Pink accent by default for recommended route.
  - Route line to active point is solid; next segment can be animated/subtly dashed.

- Future milestone:
  - White or pale filled station with strong border.
  - Route line ahead is muted or dashed.
  - Shows title and timeline, but secondary text should be compact.

- Locked milestone:
  - Muted node with lock icon.
  - Use only when backend data or deterministic rules indicate prerequisite gaps. Do not invent locked states randomly.
  - If no lock data exists, reserve the visual language but do not render locked milestones.

- Branching decision point:
  - Use `GitBranch` or a split station where route variants diverge.
  - Route selector should make branches legible: Recommended, Accelerated, Balanced.
  - Since the current backend returns separate route arrays rather than one shared graph, branch nodes are visual/inferred from route choice, not persisted graph data.

- Destination:
  - Use `Target` or flag marker at the target occupation.
  - Strong dark/pink treatment with label for target role and estimated timeline.
  - Should be visible without horizontal scrolling on desktop.

- Route colors:
  - Recommended: pink `#E8197A`.
  - Accelerated: teal `#06B6D4`.
  - Balanced: purple `#6B46C1` / existing purple light border.
  - Completed: success green `#10B981`.
  - Locked/muted: border `#E2D9F3`, text `#9CA3AF`.
  - Branch/supporting line: purple border `#DDD0F8`.

- Route-line behaviour:
  - Solid from start through completed milestones.
  - Strong active segment to the current marker.
  - Dashed or low-opacity line for future segments.
  - Branches should curve or angle clearly, not overlap labels.
  - Use CSS/SVG inside React; no paid maps API.

- Mobile layout behaviour:
  - Map becomes vertical or stepped path, not a tiny desktop map.
  - Current marker remains visible near the active milestone.
  - Milestone detail panel moves below map.
  - Route selector becomes horizontally scrollable segmented controls or stacked compact buttons.
  - Avoid requiring pinch zoom.

- RIASEC avatar behaviour:
  - Read from local RIASEC state already used by the dashboard.
  - Use avatar as a marker only; do not change test scoring or profile mapping.
  - Tooltip/label should show animal name, Holland code, and label.
  - Fallback marker should not block roadmap use.

## Visual States To Support

- Auth missing:
  - Show sign-in required message consistent with current `InfoAlert` pattern.
- Loading:
  - Spinner with "Loading Career GPS roadmap...".
- Empty roadmap:
  - Focused generate roadmap state with clear source note.
- Generating:
  - Disable generate/regenerate controls and show spinner.
- Generated roadmap:
  - Header, route selector, map, detail panel, readiness, simulator, buddy, source note.
- API error:
  - Inline alert above the affected area.
- No RIASEC result:
  - Neutral current marker and CTA/label to take interest check later.
- Selected milestone:
  - Map node and detail panel in sync.
- Local progress:
  - Continue supporting planned, in-progress, and completed.
  - Clearly note local-only state until backend progress endpoints exist.
- What-if preview:
  - Preview should not overwrite the active map until applied.
  - Visually label preview as scenario data.
- AI unavailable:
  - Career Buddy should continue using backend template fallback.

Phase 3B implemented states:

- Loading skeletons for the page shell.
- Missing auth/error alert with login link.
- Header and North Star summary from `GET /career-gps/profile`.
- Empty latest-roadmap state for Next Best Action and Route selector.
- Recalculate button refreshes existing profile/latest-roadmap data only; it does not generate a roadmap.
- Polished placeholders for journey map, skills/readiness, what-if simulator, and Career Buddy.

Phase 3C implemented states:

- Three route cards for Recommended Route, Accelerated Route, and Balanced Route.
- Recommended badge on the recommended deterministic route.
- Selected route state with active styling and check indicator.
- Route selection save-in-progress disabled state.
- Route selection error alert with optimistic UI rollback.
- Comparison panel for active route vs Recommended Route.

Phase 3D implemented states:

- Empty journey map state when no stored roadmap or active route exists.
- Desktop interactive route map with SVG curved path and branch hints.
- Mobile interactive vertical path.
- RIASEC current-position marker and neutral fallback marker.
- Selected node state with desktop side panel and mobile below-map panel.
- Keyboard-accessible milestone buttons with descriptive labels.
- Locked visual language is present in the legend/component styling, but real locked milestones are not assigned until the backend returns explicit lock data.

Phase 3E implemented states:

- Persisted progress loading for the active roadmap.
- Progress-driven journey node states across refresh and login.
- Milestone detail loading, error, and fallback states.
- Action status controls for not started, in progress, and complete.
- Progress note, evidence URL, and completion date fields.
- Milestone complete control gated by completed action requirements.
- Backend ownership checks for every progress and milestone detail request.

## Responsive Approach

- Desktop:
  - Full-width Career GPS workspace after header/North Star.
  - Route selector above map.
  - Journey map large on left/center.
  - Milestone detail panel as right rail.
  - Readiness, what-if, and buddy below or in a secondary utility area.
- Tablet:
  - Map remains prominent.
  - Detail panel may move below or become a two-column block.
  - Route selector scrolls horizontally if needed.
- Mobile:
  - Header collapses to compact summary.
  - Route selector becomes segmented/scrollable.
  - Journey map becomes vertical step path.
  - Detail panel appears immediately after map.
  - What-if and Career Buddy are collapsed/stacked after core journey.

## Existing API Gaps

- Persisted progress:
  - Resolved for `/employee/career-gps` in Phase 3E through progress read/update endpoints and `roadmap_progress`.
  - The older dashboard `CareerGpsRoadmapPanel` still uses local React state only.
- RIASEC backend persistence:
  - RIASEC result is currently localStorage only.
  - Journey map can use it locally, but cross-device persistence would need backend support later.
- Shared route graph:
  - Backend returns three separate routes, not a shared branching graph.
  - Branch visuals must be derived or require future API shape changes.
- Locked milestone semantics:
  - Backend returns gaps and actions but not explicit locked/unlocked milestone states.
  - Do not render real locks unless derived rules are documented or API adds status.
- Roadmap history UI:
  - Backend stores versions, but there is no version list endpoint/UI in the current Career GPS panel.
- Saved what-if scenarios:
  - Preview/apply exists, but no saved scenario library.
- Career Buddy placement conflict:
  - Employee layout has a global floating `ChatWidget`; Career GPS also has `CareerBuddyPanel`.
  - Redesign should avoid two visually competing chat entry points.
- Resolved in Phase 3C:
  - Active selected route persistence now exists through `career_roadmaps.selected_route_type` and `PUT /career-gps/roadmaps/{roadmap_id}/selected-route`.

## Design Decisions For Future Phases

- Phase 3B introduced a dedicated `/employee/career-gps` route because the task asked for a Career GPS page shell and navigation structure.
- Keep existing dashboard and marketplace surfaces intact.
- Make the journey map the primary visual object.
- Reuse existing backend data contracts first.
- Keep AI/backend calls in the Render backend only.
- Do not add paid APIs or external map APIs.
- Do not remove marketplace sections in this phase.
- Use deterministic backend route data; do not randomize recommendations, scores, milestones, or locks.
- Label illustrative seed data clearly using `roadmap.source_note`.
- Keep RIASEC avatar behavior lightweight and local until backend persistence is requested.

## Risks

- `CareerGpsRoadmapPanel.tsx` is already large and contains many internal components; redesign work can become hard to review unless extracted carefully.
- The desired map may require careful responsive layout and accessibility work because current roadmap is horizontal-scroll based.
- Current RIASEC avatar strings appear mojibake-encoded; using them as map markers may expose the encoding issue more prominently.
- The existing dashboard contains illustrative Asia market salary/market values. Future Career GPS pages must not present those as verified labor-market data.
- Career Buddy and the global `ChatWidget` can confuse users if both are visually prominent.
- Without persisted progress endpoints, progress visualization cannot survive refresh.
- Without explicit locked-state data, locked milestones could mislead users if invented visually.

## Phase Implementation Order

1. Phase 3A - UI Audit and Visual Direction
   - Completed in this document.
   - No runtime behavior changes.

2. Phase 3B - Career GPS Page Shell
   - Completed.
   - Added `/employee/career-gps`.
   - Added a page-level shell with header, Career North Star summary, real Next Best Action and route summary data when available, and placeholders for later sections.
   - Did not implement route generation or the complete interactive roadmap.

3. Phase 3C - Route Selector and Comparison
   - Completed.
   - Added selectable route cards and comparison panel.
   - Persisted active selected route without regenerating the roadmap.
   - Did not build the full journey map.

4. Phase 3D - Journey Map First Layout
   - Completed.
   - Replaced current placeholder map with `CareerJourneyMap`.
   - Added RIASEC current marker and neutral fallback.
   - Preserved current route/milestone data contracts.
   - Did not implement full milestone details, progress persistence, what-if, or Career Buddy placement changes.

5. Phase 3E - Milestone Details and Progress Tracking
   - Completed.
   - Added backend endpoints for milestone details and persisted progress.
   - Wired action status, notes, evidence URL, completion date, and milestone completion to `/employee/career-gps`.
   - Used existing `roadmap_progress` table with one additive `evidence_url` field.
   - Did not add salary data, new AI calls, or unrelated marketplace changes.

6. Phase 3F - Next Best Action
   - Completed.
   - Added backend-selected deterministic Next Best Action details and action status workflow.
   - Placed the panel directly after Career North Star on `/employee/career-gps`.
   - Persisted Start, Mark complete, and Skip through existing roadmap progress storage.
   - Did not add AI-dependent selection, salary data, new database tables, or unrelated marketplace changes.

7. Phase 3G - Responsive Polish And Accessibility, If Requested
   - Improve route-color consistency, map spacing, mobile density, and browser screenshot verification.
   - Further refine keyboard/focus states and accessible labels.

8. Phase 3H - Optional Scenario/Buddy Placement Polish
   - Reposition what-if and Career Buddy so they support the map rather than compete with it.
   - Do not change backend AI/scoring rules.

## Testing Completed In Phase 3A

- Read attempted: `docs/career-gps-ui-implementation.md`.
  - Result: file did not exist before Phase 3A.
- Inspected historical implementation document:
  - `DOCS/career-gps-implementation.md`
- Inspected frontend stack:
  - `frontend/package.json`
  - `frontend/tailwind.config.ts`
  - `frontend/app/globals.css`
  - `frontend/app/layout.tsx`
  - `frontend/lib/routes.ts`
- Inspected employee dashboard:
  - `frontend/app/employee/dashboard/page.tsx`
  - `frontend/app/employee/layout.tsx`
- Inspected Career GPS frontend:
  - `frontend/components/career-gps/CareerGpsRoadmapPanel.tsx`
  - `frontend/components/career-gps/CareerNorthStarPanel.tsx`
  - `frontend/lib/backendTypes.ts`
  - `frontend/lib/api.ts`
- Inspected RIASEC frontend:
  - `frontend/lib/riasec.ts`
  - `frontend/components/RiasecAssessment.tsx`
- Inspected shared UI:
  - `frontend/components/ui/Button.tsx`
  - `frontend/components/ui/SectionLabel.tsx`
  - `frontend/components/ui/FadeUp.tsx`
  - `frontend/components/ProfileMenu.tsx`
  - `frontend/components/chat/ChatWidget.tsx`
- Inspected backend/API:
  - `backend/app/routers/career_gps.py`
  - `backend/app/schemas/career_gps.py`
  - `backend/app/services/career_gps_service.py`
  - `backend/app/services/career_route_engine.py`
  - `backend/app/repositories/career_gps.py`
  - `backend/app/routers/dashboard.py`
  - `backend/app/schemas/dashboard.py`
  - `backend/migrations/001_career_gps_foundation.sql`
  - `backend/migrations/005_career_buddy.sql`
  - `backend/supabase_schema.sql`
- Build/lint/test status:
  - Verified the document content and git status after the update.
  - Frontend lint/type/build and backend tests were not run because Phase 3A is documentation-only and changes no executable frontend/backend code.

## Testing Completed In Phase 3B

- `npm run lint` passed in `frontend`.
- `npx tsc --noEmit` passed in `frontend`.
- `npm run build` initially failed inside the sandbox with `spawn EPERM` when Next.js tried to create worker processes.
- Re-ran `npm run build` with approved escalation for the same command; production build passed.
- Build output included the new static route:
  - `/employee/career-gps`
- Backend tests were not run because Phase 3B did not change backend code.

## Testing Completed In Phase 3C

- `python -m compileall backend\app` passed.
- `python -m unittest discover backend\tests` passed.
  - 9 tests passed.
  - Added coverage for selected-route persistence without roadmap regeneration.
  - Added ownership check for selected-route updates.
  - Existing AnyIO `ResourceWarning` messages appeared from TestClient memory streams; the test suite still completed successfully.
- `npm run lint` passed in `frontend`.
- `npx tsc --noEmit` passed in `frontend`.
- `npm run build` passed in `frontend`.
- Build output retained `/employee/career-gps`.
- Manual browser verification was not performed in this session.

## Testing Completed In Phase 3D

- `npm run lint` passed in `frontend`.
- `npx tsc --noEmit` passed in `frontend`.
- `npm run build` passed in `frontend`.
- `python -m compileall backend\app` passed.
- `python -m unittest discover backend\tests` passed.
  - 9 tests passed.
  - Existing AnyIO `ResourceWarning` messages appeared from TestClient memory streams; the test suite still completed successfully.
- Started local frontend dev server on `http://127.0.0.1:3001`.
- Verified `GET http://127.0.0.1:3001/employee/career-gps` returned HTTP 200.

## Testing Completed In Phase 3E

- `python -m compileall backend\app` passed.
- `python -m unittest discover backend\tests` passed.
  - 10 tests passed.
  - Added coverage for progress retrieval, action completion, milestone completion gating, persisted progress, milestone details, and unauthorized progress access/update.
  - Existing AnyIO `ResourceWarning` messages appeared from TestClient memory streams; the test suite still completed successfully.
- `npm run lint` passed in `frontend`.
- `npx tsc --noEmit` passed in `frontend`.
- `npm run build` was attempted twice and failed before application compilation with Windows sandbox `spawn EPERM` while Next.js tried to create worker processes.
  - Retried with `NEXT_PRIVATE_MAX_WORKER_THREADS=1`; the same `spawn EPERM` occurred.
  - This matches the environment-level worker-spawn issue previously seen in Phase 3B when build escalation was required.

## Testing Completed In Phase 3F

- `python -m compileall backend\app` passed.
- `python -m unittest discover backend\tests` passed.
  - 11 tests passed.
  - Added coverage for Next Best Action retrieval, deterministic selection explanation, start, complete, skip, alternative retrieval, progress persistence, and unauthorized ownership checks.
  - Existing AnyIO `ResourceWarning` messages appeared from TestClient memory streams; the test suite still completed successfully.
- `npm run lint` passed in `frontend`.
- `npx tsc --noEmit` passed in `frontend`.
- `npm run build` passed in `frontend`.
- Build output retained `/employee/career-gps`.

## Database Migrations Added

- `backend/migrations/006_selected_route_type.sql`
  - Adds `career_roadmaps.selected_route_type`.
  - Allowed values: `recommended`, `accelerated`, `balanced`.
  - Default: `recommended`.
  - Non-destructive.
- `backend/migrations/007_roadmap_progress_evidence.sql`
  - Adds optional `roadmap_progress.evidence_url`.
  - Supports Phase 3E evidence links without redesigning the progress table.
  - Non-destructive.

## Mock Or Illustrative Data

- Career GPS reference occupations, occupation skills, and transitions use `source_label = 'illustrative_seed'`.
- `roadmap.source_note` states that occupation and transition data is illustrative seed data, not verified labor-market data.
- Employee dashboard Asia market signals include illustrative salary/market values and are not verified labor-market data.
- Marketplace mock data remains used for demo surfaces outside Career GPS.
- Career Buddy template fallback uses stored roadmap context and illustrative occupation references.

## Known Limitations

- No live browser screenshot review was performed in Phase 3A.
- No design artifact or visual prototype file was created in Phase 3A.
- No production component was changed in Phase 3A.
- The requested lowercase `docs/` document was missing and was created in this phase.
- Because the workspace already had `DOCS/`, git reports the new file under that existing directory casing on Windows.
- The older uppercase `DOCS/career-gps-implementation.md` remains as historical implementation context.
- RIASEC result persistence is browser-local only.
- Roadmap progress persists on `/employee/career-gps` as of Phase 3E and is also used by the Phase 3F Next Best Action workflow.
- The older dashboard `CareerGpsRoadmapPanel` still uses browser-local progress only.
- Current roadmap routes do not include explicit graph geometry, branch metadata, or locked milestone metadata.
- Phase 3B shell has no complete interactive roadmap.
- Phase 3B Recalculate refreshes existing profile/latest-roadmap data only; it does not call route generation.
- If no saved roadmap exists, Next Best Action and Route selector show empty states.
- Career Buddy, what-if simulator, and skills/readiness are placeholders on `/employee/career-gps`.
- Phase 3C route comparison is based on existing deterministic score components and route explanations; it does not introduce new scoring logic.
- Phase 3C does not persist selected route in a separate history/audit table.
- Phase 3D/3E map node selection is local React state only; it resets when the page reloads.
- Phase 3E derives the active current milestone from persisted progress; with no progress, it treats the first stored milestone as active.
- Phase 3D does not assign locked milestones because the current API does not return explicit lock/prerequisite status.
- Phase 3D branch lines are visual hints derived from the three stored route choices, not a persisted shared graph.
- Phase 3E milestone detail uses stored deterministic roadmap data; it does not add salary figures because no validated salary source exists on the roadmap.
- Phase 3E supports evidence URL, notes, and completion date, but does not upload files.
- Phase 3F Next Best Action selection is deterministic template logic in the backend. Gemini wording improvement was not added because the phase required the action to work without AI.
- Phase 3F Request alternative returns the next-ranked available action but does not persist a user preference or permanent dismissal by itself.
- Phase 3F Skip persists as `skipped` in `roadmap_progress`; skipped actions do not satisfy the Phase 3E milestone-complete requirement.
- Supabase production must apply `backend/migrations/006_selected_route_type.sql` before using selected-route persistence against Supabase.
- Supabase production must apply `backend/migrations/007_roadmap_progress_evidence.sql` before saving evidence URLs.

## Manual Testing Steps For Phase 3C

1. Start backend: `uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000`.
2. Start frontend from `frontend`: `npm run dev`.
3. Log in as an employee with a generated Career GPS roadmap.
4. Open `/employee/career-gps`.
5. Confirm all three route cards appear.
6. Select Accelerated Route and Balanced Route.
7. Confirm the selected state moves without regenerating the roadmap version.
8. Refresh the page and confirm the selected route remains active.
9. Confirm the comparison panel updates for the active route.
10. Confirm journey map, skills/readiness, what-if simulator, and Career Buddy remain placeholders.

## Manual Testing Steps For Phase 3D

1. Start backend: `uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000`.
2. Start frontend from `frontend`: `npm run dev`.
3. Log in as an employee with a generated Career GPS roadmap.
4. Open `/employee/career-gps`.
5. Confirm the Journey map section renders a curved desktop route or vertical mobile route.
6. Select each route card and confirm the journey map updates to that route without regenerating the roadmap.
7. Click milestone, start, and destination nodes and confirm the selected-stop panel updates.
8. Use Tab and Enter/Space on the map nodes and confirm keyboard selection works.
9. Confirm the RIASEC avatar appears on the active milestone when `simploy-riasec-result` exists in local storage.
10. Clear or omit the RIASEC result and confirm the neutral current-position marker appears.
11. Resize to a mobile viewport and confirm the map becomes vertical with no unusable horizontal overflow.

## Manual Testing Steps For Phase 3E

1. Start backend: `uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000`.
2. Start frontend from `frontend`: `npm run dev`.
3. Log in as an employee with a generated Career GPS roadmap.
4. Open `/employee/career-gps`.
5. Select the first milestone on the journey map.
6. Confirm the detail panel shows why recommended, skills, certification note, experience, project, roles, difficulty, lifestyle, confidence, assumptions, and actions.
7. Mark the action as in progress and add a short progress note.
8. Refresh the page and confirm the action status and note persist.
9. Add an evidence URL and completion date, then mark the action complete.
10. Confirm the milestone complete button becomes available and mark the milestone complete.
11. Refresh or log out/in and confirm the completed milestone remains completed and the active marker advances.
12. Confirm no salary data is shown unless a valid source has been added in a future phase.

## Manual Testing Steps For Phase 3F

1. Start backend: `uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000`.
2. Start frontend from `frontend`: `npm run dev`.
3. Log in as an employee with a generated Career GPS roadmap.
4. Open `/employee/career-gps`.
5. Confirm Your Next Best Action appears immediately after the Career North Star summary.
6. Confirm the panel shows title, why it matters, effort, target date, expected impact, related milestone, status, and recommended skill gained.
7. Click Start and confirm the status becomes In progress and remains after refresh.
8. Click Mark complete and confirm the panel advances to another incomplete action.
9. Confirm the journey map or milestone detail progress reflects the completed action after refresh.
10. Click Request alternative and confirm an alternative action is displayed without changing persisted progress.
11. Click Skip and confirm the skipped action remains skipped after refresh or login.
12. Confirm another employee cannot read or update the roadmap action.

## Clear Instructions For The Next Phase

1. Read this file before editing.
2. Implement only the next requested phase.
3. Do not rebuild the complete Career GPS unless the phase explicitly says to.
4. For the new page shell, build on `CareerGpsPageShell` unless the phase explicitly asks to modify the older dashboard roadmap panel.
5. Keep marketplace sections intact.
6. Keep all recommendation logic in the backend.
7. Keep RIASEC avatar mapping unchanged unless explicitly requested.
8. Do not add paid APIs or expose backend secrets in the frontend.
9. If implementing the next polish phase, focus on responsive polish, route-color consistency, browser screenshot review, and accessibility refinement for the existing `CareerJourneyMap`, Phase 3E detail panel, and Phase 3F Next Best Action panel.
