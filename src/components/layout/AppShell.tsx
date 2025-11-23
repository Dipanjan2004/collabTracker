import { ReactNode, useState } from 'react';
import { Topbar } from './Topbar';
import { Sidebar } from './Sidebar';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-background">
      <Topbar onMenuClick={() => setMobileMenuOpen(true)} />
      <div className="flex w-full">
        <Sidebar mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
        <main className="flex-1 p-3 md:p-4 lg:p-6 overflow-x-hidden w-full min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
