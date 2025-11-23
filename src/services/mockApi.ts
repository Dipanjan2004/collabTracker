import { 
  User, Task, ProgressLog, Notification, ActivityItem, AuthResponse, AnalyticsData, Comment, TaskTemplate, Project, TaskDependency
} from '@/types';
import { 
  seedUsers, seedTasks, seedProgressLogs, seedNotifications, seedActivity 
} from './mockData';

// Storage keys
const STORAGE_KEYS = {
  USERS: 'collabtrack_users',
  TASKS: 'collabtrack_tasks',
  PROGRESS: 'collabtrack_progress',
  NOTIFICATIONS: 'collabtrack_notifications',
  ACTIVITY: 'collabtrack_activity',
  AUTH_TOKEN: 'collabtrack_token',
  CURRENT_USER: 'collabtrack_current_user',
  COMMENTS: 'collabtrack_comments',
  TEMPLATES: 'collabtrack_templates',
  PROJECTS: 'collabtrack_projects',
  DEPENDENCIES: 'collabtrack_dependencies',
};

// Initialize localStorage with seed data if empty
const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(seedUsers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(seedTasks));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PROGRESS)) {
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(seedProgressLogs));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(seedNotifications));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ACTIVITY)) {
    localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(seedActivity));
  }
  if (!localStorage.getItem(STORAGE_KEYS.COMMENTS)) {
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TEMPLATES)) {
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.DEPENDENCIES)) {
    localStorage.setItem(STORAGE_KEYS.DEPENDENCIES, JSON.stringify([]));
  }
};

initializeStorage();

// Helper to simulate network delay
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to get data from localStorage
const getStorageData = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

// Helper to set data in localStorage
const setStorageData = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Auth API
export const mockAuthApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    await delay(500);
    const users = getStorageData<User>(STORAGE_KEYS.USERS);
    const user = users.find(u => u.email === email && u.active);
    
    if (!user || password !== 'DemoPass123') {
      throw new Error('Invalid credentials');
    }
    
    const token = `mock-jwt-${user.id}-${Date.now()}`;
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    
    return { token, user };
  },
  
  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    await delay(500);
    const users = getStorageData<User>(STORAGE_KEYS.USERS);
    
    if (users.find(u => u.email === email)) {
      throw new Error('Email already exists');
    }
    
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      role: 'collaborator',
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      createdAt: new Date().toISOString(),
      active: true,
    };
    
    users.push(newUser);
    setStorageData(STORAGE_KEYS.USERS, users);
    
    const token = `mock-jwt-${newUser.id}-${Date.now()}`;
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
    
    return { token, user: newUser };
  },
  
  getCurrentUser: (): User | null => {
    const userData = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return userData ? JSON.parse(userData) : null;
  },
  
  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },
};

// Users API
export const mockUsersApi = {
  getAll: async (): Promise<User[]> => {
    await delay(300);
    return getStorageData<User>(STORAGE_KEYS.USERS);
  },
  
  invite: async (email: string, role: 'admin' | 'collaborator'): Promise<{ success: boolean }> => {
    await delay(400);
    // Mock invite - in real app would send email
    console.log(`Invite sent to ${email} as ${role}`);
    return { success: true };
  },
  
  remove: async (userId: string): Promise<void> => {
    await delay(300);
    const users = getStorageData<User>(STORAGE_KEYS.USERS);
    const updatedUsers = users.filter(u => u.id !== userId);
    setStorageData(STORAGE_KEYS.USERS, updatedUsers);
    
    // Also update tasks to remove this user from assignedTo arrays
    const tasks = getStorageData<Task>(STORAGE_KEYS.TASKS);
    const updatedTasks = tasks.map(task => ({
      ...task,
      assignedTo: task.assignedTo.filter(id => id !== userId),
    }));
    setStorageData(STORAGE_KEYS.TASKS, updatedTasks);
  },
};

// Tasks API
export const mockTasksApi = {
  getAll: async (filters?: {
    assignedTo?: string;
    status?: string;
    tags?: string[];
    search?: string;
    archived?: boolean;
    projectId?: string;
  }): Promise<Task[]> => {
    await delay(300);
    let tasks = getStorageData<Task>(STORAGE_KEYS.TASKS);
    
    // Filter out archived tasks by default
    if (filters?.archived === undefined) {
      tasks = tasks.filter(t => !t.archived);
    } else if (filters.archived === false) {
      tasks = tasks.filter(t => !t.archived);
    } else if (filters.archived === true) {
      tasks = tasks.filter(t => t.archived === true);
    }
    
    if (filters?.assignedTo) {
      tasks = tasks.filter(t => t.assignedTo.includes(filters.assignedTo));
    }
    if (filters?.status) {
      tasks = tasks.filter(t => t.status === filters.status);
    }
    if (filters?.tags && filters.tags.length > 0) {
      tasks = tasks.filter(t => filters.tags!.some(tag => t.tags.includes(tag)));
    }
    if (filters?.projectId) {
      tasks = tasks.filter(t => t.projectId === filters.projectId);
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      tasks = tasks.filter(t => 
        t.title.toLowerCase().includes(search) || 
        t.description.toLowerCase().includes(search)
      );
    }
    
    return tasks;
  },
  
  getById: async (id: string): Promise<Task | null> => {
    await delay(200);
    const tasks = getStorageData<Task>(STORAGE_KEYS.TASKS);
    return tasks.find(t => t.id === id) || null;
  },
  
  create: async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
    await delay(400);
    const tasks = getStorageData<Task>(STORAGE_KEYS.TASKS);
    const users = getStorageData<User>(STORAGE_KEYS.USERS);
    
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    tasks.push(newTask);
    setStorageData(STORAGE_KEYS.TASKS, tasks);
    
    // Create notifications for assigned users
    const notifications = getStorageData<Notification>(STORAGE_KEYS.NOTIFICATIONS);
    const creator = users.find(u => u.id === taskData.createdBy);
    
    for (const userId of taskData.assignedTo) {
      const notification: Notification = {
        id: `notif-${Date.now()}-${userId}`,
        userId,
        type: 'task_assigned',
        message: `New task assigned: '${newTask.title}' — Due ${new Date(newTask.deadline).toLocaleDateString()}`,
        read: false,
        payload: { taskId: newTask.id },
        createdAt: new Date().toISOString(),
      };
      notifications.push(notification);
    }
    setStorageData(STORAGE_KEYS.NOTIFICATIONS, notifications);
    
    // Create activity item
    const activity = getStorageData<ActivityItem>(STORAGE_KEYS.ACTIVITY);
    const activityItem: ActivityItem = {
      id: `activity-${Date.now()}`,
      userId: taskData.createdBy,
      userName: creator?.name || 'Admin',
      action: 'created task',
      targetType: 'task',
      targetId: newTask.id,
      createdAt: new Date().toISOString(),
    };
    activity.push(activityItem);
    setStorageData(STORAGE_KEYS.ACTIVITY, activity);
    
    return newTask;
  },
  
  update: async (id: string, updates: Partial<Task>): Promise<Task> => {
    await delay(300);
    const tasks = getStorageData<Task>(STORAGE_KEYS.TASKS);
    const index = tasks.findIndex(t => t.id === id);
    
    if (index === -1) throw new Error('Task not found');
    
    tasks[index] = { ...tasks[index], ...updates, updatedAt: new Date().toISOString() };
    setStorageData(STORAGE_KEYS.TASKS, tasks);
    
    return tasks[index];
  },
  
  delete: async (id: string): Promise<void> => {
    await delay(300);
    const tasks = getStorageData<Task>(STORAGE_KEYS.TASKS);
    setStorageData(STORAGE_KEYS.TASKS, tasks.filter(t => t.id !== id));
    
    // Also delete related comments, progress logs, dependencies
    const comments = getStorageData<Comment>(STORAGE_KEYS.COMMENTS);
    setStorageData(STORAGE_KEYS.COMMENTS, comments.filter(c => c.taskId !== id));
    
    const progress = getStorageData<ProgressLog>(STORAGE_KEYS.PROGRESS);
    setStorageData(STORAGE_KEYS.PROGRESS, progress.filter(p => p.taskId !== id));
    
    const dependencies = getStorageData<TaskDependency>(STORAGE_KEYS.DEPENDENCIES);
    setStorageData(STORAGE_KEYS.DEPENDENCIES, dependencies.filter(d => 
      d.taskId !== id && d.dependsOnTaskId !== id
    ));
  },
  
  archive: async (id: string): Promise<Task> => {
    await delay(300);
    const tasks = getStorageData<Task>(STORAGE_KEYS.TASKS);
    const index = tasks.findIndex(t => t.id === id);
    
    if (index === -1) throw new Error('Task not found');
    
    tasks[index] = { ...tasks[index], archived: true, updatedAt: new Date().toISOString() };
    setStorageData(STORAGE_KEYS.TASKS, tasks);
    
    return tasks[index];
  },
  
  unarchive: async (id: string): Promise<Task> => {
    await delay(300);
    const tasks = getStorageData<Task>(STORAGE_KEYS.TASKS);
    const index = tasks.findIndex(t => t.id === id);
    
    if (index === -1) throw new Error('Task not found');
    
    tasks[index] = { ...tasks[index], archived: false, updatedAt: new Date().toISOString() };
    setStorageData(STORAGE_KEYS.TASKS, tasks);
    
    return tasks[index];
  },
  
  clone: async (id: string, userId: string): Promise<Task> => {
    await delay(400);
    const tasks = getStorageData<Task>(STORAGE_KEYS.TASKS);
    const original = tasks.find(t => t.id === id);
    
    if (!original) throw new Error('Task not found');
    
    const cloned: Task = {
      ...original,
      id: `task-${Date.now()}`,
      title: `${original.title} (Copy)`,
      assignedTo: [],
      status: 'todo',
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      archived: false,
      dependsOn: undefined,
    };
    
    tasks.push(cloned);
    setStorageData(STORAGE_KEYS.TASKS, tasks);
    
    // Create activity
    const activity = getStorageData<ActivityItem>(STORAGE_KEYS.ACTIVITY);
    activity.push({
      id: `activity-${Date.now()}`,
      userId,
      userName: 'User',
      action: 'cloned task',
      targetType: 'task',
      targetId: cloned.id,
      createdAt: new Date().toISOString(),
    });
    setStorageData(STORAGE_KEYS.ACTIVITY, activity);
    
    return cloned;
  },
};

// Progress API
export const mockProgressApi = {
  getByTaskId: async (taskId: string): Promise<ProgressLog[]> => {
    await delay(200);
    const logs = getStorageData<ProgressLog>(STORAGE_KEYS.PROGRESS);
    return logs.filter(l => l.taskId === taskId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },
  
  create: async (data: Omit<ProgressLog, 'id' | 'createdAt' | 'feedbackStatus'>): Promise<ProgressLog> => {
    await delay(400);
    const logs = getStorageData<ProgressLog>(STORAGE_KEYS.PROGRESS);
    
    const newLog: ProgressLog = {
      ...data,
      id: `progress-${Date.now()}`,
      feedbackStatus: 'pending',
      createdAt: new Date().toISOString(),
    };
    
    logs.push(newLog);
    setStorageData(STORAGE_KEYS.PROGRESS, logs);
    
    // Update task percentage
    const tasks = getStorageData<Task>(STORAGE_KEYS.TASKS);
    const taskIndex = tasks.findIndex(t => t.id === data.taskId);
    if (taskIndex !== -1) {
      tasks[taskIndex].updatedAt = new Date().toISOString();
      setStorageData(STORAGE_KEYS.TASKS, tasks);
    }
    
    return newLog;
  },
  
  approve: async (id: string, feedback: string): Promise<ProgressLog> => {
    await delay(300);
    const logs = getStorageData<ProgressLog>(STORAGE_KEYS.PROGRESS);
    const index = logs.findIndex(l => l.id === id);
    
    if (index === -1) throw new Error('Progress log not found');
    
    logs[index] = { 
      ...logs[index], 
      feedbackStatus: 'approved', 
      adminFeedback: feedback 
    };
    setStorageData(STORAGE_KEYS.PROGRESS, logs);
    
    return logs[index];
  },
  
  reject: async (id: string, feedback: string): Promise<ProgressLog> => {
    await delay(300);
    const logs = getStorageData<ProgressLog>(STORAGE_KEYS.PROGRESS);
    const index = logs.findIndex(l => l.id === id);
    
    if (index === -1) throw new Error('Progress log not found');
    
    logs[index] = { 
      ...logs[index], 
      feedbackStatus: 'rejected', 
      adminFeedback: feedback 
    };
    setStorageData(STORAGE_KEYS.PROGRESS, logs);
    
    return logs[index];
  },
};

// Notifications API
export const mockNotificationsApi = {
  getAll: async (userId: string): Promise<Notification[]> => {
    await delay(200);
    const notifications = getStorageData<Notification>(STORAGE_KEYS.NOTIFICATIONS);
    return notifications.filter(n => n.userId === userId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },
  
  markAsRead: async (id: string): Promise<void> => {
    await delay(200);
    const notifications = getStorageData<Notification>(STORAGE_KEYS.NOTIFICATIONS);
    const index = notifications.findIndex(n => n.id === id);
    
    if (index !== -1) {
      notifications[index].read = true;
      setStorageData(STORAGE_KEYS.NOTIFICATIONS, notifications);
    }
  },
};

// Analytics API
export const mockAnalyticsApi = {
  getOverview: async (range: 'week' | 'month' = 'week'): Promise<AnalyticsData> => {
    await delay(400);
    const tasks = getStorageData<Task>(STORAGE_KEYS.TASKS);
    const progress = getStorageData<ProgressLog>(STORAGE_KEYS.PROGRESS);
    const users = getStorageData<User>(STORAGE_KEYS.USERS);
    
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentProgress = progress.filter(p => new Date(p.createdAt) > weekAgo);
    
    return {
      tasksCompleted: tasks.filter(t => t.status === 'done').length,
      activeContributors: users.filter(u => u.role === 'collaborator' && u.active).length,
      hoursThisWeek: recentProgress.reduce((sum, p) => sum + p.hoursSpent, 0),
      weeklyHoursData: [
        { date: 'Mon', hours: 5 },
        { date: 'Tue', hours: 7 },
        { date: 'Wed', hours: 4 },
        { date: 'Thu', hours: 8 },
        { date: 'Fri', hours: 6 },
        { date: 'Sat', hours: 3 },
        { date: 'Sun', hours: 2 },
      ],
      taskStatusDistribution: [
        {
          status: 'To Do',
          count: tasks.filter(t => t.status === 'todo').length,
          collaborators: Array.from(new Set(
            tasks
              .filter(t => t.status === 'todo')
              .flatMap(t => t.assignedTo)
              .map(userId => {
                const user = users.find(u => u.id === userId);
                return user ? user.name : null;
              })
              .filter((name): name is string => name !== null)
          )),
        },
        {
          status: 'In Progress',
          count: tasks.filter(t => t.status === 'in-progress').length,
          collaborators: Array.from(new Set(
            tasks
              .filter(t => t.status === 'in-progress')
              .flatMap(t => t.assignedTo)
              .map(userId => {
                const user = users.find(u => u.id === userId);
                return user ? user.name : null;
              })
              .filter((name): name is string => name !== null)
          )),
        },
        {
          status: 'Review',
          count: tasks.filter(t => t.status === 'review').length,
          collaborators: Array.from(new Set(
            tasks
              .filter(t => t.status === 'review')
              .flatMap(t => t.assignedTo)
              .map(userId => {
                const user = users.find(u => u.id === userId);
                return user ? user.name : null;
              })
              .filter((name): name is string => name !== null)
          )),
        },
        {
          status: 'Done',
          count: tasks.filter(t => t.status === 'done').length,
          collaborators: Array.from(new Set(
            tasks
              .filter(t => t.status === 'done')
              .flatMap(t => t.assignedTo)
              .map(userId => {
                const user = users.find(u => u.id === userId);
                return user ? user.name : null;
              })
              .filter((name): name is string => name !== null)
          )),
        },
        {
          status: 'Blocked',
          count: tasks.filter(t => t.status === 'blocked').length,
          collaborators: Array.from(new Set(
            tasks
              .filter(t => t.status === 'blocked')
              .flatMap(t => t.assignedTo)
              .map(userId => {
                const user = users.find(u => u.id === userId);
                return user ? user.name : null;
              })
              .filter((name): name is string => name !== null)
          )),
        },
      ].filter(item => item.count > 0),
      topContributors: users
        .filter(u => u.role === 'collaborator')
        .map(u => ({
          name: u.name,
          hours: progress.filter(p => p.userId === u.id).reduce((sum, p) => sum + p.hoursSpent, 0),
        }))
        .sort((a, b) => b.hours - a.hours)
        .slice(0, 5),
      overdueTasks: tasks.filter(t => 
        new Date(t.deadline) < now && t.status !== 'done'
      ).length,
    };
  },
};

// Activity API
export const mockActivityApi = {
  getAll: async (): Promise<ActivityItem[]> => {
    await delay(200);
    const activity = getStorageData<ActivityItem>(STORAGE_KEYS.ACTIVITY);
    return activity.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },
  
  getByTaskId: async (taskId: string): Promise<ActivityItem[]> => {
    await delay(200);
    const activity = getStorageData<ActivityItem>(STORAGE_KEYS.ACTIVITY);
    return activity
      .filter(a => a.targetType === 'task' && a.targetId === taskId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  
  getByUserId: async (userId: string): Promise<ActivityItem[]> => {
    await delay(200);
    const activity = getStorageData<ActivityItem>(STORAGE_KEYS.ACTIVITY);
    return activity
      .filter(a => a.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
};

// Comments API
export const mockCommentsApi = {
  getByTaskId: async (taskId: string): Promise<Comment[]> => {
    await delay(200);
    const comments = getStorageData<Comment>(STORAGE_KEYS.COMMENTS);
    return comments
      .filter(c => c.taskId === taskId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },
  
  create: async (taskId: string, userId: string, userName: string, content: string, parentId?: string): Promise<Comment> => {
    await delay(300);
    const comments = getStorageData<Comment>(STORAGE_KEYS.COMMENTS);
    
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      taskId,
      userId,
      userName,
      content,
      createdAt: new Date().toISOString(),
      parentId,
    };
    
    comments.push(newComment);
    setStorageData(STORAGE_KEYS.COMMENTS, comments);
    
    // Create activity
    const activity = getStorageData<ActivityItem>(STORAGE_KEYS.ACTIVITY);
    activity.push({
      id: `activity-${Date.now()}`,
      userId,
      userName,
      action: 'commented on task',
      targetType: 'task',
      targetId: taskId,
      createdAt: new Date().toISOString(),
    });
    setStorageData(STORAGE_KEYS.ACTIVITY, activity);
    
    return newComment;
  },
  
  update: async (id: string, content: string): Promise<Comment> => {
    await delay(300);
    const comments = getStorageData<Comment>(STORAGE_KEYS.COMMENTS);
    const index = comments.findIndex(c => c.id === id);
    
    if (index === -1) throw new Error('Comment not found');
    
    comments[index] = {
      ...comments[index],
      content,
      updatedAt: new Date().toISOString(),
    };
    setStorageData(STORAGE_KEYS.COMMENTS, comments);
    
    return comments[index];
  },
  
  delete: async (id: string): Promise<void> => {
    await delay(200);
    const comments = getStorageData<Comment>(STORAGE_KEYS.COMMENTS);
    setStorageData(STORAGE_KEYS.COMMENTS, comments.filter(c => c.id !== id));
  },
};

// Task Templates API
export const mockTemplatesApi = {
  getAll: async (): Promise<TaskTemplate[]> => {
    await delay(200);
    return getStorageData<TaskTemplate>(STORAGE_KEYS.TEMPLATES);
  },
  
  create: async (template: Omit<TaskTemplate, 'id' | 'createdAt'>): Promise<TaskTemplate> => {
    await delay(300);
    const templates = getStorageData<TaskTemplate>(STORAGE_KEYS.TEMPLATES);
    
    const newTemplate: TaskTemplate = {
      ...template,
      id: `template-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    
    templates.push(newTemplate);
    setStorageData(STORAGE_KEYS.TEMPLATES, templates);
    
    return newTemplate;
  },
  
  delete: async (id: string): Promise<void> => {
    await delay(200);
    const templates = getStorageData<TaskTemplate>(STORAGE_KEYS.TEMPLATES);
    setStorageData(STORAGE_KEYS.TEMPLATES, templates.filter(t => t.id !== id));
  },
};

// Projects API
export const mockProjectsApi = {
  getAll: async (): Promise<Project[]> => {
    await delay(200);
    return getStorageData<Project>(STORAGE_KEYS.PROJECTS);
  },
  
  create: async (project: Omit<Project, 'id' | 'createdAt' | 'taskIds'>): Promise<Project> => {
    await delay(300);
    const projects = getStorageData<Project>(STORAGE_KEYS.PROJECTS);
    
    const newProject: Project = {
      ...project,
      id: `project-${Date.now()}`,
      createdAt: new Date().toISOString(),
      taskIds: [],
    };
    
    projects.push(newProject);
    setStorageData(STORAGE_KEYS.PROJECTS, projects);
    
    return newProject;
  },
  
  update: async (id: string, updates: Partial<Project>): Promise<Project> => {
    await delay(300);
    const projects = getStorageData<Project>(STORAGE_KEYS.PROJECTS);
    const index = projects.findIndex(p => p.id === id);
    
    if (index === -1) throw new Error('Project not found');
    
    projects[index] = { ...projects[index], ...updates };
    setStorageData(STORAGE_KEYS.PROJECTS, projects);
    
    return projects[index];
  },
  
  delete: async (id: string): Promise<void> => {
    await delay(200);
    const projects = getStorageData<Project>(STORAGE_KEYS.PROJECTS);
    setStorageData(STORAGE_KEYS.PROJECTS, projects.filter(p => p.id !== id));
  },
  
  addTask: async (projectId: string, taskId: string): Promise<void> => {
    await delay(200);
    const projects = getStorageData<Project>(STORAGE_KEYS.PROJECTS);
    const project = projects.find(p => p.id === projectId);
    if (project && !project.taskIds.includes(taskId)) {
      project.taskIds.push(taskId);
      setStorageData(STORAGE_KEYS.PROJECTS, projects);
    }
  },
  
  removeTask: async (projectId: string, taskId: string): Promise<void> => {
    await delay(200);
    const projects = getStorageData<Project>(STORAGE_KEYS.PROJECTS);
    const project = projects.find(p => p.id === projectId);
    if (project) {
      project.taskIds = project.taskIds.filter(id => id !== taskId);
      setStorageData(STORAGE_KEYS.PROJECTS, projects);
    }
  },
};

// Task Dependencies API
export const mockDependenciesApi = {
  getByTaskId: async (taskId: string): Promise<TaskDependency[]> => {
    await delay(200);
    const dependencies = getStorageData<TaskDependency>(STORAGE_KEYS.DEPENDENCIES);
    return dependencies.filter(d => d.taskId === taskId || d.dependsOnTaskId === taskId);
  },
  
  create: async (taskId: string, dependsOnTaskId: string, type: 'blocks' | 'required_by'): Promise<TaskDependency> => {
    await delay(300);
    const dependencies = getStorageData<TaskDependency>(STORAGE_KEYS.DEPENDENCIES);
    
    const newDependency: TaskDependency = {
      id: `dep-${Date.now()}`,
      taskId,
      dependsOnTaskId,
      type,
    };
    
    dependencies.push(newDependency);
    setStorageData(STORAGE_KEYS.DEPENDENCIES, dependencies);
    
    return newDependency;
  },
  
  delete: async (id: string): Promise<void> => {
    await delay(200);
    const dependencies = getStorageData<TaskDependency>(STORAGE_KEYS.DEPENDENCIES);
    setStorageData(STORAGE_KEYS.DEPENDENCIES, dependencies.filter(d => d.id !== id));
  },
};
