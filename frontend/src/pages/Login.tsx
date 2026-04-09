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
    <div className="min-h-screen bg-background px-3 py-10 md:px-4">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hidden rounded-[2rem] bg-[linear-gradient(135deg,hsl(214_72%_30%)_0%,hsl(215_67%_37%)_55%,hsl(203_72%_46%)_100%)] p-10 text-white shadow-[0_24px_60px_-32px_rgba(15,23,42,0.45)] lg:block">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">CollabTrack</p>
          <h1 className="mt-6 max-w-md text-5xl font-extrabold tracking-tight">
            Run creative delivery with more control.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-white/78">
            Centralize tasks, approvals, progress logs, and reporting in a workspace designed for real team operations.
          </p>
          <div className="mt-10 grid gap-4">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5">
              <p className="text-sm font-semibold">Operational visibility</p>
              <p className="mt-2 text-sm text-white/75">Track deadlines, blockers, and contributor activity without context switching.</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5">
              <p className="text-sm font-semibold">Structured review flow</p>
              <p className="mt-2 text-sm text-white/75">Approve work updates, manage feedback, and keep stakeholders aligned.</p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md justify-self-center space-y-4 md:space-y-6">
        <div className="text-center">
          <p className="eyebrow">Welcome Back</p>
          <h1 className="mb-2 mt-2 text-3xl font-extrabold tracking-tight text-foreground">Sign in to CollabTrack</h1>
          <p className="text-sm md:text-base text-muted-foreground">Access your workspace, tasks, and team activity.</p>
        </div>

        <Card className="glass-card space-y-4 p-5 md:space-y-6 md:p-7">
          <div className="rounded-2xl border border-border/70 bg-secondary/70 p-3 md:p-4">
            <div className="flex items-center justify-center gap-2 md:gap-4">
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
    </div>
  );
}
