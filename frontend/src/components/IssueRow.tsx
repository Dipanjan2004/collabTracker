import { useState, useEffect, useRef } from 'react';
import { Task, User } from '@/types';
import { StatusIcon } from './StatusIcon';
import { PriorityIcon } from './PriorityIcon';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { usersApi } from '@/services/api';

// Simple shared cache with expiry - refreshes every 60 seconds
let _usersCache: { data: User[]; ts: number } | null = null;
const CACHE_TTL = 60_000;

async function getUsers(): Promise<User[]> {
  if (_usersCache && Date.now() - _usersCache.ts < CACHE_TTL) {
    return _usersCache.data;
  }
  const data = await usersApi.getAll();
  _usersCache = { data, ts: Date.now() };
  return data;
}

interface IssueRowProps {
  task: Task;
  onSelect?: () => void;
  isSelected?: boolean;
}

export function IssueRow({ task, onSelect, isSelected = false }: IssueRowProps) {
  const [users, setUsers] = useState<User[]>(_usersCache?.data || []);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    getUsers().then(setUsers).catch(() => {});
  }, []);

  const assignee = users.find((u) => u.id === task.assigneeId);

  return (
    <div
      onClick={onSelect}
      className={cn(
        'flex items-center gap-2 h-9 px-3 cursor-pointer transition-colors',
        isSelected ? 'bg-white/10' : 'hover:bg-white/5',
      )}
    >
      <StatusIcon status={task.status} size={14} />

      <span className="text-white/30 font-mono text-xs shrink-0">
        {task.identifier}
      </span>

      <span className="text-white text-[13px] truncate flex-1 min-w-0">
        {task.title}
      </span>

      <div className="flex items-center gap-0.5 shrink-0">
        {(task.labels || []).map((label) => (
          <span
            key={label.id}
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: label.color }}
          />
        ))}
      </div>

      {assignee && (
        <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[9px] text-white/70 shrink-0">
          {assignee.name.charAt(0).toUpperCase()}
        </span>
      )}

      <PriorityIcon priority={task.priority} className="shrink-0" />

      <span className="text-white/30 text-xs font-mono shrink-0 tabular-nums">
        {task.updatedAt
          ? formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true })
          : ''}
      </span>
    </div>
  );
}
