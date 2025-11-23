import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Task, TaskStatus } from '@/types';
import { mockTasksApi } from '@/services/mockApi';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar, Clock, Users, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const statusColumns: { status: TaskStatus; label: string; color: string }[] = [
  { status: 'todo', label: 'To Do', color: 'bg-gray-500/20 text-gray-500 border-gray-500/30' },
  { status: 'in-progress', label: 'In Progress', color: 'bg-blue-500/20 text-blue-500 border-blue-500/30' },
  { status: 'blocked', label: 'Blocked', color: 'bg-red-500/20 text-red-500 border-red-500/30' },
  { status: 'review', label: 'Review', color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' },
  { status: 'done', label: 'Done', color: 'bg-green-500/20 text-green-500 border-green-500/30' },
];

const priorityColors = {
  low: 'bg-green-500/10 text-green-500 border-green-500/20',
  medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  high: 'bg-red-500/10 text-red-500 border-red-500/20',
};

export default function KanbanView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  useEffect(() => {
    const loadTasks = async () => {
      const filters = user?.role === 'collaborator' ? { assignedTo: user.id } : {};
      const data = await mockTasksApi.getAll(filters);
      setTasks(data);
    };
    loadTasks();
  }, [user]);

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    if (!draggedTask || draggedTask.status === targetStatus) {
      setDraggedTask(null);
      return;
    }

    try {
      const updatedTask = await mockTasksApi.update(draggedTask.id, {
        status: targetStatus,
      });
      
      setTasks(prev =>
        prev.map(t => (t.id === draggedTask.id ? updatedTask : t))
      );
      
      toast({
        title: 'Status updated',
        description: `Task moved to ${statusColumns.find(c => c.status === targetStatus)?.label}`,
      });
      
      setDraggedTask(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update task status.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    
    try {
      await mockTasksApi.delete(taskToDelete);
      setTasks(tasks.filter(t => t.id !== taskToDelete));
      toast({
        title: 'Task deleted',
        description: 'The task has been deleted successfully.',
      });
      setTaskToDelete(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete task.',
        variant: 'destructive',
      });
    }
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(t => t.status === status);
  };

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <Badge variant="outline">{tasks.length} tasks</Badge>
      </div>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
          {statusColumns.map((column) => {
            const columnTasks = getTasksByStatus(column.status);
            return (
              <div
                key={column.status}
                className="flex-shrink-0 w-80"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.status)}
              >
                <Card className="glass-card p-4 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Badge className={column.color} variant="outline">
                        {column.label}
                      </Badge>
                      <Badge variant="secondary" className="h-6 w-6 p-0 flex items-center justify-center">
                        {columnTasks.length}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3 min-h-[400px]">
                    {columnTasks.map((task) => {
                      const overdue = isOverdue(task.deadline) && task.status !== 'done';
                      return (
                        <Card
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task)}
                          className={cn(
                            "glass-card p-4 cursor-move hover:border-primary/50 transition-all group",
                            overdue && "border-red-500/50"
                          )}
                          onClick={() => navigate(`/tasks/${task.id}`)}
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-semibold text-sm line-clamp-2 flex-1">
                                {task.title}
                              </h4>
                              {user?.role === 'admin' && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setTaskToDelete(task.id);
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>

                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {task.description}
                            </p>

                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className={cn(priorityColors[task.priority], "text-xs")} variant="outline">
                                {task.priority}
                              </Badge>
                              {task.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>

                            <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t border-border">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span className={overdue ? 'text-red-500 font-medium' : ''}>
                                  {formatDistanceToNow(new Date(task.deadline), { addSuffix: true })}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{task.estimatedHours}h</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>{task.assignedTo.length}</span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                    {columnTasks.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No tasks in this column
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Delete Confirmation */}
        <AlertDialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Task?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this task? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteTask}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}

