-- CollabTracker Supabase Schema Migration
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =========================================
-- Profiles table (extends auth.users)
-- =========================================
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text unique not null,
  role text not null default 'collaborator' check (role in ('admin', 'collaborator')),
  avatar_url text default '',
  active boolean default true,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Profiles are viewable by authenticated users"
  on profiles for select
  to authenticated
  using (true);

create policy "Users can update their own profile"
  on profiles for update
  to authenticated
  using (auth.uid() = id);

-- =========================================
-- Projects table
-- =========================================
create table projects (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text default '',
  color text default '#6EE7B7',
  created_by uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now()
);

alter table projects enable row level security;

create policy "Projects are viewable by authenticated users"
  on projects for select
  to authenticated
  using (true);

create policy "Authenticated users can create projects"
  on projects for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update projects"
  on projects for update
  to authenticated
  using (true);

create policy "Authenticated users can delete projects"
  on projects for delete
  to authenticated
  using (true);

-- =========================================
-- Tasks table
-- =========================================
create table tasks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text default '',
  assigned_to uuid[] default '{}',
  tags text[] default '{}',
  status text not null default 'todo' check (status in ('todo', 'in-progress', 'blocked', 'review', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  estimated_hours numeric default 0,
  deadline timestamptz,
  created_by uuid references profiles(id) on delete cascade not null,
  archived boolean default false,
  project_id uuid references projects(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table tasks enable row level security;

create policy "Tasks are viewable by authenticated users"
  on tasks for select
  to authenticated
  using (true);

create policy "Authenticated users can create tasks"
  on tasks for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update tasks"
  on tasks for update
  to authenticated
  using (true);

create policy "Authenticated users can delete tasks"
  on tasks for delete
  to authenticated
  using (true);

-- =========================================
-- Project tasks join table
-- =========================================
create table project_tasks (
  project_id uuid references projects(id) on delete cascade not null,
  task_id uuid references tasks(id) on delete cascade not null,
  primary key (project_id, task_id)
);

alter table project_tasks enable row level security;

create policy "Project tasks are viewable by authenticated users"
  on project_tasks for select
  to authenticated
  using (true);

-- =========================================
-- Comments table
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

create policy "Comments are viewable by authenticated users"
  on comments for select
  to authenticated
  using (true);

create policy "Authenticated users can create comments"
  on comments for insert
  to authenticated
  with check (true);

create policy "Users can update their own comments"
  on comments for update
  to authenticated
  using (true);

create policy "Users can delete their own comments"
  on comments for delete
  to authenticated
  using (true);

-- =========================================
-- Notifications table
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

create policy "Users can view their own notifications"
  on notifications for select
  to authenticated
  using (true);

create policy "Authenticated users can create notifications"
  on notifications for insert
  to authenticated
  with check (true);

create policy "Users can update their own notifications"
  on notifications for update
  to authenticated
  using (true);

-- =========================================
-- Progress logs table
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

create policy "Progress logs are viewable by authenticated users"
  on progress_logs for select
  to authenticated
  using (true);

create policy "Authenticated users can create progress logs"
  on progress_logs for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update progress logs"
  on progress_logs for update
  to authenticated
  using (true);

-- =========================================
-- Activities table
-- =========================================
create table activities (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  user_name text not null,
  action text not null,
  target_type text not null check (target_type in ('task', 'progress', 'user')),
  target_id text not null,
  created_at timestamptz default now()
);

alter table activities enable row level security;

create policy "Activities are viewable by authenticated users"
  on activities for select
  to authenticated
  using (true);

create policy "Authenticated users can create activities"
  on activities for insert
  to authenticated
  with check (true);

-- =========================================
-- Task dependencies table
-- =========================================
create table task_dependencies (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid references tasks(id) on delete cascade not null,
  depends_on_task_id uuid references tasks(id) on delete cascade not null,
  type text not null check (type in ('blocks', 'required_by')),
  created_at timestamptz default now()
);

alter table task_dependencies enable row level security;

create policy "Task dependencies are viewable by authenticated users"
  on task_dependencies for select
  to authenticated
  using (true);

create policy "Authenticated users can create task dependencies"
  on task_dependencies for insert
  to authenticated
  with check (true);

create policy "Authenticated users can delete task dependencies"
  on task_dependencies for delete
  to authenticated
  using (true);

-- =========================================
-- Task templates table
-- =========================================
create table task_templates (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  title text not null,
  description text default '',
  tags text[] default '{}',
  priority text default 'medium' check (priority in ('low', 'medium', 'high')),
  estimated_hours numeric default 0,
  created_by uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now()
);

alter table task_templates enable row level security;

create policy "Task templates are viewable by authenticated users"
  on task_templates for select
  to authenticated
  using (true);

create policy "Authenticated users can create task templates"
  on task_templates for insert
  to authenticated
  with check (true);

create policy "Authenticated users can delete task templates"
  on task_templates for delete
  to authenticated
  using (true);

-- =========================================
-- Indexes for performance
-- =========================================
create index idx_tasks_assigned_to on tasks using gin (assigned_to);
create index idx_tasks_status on tasks (status);
create index idx_tasks_created_by on tasks (created_by);
create index idx_tasks_project_id on tasks (project_id);
create index idx_tasks_archived on tasks (archived);
create index idx_comments_task_id on comments (task_id);
create index idx_notifications_user_id on notifications (user_id);
create index idx_progress_logs_task_id on progress_logs (task_id);
create index idx_activities_target on activities (target_type, target_id);
create index idx_activities_user_id on activities (user_id);
create index idx_task_dependencies_task_id on task_dependencies (task_id);
create index idx_task_dependencies_depends_on on task_dependencies (depends_on_task_id);
create index idx_project_tasks_project on project_tasks (project_id);
create index idx_project_tasks_task on project_tasks (task_id);

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

create trigger tasks_updated_at
  before update on tasks
  for each row
  execute function update_updated_at();

create trigger comments_updated_at
  before update on comments
  for each row
  execute function update_updated_at();