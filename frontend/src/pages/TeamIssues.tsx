import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/card';
import { IssueRow } from '@/components/IssueRow';
import { StatusIcon } from '@/components/StatusIcon';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { tasksApi, teamsApi } from '@/services/api';
import { Task, TaskStatus, Team } from '@/types';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_GROUPS: TaskStatus[] = ['backlog', 'todo', 'in_progress', 'done', 'cancelled'];
const STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  todo: 'Todo',
  in_progress: 'In Progress',
  done: 'Done',
  cancelled: 'Cancelled',
};

export default function TeamIssues() {
  const { teamId } = useParams<{ teamId: string }>();
  const { teams } = useWorkspace();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const load = async () => {
      if (!teamId) return;
      try {
        const found = teams.find((t) => t.id === teamId) ?? (await teamsApi.getAll()).find((t) => t.id === teamId) ?? null;
        setTeam(found);
        const data = await tasksApi.getAll({ teamId });
        setTasks(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [teamId, teams]);

  const grouped = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = {
      backlog: [],
      todo: [],
      in_progress: [],
      done: [],
      cancelled: [],
    };
    tasks.forEach((t) => map[t.status].push(t));
    return map;
  }, [tasks]);

  const toggleGroup = (status: string) =>
    setCollapsed((prev) => ({ ...prev, [status]: !prev[status] }));

  return (
    <AppShell>
      <div className="page-shell space-y-6 animate-fade-in">
        <div className="section-header">
          <div>
            <p className="eyebrow">Issues</p>
            <h1 className="app-heading mt-2 text-3xl md:text-4xl">
              {team ? team.name : 'Team'} Issues
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {tasks.length} issue{tasks.length !== 1 ? 's' : ''} in this team
            </p>
          </div>
        </div>

        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Teams</span>
          <span>/</span>
          <span className="text-foreground">{team?.name ?? '…'}</span>
          <span>/</span>
          <span>Issues</span>
        </nav>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-pulse-glow w-16 h-16 rounded-full bg-primary/20" />
          </div>
        ) : tasks.length === 0 ? (
          <Card className="glass-card p-8 text-center">
            <p className="text-muted-foreground">No issues in this team yet.</p>
          </Card>
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
                        <p className="text-xs text-muted-foreground px-8 py-2">No issues</p>
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
      </div>
    </AppShell>
  );
}
