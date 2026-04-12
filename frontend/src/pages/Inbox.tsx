import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { notificationsApi } from '@/services/api';
import { Notification } from '@/types';
import { Bell, CheckCircle, AlertTriangle, Clock, ThumbsUp, XCircle, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

const typeConfig: Record<Notification['type'], { icon: typeof Bell; color: string }> = {
  task_assigned: { icon: CheckCircle, color: 'text-blue-400 bg-blue-500/15' },
  deadline_approaching: { icon: AlertTriangle, color: 'text-amber-400 bg-amber-500/15' },
  progress_submitted: { icon: Clock, color: 'text-purple-400 bg-purple-500/15' },
  progress_approved: { icon: ThumbsUp, color: 'text-green-400 bg-green-500/15' },
  progress_rejected: { icon: XCircle, color: 'text-red-400 bg-red-500/15' },
};

export default function Inbox() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await notificationsApi.getAll(user!.id);
        setNotifications(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    await Promise.all(unread.map((n) => notificationsApi.markAsRead(n.id)));
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AppShell>
      <div className="page-shell space-y-6 animate-fade-in">
        <div className="section-header">
          <div>
            <p className="eyebrow">Inbox</p>
            <h1 className="app-heading mt-2 text-3xl md:text-4xl">Inbox</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                : 'You’re all caught up'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-pulse-glow w-16 h-16 rounded-full bg-primary/20" />
          </div>
        ) : notifications.length === 0 ? (
          <Card className="glass-card p-8 text-center">
            <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No notifications yet.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => {
              const config = typeConfig[notification.type];
              const Icon = config.icon;
              return (
                <Card
                  key={notification.id}
                  className={`glass-card p-4 transition-colors hover:bg-white/[0.03] ${
                    !notification.read ? 'border-l-2 border-l-[#ff4500]' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg shrink-0 ${config.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-relaxed">
                        {notification.message}
                      </p>
                      <span className="text-xs text-muted-foreground mt-1 block">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                    </div>

                    {!notification.read && (
                      <div className="shrink-0 pt-1">
                        <span className="block w-2 h-2 rounded-full bg-[#ff4500]" />
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
