# Simploy ML Training Plan

Start with baseline scoring and store every prediction request/result. Train real models only after there is enough labeled data.

## Candidate/job matching

Training rows should include:

- candidate skills
- required job skills
- experience years
- required experience years
- application outcome
- interview outcome
- hire outcome

Recommended first model:

- `sklearn.ensemble.RandomForestClassifier` or `sklearn.linear_model.LogisticRegression`
- target: interview or hire likelihood
- output: calibrated match probability

## Workforce demand

Training rows should include:

- employer industry
- department
- role
- current headcount
- historical headcount
- attrition rate
- hiring budget
- growth target
- time horizon

Recommended first model:

- rule-based simulator as baseline
- then `RandomForestRegressor` or `GradientBoostingRegressor`
- target: projected role headcount

## Skill gap ranking

Training rows should include:

- employee skills
- target role skills
- completed learning items
- role applications
- successful transitions

Recommended first model:

- weighted skill overlap baseline
- then learning-to-rank once enough outcomes exist
