import { useState, useEffect, useCallback } from 'react';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import { searchApi } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { CreateIssueModal } from './CreateIssueModal';
import { SearchResult } from '@/types';
import { Circle, Folder, User, Plus } from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
      return;
    }
  }, [open]);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    try {
      const data = await searchApi.search(q);
      setResults(data);
    } catch {
      setResults([]);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 200);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  const issues = results.filter((r) => r.type === 'issue');
  const projects = results.filter((r) => r.type === 'project');
  const users = results.filter((r) => r.type === 'user');

  const handleSelect = (callback: () => void) => {
    onOpenChange(false);
    callback();
  };

  return (
    <>
      <CommandDialog open={open} onOpenChange={onOpenChange}>
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder="Search issues, projects, users..."
          className="text-white"
        />
        <CommandList className="bg-[#0a0a0a]">
          <CommandEmpty className="text-white/40">No results found.</CommandEmpty>

          {issues.length > 0 && (
            <CommandGroup heading="Issues" className="text-white/30 [&_[cmdk-group-heading]]:text-white/30">
              {issues.map((issue) => (
                <CommandItem
                  key={issue.id}
                  value={issue.identifier ?? issue.title}
                  onSelect={() => handleSelect(() => navigate(`/tasks/${issue.id}`))}
                  className="text-white hover:bg-white/10 aria-selected:bg-white/10 cursor-pointer"
                >
                  <Circle className="mr-2 h-3.5 w-3.5 text-blue-400" />
                  <span className="font-mono text-xs text-white/50 mr-2">
                    {issue.identifier}
                  </span>
                  <span>{issue.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {projects.length > 0 && (
            <CommandGroup heading="Projects" className="text-white/30 [&_[cmdk-group-heading]]:text-white/30">
              {projects.map((project) => (
                <CommandItem
                  key={project.id}
                  value={project.title}
                  onSelect={() => handleSelect(() => navigate('/tasks'))}
                  className="text-white hover:bg-white/10 aria-selected:bg-white/10 cursor-pointer"
                >
                  <Folder className="mr-2 h-3.5 w-3.5 text-purple-400" />
                  <span>{project.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {users.length > 0 && (
            <CommandGroup heading="Users" className="text-white/30 [&_[cmdk-group-heading]]:text-white/30">
              {users.map((user) => (
                <CommandItem
                  key={user.id}
                  value={user.title}
                  className="text-white hover:bg-white/10 aria-selected:bg-white/10 cursor-pointer"
                >
                  <User className="mr-2 h-3.5 w-3.5 text-green-400" />
                  <span>{user.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandGroup heading="Actions" className="text-white/30 [&_[cmdk-group-heading]]:text-white/30">
            <CommandItem
              value="create-issue"
              onSelect={() => {
                onOpenChange(false);
                setCreateOpen(true);
              }}
              className="text-white hover:bg-white/10 aria-selected:bg-white/10 cursor-pointer"
            >
              <Plus className="mr-2 h-3.5 w-3.5" />
              <span>Create Issue</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      <CreateIssueModal open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
