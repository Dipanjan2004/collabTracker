import { useEffect, useState } from 'react';
import { Calendar, Clock, Users, Trash2, CheckSquare, Square, Archive, Copy } from 'lucide-react';
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
import { mockUsersApi, mockTasksApi } from '@/services/mockApi';

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
  low: 'bg-green-500/10 text-green-500 border-green-500/20',
  medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  high: 'bg-red-500/10 text-red-500 border-red-500/20',
};

const statusColors = {
  todo: 'bg-gray-500/10 text-gray-500',
  'in-progress': 'bg-blue-500/10 text-blue-500',
  blocked: 'bg-red-500/10 text-red-500',
  review: 'bg-yellow-500/10 text-yellow-500',
  done: 'bg-green-500/10 text-green-500',
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
      const allUsers = await mockUsersApi.getAll();
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
      await mockTasksApi.update(task.id, { status: newStatus });
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
        "glass-card hover-scale transition-all group relative",
        compact ? "p-3" : "p-4",
        isOverdue && "border-red-500/50",
        !showDelete && "cursor-pointer"
      )}
      onClick={() => !showDelete && navigate(`/tasks/${task.id}`)}
    >
      <div className={cn("space-y-3", showDelete && "pr-10")}>
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          {showCheckbox && onSelect && (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 mt-0.5"
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
          <h3 className={cn("font-semibold line-clamp-2 flex-1", showDelete && "cursor-pointer", showCheckbox && "cursor-pointer")} onClick={() => navigate(`/tasks/${task.id}`)}>
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

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {task.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Progress */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{latestProgress}%</span>
          </div>
          <Progress value={latestProgress} className="h-2" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span className={isOverdue ? 'text-red-500 font-medium' : ''}>
                {isOverdue ? 'Overdue' : formatDistanceToNow(new Date(task.deadline), { addSuffix: true })}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{task.estimatedHours}h</span>
            </div>
          </div>

          {/* Assigned users */}
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span className="text-xs">
              {assignedUsers.length > 0 
                ? assignedUsers.map(u => u.name).join(', ')
                : 'Unassigned'}
            </span>
          </div>
        </div>

        {/* Status */}
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
