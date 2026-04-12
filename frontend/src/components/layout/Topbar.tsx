import { Bell, Search, User, LogOut, Settings, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { NotificationsDrawer } from '@/components/NotificationsDrawer';
import { notificationsApi } from '@/services/api';

interface TopbarProps {
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadUnreadCount = async () => {
      if (user) {
        const notifications = await notificationsApi.getAll(user.id);
        setUnreadCount(notifications.filter(n => !n.read).length);
      }
    };

    loadUnreadCount();
    // Poll for new notifications every 5 seconds
    const interval = setInterval(loadUnreadCount, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-transparent px-3 pt-3 md:px-6 md:pt-4">
        <div className="flex h-16 w-full items-center justify-between gap-4 rounded-full border border-white/8 bg-black/80 px-4 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.5)] backdrop-blur-xl md:px-6">
          <div className="flex items-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white/70 hover:text-white hover:bg-white/10"
              onClick={onMenuClick}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#555', fontFamily: 'monospace' }}>Creative Ops</p>
              <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#fff' }}>CollabTrack</h1>
            </div>
          </div>

          <div className="hidden min-w-[280px] flex-1 justify-center lg:flex">
            <div className="surface-subtle flex h-11 w-full max-w-xl items-center gap-3 px-4">
              <Search className="h-4 w-4 text-white/30" />
              <span className="text-sm text-white/30" style={{ fontFamily: 'monospace' }}>Search tasks, teammates, or reports</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="relative rounded-full border-white/10 bg-black/50 text-white/70 hover:bg-white/10 hover:text-white"
              onClick={() => setShowNotifications(true)}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-black bg-[#ff4500] p-0 text-[10px] text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-11 gap-2 rounded-full border-white/10 bg-black/50 px-2 text-white/70 hover:bg-white/10 hover:text-white md:px-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                    <AvatarFallback className="bg-white/10 text-xs font-semibold text-white">
                      {user?.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden text-left lg:block">
                    <p className="text-sm font-medium text-white">{user?.name}</p>
                    <p className="text-xs text-white/40 capitalize" style={{ fontFamily: 'monospace' }}>{user?.role}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[#0a0a0a] border-white/10 text-white">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem onClick={() => navigate('/settings')} className="hover:bg-white/10 focus:bg-white/10">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem onClick={handleLogout} className="hover:bg-white/10 focus:bg-white/10">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <NotificationsDrawer 
        open={showNotifications} 
        onOpenChange={setShowNotifications}
      />
    </>
  );
}
