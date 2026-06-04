-- Habilitar RLS en todas las tablas (cada usuario solo ve sus datos)

create table public.workout_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now()
);
alter table public.workout_plans enable row level security;
create policy "Users manage own plans" on public.workout_plans
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.workout_days (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references public.workout_plans(id) on delete cascade not null,
  name text not null,
  position integer default 0
);
alter table public.workout_days enable row level security;
create policy "Users manage own days" on public.workout_days
  using (exists (select 1 from public.workout_plans p where p.id = plan_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.workout_plans p where p.id = plan_id and p.user_id = auth.uid()));

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  day_id uuid references public.workout_days(id) on delete cascade not null,
  name text not null,
  position integer default 0
);
alter table public.exercises enable row level security;
create policy "Users manage own exercises" on public.exercises
  using (exists (
    select 1 from public.workout_days wd
    join public.workout_plans p on p.id = wd.plan_id
    where wd.id = day_id and p.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.workout_days wd
    join public.workout_plans p on p.id = wd.plan_id
    where wd.id = day_id and p.user_id = auth.uid()
  ));

create table public.exercise_sets (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid references public.exercises(id) on delete cascade not null,
  reps integer not null default 10,
  weight numeric(6,2) not null default 0,
  position integer default 0
);
alter table public.exercise_sets enable row level security;
create policy "Users manage own sets" on public.exercise_sets
  using (exists (
    select 1 from public.exercises e
    join public.workout_days wd on wd.id = e.day_id
    join public.workout_plans p on p.id = wd.plan_id
    where e.id = exercise_id and p.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.exercises e
    join public.workout_days wd on wd.id = e.day_id
    join public.workout_plans p on p.id = wd.plan_id
    where e.id = exercise_id and p.user_id = auth.uid()
  ));

create table public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  plan_id uuid references public.workout_plans(id) on delete set null,
  day_id uuid references public.workout_days(id) on delete set null,
  logged_at timestamptz default now()
);
alter table public.workout_logs enable row level security;
create policy "Users manage own logs" on public.workout_logs
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.logged_sets (
  id uuid primary key default gen_random_uuid(),
  log_id uuid references public.workout_logs(id) on delete cascade not null,
  exercise_id uuid references public.exercises(id) on delete set null,
  exercise_name text not null,
  reps integer not null,
  weight numeric(6,2) not null,
  completed boolean default false
);
alter table public.logged_sets enable row level security;
create policy "Users manage own logged sets" on public.logged_sets
  using (exists (select 1 from public.workout_logs l where l.id = log_id and l.user_id = auth.uid()))
  with check (exists (select 1 from public.workout_logs l where l.id = log_id and l.user_id = auth.uid()));
