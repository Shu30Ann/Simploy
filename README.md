# Simploy

AI-Powered Workforce Intelligence & Career OS

## Overview

Simploy helps employers, universities, and candidates understand future workforce trends through AI-powered simulations, skill gap analysis, and workforce resilience planning.

This repository includes a Next.js frontend, a FastAPI product backend, and a separate AI engine boundary:

- `frontend/`: Next.js user experience
- `backend/`: auth, profiles, jobs, applications, predictions, persisted simulations, and Career GPS APIs
- `ai-engine/`: prediction service boundary and baseline model logic

The backend now has a local SQLite default for development and is structured so it can move to PostgreSQL for production.

## Features

- Workforce Simulation
- Skill Demand Shift Detection
- Automation Risk Estimation
- Actionable Hiring, Retraining, Automation, and Outsourcing Recommendations
- Employee Career GPS with Career North Star onboarding, deterministic roadmaps, What-If Career Simulator, and Career Buddy fallback chat

## Backend Prototype

The backend lives in `backend/` and includes:

- `backend/app/main.py`: FastAPI application factory and router wiring
- `backend/app/core`: config, database bootstrap, and security helpers
- `backend/app/routers`: API endpoints
- `backend/app/repositories`: persistence layer
- `backend/app/services`: business logic and prediction/simulation services
- `backend/requirements.txt`: FastAPI dependencies

## API Endpoints

Important endpoints:

- `POST /auth/signup`
- `POST /auth/login`
- `POST /jobs`
- `POST /jobs/{job_id}/apply`
- `POST /simulations/preview`
- `POST /simulations`
- `GET /simulations/{simulation_id}/actions`
- `POST /predictions/job-match`
- `POST /predictions/skill-gap`
- `GET /career-gps/profile`
- `POST /career-gps/roadmaps/generate`
- `POST /career-gps/roadmaps/what-if/preview`
- `POST /career-gps/roadmaps/what-if/apply`
- `POST /career-gps/career-buddy/messages`

## Run the prototype

1. Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
2. Start the backend:
   ```bash
   uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
   ```
3. Start the frontend:
   ```bash
   npm run dev
   ```

For Supabase-backed production, run `backend/supabase_schema.sql` first, then run migrations `backend/migrations/001_career_gps_foundation.sql` through `backend/migrations/005_career_buddy.sql` in order.

Career Buddy does not require a paid AI key for the hackathon demo. Leave `OPENAI_API_KEY` empty to use deterministic template responses. If you later enable an AI provider, set `OPENAI_API_KEY` only on the backend environment, never in frontend/Vercel public variables.

## Future improvement ideas

- add real workforce datasets and persistent storage
- connect Layer 2 outputs to Layer 1 job/profile models
- replace the rule-based engine with ML forecasting
- add authentication, audit logs, and user roles
- build separate microservices for simulation and AI decision support

## Team

TalentBank Hackathon Project
