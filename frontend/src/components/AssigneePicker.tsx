import { useEffect, useState } from 'react';
import { ChevronDown, UserCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { usersApi } from '@/services/api';
import { User } from '@/types';
import { cn } from '@/lib/utils';

interface AssigneePickerProps {
  value: string | null;
  onChange: (id: string | null) => void;
}

export function AssigneePicker({ value, onChange }: AssigneePickerProps) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      usersApi
        .getAll()
        .then(setUsers)
        .finally(() => setLoading(false));
    }
  }, [open]);

  const selectedUser = users.find((u) => u.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 px-2 text-white hover:bg-white/10"
        >
          {selectedUser ? (
            <>
              <Avatar className="h-4 w-4">
                <AvatarFallback className="bg-white/10 text-[8px] text-white">
                  {selectedUser.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium">{selectedUser.name}</span>
            </>
          ) : (
            <>
              <UserCircle className="h-3.5 w-3.5 opacity-50" />
              <span className="text-xs font-medium text-white/50">Unassigned</span>
            </>
          )}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-56 rounded-lg border border-white/10 bg-[#111] p-1"
      >
        <button
          onClick={() => {
            onChange(null);
            setOpen(false);
          }}
          className={cn(
            'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-white/50 transition-colors hover:bg-white/10',
            value === null && 'bg-white/5',
          )}
        >
          <UserCircle className="h-4 w-4" />
          <span>Unassigned</span>
        </button>
        {loading && (
          <div className="px-2 py-3 text-center text-xs text-white/30">Loading...</div>
        )}
        {users.map((user) => (
          <button
            key={user.id}
            onClick={() => {
              onChange(user.id);
              setOpen(false);
            }}
            className={cn(
              'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-white transition-colors hover:bg-white/10',
              value === user.id && 'bg-white/5',
            )}
          >
            <Avatar className="h-4 w-4">
              <AvatarFallback className="bg-white/10 text-[8px] text-white">
                {user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span>{user.name}</span>
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
