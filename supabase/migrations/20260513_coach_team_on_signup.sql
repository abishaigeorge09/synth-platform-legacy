-- Extend handle_new_auth_user so a real coach signup also gets a team.
--
-- Behaviour by case:
--   1. Anonymous sign-in (demo) → unchanged. Existing logic pins the
--      user to the shared demo team UUID.
--   2. Real signup, role='head_coach', user_metadata.team_name set →
--      create a new public.teams row (auto invite_code), link
--      users.team_id to it.
--   3. Real signup, role='head_coach', no team_name → create a default
--      team using the user's name ("Alex's team") so the coach lands
--      somewhere they own. They can rename later via settings.
--   4. Real signup, role!='head_coach' (athlete) → unchanged. They'll
--      get a team_id when they redeem an invite code.

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $function$
declare
  demo_team_id uuid := 'da7025df-4c74-4b48-bd86-89e0e0a8f34e';
  meta jsonb;
  resolved_role text;
  resolved_name text;
  resolved_team_name text;
  resolved_sport text;
  new_team_id uuid;
  new_invite_code text;
begin
  if new.is_anonymous then
    insert into public.users (id, email, name, role, team_id)
    values (
      new.id,
      'demo-' || new.id || '@synth.local',
      'Demo Coach',
      'head_coach',
      demo_team_id
    )
    on conflict (id) do nothing;
    return new;
  end if;

  meta := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  resolved_role := coalesce(meta ->> 'role', 'athlete');
  resolved_name := coalesce(
    nullif(meta ->> 'full_name', ''),
    nullif(meta ->> 'name', ''),
    split_part(coalesce(new.email, ''), '@', 1)
  );
  resolved_team_name := nullif(meta ->> 'team_name', '');
  resolved_sport := coalesce(nullif(meta ->> 'sport', ''), 'rowing');

  if resolved_role = 'head_coach' then
    new_invite_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
    insert into public.teams (name, sport, invite_code)
    values (
      coalesce(resolved_team_name, resolved_name || '''s team'),
      resolved_sport,
      new_invite_code
    )
    returning id into new_team_id;

    insert into public.users (id, email, name, role, team_id)
    values (
      new.id,
      coalesce(new.email, ''),
      resolved_name,
      'head_coach',
      new_team_id
    )
    on conflict (id) do update
      set team_id = coalesce(public.users.team_id, excluded.team_id);
    return new;
  end if;

  insert into public.users (id, email, name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    resolved_name,
    resolved_role
  )
  on conflict (id) do nothing;
  return new;
end;
$function$;

alter table public.teams enable row level security;

drop policy if exists "teams own select" on public.teams;
create policy "teams own select"
  on public.teams
  for select
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.team_id = teams.id
    )
  );

drop policy if exists "teams coach update" on public.teams;
create policy "teams coach update"
  on public.teams
  for update
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid()
        and u.team_id = teams.id
        and u.role = 'head_coach'
    )
  );

alter table public.users enable row level security;

drop policy if exists "users own select" on public.users;
create policy "users own select"
  on public.users
  for select
  using (id = auth.uid());

drop policy if exists "users own update" on public.users;
create policy "users own update"
  on public.users
  for update
  using (id = auth.uid());
