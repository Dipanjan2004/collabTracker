import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Calendar, Clock, Tag, User, Paperclip, CheckCircle, XCircle, Trash2, Edit, Upload, X, MessageSquare, Send, Timer, Play, Pause } from 'lucide-react';
import { Task, ProgressLog, Comment } from '@/types';
import { tasksApi, progressApi, commentsApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
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

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [task, setTask] = useState<Task | null>(null);
  const [progressLogs, setProgressLogs] = useState<ProgressLog[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Progress form state
  const [progressText, setProgressText] = useState('');
  const [percentageComplete, setPercentageComplete] = useState(0);
  const [hoursSpent, setHoursSpent] = useState(0);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentPreviews, setAttachmentPreviews] = useState<string[]>([]);
  
  // Comments state
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');
  
  // Time tracking state
  const [isTracking, setIsTracking] = useState(false);
  const [trackedTime, setTrackedTime] = useState(0); // in seconds
  const [timerStart, setTimerStart] = useState<Date | null>(null);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadTask = async () => {
      if (!id) return;
      try {
        const [taskData, logs, commentsData] = await Promise.all([
          tasksApi.getById(id),
          progressApi.getByTaskId(id),
          commentsApi.getByTaskId(id),
        ]);
        
        if (!taskData) {
          toast({
            title: 'Error',
            description: 'Task not found.',
            variant: 'destructive',
          });
          navigate('/tasks');
          return;
        }
        
        setTask(taskData);
        setProgressLogs(logs || []);
        setComments(commentsData || []);
        
        // Set percentage from latest log
        if (logs && logs.length > 0) {
          setPercentageComplete(logs[0].percentageComplete);
        }
      } catch (error) {
        console.error('Error loading task:', error);
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load task details.',
          variant: 'destructive',
        });
        navigate('/tasks');
      }
    };
    loadTask();
  }, [id, navigate, toast]);
  
  // Timer effect
  useEffect(() => {
    if (isTracking && timerStart) {
      const id = setInterval(() => {
        const elapsed = Math.floor((new Date().getTime() - timerStart.getTime()) / 1000);
        setTrackedTime(elapsed);
      }, 1000);
      setIntervalId(id);
      
      return () => {
        if (id) clearInterval(id);
      };
    } else if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  }, [isTracking, timerStart]);
  
  const startTimer = () => {
    setIsTracking(true);
    setTimerStart(new Date());
  };
  
  const pauseTimer = () => {
    setIsTracking(false);
  };
  
  const stopTimer = async () => {
    if (!user || !id || trackedTime === 0) return;
    
    const hours = trackedTime / 3600;
    
    try {
      await progressApi.create({
        taskId: id,
        userId: user.id,
        date: new Date().toISOString(),
        progressText: `Time tracked: ${formatTime(trackedTime)}`,
        percentageComplete,
        hoursSpent: Math.round(hours * 100) / 100,
        attachments: [],
      });
      
      // Reload progress logs
      const logs = await progressApi.getByTaskId(id);
      setProgressLogs(logs);
      
      setIsTracking(false);
      setTrackedTime(0);
      setTimerStart(null);
      
      toast({
        title: 'Time tracked',
        description: `Added ${formatTime(trackedTime)} to your progress log.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save tracked time.',
        variant: 'destructive',
      });
    }
  };
  
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
    
    // Create preview URLs
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAttachmentPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      } else {
        setAttachmentPreviews(prev => [...prev, '']);
      }
    });
  };
  
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
    setAttachmentPreviews(prev => {
      const newPreviews = [...prev];
      if (newPreviews[index] && newPreviews[index].startsWith('data:')) {
        URL.revokeObjectURL(newPreviews[index]);
      }
      return newPreviews.filter((_, i) => i !== index);
    });
  };
  
  const handleSubmitProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !user) return;
    
    setIsSubmitting(true);
    try {
      // Convert files to base64 or store as URLs (for mock, we'll use file names)
      const attachmentUrls = attachments.map(file => URL.createObjectURL(file));
      
      const newLog = await progressApi.create({
        taskId: id,
        userId: user.id,
        date: new Date().toISOString(),
        progressText,
        percentageComplete,
        hoursSpent,
        attachments: attachmentUrls, // In real app, upload to storage first
      });
      
      setProgressLogs([newLog, ...progressLogs]);
      setProgressText('');
      setHoursSpent(0);
      setAttachments([]);
      setAttachmentPreviews([]);
      
      toast({
        title: 'Progress submitted',
        description: 'Your progress has been logged successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit progress.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (logId: string) => {
    await progressApi.approve(logId, 'Great work!');
    const logs = await progressApi.getByTaskId(id!);
    setProgressLogs(logs);
    toast({
      title: 'Progress approved',
      description: 'Feedback has been sent to the contributor.',
    });
  };

  const handleReject = async (logId: string) => {
    await progressApi.reject(logId, 'Please revise this.');
    const logs = await progressApi.getByTaskId(id!);
    setProgressLogs(logs);
    toast({
      title: 'Progress rejected',
      description: 'Feedback has been sent to the contributor.',
    });
  };

  const handleDeleteTask = async () => {
    if (!id) return;
    
    try {
      await tasksApi.delete(id);
      toast({
        title: 'Task deleted',
        description: 'The task has been deleted successfully.',
      });
      navigate('/tasks');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete task.',
        variant: 'destructive',
      });
    }
  };
  
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !user || !commentText.trim()) return;
    
    setIsSubmittingComment(true);
    try {
      const newComment = await commentsApi.create(id, user.id, user.name, commentText);
      setComments([...comments, newComment]);
      setCommentText('');
      
      toast({
        title: 'Comment added',
        description: 'Your comment has been added successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add comment.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };
  
  const handleEditComment = async (commentId: string) => {
    if (!editCommentText.trim()) return;
    
    try {
      const updated = await commentsApi.update(commentId, editCommentText);
      setComments(prev => prev.map(c => c.id === commentId ? updated : c));
      setEditingCommentId(null);
      setEditCommentText('');
      
      toast({
        title: 'Comment updated',
        description: 'Your comment has been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update comment.',
        variant: 'destructive',
      });
    }
  };
  
  const handleDeleteComment = async (commentId: string) => {
    try {
      await commentsApi.delete(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      
      toast({
        title: 'Comment deleted',
        description: 'Comment has been deleted successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete comment.',
        variant: 'destructive',
      });
    }
  };

  if (!task) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="animate-pulse-glow w-16 h-16 rounded-full bg-primary/20" />
          <p className="text-muted-foreground">Loading task details...</p>
        </div>
      </AppShell>
    );
  }

  // Ensure assignedTo is an array
  const assignedToArray = Array.isArray(task.assignedTo) ? task.assignedTo : [];

  const statusColors = {
    'todo': 'bg-muted',
    'in-progress': 'bg-blue-500/20 text-blue-400',
    'blocked': 'bg-red-500/20 text-red-400',
    'review': 'bg-yellow-500/20 text-yellow-400',
    'done': 'bg-green-500/20 text-green-400',
  };

  const priorityColors = {
    'low': 'bg-gray-500/20 text-gray-400',
    'medium': 'bg-yellow-500/20 text-yellow-400',
    'high': 'bg-red-500/20 text-red-400',
  };

  return (
    <AppShell>
      <div className="space-y-4 md:space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
            <Button variant="ghost" size="icon" onClick={() => navigate('/tasks')} className="flex-shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">{task.title}</h1>
          </div>
          {user?.role === 'admin' && (
            <Button
              variant="outline"
              onClick={() => task?.id && navigate(`/tasks/${task.id}/edit`)}
              className="flex-shrink-0 w-full sm:w-auto"
              size="sm"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Task
            </Button>
          )}
        </div>

        {/* Task Meta */}
        <Card className="glass-card p-4 md:p-6">
          <div className="space-y-4">
            <div>
              <Progress value={percentageComplete} className="h-3" />
              <p className="text-sm text-muted-foreground mt-2">{percentageComplete}% complete</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
              <div className="flex items-center gap-2">
                <Badge className={statusColors[task.status] || statusColors.todo}>
                  {task.status || 'todo'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={priorityColors[task.priority] || priorityColors.medium}>
                  {task.priority || 'medium'}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {task.deadline && !isNaN(new Date(task.deadline).getTime())
                  ? format(new Date(task.deadline), 'MMM dd, yyyy')
                  : 'No deadline'}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {task.estimatedHours || 0}h estimated
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Description</p>
              <p className="text-foreground">{task.description || 'No description provided.'}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {task.tags && Array.isArray(task.tags) && task.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="gap-1">
                  <Tag className="h-3 w-3" />
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </Card>

        {/* Time Tracker (Collaborator) */}
        {user?.role === 'collaborator' && assignedToArray.includes(user.id) && (
          <Card className="glass-card p-4 md:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
              <h2 className="text-lg md:text-xl font-semibold">Time Tracker</h2>
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <span className="text-xl md:text-2xl font-bold font-mono">
                  {formatTime(trackedTime)}
                </span>
              </div>
            </div>
            <div className="flex gap-2 mb-6">
              {!isTracking ? (
                <Button onClick={startTimer} className="flex-1">
                  <Play className="h-4 w-4 mr-2" />
                  Start Timer
                </Button>
              ) : (
                <>
                  <Button onClick={pauseTimer} variant="outline" className="flex-1">
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                  <Button onClick={stopTimer} variant="destructive" className="flex-1">
                    <Stopwatch className="h-4 w-4 mr-2" />
                    Stop & Save
                  </Button>
                </>
              )}
              {trackedTime > 0 && !isTracking && (
                <Button onClick={() => setTrackedTime(0)} variant="outline" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Submit Progress (Collaborator) */}
        {user?.role === 'collaborator' && assignedToArray.includes(user.id) && (
          <Card className="glass-card p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold mb-4">Submit Progress</h2>
            <form onSubmit={handleSubmitProgress} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Progress Description</label>
                <Textarea
                  value={progressText}
                  onChange={(e) => setProgressText(e.target.value)}
                  placeholder="Describe what you've accomplished today..."
                  required
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">% Complete</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={percentageComplete}
                    onChange={(e) => setPercentageComplete(Number(e.target.value))}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Hours Spent</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    value={hoursSpent}
                    onChange={(e) => setHoursSpent(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              {/* File Attachments */}
              <div>
                <label className="text-sm font-medium mb-2 block">Attachments</label>
                <div className="space-y-2">
                  <Input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Files
                  </Button>
                  {attachments.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {attachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Paperclip className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm truncate">{file.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          {attachmentPreviews[index] && attachmentPreviews[index].startsWith('data:image/') && (
                            <img
                              src={attachmentPreviews[index]}
                              alt="Preview"
                              className="h-8 w-8 object-cover rounded mr-2"
                            />
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => removeAttachment(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Progress'}
              </Button>
            </form>
          </Card>
        )}

        {/* Comments Section */}
        <Card className="glass-card p-4 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Comments</h2>
            <Badge variant="secondary">{comments.length}</Badge>
          </div>
          
          {/* Comment Form */}
          <form onSubmit={handleSubmitComment} className="mb-6">
            <div className="flex gap-2">
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="min-h-[80px] flex-1"
                required
              />
              <Button type="submit" disabled={isSubmittingComment || !commentText.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
          
          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((comment) => (
                <Card key={comment.id} className="glass-card p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {comment.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm">{comment.userName}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(comment.createdAt), 'PPp')}
                            {comment.updatedAt && ' (edited)'}
                          </p>
                        </div>
                      </div>
                      
                      {editingCommentId === comment.id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editCommentText}
                            onChange={(e) => setEditCommentText(e.target.value)}
                            className="min-h-[60px]"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleEditComment(comment.id)}>
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => {
                              setEditingCommentId(null);
                              setEditCommentText('');
                            }}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                      )}
                    </div>
                    
                    {user?.id === comment.userId && editingCommentId !== comment.id && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setEditingCommentId(comment.id);
                            setEditCommentText(comment.content);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </Card>

        {/* Progress Timeline */}
        <div>
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Progress Timeline</h2>
          <div className="space-y-4">
            {progressLogs.length === 0 ? (
              <Card className="glass-card p-8 text-center">
                <p className="text-muted-foreground">No progress logged yet.</p>
              </Card>
            ) : (
              progressLogs.map((log) => (
                <Card key={log.id} className="glass-card p-4 md:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Progress Update</p>
                        <p className="text-sm text-muted-foreground">
                          {log.date && !isNaN(new Date(log.date).getTime())
                            ? format(new Date(log.date), 'MMM dd, yyyy')
                            : 'Invalid date'}
                        </p>
                      </div>
                    </div>
                    <Badge className={
                      log.feedbackStatus === 'approved' ? 'bg-green-500/20 text-green-400' :
                      log.feedbackStatus === 'rejected' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }>
                      {log.feedbackStatus}
                    </Badge>
                  </div>

                  <p className="mb-4">{log.progressText}</p>

                  <div className="flex gap-4 text-sm text-muted-foreground mb-4">
                    <span>{log.percentageComplete}% complete</span>
                    <span>•</span>
                    <span>{log.hoursSpent}h spent</span>
                  </div>

                  {log.attachments.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Paperclip className="h-4 w-4" />
                        Attachments ({log.attachments.length})
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {log.attachments.map((attachment, idx) => (
                          <div
                            key={idx}
                            className="relative group border border-border rounded-lg overflow-hidden"
                          >
                            {attachment.startsWith('blob:') || attachment.startsWith('data:image/') ? (
                              <img
                                src={attachment}
                                alt={`Attachment ${idx + 1}`}
                                className="w-full h-24 object-cover"
                              />
                            ) : (
                              <div className="w-full h-24 bg-muted/50 flex items-center justify-center">
                                <Paperclip className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                            <a
                              href={attachment}
                              download
                              className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
                            >
                              <Paperclip className="h-5 w-5 text-white" />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {log.adminFeedback && (
                    <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm font-medium mb-1">Admin Feedback:</p>
                      <p className="text-sm">{log.adminFeedback}</p>
                    </div>
                  )}

                  {user?.role === 'admin' && log.feedbackStatus === 'pending' && (
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" onClick={() => handleApprove(log.id)} className="gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleReject(log.id)} className="gap-2">
                        <XCircle className="h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Delete Button - Bottom Right */}
        {user?.role === 'admin' && (
          <div className="fixed bottom-6 right-6 z-50">
            <Button
              variant="destructive"
              size="lg"
              onClick={() => setShowDeleteDialog(true)}
              className="shadow-lg"
              title="Delete task"
            >
              <Trash2 className="h-5 w-5 mr-2" />
              Delete Task
            </Button>
          </div>
        )}

        {/* Delete Task Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Task?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete <strong>{task?.title || 'this task'}</strong>? This action cannot be undone and will remove all associated progress logs.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteTask}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppShell>
  );
}
