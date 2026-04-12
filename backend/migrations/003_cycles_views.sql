-- CollabTracker → Linear Transform: Phase 3 Migration
-- Run this AFTER 002_linear_transform.sql

-- =========================================
-- Cycles (sprints)
-- =========================================
create table cycles (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid references teams(id) on delete cascade not null,
  name text not null,
  number integer not null,
  start_date timestamptz not null,
  end_date timestamptz not null,
  status text not null default 'upcoming' check (status in ('upcoming', 'active', 'completed')),
  created_by uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table cycles enable row level security;
create policy "Cycles viewable by authenticated" on cycles for select to authenticated using (true);
create policy "Authenticated can manage cycles" on cycles for insert to authenticated with check (true);
create policy "Authenticated can update cycles" on cycles for update to authenticated using (true);
create policy "Authenticated can delete cycles" on cycles for delete to authenticated using (true);

create trigger cycles_updated_at
  before update on cycles
  for each row
  execute function update_updated_at();

-- Add FK from tasks to cycles
alter table tasks add constraint tasks_cycle_id_fkey
  foreign key (cycle_id) references cycles(id) on delete set null;

-- =========================================
-- Custom views
-- =========================================
create table custom_views (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text default '',
  icon text default 'filter',
  filters jsonb not null default '{}',
  sort_by text default 'created_at',
  sort_order text default 'desc',
  group_by text,
  layout text default 'list' check (layout in ('list', 'board')),
  user_id uuid references profiles(id) on delete cascade not null,
  team_id uuid references teams(id) on delete set null,
  is_favorite boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table custom_views enable row level security;
create policy "Views viewable by owner" on custom_views for select to authenticated using (user_id = auth.uid());
create policy "Users can create views" on custom_views for insert to authenticated with check (true);
create policy "Users can update own views" on custom_views for update to authenticated using (user_id = auth.uid());
create policy "Users can delete own views" on custom_views for delete to authenticated using (user_id = auth.uid());

create trigger custom_views_updated_at
  before update on custom_views
  for each row
  execute function update_updated_at();

-- =========================================
-- Favorites
-- =========================================
create table favorites (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  target_type text not null check (target_type in ('view', 'project', 'cycle', 'issue')),
  target_id uuid not null,
  sort_order integer default 0,
  created_at timestamptz default now(),
  unique(user_id, target_type, target_id)
);

alter table favorites enable row level security;
create policy "Favorites viewable by owner" on favorites for select to authenticated using (user_id = auth.uid());
create policy "Users can create favorites" on favorites for insert to authenticated with check (true);
create policy "Users can delete favorites" on favorites for delete to authenticated using (user_id = auth.uid());

-- =========================================
-- Indexes
-- =========================================
create index if not exists idx_cycles_team_id on cycles (team_id);
create index if not exists idx_cycles_status on cycles (status);
create index if not exists idx_tasks_cycle_id on tasks (cycle_id);
create index if not exists idx_custom_views_user_id on custom_views (user_id);
create index if not exists idx_favorites_user_id on favorites (user_id);
