import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { TaskPriority } from '@/types';
import { PriorityIcon } from './PriorityIcon';
import { cn } from '@/lib/utils';

const priorities: TaskPriority[] = ['urgent', 'high', 'medium', 'low', 'none'];

const priorityLabels: Record<TaskPriority, string> = {
  urgent: 'Urgent',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  none: 'No priority',
};

interface PriorityDropdownProps {
  value: TaskPriority;
  onChange: (priority: TaskPriority) => void;
}

export function PriorityDropdown({ value, onChange }: PriorityDropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 px-2 text-white hover:bg-white/10"
        >
          <PriorityIcon priority={value} />
          <span className="text-xs font-medium">{priorityLabels[value]}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-48 rounded-lg border border-white/10 bg-[#111] p-1"
      >
        {priorities.map((priority) => (
          <button
            key={priority}
            onClick={() => {
              onChange(priority);
              setOpen(false);
            }}
            className={cn(
              'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-white transition-colors hover:bg-white/10',
              value === priority && 'bg-white/5',
            )}
          >
            <PriorityIcon priority={priority} />
            <span>{priorityLabels[priority]}</span>
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
