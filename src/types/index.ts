export type UserRole = 'admin' | 'collaborator';

export type TaskStatus = 'todo' | 'in-progress' | 'blocked' | 'review' | 'done';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  active: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string[];
  tags: string[];
  status: TaskStatus;
  priority: TaskPriority;
  estimatedHours: number;
  deadline: string;
  createdBy: string;
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
  targetType: 'task' | 'progress' | 'user';
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
  parentId?: string; // For nested replies
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
  createdBy: string;
  createdAt: string;
  taskIds: string[];
}

export interface TaskDependency {
  id: string;
  taskId: string;
  dependsOnTaskId: string;
  type: 'blocks' | 'required_by';
}
