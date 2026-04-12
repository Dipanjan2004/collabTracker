export type UserRole = 'admin' | 'collaborator';

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'done' | 'cancelled';

export type TaskPriority = 'none' | 'low' | 'medium' | 'high' | 'urgent';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  organizationId?: string;
  createdAt: string;
  active: boolean;
}

export interface Organization {
  id: string;
  name: string;
  domain: string;
  slug: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  identifier: string;
  title: string;
  description: string;
  assigneeId: string | null;
  assignedTo: string[];
  teamId: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  estimate: number | null;
  startDate: string | null;
  deadline: string | null;
  projectId: string | null;
  cycleId: string | null;
  labels: Label[];
  tags: string[];
  estimatedHours: number;
  createdBy: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProgressLog {
  id: string;
  taskId: string;
  userId: string;
  date: string;
  progressText: string;
  percentageComplete: number;
  hoursSpent: number;
  attachments: string[];
  links?: string[];
  adminFeedback?: string;
  feedbackStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'task_assigned' | 'deadline_approaching' | 'progress_submitted' | 'progress_approved' | 'progress_rejected';
  message: string;
  read: boolean;
  payload?: Record<string, any>;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  userId: string;
  userName: string;
  action: string;
  targetType: 'task' | 'progress' | 'user' | 'project' | 'cycle' | 'label';
  targetId: string;
  createdAt: string;
}

export interface AnalyticsData {
  tasksCompleted: number;
  activeContributors: number;
  hoursThisWeek: number;
  weeklyHoursData: { date: string; hours: number }[];
  taskStatusDistribution: { status: string; count: number; collaborators: string[] }[];
  topContributors: { name: string; hours: number }[];
  overdueTasks: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  parentId?: string;
}

export interface TaskTemplate {
  id: string;
  name: string;
  title: string;
  description: string;
  tags: string[];
  priority: TaskPriority;
  estimatedHours: number;
  createdBy: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  status: 'backlog' | 'planned' | 'in_progress' | 'paused' | 'completed' | 'cancelled';
  teamId?: string;
  leadId?: string;
  startDate?: string;
  targetDate?: string;
  createdBy: string;
  createdAt: string;
  taskIds: string[];
}

export interface TaskDependency {
  id: string;
  taskId: string;
  dependsOnTaskId: string;
  type: 'blocks' | 'blocked_by' | 'related' | 'duplicate';
}

export interface Team {
  id: string;
  name: string;
  identifier: string;
  description: string;
  color: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  teamId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  createdAt: string;
  user?: User;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  groupName?: string;
  teamId?: string;
  createdAt: string;
}

export interface Cycle {
  id: string;
  teamId: string;
  name: string;
  number: number;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomView {
  id: string;
  name: string;
  description: string;
  icon: string;
  filters: Record<string, any>;
  sortBy: string;
  sortOrder: string;
  groupBy: string | null;
  layout: 'list' | 'board';
  teamId: string | null;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Favorite {
  id: string;
  targetType: 'view' | 'project' | 'cycle' | 'issue';
  targetId: string;
  sortOrder: number;
  createdAt: string;
}

export interface SearchResult {
  type: 'issue' | 'project' | 'user';
  id: string;
  title: string;
  identifier?: string;
}
