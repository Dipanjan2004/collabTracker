import { useEffect, useState, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cyclesApi, tasksApi } from '@/services/api';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Cycle, Task } from '@/types';
import { Plus, Calendar, RefreshCw } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';

import { CycleProgress } from '@/components/CycleProgress';

const STATUS_BADGE: Record<string, string> = {
  upcoming: 'bg-blue-500/15 text-blue-400',
  active: 'bg-green-500/15 text-green-400',
  completed: 'bg-gray-500/15 text-gray-400',
};

export default function Cycles() {
  const { activeTeam } = useWorkspace();
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');

  const teamId = activeTeam?.id;

  useEffect(() => {
    const load = async () => {
      try {
        if (!teamId) return;
        const [cycleData, taskData] = await Promise.all([
          cyclesApi.getAll(teamId),
          tasksApi.getAll({ teamId }),
        ]);
        setCycles(cycleData);
        setTasks(taskData);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [teamId]);

  const { active, upcoming, completed } = useMemo(() => {
    const active = cycles.filter((c) => c.status === 'active');
    const upcoming = cycles.filter((c) => c.status === 'upcoming');
    const completed = cycles.filter((c) => c.status === 'completed');
    return { active, upcoming, completed };
  }, [cycles]);

  const renderCycle = (cycle: Cycle) => {
    const daysLeft = differenceInDays(parseISO(cycle.endDate), new Date());
    return (
      <Card key={cycle.id} className="glass-card p-5 hover:bg-white/[0.03] transition-colors">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-foreground">{cycle.name}</h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {format(parseISO(cycle.startDate), 'MMM d')} – {format(parseISO(cycle.endDate), 'MMM d, yyyy')}
              {cycle.status === 'active' && daysLeft > 0 && (
                <span className="text-primary">({daysLeft}d left)</span>
              )}
            </div>
          </div>
          <Badge className={STATUS_BADGE[cycle.status] ?? ''}>
            {cycle.status}
          </Badge>
        </div>
        <CycleProgress cycle={cycle} tasks={tasks} />
      </Card>
    );
  };

  const section = (label: string, items: Cycle[]) => {
    if (items.length === 0) return null;
    return (
      <div>
        <p className="eyebrow mb-3">{label}</p>
        <div className="space-y-3">{items.map(renderCycle)}</div>
      </div>
    );
  };

  return (
    <AppShell>
      <div className="page-shell space-y-6 animate-fade-in">
        <div className="section-header">
          <div>
            <p className="eyebrow">Cycles</p>
            <h1 className="app-heading mt-2 text-3xl md:text-4xl">Cycles</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Plan and track your team's sprints
            </p>
          </div>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Cycle
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-pulse-glow w-16 h-16 rounded-full bg-primary/20" />
          </div>
        ) : cycles.length === 0 ? (
          <Card className="glass-card p-8 text-center">
            <RefreshCw className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No cycles yet.</p>
          </Card>
        ) : (
          <div className="space-y-8">
            {section('Active Cycle', active)}
            {section('Upcoming Cycles', upcoming)}
            {section('Completed Cycles', completed)}
          </div>
        )}

        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Cycle</DialogTitle>
              <DialogDescription>Define a new cycle for your team.</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newName.trim() || !newStart || !newEnd || !teamId) return;
                await cyclesApi.create({
                  teamId,
                  name: newName.trim(),
                  startDate: newStart,
                  endDate: newEnd,
                });
                const data = await cyclesApi.getAll(teamId);
                setCycles(data);
                setNewName('');
                setNewStart('');
                setNewEnd('');
                setShowCreate(false);
              }}
              className="space-y-4 mt-4"
            >
              <Input
                placeholder="Cycle name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Start date</label>
                  <Input
                    type="date"
                    value={newStart}
                    onChange={(e) => setNewStart(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">End date</label>
                  <Input
                    type="date"
                    value={newEnd}
                    onChange={(e) => setNewEnd(e.target.value)}
                  />
                </div>
              </div>
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
