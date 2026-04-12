-- CollabTracker → Linear Transform: Phase 1 Migration
-- Run this in Supabase SQL Editor AFTER 001_initial_schema.sql

-- =========================================
-- Teams table
-- =========================================
create table teams (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  identifier text unique not null check (identifier ~ '^[A-Z]{2,5}$'),
  description text default '',
  color text default '#6EE7B7',
  created_by uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table teams enable row level security;
create policy "Teams viewable by authenticated" on teams for select to authenticated using (true);
create policy "Authenticated can create teams" on teams for insert to authenticated with check (true);
create policy "Authenticated can update teams" on teams for update to authenticated using (true);
create policy "Authenticated can delete teams" on teams for delete to authenticated using (true);

create trigger teams_updated_at
  before update on teams
  for each row
  execute function update_updated_at();

-- =========================================
-- Team members
-- =========================================
create table team_members (
  team_id uuid references teams(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  created_at timestamptz default now(),
  primary key (team_id, user_id)
);

alter table team_members enable row level security;
create policy "Team members viewable by authenticated" on team_members for select to authenticated using (true);
create policy "Authenticated can manage team members" on team_members for insert to authenticated with check (true);
create policy "Authenticated can update team members" on team_members for update to authenticated using (true);
create policy "Authenticated can remove team members" on team_members for delete to authenticated using (true);

-- =========================================
-- Labels (replaces tags text[])
-- =========================================
create table labels (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  color text not null default '#6B7280',
  group_name text,
  team_id uuid references teams(id) on delete cascade,
  created_at timestamptz default now()
);

alter table labels enable row level security;
create policy "Labels viewable by authenticated" on labels for select to authenticated using (true);
create policy "Authenticated can create labels" on labels for insert to authenticated with check (true);
create policy "Authenticated can update labels" on labels for update to authenticated using (true);
create policy "Authenticated can delete labels" on labels for delete to authenticated using (true);

-- =========================================
-- Issue-to-label junction
-- =========================================
create table issue_labels (
  issue_id uuid references tasks(id) on delete cascade not null,
  label_id uuid references labels(id) on delete cascade not null,
  primary key (issue_id, label_id)
);

alter table issue_labels enable row level security;
create policy "Issue labels viewable by authenticated" on issue_labels for select to authenticated using (true);
create policy "Authenticated can manage issue labels" on issue_labels for insert to authenticated with check (true);
create policy "Authenticated can remove issue labels" on issue_labels for delete to authenticated using (true);

-- =========================================
-- Auto-increment counters per team
-- =========================================
create table team_counters (
  team_id uuid references teams(id) on delete cascade primary key,
  next_issue_number integer not null default 1
);

-- =========================================
-- Atomic issue number function
-- =========================================
create or replace function next_issue_number(p_team_id uuid)
returns integer as $$
declare
  v_number integer;
begin
  update team_counters set next_issue_number = next_issue_number + 1
    where team_id = p_team_id
    returning next_issue_number - 1 into v_number;
  if v_number is null then
    insert into team_counters (team_id, next_issue_number) values (p_team_id, 2);
    v_number := 1;
  end if;
  return v_number;
end;
$$ language plpgsql;

-- =========================================
-- Alter tasks table
-- =========================================
alter table tasks add column if not exists team_id uuid references teams(id) on delete set null;
alter table tasks add column if not exists assignee_id uuid references profiles(id) on delete set null;
alter table tasks add column if not exists issue_number integer;
alter table tasks add column if not exists identifier text;
alter table tasks add column if not exists estimate numeric;
alter table tasks add column if not exists start_date timestamptz;
alter table tasks add column if not exists cycle_id uuid;

-- Migrate existing status values
update tasks set status = 'in_progress' where status in ('in-progress', 'review');
update tasks set status = 'todo' where status = 'blocked';

-- Drop old check constraint and add new
alter table tasks drop constraint if exists tasks_status_check;
alter table tasks add constraint tasks_status_check check (status in ('backlog', 'todo', 'in_progress', 'done', 'cancelled'));

-- Update priority enum
alter table tasks drop constraint if exists tasks_priority_check;
alter table tasks add constraint tasks_priority_check check (priority in ('none', 'low', 'medium', 'high', 'urgent'));

-- Set default priority for existing 'none' values
update tasks set priority = 'none' where priority is null;

-- =========================================
-- Alter projects table
-- =========================================
alter table projects add column if not exists team_id uuid references teams(id) on delete set null;
alter table projects add column if not exists status text default 'planned' check (status in ('backlog', 'planned', 'in_progress', 'paused', 'completed', 'cancelled'));
alter table projects add column if not exists lead_id uuid references profiles(id) on delete set null;
alter table projects add column if not exists start_date timestamptz;
alter table projects add column if not exists target_date timestamptz;
alter table projects add column if not exists icon text;

-- =========================================
-- Alter task_dependencies
-- =========================================
alter table task_dependencies drop constraint if exists task_dependencies_type_check;
alter table task_dependencies add constraint task_dependencies_type_check check (type in ('blocks', 'blocked_by', 'related', 'duplicate'));

-- =========================================
-- Alter activities
-- =========================================
alter table activities drop constraint if exists activities_target_type_check;
alter table activities add constraint activities_target_type_check check (target_type in ('task', 'progress', 'user', 'project', 'cycle', 'label'));

-- =========================================
-- Indexes
-- =========================================
create index if not exists idx_tasks_team_id on tasks (team_id);
create index if not exists idx_tasks_assignee_id on tasks (assignee_id);
create index if not exists idx_tasks_identifier on tasks (identifier);
create index if not exists idx_labels_team_id on labels (team_id);
create index if not exists idx_team_members_user_id on team_members (user_id);
create index if not exists idx_issue_labels_label_id on issue_labels (label_id);
