import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity as ActivityIcon, CheckSquare, User, Clock } from 'lucide-react';
import { ActivityItem } from '@/types';
import { mockActivityApi } from '@/services/mockApi';
import { format } from 'date-fns';

export default function Activity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const loadActivities = async () => {
      const data = await mockActivityApi.getAll();
      setActivities(data);
    };
    loadActivities();
  }, []);

  const getActivityIcon = (targetType: string) => {
    switch (targetType) {
      case 'task':
        return <CheckSquare className="h-5 w-5" />;
      case 'user':
        return <User className="h-5 w-5" />;
      default:
        return <ActivityIcon className="h-5 w-5" />;
    }
  };

  const getActivityColor = (action: string) => {
    if (action.includes('created')) return 'bg-green-500/20 text-green-400';
    if (action.includes('updated')) return 'bg-blue-500/20 text-blue-400';
    if (action.includes('completed')) return 'bg-purple-500/20 text-purple-400';
    if (action.includes('approved')) return 'bg-green-500/20 text-green-400';
    if (action.includes('rejected')) return 'bg-red-500/20 text-red-400';
    return 'bg-muted';
  };

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold mb-2">Activity Feed</h1>
          <p className="text-muted-foreground">Recent actions and updates across the platform</p>
        </div>

        <div className="space-y-4">
          {activities.length === 0 ? (
            <Card className="glass-card p-8 text-center">
              <ActivityIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No activity yet.</p>
            </Card>
          ) : (
            activities.map((activity) => (
              <Card key={activity.id} className="glass-card p-6 hover:bg-muted/5 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary">
                    {getActivityIcon(activity.targetType)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium">{activity.userName}</span>
                      <Badge className={getActivityColor(activity.action)}>
                        {activity.targetType}
                      </Badge>
                    </div>
                    
                    <p className="text-foreground mb-2">{activity.action}</p>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {format(new Date(activity.createdAt), 'MMM dd, yyyy · h:mm a')}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
