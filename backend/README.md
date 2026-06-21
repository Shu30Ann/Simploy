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

Use PostgreSQL for production. The current repository layer keeps SQL isolated so the app can move from SQLite to PostgreSQL cleanly when deployment starts.

Recommended production additions:

- SQLAlchemy or SQLModel
- Alembic migrations
- managed PostgreSQL
- strong `SIMPLOY_JWT_SECRET`
- HTTPS-only cookies or stricter bearer-token handling
- background model training jobs
