import { useEffect, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/types';
import { labelsApi } from '@/services/api';
import { cn } from '@/lib/utils';

interface LabelPickerProps {
  value: Label[];
  onChange: (labels: Label[]) => void;
  teamId?: string;
}

export function LabelPicker({ value, onChange, teamId }: LabelPickerProps) {
  const [open, setOpen] = useState(false);
  const [allLabels, setAllLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      labelsApi
        .getAll(teamId)
        .then(setAllLabels)
        .finally(() => setLoading(false));
    }
  }, [open, teamId]);

  const groupedLabels = useMemo(() => {
    const groups: Record<string, Label[]> = {};
    for (const label of allLabels) {
      const group = label.groupName || 'Ungrouped';
      if (!groups[group]) groups[group] = [];
      groups[group].push(label);
    }
    return groups;
  }, [allLabels]);

  const selectedIds = new Set(value.map((l) => l.id));

  const toggleLabel = (label: Label) => {
    if (selectedIds.has(label.id)) {
      onChange(value.filter((l) => l.id !== label.id));
    } else {
      onChange([...value, label]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 px-2 text-white hover:bg-white/10"
        >
          {value.length > 0 ? (
            <>
              <div className="flex -space-x-0.5">
                {value.slice(0, 3).map((label) => (
                  <span
                    key={label.id}
                    className="h-3 w-3 rounded-full border border-white/20"
                    style={{ backgroundColor: label.color }}
                  />
                ))}
              </div>
              <span className="text-xs font-medium">
                {value.length === 1 ? value[0].name : `${value.length} labels`}
              </span>
            </>
          ) : (
            <span className="text-xs font-medium text-white/50">Labels</span>
          )}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-64 max-h-72 overflow-y-auto rounded-lg border border-white/10 bg-[#111] p-1"
      >
        {loading && (
          <div className="px-2 py-3 text-center text-xs text-white/30">Loading...</div>
        )}
        {!loading &&
          Object.entries(groupedLabels).map(([group, labels]) => (
            <div key={group}>
              <div className="px-2 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-white/30">
                {group}
              </div>
              {labels.map((label) => (
                <button
                  key={label.id}
                  onClick={() => toggleLabel(label)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-white transition-colors hover:bg-white/10',
                    selectedIds.has(label.id) && 'bg-white/5',
                  )}
                >
                  <Checkbox
                    checked={selectedIds.has(label.id)}
                    className="h-3.5 w-3.5 border-white/20 data-[state=checked]:bg-white data-[state=checked]:border-white"
                  />
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: label.color }}
                  />
                  <span>{label.name}</span>
                </button>
              ))}
            </div>
          ))}
        {!loading && allLabels.length === 0 && (
          <div className="px-2 py-3 text-center text-xs text-white/30">No labels</div>
        )}
      </PopoverContent>
    </Popover>
  );
}
