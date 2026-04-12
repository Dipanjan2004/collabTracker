import { useEffect, useState } from 'react';
import { Calendar, Clock, Users, Trash2, CheckSquare, Square } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Task, ProgressLog, User, TaskStatus } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { usersApi, tasksApi } from '@/services/api';

interface TaskCardProps {
  task: Task;
  progressLogs?: ProgressLog[];
  onDelete?: (taskId: string) => void;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  onArchive?: (taskId: string) => void;
  onClone?: (taskId: string) => void;
  showDelete?: boolean;
  compact?: boolean;
  isSelected?: boolean;
  onSelect?: (taskId: string) => void;
  showCheckbox?: boolean;
  isArchived?: boolean;
}

const priorityColors = {
  low: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
  medium: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
  high: 'border-rose-500/20 bg-rose-500/10 text-rose-400',
};

const statusColors = {
  todo: 'border-white/10 bg-white/5 text-white/60',
  'in-progress': 'border-blue-500/20 bg-blue-500/10 text-blue-400',
  blocked: 'border-rose-500/20 bg-rose-500/10 text-rose-400',
  review: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
  done: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
};

export function TaskCard({ task, progressLogs = [], onDelete, onStatusChange, onArchive, onClone, showDelete = false, compact = false, isSelected = false, onSelect, showCheckbox = false, isArchived = false }: TaskCardProps) {
  const navigate = useNavigate();
  const [assignedUsers, setAssignedUsers] = useState<User[]>([]);
  
  const latestProgress = progressLogs.length > 0 
    ? Math.max(...progressLogs.map(p => p.percentageComplete))
    : 0;

  const isOverdue = new Date(task.deadline) < new Date() && task.status !== 'done';

  useEffect(() => {
    const loadUsers = async () => {
      const allUsers = await usersApi.getAll();
      const assigned = allUsers.filter(u => task.assignedTo.includes(u.id));
      setAssignedUsers(assigned);
    };
    loadUsers();
  }, [task.assignedTo]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(task.id);
    }
  };
  
  const handleStatusChange = async (newStatus: TaskStatus) => {
    try {
      await tasksApi.update(task.id, { status: newStatus });
      if (onStatusChange) {
        onStatusChange(task.id, newStatus);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  return (
    <Card
      className={cn(
        "glass-card hover-scale group relative overflow-hidden transition-all",
        compact ? "p-3" : "p-4",
        isOverdue && "border-rose-300",
        !showDelete && "cursor-pointer"
      )}
      onClick={() => !showDelete && navigate(`/tasks/${task.id}`)}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#ff4500]/50 via-[#ff4500] to-[#ff4500]/50" />
      <div className={cn("space-y-3", showDelete && "pr-10")}>
        <div className="flex items-start justify-between gap-2">
          {showCheckbox && onSelect && (
            <Button
              variant="ghost"
              size="icon"
              className="mt-0.5 h-5 w-5"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(task.id);
              }}
            >
              {isSelected ? (
                <CheckSquare className="h-5 w-5 text-primary" />
              ) : (
                <Square className="h-5 w-5" />
              )}
            </Button>
          )}
          <h3 className={cn("flex-1 line-clamp-2 text-base font-semibold tracking-tight text-white", showDelete && "cursor-pointer", showCheckbox && "cursor-pointer")} onClick={() => navigate(`/tasks/${task.id}`)}>
            {task.title}
          </h3>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge className={priorityColors[task.priority]} variant="outline">
              {task.priority}
            </Badge>
            {showDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleDelete}
                title="Delete task"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {task.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="border-0 bg-secondary text-[10px] text-secondary-foreground normal-case tracking-normal">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-white/40" style={{ fontFamily: 'monospace' }}>
            <span className="font-medium">Progress</span>
            <span className="font-semibold text-white">{latestProgress}%</span>
          </div>
          <Progress value={latestProgress} className="h-2" />
        </div>

        <div className="flex items-center justify-between text-xs text-white/40" style={{ fontFamily: 'monospace' }}>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span className={isOverdue ? 'font-medium text-rose-600' : ''}>
                {isOverdue ? 'Overdue' : formatDistanceToNow(new Date(task.deadline), { addSuffix: true })}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{task.estimatedHours}h</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span className="text-xs">
              {assignedUsers.length > 0 
                ? assignedUsers.map(u => u.name).join(', ')
                : 'Unassigned'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <Badge className={statusColors[task.status]} variant="secondary">
            {task.status.replace('-', ' ')}
          </Badge>
          {onStatusChange && (
            <Select
              value={task.status}
              onValueChange={(value) => handleStatusChange(value as TaskStatus)}
              onClick={(e) => e.stopPropagation()}
            >
              <SelectTrigger className="h-7 w-32 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    </Card>
  );
}
