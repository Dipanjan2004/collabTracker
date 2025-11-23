import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield, Users } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Invalid credentials',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-3 md:p-4">
      <div className="w-full max-w-md space-y-4 md:space-y-6">
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gradient-primary mb-2">CollabTrack</h1>
          <p className="text-sm md:text-base text-muted-foreground">Sign in to your account</p>
        </div>

        <Card className="glass-card p-4 md:p-6 space-y-4 md:space-y-6">
          {/* Role Toggle */}
          <div className="flex items-center justify-center gap-2 md:gap-4 p-3 md:p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-1 md:gap-2">
              <Users className={`h-4 w-4 md:h-5 md:w-5 ${!isAdminMode ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-sm md:text-base font-medium ${!isAdminMode ? 'text-foreground' : 'text-muted-foreground'}`}>
                <span className="hidden sm:inline">Login as </span>User
              </span>
            </div>
            <Switch
              checked={isAdminMode}
              onCheckedChange={setIsAdminMode}
              className="data-[state=checked]:bg-primary"
            />
            <div className="flex items-center gap-1 md:gap-2">
              <Shield className={`h-4 w-4 md:h-5 md:w-5 ${isAdminMode ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-sm md:text-base font-medium ${isAdminMode ? 'text-foreground' : 'text-muted-foreground'}`}>
                <span className="hidden sm:inline">Login as </span>Admin
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                `Sign In as ${isAdminMode ? 'Admin' : 'User'}`
              )}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <button
              type="button"
              onClick={() => navigate('/auth/register')}
              className="text-primary hover:underline"
            >
              Register here
            </button>
          </div>
        </Card>

        <div className="text-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  );
}
