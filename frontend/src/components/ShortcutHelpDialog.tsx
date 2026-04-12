import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ShortcutHelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const shortcuts = [
  { keys: ['C'], description: 'Create issue' },
  { keys: ['⌘', 'K'], description: 'Search' },
  { keys: ['G', 'I'], description: 'Inbox' },
  { keys: ['G', 'M'], description: 'My Issues' },
  { keys: ['J', 'K'], description: 'Navigate up/down' },
  { keys: ['X'], description: 'Select' },
  { keys: ['S'], description: 'Change status' },
  { keys: ['A'], description: 'Change assignee' },
  { keys: ['L'], description: 'Change labels' },
  { keys: ['P'], description: 'Change priority' },
  { keys: ['Esc'], description: 'Close dialog' },
  { keys: ['?'], description: 'Keyboard shortcuts' },
];

export function ShortcutHelpDialog({ open, onOpenChange }: ShortcutHelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0a0a0a] border-white/10 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Keyboard Shortcuts</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-x-6 gap-y-3 py-2">
          {shortcuts.map((shortcut) => (
            <div key={shortcut.description} className="flex items-center justify-between gap-3">
              <span className="text-sm text-white/70">{shortcut.description}</span>
              <div className="flex items-center gap-1 shrink-0">
                {shortcut.keys.map((key, i) => (
                  <span key={i}>
                    <kbd className="inline-flex items-center justify-center h-6 min-w-[24px] px-1.5 rounded bg-white/10 font-mono text-xs text-white/80">
                      {key}
                    </kbd>
                    {i < shortcut.keys.length - 1 && (
                      <span className="text-white/30 text-xs mx-0.5">+</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
