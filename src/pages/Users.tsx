import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users as UsersIcon, 
  UserPlus, 
  Mail, 
  Search, 
  Trash2,
  UserX
} from 'lucide-react';
import { User } from '@/types';
import { mockUsersApi } from '@/services/mockApi';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [userToRemove, setUserToRemove] = useState<User | null>(null);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const loadUsers = async () => {
      const data = await mockUsersApi.getAll();
      setUsers(data);
    };
    loadUsers();
  }, []);

  const handleInvite = () => {
    toast({
      title: 'Invite sent',
      description: 'An invitation email has been sent to the user.',
    });
  };

  const handleRemoveUser = async () => {
    if (!userToRemove) return;
    
    try {
      await mockUsersApi.remove(userToRemove.id);
      setUsers(users.filter(u => u.id !== userToRemove.id));
      toast({
        title: 'User removed',
        description: `${userToRemove.name} has been removed from the system.`,
      });
      setUserToRemove(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove user.',
        variant: 'destructive',
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Users</h1>
            <p className="text-muted-foreground">Manage team members and collaborators</p>
          </div>
          <Button onClick={handleInvite} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Invite User
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.length === 0 ? (
            <Card className="glass-card p-8 text-center col-span-full">
              <UsersIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No users found.</p>
            </Card>
          ) : (
            filteredUsers.map((user) => (
              <Card key={user.id} className="glass-card p-6 hover:bg-muted/5 transition-all hover:border-primary/20 group">
                <div className="flex items-start gap-4">
                  <Avatar className="h-14 w-14 border-2 border-primary/20">
                    {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate text-foreground">{user.name}</h3>
                          {user.active && (
                            <div className="h-2 w-2 rounded-full bg-green-500 flex-shrink-0" title="Active" />
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        
                        <Badge className={
                          user.role === 'admin' 
                            ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' 
                            : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        } variant="outline">
                          {user.role === 'admin' ? 'Admin' : 'Collaborator'}
                        </Badge>
                      </div>
                      
                      {currentUser?.role === 'admin' && 
                       user.role === 'collaborator' && 
                       user.id !== currentUser.id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => setUserToRemove(user)}
                          title="Remove contributor"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Remove User Confirmation Dialog */}
        <AlertDialog open={!!userToRemove} onOpenChange={(open) => !open && setUserToRemove(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Contributor?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove <strong>{userToRemove?.name}</strong>? 
                This will remove them from all assigned tasks. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRemoveUser}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                <UserX className="h-4 w-4 mr-2" />
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppShell>
  );
}
