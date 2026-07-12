-- Career GPS Phase 2: RLS for onboarding progress.
-- Run this after 002_career_gps_rls.sql and 003_career_gps_profile_api_fields.sql.

alter table public.career_onboarding_progress enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'career_onboarding_progress'
      and policyname = 'career_onboarding_progress_owner_all'
  ) then
    create policy career_onboarding_progress_owner_all
      on public.career_onboarding_progress
      for all
      to authenticated
      using (public.is_employee_profile_owner(employee_profile_id))
      with check (public.is_employee_profile_owner(employee_profile_id));
  end if;
end $$;
