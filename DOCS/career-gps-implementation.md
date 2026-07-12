# Career GPS Implementation

## Current Phase Status

- Phase 0 - Repository Audit: completed.
- Phase 1 - Supabase Database Foundation: completed as a migration-only change.
- Phase 2 - Backend Profile and Career North Star APIs: completed.
- Phase 3 - Career North Star onboarding and settings frontend: completed.
- Phase 4 - Deterministic Career GPS route generation and scoring: completed.
- Phase 5 - Employee Career GPS roadmap frontend: completed.
- Phase 6 - What-If Career Simulator: completed.
- Phase 7 - Career Buddy and AI Abstraction: completed.
- Phase 8 - Integration Testing, Security Review, and Cleanup: completed.
- Runtime behavior changed: yes, backend Career GPS APIs, frontend Career North Star onboarding, deterministic route generation APIs, a frontend roadmap viewer, the What-If Career Simulator, and Career Buddy were added. Phase 8 added tests/docs cleanup only.
- Frontend pages built: yes, Career North Star, Career GPS roadmap UI, the what-if simulator, and Career Buddy are mounted inside the existing employee dashboard.
- AI implemented: optional backend-only provider abstraction with deterministic template fallback.
- Deterministic scoring engine implemented: yes.

## Phase 8 - Integration Testing, Security Review, And Cleanup

Completed integration testing, security review, and cleanup without adding new product features.

Features completed:

- Career North Star onboarding/settings flow is implemented and covered by local integration tests.
- Deterministic roadmap generation is implemented and covered by unit/integration tests.
- Roadmap versioning is implemented and covered by integration tests.
- What-If preview/apply is implemented and covered by integration tests.
- Career Buddy fallback mode is implemented and covered by integration tests.
- Authenticated ownership checks for roadmaps and Career Buddy conversations are covered by integration tests.
- Supabase RLS migrations for Career GPS and Career Buddy were statically checked for expected ownership policies.
- Frontend loading/empty/error states compile and remain wired through the existing Career North Star, roadmap, what-if, and Career Buddy panels.
- Environment-variable, setup, and deployment documentation was updated.

Files changed in Phase 8:

- `backend/tests/test_career_gps_integration.py`
  - Adds full onboarding-to-roadmap integration tests, ownership checks, what-if tests, Career Buddy fallback checks, and RLS migration checks.
- `frontend/lib/mock-data/dashboardData.ts`
  - Removes unused old static roadmap mock exports after the backend-backed roadmap replacement.
- `frontend/lib/mock-data/types.ts`
  - Removes unused old static roadmap mock types.
- `README.md`
  - Adds Career GPS endpoints, migration order, and Career Buddy fallback notes.
- `backend/README.md`
  - Adds Career GPS endpoints, migration order, backend env vars, and AI-key safety notes.
- `DOCS/SETUP.md`
  - Adds backend startup, frontend API URL, Supabase migration order, Render/Vercel env guidance, and Career Buddy fallback notes.
- `DOCS/career-gps-implementation.md`
  - Adds this Phase 8 final report.

Database migrations:

- No new Phase 8 migration was added.
- Production Supabase should run existing migrations in order:
  - `backend/migrations/001_career_gps_foundation.sql`
  - `backend/migrations/002_career_gps_rls.sql`
  - `backend/migrations/003_career_gps_profile_api_fields.sql`
  - `backend/migrations/004_career_gps_profile_api_rls.sql`
  - `backend/migrations/005_career_buddy.sql`

Backend endpoints verified:

- `GET /career-gps/profile`
- `PUT /career-gps/onboarding-progress`
- `PUT /career-gps/goals`
- `PUT /career-gps/lifestyle-priorities`
- `PUT /career-gps/constraints`
- `POST /career-gps/roadmaps/generate`
- `GET /career-gps/roadmaps/latest`
- `GET /career-gps/roadmaps/{roadmap_id}`
- `POST /career-gps/roadmaps/what-if/preview`
- `POST /career-gps/roadmaps/what-if/apply`
- `GET /career-gps/career-buddy/conversations`
- `POST /career-gps/career-buddy/conversations`
- `GET /career-gps/career-buddy/conversations/{conversation_id}`
- `POST /career-gps/career-buddy/messages`

Environment variables:

- Frontend:
  - `NEXT_PUBLIC_API_URL`
- Backend:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SIMPLOY_DATABASE_PATH`
  - `SIMPLOY_JWT_SECRET`
  - `SIMPLOY_TOKEN_TTL_MINUTES`
  - `SIMPLOY_AI_ENGINE_URL`
  - `SIMPLOY_CAREER_BUDDY_AI_PROVIDER`
  - `SIMPLOY_CAREER_BUDDY_MODEL`
  - `SIMPLOY_CAREER_BUDDY_RATE_LIMIT_PER_HOUR`
  - `OPENAI_API_KEY`
  - `SIMPLOY_CORS_ORIGINS`
  - `SIMPLOY_CORS_ORIGIN_REGEX`

Test results:

- `python -m compileall backend\app` passed.
- `python -m unittest discover backend\tests` passed.
  - 7 tests passed.
  - Covers route engine determinism, onboarding-to-roadmap integration, roadmap versioning, what-if preview/apply, ownership checks, Career Buddy template fallback, and static RLS migration coverage.
  - Python emitted `TestClient` ResourceWarnings from AnyIO memory streams, but the suite completed successfully.
- `npm run lint` passed.
- `npx tsc --noEmit` passed.
- `npm run build` passed.
- Responsive layout check:
  - Production build succeeded for the employee dashboard route.
  - Static review confirmed responsive Tailwind breakpoints remain in the Career GPS roadmap, What-If Simulator, and Career Buddy panels.
  - The in-app browser was unavailable in this session (`agent.browsers.list()` returned `[]`), so no screenshot-based responsive verification was captured.

Security review:

- Service-role Supabase access remains backend-only.
- `OPENAI_API_KEY` is backend-only and not referenced by frontend code.
- Career Buddy AI prompts and provider calls remain backend-only.
- Roadmap, what-if, and Career Buddy access resolve the authenticated employee profile before reading or writing owned rows.
- Integration tests verify another employee cannot read another employee's roadmap or Career Buddy conversation.
- Supabase RLS migration text was checked for Career GPS employee-owned tables and Career Buddy conversation/message policies.

Known limitations:

- No live Supabase project was available for executing RLS policies end-to-end; RLS was statically checked from migration SQL.
- No browser screenshot tool was available for visual responsive QA in this session.
- Milestone/action progress controls remain frontend-local and reset on refresh; no backend progress persistence endpoint exists yet.
- Career Buddy fallback is deterministic and roadmap-contextual, not a full AI coach.
- Optional OpenAI provider was not live-tested because no API key was configured.

Mock or seed data still in use:

- Occupations, occupation skills, and career transitions from Career GPS migrations use `source_label = 'illustrative_seed'`.
- Marketplace/demo dashboard data still powers non-Career-GPS employee marketplace surfaces.
- Asia market signals on the employee dashboard remain illustrative frontend data and are not verified market data.
- Career Buddy template fallback uses stored roadmap data and illustrative occupation references.

Manual demonstration steps:

1. Start backend: `uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000`.
2. Start frontend: `npm run dev --workspace frontend`.
3. Sign up or log in as an employee.
4. Open `/employee/dashboard`.
5. Complete or edit Career North Star setup.
6. Generate a Career GPS roadmap.
7. Switch between Recommended, Accelerated, and Balanced route cards.
8. Use local progress controls on roadmap milestones and note they are UI-local.
9. Preview a what-if scenario, such as relocating to Singapore or prioritising work-life balance.
10. Apply the scenario and confirm the roadmap version increments.
11. Ask Career Buddy a quick prompt such as "What should I do in the next 90 days?"
12. Confirm Career Buddy responds in template fallback mode when `OPENAI_API_KEY` is unset.

## Phase 7 - Career Buddy And AI Abstraction

Implemented Career Buddy as a backend-contextual coaching chat inside the existing Career GPS roadmap panel.

Backend behavior added:

- Adds backend-only AI provider abstraction in `backend/app/services/career_buddy_ai.py`.
- Adds a deterministic template provider used when no AI provider/key is configured.
- Adds an optional OpenAI Responses API provider when backend env configuration enables it.
- Requests structured JSON output from the AI provider when configured.
- Validates AI output with `CareerBuddyStructuredResponse`.
- Rejects/falls back from AI output that includes disallowed salary or market figures.
- Keeps AI prompts, provider calls, and keys entirely in the backend.
- Uses the authenticated employee's stored roadmap, selected route, route scores, skill gaps, milestones, Next Best Action, goals, lifestyle priorities, and constraints as context.
- Adds basic per-employee message rate protection using `SIMPLOY_CAREER_BUDDY_RATE_LIMIT_PER_HOUR`.
- Does not allow AI to change deterministic route scoring or generated route data.

New backend endpoints:

- `GET /career-gps/career-buddy/conversations`
  - Lists the authenticated employee's Career Buddy conversations.
- `POST /career-gps/career-buddy/conversations`
  - Creates a conversation tied to a stored roadmap.
- `GET /career-gps/career-buddy/conversations/{conversation_id}`
  - Retrieves one owned conversation with messages.
- `POST /career-gps/career-buddy/messages`
  - Stores the employee message, builds backend roadmap context, generates a template or AI-backed assistant response, validates it, stores the assistant response, and returns both messages.

Database additions:

- `backend/migrations/005_career_buddy.sql`
  - Adds `career_buddy_conversations`.
  - Adds `career_buddy_messages`.
  - Adds indexes for employee conversations and conversation messages.
  - Adds ownership helper `public.is_career_buddy_conversation_owner`.
  - Adds RLS policies for authenticated employee ownership.
- Local SQLite fallback in `backend/app/core/database.py` now creates the same Career Buddy tables.

Frontend behavior added:

- Adds a Career Buddy panel below the selected roadmap's skills/readiness summary.
- Shows the selected route used as context.
- Loads existing Career Buddy conversations.
- Sends messages through the backend only.
- Shows persisted employee and assistant messages.
- Adds quick prompts for:
  - Why was this route recommended?
  - What should I do in the next 90 days?
  - What skill is holding me back?
  - Can I reach the target without becoming a manager?
  - What happens if I move to Singapore?
  - Show me a more balanced route.
- Shows provider and hourly remaining-message metadata returned by the backend.

Design and safety decisions:

- Career Buddy is advisory only and cannot overwrite roadmaps, scores, preferences, or constraints.
- Template fallback answers are derived from selected route, scores, skill gaps, milestones, Next Best Action, and employee preferences.
- AI provider failures, invalid structured output, or disallowed salary/market figures fall back to template responses.
- The frontend never receives AI prompts or AI keys.
- No external market, salary, hiring-probability, or relocation APIs were added.

Not implemented in Phase 7:

- No AI-generated scoring.
- No AI-generated route replacement.
- No streamed chat.
- No assistant tool-calling.
- No feedback ratings, conversation rename/archive UI, or admin moderation surface.

## Phase 6 - What-If Career Simulator

Implemented a deterministic what-if simulator for employees inside the existing Career GPS roadmap panel.

Frontend behavior added:

- Lets employees select one or more temporary scenario adjustments:
  - Prioritise salary
  - Prioritise work-life balance
  - Avoid management
  - Relocate to another country
  - Change industry
  - Retire earlier
  - Complete a master's degree
  - Focus on entrepreneurship
- Adds optional scenario inputs for:
  - Scenario name
  - Relocation country
  - Target industry
  - Earlier retirement age
  - Compressed target timeline
- Generates a preview roadmap through `POST /career-gps/roadmaps/what-if/preview`.
- Keeps preview results separate from the active roadmap until explicitly applied.
- Compares the active recommended route against the preview recommendation.
- Shows comparison categories for:
  - Changed recommended route
  - Changed target roles
  - Changed timeline
  - Changed skill priorities
  - Changed trade-offs
  - Changed scores
- Shows scenario override explanations so employees can see why the preview changed.
- Adds an Apply Scenario button that calls `POST /career-gps/roadmaps/what-if/apply`.
- Refreshes the roadmap panel to the newly applied version after a successful apply.

Backend behavior added:

- Adds typed scenario payloads and comparison responses in `backend/app/schemas/career_gps.py`.
- Adds `POST /career-gps/roadmaps/what-if/preview`.
  - Requires an existing active roadmap for comparison.
  - Loads the authenticated employee's current Career GPS profile, goals, lifestyle priorities, constraints, occupation reference data, occupation skills, and transitions.
  - Applies scenario changes in memory only.
  - Generates a preview roadmap using the existing deterministic route engine.
  - Returns the preview with the next version number but does not write roadmap rows or version rows.
- Adds `POST /career-gps/roadmaps/what-if/apply`.
  - Recomputes the scenario server-side from the submitted scenario payload.
  - Saves the generated scenario roadmap using the existing active-roadmap persistence path.
  - Increments `career_roadmaps.current_version`.
  - Inserts a new `roadmap_versions` snapshot with a what-if change summary.
  - Preserves previous roadmap snapshots in `roadmap_versions`.
- Reuses the Phase 4 deterministic route engine; no AI, Career Buddy, or external market API was added.
- Reuses existing Career GPS tables; no new migration was added.

Scenario transformation decisions:

- Salary priority raises income priority and risk tolerance.
- Work-life balance raises work-life, remote-work, and low-risk preferences.
- Avoid management adds a blocking no-management constraint and lowers leadership priority.
- Relocation enables relocation and international mobility and prepends the chosen country to preferred locations.
- Industry change temporarily changes the target industry.
- Earlier retirement compresses target timeline and raises income priority.
- Completing a master's degree temporarily adds illustrative analytics/research evidence to the employee skill set for preview scoring only.
- Entrepreneurship shifts preferences toward startup, ownership, leadership, income, and higher risk.

Not implemented in Phase 6:

- No Career Buddy.
- No AI or LLM calls.
- No external labor-market, salary, relocation, or education APIs.
- No new database tables.
- No persistent scenario library or saved named scenarios.
- No frontend-direct Supabase access.

## Phase 5 - Employee Career GPS Roadmap Frontend

Implemented the employee-facing Career GPS roadmap frontend inside the existing employee dashboard.

Frontend behavior added:

- Connects to the Phase 4 roadmap backend:
  - Loads `GET /career-gps/profile`.
  - Loads `GET /career-gps/roadmaps/latest`.
  - Generates/regenerates with `POST /career-gps/roadmaps/generate`.
- Adds a Career North Star summary at the top of the roadmap section.
- Adds a Next Best Action card from the generated roadmap.
- Adds three route-selection cards for Recommended, Accelerated, and Balanced routes.
- Route cards show:
  - Estimated timeline
  - Main advantage
  - Main trade-off
  - Lifestyle fit
  - Skill readiness
  - Market opportunity
  - Confidence level
- Adds a horizontal metro-style roadmap for the selected route.
- Roadmap nodes show:
  - Target role or milestone
  - Career stage
  - Estimated timeline
  - Readiness
  - Status
  - Main missing requirement
- Adds milestone detail panels with:
  - Why it is recommended
  - Required skills
  - Missing skills
  - Recommended experience
  - Certifications
  - Suggested projects
  - Transition difficulty
  - Lifestyle impact
  - Confidence
  - Immediate actions
- Adds skill-gap and readiness summaries for the selected route.
- Adds loading, empty, generation, error, and informational states.
- Adds local roadmap progress controls for planned, in-progress, and completed milestone states.
- Adds responsive layout behavior using the existing Tailwind and Simploy visual style.
- Removes the previous static/demo roadmap module from the employee dashboard so the backend-backed Career GPS roadmap is the single roadmap surface.

Design and architecture decisions:

- Reused the employee dashboard instead of creating a new employee roadmap page.
- Added `frontend/components/career-gps/CareerGpsRoadmapPanel.tsx` as a focused component.
- Reused existing `getJson` and `postJson` API helpers.
- Added TypeScript response types for Phase 4 roadmap payloads in `frontend/lib/backendTypes.ts`.
- Kept progress controls frontend-local because Phase 4 did not add a progress persistence endpoint.
- Did not modify marketplace functionality.
- Removed the old static `SkillRoadmapModule`, its modal, dead demo roadmap transforms, and dead `#skills` navigation anchor.

Not implemented in Phase 5:

- No what-if simulator.
- No Career Buddy AI.
- No new backend endpoints.
- No persistent milestone/action progress updates.

## Phase 4 - Deterministic Career Route Engine

Implemented backend-only deterministic Career GPS route generation, scoring, persistence, retrieval, and tests.

New API endpoints:

- `POST /career-gps/roadmaps/generate`
  - Loads the authenticated employee profile, Career North Star goals, lifestyle priorities, constraints, occupations, occupation skills, and career transitions.
  - Generates candidate career paths deterministically from reference occupations/transitions.
  - Removes route variants that violate supported hard constraints.
  - Produces three route types:
    - Recommended Route
    - Accelerated Route
    - Balanced Route
  - Scores each route from `0..100`.
  - Stores generated roadmap rows, route rows, milestones, milestone actions, score components, and a version snapshot.
  - Reuses the latest active roadmap for the employee and increments `current_version` on regeneration.
- `GET /career-gps/roadmaps/latest`
  - Retrieves the latest saved Career GPS roadmap snapshot for the authenticated employee.
- `GET /career-gps/roadmaps/{roadmap_id}`
  - Retrieves a saved Career GPS roadmap snapshot by ID, scoped to the authenticated employee.

Deterministic score components implemented:

- Goal fit
- Skill fit
- Lifestyle fit
- Market opportunity
- Income potential
- Leadership fit
- Geographic fit
- Work-life balance fit
- Transition difficulty
- Estimated cost
- Career risk
- Preparation time

Scoring and generation behavior:

- No AI model is called.
- No random values are used.
- All scores are clamped to `0..100`.
- The same inputs produce the same route output.
- Route score components are stored separately in `roadmap_score_components`.
- Component keys are namespaced by route type, for example `recommended.goal_fit`, to fit the existing unique `(roadmap_id, component_key)` table constraint.
- Route explanations explicitly state that scores do not guarantee salary, promotion, or hiring outcomes.
- Milestones and milestone actions are generated deterministically from target occupation skill gaps.
- One Next Best Action is generated from the recommended route's highest-priority missing skill, or target-role validation when no skill gap exists.
- Skill gaps are included in the saved roadmap version snapshot and reflected in milestone focus skills.

Persistence behavior:

- Uses existing Phase 1 tables:
  - `career_roadmaps`
  - `career_routes`
  - `roadmap_milestones`
  - `milestone_actions`
  - `roadmap_score_components`
  - `roadmap_versions`
- No new production Supabase migration was added in Phase 4.
- Local SQLite fallback in `backend/app/core/database.py` now creates and seeds the Phase 1 reference and roadmap tables needed by the engine.
- `roadmap_versions` preserves every generated snapshot for the reused active roadmap.

Hard-constraint behavior implemented:

- Blocking constraints that state the employee does not want management remove management/leadership paths.
- Blocking constraints that explicitly state no accelerated route or no fast track remove accelerated variants.
- Time, family, health, overtime, part-time, caregiving, and work-life preferences influence scoring through lifestyle and risk components rather than removing a required route type by default.
- Other constraints continue to influence scoring through existing lifestyle/profile fields where available.

Tests added:

- `backend/tests/test_career_route_engine.py`
  - C-suite ambition profile
  - Work-life balance profile
  - Financial independence profile
  - Technical specialist who does not want management

Not implemented in Phase 4:

- No final visual roadmap UI.
- No AI, LLM, or model call.
- No salary, promotion, or hiring guarantees.
- No new normalized skill catalog.
- No frontend roadmap rendering.
- No progress-update endpoint for checking off milestones/actions.

## Phase 3 - Career North Star Onboarding And Settings Frontend

Implemented a frontend-only Career North Star onboarding/settings experience that connects to the Phase 2 backend APIs.

Frontend behavior added:

- Adds a responsive Career GPS section inside the existing employee dashboard at `#career-north-star`.
- Adds a six-step Career North Star setup flow:
  - Current situation
  - Career ambition
  - Lifestyle priorities
  - Constraints
  - Financial targets
  - Review and save
- Loads saved Career GPS profile data from `GET /career-gps/profile`.
- Saves progress between onboarding steps with `PUT /career-gps/onboarding-progress`.
- Saves Career North Star goal fields with `PUT /career-gps/goals`.
- Saves lifestyle priorities and financial preference fields with `PUT /career-gps/lifestyle-priorities`.
- Replaces saved constraints with `PUT /career-gps/constraints`.
- Refreshes the summary state from `GET /career-gps/north-star`.
- Shows loading, validation, success, retry, and error states.
- Allows completed users to reopen and edit the Career North Star from the same dashboard/settings area.
- Shows a Career North Star summary card after completion with:
  - Main goal
  - Top priorities
  - Constraints
  - Target role
  - Retirement target
  - Profile completion/readiness state

Design and architecture decisions:

- Reused the existing employee dashboard rather than creating a new page or replacing the marketplace.
- Added a focused component under `frontend/components/career-gps/` to avoid growing the already large dashboard file further.
- Reused existing local auth token handling and backend API conventions.
- Added a shared `putJson` helper to match the existing `getJson` and `postJson` utilities.
- Kept the current situation step read-only because Phase 2 exposes existing employee profile basics but does not provide a separate work-history/current-role settings endpoint.
- No frontend Supabase client or secret key usage was added.

Not implemented in Phase 3:

- No visual career roadmap.
- No route scoring.
- No AI or coach integration.
- No new backend endpoints or database migrations.
- No marketplace redesign or removal.

## Phase 2 - Backend Profile And Career North Star APIs

Implemented backend-only Career GPS APIs under `/career-gps`.

New API endpoints:

- `GET /career-gps/profile`
  - Returns the authenticated employee profile plus onboarding progress, career goals, lifestyle priorities, constraints, and North Star summary.
  - Provides default fallback values when Career GPS rows are incomplete or missing.
- `PUT /career-gps/onboarding-progress`
  - Saves onboarding progress: current step, completed steps, and completion state.
- `PUT /career-gps/goals`
  - Updates Career North Star goal fields: career ambition, target role, target industry, target retirement age, timeline, and motivation.
  - Keeps `employee_profiles.target_role` aligned when target role changes.
- `PUT /career-gps/lifestyle-priorities`
  - Updates priority weights and preference metadata: income, work-life balance, leadership, job security, remote work, international mobility, risk tolerance, learning budget, preferred company type, relocation willingness, preferred locations/work styles, and top two non-negotiable priorities.
- `PUT /career-gps/constraints`
  - Replaces the authenticated employee's Career GPS constraint list.
- `GET /career-gps/north-star`
  - Returns a summary view for the employee's Career North Star and missing setup sections.

Request validation:

- Implemented with Pydantic schemas in `backend/app/schemas/career_gps.py`.
- Numeric priorities are constrained to `0..100`.
- Target retirement age is constrained to `45..80`.
- Timeline months and learning budget are bounded.
- Risk tolerance is restricted to `low`, `moderate`, or `high`.
- Top non-negotiable priorities are limited to two values.
- Constraint labels and types cannot be blank.

Access control:

- All endpoints reuse `require_role("employee")`.
- The service resolves the authenticated user's `employee_profiles` row and passes only that `employee_profile_id` to the repository.
- Supabase access still happens server-side through the existing service-role backend utility.
- No frontend Supabase access or keys were added.

New backend structure:

- `backend/app/routers/career_gps.py`
- `backend/app/schemas/career_gps.py`
- `backend/app/services/career_gps_service.py`
- `backend/app/repositories/career_gps.py`

Database additions for Phase 2:

- `backend/migrations/003_career_gps_profile_api_fields.sql`
  - Adds Career GPS profile API fields to `career_north_star_settings` and `career_preferences`.
  - Adds `career_onboarding_progress`.
- `backend/migrations/004_career_gps_profile_api_rls.sql`
  - Adds RLS for `career_onboarding_progress`.
- Local SQLite fallback was updated in `backend/app/core/database.py` for the Career GPS profile tables used by the new APIs.

Not implemented in Phase 2:

- No roadmap algorithm.
- No scoring engine.
- No AI.
- No Career Buddy.
- No frontend pages.
- No unrelated employee API changes.

## Phase 1 - Supabase Database Foundation

Implemented as non-destructive Supabase migrations:

- `backend/migrations/001_career_gps_foundation.sql`
  - Core tables, indexes, triggers, constraints, and illustrative seed data.
- `backend/migrations/002_career_gps_rls.sql`
  - RLS enablement, ownership helper functions, and policies.

The migration follows existing database conventions:

- Uses `public` schema.
- Uses `bigint generated by default as identity` primary keys.
- References existing `public.employee_profiles(id)` for employee-owned Career GPS data.
- Reuses current skills storage by keeping skill names as text aligned with `employee_profiles.skills_json` and `jobs.required_skills_json`; it does not add a duplicate general skill catalog.
- Uses `created_at timestamptz not null default now()`.
- Adds `updated_at` only for mutable new Career GPS tables, maintained by a trigger.
- Keeps all changes additive with `create table if not exists`, `create index if not exists`, and idempotent seed upserts.

New database areas added:

- `career_north_star_settings`
  - Employee-owned Career North Star settings: target occupation, target role, motivation, timeline, and status.
- `career_preferences`
  - Employee-owned career preferences: preferred locations, work styles, industries, salary floor, relocation, remote openness, and notes.
- `career_priority_weights`
  - Employee-owned priority weights for later recommendation/scoring inputs.
- `career_constraints`
  - Employee-owned hard or soft constraints stored with typed JSON values.
- `occupations`
  - Reference occupations seeded with illustrative technology, data, and project-management roles.
- `occupation_skills`
  - Required/preferred skill names for occupations. This supports occupation skill requirements without creating a duplicate profile skill inventory.
- `career_transitions`
  - Reference transition paths between occupations, seeded for technology, data, and project-management paths.
- `career_roadmaps`
  - Employee-owned roadmap records with target occupation, status, score snapshots, and current version number.
- `career_routes`
  - Ordered routes under a roadmap.
- `roadmap_milestones`
  - Ordered milestones under a route.
- `milestone_actions`
  - Ordered actions under a milestone.
- `roadmap_score_components`
  - Storage for future score component snapshots. The scoring engine is not implemented in Phase 1.
- `roadmap_progress`
  - Employee-owned milestone/action progress records.
- `roadmap_versions`
  - Version history snapshots for roadmaps.

Indexes and constraints added:

- Foreign-key indexes for new owner and parent-child relationships.
- Unique sequence constraints for routes, milestones, and actions within their parent records.
- Unique roadmap version numbers per roadmap.
- Unique priority weight keys per employee profile.
- Partial unique indexes for milestone/action progress records.
- Check constraints for statuses, score ranges, weights, progress percentages, and positive durations.
- `validate_roadmap_progress_links()` trigger to keep progress records aligned with the owning roadmap, milestone, action, and employee profile.

Row Level Security added in `backend/migrations/002_career_gps_rls.sql`:

- RLS is enabled on all new tables.
- Reference tables `occupations`, `occupation_skills`, and `career_transitions` are readable by authenticated users.
- Employee-owned tables use owner policies based on `auth.uid()` mapped through existing `public.users.supabase_user_id` and `public.employee_profiles.user_id`.
- Helper functions:
  - `public.is_employee_profile_owner(profile_id bigint)`
  - `public.is_roadmap_owner(roadmap_id bigint)`
  - `public.is_route_owner(route_id bigint)`
  - `public.is_milestone_owner(milestone_id bigint)`

Seed data added:

- Technology path:
  - `Cloud Support Engineer`
  - `Application Engineer`
  - Transition: `Technology builder path`
- Data path:
  - `Data Analyst`
  - `Analytics Engineer`
  - Transition: `Data platform path`
- Project-management path:
  - `Project Coordinator`
  - `Project Manager`
  - Transition: `Project-management leadership path`

All seed records use `source_label = 'illustrative_seed'`.

## 1. Current Frontend Architecture

- Framework: Next.js `14.2.35` in `frontend/package.json`, using the App Router under `frontend/app`.
- React: `^18`.
- Deployment target: Vercel, with backend URL configured by `NEXT_PUBLIC_API_URL`.
- Routing structure:
  - Public landing route: `frontend/app/page.tsx`.
  - Auth route group: `frontend/app/(auth)/login`, `signup`, and `forgot-password`.
  - Employee routes: `frontend/app/employee/dashboard/page.tsx`, `frontend/app/employee/applications/page.tsx`.
  - Employer routes: `frontend/app/employer/dashboard/page.tsx`, `frontend/app/employer/analytics/simulator/page.tsx`, `frontend/app/employer/action-engine/page.tsx`.
  - Shared route constants are in `frontend/lib/routes.ts`.
- Employee dashboard pages:
  - `frontend/app/employee/dashboard/page.tsx` is the main employee workspace.
  - `frontend/app/employee/applications/page.tsx` tracks submitted applications.
  - `frontend/app/employee/layout.tsx` wraps employee pages with `ChatWidget`.
- Existing employee roadmap components:
  - The active roadmap surface is `frontend/components/career-gps/CareerGpsRoadmapPanel.tsx`.
  - The old inline `SkillRoadmapModule`, modal, `demoLearningPath`, and `demoCareerSkillGaps` were removed during the Career GPS rebuild and Phase 8 cleanup.
- Skills-related components and utilities:
  - `frontend/components/RiasecAssessment.tsx` provides a career interest assessment.
  - `frontend/lib/riasec.ts` contains RIASEC questions, scoring, result storage keys, and local-storage helpers.
  - Employee skills are represented as `skills` on backend employee profiles and `skills_json` in persistence.
  - Marketplace skill mock data lives in `frontend/lib/mock-data/marketplace.ts`.
- Career marketplace components:
  - Employee opportunity cards are currently inline in `frontend/app/employee/dashboard/page.tsx`.
  - Backend jobs and applications are typed in `frontend/lib/backendTypes.ts`.
  - Mock marketplace companies, jobs, candidates, applications, skills, and regional signals are in `frontend/lib/mock-data/marketplace.ts`.
  - Existing marketplace application flow uses `POST /jobs/{job_id}/apply`.
- Authentication handling:
  - Frontend auth forms call backend `/auth/signup` and `/auth/login` through `frontend/lib/api.ts`.
  - Auth token and user data are stored in local storage keys `simploy-token` and `simploy-user`.
  - Role is stored in local storage key `simploy-role`.
  - The frontend does not use Supabase directly and should not receive service-role keys.
- API client utilities:
  - `frontend/lib/api.ts` exposes `getJson`, `postJson`, `getAuthToken`, `storeAuthSession`, and `clearAuthSession`.
  - Requests use bearer tokens when `{ auth: true }` is passed.
  - Errors parse `detail` from backend JSON responses when available.
- State-management approach:
  - Local React state with `useState`, `useEffect`, `useCallback`, and `useMemo`.
  - No Redux, Zustand, React Query, SWR, or server-state cache library is present.
  - Some employee personalization data is stored in local storage.
- Form-validation approach:
  - Auth forms use `react-hook-form`, `@hookform/resolvers`, and `zod`.
  - Backend validation uses Pydantic schemas.
- Styling system:
  - Tailwind CSS `3.4.1`.
  - CSS variables are defined in `frontend/app/globals.css`.
  - Icons use `lucide-react`.
  - Animation uses `framer-motion`.
  - Charts/maps use `recharts` and `react-simple-maps`.
- Reusable UI components:
  - `frontend/components/ui/Button.tsx`
  - `frontend/components/ui/FadeUp.tsx`
  - `frontend/components/ui/SectionLabel.tsx`
  - `frontend/components/ProfileMenu.tsx`
  - Auth components under `frontend/components/auth`.
  - Simulator components under `frontend/components/simulator`.
- Current loading and error patterns:
  - Auth forms use `isSubmitting` from `react-hook-form` and `Loader2`.
  - Auth submission errors are shown as inline red alert blocks.
  - Employee dashboard fetches `/dashboard/employee`; on failure it falls back to `null` and continues with illustrative data.
  - Application submissions display a local success/error message.
  - There are no route-level `loading.tsx` or `error.tsx` files.

## 2. Current Backend Architecture

- Framework: FastAPI `0.111.1` in `backend/requirements.txt`.
- Runtime server: `uvicorn[standard]==0.23.2`.
- Validation library: Pydantic `2.8.0`.
- Main entry point:
  - `backend/main.py` imports `app` from `backend.app.main`.
  - `backend/app/main.py` defines `create_app()` and the FastAPI `app`.
- Route structure:
  - `backend/app/routers/auth.py`
  - `backend/app/routers/profiles.py`
  - `backend/app/routers/jobs.py`
  - `backend/app/routers/applications.py`
  - `backend/app/routers/dashboard.py`
  - `backend/app/routers/simulations.py`
  - `backend/app/routers/predictions.py`
- Controller/service/repository structure:
  - Routers are thin FastAPI controllers.
  - Services live under `backend/app/services`.
  - Persistence logic lives under `backend/app/repositories`.
  - Schemas live under `backend/app/schemas`.
- Authentication middleware/dependencies:
  - `backend/app/dependencies.py` defines `get_current_user` and `require_role`.
  - Auth uses HTTP bearer tokens.
  - When Supabase is enabled, the token is validated through Supabase Auth and mapped to `public.users.supabase_user_id`.
  - When Supabase is disabled, local JWT validation is handled in `backend/app/core/security.py`.
- Supabase connection utilities:
  - `backend/app/core/supabase.py` contains a lightweight Supabase REST/Auth client.
  - `supabase()` uses the service role key and is backend-only.
  - `supabase_auth()` uses the anon key for auth calls.
  - The client validates that `SUPABASE_SERVICE_ROLE_KEY` is not an anon key.
- Employee-related endpoints:
  - `GET /dashboard/employee`
  - `GET /employees/me`
  - `PUT /employees/me`
  - `GET /applications/me`
  - `POST /jobs/{job_id}/apply`
- Skills-related endpoints:
  - `POST /predictions/skill-gap`
  - `POST /predictions/job-match`
  - Skills are also read and updated through `GET/PUT /employees/me`.
- Roadmap-related endpoints:
  - No dedicated roadmap endpoint exists.
  - Roadmap behavior is currently frontend-only and illustrative.
- Validation approach:
  - Pydantic schemas in `backend/app/schemas`.
  - Examples: `Field(ge=0)` for experience and salaries, literal role/status types, password minimum length on signup.
- Error-handling approach:
  - Routers and services raise `HTTPException`.
  - Common statuses include `401`, `403`, `404`, `409`, `422`, and `502`.
  - Supabase HTTP errors are normalized in `SupabaseClient._status_code`.
- Environment-variable usage:
  - `backend/app/core/config.py` loads `backend/.env` if present.
  - Backend variables include `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SIMPLOY_DATABASE_PATH`, `SIMPLOY_JWT_SECRET`, `SIMPLOY_TOKEN_TTL_MINUTES`, `SIMPLOY_AI_ENGINE_URL`, `SIMPLOY_CORS_ORIGINS`, and `SIMPLOY_CORS_ORIGIN_REGEX`.

## 3. Current Database Structure

The production schema is defined in `backend/supabase_schema.sql`. Local SQLite fallback creates equivalent tables in `backend/app/core/database.py`.

### Existing Tables

- `public.users`
  - `id bigint generated by default as identity primary key`
  - `supabase_user_id uuid unique references auth.users(id) on delete cascade`
  - `email text not null unique`
  - `password_hash text`
  - `role text not null check (role in ('employee', 'employer', 'admin'))`
  - `created_at timestamptz not null default now()`
- `public.employee_profiles`
  - `id bigint generated by default as identity primary key`
  - `user_id bigint not null unique references public.users(id) on delete cascade`
  - `full_name text not null`
  - `location text`
  - `target_role text`
  - `experience_years integer not null default 0`
  - `skills_json jsonb not null default '[]'::jsonb`
  - `created_at timestamptz not null default now()`
- `public.employer_profiles`
  - Employer organization profile.
- `public.departments`
  - Employer-owned department names.
- `public.jobs`
  - Employer jobs with `required_skills_json`, work style, salary range, status, and timestamps.
- `public.applications`
  - Employee job applications with status and match score.
- `public.simulations`
  - Employer simulation inputs/results stored as JSON.

### Supabase Audit By Domain

- Users: `public.users` plus `auth.users`.
- Employee profiles: `public.employee_profiles`.
- Skills: only embedded JSON fields: `employee_profiles.skills_json` and `jobs.required_skills_json`; no normalized skills table exists.
- Work experience: no table exists.
- Education: no table exists.
- Career preferences: limited to `employee_profiles.target_role`; no detailed preferences table exists.
- Roadmaps: no table exists.
- Jobs: `public.jobs`.
- Occupations: no table exists.
- Certifications: no table exists.
- Chat or AI features: no table exists. Current chat widget is frontend-only and simulated. Predictions are stateless endpoints.

### SQL Migrations

- No migration directory or Alembic setup exists.
- `backend/supabase_schema.sql` is the only production schema artifact.
- `backend/app/core/database.py` contains local SQLite DDL and seed data.

### ID, Foreign-Key, Timestamp, And RLS Conventions

- Primary keys use `bigint generated by default as identity` in Supabase.
- The only UUID is `users.supabase_user_id`, which references `auth.users(id)`.
- Foreign keys generally reference integer application-table IDs, not Supabase auth UUIDs.
- User ownership pattern currently flows `auth.users.id -> public.users.supabase_user_id -> employee_profiles.user_id`.
- Timestamps use `created_at timestamptz not null default now()` in Supabase.
- Most destructive relationships use `on delete cascade`; `jobs.department_id` and `simulations.employer_id` use `on delete set null`.
- RLS is enabled on all defined tables.
- No RLS policies are currently defined in `backend/supabase_schema.sql`.
- Backend uses the service role key for application data access, so RLS policies are not yet relied on for server-side access control.

## 4. Existing Features That Can Be Reused

- Employee dashboard shell, navigation, profile menu, and chat layout.
- Inline Career Command Center visual patterns.
- RIASEC assessment and local result storage.
- Employee profile API for profile basics, target role, experience years, and skills.
- Prediction service for deterministic skill-gap and job-match scoring.
- Jobs, applications, and marketplace UI/API flow.
- Existing mock-data structure for clearly illustrative prototype content.
- Existing auth/session conventions and role-based backend dependencies.
- Existing Tailwind/CSS variable visual system.

## 5. Conflicts Or Duplication Risks

- Do not create a separate employee career dashboard if the existing employee dashboard can host the Career GPS.
- Avoid duplicating skill concepts across `skills_json`, mock marketplace skills, and any future normalized skill tables without a clear migration path.
- Do not add a second API client or direct Supabase frontend client for Career GPS.
- Do not store service-role keys or AI keys in the frontend.
- Do not create duplicate prediction endpoints if `/predictions/skill-gap` and `/predictions/job-match` are sufficient for the phase.
- Current frontend roadmap and market signals are illustrative; future work must not present them as verified market data.
- Existing Supabase schema enables RLS but has no policies; adding frontend-direct Supabase data access would fail or create security risks.
- Current chat is simulated and frontend-only; adding AI persistence should not be mixed into the existing widget without explicit scope.

## 6. Recommended Career GPS Architecture

- Keep Career GPS inside the employee area, preferably evolving `frontend/app/employee/dashboard/page.tsx` and extracting reusable subcomponents only when needed.
- Use the backend as the only trusted integration point for Supabase and AI/model calls.
- Create a dedicated backend router only when a later phase needs persisted GPS data access, for example `backend/app/routers/career_gps.py`.
- Keep deterministic baseline scoring first:
  - Use current profile skills and target role/job requirements.
  - Use existing `PredictionService` for skill-gap/readiness logic.
  - Avoid random recommendation generation.
- Keep prototype data explicit:
  - Label seeded occupations, learning steps, and market signals as illustrative unless sourced and verified later.
- Prefer additive schema changes:
  - Add new tables only for persisted roadmap plans, goals, milestones, or normalized reference data.
  - Avoid destructive changes to `employee_profiles`, `jobs`, and `applications`.

## 7. Proposed New Tables Or Table Changes

Phase 1 implemented the database foundation in `backend/migrations/001_career_gps_foundation.sql` and RLS in `backend/migrations/002_career_gps_rls.sql`.

- `career_goals`
  - Not added as a separate table. The current convention is to represent the primary goal as `career_north_star_settings` and supporting preferences/weights/constraints in separate owned tables.
- `career_roadmaps`
  - Stores selected roadmap summary, readiness score snapshot, scoring version placeholder, and status.
  - Owned by `employee_profile_id`.
- `career_routes`, `roadmap_milestones`, and `milestone_actions`
  - Store route, milestone, and action structure below each roadmap.
- `career_preferences`, `career_priority_weights`, and `career_constraints`
  - Store personalization inputs without changing `employee_profiles`.
- `occupations`, `occupation_skills`, and `career_transitions`
  - Store illustrative path/reference data for technology, data, and project-management tracks.
- `roadmap_score_components`, `roadmap_progress`, and `roadmap_versions`
  - Store future score snapshots, progress records, and version history.
- `skill_catalog`
  - Not added in Phase 1 to avoid duplicating existing skill arrays. Revisit only if later phases require aliases, deduplication, or skill taxonomy management.
- `employee_skill_evidence`
  - Optional table for certifications, projects, work evidence, or self-assessed proficiency.
- `occupations`
  - Added in Phase 1 as an illustrative reference table.

Recommended conventions for future tables:

- Use `bigint generated by default as identity` for consistency with existing app tables.
- Reference `employee_profiles(id)` for employee-owned Career GPS data.
- Include `created_at timestamptz not null default now()` and consider `updated_at` for mutable roadmap rows.
- Add non-destructive indexes on owner foreign keys.
- Add RLS policies if any future frontend-direct Supabase access is introduced; otherwise continue server-side access through FastAPI.

## 8. Backend Endpoints

Implemented in Phase 2:

- `GET /career-gps/profile`
- `PUT /career-gps/onboarding-progress`
- `PUT /career-gps/goals`
- `PUT /career-gps/lifestyle-priorities`
- `PUT /career-gps/constraints`
- `GET /career-gps/north-star`

Implemented in Phase 4:

- `POST /career-gps/roadmaps/generate`
  - Generate, score, persist, and version deterministic Career GPS routes for the authenticated employee.
- `GET /career-gps/roadmaps/latest`
  - Retrieve the authenticated employee's latest generated roadmap snapshot.
- `GET /career-gps/roadmaps/{roadmap_id}`
  - Retrieve a generated roadmap snapshot by ID, scoped to the authenticated employee.

Implemented in Phase 6:

- `POST /career-gps/roadmaps/what-if/preview`
  - Generate an in-memory scenario roadmap preview and compare it with the active recommended route without overwriting the active roadmap.
- `POST /career-gps/roadmaps/what-if/apply`
  - Recompute and save a scenario roadmap as the next active roadmap version while preserving prior snapshots in `roadmap_versions`.

Implemented in Phase 7:

- `GET /career-gps/career-buddy/conversations`
  - List the authenticated employee's Career Buddy conversations.
- `POST /career-gps/career-buddy/conversations`
  - Create a Career Buddy conversation tied to a stored roadmap.
- `GET /career-gps/career-buddy/conversations/{conversation_id}`
  - Retrieve an owned Career Buddy conversation and messages.
- `POST /career-gps/career-buddy/messages`
  - Persist an employee message and validated assistant response generated from backend-only roadmap context.

Candidate future endpoints:

- `PATCH /career-gps/roadmaps/{roadmap_id}/steps/{step_id}`
  - Update completion state for a roadmap step.
- `GET /career-gps/occupations`
  - Return a simple role/occupation catalog if future phases require browse/search.

Existing endpoints still reused:

- `GET /employees/me`
- `PUT /employees/me`
- `GET /dashboard/employee`
- `POST /predictions/skill-gap`
- `POST /predictions/job-match`
- `GET /jobs`
- `POST /jobs/{job_id}/apply`

## 9. Proposed Frontend Components

No components are added in Phase 0. Candidate future extraction from the current employee dashboard:

- `CareerGpsSummary`
  - Readiness, target role, priority gap, and next action.
- `CareerGpsTargetSelector`
  - Target-role and preference form using existing form patterns.
- `CareerGpsSkillGapPanel`
  - Missing skills, matched skills, and priority skills.
- `CareerGpsRoadmapTimeline`
  - Milestones and step completion.
- `CareerGpsOpportunityMatches`
  - Reuse marketplace opportunity-card behavior.
- `CareerGpsSourceNote`
  - Clear note for illustrative seed data or baseline scoring.

Keep shared behavior in:

- `frontend/lib/api.ts` for backend calls.
- `frontend/lib/backendTypes.ts` for response types.
- Existing Tailwind/CSS variable styling.

## 10. Proposed Phase-By-Phase Implementation Order

1. Phase 0 - Repository Audit
   - Complete this document.
   - No behavior changes.
2. Phase 1 - Supabase Database Foundation
   - Completed in `backend/migrations/001_career_gps_foundation.sql` and `backend/migrations/002_career_gps_rls.sql`.
   - Adds additive Career GPS tables, RLS, indexes, FK constraints, versioning, and illustrative path seed data.
3. Phase 2 - Baseline Career GPS Data Contract
   - Completed as backend profile and Career North Star APIs.
   - Added schemas, router, service, repository, validation, and SQLite fallback.
   - Did not implement AI or scoring.
4. Phase 3 - Employee Career GPS UI
   - Replace or refactor the current inline roadmap area into focused Career GPS components.
   - Add loading/error states consistent with existing patterns.
   - Keep mock data clearly labelled where used.
5. Phase 4 - Deterministic Career Route Engine
   - Completed as backend deterministic route generation, scoring, persistence, versioning, retrieval, and tests.
   - Does not include milestone/action progress updates.
6. Phase 5 - Employee Career GPS Roadmap Frontend
   - Completed as frontend roadmap loading/generation, route selection, metro roadmap, detail panels, readiness summaries, and local progress controls.
   - Does not include backend-persisted progress updates.
7. Phase 6 - What-If Career Simulator
   - Completed as deterministic scenario preview, comparison, and apply behavior.
   - Preview does not overwrite the active roadmap; apply saves a new roadmap version.
   - Does not include Career Buddy, AI, external market data, or saved scenario libraries.
8. Phase 7 - AI/Coach Integration
   - Completed as Career Buddy, backend-only AI provider abstraction, structured response validation, template fallback, and conversation/message persistence.
   - Does not replace deterministic route scoring or add external market data.
9. Phase 8 - Integration Testing, Security Review, And Cleanup
   - Completed as integration tests, security review, cleanup, responsive-build verification, and setup/deployment documentation.
   - Does not add new product features.

## 11. Risks And Assumptions

- Assumption: Career GPS should reuse the existing employee dashboard rather than introduce a new standalone product surface.
- Assumption: Hackathon prototype quality favors deterministic, explainable recommendations over opaque generation.
- Risk: Existing employee dashboard is large and inline-heavy, so changes there can be hard to review unless components are extracted carefully.
- Risk: Current skill data is stored as JSON arrays, which is fast for prototyping but weak for analytics, deduplication, and evidence tracking.
- Risk: RLS is enabled without policies; future frontend-direct Supabase usage would need explicit policy work.
- Risk: Current market and roadmap data is illustrative and may be mistaken for verified labor-market data if labels are not clear.
- Risk: There is no migrations framework; production schema changes must be handled carefully and documented.

## Database Migrations Added

- `backend/migrations/001_career_gps_foundation.sql`
  - Non-destructive Supabase migration for Career GPS foundation tables.
  - Adds core tables, indexes, triggers, constraints, and illustrative seed data.
- `backend/migrations/002_career_gps_rls.sql`
  - Adds RLS policies and helper functions.
- `backend/migrations/003_career_gps_profile_api_fields.sql`
  - Adds fields and onboarding progress storage required by Phase 2 APIs.
- `backend/migrations/004_career_gps_profile_api_rls.sql`
  - Adds RLS for `career_onboarding_progress`.
- `backend/migrations/005_career_buddy.sql`
  - Adds Career Buddy conversations/messages, indexes, ownership helper, and RLS policies.

## API Endpoints Added Or Changed

- Added:
  - `GET /career-gps/profile`
  - `PUT /career-gps/onboarding-progress`
  - `PUT /career-gps/goals`
  - `PUT /career-gps/lifestyle-priorities`
  - `PUT /career-gps/constraints`
  - `GET /career-gps/north-star`
  - `POST /career-gps/roadmaps/generate`
  - `GET /career-gps/roadmaps/latest`
  - `GET /career-gps/roadmaps/{roadmap_id}`
  - `POST /career-gps/roadmaps/what-if/preview`
  - `POST /career-gps/roadmaps/what-if/apply`
  - `GET /career-gps/career-buddy/conversations`
  - `POST /career-gps/career-buddy/conversations`
  - `GET /career-gps/career-buddy/conversations/{conversation_id}`
  - `POST /career-gps/career-buddy/messages`
- Changed:
  - `backend/app/main.py` now includes the Career GPS router.
  - `frontend/lib/api.ts` now includes `putJson` for authenticated PUT requests.
  - `backend/app/repositories/career_gps.py` now accepts a custom roadmap version change summary when saving generated roadmaps.
  - `backend/app/repositories/career_gps.py` now handles Career Buddy conversation and message persistence.

## Files Changed

- `DOCS/career-gps-implementation.md`
- `backend/app/core/database.py`
- `backend/app/core/supabase.py`
- `backend/app/main.py`
- `backend/app/repositories/career_gps.py`
- `backend/app/routers/career_gps.py`
- `backend/app/schemas/career_gps.py`
- `backend/app/services/career_gps_service.py`
- `backend/app/services/career_buddy_ai.py`
- `backend/app/services/career_route_engine.py`
- `backend/tests/test_career_route_engine.py`
- `backend/migrations/001_career_gps_foundation.sql`
- `backend/migrations/002_career_gps_rls.sql`
- `backend/migrations/003_career_gps_profile_api_fields.sql`
- `backend/migrations/004_career_gps_profile_api_rls.sql`
- `backend/migrations/005_career_buddy.sql`
- `backend/.env.example`
- `frontend/components/career-gps/CareerGpsRoadmapPanel.tsx`
- `frontend/app/employee/dashboard/page.tsx`
- `frontend/components/career-gps/CareerNorthStarPanel.tsx`
- `frontend/lib/api.ts`
- `frontend/lib/backendTypes.ts`

## Environment Variables

- Frontend:
  - `NEXT_PUBLIC_API_URL`
- Backend:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SIMPLOY_DATABASE_PATH`
  - `SIMPLOY_JWT_SECRET`
  - `SIMPLOY_TOKEN_TTL_MINUTES`
  - `SIMPLOY_AI_ENGINE_URL`
  - `SIMPLOY_CAREER_BUDDY_AI_PROVIDER`
  - `SIMPLOY_CAREER_BUDDY_MODEL`
  - `SIMPLOY_CAREER_BUDDY_RATE_LIMIT_PER_HOUR`
  - `OPENAI_API_KEY`
  - `SIMPLOY_CORS_ORIGINS`
  - `SIMPLOY_CORS_ORIGIN_REGEX`

## Testing Completed

- Read the existing tracking document.
- Inspected frontend package, routes, employee pages, auth forms, UI components, styling, API utilities, RIASEC logic, chat widget, and mock marketplace data.
- Inspected backend package requirements, app entry points, config, security, Supabase client, dependencies, routers, schemas, repositories, and services.
- Inspected `backend/supabase_schema.sql` and local SQLite DDL in `backend/app/core/database.py`.
- Added the Phase 1 SQL migrations and reviewed them for non-destructive DDL, owner-based RLS, foreign keys, indexes, status checks, and illustrative seed labels.
- Static migration structure check found the expected new table, index, RLS, and seed sections.
- No frontend lint, type check, build, or backend test suite was run because Phase 1 changed SQL/docs only.
- The migration was not executed against a live Supabase project in this environment.
- `psql` is not installed locally in this workspace, so local Postgres syntax execution was not available.
- Phase 2 Python compile check passed with `python -m compileall backend\app`.
- FastAPI route import check confirmed the six `/career-gps` routes are registered.
- Local SQLite smoke test passed:
  - employee signup
  - `GET /career-gps/profile`
  - `PUT /career-gps/goals`
  - `PUT /career-gps/lifestyle-priorities`
  - `PUT /career-gps/constraints`
  - `PUT /career-gps/onboarding-progress`
  - `GET /career-gps/north-star`
- Added a local SQLite additive-column backfill for `career_preferences.international_mobility` after testing exposed that existing local databases created before the Phase 2 patch did not receive the new column automatically.
- Phase 3 frontend checks:
  - `npm run lint` passed.
  - `npx tsc --noEmit` passed.
  - `npm run build` passed.
- Before checks could run, `npm install` was required because `frontend/node_modules` existed but was missing the actual `next` package and `.bin` shims.
- The first TypeScript check read stale `.next/types` entries for an old route group; clearing the generated `.next` cache fixed the check.
- Phase 4 backend checks:
  - `python -m compileall backend\app` passed.
  - `python -m unittest discover backend\tests` passed.
  - FastAPI route registration check confirmed:
    - `POST /career-gps/roadmaps/generate`
    - `GET /career-gps/roadmaps/latest`
    - `GET /career-gps/roadmaps/{roadmap_id}`
  - Local SQLite smoke test passed for:
    - generating a roadmap
    - retrieving the latest roadmap
    - storing three route types
    - storing 36 score components, 12 per route
  - Local SQLite regeneration smoke test passed:
    - first generation saved version `1`
    - second generation saved version `2`
    - both version snapshots remained in `roadmap_versions`
- Phase 5 frontend checks:
  - `npm run lint` passed.
  - `npx tsc --noEmit` passed.
  - `npm run build` passed.
- Cleanup after Phase 5:
  - Removed the old static `SkillRoadmapModule` and modal from the employee dashboard.
  - Removed dead demo roadmap imports, transforms, and navigation anchor.
  - Re-ran `npm run lint`, `npx tsc --noEmit`, and `npm run build`; all passed.
- Phase 6 checks:
  - `python -m compileall backend\app` passed.
  - `python -m unittest discover backend\tests` passed.
  - FastAPI route registration check confirmed:
    - `POST /career-gps/roadmaps/what-if/preview`
    - `POST /career-gps/roadmaps/what-if/apply`
  - Local SQLite smoke test passed using a temporary database:
    - employee signup
    - Career North Star goal save
    - lifestyle priorities save
    - active roadmap generation at version `1`
    - what-if preview at version `2` without changing the active latest roadmap
    - what-if apply saved version `2`
    - latest roadmap returned version `2` after apply
  - `npm run lint` passed.
  - `npx tsc --noEmit` passed.
  - `npm run build` passed.
- Phase 7 checks:
  - `python -m compileall backend\app` passed.
  - `python -m unittest discover backend\tests` passed.
  - FastAPI route registration check confirmed:
    - `GET /career-gps/career-buddy/conversations`
    - `POST /career-gps/career-buddy/conversations`
    - `GET /career-gps/career-buddy/conversations/{conversation_id}`
    - `POST /career-gps/career-buddy/messages`
  - Local SQLite smoke test passed using a temporary database with `SIMPLOY_CAREER_BUDDY_AI_PROVIDER=template`:
    - employee signup
    - Career North Star goal save
    - lifestyle priorities save
    - no-management constraint save
    - active roadmap generation
    - empty Career Buddy conversation list
    - first Career Buddy message created a conversation and stored user/assistant messages
    - template fallback provider returned structured response with recommended actions
    - conversation detail returned two messages after first send
    - follow-up message appended two more messages
  - `npm run lint` passed.
  - `npx tsc --noEmit` passed.
  - `npm run build` passed.

## Known Limitations

- No live Supabase project was queried; the database audit is based on repository SQL and backend data access code.
- `backend/migrations/001_career_gps_foundation.sql` and `backend/migrations/002_career_gps_rls.sql` are additive migration files; there is still no migration runner such as Alembic.
- Some frontend RIASEC avatar strings appear mojibake-encoded in the source; this was observed but not changed in Phase 0.
- The new Career GPS roadmap frontend is wired to the generated roadmap endpoints.
- Local SQLite fallback now supports the Phase 2 Career GPS profile APIs, but Supabase production still requires migrations `001` through `004`.
- The deterministic score-generation API is consumed by the Career GPS roadmap frontend and what-if simulator.
- Seed occupations, skills, and transitions are illustrative prototype data, not verified labor-market data.
- Career constraints are replaced as a list on update; partial constraint patching is not implemented.
- Career North Star completion is a simple backend completeness check, not a score.
- The Phase 3 current situation step is read-only and reflects the existing employee profile fields.
- The Phase 3 profile completion indicator is setup completeness, not route readiness or employability scoring.
- Constraint values are saved with an empty structured value object from the frontend; this phase only captures type, label, and blocking status.
- The Career North Star UI is mounted in the existing employee dashboard/settings area; there is no separate employee settings route yet.
- Phase 4 scoring is deterministic and explainable but still prototype-quality; market opportunity and income potential use illustrative heuristics, not verified labor-market or salary data.
- Phase 4 hard-constraint filtering supports clear management and explicit no-fast-track labels, but does not parse arbitrary natural language deeply.
- Skill gaps are stored in roadmap version snapshots and milestone focus fields, not in a dedicated skill-gap table.
- Route-level total scores and explanations are stored in the version snapshot and route summary fields; individual score components are stored in `roadmap_score_components`.
- Phase 4 does not implement milestone/action completion or progress updates.
- Phase 5 progress controls are local UI state only; they reset on refresh because no backend progress-update endpoint exists yet.
- Phase 5 milestone-detail fields such as certifications and suggested projects are derived from the deterministic roadmap payload and conservative fallback text, not verified credential recommendations.
- Phase 6 what-if previews require an existing active roadmap because comparison is against the current recommended route.
- Phase 6 scenarios are recomputed from the submitted scenario payload when applied; previews are not stored as drafts.
- Phase 6 scenario transformations are deterministic prototype rules over existing goals, lifestyle priorities, constraints, and illustrative occupation seed data.
- Applying a Phase 6 scenario saves the generated roadmap as the next version; it does not overwrite the employee's saved Career North Star goals, lifestyle priorities, or constraints.
- Some scenarios may change only scores rather than route targets because the current occupation reference set is intentionally small and illustrative.
- The master's degree scenario uses temporary illustrative analytics/research evidence for scoring; it does not verify an actual credential.
- Applied scenarios save a new roadmap version but do not persist the scenario name as a separate scenario record beyond the roadmap version change summary.
- Phase 7 Career Buddy requires an existing stored roadmap.
- Phase 7 AI integration is optional; without backend provider configuration it uses deterministic template responses.
- Phase 7 OpenAI provider support was implemented behind backend environment variables, but no live AI provider call was executed in this environment.
- Career Buddy validates structured responses and falls back from invalid output, but it is still prototype-quality and not a substitute for professional career advice.
- Career Buddy does not use external market or salary APIs and must not present illustrative route data as verified labor-market data.
- Career Buddy conversations can be listed and retrieved, but there is no rename/archive/delete UI yet.
- Basic rate protection is per employee over the last hour and is intentionally simple for the hackathon prototype.

## Clear Instructions For The Next Phase

1. Read this document before editing code.
2. For the next phase, build only the requested progress persistence, saved-scenario layer, personalization layer, AI refinement, or conversation-management layer; do not implement unrelated surfaces.
3. Reuse existing auth, API, prediction, profile, dashboard, marketplace, and styling conventions.
4. Keep service-role Supabase access on the backend only.
5. Do not create duplicate skills, roadmap, marketplace, or prediction surfaces.
6. Keep illustrative data labelled as illustrative.
7. Do not let AI replace deterministic scoring or invent market/salary facts.
8. The next phase should not duplicate the Career GPS roadmap frontend, what-if simulator, Career Buddy, or deterministic route engine.
