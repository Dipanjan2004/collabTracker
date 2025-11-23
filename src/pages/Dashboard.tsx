import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { StatCard } from '@/components/StatCard';
import { TaskCard } from '@/components/TaskCard';
import { CheckSquare, Users, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Task, ProgressLog, AnalyticsData, User as UserType } from '@/types';
import { mockTasksApi, mockProgressApi, mockAnalyticsApi, mockUsersApi } from '@/services/mockApi';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Download, FileText } from 'lucide-react';
import { exportTaskReport } from '@/utils/pdfExport';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';

const statusColors = {
  todo: 'bg-gray-500/10 text-gray-500',
  'in-progress': 'bg-blue-500/10 text-blue-500',
  blocked: 'bg-red-500/10 text-red-500',
  review: 'bg-yellow-500/10 text-yellow-500',
  done: 'bg-green-500/10 text-green-500',
};

const priorityColors = {
  low: 'bg-green-500/10 text-green-500 border-green-500/20',
  medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  high: 'bg-red-500/10 text-red-500 border-red-500/20',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [progressLogs, setProgressLogs] = useState<Record<string, ProgressLog[]>>({});
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
  const [activeContributors, setActiveContributors] = useState<UserType[]>([]);
  const [hoursData, setHoursData] = useState<ProgressLog[]>([]);
  const [dialogOpen, setDialogOpen] = useState<{
    completed: boolean;
    contributors: boolean;
    hours: boolean;
    overdue: boolean;
  }>({
    completed: false,
    contributors: false,
    hours: false,
    overdue: false,
  });

  useEffect(() => {
    const loadData = async () => {
      const analyticsData = await mockAnalyticsApi.getOverview();
      setAnalytics(analyticsData);

      if (user?.role === 'admin') {
        const allTasks = await mockTasksApi.getAll();
        // Sort by most recent first
        const sortedTasks = allTasks.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setTasks(sortedTasks.slice(0, 4));
        
        // Load completed tasks
        const completed = allTasks.filter(t => t.status === 'done');
        setCompletedTasks(completed);
        
        // Load overdue tasks
        const now = new Date();
        const overdue = allTasks.filter(t => 
          new Date(t.deadline) < now && t.status !== 'done'
        );
        setOverdueTasks(overdue);
        
        // Load active contributors
        const allUsers = await mockUsersApi.getAll();
        const active = allUsers.filter(u => u.role === 'collaborator' && u.active);
        setActiveContributors(active);
        
        // Load hours data
        const allProgress = await Promise.all(
          allTasks.map(t => mockProgressApi.getByTaskId(t.id))
        );
        const flatProgress = allProgress.flat();
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentProgress = flatProgress.filter(p => new Date(p.createdAt) > weekAgo);
        setHoursData(recentProgress);
      } else {
        const myTasks = await mockTasksApi.getAll({ assignedTo: user?.id });
        setTasks(myTasks);

        // Load progress for each task
        const logsMap: Record<string, ProgressLog[]> = {};
        for (const task of myTasks) {
          const logs = await mockProgressApi.getByTaskId(task.id);
          logsMap[task.id] = logs;
        }
        setProgressLogs(logsMap);
      }
    };

    loadData();
    
    // Set up interval to check for updates every 5 seconds
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [user]);

  if (!analytics) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse-glow w-16 h-16 rounded-full bg-primary/20" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-muted-foreground">
            {user?.role === 'admin'
              ? "Here's an overview of your team's progress"
              : "Here's your task overview"}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Tasks Completed"
            value={analytics.tasksCompleted}
            icon={CheckSquare}
            trend="+12% from last week"
            onClick={() => user?.role === 'admin' && setDialogOpen({ ...dialogOpen, completed: true })}
          />
          <StatCard
            title="Active Contributors"
            value={analytics.activeContributors}
            icon={Users}
            onClick={() => user?.role === 'admin' && setDialogOpen({ ...dialogOpen, contributors: true })}
          />
          <StatCard
            title="Hours This Week"
            value={analytics.hoursThisWeek}
            icon={Clock}
            suffix="hrs"
            trend="+8% from last week"
            onClick={() => user?.role === 'admin' && setDialogOpen({ ...dialogOpen, hours: true })}
          />
          <StatCard
            title="Overdue Tasks"
            value={analytics.overdueTasks}
            icon={AlertCircle}
            onClick={() => user?.role === 'admin' && setDialogOpen({ ...dialogOpen, overdue: true })}
          />
        </div>

        {/* Charts */}
        {user?.role === 'admin' && (
          <div className="grid grid-cols-1 gap-6">
            {/* Weekly Hours Chart */}
            <Card className="glass-card p-6" id="weekly-hours-chart">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Weekly Hours</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const element = document.getElementById('weekly-hours-chart');
                    if (element) {
                      await exportTaskReport(element, `weekly-hours-${Date.now()}`);
                    }
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={analytics.weeklyHoursData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="hours"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Top Contributors */}
            <Card className="glass-card p-6" id="top-contributors-chart">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Top Contributors</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const element = document.getElementById('top-contributors-chart');
                    if (element) {
                      await exportTaskReport(element, `top-contributors-${Date.now()}`);
                    }
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analytics.topContributors}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}

        {/* Recent/My Tasks */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            {user?.role === 'admin' ? 'Recent Tasks' : 'My Tasks'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                progressLogs={progressLogs[task.id] || []}
              />
            ))}
          </div>
        </div>

        {/* Dialogs for Stat Cards */}
        {user?.role === 'admin' && (
          <>
            {/* Completed Tasks Dialog */}
            <Dialog open={dialogOpen.completed} onOpenChange={(open) => setDialogOpen({ ...dialogOpen, completed: open })}>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Completed Tasks</DialogTitle>
                  <DialogDescription>
                    {completedTasks.length} completed {completedTasks.length === 1 ? 'task' : 'tasks'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 mt-4">
                  {completedTasks.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No completed tasks yet.</p>
                  ) : (
                    completedTasks.map((task) => (
                      <Card key={task.id} className="glass-card p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{task.title}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className={statusColors.done}>Done</Badge>
                              <span className="text-xs text-muted-foreground">
                                Completed: {format(new Date(task.updatedAt), 'PPp')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* Active Contributors Dialog */}
            <Dialog open={dialogOpen.contributors} onOpenChange={(open) => setDialogOpen({ ...dialogOpen, contributors: open })}>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Active Contributors</DialogTitle>
                  <DialogDescription>
                    {activeContributors.length} active {activeContributors.length === 1 ? 'contributor' : 'contributors'}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {activeContributors.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8 col-span-full">No active contributors.</p>
                  ) : (
                    activeContributors.map((contributor) => (
                      <Card key={contributor.id} className="glass-card p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {contributor.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate">{contributor.name}</h4>
                            <p className="text-sm text-muted-foreground truncate">{contributor.email}</p>
                            <div className="h-2 w-2 rounded-full bg-green-500 mt-2" title="Active" />
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* Hours This Week Dialog */}
            <Dialog open={dialogOpen.hours} onOpenChange={(open) => setDialogOpen({ ...dialogOpen, hours: open })}>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Hours This Week</DialogTitle>
                  <DialogDescription>
                    Total: {hoursData.reduce((sum, p) => sum + p.hoursSpent, 0)} hours logged this week
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 mt-4">
                  {hoursData.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No hours logged this week.</p>
                  ) : (
                    hoursData.map((log) => (
                      <Card key={log.id} className="glass-card p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="h-4 w-4 text-primary" />
                              <span className="font-semibold">{log.hoursSpent} hours</span>
                              <span className="text-sm text-muted-foreground">
                                on {format(new Date(log.date), 'PP')}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{log.progressText}</p>
                            <Badge className="mt-2" variant="outline">
                              {log.percentageComplete}% complete
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* Overdue Tasks Dialog */}
            <Dialog open={dialogOpen.overdue} onOpenChange={(open) => setDialogOpen({ ...dialogOpen, overdue: open })}>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Overdue Tasks</DialogTitle>
                  <DialogDescription>
                    {overdueTasks.length} overdue {overdueTasks.length === 1 ? 'task' : 'tasks'} that need attention
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 mt-4">
                  {overdueTasks.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No overdue tasks. Great work!</p>
                  ) : (
                    overdueTasks.map((task) => (
                      <Card key={task.id} className="glass-card p-4 border-red-500/20">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1 text-red-400">{task.title}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className={statusColors[task.status]}>{task.status}</Badge>
                              <Badge className={priorityColors[task.priority]}>{task.priority}</Badge>
                              <span className="text-xs text-red-400">
                                Due: {format(new Date(task.deadline), 'PP')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </AppShell>
  );
}
