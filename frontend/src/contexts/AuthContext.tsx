import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Organization } from '@/types';
import { authApi } from '@/services/api';

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, organizationName?: string) => Promise<{ isNewOrganization: boolean }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = authApi.getCurrentUser();
    const savedOrg = localStorage.getItem('current_organization');
    setUser(currentUser);
    if (savedOrg) {
      try { setOrganization(JSON.parse(savedOrg)); } catch {}
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { user, organization } = await authApi.login(email, password);
    setUser(user);
    if (organization) {
      setOrganization(organization);
      localStorage.setItem('current_organization', JSON.stringify(organization));
    }
  };

  const register = async (name: string, email: string, password: string, organizationName?: string) => {
    const { user, organization, isNewOrganization } = await authApi.register(name, email, password, organizationName);
    setUser(user);
    if (organization) {
      setOrganization(organization);
      localStorage.setItem('current_organization', JSON.stringify(organization));
    }
    return { isNewOrganization };
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    setOrganization(null);
    localStorage.removeItem('current_organization');
  };

  return (
    <AuthContext.Provider value={{ user, organization, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
