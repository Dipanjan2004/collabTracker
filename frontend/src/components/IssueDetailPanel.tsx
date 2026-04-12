import { useState, useEffect, useCallback } from 'react';
import { X, Copy } from 'lucide-react';
import { Task } from '@/types';
import { tasksApi, usersApi, projectsApi } from '@/services/api';
import { StatusDropdown } from './StatusDropdown';
import { PriorityDropdown } from './PriorityDropdown';
import { AssigneePicker } from './AssigneePicker';
import { LabelPicker } from './LabelPicker';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface IssueDetailPanelProps {
  taskId: string;
  onClose: () => void;
}

export function IssueDetailPanel({ taskId, onClose }: IssueDetailPanelProps) {
  const [task, setTask] = useState<Task | null>(null);
  const [projectName, setProjectName] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    tasksApi.getById(taskId).then((t) => {
      setTask(t);
      if (t?.projectId) {
        projectsApi.getAll().then((projects) => {
          const p = projects.find((proj) => proj.id === t.projectId);
          setProjectName(p?.name ?? null);
        }).catch(() => {});
      }
    }).catch(() => {});
  }, [taskId]);

  const updateField = useCallback(
    (updates: Partial<Task>) => {
      if (!task) return;
      setTask({ ...task, ...updates });
      tasksApi.update(task.id, updates).catch(() => {});
    },
    [task],
  );

  const copyId = () => {
    if (task) {
      navigator.clipboard.writeText(task.identifier);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  if (!task) {
    return (
      <div className="fixed inset-0 right-0 w-1/2 bg-black border-l border-white/5 flex items-center justify-center">
        <div className="animate-pulse text-white/30 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 right-0 w-1/2 bg-black border-l border-white/5 flex flex-col z-50">
      <div className="flex items-center gap-2 px-4 h-10 border-b border-white/5 shrink-0">
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-white/10 text-white/50 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
        <span className="text-white/30 font-mono text-xs">{task.identifier}</span>
        <button
          onClick={copyId}
          className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white/60 transition-colors"
        >
          <Copy size={12} />
        </button>
        {copied && (
          <span className="text-white/30 text-xs">Copied</span>
        )}
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="flex-1 min-w-0 overflow-y-auto p-6 space-y-4">
          <input
            type="text"
            value={task.title}
            onChange={(e) => updateField({ title: e.target.value })}
            className="w-full bg-transparent text-white text-xl font-medium outline-none placeholder:text-white/20"
            placeholder="Issue title"
          />

          <textarea
            value={task.description || ''}
            onChange={(e) => updateField({ description: e.target.value })}
            placeholder="Write a description..."
            rows={6}
            className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-sm text-white resize-y min-h-[80px] outline-none focus:border-white/20 placeholder:text-white/20"
          />

          <div className="border-t border-white/5 pt-4">
            <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Activity</h3>
            <p className="text-sm text-white/20">Comments and activity will appear here</p>
          </div>
        </div>

        <div className="w-[200px] shrink-0 border-l border-white/5 overflow-y-auto p-4 space-y-4">
          <Property label="Status">
            <StatusDropdown
              value={task.status}
              onChange={(status) => updateField({ status })}
            />
          </Property>

          <Property label="Assignee">
            <AssigneePicker
              value={task.assigneeId}
              onChange={(assigneeId) => updateField({ assigneeId })}
            />
          </Property>

          <Property label="Priority">
            <PriorityDropdown
              value={task.priority}
              onChange={(priority) => updateField({ priority })}
            />
          </Property>

          <Property label="Labels">
            <LabelPicker
              value={task.labels}
              onChange={(labels) => updateField({ labels })}
            />
          </Property>

          <Property label="Project">
            <span className="text-sm text-white/60">
              {projectName || 'None'}
            </span>
          </Property>

          <Property label="Estimate">
            <input
              type="number"
              value={task.estimate ?? ''}
              onChange={(e) => updateField({ estimate: e.target.value ? Number(e.target.value) : null })}
              placeholder="—"
              className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm text-white outline-none focus:border-white/20 placeholder:text-white/20"
            />
          </Property>

          <Property label="Due Date">
            <input
              type="date"
              value={task.deadline ? task.deadline.split('T')[0] : ''}
              onChange={(e) => updateField({ deadline: e.target.value || null })}
              className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm text-white outline-none focus:border-white/20 [color-scheme:dark]"
            />
          </Property>

          <Property label="Created">
            <span className="text-sm text-white/40 font-mono">
              {format(new Date(task.createdAt), 'MMM d, yyyy')}
            </span>
          </Property>
        </div>
      </div>
    </div>
  );
}

function Property({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-medium text-white/30 uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}
