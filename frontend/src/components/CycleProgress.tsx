import { Task } from '@/types';

interface CycleProgressProps {
  tasks: Task[];
}

export function CycleProgress({ tasks }: CycleProgressProps) {
  const done = tasks.filter((t) => t.status === 'done').length;
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
  const backlog = tasks.filter((t) => t.status === 'backlog' || t.status === 'todo').length;
  const total = tasks.length;

  if (total === 0) {
    return (
      <div>
        <div className="h-2 w-full rounded-full bg-white/5" />
        <p className="mt-2 text-xs font-mono text-white/40">0 of 0 completed</p>
      </div>
    );
  }

  const donePct = (done / total) * 100;
  const inProgressPct = (inProgress / total) * 100;
  const backlogPct = (backlog / total) * 100;

  return (
    <div>
      <div className="h-2 w-full rounded-full bg-white/5 flex overflow-hidden">
        {donePct > 0 && (
          <div
            className="bg-green-500 h-full rounded-l-full last:rounded-r-full transition-all"
            style={{ width: `${donePct}%` }}
          />
        )}
        {inProgressPct > 0 && (
          <div
            className="bg-blue-500 h-full transition-all"
            style={{ width: `${inProgressPct}%` }}
          />
        )}
        {backlogPct > 0 && (
          <div
            className="bg-white/20 h-full rounded-r-full transition-all"
            style={{ width: `${backlogPct}%` }}
          />
        )}
      </div>
      <p className="mt-2 text-xs font-mono text-white/40">
        {done} of {total} completed
      </p>
    </div>
  );
}
