import {
  User, Task, ProgressLog, Notification, ActivityItem, AuthResponse, AnalyticsData, Comment, TaskTemplate, Project, TaskDependency, Team, TeamMember, Label, Cycle, CustomView, Favorite, SearchResult
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
};

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse & { organization?: any }> => {
    const response = await apiRequest<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('current_user', JSON.stringify(response.user));
    }
    return response;
  },

  register: async (name: string, email: string, password: string, organizationName?: string): Promise<any> => {
    const response = await apiRequest<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, organizationName }),
    });
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('current_user', JSON.stringify(response.user));
    }
    return response;
  },

  getCurrentUser: (): User | null => {
    const userData = localStorage.getItem('current_user');
    return userData ? JSON.parse(userData) : null;
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    localStorage.removeItem('current_organization');
  },

  checkDomain: async (email: string): Promise<{ domain: string; hasOrganization: boolean; organization?: any }> => {
    return apiRequest(`/auth/check-domain?email=${encodeURIComponent(email)}`);
  },
};

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    return apiRequest<User[]>('/users');
  },

  invite: async (email: string, role: 'admin' | 'collaborator'): Promise<{ success: boolean }> => {
    return apiRequest<{ success: boolean }>('/users/invite', {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
  },

  remove: async (userId: string): Promise<void> => {
    await apiRequest(`/users/${userId}`, { method: 'DELETE' });
  },
};

export const tasksApi = {
  getAll: async (filters?: {
    assignedTo?: string;
    assigneeId?: string;
    status?: string;
    tags?: string[];
    search?: string;
    archived?: boolean;
    projectId?: string;
    teamId?: string;
    cycleId?: string;
  }): Promise<Task[]> => {
    const params = new URLSearchParams();
    if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo);
    if (filters?.assigneeId) params.append('assigneeId', filters.assigneeId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.tags) {
      filters.tags.forEach(tag => params.append('tags', tag));
    }
    if (filters?.search) params.append('search', filters.search);
    if (filters?.archived !== undefined) params.append('archived', String(filters.archived));
    if (filters?.projectId) params.append('projectId', filters.projectId);
    if (filters?.teamId) params.append('teamId', filters.teamId);
    if (filters?.cycleId) params.append('cycleId', filters.cycleId);

    const query = params.toString();
    return apiRequest<Task[]>(`/tasks${query ? `?${query}` : ''}`);
  },

  getById: async (id: string): Promise<Task | null> => {
    try {
      return await apiRequest<Task>(`/tasks/${id}`);
    } catch {
      return null;
    }
  },

  create: async (taskData: Partial<Task> & { title: string; labelIds?: string[] }): Promise<Task> => {
    return apiRequest<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  update: async (id: string, updates: Partial<Task>): Promise<Task> => {
    return apiRequest<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  delete: async (id: string): Promise<void> => {
    await apiRequest(`/tasks/${id}`, { method: 'DELETE' });
  },

  archive: async (id: string): Promise<Task> => {
    return apiRequest<Task>(`/tasks/${id}/archive`, { method: 'POST' });
  },

  unarchive: async (id: string): Promise<Task> => {
    return apiRequest<Task>(`/tasks/${id}/unarchive`, { method: 'POST' });
  },

  clone: async (id: string, userId: string): Promise<Task> => {
    return apiRequest<Task>(`/tasks/${id}/clone`, { method: 'POST' });
  },

  attachLabel: async (taskId: string, labelId: string): Promise<void> => {
    await apiRequest(`/tasks/${taskId}/labels/${labelId}`, { method: 'POST' });
  },

  detachLabel: async (taskId: string, labelId: string): Promise<void> => {
    await apiRequest(`/tasks/${taskId}/labels/${labelId}`, { method: 'DELETE' });
  },
};

export const progressApi = {
  getByTaskId: async (taskId: string): Promise<ProgressLog[]> => {
    return apiRequest<ProgressLog[]>(`/progress/task/${taskId}`);
  },

  create: async (data: Omit<ProgressLog, 'id' | 'createdAt' | 'feedbackStatus'>): Promise<ProgressLog> => {
    return apiRequest<ProgressLog>('/progress', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  approve: async (id: string, feedback: string): Promise<ProgressLog> => {
    return apiRequest<ProgressLog>(`/progress/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ feedback }),
    });
  },

  reject: async (id: string, feedback: string): Promise<ProgressLog> => {
    return apiRequest<ProgressLog>(`/progress/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ feedback }),
    });
  },
};

export const notificationsApi = {
  getAll: async (userId?: string): Promise<Notification[]> => {
    return apiRequest<Notification[]>('/notifications');
  },

  markAsRead: async (id: string): Promise<void> => {
    await apiRequest(`/notifications/${id}/read`, { method: 'PUT' });
  },
};

export const analyticsApi = {
  getOverview: async (range: 'week' | 'month' = 'week'): Promise<AnalyticsData> => {
    return apiRequest<AnalyticsData>(`/analytics/overview?range=${range}`);
  },
};

export const activityApi = {
  getAll: async (): Promise<ActivityItem[]> => {
    return apiRequest<ActivityItem[]>('/activity');
  },

  getByTaskId: async (taskId: string): Promise<ActivityItem[]> => {
    return apiRequest<ActivityItem[]>(`/activity/task/${taskId}`);
  },

  getByUserId: async (userId: string): Promise<ActivityItem[]> => {
    return apiRequest<ActivityItem[]>(`/activity/user/${userId}`);
  },
};

export const commentsApi = {
  getByTaskId: async (taskId: string): Promise<Comment[]> => {
    return apiRequest<Comment[]>(`/comments/task/${taskId}`);
  },

  create: async (taskId: string, userId: string, userName: string, content: string, parentId?: string): Promise<Comment> => {
    return apiRequest<Comment>('/comments', {
      method: 'POST',
      body: JSON.stringify({ taskId, content, parentId }),
    });
  },

  update: async (id: string, content: string): Promise<Comment> => {
    return apiRequest<Comment>(`/comments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  },

  delete: async (id: string): Promise<void> => {
    await apiRequest(`/comments/${id}`, { method: 'DELETE' });
  },
};

export const templatesApi = {
  getAll: async (): Promise<TaskTemplate[]> => {
    return apiRequest<TaskTemplate[]>('/templates');
  },

  create: async (template: Omit<TaskTemplate, 'id' | 'createdAt'>): Promise<TaskTemplate> => {
    return apiRequest<TaskTemplate>('/templates', {
      method: 'POST',
      body: JSON.stringify(template),
    });
  },

  delete: async (id: string): Promise<void> => {
    await apiRequest(`/templates/${id}`, { method: 'DELETE' });
  },
};

export const projectsApi = {
  getAll: async (): Promise<Project[]> => {
    return apiRequest<Project[]>('/projects');
  },

  create: async (project: Partial<Project> & { name: string }): Promise<Project> => {
    return apiRequest<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  },

  update: async (id: string, updates: Partial<Project>): Promise<Project> => {
    return apiRequest<Project>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  delete: async (id: string): Promise<void> => {
    await apiRequest(`/projects/${id}`, { method: 'DELETE' });
  },

  addTask: async (projectId: string, taskId: string): Promise<void> => {
    await apiRequest(`/projects/${projectId}/tasks`, {
      method: 'POST',
      body: JSON.stringify({ taskId }),
    });
  },

  removeTask: async (projectId: string, taskId: string): Promise<void> => {
    await apiRequest(`/projects/${projectId}/tasks/${taskId}`, {
      method: 'DELETE',
    });
  },
};

export const dependenciesApi = {
  getByTaskId: async (taskId: string): Promise<TaskDependency[]> => {
    return apiRequest<TaskDependency[]>(`/dependencies/task/${taskId}`);
  },

  create: async (taskId: string, dependsOnTaskId: string, type: string): Promise<TaskDependency> => {
    return apiRequest<TaskDependency>('/dependencies', {
      method: 'POST',
      body: JSON.stringify({ taskId, dependsOnTaskId, type }),
    });
  },

  delete: async (id: string): Promise<void> => {
    await apiRequest(`/dependencies/${id}`, { method: 'DELETE' });
  },
};

export const teamsApi = {
  getAll: async (): Promise<Team[]> => {
    return apiRequest<Team[]>('/teams');
  },

  create: async (data: { name: string; identifier: string; description?: string; color?: string }): Promise<Team> => {
    return apiRequest<Team>('/teams', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<Team>): Promise<Team> => {
    return apiRequest<Team>(`/teams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<void> => {
    await apiRequest(`/teams/${id}`, { method: 'DELETE' });
  },

  getMembers: async (teamId: string): Promise<TeamMember[]> => {
    return apiRequest<TeamMember[]>(`/teams/${teamId}/members`);
  },

  addMember: async (teamId: string, userId: string, role: string): Promise<void> => {
    await apiRequest(`/teams/${teamId}/members`, {
      method: 'POST',
      body: JSON.stringify({ userId, role }),
    });
  },

  removeMember: async (teamId: string, userId: string): Promise<void> => {
    await apiRequest(`/teams/${teamId}/members/${userId}`, { method: 'DELETE' });
  },
};

export const labelsApi = {
  getAll: async (teamId?: string): Promise<Label[]> => {
    return apiRequest<Label[]>(`/labels${teamId ? `?teamId=${teamId}` : ''}`);
  },

  create: async (data: { name: string; color: string; groupName?: string; teamId?: string }): Promise<Label> => {
    return apiRequest<Label>('/labels', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<Label>): Promise<Label> => {
    return apiRequest<Label>(`/labels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<void> => {
    await apiRequest(`/labels/${id}`, { method: 'DELETE' });
  },
};

export const cyclesApi = {
  getAll: async (teamId?: string, status?: string): Promise<Cycle[]> => {
    const params = new URLSearchParams();
    if (teamId) params.append('teamId', teamId);
    if (status) params.append('status', status);
    const query = params.toString();
    return apiRequest<Cycle[]>(`/cycles${query ? `?${query}` : ''}`);
  },

  create: async (data: { teamId: string; name: string; startDate: string; endDate: string }): Promise<Cycle> => {
    return apiRequest<Cycle>('/cycles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<Cycle>): Promise<Cycle> => {
    return apiRequest<Cycle>(`/cycles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<void> => {
    await apiRequest(`/cycles/${id}`, { method: 'DELETE' });
  },

  complete: async (id: string): Promise<void> => {
    await apiRequest(`/cycles/${id}/complete`, { method: 'POST' });
  },
};

export const viewsApi = {
  getAll: async (): Promise<CustomView[]> => {
    return apiRequest<CustomView[]>('/views');
  },

  create: async (data: Partial<CustomView> & { name: string }): Promise<CustomView> => {
    return apiRequest<CustomView>('/views', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<CustomView>): Promise<CustomView> => {
    return apiRequest<CustomView>(`/views/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<void> => {
    await apiRequest(`/views/${id}`, { method: 'DELETE' });
  },
};

export const favoritesApi = {
  getAll: async (): Promise<Favorite[]> => {
    return apiRequest<Favorite[]>('/favorites');
  },

  add: async (targetType: string, targetId: string): Promise<Favorite> => {
    return apiRequest<Favorite>('/favorites', {
      method: 'POST',
      body: JSON.stringify({ targetType, targetId }),
    });
  },

  remove: async (id: string): Promise<void> => {
    await apiRequest(`/favorites/${id}`, { method: 'DELETE' });
  },
};

export const searchApi = {
  search: async (q: string, limit: number = 10): Promise<SearchResult[]> => {
    return apiRequest<SearchResult[]>(`/search?q=${encodeURIComponent(q)}&limit=${limit}`);
  },
};
