import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Welcome.css';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="page-shell">
      <Navbar showAuthLinks={false} />

      <main className="welcome-hero">
        <div className="container welcome-hero-inner">
          <div className="welcome-copy">
            <span className="welcome-eyebrow">AI-Powered Cognitive Screening</span>
            <h1 className="welcome-title">
              Understand how you read,<br />in about <span className="welcome-highlight">10 minutes</span>.
            </h1>
            <p className="welcome-description">
              NeuroSync is a short, adaptive screening that looks at reading comprehension, spelling,
              vocabulary, and word recognition — then gives you a clear, friendly summary of your
              results. It's not a diagnosis, but it's a meaningful first step.
            </p>
            <div className="welcome-actions">
              <button className="btn btn-primary welcome-cta" onClick={() => navigate('/signup')}>
                Get Started
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/login')}>I already have an account</button>
            </div>
            <div className="welcome-trust">
              <span>15-question screening</span>
              <span className="dot">•</span>
              <span>Not a medical diagnosis</span>
              <span className="dot">•</span>
              <span>Private, on-device results</span>
            </div>
          </div>

          <div className="welcome-illustration" aria-hidden="true">
            <svg viewBox="0 0 420 420" width="100%" height="100%">
              <defs>
                <linearGradient id="wg1" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
              </defs>
              <circle cx="210" cy="210" r="170" fill="url(#wg1)" opacity="0.08" />
              <circle cx="210" cy="210" r="120" fill="url(#wg1)" opacity="0.12" />
              <rect x="110" y="90" width="200" height="240" rx="24" fill="var(--color-card)" stroke="var(--color-border)" strokeWidth="2" />
              <rect x="134" y="126" width="152" height="14" rx="7" fill="url(#wg1)" opacity="0.85" />
              <rect x="134" y="156" width="120" height="10" rx="5" fill="var(--color-border)" />
              <rect x="134" y="176" width="140" height="10" rx="5" fill="var(--color-border)" />
              <rect x="134" y="196" width="96" height="10" rx="5" fill="var(--color-border)" />
              <circle cx="150" cy="240" r="16" fill="none" stroke="url(#wg1)" strokeWidth="4" />
              <path d="M144 240l4 5 9-10" stroke="url(#wg1)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="180" y="234" width="94" height="12" rx="6" fill="var(--color-border)" />
              <circle cx="316" cy="100" r="34" fill="var(--color-card)" stroke="url(#wg1)" strokeWidth="3" />
              <path d="M304 100l8 8 16-16" stroke="url(#wg1)" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
