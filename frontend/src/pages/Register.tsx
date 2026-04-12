import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowRight } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const formRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  const revealStyle = (v: boolean, delay = 0): React.CSSProperties => ({
    opacity: v ? 1 : 0,
    transform: v ? 'translateY(0)' : 'translateY(28px)',
    transition: `opacity 0.7s cubic-bezier(.16,1,.3,1) ${delay}s, transform 0.7s cubic-bezier(.16,1,.3,1) ${delay}s`,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Password mismatch',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: 'Weak password',
        description: 'Password must be at least 8 characters',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      await register(formData.name, formData.email, formData.password);
      toast({
        title: 'Account created!',
        description: 'Welcome to CollabTrack.',
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: '#111',
    border: '1px solid #333',
    borderRadius: 4,
    padding: '12px 16px',
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#fff',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  return (
    <div className="landing-page">
      <header style={{ position: 'sticky', top: 0, zIndex: 50, backgroundColor: '#000' }}>
        <div className="landing-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px' }}>
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: 0 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5l-10 14M7 5l10 14M2 12h20"></path></svg>
            <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>CollabTrack</span>
          </button>
        </div>
      </header>

      <div className="landing-container">
        <section style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '64px 0', maxWidth: 520, margin: '0 auto' }}>
          <div ref={formRef} style={revealStyle(visible)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff4500' }} />
              <span className="landing-eyebrow">Create Account</span>
            </div>

            <h1 className="landing-heading landing-heading-hero" style={{ margin: 0 }}>
              Join the<br />workspace.
            </h1>

            <p className="landing-body" style={{ marginTop: 24, maxWidth: 440 }}>
              Create your account to start coordinating delivery, collecting progress updates, and reporting with less friction.
            </p>

            <div style={{ marginTop: 48, borderRadius: 8, border: '1px solid #1a1a1a', background: '#0a0a0a', padding: 32 }}>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label className="landing-eyebrow" style={{ display: 'block', marginBottom: 8, color: '#555' }}>Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    style={inputStyle}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#555'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#333'; }}
                  />
                </div>

                <div>
                  <label className="landing-eyebrow" style={{ display: 'block', marginBottom: 8, color: '#555' }}>Email</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    style={inputStyle}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#555'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#333'; }}
                  />
                </div>

                <div>
                  <label className="landing-eyebrow" style={{ display: 'block', marginBottom: 8, color: '#555' }}>Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    style={inputStyle}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#555'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#333'; }}
                  />
                </div>

                <div>
                  <label className="landing-eyebrow" style={{ display: 'block', marginBottom: 8, color: '#555' }}>Confirm Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    style={inputStyle}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#555'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#333'; }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="landing-btn-primary"
                  style={{ width: '100%', marginTop: 8, opacity: isLoading ? 0.7 : 1 }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} />
                      Creating account...
                    </>
                  ) : (
                    <>
                      CREATE ACCOUNT
                      <ArrowRight style={{ width: 14, height: 14 }} />
                    </>
                  )}
                </button>
              </form>

              <div style={{ marginTop: 24, textAlign: 'center' }}>
                <span style={{ fontSize: 13, color: '#555', fontFamily: 'monospace' }}>
                  Already have an account?{' '}
                </span>
                <button
                  type="button"
                  onClick={() => navigate('/auth/login')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontFamily: 'monospace', color: '#ff4500', textDecoration: 'underline' }}
                >
                  Sign in
                </button>
              </div>
            </div>

            <div style={{ marginTop: 32, textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => navigate('/')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontFamily: 'monospace', color: '#555', transition: 'color 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#555'; }}
              >
                &larr; Back to home
              </button>
            </div>
          </div>
        </section>

        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '40px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #f97316, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: '#fff' }}>CT</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.45)' }}>CollabTrack</span>
          </div>
        </footer>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
