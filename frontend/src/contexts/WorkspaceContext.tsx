import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Team } from '@/types';
import { teamsApi } from '@/services/api';
import { useAuth } from './AuthContext';

interface WorkspaceContextType {
  teams: Team[];
  activeTeam: Team | null;
  setActiveTeam: (team: Team) => void;
  isLoading: boolean;
  refreshTeams: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  teams: [],
  activeTeam: null,
  setActiveTeam: () => {},
  isLoading: true,
  refreshTeams: async () => {},
});

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [activeTeam, setActiveTeamState] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshTeams = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    try {
      const data = await teamsApi.getAll();
      setTeams(data);
      setActiveTeamState(prev => {
        if (prev) return prev;
        const saved = localStorage.getItem('active_team');
        if (saved) {
          const found = data.find(t => t.id === saved);
          if (found) return found;
        }
        return data.length > 0 ? data[0] : null;
      });
    } catch (e) {
      console.error('Failed to load teams', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshTeams();
    } else {
      setTeams([]);
      setActiveTeamState(null);
      setIsLoading(false);
    }
  }, [user?.id]);

  const setActiveTeam = (team: Team) => {
    setActiveTeamState(team);
    localStorage.setItem('active_team', team.id);
  };

  return (
    <WorkspaceContext.Provider value={{ teams, activeTeam, setActiveTeam, isLoading, refreshTeams }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export const useWorkspace = () => useContext(WorkspaceContext);
