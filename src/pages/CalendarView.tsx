import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Task } from '@/types';
import { mockTasksApi } from '@/services/mockApi';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from 'date-fns';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, CalendarIcon, Clock, Users } from 'lucide-react';

const priorityColors = {
  low: 'bg-green-500/20 text-green-500 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
  high: 'bg-red-500/20 text-red-500 border-red-500/30',
};

export default function CalendarView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    const loadTasks = async () => {
      const filters = user?.role === 'collaborator' ? { assignedTo: user.id } : {};
      const data = await mockTasksApi.getAll(filters);
      setTasks(data);
    };
    loadTasks();
  }, [user]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      const taskDeadline = new Date(task.deadline);
      return isSameDay(taskDeadline, date);
    });
  };

  const getTasksForSelectedDate = () => {
    if (!selectedDate) return [];
    return getTasksForDate(selectedDate);
  };

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
  };

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Calendar View</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => navigateMonth('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => setCurrentMonth(new Date())}>
              Today
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card className="glass-card p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">
                  {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {/* Empty cells for days before month start */}
                  {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}
                  
                  {/* Days in month */}
                  {daysInMonth.map(day => {
                    const dayTasks = getTasksForDate(day);
                    const hasOverdue = dayTasks.some(t => isOverdue(t.deadline));
                    const isToday = isSameDay(day, new Date());
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    
                    return (
                      <Popover key={day.toString()}>
                        <PopoverTrigger asChild>
                          <div
                            className={cn(
                              "aspect-square border border-border rounded-lg p-2 cursor-pointer hover:border-primary/50 transition-colors relative",
                              isToday && "bg-primary/10 border-primary",
                              isSelected && "ring-2 ring-primary",
                              hasOverdue && "border-red-500/50"
                            )}
                            onClick={() => setSelectedDate(day)}
                          >
                            <div className={cn(
                              "text-sm font-medium mb-1",
                              isToday && "text-primary font-bold"
                            )}>
                              {format(day, 'd')}
                            </div>
                            <div className="flex flex-col gap-1">
                              {dayTasks.slice(0, 2).map(task => (
                                <div
                                  key={task.id}
                                  className={cn(
                                    "text-xs p-1 rounded truncate",
                                    priorityColors[task.priority]
                                  )}
                                  title={task.title}
                                >
                                  {task.title}
                                </div>
                              ))}
                              {dayTasks.length > 2 && (
                                <div className="text-xs text-muted-foreground">
                                  +{dayTasks.length - 2} more
                                </div>
                              )}
                            </div>
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-80" align="start">
                          <div className="space-y-2">
                            <h4 className="font-semibold">{format(day, 'EEEE, MMMM d')}</h4>
                            {dayTasks.length === 0 ? (
                              <p className="text-sm text-muted-foreground">No tasks on this day</p>
                            ) : (
                              dayTasks.map(task => (
                                <Card
                                  key={task.id}
                                  className="glass-card p-3 cursor-pointer hover:border-primary/50 transition-colors"
                                  onClick={() => navigate(`/tasks/${task.id}`)}
                                >
                                  <div className="space-y-2">
                                      <div className="flex items-start justify-between gap-2">
                                        <h5 className="font-semibold text-sm line-clamp-1">{task.title}</h5>
                                        <Badge className={cn(priorityColors[task.priority], "text-xs")} variant="outline">
                                          {task.priority}
                                        </Badge>
                                      </div>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        <span>{task.estimatedHours}h</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        <span>{task.assignedTo.length}</span>
                                      </div>
                                      {isOverdue(task.deadline) && (
                                        <Badge variant="destructive" className="text-xs">Overdue</Badge>
                                      )}
                                    </div>
                                  </div>
                                </Card>
                              ))
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>

          {/* Selected Date Tasks */}
          <div className="space-y-4">
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">
                {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
              </h3>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {getTasksForSelectedDate().length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No tasks on this date
                  </p>
                ) : (
                  getTasksForSelectedDate().map(task => (
                    <Card
                      key={task.id}
                      className="glass-card p-4 cursor-pointer hover:border-primary/50 transition-colors group"
                      onClick={() => navigate(`/tasks/${task.id}`)}
                    >
                      <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-sm line-clamp-2">{task.title}</h4>
                            <Badge className={cn(priorityColors[task.priority], "text-xs")} variant="outline">
                              {task.priority}
                            </Badge>
                          </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{task.estimatedHours}h</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{task.assignedTo.length}</span>
                          </div>
                          {isOverdue(task.deadline) && (
                            <Badge variant="destructive" className="text-xs">Overdue</Badge>
                          )}
                        </div>
                        <Badge variant="secondary" className="text-xs mt-2">
                          {task.status.replace('-', ' ')}
                        </Badge>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

