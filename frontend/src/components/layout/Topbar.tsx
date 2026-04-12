import { useState, useEffect } from 'react';
import { Bell, Menu, LogOut, Settings } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { notificationsApi } from '@/services/api';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { NotificationsDrawer } from '@/components/NotificationsDrawer';
import { useWorkspace } from '@/contexts/WorkspaceContext';

function Breadcrumb({ pathname }: { pathname: string }) {
  const { teams } = useWorkspace();

  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return <span className="text-white/30">Home</span>;

  const parts: string[] = [];

  if (segments[0] === 'inbox') {
    parts.push('Inbox');
  } else if (segments[0] === 'my-issues') {
    parts.push('My Issues');
  } else if (segments[0] === 'views') {
    parts.push('Views');
  } else if (segments[0] === 'settings') {
    parts.push('Settings');
  } else if (segments[0] === 'team' && segments[1]) {
    const team = teams.find((t) => t.id === segments[1]);
    if (team) {
      parts.push(team.identifier);
    } else {
      parts.push('Team');
    }
    if (segments[2] === 'issues') {
      parts.push('Issues');
    } else if (segments[2] === 'projects') {
      parts.push('Projects');
    }
  } else if (segments[0] === 'dashboard') {
    parts.push('Dashboard');
  } else {
    parts.push(segments[0].charAt(0).toUpperCase() + segments[0].slice(1));
  }

  return (
    <span className="text-white/60 font-mono text-[13px]">
      {parts.join(' / ')}
    </span>
  );
}

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadUnread = async () => {
      if (!user) return;
      try {
        const notifications = await notificationsApi.getAll(user.id);
        setUnreadCount(notifications.filter((n) => !n.read).length);
      } catch {}
    };
    loadUnread();
    const interval = setInterval(loadUnread, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <>
      <header className="h-12 shrink-0 flex items-center justify-between border-b border-white/5 bg-black px-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8 text-white/60 hover:text-white hover:bg-white/[0.05]"
            onClick={onMenuClick}
          >
            <Menu className="h-4 w-4" />
          </Button>
          <Breadcrumb pathname={pathname} />
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="relative h-8 w-8 text-white/60 hover:text-white hover:bg-white/[0.05]"
            onClick={() => setShowNotifications(true)}
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff4500] text-[9px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.08] hover:bg-white/[0.12] transition-colors">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                  <AvatarFallback className="bg-transparent text-[11px] font-medium text-white/80">
                    {user?.name?.charAt(0) ?? '?'}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 bg-[#0a0a0a] border-white/10 text-white"
            >
              <div className="px-2 py-1.5">
                <p className="text-[13px] font-medium text-white">{user?.name}</p>
                <p className="text-[11px] text-white/40">{user?.email}</p>
              </div>
              <DropdownMenuSeparator className="bg-white/5" />
              <DropdownMenuItem
                onClick={() => navigate('/settings')}
                className="text-[13px] text-white/70 hover:bg-white/[0.05] focus:bg-white/[0.05] hover:text-white focus:text-white"
              >
                <Settings className="mr-2 h-3.5 w-3.5" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/5" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-[13px] text-white/70 hover:bg-white/[0.05] focus:bg-white/[0.05] hover:text-white focus:text-white"
              >
                <LogOut className="mr-2 h-3.5 w-3.5" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <NotificationsDrawer
        open={showNotifications}
        onOpenChange={setShowNotifications}
      />
    </>
  );
}
