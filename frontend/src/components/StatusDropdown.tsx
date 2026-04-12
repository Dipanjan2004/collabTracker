import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { TaskStatus } from '@/types';
import { StatusIcon } from './StatusIcon';
import { cn } from '@/lib/utils';

const statuses: TaskStatus[] = ['backlog', 'todo', 'in_progress', 'done', 'cancelled'];

const statusLabels: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  todo: 'Todo',
  in_progress: 'In Progress',
  done: 'Done',
  cancelled: 'Cancelled',
};

interface StatusDropdownProps {
  value: TaskStatus;
  onChange: (status: TaskStatus) => void;
}

export function StatusDropdown({ value, onChange }: StatusDropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 px-2 text-white hover:bg-white/10"
        >
          <StatusIcon status={value} />
          <span className="text-xs font-medium">{statusLabels[value]}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-48 rounded-lg border border-white/10 bg-[#111] p-1"
      >
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => {
              onChange(status);
              setOpen(false);
            }}
            className={cn(
              'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-white transition-colors hover:bg-white/10',
              value === status && 'bg-white/5',
            )}
          >
            <StatusIcon status={status} />
            <span>{statusLabels[status]}</span>
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
