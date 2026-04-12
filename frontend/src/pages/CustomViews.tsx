import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { viewsApi } from '@/services/api';
import { CustomView } from '@/types';
import { Plus, Eye, LayoutList, LayoutGrid } from 'lucide-react';

const LAYOUT_BADGE: Record<string, { label: string; icon: typeof LayoutList }> = {
  list: { label: 'List', icon: LayoutList },
  board: { label: 'Board', icon: LayoutGrid },
};

export default function CustomViews() {
  const [views, setViews] = useState<CustomView[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await viewsApi.getAll();
        setViews(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    await viewsApi.create({ name: newName.trim(), description: newDesc.trim() });
    const data = await viewsApi.getAll();
    setViews(data);
    setNewName('');
    setNewDesc('');
    setShowCreate(false);
  };

  return (
    <AppShell>
      <div className="page-shell space-y-6 animate-fade-in">
        <div className="section-header">
          <div>
            <p className="eyebrow">Views</p>
            <h1 className="app-heading mt-2 text-3xl md:text-4xl">Custom Views</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {views.length} saved view{views.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create View
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-pulse-glow w-16 h-16 rounded-full bg-primary/20" />
          </div>
        ) : views.length === 0 ? (
          <Card className="glass-card p-8 text-center">
            <Eye className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No saved views yet.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {views.map((view) => {
              const layout = LAYOUT_BADGE[view.layout];
              const LayoutIcon = layout?.icon ?? LayoutList;
              return (
                <Card
                  key={view.id}
                  className="glass-card p-5 hover:bg-white/[0.03] transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{view.icon || '📋'}</span>
                      <h3 className="font-semibold text-foreground truncate">
                        {view.name}
                      </h3>
                    </div>
                    <Badge variant="outline" className="gap-1 text-[10px] shrink-0">
                      <LayoutIcon className="h-3 w-3" />
                      {layout?.label ?? view.layout}
                    </Badge>
                  </div>

                  {view.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {view.description}
                    </p>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create View</DialogTitle>
              <DialogDescription>Save a custom view with your preferred filters.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <Input
                placeholder="View name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
              />
              <Textarea
                placeholder="Description (optional)"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
