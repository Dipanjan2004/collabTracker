import { useEffect, useState } from 'react';
import { X, Bell, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Notification } from '@/types';
import { mockNotificationsApi } from '@/services/mockApi';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface NotificationsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const notificationIcons = {
  task_assigned: Bell,
  deadline_approaching: Clock,
  progress_submitted: AlertCircle,
  progress_approved: CheckCircle,
  progress_rejected: AlertCircle,
};

export function NotificationsDrawer({ open, onOpenChange }: NotificationsDrawerProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const loadNotifications = async () => {
      if (open && user) {
        const data = await mockNotificationsApi.getAll(user.id);
        setNotifications(data);
      }
    };
    
    loadNotifications();
    
    // Reload notifications every 3 seconds when drawer is open
    if (open) {
      const interval = setInterval(loadNotifications, 3000);
      return () => clearInterval(interval);
    }
  }, [open, user]);

  const handleMarkAsRead = async (id: string) => {
    await mockNotificationsApi.markAsRead(id);
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          onClick={() => onOpenChange(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full md:w-96 bg-card border-l border-border z-50 transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Notifications</h2>
              {notifications.filter(n => !n.read).length > 0 && (
                <Badge variant="destructive" className="h-5 min-w-5 p-0 flex items-center justify-center text-xs">
                  {notifications.filter(n => !n.read).length}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              {notifications.some(n => !n.read) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    const unread = notifications.filter(n => !n.read);
                    await Promise.all(unread.map(n => mockNotificationsApi.markAsRead(n.id)));
                    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                  }}
                  className="text-xs"
                >
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => {
                  const Icon = notificationIcons[notification.type];
                  return (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer",
                        !notification.read && "bg-primary/5 border-primary/20"
                      )}
                      onClick={async () => {
                        if (!notification.read) {
                          await handleMarkAsRead(notification.id);
                        }
                        // Navigate based on notification type
                        if (notification.payload?.taskId) {
                          window.location.href = `/tasks/${notification.payload.taskId}`;
                        }
                      }}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                        {!notification.read && (
                          <Badge className="flex-shrink-0 h-2 w-2 p-0 bg-primary" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
}
