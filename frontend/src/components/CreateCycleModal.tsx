import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cyclesApi } from '@/services/api';

interface CreateCycleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: string;
}

export function CreateCycleModal({ open, onOpenChange, teamId }: CreateCycleModalProps) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !startDate || !endDate || submitting) return;
    setSubmitting(true);
    try {
      await cyclesApi.create({
        teamId,
        name: name.trim(),
        startDate,
        endDate,
      });
      onOpenChange(false);
      resetForm();
    } catch (err) {
      console.error('Failed to create cycle', err);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setStartDate('');
    setEndDate('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0a0a0a] border-white/10 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Create Cycle</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-medium text-white/30 uppercase tracking-wider">
              Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Cycle name"
              className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-white/20"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-white/30 uppercase tracking-wider">
              Start Date
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 bg-white/5 border-white/10 text-white focus-visible:ring-white/20 [color-scheme:dark]"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-white/30 uppercase tracking-wider">
              End Date
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 bg-white/5 border-white/10 text-white focus-visible:ring-white/20 [color-scheme:dark]"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSubmit}
              disabled={!name.trim() || !startDate || !endDate || submitting}
              className="bg-white text-black hover:bg-white/90"
            >
              {submitting ? 'Creating...' : 'Create Cycle'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
