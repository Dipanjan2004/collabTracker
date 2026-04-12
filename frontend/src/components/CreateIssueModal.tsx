import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { StatusDropdown } from './StatusDropdown';
import { PriorityDropdown } from './PriorityDropdown';
import { AssigneePicker } from './AssigneePicker';
import { LabelPicker } from './LabelPicker';
import { tasksApi } from '@/services/api';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { TaskStatus, TaskPriority, Label } from '@/types';

interface CreateIssueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateIssueModal({ open, onOpenChange }: CreateIssueModalProps) {
  const navigate = useNavigate();
  const { teams } = useWorkspace();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [teamId, setTeamId] = useState<string>('');
  const [status, setStatus] = useState<TaskStatus>('backlog');
  const [priority, setPriority] = useState<TaskPriority>('none');
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [labels, setLabels] = useState<Label[]>([]);
  const [estimate, setEstimate] = useState<string>('');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || submitting) return;
    setSubmitting(true);
    try {
      const task = await tasksApi.create({
        title: title.trim(),
        description: description.trim(),
        teamId: teamId || null,
        status,
        priority,
        assigneeId,
        estimate: estimate ? Number(estimate) : null,
        deadline: dueDate || null,
        labelIds: labels.map((l) => l.id),
      });
      onOpenChange(false);
      resetForm();
      if (task?.id) {
        navigate(`/tasks/${task.id}`);
      }
    } catch (err) {
      console.error('Failed to create issue', err);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTeamId('');
    setStatus('backlog');
    setPriority('none');
    setAssigneeId(null);
    setLabels([]);
    setEstimate('');
    setDueDate('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0a0a0a] border-white/10 text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">Create Issue</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-medium text-white/30 uppercase tracking-wider">
              Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Issue title"
              className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-white/20"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-white/30 uppercase tracking-wider">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              rows={4}
              className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-white/20 resize-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-white/30 uppercase tracking-wider">
              Team
            </label>
            <select
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              className="mt-1 w-full h-10 rounded-md bg-white/5 border border-white/10 px-3 text-sm text-white outline-none focus:border-white/20 [color-scheme:dark]"
            >
              <option value="">No team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-medium text-white/30 uppercase tracking-wider">
                Status
              </label>
              <div className="mt-1">
                <StatusDropdown value={status} onChange={setStatus} />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-white/30 uppercase tracking-wider">
                Priority
              </label>
              <div className="mt-1">
                <PriorityDropdown value={priority} onChange={setPriority} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-medium text-white/30 uppercase tracking-wider">
                Assignee
              </label>
              <div className="mt-1">
                <AssigneePicker value={assigneeId} onChange={setAssigneeId} />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-white/30 uppercase tracking-wider">
                Labels
              </label>
              <div className="mt-1">
                <LabelPicker value={labels} onChange={setLabels} teamId={teamId || undefined} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-medium text-white/30 uppercase tracking-wider">
                Estimate
              </label>
              <Input
                type="number"
                value={estimate}
                onChange={(e) => setEstimate(e.target.value)}
                placeholder="0"
                className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-white/20"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-white/30 uppercase tracking-wider">
                Due Date
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 bg-white/5 border-white/10 text-white focus-visible:ring-white/20 [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSubmit}
              disabled={!title.trim() || submitting}
              className="bg-white text-black hover:bg-white/90"
            >
              {submitting ? 'Creating...' : 'Create Issue'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
