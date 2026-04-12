import { useEffect, useState, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { IssueRow } from '@/components/IssueRow';
import { StatusIcon } from '@/components/StatusIcon';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { tasksApi } from '@/services/api';
import { Task, TaskStatus, TaskPriority } from '@/types';
import { Plus, Search, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_GROUPS: TaskStatus[] = ['backlog', 'todo', 'in_progress', 'done', 'cancelled'];

const STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  todo: 'Todo',
  in_progress: 'In Progress',
  done: 'Done',
  cancelled: 'Cancelled',
};

export default function MyIssues() {
  const { user } = useAuth();
  const { activeTeam } = useWorkspace();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const data = await tasksApi.getAll({ assigneeId: user.id });
        setTasks(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [tasks, statusFilter, priorityFilter, search]);

  const grouped = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = {
      backlog: [],
      todo: [],
      in_progress: [],
      done: [],
      cancelled: [],
    };
    filtered.forEach((t) => map[t.status].push(t));
    return map;
  }, [filtered]);

  const toggleGroup = (status: string) =>
    setCollapsed((prev) => ({ ...prev, [status]: !prev[status] }));

  return (
    <AppShell>
      <div className="page-shell space-y-6 animate-fade-in">
        <div className="section-header">
          <div>
            <p className="eyebrow">Issues</p>
            <h1 className="app-heading mt-2 text-3xl md:text-4xl">My Issues</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {filtered.length} issue{filtered.length !== 1 ? 's' : ''} assigned to you
            </p>
          </div>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Issue
          </Button>
        </div>

        <div className="surface-panel p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search issues..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {STATUS_GROUPS.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="none">No Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-pulse-glow w-16 h-16 rounded-full bg-primary/20" />
          </div>
        ) : (
          <div className="space-y-2">
            {STATUS_GROUPS.map((status) => {
              const items = grouped[status];
              const isCollapsed = collapsed[status];
              return (
                <div key={status}>
                  <button
                    onClick={() => toggleGroup(status)}
                    className="flex items-center gap-2 w-full px-2 py-2 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <ChevronRight
                      className={cn(
                        'h-4 w-4 text-muted-foreground transition-transform',
                        !isCollapsed && 'rotate-90',
                      )}
                    />
                    <StatusIcon status={status} size={16} />
                    <span className="text-sm font-medium text-foreground">
                      {STATUS_LABELS[status]}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">{items.length}</span>
                  </button>
                  {!isCollapsed && (
                    <div className="mt-1">
                      {items.length === 0 ? (
                        <p className="text-xs text-muted-foreground px-8 py-2">
                          No issues
                        </p>
                      ) : (
                        items.map((task) => <IssueRow key={task.id} task={task} />)
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Issue</DialogTitle>
              <DialogDescription>Add a new issue to your workspace.</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newTitle.trim() || !user) return;
                await tasksApi.create({
                  title: newTitle.trim(),
                  teamId: activeTeam?.id ?? null,
                });
                const data = await tasksApi.getAll({ assigneeId: user.id });
                setTasks(data);
                setNewTitle('');
                setShowCreate(false);
              }}
              className="space-y-4 mt-4"
            >
              <Input
                placeholder="Issue title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
