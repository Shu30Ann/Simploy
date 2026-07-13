-- Career GPS Phase 1: RLS policies.
-- Run this after 001_career_gps_foundation.sql has created the tables.

create or replace function public.is_employee_profile_owner(profile_id bigint)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.employee_profiles ep
    join public.users u on u.id = ep.user_id
    where ep.id = profile_id
      and u.supabase_user_id = auth.uid()
  );
$$;

create or replace function public.is_roadmap_owner(roadmap_id bigint)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.career_roadmaps cr
    where cr.id = roadmap_id
      and public.is_employee_profile_owner(cr.employee_profile_id)
  );
$$;

create or replace function public.is_route_owner(route_id bigint)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.career_routes career_route
    where career_route.id = route_id
      and public.is_roadmap_owner(career_route.roadmap_id)
  );
$$;

create or replace function public.is_milestone_owner(milestone_id bigint)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.roadmap_milestones milestone
    where milestone.id = milestone_id
      and public.is_route_owner(milestone.route_id)
  );
$$;

alter table public.occupations enable row level security;
alter table public.occupation_skills enable row level security;
alter table public.career_transitions enable row level security;
alter table public.career_north_star_settings enable row level security;
alter table public.career_preferences enable row level security;
alter table public.career_priority_weights enable row level security;
alter table public.career_constraints enable row level security;
alter table public.career_roadmaps enable row level security;
alter table public.career_routes enable row level security;
alter table public.roadmap_milestones enable row level security;
alter table public.milestone_actions enable row level security;
alter table public.roadmap_score_components enable row level security;
alter table public.roadmap_progress enable row level security;
alter table public.roadmap_versions enable row level security;

do $$
begin
  if to_regclass('public.occupations') is null then
    raise exception 'Run 001_career_gps_foundation.sql before this RLS migration';
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'occupations' and policyname = 'occupations_read_authenticated') then
    create policy occupations_read_authenticated on public.occupations for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'occupation_skills' and policyname = 'occupation_skills_read_authenticated') then
    create policy occupation_skills_read_authenticated on public.occupation_skills for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'career_transitions' and policyname = 'career_transitions_read_authenticated') then
    create policy career_transitions_read_authenticated on public.career_transitions for select to authenticated using (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'career_north_star_settings' and policyname = 'career_north_star_owner_all') then
    create policy career_north_star_owner_all on public.career_north_star_settings for all to authenticated
      using (public.is_employee_profile_owner(employee_profile_id))
      with check (public.is_employee_profile_owner(employee_profile_id));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'career_preferences' and policyname = 'career_preferences_owner_all') then
    create policy career_preferences_owner_all on public.career_preferences for all to authenticated
      using (public.is_employee_profile_owner(employee_profile_id))
      with check (public.is_employee_profile_owner(employee_profile_id));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'career_priority_weights' and policyname = 'career_priority_weights_owner_all') then
    create policy career_priority_weights_owner_all on public.career_priority_weights for all to authenticated
      using (public.is_employee_profile_owner(employee_profile_id))
      with check (public.is_employee_profile_owner(employee_profile_id));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'career_constraints' and policyname = 'career_constraints_owner_all') then
    create policy career_constraints_owner_all on public.career_constraints for all to authenticated
      using (public.is_employee_profile_owner(employee_profile_id))
      with check (public.is_employee_profile_owner(employee_profile_id));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'career_roadmaps' and policyname = 'career_roadmaps_owner_all') then
    create policy career_roadmaps_owner_all on public.career_roadmaps for all to authenticated
      using (public.is_employee_profile_owner(employee_profile_id))
      with check (public.is_employee_profile_owner(employee_profile_id));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'career_routes' and policyname = 'career_routes_owner_all') then
    create policy career_routes_owner_all on public.career_routes for all to authenticated
      using (public.is_roadmap_owner(roadmap_id))
      with check (public.is_roadmap_owner(roadmap_id));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'roadmap_milestones' and policyname = 'roadmap_milestones_owner_all') then
    create policy roadmap_milestones_owner_all on public.roadmap_milestones for all to authenticated
      using (public.is_route_owner(route_id))
      with check (public.is_route_owner(route_id));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'milestone_actions' and policyname = 'milestone_actions_owner_all') then
    create policy milestone_actions_owner_all on public.milestone_actions for all to authenticated
      using (public.is_milestone_owner(milestone_id))
      with check (public.is_milestone_owner(milestone_id));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'roadmap_score_components' and policyname = 'roadmap_score_components_owner_all') then
    create policy roadmap_score_components_owner_all on public.roadmap_score_components for all to authenticated
      using (public.is_roadmap_owner(roadmap_id))
      with check (public.is_roadmap_owner(roadmap_id));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'roadmap_progress' and policyname = 'roadmap_progress_owner_all') then
    create policy roadmap_progress_owner_all on public.roadmap_progress for all to authenticated
      using (public.is_employee_profile_owner(employee_profile_id) and public.is_roadmap_owner(roadmap_id))
      with check (public.is_employee_profile_owner(employee_profile_id) and public.is_roadmap_owner(roadmap_id));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'roadmap_versions' and policyname = 'roadmap_versions_owner_all') then
    create policy roadmap_versions_owner_all on public.roadmap_versions for all to authenticated
      using (public.is_roadmap_owner(roadmap_id))
      with check (
        public.is_roadmap_owner(roadmap_id)
        and (
          created_by_employee_profile_id is null
          or public.is_employee_profile_owner(created_by_employee_profile_id)
        )
      );
  end if;
end $$;

grant execute on function public.is_employee_profile_owner(bigint) to authenticated;
grant execute on function public.is_roadmap_owner(bigint) to authenticated;
grant execute on function public.is_route_owner(bigint) to authenticated;
grant execute on function public.is_milestone_owner(bigint) to authenticated;
