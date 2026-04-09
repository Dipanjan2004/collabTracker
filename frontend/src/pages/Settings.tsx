import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Settings as SettingsIcon, User, Bell, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [taskAssignments, setTaskAssignments] = useState(true);
  const [progressUpdates, setProgressUpdates] = useState(true);
  const [deadlineReminders, setDeadlineReminders] = useState(true);

  const handleSave = () => {
    toast({
      title: 'Settings saved',
      description: 'Your preferences have been updated successfully.',
    });
  };

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in max-w-3xl">
        <div>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        {/* Profile Settings */}
        <Card className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Profile Settings</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Name</label>
              <Input defaultValue={user?.name} />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <Input defaultValue={user?.email} type="email" />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Role</label>
              <Input defaultValue={user?.role} disabled />
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Notification Preferences</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive notifications via email</p>
              </div>
              <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Task Assignments</p>
                <p className="text-sm text-muted-foreground">Get notified when assigned to tasks</p>
              </div>
              <Switch checked={taskAssignments} onCheckedChange={setTaskAssignments} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Progress Updates</p>
                <p className="text-sm text-muted-foreground">Notifications for progress submissions</p>
              </div>
              <Switch checked={progressUpdates} onCheckedChange={setProgressUpdates} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Deadline Reminders</p>
                <p className="text-sm text-muted-foreground">Reminders for upcoming deadlines</p>
              </div>
              <Switch checked={deadlineReminders} onCheckedChange={setDeadlineReminders} />
            </div>
          </div>
        </Card>

        {/* Security Settings */}
        <Card className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Security</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Current Password</label>
              <Input type="password" placeholder="Enter current password" />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">New Password</label>
              <Input type="password" placeholder="Enter new password" />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Confirm New Password</label>
              <Input type="password" placeholder="Confirm new password" />
            </div>
          </div>
        </Card>

        <div className="flex gap-3">
          <Button onClick={handleSave}>Save Changes</Button>
          <Button variant="outline">Cancel</Button>
        </div>
      </div>
    </AppShell>
  );
}
