import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, FileText, Trash2, Copy, Edit } from 'lucide-react';
import { TaskTemplate, TaskPriority } from '@/types';
import { mockTemplatesApi, mockTasksApi } from '@/services/mockApi';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
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

export default function TaskTemplates() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [estimatedHours, setEstimatedHours] = useState(0);

  useEffect(() => {
    const loadTemplates = async () => {
      const data = await mockTemplatesApi.getAll();
      setTemplates(data);
    };
    loadTemplates();
  }, []);

  const handleCreateTemplate = async () => {
    if (!user || !name || !title) {
      toast({
        title: 'Error',
        description: 'Please fill in template name and title.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const newTemplate = await mockTemplatesApi.create({
        name,
        title,
        description,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        priority,
        estimatedHours,
        createdBy: user.id,
      });

      setTemplates([...templates, newTemplate]);
      setShowCreateDialog(false);
      resetForm();
      
      toast({
        title: 'Template created',
        description: 'Template has been created successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create template.',
        variant: 'destructive',
      });
    }
  };

  const handleUseTemplate = async (template: TaskTemplate) => {
    if (!user) return;
    
    try {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 7); // Default to 7 days from now
      
      const newTask = await mockTasksApi.create({
        title: template.title,
        description: template.description,
        assignedTo: [],
        tags: template.tags,
        status: 'todo',
        priority: template.priority,
        estimatedHours: template.estimatedHours,
        deadline: deadline.toISOString(),
        createdBy: user.id,
      });

      toast({
        title: 'Task created',
        description: 'Task has been created from template successfully.',
      });

      navigate(`/tasks/${newTask.id}/edit`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create task from template.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;
    
    try {
      await mockTemplatesApi.delete(templateToDelete);
      setTemplates(templates.filter(t => t.id !== templateToDelete));
      setTemplateToDelete(null);
      
      toast({
        title: 'Template deleted',
        description: 'Template has been deleted successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete template.',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setName('');
    setTitle('');
    setDescription('');
    setTags('');
    setPriority('medium');
    setEstimatedHours(0);
  };

  const startEdit = (template: TaskTemplate) => {
    setEditingTemplate(template);
    setName(template.name);
    setTitle(template.title);
    setDescription(template.description);
    setTags(template.tags.join(', '));
    setPriority(template.priority);
    setEstimatedHours(template.estimatedHours);
    setShowEditDialog(true);
  };

  if (user?.role !== 'admin') {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Task Templates</h1>
            <p className="text-muted-foreground">Create reusable templates for common tasks</p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Task Template</DialogTitle>
                <DialogDescription>Create a reusable template for common tasks</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Template Name</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Design Review Template"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Task Title</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Task title"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Task description..."
                    className="min-h-[100px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Priority</label>
                    <Select value={priority} onValueChange={(val) => setPriority(val as TaskPriority)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Estimated Hours</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      value={estimatedHours}
                      onChange={(e) => setEstimatedHours(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Tags (comma separated)</label>
                  <Input
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="design, review, frontend"
                  />
                </div>
                <div className="flex gap-3 justify-end pt-4">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTemplate}>
                    Create Template
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.length === 0 ? (
            <Card className="glass-card p-8 text-center col-span-full">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No templates yet</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Template
              </Button>
            </Card>
          ) : (
            templates.map((template) => (
              <Card key={template.id} className="glass-card p-6 group hover:border-primary/50 transition-colors">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{template.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{template.title}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => startEdit(template)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => setTemplateToDelete(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2">{template.description}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {template.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {template.priority}
                      </Badge>
                      <span>{template.estimatedHours}h</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleUseTemplate(template)}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Use Template
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Delete Confirmation */}
        <AlertDialog open={!!templateToDelete} onOpenChange={(open) => !open && setTemplateToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Template?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this template? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteTemplate}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppShell>
  );
}

