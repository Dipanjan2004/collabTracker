import { 
  LayoutDashboard, CheckSquare, Activity, Users, Settings, ChevronLeft, FileText
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['admin', 'collaborator'] },
  { title: 'Tasks', icon: CheckSquare, path: '/tasks', roles: ['admin', 'collaborator'] },
  { title: 'Templates', icon: FileText, path: '/templates', roles: ['admin'] },
  { title: 'Activity', icon: Activity, path: '/activity', roles: ['admin', 'collaborator'] },
  { title: 'Users', icon: Users, path: '/users', roles: ['admin'] },
  { title: 'Settings', icon: Settings, path: '/settings', roles: ['admin', 'collaborator'] },
];

export function Sidebar() {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const filteredItems = navItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <aside 
      className={cn(
        "h-[calc(100vh-4rem)] bg-sidebar border-r border-border transition-all duration-300 sticky top-16",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-end p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8"
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
    </aside>
  );
}
