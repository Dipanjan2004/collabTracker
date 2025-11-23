import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { TaskCard } from '@/components/TaskCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, X, Grid3x3, List, Calendar as CalendarIcon, LayoutGrid, CheckSquare, Square } from 'lucide-react';
import CalendarView from './CalendarView';
import { Task, ProgressLog, TaskStatus, TaskPriority } from '@/types';
import { mockTasksApi, mockProgressApi } from '@/services/mockApi';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import KanbanView from './KanbanView';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';

export default function Tasks() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [progressLogs, setProgressLogs] = useState<Record<string, ProgressLog[]>>({});
  const [search, setSearch] = useState('');
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban' | 'calendar'>('grid');
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<TaskStatus[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority[]>([]);
  const [tagsFilter, setTagsFilter] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'deadline' | 'priority' | 'created' | 'updated' | 'title'>('deadline');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [showBulkMenu, setShowBulkMenu] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  
  // Get all unique tags
  const allTags = Array.from(new Set(tasks.flatMap(t => t.tags)));

  useEffect(() => {
    const loadTasks = async () => {
      const filters: any = user?.role === 'collaborator' ? { assignedTo: user.id } : {};
      filters.archived = showArchived;
      const data = await mockTasksApi.getAll(filters);
      setTasks(data);

      // Load progress logs for each task
      const logsMap: Record<string, ProgressLog[]> = {};
      for (const task of data) {
        const logs = await mockProgressApi.getByTaskId(task.id);
        logsMap[task.id] = logs;
      }
      setProgressLogs(logsMap);
    };
    loadTasks();
  }, [user, location.key, showArchived]); // Reload when navigation occurs or archive filter changes

  const filteredTasks = tasks
    .filter(task => {
      // Search filter
      const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.description.toLowerCase().includes(search.toLowerCase()) ||
        task.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
      
      if (!matchesSearch) return false;
      
      // Status filter
      if (statusFilter.length > 0 && !statusFilter.includes(task.status)) return false;
      
      // Priority filter
      if (priorityFilter.length > 0 && !priorityFilter.includes(task.priority)) return false;
      
      // Tags filter
      if (tagsFilter.length > 0 && !tagsFilter.some(tag => task.tags.includes(tag))) return false;
      
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'deadline':
          comparison = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
          break;
        case 'priority':
          const priorityOrder: Record<TaskPriority, number> = { high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
          break;
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'updated':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  
  const clearFilters = () => {
    setStatusFilter([]);
    setPriorityFilter([]);
    setTagsFilter([]);
    setSortBy('deadline');
    setSortOrder('asc');
  };
  
  const activeFiltersCount = statusFilter.length + priorityFilter.length + tagsFilter.length;

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    
    try {
      if (bulkDeleteMode && selectedTasks.size > 1) {
        // Bulk delete
        await Promise.all(Array.from(selectedTasks).map(id => mockTasksApi.delete(id)));
        setTasks(prev => prev.filter(t => !selectedTasks.has(t.id)));
        setProgressLogs(prev => {
          const updated = { ...prev };
          selectedTasks.forEach(id => delete updated[id]);
          return updated;
        });
        toast({
          title: 'Tasks deleted',
          description: `${selectedTasks.size} task(s) deleted successfully.`,
        });
        setSelectedTasks(new Set());
        setBulkDeleteMode(false);
      } else {
        // Single delete
        await mockTasksApi.delete(taskToDelete);
        setTasks(tasks.filter(t => t.id !== taskToDelete));
        setProgressLogs(prev => {
          const updated = { ...prev };
          delete updated[taskToDelete];
          return updated;
        });
        toast({
          title: 'Task deleted',
          description: 'The task has been deleted successfully.',
        });
      }
      setTaskToDelete(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete task(s).',
        variant: 'destructive',
      });
    }
  };
  
  const handleSelectAll = () => {
    if (selectedTasks.size === filteredTasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(filteredTasks.map(t => t.id)));
    }
  };
  
  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t
    ));
    toast({
      title: 'Status updated',
      description: 'Task status has been updated successfully.',
    });
  };
  
  const handleArchive = async (taskId: string) => {
    try {
      if (showArchived) {
        await mockTasksApi.unarchive(taskId);
        toast({
          title: 'Task unarchived',
          description: 'Task has been unarchived successfully.',
        });
      } else {
        await mockTasksApi.archive(taskId);
        toast({
          title: 'Task archived',
          description: 'Task has been archived successfully.',
        });
      }
      
      // Reload tasks
      const filters: any = user?.role === 'collaborator' ? { assignedTo: user.id } : {};
      filters.archived = showArchived;
      const data = await mockTasksApi.getAll(filters);
      setTasks(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to archive/unarchive task.',
        variant: 'destructive',
      });
    }
  };
  
  const handleClone = async (taskId: string) => {
    if (!user) return;
    
    try {
      const cloned = await mockTasksApi.clone(taskId, user.id);
      toast({
        title: 'Task cloned',
        description: 'Task has been cloned successfully.',
      });
      navigate(`/tasks/${cloned.id}/edit`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clone task.',
        variant: 'destructive',
      });
    }
  };
  
  const reloadTasks = async () => {
    const filters = user?.role === 'collaborator' ? { assignedTo: user.id } : {};
    const data = await mockTasksApi.getAll(filters);
    setTasks(data);
  };
  
  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };
  
  const handleBulkStatusChange = async (newStatus: TaskStatus) => {
    try {
      await Promise.all(
        Array.from(selectedTasks).map(taskId =>
          mockTasksApi.update(taskId, { status: newStatus })
        )
      );
      
      setTasks(prev => prev.map(t =>
        selectedTasks.has(t.id) ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t
      ));
      
      toast({
        title: 'Tasks updated',
        description: `${selectedTasks.size} task(s) updated to ${newStatus.replace('-', ' ')}`,
      });
      
      setSelectedTasks(new Set());
      setShowBulkMenu(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update tasks.',
        variant: 'destructive',
      });
    }
  };
  
  const handleBulkDelete = () => {
    if (selectedTasks.size === 0) return;
    setTaskToDelete(Array.from(selectedTasks)[0]); // Use existing delete flow for first task
  };

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Tasks</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 border border-border rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('kanban')}
              >
                Kanban
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('calendar')}
              >
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {user?.role === 'admin' && (
                <>
                  <Button
                    variant={showArchived ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShowArchived(!showArchived)}
                  >
                    {showArchived ? 'Show Active' : 'Show Archived'}
                  </Button>
                  <Button onClick={() => navigate('/tasks/create')}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Task
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks by title, description, or tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Popover open={showFilters} onOpenChange={setShowFilters}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="relative">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Filters</h4>
                    {activeFiltersCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        Clear all
                      </Button>
                    )}
                  </div>
                  
                  {/* Status Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Status</label>
                    <div className="space-y-2">
                      {(['todo', 'in-progress', 'blocked', 'review', 'done'] as TaskStatus[]).map((status) => (
                        <div key={status} className="flex items-center space-x-2">
                          <Checkbox
                            id={`status-${status}`}
                            checked={statusFilter.includes(status)}
                            onCheckedChange={(checked) => {
                              setStatusFilter(prev =>
                                checked
                                  ? [...prev, status]
                                  : prev.filter(s => s !== status)
                              );
                            }}
                          />
                          <label
                            htmlFor={`status-${status}`}
                            className="text-sm cursor-pointer capitalize"
                          >
                            {status.replace('-', ' ')}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Priority Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Priority</label>
                    <div className="space-y-2">
                      {(['low', 'medium', 'high'] as TaskPriority[]).map((priority) => (
                        <div key={priority} className="flex items-center space-x-2">
                          <Checkbox
                            id={`priority-${priority}`}
                            checked={priorityFilter.includes(priority)}
                            onCheckedChange={(checked) => {
                              setPriorityFilter(prev =>
                                checked
                                  ? [...prev, priority]
                                  : prev.filter(p => p !== priority)
                              );
                            }}
                          />
                          <label
                            htmlFor={`priority-${priority}`}
                            className="text-sm cursor-pointer capitalize"
                          >
                            {priority}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Tags Filter */}
                  {allTags.length > 0 && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">Tags</label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {allTags.map((tag) => (
                          <div key={tag} className="flex items-center space-x-2">
                            <Checkbox
                              id={`tag-${tag}`}
                              checked={tagsFilter.includes(tag)}
                              onCheckedChange={(checked) => {
                                setTagsFilter(prev =>
                                  checked
                                    ? [...prev, tag]
                                    : prev.filter(t => t !== tag)
                                );
                              }}
                            />
                            <label
                              htmlFor={`tag-${tag}`}
                              className="text-sm cursor-pointer"
                            >
                              {tag}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            
            {/* Sort */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <List className="h-4 w-4 mr-2" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { setSortBy('deadline'); setSortOrder('asc'); }}>
                  Deadline {sortBy === 'deadline' && (sortOrder === 'asc' ? '↑' : '↓')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSortBy('priority'); setSortOrder('desc'); }}>
                  Priority {sortBy === 'priority' && (sortOrder === 'desc' ? '↓' : '↑')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSortBy('created'); setSortOrder('desc'); }}>
                  Created Date {sortBy === 'created' && (sortOrder === 'desc' ? '↓' : '↑')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSortBy('updated'); setSortOrder('desc'); }}>
                  Updated Date {sortBy === 'updated' && (sortOrder === 'desc' ? '↓' : '↑')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSortBy('title'); setSortOrder('asc'); }}>
                  Title {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2">
              {statusFilter.map(status => (
                <Badge key={status} variant="secondary" className="gap-1">
                  Status: {status.replace('-', ' ')}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setStatusFilter(prev => prev.filter(s => s !== status))}
                  />
                </Badge>
              ))}
              {priorityFilter.map(priority => (
                <Badge key={priority} variant="secondary" className="gap-1">
                  Priority: {priority}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setPriorityFilter(prev => prev.filter(p => p !== priority))}
                  />
                </Badge>
              ))}
              {tagsFilter.map(tag => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  Tag: {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setTagsFilter(prev => prev.filter(t => t !== tag))}
                  />
                </Badge>
              ))}
            </div>
          )}
          
          {/* Results Count and Select All */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {filteredTasks.length} of {tasks.length} tasks
            </div>
            {user?.role === 'admin' && filteredTasks.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedTasks.size === filteredTasks.length ? (
                  <>
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Deselect All
                  </>
                ) : (
                  <>
                    <Square className="h-4 w-4 mr-2" />
                    Select All
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Task List */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.length === 0 ? (
              <Card className="glass-card p-8 text-center col-span-full">
                <p className="text-muted-foreground">No tasks found matching your filters.</p>
              </Card>
            ) : (
              filteredTasks.map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  progressLogs={progressLogs[task.id] || []}
                  showDelete={user?.role === 'admin'}
                  onDelete={(taskId) => setTaskToDelete(taskId)}
                  onStatusChange={handleStatusChange}
                  onArchive={user?.role === 'admin' ? handleArchive : undefined}
                  onClone={user?.role === 'admin' ? handleClone : undefined}
                  isSelected={selectedTasks.has(task.id)}
                  onSelect={toggleTaskSelection}
                  showCheckbox={user?.role === 'admin'}
                  isArchived={showArchived}
                />
              ))
            )}
          </div>
        )}
        
        {viewMode === 'list' && (
          <div className="space-y-2">
            {filteredTasks.length === 0 ? (
              <Card className="glass-card p-8 text-center">
                <p className="text-muted-foreground">No tasks found matching your filters.</p>
              </Card>
            ) : (
              filteredTasks.map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  progressLogs={progressLogs[task.id] || []}
                  showDelete={user?.role === 'admin'}
                  onDelete={(taskId) => setTaskToDelete(taskId)}
                  onStatusChange={handleStatusChange}
                  onArchive={user?.role === 'admin' ? handleArchive : undefined}
                  onClone={user?.role === 'admin' ? handleClone : undefined}
                  isSelected={selectedTasks.has(task.id)}
                  onSelect={toggleTaskSelection}
                  showCheckbox={user?.role === 'admin'}
                  isArchived={showArchived}
                  compact
                />
              ))
            )}
          </div>
        )}
        
        {viewMode === 'kanban' && <KanbanView />}
        {viewMode === 'calendar' && <CalendarView />}

        {/* Delete Task Confirmation Dialog */}
        <AlertDialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {bulkDeleteMode && selectedTasks.size > 1 ? `Delete ${selectedTasks.size} Tasks?` : 'Delete Task?'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {bulkDeleteMode && selectedTasks.size > 1
                  ? `Are you sure you want to delete ${selectedTasks.size} tasks? This action cannot be undone and will remove all associated progress logs.`
                  : 'Are you sure you want to delete this task? This action cannot be undone and will remove all associated progress logs.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setBulkDeleteMode(false)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  handleDeleteTask();
                  setBulkDeleteMode(false);
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {bulkDeleteMode && selectedTasks.size > 1 ? `Delete ${selectedTasks.size} Tasks` : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppShell>
  );
}
