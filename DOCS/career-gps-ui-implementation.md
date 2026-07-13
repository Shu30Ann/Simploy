# Career GPS UI Implementation

This file is the source of truth for the employee Career GPS redesign work. Read it before each Career GPS UI phase and update it after each phase.

## Current Phase Status

- Phase 2 - Simplify Employee Navigation: completed.
- Phase 1 - Employee Information Architecture Audit: completed.
- Phase 3K - Integration Testing and Cleanup: completed.
- Phase 3J - Visual Polish and Hackathon Demo Mode: completed.
- Phase 3I - Career Buddy with Gemini Free Tier: completed.
- Phase 3H - What-If Career Simulator: completed.
- Phase 3G - Skills and Readiness Section: completed.
- Phase 3F - Next Best Action: completed.
- Phase 3E - Milestone Details and Progress Tracking: completed.
- Phase 3D - Visual Career Journey Map: completed.
- Phase 3C - Route Selector and Comparison: completed.
- Phase 3B - Career GPS Page Shell: completed.
- Phase 3A - UI Audit and Visual Direction: completed.
- Runtime behavior changed: no new Career GPS runtime features in Phase 3K. Added one backend test for Gemini timeout/quota fallback behavior and cleaned environment/deployment documentation.
- Visible production UI changed: no Phase 3K UI changes.
- Files changed in Phase 3K:
  - `backend/tests/test_career_buddy_ai.py`
  - `backend/README.md`
  - `docs/SETUP.md`
  - `docs/career-gps-ui-implementation.md`
- Files changed in Phase 3J:
  - `frontend/app/employee/career-gps/page.tsx`
  - `frontend/components/career-gps/CareerGpsPageShell.tsx`
  - `docs/career-gps-ui-implementation.md`
- Files changed in Phase 3I:
  - `frontend/components/career-gps/CareerGpsPageShell.tsx`
  - `backend/app/services/career_buddy_ai.py`
  - `backend/tests/test_career_buddy_ai.py`
  - `backend/.env.example`
  - `backend/README.md`
  - `docs/career-gps-ui-implementation.md`
- Files changed in Phase 3H:
  - `frontend/components/career-gps/CareerGpsPageShell.tsx`
  - `backend/app/repositories/career_gps.py`
  - `backend/tests/test_career_gps_integration.py`
  - `docs/career-gps-ui-implementation.md`
- Files changed in Phase 3G:
  - `frontend/components/career-gps/CareerGpsPageShell.tsx`
  - `docs/career-gps-ui-implementation.md`
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

## Phase 1 - Employee Information Architecture Audit

Phase 1 is a documentation-only audit. It inspected the current employee frontend, route constants, Career GPS components, navigation, and backend router surface. It did not change visible production behavior, backend behavior, Supabase schema, authentication, or Career GPS recommendation logic.

### Current Employee Page Map

- `/employee/dashboard`
  - File: `frontend/app/employee/dashboard/page.tsx`.
  - Current role: the main employee workspace, but it also acts as marketplace, settings, Career North Star setup, RIASEC entry point, and older roadmap surface.
  - Mounted sections: header navigation, Career Command Center, `CareerNorthStarPanel`, `CareerGpsRoadmapPanel`, `RiasecAssessment`, marketplace search/filter controls, internal skill gigs, external opportunities, and Asia market signals.
  - API calls: `GET /dashboard/employee`, `POST /jobs/{job_id}/apply`, then refreshes `GET /dashboard/employee`.
  - Local/mock data: `demoEmployeeProfile`, `demoInternalGigs`, `marketplaceCompanies`, `marketplaceJobs`, RIASEC local storage, and hard-coded Asia market signals.
- `/employee/career-gps`
  - File: `frontend/app/employee/career-gps/page.tsx`.
  - Shell: `frontend/components/career-gps/CareerGpsPageShell.tsx`.
  - Current role: the more complete standalone Career GPS experience, including overview, route selector, visual journey map, milestone detail, progress, skills readiness, what-if simulator, and Career Buddy.
  - Query behavior: `/employee/career-gps?demo=1` enables frontend-only safe demo mode.
  - API calls in production mode: `GET /career-gps/profile`, `GET /career-gps/roadmaps/latest`, `GET /career-gps/roadmaps/{roadmap_id}/progress`, `GET /career-gps/roadmaps/{roadmap_id}/next-best-action`, `PUT /career-gps/roadmaps/{roadmap_id}/selected-route`, `PUT /career-gps/roadmaps/{roadmap_id}/next-best-action/status`, `POST /career-gps/roadmaps/{roadmap_id}/next-best-action/alternative`, `GET /career-gps/roadmaps/{roadmap_id}/milestones/{route_type}/{milestone_sequence}`, `PUT /career-gps/roadmaps/{roadmap_id}/progress/actions`, `PUT /career-gps/roadmaps/{roadmap_id}/progress/milestones`, `POST /career-gps/roadmaps/what-if/preview`, `POST /career-gps/roadmaps/what-if/apply`, `GET /career-gps/career-buddy/conversations`, `GET /career-gps/career-buddy/conversations/{conversation_id}`, and `POST /career-gps/career-buddy/messages`.
- `/employee/applications`
  - File: `frontend/app/employee/applications/page.tsx`.
  - Current role: application tracker.
  - API calls: `GET /applications/me`.
  - Navigation still points to `/employee/dashboard#asia-market-title` and `/employee/dashboard#skills`; `#skills` is stale because the dashboard no longer contains a matching skills anchor.
- Missing employee pages
  - There is no standalone `/employee/settings` route.
  - There is no standalone `/employee/marketplace` or `/employee/jobs` route in the current Next.js app, although older checklist docs mention `/employee/jobs`.
  - There is no standalone `/employee/career-buddy` route; Career Buddy exists inside Career GPS and a separate floating mock `ChatWidget` exists globally in `frontend/app/employee/layout.tsx`.

### Problems In The Current Flow

- The dashboard mixes overview, next actions, editable preferences, roadmap generation, roadmap visualization, marketplace search, application actions, RIASEC assessment, and market intelligence.
- Career goals, lifestyle priorities, constraints, financial targets, and relocation preferences are editable in `CareerNorthStarPanel` on the main dashboard through the `#settings` anchor.
- Career GPS exists twice: the newer `/employee/career-gps` shell and the older dashboard-mounted `CareerGpsRoadmapPanel`.
- Career Buddy exists twice conceptually: a real roadmap-aware Career Buddy inside Career GPS, and a generic floating `ChatWidget` titled "Career Coach" that returns local template replies and is not connected to Career GPS backend context.
- Navigation is inconsistent across employee pages:
  - Dashboard nav uses dashboard anchors and `/employee/career-gps`.
  - Career GPS nav uses `routes.employeeDashboard#asia-market-title`, `routes.employeeCareerGps`, and `routes.employeeApplications`.
  - Applications nav still uses `/employee/dashboard#skills`, which no longer maps to a current section.
  - `ProfileMenu` sends employee Settings to `/employee/dashboard#settings` because no real settings route exists.
- Marketplace responsibilities are embedded in `/employee/dashboard`; there is no focused jobs/opportunities page for search, filters, internal gigs, external roles, or Asia market signals.
- The dashboard `Career Command Center` uses demo profile values while the Career GPS page uses authenticated Career GPS profile/roadmap data, which can create conflicting readiness, next role, and next action signals.
- The older dashboard roadmap panel keeps local-only milestone progress, while the standalone Career GPS page uses persisted roadmap progress.

### Sections To Remove From The Dashboard In Later Redesign Phases

- Editable `CareerNorthStarPanel` form and the `#settings` dashboard anchor.
- Dashboard-mounted `CareerGpsRoadmapPanel`, including roadmap generation/regeneration, route cards, what-if simulator, milestone detail, skill readiness summary, and dashboard Career Buddy.
- Marketplace search and filters once a standalone Marketplace route exists.
- Internal Skill Gigs and External Opportunities lists once a standalone Marketplace route exists.
- Asia market signals once they are moved into Marketplace or a market-insights subview.
- Full `RiasecAssessment` modal launcher if it becomes part of Settings or Career GPS setup rather than dashboard overview.
- Any dashboard-only demo readiness/next-role/next-action copy that duplicates authenticated Career GPS data.

### Sections To Move Into Settings

- Career ambition, target role, target industry, motivation, target timeline, and retirement target from `CareerNorthStarPanel`.
- Lifestyle priority sliders: income growth, work-life balance, leadership, job security, and remote work.
- Preferred locations, preferred work styles, relocation willingness, international mobility, risk tolerance, learning budget, and preferred company type.
- Top non-negotiable priorities.
- Constraints, including type, label, and blocking flag.
- RIASEC assessment entry/results if product direction treats career interest identity as a preference/setup setting.
- Employee profile basics only if backed by existing profile endpoints such as `GET /employees/me` and `PUT /employees/me`.

### Sections That Belong In Career GPS

- Career North Star summary as read-only context, with edit links to Settings instead of inline editing.
- Next Best Action.
- Recommended, Accelerated, and Balanced route selector and comparison.
- Visual journey map as the primary first-read object.
- Milestone detail and action progress editor.
- Skills and Readiness.
- What-if Career Simulator.
- Roadmap-aware Career Buddy.
- Roadmap source note and data limitations.
- Safe demo banner and demo-only journey state behind `?demo=1`.

### Proposed Navigation

- Use one consistent employee top navigation across employee pages:
  - Dashboard
  - Career GPS
  - Marketplace
  - Applications
  - Career Buddy, either as a Career GPS sub-entry or a dedicated route only if it can preserve roadmap context
  - Settings, preferably through profile menu and optionally as a top-level item on smaller IA
- `ProfileMenu` should send employees to `/employee/settings` instead of `/employee/dashboard#settings` once the Settings route exists.
- Dashboard should link primary next actions to the relevant destination:
  - Continue journey -> `/employee/career-gps`
  - Review preferences -> `/employee/settings`
  - View opportunities -> `/employee/marketplace`
  - Track applications -> `/employee/applications`
- Avoid dashboard anchors for primary product areas after the split. Anchors can remain only for intra-page scan sections.

### Proposed Route Structure

- `/employee/dashboard`
  - Overview, summary metrics, and next actions only.
  - No direct editing of career goals, lifestyle preferences, or constraints.
- `/employee/career-gps`
  - Main visual route, milestones, progress, what-if, skills readiness, and roadmap-aware Career Buddy.
  - Preserve `/employee/career-gps?demo=1` for safe demo mode.
- `/employee/marketplace`
  - Jobs and opportunities, including internal gigs, external jobs, filters, apply actions, and Asia market signals if retained.
  - Could alias or replace older documented `/employee/jobs` if backward compatibility is needed.
- `/employee/applications`
  - Application tracker.
- `/employee/settings`
  - Career North Star setup and editing, lifestyle preferences, constraints, financial/retirement targets, RIASEC setup/result, and account/profile settings as backend support allows.
- Optional future route: `/employee/career-buddy`
  - Only add if Career Buddy can keep the same roadmap context and conversation persistence as the embedded Career GPS panel. Otherwise keep Career Buddy embedded in Career GPS.

### Components That Can Be Reused

- `CareerGpsPageShell` as the primary Career GPS page foundation.
- Shell-local Career GPS pieces in `CareerGpsPageShell`: header, demo banner, North Star summary, Next Best Action, route selector, journey map, milestone detail, action progress editor, skills readiness, what-if simulator, and Career Buddy.
- `CareerNorthStarPanel` form logic and payload mapping for a future Settings page, preferably split into smaller settings components before moving.
- `RiasecAssessment` for Settings or setup.
- `ProfileMenu`, with its settings link updated when `/employee/settings` exists.
- `ChatWidget` styling patterns only if a generic helper remains useful; do not treat it as the roadmap-aware Career Buddy.
- `OpportunityCard`, marketplace search controls, and `AsiaMarketMap` can be extracted from `frontend/app/employee/dashboard/page.tsx` for a Marketplace page.
- Existing Tailwind card, badge, loading, empty, and error patterns.

### Components That Should Be Removed Or Merged Later

- Remove `CareerGpsRoadmapPanel` from the dashboard after `/employee/career-gps` owns the full Career GPS experience.
- Merge duplicated North Star summaries so dashboard and Career GPS do not show competing target-role/readiness narratives.
- Merge or clearly separate the generic `ChatWidget` from Career Buddy; the real Career Buddy should be the backend-connected component in Career GPS.
- Extract marketplace-only code from the dashboard into reusable marketplace components, then remove those sections from the dashboard.
- Replace stale dashboard anchor navigation, especially `/employee/dashboard#skills`.

### Backend Endpoints Already Available

- Dashboard and profile:
  - `GET /dashboard/employee`
  - `GET /employees/me`
  - `PUT /employees/me`
- Marketplace and applications:
  - `GET /jobs`
  - `GET /jobs/{job_id}`
  - `POST /jobs/{job_id}/apply`
  - `GET /applications/me`
- Career GPS settings/profile:
  - `GET /career-gps/profile`
  - `PUT /career-gps/onboarding-progress`
  - `PUT /career-gps/goals`
  - `PUT /career-gps/lifestyle-priorities`
  - `PUT /career-gps/constraints`
  - `GET /career-gps/north-star`
- Career GPS roadmap:
  - `POST /career-gps/roadmaps/generate`
  - `GET /career-gps/roadmaps/latest`
  - `GET /career-gps/roadmaps/{roadmap_id}`
  - `PUT /career-gps/roadmaps/{roadmap_id}/selected-route`
  - `GET /career-gps/roadmaps/{roadmap_id}/milestones/{route_type}/{milestone_sequence}`
- Progress and next action:
  - `GET /career-gps/roadmaps/{roadmap_id}/progress`
  - `PUT /career-gps/roadmaps/{roadmap_id}/progress/actions`
  - `PUT /career-gps/roadmaps/{roadmap_id}/progress/milestones`
  - `GET /career-gps/roadmaps/{roadmap_id}/next-best-action`
  - `PUT /career-gps/roadmaps/{roadmap_id}/next-best-action/status`
  - `POST /career-gps/roadmaps/{roadmap_id}/next-best-action/alternative`
- What-if and Career Buddy:
  - `POST /career-gps/roadmaps/what-if/preview`
  - `POST /career-gps/roadmaps/what-if/apply`
  - `GET /career-gps/career-buddy/conversations`
  - `POST /career-gps/career-buddy/conversations`
  - `GET /career-gps/career-buddy/conversations/{conversation_id}`
  - `POST /career-gps/career-buddy/messages`

### Backend Gaps

- No backend change is required to create a frontend Settings route that reuses existing Career GPS profile/settings endpoints.
- No backend change is required to create a frontend Marketplace route that reuses current dashboard/jobs/application endpoints.
- There is no dedicated Marketplace endpoint that returns internal gigs and external opportunities as separate product concepts; current frontend internal gigs are mock data and backend jobs are generic open jobs.
- There is no persisted backend endpoint for RIASEC results; current RIASEC storage is browser-local.
- There is no explicit roadmap lock/prerequisite metadata in production APIs; locked milestones remain demo-only.
- There is no verified labor-market/salary data endpoint for Asia market signals; current dashboard market data is illustrative frontend data.
- There is no separate Career Buddy route API gap because conversation/message endpoints already exist, but any future standalone page must keep roadmap ID and selected route context attached to the authenticated employee.

### Phase 1 Verification

- Expected visible production UI change: none.
- Expected backend behavior change: none.
- Verification run:
  - Frontend lint: passed with `npm run lint`.
  - Frontend type check: passed with `npx tsc --noEmit`.
  - Frontend production build: passed with `npm run build`.
  - Backend compile check: passed with `python -m compileall backend`.
  - Backend tests: not run because the active Python environment does not have `pytest` installed.
- Files changed in Phase 1:
  - `docs/career-gps-ui-implementation.md`
- Manual testing steps:
  1. Open `/employee/dashboard` and confirm the page still renders the existing dashboard.
  2. Open `/employee/career-gps` and confirm the existing Career GPS shell still renders.
  3. Open `/employee/applications` and confirm the applications page still renders.
  4. Confirm there is still no `/employee/settings` or `/employee/marketplace` page until a later implementation phase.
- Limitations:
  - This phase did not perform visual redesign or route extraction.
  - This phase did not add Settings or Marketplace pages.
  - This phase did not remove duplicate dashboard sections.
  - This phase did not change backend endpoints or database schema.

## Phase 2 - Simplify Employee Navigation

Phase 2 created one shared employee navigation component and mounted it across the current employee pages. It changed frontend navigation only. No backend endpoints, authentication behavior, Supabase schema, employer pages, Career GPS recommendation logic, or Career Buddy backend behavior were changed.

### Runtime Behavior Changed

- Added `frontend/components/employee/EmployeeTopNav.tsx` as the shared employee header/navigation component.
- Replaced page-specific employee header navs on:
  - `/employee/dashboard`
  - `/employee/career-gps`
  - `/employee/applications`
- Added consistent employee navigation targets:
  - Dashboard -> `/employee/dashboard`
  - Career GPS -> `/employee/career-gps`
  - Marketplace -> `/employee/dashboard#marketplace`
  - Career Buddy -> `/employee/career-gps#career-buddy`
  - Settings -> `/employee/dashboard#settings`
- Added route constants in `frontend/lib/routes.ts` for current employee Marketplace, Career Buddy, and Settings surfaces.
- Updated `ProfileMenu` so employee Settings uses the shared `routes.employeeSettings` constant while employer Settings continues to point to the existing employer dashboard settings anchor.
- Added a stable `#marketplace` anchor to the existing dashboard marketplace controls.
- Added a stable `#career-buddy` anchor to the Career Buddy panel and its empty state on `/employee/career-gps`.

### Navigation Design

- The shared nav keeps the existing Simploy header style: white translucent header, rounded pill desktop links, existing brand color, and existing profile menu/switch portal controls.
- Desktop layout shows icon + text pill links.
- Mobile layout shows the same five destinations as a compact responsive grid below the brand/profile row.
- Active navigation is derived from the current pathname and hash:
  - `/employee/dashboard` highlights Dashboard.
  - `/employee/dashboard#marketplace` highlights Marketplace.
  - `/employee/dashboard#settings` highlights Settings.
  - `/employee/career-gps` highlights Career GPS.
  - `/employee/career-gps#career-buddy` highlights Career Buddy.
- The old duplicate/stale employee nav links were removed from the page headers:
  - Dashboard no longer has both Career GPS and Roadmap links.
  - Applications no longer links to the stale `/employee/dashboard#skills` anchor.
  - Career GPS no longer uses a separate local header nav.

### Files Changed In Phase 2

- `frontend/components/employee/EmployeeTopNav.tsx`
- `frontend/lib/routes.ts`
- `frontend/app/employee/dashboard/page.tsx`
- `frontend/app/employee/applications/page.tsx`
- `frontend/components/career-gps/CareerGpsPageShell.tsx`
- `frontend/components/ProfileMenu.tsx`
- `docs/career-gps-ui-implementation.md`

### Verification Run

- Frontend lint: passed with `npm run lint`.
- Frontend type check: passed with `npx tsc --noEmit`.
- Frontend production build: passed with `npm run build`.
- Backend compile check: passed with `python -m compileall backend`.
- Backend tests: not run because the active Python environment does not have `pytest` installed.

### Manual Testing Steps For Phase 2

1. Start the frontend from `frontend` with `npm run dev`.
2. Open `/employee/dashboard` and confirm the shared employee nav appears.
3. Confirm Dashboard is highlighted on `/employee/dashboard`.
4. Click Marketplace and confirm the page scrolls to the dashboard marketplace area and Marketplace becomes highlighted.
5. Click Settings and confirm the page scrolls to the existing Career North Star/settings area and Settings becomes highlighted.
6. Click Career GPS and confirm `/employee/career-gps` loads with Career GPS highlighted.
7. Click Career Buddy and confirm `/employee/career-gps#career-buddy` loads or scrolls to the Career Buddy area and Career Buddy becomes highlighted.
8. Open `/employee/applications` and confirm the same employee nav appears without the old stale Learning Path link.
9. Resize to mobile width and confirm all five nav destinations remain visible and tappable.
10. Open an employer route and confirm employer page navigation is unchanged.

### Phase 2 Limitations

- Marketplace and Settings are still existing anchored dashboard surfaces, not standalone pages. Creating `/employee/marketplace` and `/employee/settings` is intentionally left for later phases.
- Career Buddy remains embedded in `/employee/career-gps`; no standalone Career Buddy page was added.
- `/employee/applications` is still reachable by direct URL and in-app actions, but it is no longer part of the simplified five-item employee nav because Phase 2 focused on the requested structure.
- Browser screenshot verification was not performed in this environment.

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
- Phase 3G Skills and Readiness behavior:
  - Replaces the Skills and Readiness placeholder on `/employee/career-gps`.
  - Uses the selected route, stored `skill_fit` score component, `route.skill_gaps`, milestone `focus_skill_name`, employee profile skills, and persisted `roadmap_progress`.
  - Shows overall route readiness using the stored deterministic Skill fit score.
  - Shows next milestone readiness using a reproducible formula: profile focus-skill match plus saved action progress.
  - Shows compact skill chips for achieved, in-progress, and missing priority skills.
  - Shows progress trend from completed/in-progress route actions and saved evidence-link count.
  - Shows optional certification guidance only from stored milestone learning action text; it does not invent certification requirements.
  - Shows expandable evidence and calculation details.
  - Does not add a new backend endpoint or database migration because all required data already exists in profile, roadmap, and progress responses.
- Phase 3H What-If Career Simulator behavior:
  - Replaces the What-if simulator placeholder on `/employee/career-gps`.
  - Supports the eight existing deterministic scenario codes: prioritise salary, prioritise work-life balance, avoid management, move to another country, change industry, retire earlier, complete a master's degree, and focus on entrepreneurship.
  - Calls `POST /career-gps/roadmaps/what-if/preview` for preview-only simulation.
  - Preview shows current route, preview route, changed destination, changed timeline, changed skill priorities, changed lifestyle score, changed trade-offs, and main reason for change.
  - Preview does not overwrite the active roadmap version.
  - Calls `POST /career-gps/roadmaps/what-if/apply` only when the employee clicks Apply This Scenario.
  - Applying saves the scenario as the next roadmap version and preserves prior versions in `roadmap_versions`.
  - Applying refreshes progress and Next Best Action on the page.
  - Backend roadmap save now snapshots progress by route type, milestone sequence, and action sequence before route rows are rebuilt, then restores matching progress/evidence onto the new version's milestone/action rows.
  - Gemini is not used for scoring or route decisions.
- Phase 3I Career Buddy behavior:
  - Replaces the Career Buddy placeholder on `/employee/career-gps` with a compact collapsible assistant panel below the What-if simulator.
  - Uses the existing RIASEC avatar as the assistant icon when available and falls back to the neutral `Bot` icon.
  - Shows suggested questions for route recommendation, next 90 days, skill blocker, avoiding management, Singapore relocation, and balanced-route comparison.
  - Calls existing backend-only Career Buddy conversation/message endpoints; no Gemini key or model configuration is exposed in the frontend.
  - Backend `auto` mode now prefers Gemini when `GEMINI_API_KEY` is configured and otherwise uses deterministic template fallback.
  - OpenAI is not selected for Career Buddy in Phase 3I, including as a fallback, to avoid paid-model behavior in the hackathon demo path.
  - `SIMPLOY_CAREER_BUDDY_MODEL` stores the Gemini model name on the backend; the local example uses `gemini-flash-latest`.
  - Backend requests use `SIMPLOY_CAREER_BUDDY_TIMEOUT_SECONDS`, defaulting to 45 seconds, retry once for transient timeout/503 failures, and validate structured responses before saving assistant messages.
  - Existing per-user hourly usage protection remains active through `SIMPLOY_CAREER_BUDDY_RATE_LIMIT_PER_HOUR`.
  - Useful responses are cached in process by provider, model, question, and sanitized roadmap context to reduce repeated provider calls.
  - Gemini may explain recommendations, skill gaps, projects, trade-offs, and roadmap changes, but cannot override deterministic scores, generate salary figures, guarantee outcomes, invent certifications, or access another employee's data.
  - If Gemini is unavailable, misconfigured, quota-limited, times out, or returns invalid output, the backend returns a template response from stored route, skill-gap, milestone, Next Best Action, and preference context.
- Phase 3J polish and demo behavior:
  - `/employee/career-gps?demo=1` activates safe demo mode through the server page `searchParams` prop and passes `demoMode` into `CareerGpsPageShell`.
  - Demo mode uses negative IDs, `source_label = 'illustrative_demo'`, and a visible Safe demo mode banner to separate demo data from production user data.
  - Demo mode shows one computer-science-to-engineering-leadership journey for "Aisha Demo" with Recommended, Accelerated, and Balanced routes; completed, active, future, and locked milestones; a branch decision between Engineering Manager and Principal Engineer; skill gaps; Next Best Action; work-life-balance what-if preview/apply; and local Career Buddy replies.
  - Demo route switching, progress updates, what-if preview/apply, and Career Buddy messages are local React state only and do not call backend write endpoints.
  - Production mode still loads profile, roadmap, progress, Next Best Action, what-if, and Career Buddy data from the existing backend APIs.
  - Visual polish in this phase strengthens route-card selected/focus states, map route contrast, node labels, active avatar positioning, branch callout, demo-specific locked stops, panel hierarchy, and simulator default flow.
- Phase 3K integration testing and cleanup behavior:
  - No new user-facing features were added.
  - Added backend unit coverage for Gemini timeout/quota-style provider failure falling back to deterministic template output.
  - Confirmed Career Buddy `auto` mode selects Gemini when `GEMINI_API_KEY` exists and does not select OpenAI as a fallback.
  - Cleaned active setup/deployment documentation to list migrations `006` and `007`, Gemini-only backend configuration, timeout configuration, and no paid fallback provider.
  - Confirmed normal and demo Career GPS routes return HTTP 200 locally.

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
- `POST /career-gps/roadmaps/what-if/preview`
- `POST /career-gps/roadmaps/what-if/apply`
- `GET /career-gps/career-buddy/conversations`
- `GET /career-gps/career-buddy/conversations/{conversation_id}`
- `POST /career-gps/career-buddy/messages`

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

## Phase 3H API Contracts

- `POST /career-gps/roadmaps/what-if/preview`
  - Auth: employee only.
  - Requires an active Career GPS roadmap.
  - Payload: `{ scenario_name, adjustments, target_country, target_industry, target_retirement_age, target_timeline_months }`.
  - Supported adjustments: `prioritise_salary`, `prioritise_work_life_balance`, `avoid_management`, `relocate_country`, `change_industry`, `retire_earlier`, `complete_masters_degree`, `focus_entrepreneurship`.
  - Response: `{ scenario, preview_roadmap, comparison }`.
  - Persistence: preview only; active roadmap version is not changed.

- `POST /career-gps/roadmaps/what-if/apply`
  - Auth: employee only.
  - Requires an active Career GPS roadmap.
  - Payload: same as preview.
  - Response: `{ scenario, applied_roadmap, comparison, message }`.
  - Persistence: saves a new roadmap version and keeps older versions in `roadmap_versions`.
  - Progress handling: existing progress/evidence is preserved by route type, milestone sequence, and action sequence when matching new rows exist.

## Phase 3I API Contracts

- `GET /career-gps/career-buddy/conversations`
  - Auth: employee only.
  - Ownership: returns only conversations owned by the authenticated employee profile.
  - Response: `CareerBuddyConversation[]`.

- `GET /career-gps/career-buddy/conversations/{conversation_id}`
  - Auth: employee only.
  - Ownership: `conversation_id` must belong to the authenticated employee profile.
  - Response: conversation metadata plus saved messages.

- `POST /career-gps/career-buddy/messages`
  - Auth: employee only.
  - Ownership: `roadmap_id` and optional `conversation_id` must belong to the authenticated employee profile.
  - Payload: `{ conversation_id, roadmap_id, route_type, message }`.
  - Response: `{ conversation, user_message, assistant_message, response, provider, model, rate_limit_remaining }`.
  - AI behavior: backend selects Gemini only from backend environment variables, validates structured output, rejects salary/market figures, and falls back to deterministic template text when Gemini is unavailable or invalid.
  - Paid provider behavior: OpenAI is not selected by the Career Buddy provider resolver in Phase 3I.
  - Usage protection: per-user hourly limit from `SIMPLOY_CAREER_BUDDY_RATE_LIMIT_PER_HOUR`.
  - Cache: in-process response cache keyed by provider, model, normalized question, and supplied roadmap context.

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
   - Phase 3G implementation: `SkillsReadinessSection` derives route readiness, next milestone readiness, achieved skills, in-progress skills, missing priority skills, progress trend, optional learning guidance, and evidence links from existing frontend data.

8. What-if simulator
   - Purpose: explore deterministic scenarios after the baseline map is understood.
   - Data: scenario payload, preview roadmap, comparison changes.
   - Visual: collapsible simulator below the map or right-side utility panel; do not make it compete with the map.
   - Phase 3H implementation: `WhatIfCareerSimulator` provides scenario selection, preview comparison, Apply This Scenario, and Discard Preview on `/employee/career-gps`.

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
  - `SkillsReadinessSection`
    - `ReadinessRing`
    - `SkillGroup`
    - `SkillChip`
  - `WhatIfCareerSimulator`
    - `ComparisonTile`
  - placeholder panel for Career Buddy

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
  - Handles journey map, milestone details, Next Best Action, Skills and Readiness, and What-if simulator as of Phase 3H.
  - Keeps Career Buddy as a placeholder.

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

Production skills-readiness pieces added in Phase 3G inside `CareerGpsPageShell`:

- `SkillsReadinessSection`
  - Shows overall route readiness, next milestone readiness, skill chips, progress trend, optional certification guidance, evidence links, and calculation details.
- `ReadinessRing`
  - Compact SVG progress ring for whole-number readiness scores.
- `SkillGroup` and `SkillChip`
  - Compact achieved, in-progress, and missing-priority skill groups.

Production what-if pieces added in Phase 3H inside `CareerGpsPageShell`:

- `WhatIfCareerSimulator`
  - Shows scenario controls, current route summary, preview route summary, changed destination, timeline, skills, lifestyle score, trade-offs, main reason, Apply This Scenario, and Discard Preview.
  - Stores the payload used for the visible preview so Apply This Scenario applies the same scenario even if controls are changed after preview.
- `ComparisonTile`
  - Compact current-vs-preview comparison block.

Production Career Buddy pieces added in Phase 3I inside `CareerGpsPageShell`:

- `CareerBuddyPanel`
  - Compact collapsible assistant panel with suggested questions, saved conversation loading, message sending, provider/model/rate-limit metadata, and RIASEC/fallback icon.
  - Uses existing backend conversation/message types and does not expose AI provider keys or model configuration to the browser.

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
  - `CareerGpsProfile.employee.skills`
  - `CareerGpsProgressEntry[]`
  - evidence URLs from `roadmap_progress`

- `CareerWhatIfPanel`
  - active `CareerGpsRoadmap`
  - selected `CareerGpsRoute`
  - preview `CareerGpsWhatIfPreview | null`
  - `CareerGpsWhatIfScenarioPayload`
  - preview/apply loading state
  - discard preview action

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

Phase 3F implemented states:

- Next Best Action loading, empty, error, and actionable states.
- Start, complete, skip, and request-alternative controls.
- Persisted action status changes that refresh roadmap progress.
- Deterministic backend action selection with template wording.

Phase 3G implemented states:

- Empty readiness state when no active route exists.
- Overall route readiness ring using the stored Skill fit component.
- Next milestone readiness ring using profile focus-skill match and saved action progress.
- Skill chips for achieved, in-progress, and missing priority skills.
- Progress trend bar from stored route action progress.
- Evidence-link details from saved progress evidence URLs.
- Expandable calculation details explaining the deterministic formula.
- Optional certification guidance only from stored milestone learning action text.

Phase 3H implemented states:

- Empty simulator state when no active roadmap/route exists.
- Scenario selection for all eight supported deterministic scenario codes.
- Additional fields for relocation country, target industry, retirement age, and timeline when those scenario types are selected.
- Preview loading, error, and success states.
- Preview comparison for current route, preview route, changed destination, timeline, skill priorities, lifestyle score, trade-offs, and main reason.
- Discard Preview resets local preview state without changing the active roadmap.
- Apply This Scenario saves a new roadmap version, refreshes progress, refreshes Next Best Action, and clears preview state.
- Backend progress preservation remaps existing progress/evidence onto matching new milestone/action rows.

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

7. Phase 3G - Skills and Readiness Section
   - Completed.
   - Replaced the Skills and Readiness placeholder with a real route readiness section.
   - Used existing profile, roadmap skill gaps, route score components, milestone focus skills, progress rows, and evidence URLs.
   - Did not add AI scoring, new backend endpoints, new database fields, or unrelated marketplace changes.

8. Phase 3H - What-If Career Simulator
   - Completed.
   - Replaced the What-if simulator placeholder with deterministic preview/apply workflow.
   - Used existing preview/apply backend endpoints and existing route engine.
   - Preserved completed achievements/evidence when applying a scenario by remapping progress onto matching new route rows.
   - Did not use Gemini to decide scores and did not add salary data or paid APIs.

9. Phase 3I - Career Buddy with Gemini Free Tier
   - Completed.
   - Replaced the Career Buddy placeholder with a compact collapsible assistant on `/employee/career-gps`.
   - Used existing Career Buddy conversation/message endpoints and backend-only Gemini/template AI service.
   - Added Gemini-first auto provider selection, explicit request timeout, in-process response cache, no paid fallback provider, and fallback behavior when Gemini is unavailable.
   - Did not expose secrets in the frontend, add salary data, override deterministic scoring, or add paid fallback behavior.

10. Phase 3J - Visual Polish and Hackathon Demo Mode
   - Completed.
   - Added explicit `/employee/career-gps?demo=1` safe demo mode with one polished computer-science-to-engineering-leadership journey.
   - Improved route visibility, selected states, focus states, journey-map contrast, node readability, avatar positioning, branch callout, and demo-safe local interactions.
   - Browser screenshot verification remains the main follow-up because no browser target was available in this session.

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

## Testing Completed In Phase 3G

- `npm run lint` passed in `frontend`.
- `npx tsc --noEmit` passed in `frontend`.
- `npm run build` passed in `frontend`.
- `python -m compileall backend\app` passed.
- `python -m unittest discover backend\tests` passed.
  - 11 tests passed.
  - Existing AnyIO `ResourceWarning` messages appeared from TestClient memory streams; the test suite still completed successfully.
- Build output retained `/employee/career-gps`.

## Testing Completed In Phase 3H

- `python -m compileall backend\app` passed.
- `python -m unittest discover backend\tests` passed.
  - 11 tests passed.
  - Extended what-if coverage to confirm preview does not change the active version and apply preserves saved progress/evidence.
  - Existing AnyIO `ResourceWarning` messages appeared from TestClient memory streams; the test suite still completed successfully.
- `npm run lint` passed in `frontend`.
- `npx tsc --noEmit` passed in `frontend`.
- `npm run build` passed in `frontend`.
- Build output retained `/employee/career-gps`.

## Testing Completed In Phase 3I

- `python -m compileall backend\app` passed.
- `python -m unittest discover backend\tests` passed.
  - 13 tests passed.
  - Added coverage for Gemini-first `auto` provider selection even when an OpenAI key exists, Gemini timeout wiring, cached provider responses, and missing-Gemini-key template fallback.
  - Existing AnyIO `ResourceWarning` messages appeared from TestClient memory streams; the test suite still completed successfully.
- `npm run lint` passed in `frontend`.
- `npx tsc --noEmit` passed in `frontend`.
- `npm run build` passed in `frontend`.
- Build output retained `/employee/career-gps`.
- Local route check passed: `curl.exe -I http://127.0.0.1:3002/employee/career-gps` returned `200 OK`.
- Follow-up Gemini smoke test passed with `SIMPLOY_CAREER_BUDDY_MODEL=gemini-flash-latest` after increasing the backend timeout and adding one transient retry.

## Testing Completed In Phase 3J

- `npm run lint` passed in `frontend`.
- `npx tsc --noEmit` passed in `frontend`.
- `npm run build` passed in `frontend`.
  - Build output marks `/employee/career-gps` as dynamic because the route reads `searchParams` to support `?demo=1`.
- `python -m compileall backend\app` passed.
- `python -m unittest discover backend\tests` passed.
  - 14 tests passed.
  - Existing AnyIO `ResourceWarning` messages appeared from TestClient memory streams; the test suite still completed successfully.
- Started local frontend dev server on `http://127.0.0.1:3003`.
- Route check passed: `curl.exe -I http://127.0.0.1:3003/employee/career-gps?demo=1` returned `200 OK`.
- Server response inspection confirmed the page receives `demoMode: true` for `/employee/career-gps?demo=1`.
- Browser screenshot verification was attempted through the available browser plugin, but no browser targets were exposed in this session (`agent.browsers.list()` returned an empty list). No Playwright package is installed locally, so visual screenshot QA could not be completed in this environment.

## Testing Completed In Phase 3K

- `npm run lint` passed in `frontend`.
- `npx tsc --noEmit` passed in `frontend`.
- `npm run build` passed in `frontend`.
  - Build output keeps `/employee/career-gps` dynamic/server-rendered because the route reads `searchParams` for `?demo=1`.
- `python -m compileall backend\app` passed.
- `python -m unittest backend.tests.test_career_buddy_ai` passed.
  - 5 tests passed, including the new Gemini timeout/quota fallback test.
- `python -m unittest discover backend\tests` passed.
  - 15 tests passed.
  - Existing AnyIO `ResourceWarning` messages appeared from TestClient memory streams; the test suite still completed successfully.
- FastAPI route registration check confirmed the current `/career-gps` endpoint list:
  - `GET /career-gps/profile`
  - `PUT /career-gps/onboarding-progress`
  - `PUT /career-gps/goals`
  - `PUT /career-gps/lifestyle-priorities`
  - `PUT /career-gps/constraints`
  - `GET /career-gps/north-star`
  - `POST /career-gps/roadmaps/generate`
  - `POST /career-gps/roadmaps/what-if/preview`
  - `POST /career-gps/roadmaps/what-if/apply`
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
  - `GET /career-gps/career-buddy/conversations`
  - `POST /career-gps/career-buddy/conversations`
  - `GET /career-gps/career-buddy/conversations/{conversation_id}`
  - `POST /career-gps/career-buddy/messages`
- Local route checks passed:
  - `curl.exe -I http://127.0.0.1:3004/employee/career-gps` returned `200 OK`.
  - `curl.exe -I http://127.0.0.1:3004/employee/career-gps?demo=1` returned `200 OK`.
- Cleanup checks:
  - No `console.*` or `debugger` usage found in `frontend` or `backend` source, excluding the standalone Gemini smoke-test script.
  - No committed frontend references to `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, or `OPENAI_API_KEY` found outside generated build output.
  - Active setup docs now use Gemini-only backend AI configuration and warn against frontend secret exposure.
  - Active backend provider resolver does not select OpenAI; Gemini failures fall back to the template provider.
- Browser-based mobile, tablet, desktop, and keyboard checks were attempted through the browser plugin, but no browser targets were exposed (`agent.browsers.list()` returned `[]`). These visual/interaction checks remain manual follow-up items.

## Phase 3K Final Report

1. Features completed
   - Career GPS vertical slice includes Career North Star loading, route selector, selected route persistence, visual journey map, RIASEC/fallback marker, milestone details, progress updates, Next Best Action, Skills and Readiness, What-if preview/apply, Career Buddy Gemini/template behavior, and safe demo mode.
   - Phase 3K added no new product features; it added integration test coverage for Gemini timeout/quota fallback and cleaned deployment docs.

2. Files changed
   - `frontend/app/employee/career-gps/page.tsx`
   - `frontend/components/career-gps/CareerGpsPageShell.tsx`
   - `backend/app/services/career_buddy_ai.py`
   - `backend/tests/test_career_buddy_ai.py`
   - `backend/tests/test_career_gps_integration.py`
   - `backend/app/repositories/career_gps.py`
   - `backend/README.md`
   - `backend/.env.example`
   - `docs/SETUP.md`
   - `docs/career-gps-ui-implementation.md`
   - Earlier modified backend files listed in prior phase sections remain part of the current uncommitted worktree.

3. Database migrations
   - `backend/migrations/001_career_gps_foundation.sql`
   - `backend/migrations/002_career_gps_rls.sql`
   - `backend/migrations/003_career_gps_profile_api_fields.sql`
   - `backend/migrations/004_career_gps_profile_api_rls.sql`
   - `backend/migrations/005_career_buddy.sql`
   - `backend/migrations/006_selected_route_type.sql`
   - `backend/migrations/007_roadmap_progress_evidence.sql`
   - No Phase 3K migration was added.

4. Backend endpoints
   - Current `/career-gps` endpoints are listed under "Testing Completed In Phase 3K".
   - No unused Career GPS API route was removed in Phase 3K because the registered endpoints are either used by the current frontend, retained for dashboard compatibility, or documented as part of the Career GPS API contract.

5. Frontend components
   - Primary shell: `CareerGpsPageShell`.
   - Existing dashboard components remain: `CareerNorthStarPanel`, `CareerGpsRoadmapPanel`.
   - Shell-local pieces include `CareerGpsHeader`, `NorthStarSummary`, `NextBestAction`, `RouteSelectorShell`, `CareerJourneyMap`, `JourneyDetailPanel`, `ActionProgressEditor`, `SkillsReadinessSection`, `WhatIfCareerSimulator`, `CareerBuddyPanel`, and `DemoModeBanner`.

6. Environment variables
   - Frontend/Vercel: `NEXT_PUBLIC_API_URL`; optional `NEXT_PUBLIC_CAREER_GPS_DEMO_MODE=true` only for demo environments.
   - Backend/Render: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SIMPLOY_CORS_ORIGINS`, `SIMPLOY_CORS_ORIGIN_REGEX`, `SIMPLOY_JWT_SECRET`, `SIMPLOY_CAREER_BUDDY_AI_PROVIDER`, `SIMPLOY_CAREER_BUDDY_MODEL`, `SIMPLOY_CAREER_BUDDY_RATE_LIMIT_PER_HOUR`, `SIMPLOY_CAREER_BUDDY_TIMEOUT_SECONDS`, and optional `GEMINI_API_KEY`.
   - Do not set Supabase service-role keys, Gemini keys, or any AI provider keys in Vercel/frontend variables.
   - Do not configure OpenAI or any paid provider as a Career Buddy fallback for the hackathon demo.

7. Test results
   - Frontend lint, TypeScript, and production build passed.
   - Backend compile and test suite passed.
   - Career Buddy Gemini mode is covered by mocked Gemini unit tests.
   - Career Buddy fallback mode is covered by missing-key, timeout/quota-failure, and integration tests.
   - Authentication ownership is covered by integration tests for roadmaps, conversations, selected route updates, progress, and Next Best Action.
   - Supabase RLS is covered by static migration assertions for employee-owned Career GPS and Career Buddy tables.

8. Known limitations
   - Browser-based mobile, tablet, desktop, and keyboard checks could not be executed in this environment because no browser target was available through the browser plugin and Playwright is not installed.
   - Live Gemini quota behavior was not tested against the real Gemini service; timeout/quota failure is covered by mocked provider exception tests.
   - Demo mode is frontend-only and resets on refresh.
   - Production roadmap APIs still do not return explicit lock/prerequisite metadata; locked milestones are demo-only.

9. Illustrative data still in use
   - Career GPS occupation, skill, and transition seeds use illustrative data.
   - Phase 3J safe demo journey uses frontend-only `illustrative_demo` data.
   - Employee dashboard market and marketplace demo surfaces still contain illustrative/mock values outside Career GPS.
   - No real-time salary or labor-market data is presented as verified Career GPS data.

10. Deployment steps
   - Backend/Render: set backend environment variables, run `backend/supabase_schema.sql`, then migrations `001` through `007` in order, deploy the FastAPI backend, and verify `/career-gps/profile` requires employee auth.
   - Frontend/Vercel: set `NEXT_PUBLIC_API_URL` to the Render backend URL, keep backend secrets out of Vercel, build/deploy frontend, and verify `/employee/career-gps` and `/employee/career-gps?demo=1`.
   - Career Buddy: leave `GEMINI_API_KEY` empty for deterministic fallback or set it only on Render for Gemini mode.

11. Hackathon demo instructions
   - Open `/employee/career-gps?demo=1`.
   - Show the Safe demo banner, North Star, and avatar on the active milestone.
   - Switch Recommended, Accelerated, and Balanced routes.
   - Click a milestone and update one progress action.
   - Show Next Best Action and Skills and Readiness updating.
   - Run "Prioritise work-life balance" in What-if Career Simulator and apply the local scenario.
   - Open Career Buddy and ask a suggested question; confirm local demo response and no production write.

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
- Phase 3J adds a frontend-only safe demo dataset behind `/employee/career-gps?demo=1`.
  - Demo employee: "Aisha Demo", a computer science student moving toward engineering leadership.
  - Demo route family: Computer Science Student -> Software Engineering Intern -> Junior Software Engineer -> Software Engineer -> Senior Software Engineer -> Technical Lead -> Engineering Manager or Principal Engineer -> Head of Engineering or CTO.
  - Demo dataset includes Recommended, Accelerated, and Balanced routes, completed/active/locked milestones, branch decision copy, skill gaps, Next Best Action, work-life-balance what-if preview/apply, and local Career Buddy template answers.
  - Demo records use negative IDs and `source_label = 'illustrative_demo'`; they are not fetched from or saved to Supabase.
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
- Career Buddy is implemented on `/employee/career-gps`, but it uses an in-process cache only; cache entries are not shared across Render instances or process restarts.
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
- Phase 3G Skills and Readiness does not create new proficiency scores. It displays stored route Skill fit and a reproducible milestone readiness indicator from profile skill match plus action progress.
- Phase 3G cannot show a verified certification requirement unless one is added to stored roadmap data in a future phase.
- Phase 3G evidence links depend on the user saving evidence URLs in milestone action progress; it does not upload files.
- Phase 3H what-if preview/apply uses deterministic route generation only. Gemini explanations were not added.
- Phase 3H progress preservation remaps progress by route type, milestone sequence, and action sequence. If a future scenario changes those structural keys, unmatched progress rows cannot be remapped automatically.
- Phase 3H preview comparison uses stored deterministic comparison categories plus frontend-derived lifestyle score comparison.
- Phase 3H applies the last successful preview payload, not unpreviewed control edits made after the preview result is shown.
- Phase 3I Career Buddy still stores conversations in the existing `career_buddy_conversations` and `career_buddy_messages` tables; no new long-term AI cache table was added.
- Phase 3I Career Buddy uses template fallback when Gemini is unavailable, over quota, misconfigured, times out, or returns invalid output.
- Phase 3I Career Buddy context intentionally excludes full resumes and only sends compact profile, route, skill-gap, milestone, Next Best Action, and preference data.
- Phase 3J demo mode is a presentation mode only. It does not persist local progress after a page refresh and does not create backend audit/history records.
- Phase 3J demo mode uses locally generated Career Buddy responses instead of Gemini so the demo works when AI is unavailable.
- Phase 3J locked milestones are shown only in demo mode because production roadmap APIs still do not return explicit prerequisite/lock metadata.
- Phase 3J browser screenshot inspection could not be completed because no browser target was available through the installed browser plugin and local Playwright is not installed.
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

## Manual Testing Steps For Phase 3G

1. Start backend: `uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000`.
2. Start frontend from `frontend`: `npm run dev`.
3. Log in as an employee with a generated Career GPS roadmap.
4. Open `/employee/career-gps`.
5. Confirm Skills and Readiness appears below the journey map.
6. Confirm overall route readiness matches the selected route Skill fit score rounded to a whole percent.
7. Confirm next milestone readiness changes after starting or completing the milestone action.
8. Confirm achieved skills show stored employee profile skills or completed route skills.
9. Confirm in-progress skills appear after marking a related action in progress.
10. Confirm missing priority skills are limited to a compact set of high-priority route gaps.
11. Add an evidence URL through a milestone action, then confirm it appears in the expandable evidence details.
12. Switch route choices and confirm readiness values and skill chips update without regenerating the roadmap.

## Manual Testing Steps For Phase 3H

1. Start backend: `uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000`.
2. Start frontend from `frontend`: `npm run dev`.
3. Log in as an employee with a generated Career GPS roadmap.
4. Open `/employee/career-gps`.
5. Confirm What-if Career Simulator appears below Skills and Readiness.
6. Select one or more scenarios and click Preview Scenario.
7. Confirm the active roadmap version does not change while preview is visible.
8. Confirm preview displays current route, preview route, destination, timeline, skill priorities, lifestyle score, trade-offs, and main reason for change.
9. Click Discard Preview and confirm the preview comparison disappears without changing route selection or roadmap version.
10. Add or confirm existing completed action evidence, then preview and click Apply This Scenario.
11. Confirm the applied roadmap version increments and previous versions are preserved by the backend.
12. Confirm saved progress/evidence still appears after apply when matching route/milestone/action keys exist.

## Manual Testing Steps For Phase 3I

1. Start backend: `uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000`.
2. Start frontend from `frontend`: `npm run dev`.
3. Log in as an employee with a generated Career GPS roadmap.
4. Open `/employee/career-gps`.
5. Confirm Career Buddy appears as a compact collapsible panel below the What-if simulator and does not cover the journey map.
6. Confirm the RIASEC avatar appears as the assistant icon when `simploy-riasec-result` exists; otherwise confirm the neutral bot icon appears.
7. Click each suggested question and confirm a message is sent to `/career-gps/career-buddy/messages`.
8. Confirm the assistant answer is saved in the conversation and reloads after refresh.
9. Confirm provider metadata shows Gemini when `GEMINI_API_KEY` and `SIMPLOY_CAREER_BUDDY_MODEL` are configured on the backend.
10. Clear or omit `GEMINI_API_KEY`, then confirm Career Buddy still returns a template fallback response.
11. Send enough messages to exceed `SIMPLOY_CAREER_BUDDY_RATE_LIMIT_PER_HOUR` and confirm the backend returns a rate-limit error.
12. Confirm no salary figures, promotion guarantees, financial guarantees, or invented certifications appear in responses.

## Manual Testing Steps For Phase 3J

1. Start frontend from `frontend`: `npm run dev`.
2. Open `/employee/career-gps?demo=1`.
3. Confirm the Safe demo mode banner is visible and labels the data as illustrative.
4. Confirm the North Star shows the demo employee journey and the current-position marker appears on the active milestone.
5. Switch between Recommended, Accelerated, and Balanced routes; confirm the selected route state and journey map update without backend save calls.
6. Click a visible milestone and confirm the detail panel updates with demo milestone details and actions.
7. Update one action's progress and confirm Skills and Readiness reflects the local progress change.
8. Confirm Your Next Best Action is visible and can be started, completed, skipped, or replaced locally.
9. In What-if Career Simulator, keep or select "Prioritise work-life balance", click Preview Scenario, and confirm the preview route changes to the Balanced Route.
10. Click Apply This Scenario and confirm the selected route updates locally with a message that production data was not changed.
11. Open Career Buddy, ask one suggested question, and confirm a local demo answer appears with provider `demo_template`.
12. Refresh the page and confirm demo data resets to the safe starting state, proving no production user record was overwritten.

## Clear Instructions For The Next Phase

1. Read this file before editing.
2. Implement only the next requested phase.
3. Do not rebuild the complete Career GPS unless the phase explicitly says to.
4. For the new page shell, build on `CareerGpsPageShell` unless the phase explicitly asks to modify the older dashboard roadmap panel.
5. Keep marketplace sections intact.
6. Keep all recommendation logic in the backend.
7. Keep RIASEC avatar mapping unchanged unless explicitly requested.
8. Do not add paid APIs or expose backend secrets in the frontend.
9. If continuing after Phase 3J, first perform real browser screenshot review for `/employee/career-gps?demo=1` and responsive widths because browser targets were unavailable during Phase 3J validation.
10. Keep demo mode behind `?demo=1` or `NEXT_PUBLIC_CAREER_GPS_DEMO_MODE=true`; do not merge demo data into production user data or Supabase tables.
