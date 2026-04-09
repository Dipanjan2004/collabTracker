import { 
  LayoutDashboard, CheckSquare, Activity, Users, Settings, ChevronLeft, FileText
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';

const navItems = [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['admin', 'collaborator'] },
  { title: 'Tasks', icon: CheckSquare, path: '/tasks', roles: ['admin', 'collaborator'] },
  { title: 'Templates', icon: FileText, path: '/templates', roles: ['admin'] },
  { title: 'Activity', icon: Activity, path: '/activity', roles: ['admin', 'collaborator'] },
  { title: 'Users', icon: Users, path: '/users', roles: ['admin'] },
  { title: 'Settings', icon: Settings, path: '/settings', roles: ['admin', 'collaborator'] },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const SidebarContent = ({ collapsed, onToggleCollapse }: { collapsed: boolean; onToggleCollapse: () => void }) => {
  const { user } = useAuth();
  const filteredItems = navItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-5">
        {!collapsed && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/55">
              Workspace
            </p>
            <p className="mt-1 text-lg font-semibold text-sidebar-foreground">CollabTrack</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="hidden h-8 w-8 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground md:flex"
        >
          <ChevronLeft className={cn(
            "h-4 w-4 transition-transform",
            collapsed && "rotate-180"
          )} />
        </Button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
              collapsed && "justify-center px-2"
            )}
            activeClassName="bg-white text-sidebar-primary-foreground shadow-sm"
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>{item.title}</span>}
          </NavLink>
        ))}
      </nav>

      {!collapsed && user && (
        <div className="border-t border-sidebar-border px-4 py-4">
          <div className="rounded-2xl bg-sidebar-accent px-4 py-3">
            <p className="text-sm font-semibold text-sidebar-foreground">{user.name}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-sidebar-foreground/60">
              {user.role}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "sticky top-20 hidden h-[calc(100vh-6rem)] border border-sidebar-border bg-sidebar shadow-[0_24px_60px_-32px_rgba(15,23,42,0.45)] transition-all duration-300 md:ml-6 md:mt-6 md:block md:rounded-3xl",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <SidebarContent collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />
      </aside>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={mobileOpen} onOpenChange={onMobileClose}>
        <SheetContent side="left" className="w-[280px] border-sidebar-border bg-sidebar p-0">
          <div className="h-full">
            <SidebarContent collapsed={false} onToggleCollapse={() => {}} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
