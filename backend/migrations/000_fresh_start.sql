-- COMPLETE WIPE AND REBUILD
-- Run this in Supabase SQL Editor to start fresh with organization model
-- WARNING: This deletes ALL data

-- Drop all existing tables (order matters for FKs)
drop table if exists favorites cascade;
drop table if exists custom_views cascade;
drop table if exists cycles cascade;
drop table if exists issue_labels cascade;
drop table if exists labels cascade;
drop table if exists team_counters cascade;
drop table if exists team_members cascade;
drop table if exists teams cascade;
drop table if exists task_dependencies cascade;
drop table if exists task_templates cascade;
drop table if exists activities cascade;
drop table if exists progress_logs cascade;
drop table if exists notifications cascade;
drop table if exists comments cascade;
drop table if exists project_tasks cascade;
drop table if exists tasks cascade;
drop table if exists projects cascade;
drop table if exists profiles cascade;
drop table if exists organizations cascade;

-- Drop existing functions
drop function if exists update_updated_at() cascade;
drop function if exists next_issue_number(uuid) cascade;

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =========================================
-- Auto-update updated_at trigger
-- =========================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- =========================================
-- Organizations (new)
-- =========================================
create table organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  domain text unique not null,
  slug text unique not null default '',
  created_by uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table organizations enable row level security;
create policy "Organizations viewable by authenticated" on organizations for select to authenticated using (true);
create policy "Authenticated can create organizations" on organizations for insert to authenticated with check (true);
create policy "Authenticated can update organizations" on organizations for update to authenticated using (true);

create trigger organizations_updated_at before update on organizations for each row execute function update_updated_at();

-- =========================================
-- Profiles (extends auth.users)
-- =========================================
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text unique not null,
  role text not null default 'collaborator' check (role in ('admin', 'collaborator')),
  avatar_url text default '',
  active boolean default true,
  organization_id uuid references organizations(id) on delete set null,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
create policy "Profiles viewable by authenticated" on profiles for select to authenticated using (true);
create policy "Users can update own profile" on profiles for update to authenticated using (auth.uid() = id);

-- =========================================
-- Teams
-- =========================================
create table teams (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  identifier text unique not null check (identifier ~ '^[A-Z]{2,5}$'),
  description text default '',
  color text default '#6EE7B7',
  organization_id uuid references organizations(id) on delete cascade not null,
  created_by uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table teams enable row level security;
create policy "Teams viewable by authenticated" on teams for select to authenticated using (true);
create policy "Authenticated can create teams" on teams for insert to authenticated with check (true);
create policy "Authenticated can update teams" on teams for update to authenticated using (true);
create policy "Authenticated can delete teams" on teams for delete to authenticated using (true);

create trigger teams_updated_at before update on teams for each row execute function update_updated_at();

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
-- Labels
-- =========================================
create table labels (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  color text not null default '#6B7280',
  group_name text,
  organization_id uuid references organizations(id) on delete cascade,
  created_at timestamptz default now()
);

alter table labels enable row level security;
create policy "Labels viewable by authenticated" on labels for select to authenticated using (true);
create policy "Authenticated can create labels" on labels for insert to authenticated with check (true);
create policy "Authenticated can update labels" on labels for update to authenticated using (true);
create policy "Authenticated can delete labels" on labels for delete to authenticated using (true);

-- =========================================
-- Projects
-- =========================================
create table projects (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text default '',
  color text default '#6EE7B7',
  icon text,
  status text default 'planned' check (status in ('backlog', 'planned', 'in_progress', 'paused', 'completed', 'cancelled')),
  team_id uuid references teams(id) on delete set null,
  lead_id uuid references profiles(id) on delete set null,
  start_date timestamptz,
  target_date timestamptz,
  organization_id uuid references organizations(id) on delete cascade not null,
  created_by uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now()
);

alter table projects enable row level security;
create policy "Projects viewable by authenticated" on projects for select to authenticated using (true);
create policy "Authenticated can create projects" on projects for insert to authenticated with check (true);
create policy "Authenticated can update projects" on projects for update to authenticated using (true);
create policy "Authenticated can delete projects" on projects for delete to authenticated using (true);

-- =========================================
-- Tasks
-- =========================================
create table tasks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text default '',
  assigned_to uuid[] default '{}',
  tags text[] default '{}',
  status text not null default 'backlog' check (status in ('backlog', 'todo', 'in_progress', 'done', 'cancelled')),
  priority text not null default 'none' check (priority in ('none', 'low', 'medium', 'high', 'urgent')),
  estimated_hours numeric default 0,
  deadline timestamptz,
  created_by uuid references profiles(id) on delete cascade not null,
  archived boolean default false,
  project_id uuid references projects(id) on delete set null,
  team_id uuid references teams(id) on delete set null,
  assignee_id uuid references profiles(id) on delete set null,
  issue_number integer,
  identifier text,
  estimate numeric,
  start_date timestamptz,
  cycle_id uuid,
  organization_id uuid references organizations(id) on delete cascade not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table tasks enable row level security;
create policy "Tasks viewable by authenticated" on tasks for select to authenticated using (true);
create policy "Authenticated can create tasks" on tasks for insert to authenticated with check (true);
create policy "Authenticated can update tasks" on tasks for update to authenticated using (true);
create policy "Authenticated can delete tasks" on tasks for delete to authenticated using (true);

create trigger tasks_updated_at before update on tasks for each row execute function update_updated_at();

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
-- Project tasks join table
-- =========================================
create table project_tasks (
  project_id uuid references projects(id) on delete cascade not null,
  task_id uuid references tasks(id) on delete cascade not null,
  primary key (project_id, task_id)
);

alter table project_tasks enable row level security;
create policy "Project tasks viewable by authenticated" on project_tasks for select to authenticated using (true);

-- =========================================
-- Comments
-- =========================================
create table comments (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid references tasks(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  user_name text not null,
  content text not null,
  parent_id uuid references comments(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table comments enable row level security;
create policy "Comments viewable by authenticated" on comments for select to authenticated using (true);
create policy "Authenticated can create comments" on comments for insert to authenticated with check (true);
create policy "Users can update own comments" on comments for update to authenticated using (true);
create policy "Users can delete own comments" on comments for delete to authenticated using (true);

create trigger comments_updated_at before update on comments for each row execute function update_updated_at();

-- =========================================
-- Notifications
-- =========================================
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  type text not null check (type in ('task_assigned', 'deadline_approaching', 'progress_submitted', 'progress_approved', 'progress_rejected')),
  message text not null,
  read boolean default false,
  payload jsonb default '{}',
  created_at timestamptz default now()
);

alter table notifications enable row level security;
create policy "Notifications viewable by authenticated" on notifications for select to authenticated using (true);
create policy "Authenticated can create notifications" on notifications for insert to authenticated with check (true);
create policy "Users can update own notifications" on notifications for update to authenticated using (true);

-- =========================================
-- Progress logs
-- =========================================
create table progress_logs (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid references tasks(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  date date not null default current_date,
  progress_text text not null,
  percentage_complete integer not null check (percentage_complete >= 0 and percentage_complete <= 100),
  hours_spent numeric not null default 0 check (hours_spent >= 0),
  attachments text[] default '{}',
  links text[] default '{}',
  feedback_status text not null default 'pending' check (feedback_status in ('pending', 'approved', 'rejected')),
  admin_feedback text default '',
  created_at timestamptz default now()
);

alter table progress_logs enable row level security;
create policy "Progress logs viewable by authenticated" on progress_logs for select to authenticated using (true);
create policy "Authenticated can create progress logs" on progress_logs for insert to authenticated with check (true);
create policy "Authenticated can update progress logs" on progress_logs for update to authenticated using (true);

-- =========================================
-- Activities
-- =========================================
create table activities (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  user_name text not null,
  action text not null,
  target_type text not null check (target_type in ('task', 'progress', 'user', 'project', 'cycle', 'label', 'organization')),
  target_id text not null,
  created_at timestamptz default now()
);

alter table activities enable row level security;
create policy "Activities viewable by authenticated" on activities for select to authenticated using (true);
create policy "Authenticated can create activities" on activities for insert to authenticated with check (true);

-- =========================================
-- Task dependencies
-- =========================================
create table task_dependencies (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid references tasks(id) on delete cascade not null,
  depends_on_task_id uuid references tasks(id) on delete cascade not null,
  type text not null check (type in ('blocks', 'blocked_by', 'related', 'duplicate')),
  created_at timestamptz default now()
);

alter table task_dependencies enable row level security;
create policy "Task deps viewable by authenticated" on task_dependencies for select to authenticated using (true);
create policy "Authenticated can create task deps" on task_dependencies for insert to authenticated with check (true);
create policy "Authenticated can delete task deps" on task_dependencies for delete to authenticated using (true);

-- =========================================
-- Task templates
-- =========================================
create table task_templates (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  title text not null,
  description text default '',
  tags text[] default '{}',
  priority text default 'none' check (priority in ('none', 'low', 'medium', 'high', 'urgent')),
  estimated_hours numeric default 0,
  organization_id uuid references organizations(id) on delete cascade,
  created_by uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now()
);

alter table task_templates enable row level security;
create policy "Templates viewable by authenticated" on task_templates for select to authenticated using (true);
create policy "Authenticated can create templates" on task_templates for insert to authenticated with check (true);
create policy "Authenticated can delete templates" on task_templates for delete to authenticated using (true);

-- =========================================
-- Cycles
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

alter table tasks add constraint tasks_cycle_id_fkey foreign key (cycle_id) references cycles(id) on delete set null;

create trigger cycles_updated_at before update on cycles for each row execute function update_updated_at();

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

create trigger custom_views_updated_at before update on custom_views for each row execute function update_updated_at();

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
-- Auto-increment counters per team
-- =========================================
create table team_counters (
  team_id uuid references teams(id) on delete cascade primary key,
  next_issue_number integer not null default 1
);

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
-- Indexes
-- =========================================
create index idx_organizations_domain on organizations (domain);
create index idx_profiles_organization_id on profiles (organization_id);
create index idx_teams_organization_id on teams (organization_id);
create index idx_tasks_organization_id on tasks (organization_id);
create index idx_tasks_team_id on tasks (team_id);
create index idx_tasks_assignee_id on tasks (assignee_id);
create index idx_tasks_identifier on tasks (identifier);
create index idx_tasks_status on tasks (status);
create index idx_tasks_created_by on tasks (created_by);
create index idx_tasks_project_id on tasks (project_id);
create index idx_tasks_archived on tasks (archived);
create index idx_labels_organization_id on labels (organization_id);
create index idx_comments_task_id on comments (task_id);
create index idx_notifications_user_id on notifications (user_id);
create index idx_progress_logs_task_id on progress_logs (task_id);
create index idx_activities_target on activities (target_type, target_id);
create index idx_activities_user_id on activities (user_id);
create index idx_task_dependencies_task_id on task_dependencies (task_id);
create index idx_task_dependencies_depends_on on task_dependencies (depends_on_task_id);
create index idx_project_tasks_project on project_tasks (project_id);
create index idx_project_tasks_task on project_tasks (task_id);
create index idx_team_members_user_id on team_members (user_id);
create index idx_issue_labels_label_id on issue_labels (label_id);
create index idx_cycles_team_id on cycles (team_id);
create index idx_cycles_status on cycles (status);
create index idx_tasks_cycle_id on tasks (cycle_id);
create index idx_custom_views_user_id on custom_views (user_id);
create index idx_favorites_user_id on favorites (user_id);
create index idx_tasks_assigned_to on tasks using gin (assigned_to);
