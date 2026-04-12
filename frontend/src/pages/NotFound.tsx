import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <div className="landing-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff4500' }} />
          <span className="landing-eyebrow">Error</span>
        </div>

        <h1 className="landing-heading" style={{ fontSize: 'clamp(6rem, 12vw, 10rem)', margin: 0, lineHeight: 1 }}>
          404
        </h1>

        <h2 className="landing-heading" style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', margin: '16px 0 0', fontWeight: 100 }}>
          Page not found
        </h2>

        <p className="landing-body" style={{ marginTop: 16, maxWidth: 400 }}>
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div style={{ marginTop: 40, display: 'flex', gap: 12 }}>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="landing-btn-primary"
          >
            <ArrowLeft style={{ width: 14, height: 14 }} />
            BACK TO HOME
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="landing-btn-secondary"
          >
            GO BACK
          </button>
        </div>
      </div>
    </div>
  );
}
