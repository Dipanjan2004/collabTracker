import { useState } from 'react';
import {
  Bell,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Settings,
  LayoutList,
  FolderKanban,
  Eye,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent } from '@/components/ui/sheet';

function SidebarNav() {
  const { teams } = useWorkspace();
  const { user } = useAuth();
  const [favoritesOpen, setFavoritesOpen] = useState(true);
  const [openTeams, setOpenTeams] = useState<Record<string, boolean>>({});

  const toggleTeam = (teamId: string) => {
    setOpenTeams((prev) => ({ ...prev, [teamId]: !prev[teamId] }));
  };

  const navLinkClass =
    'flex items-center gap-2 h-8 px-3 text-[13px] rounded-md transition-colors';
  const activeClass = 'bg-white/[0.08] text-white';
  const inactiveClass = 'text-white/50 hover:bg-white/[0.05] hover:text-white/70';

  return (
    <div className="flex h-full flex-col bg-[#0a0a0a] text-white" style={{ fontFamily: 'Inter, sans-serif', fontSize: 13 }}>
      <div className="flex items-center gap-1.5 px-3 h-11 shrink-0">
        <span className="font-semibold text-sm text-white">CollabTrack</span>
        <ChevronDown className="h-3.5 w-3.5 text-white/40" />
      </div>

      <div className="border-t border-white/5" />

      <nav className="flex flex-col gap-0.5 px-2 py-1.5">
        <NavLink
          to="/inbox"
          className={cn(navLinkClass, inactiveClass)}
          activeClassName={activeClass}
        >
          <Bell className="h-4 w-4 shrink-0" />
          <span>Inbox</span>
        </NavLink>
        <NavLink
          to="/my-issues"
          className={cn(navLinkClass, inactiveClass)}
          activeClassName={activeClass}
        >
          <CheckSquare className="h-4 w-4 shrink-0" />
          <span>My Issues</span>
        </NavLink>
      </nav>

      <div className="border-t border-white/5 mx-2" />

      <div className="px-2 py-1.5">
        <button
          onClick={() => setFavoritesOpen(!favoritesOpen)}
          className={cn(navLinkClass, 'w-full text-white/50 hover:text-white/70')}
        >
          <ChevronRight
            className={cn(
              'h-3.5 w-3.5 shrink-0 transition-transform',
              favoritesOpen && 'rotate-90'
            )}
          />
          <span className="text-[11px] font-medium uppercase tracking-wider text-white/30">
            Favorites
          </span>
        </button>
        {favoritesOpen && (
          <div className="ml-5 mt-0.5 text-[13px] text-white/20 italic px-3 h-8 flex items-center">
            No favorites yet
          </div>
        )}
      </div>

      <div className="px-2 py-1.5">
        {teams.map((team) => (
          <div key={team.id}>
            <button
              onClick={() => toggleTeam(team.id)}
              className={cn(navLinkClass, 'w-full text-white/50 hover:text-white/70 hover:bg-white/[0.05]')}
            >
              <ChevronRight
                className={cn(
                  'h-3.5 w-3.5 shrink-0 transition-transform',
                  openTeams[team.id] !== false && 'rotate-90'
                )}
              />
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: team.color || '#888' }}
              />
              <span className="truncate">{team.name}</span>
              <span className="ml-auto text-[11px] text-white/25 font-mono">
                {team.identifier}
              </span>
            </button>
            {openTeams[team.id] !== false && (
              <div className="ml-5 flex flex-col gap-0.5">
                <NavLink
                  to={`/team/${team.id}/issues`}
                  className={cn(navLinkClass, inactiveClass)}
                  activeClassName={activeClass}
                >
                  <LayoutList className="h-3.5 w-3.5 shrink-0" />
                  <span>Issues</span>
                </NavLink>
                <NavLink
                  to={`/team/${team.id}/projects`}
                  className={cn(navLinkClass, inactiveClass)}
                  activeClassName={activeClass}
                >
                  <FolderKanban className="h-3.5 w-3.5 shrink-0" />
                  <span>Projects</span>
                </NavLink>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-white/5 mx-2" />

      <nav className="flex flex-col gap-0.5 px-2 py-1.5">
        <NavLink
          to="/views"
          className={cn(navLinkClass, inactiveClass)}
          activeClassName={activeClass}
        >
          <Eye className="h-4 w-4 shrink-0" />
          <span>Views</span>
        </NavLink>
      </nav>

      <div className="mt-auto shrink-0">
        <div className="border-t border-white/5 mx-2" />
        <nav className="px-2 py-1.5">
          <NavLink
            to="/settings"
            className={cn(navLinkClass, inactiveClass)}
            activeClassName={activeClass}
          >
            <Settings className="h-4 w-4 shrink-0" />
            <span>Settings</span>
          </NavLink>
        </nav>
      </div>
    </div>
  );
}

export function Sidebar({
  mobileOpen,
  onMobileClose,
}: {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}) {
  return (
    <>
      <aside className="hidden md:block w-[240px] shrink-0 h-screen sticky top-0 border-r border-white/5">
        <SidebarNav />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={(open) => !open && onMobileClose?.()}>
        <SheetContent side="left" className="w-[280px] border-white/5 bg-[#0a0a0a] p-0">
          <SidebarNav />
        </SheetContent>
      </Sheet>
    </>
  );
}
