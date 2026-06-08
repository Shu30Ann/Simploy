# Simploy

AI-Powered Workforce Intelligence & Career OS

## Overview

Simploy helps employers, universities, and candidates understand future workforce trends through AI-powered simulations, skill gap analysis, and workforce resilience planning.

This repository now includes a minimal FastAPI backend prototype for Layer 2 and Layer 3:

- Layer 2: workforce simulation API
- Layer 3: actionable recommendation API

Layer 1 is intentionally excluded for this prototype.

## Features

- Workforce Simulation
- Skill Demand Shift Detection
- Automation Risk Estimation
- Actionable Hiring, Retraining, Automation, and Outsourcing Recommendations

## Backend Prototype

The new backend lives in `backend/` and includes:

- `backend/main.py`: FastAPI application with the demo endpoints
- `backend/models.py`: request/response schema definitions
- `backend/simulation.py`: rule-based dummy logic for simulation and recommendations
- `backend/requirements.txt`: FastAPI dependencies

## API Endpoints

1. `POST /workforce-simulation`
   - Input: `company`, `department`, `time_horizon`
   - Output: predicted workforce changes, skill demand shifts, and automation risk

2. `POST /insights`
   - Input: `simulation` results from Layer 2
   - Output: actionable recommendations such as hiring, retraining, automation, or outsourcing

## Run the prototype

1. Open a terminal in `backend/`
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the service:
   ```bash
   uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
   ```

## Example requests

```bash
curl -X POST http://127.0.0.1:8000/workforce-simulation \
  -H "Content-Type: application/json" \
  -d '{"company": "Simploy", "department": "Engineering", "time_horizon": 12}'
```

```bash
curl -X POST http://127.0.0.1:8000/insights \
  -H "Content-Type: application/json" \
  -d '{"simulation": {"company": "Simploy", "department": "Engineering", "time_horizon": 12, "workforce_changes": [{"role": "Software Engineer", "current_headcount": 40, "predicted_headcount": 46, "change": 6}], "skill_demand_shifts": [{"skill": "python", "demand_trend": "up", "importance_score": 75}], "automation_risk": [{"area": "testing", "risk_level": "medium", "explanation": "Testing is likely to see medium automation pressure over the next 12 months."}]}}'
```

## Future improvement ideas

- add real workforce datasets and persistent storage
- connect Layer 2 outputs to Layer 1 job/profile models
- replace the rule-based engine with ML forecasting
- add authentication, audit logs, and user roles
- build separate microservices for simulation and AI decision support

## Team

TalentBank Hackathon Project