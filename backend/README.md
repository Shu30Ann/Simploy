# Simploy Backend

FastAPI backend foundation for Simploy. It includes auth, profile storage, jobs, applications, prediction scoring, and persisted workforce simulations.
It also includes the Career GPS APIs, deterministic roadmap generation, What-If Career Simulator, and backend-only Career Buddy fallback/AI abstraction.

## Local run

```bash
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

The local default database is SQLite at `backend/simploy.db`. Set `SIMPLOY_DATABASE_PATH` to change it.

## Main endpoints

- `POST /auth/signup`
- `POST /auth/login`
- `GET /auth/me`
- `GET /employees/me`
- `PUT /employees/me`
- `GET /employers/me`
- `PUT /employers/me`
- `POST /jobs`
- `GET /jobs`
- `POST /jobs/{job_id}/apply`
- `POST /simulations/preview`
- `POST /simulations`
- `GET /simulations`
- `GET /simulations/{simulation_id}/actions`
- `POST /predictions/job-match`
- `POST /predictions/skill-gap`
- `GET /career-gps/profile`
- `PUT /career-gps/goals`
- `PUT /career-gps/lifestyle-priorities`
- `PUT /career-gps/constraints`
- `POST /career-gps/roadmaps/generate`
- `GET /career-gps/roadmaps/latest`
- `POST /career-gps/roadmaps/what-if/preview`
- `POST /career-gps/roadmaps/what-if/apply`
- `GET /career-gps/career-buddy/conversations`
- `POST /career-gps/career-buddy/messages`

## Production database direction

Use Supabase for production auth and app data.

1. Create a Supabase project.
2. Open Supabase SQL Editor and run `backend/supabase_schema.sql`.
3. Run the additive Career GPS migrations in order:
   - `backend/migrations/001_career_gps_foundation.sql`
   - `backend/migrations/002_career_gps_rls.sql`
   - `backend/migrations/003_career_gps_profile_api_fields.sql`
   - `backend/migrations/004_career_gps_profile_api_rls.sql`
   - `backend/migrations/005_career_buddy.sql`
   - `backend/migrations/006_selected_route_type.sql`
   - `backend/migrations/007_roadmap_progress_evidence.sql`
4. In Supabase, copy Project URL, anon public key, and service role key.
5. Set these environment variables on the hosted FastAPI backend:

```bash
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SIMPLOY_CORS_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000
SIMPLOY_CORS_ORIGIN_REGEX=https://.*\.vercel\.app|http://(localhost|127\.0\.0\.1):\d+
SIMPLOY_CAREER_BUDDY_AI_PROVIDER=auto
SIMPLOY_CAREER_BUDDY_MODEL=gemini-flash-latest
SIMPLOY_CAREER_BUDDY_RATE_LIMIT_PER_HOUR=20
SIMPLOY_CAREER_BUDDY_TIMEOUT_SECONDS=45
GEMINI_API_KEY=
```

When all three Supabase variables are present, the API uses Supabase Auth and Supabase tables. Without them, it falls back to local SQLite for development.

Career Buddy works without AI configuration by using deterministic template responses derived from the stored roadmap. To use Gemini, set `GEMINI_API_KEY` and `SIMPLOY_CAREER_BUDDY_MODEL` only on the Render backend. Do not configure a paid fallback model for the hackathon demo.

Set this environment variable on Vercel for the frontend:

```bash
NEXT_PUBLIC_API_URL=https://your-hosted-backend.example.com
```

Do not put `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, or other AI provider keys in Vercel frontend environment variables. They belong only on the backend.

## Future production additions

Recommended production additions:

- SQLAlchemy or SQLModel
- Alembic migrations
- strong `SIMPLOY_JWT_SECRET` for local SQLite mode
- HTTPS-only cookies or stricter bearer-token handling
- background model training jobs
