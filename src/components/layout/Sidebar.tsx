import { 
  LayoutDashboard, CheckSquare, Activity, Users, Settings, ChevronLeft, FileText, Menu, X
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
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
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-end p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="h-8 w-8 hidden md:flex"
        >
          <ChevronLeft className={cn(
            "h-4 w-4 transition-transform",
            collapsed && "rotate-180"
          )} />
        </Button>
      </div>

      <nav className="flex-1 px-2 space-y-1">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            activeClassName="bg-sidebar-accent text-sidebar-foreground font-medium"
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>{item.title}</span>}
          </NavLink>
        ))}
      </nav>
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
          "hidden md:block h-[calc(100vh-4rem)] bg-sidebar border-r border-border transition-all duration-300 sticky top-16",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <SidebarContent collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />
      </aside>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={mobileOpen} onOpenChange={onMobileClose}>
        <SheetContent side="left" className="w-[280px] p-0 bg-sidebar">
          <div className="h-full">
            <SidebarContent collapsed={false} onToggleCollapse={() => {}} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
