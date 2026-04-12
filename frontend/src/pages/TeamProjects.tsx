import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { projectsApi, teamsApi, usersApi } from '@/services/api';
import { Project, Team, User } from '@/types';
import { Plus, FolderKanban, User as UserIcon } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  backlog: 'bg-gray-500/15 text-gray-400',
  planned: 'bg-blue-500/15 text-blue-400',
  in_progress: 'bg-amber-500/15 text-amber-400',
  paused: 'bg-orange-500/15 text-orange-400',
  completed: 'bg-green-500/15 text-green-400',
  cancelled: 'bg-red-500/15 text-red-400',
};

export default function TeamProjects() {
  const { teamId } = useParams<{ teamId: string }>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [team, setTeam] = useState<Team | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [allProjects, allTeams, allUsers] = await Promise.all([
          projectsApi.getAll(),
          teamsApi.getAll(),
          usersApi.getAll(),
        ]);
        const found = allTeams.find((t) => t.id === teamId) ?? null;
        setTeam(found);
        setUsers(allUsers);
        setProjects(allProjects.filter((p) => p.teamId === teamId));
      } finally {
        setLoading(false);
      }
    };
    if (teamId) load();
  }, [teamId]);

  const getLead = (leadId?: string) =>
    leadId ? users.find((u) => u.id === leadId) : null;

  return (
    <AppShell>
      <div className="page-shell space-y-6 animate-fade-in">
        <div className="section-header">
          <div>
            <p className="eyebrow">Projects</p>
            <h1 className="app-heading mt-2 text-3xl md:text-4xl">
              {team ? team.name : 'Team'} Projects
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {projects.length} project{projects.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        </div>

        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Teams</span>
          <span>/</span>
          <span className="text-foreground">{team?.name ?? '…'}</span>
          <span>/</span>
          <span>Projects</span>
        </nav>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-pulse-glow w-16 h-16 rounded-full bg-primary/20" />
          </div>
        ) : projects.length === 0 ? (
          <Card className="glass-card p-8 text-center">
            <FolderKanban className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No projects yet.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => {
              const lead = getLead(project.leadId);
              return (
                <Card
                  key={project.id}
                  className="glass-card p-5 hover:bg-white/[0.03] transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {project.color && (
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: project.color }}
                        />
                      )}
                      <h3 className="font-semibold text-foreground truncate">
                        {project.name}
                      </h3>
                    </div>
                    <Badge className={STATUS_COLORS[project.status] ?? ''}>
                      {project.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  {project.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {project.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    {lead ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                            {lead.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{lead.name}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">No lead</span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {project.taskIds?.length ?? 0} tasks
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Project</DialogTitle>
              <DialogDescription>Add a new project to this team.</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newName.trim() || !teamId) return;
                await projectsApi.create({ name: newName.trim(), description: newDesc.trim() || undefined, teamId });
                const allProjects = await projectsApi.getAll();
                setProjects(allProjects.filter((p) => p.teamId === teamId));
                setNewName('');
                setNewDesc('');
                setShowCreate(false);
              }}
              className="space-y-4 mt-4"
            >
              <Input
                placeholder="Project name"
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
