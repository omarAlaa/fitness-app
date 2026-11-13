-- Phase 2.3: private app profiles and per-user fitness goals.
-- Profile rows are created for current users and for every future Auth user.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  unit_system text not null default 'metric',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_length check (
    display_name is null or char_length(btrim(display_name)) between 1 and 80
  ),
  constraint profiles_unit_system_check check (unit_system in ('metric', 'imperial'))
);

create table public.fitness_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  target_value numeric,
  target_unit text,
  start_date date not null default current_date,
  target_date date,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fitness_goals_title_length check (char_length(btrim(title)) between 1 and 100),
  constraint fitness_goals_target_value_positive check (target_value is null or target_value > 0),
  constraint fitness_goals_target_value_unit_pair check (
    (target_value is null and target_unit is null)
    or (target_value is not null and target_unit is not null)
  ),
  constraint fitness_goals_target_unit_length check (
    target_unit is null or char_length(btrim(target_unit)) between 1 and 20
  ),
  constraint fitness_goals_target_date_check check (target_date is null or target_date >= start_date),
  constraint fitness_goals_status_check check (status in ('active', 'completed', 'paused', 'archived'))
);

create index fitness_goals_user_created_at_idx
  on public.fitness_goals (user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.fitness_goals enable row level security;

-- Keep table access private and grant only the operations the app needs.
revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;
grant insert (id) on table public.profiles to authenticated;
grant update (display_name, unit_system) on table public.profiles to authenticated;

revoke all on table public.fitness_goals from anon, authenticated;
grant select on table public.fitness_goals to authenticated;
grant insert (user_id, title, target_value, target_unit, start_date, target_date, status)
  on table public.fitness_goals to authenticated;
grant update (title, target_value, target_unit, start_date, target_date, status)
  on table public.fitness_goals to authenticated;
grant delete on table public.fitness_goals to authenticated;

create policy profiles_select_own
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy profiles_insert_own
  on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);

create policy profiles_update_own
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy fitness_goals_select_own
  on public.fitness_goals for select to authenticated
  using ((select auth.uid()) = user_id);

create policy fitness_goals_insert_own
  on public.fitness_goals for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy fitness_goals_update_own
  on public.fitness_goals for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy fitness_goals_delete_own
  on public.fitness_goals for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Trigger functions use no caller-controlled search path. Only the signup
-- function needs SECURITY DEFINER so it can insert when Auth creates a user.
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.set_updated_at() from public, anon, authenticated;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger fitness_goals_set_updated_at
  before update on public.fitness_goals
  for each row execute function public.set_updated_at();

create function public.create_profile_for_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.create_profile_for_auth_user() from public, anon, authenticated;

create trigger on_auth_user_created_create_profile
  after insert on auth.users
  for each row execute function public.create_profile_for_auth_user();

-- Backfill only the Auth ID. User-editable metadata is never used for ownership
-- or copied into the app profile.
insert into public.profiles (id)
select users.id
from auth.users as users
on conflict (id) do nothing;
