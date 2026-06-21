# Simploy

AI-Powered Workforce Intelligence & Career OS

## Overview

Simploy helps employers, universities, and candidates understand future workforce trends through AI-powered simulations, skill gap analysis, and workforce resilience planning.

This repository includes a Next.js frontend, a FastAPI product backend, and a separate AI engine boundary:

- `frontend/`: Next.js user experience
- `backend/`: auth, profiles, jobs, applications, predictions, and persisted simulations
- `ai-engine/`: prediction service boundary and baseline model logic

The backend now has a local SQLite default for development and is structured so it can move to PostgreSQL for production.

## Features

- Workforce Simulation
- Skill Demand Shift Detection
- Automation Risk Estimation
- Actionable Hiring, Retraining, Automation, and Outsourcing Recommendations

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

## Future improvement ideas

- add real workforce datasets and persistent storage
- connect Layer 2 outputs to Layer 1 job/profile models
- replace the rule-based engine with ML forecasting
- add authentication, audit logs, and user roles
- build separate microservices for simulation and AI decision support

## Team

TalentBank Hackathon Project
