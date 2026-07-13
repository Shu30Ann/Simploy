-- Non-destructive migration: persists the employee's active route choice for a saved Career GPS roadmap.

alter table public.career_roadmaps
  add column if not exists selected_route_type text not null default 'recommended'
  check (selected_route_type in ('recommended', 'accelerated', 'balanced'));

update public.career_roadmaps
set selected_route_type = 'recommended'
where selected_route_type is null;
