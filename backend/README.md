# Simploy Backend

FastAPI backend foundation for Simploy. It includes auth, profile storage, jobs, applications, prediction scoring, and persisted workforce simulations.

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

## Production database direction

Use Supabase for production auth and app data.

1. Create a Supabase project.
2. Open Supabase SQL Editor and run `backend/supabase_schema.sql`.
3. In Supabase, copy Project URL, anon public key, and service role key.
4. Set these environment variables on the hosted FastAPI backend:

```bash
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SIMPLOY_CORS_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000
```

When all three Supabase variables are present, the API uses Supabase Auth and Supabase tables. Without them, it falls back to local SQLite for development.

Set this environment variable on Vercel for the frontend:

```bash
NEXT_PUBLIC_API_URL=https://your-hosted-backend.example.com
```

Do not put `SUPABASE_SERVICE_ROLE_KEY` in Vercel frontend environment variables. It belongs only on the backend.

## Future production additions

Recommended production additions:

- SQLAlchemy or SQLModel
- Alembic migrations
- strong `SIMPLOY_JWT_SECRET` for local SQLite mode
- HTTPS-only cookies or stricter bearer-token handling
- background model training jobs
