import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login, register } from '../services/api';
import './Login.css';

const BrainMark = ({ className = '' }) => (
  <svg
    className={className}
    viewBox="0 0 40 40"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <linearGradient id="lerni-brain-gradient" x1="5" y1="5" x2="35" y2="35">
        <stop stopColor="#A344F2" />
        <stop offset="1" stopColor="#5B61F6" />
      </linearGradient>
    </defs>
    <path
      d="M19.8 9.2a6.1 6.1 0 0 0-10.9 3.7c0 .7.1 1.4.4 2A6.4 6.4 0 0 0 7 25.8a5.8 5.8 0 0 0 7 7.6c1.1-.4 2.1-1.2 2.7-2.2l3.1-5.1V9.2Z"
      fill="url(#lerni-brain-gradient)"
    />
    <path
      d="M20.2 9.2a6.1 6.1 0 0 1 10.9 3.7c0 .7-.1 1.4-.4 2A6.4 6.4 0 0 1 33 25.8a5.8 5.8 0 0 1-7 7.6c-1.1-.4-2.1-1.2-2.7-2.2l-3.1-5.1V9.2Z"
      fill="url(#lerni-brain-gradient)"
    />
    <path d="M20 10v16m-8-12 4 2m-5 8 5-2m12-8-4 2m5 8-5-2M15 30l2-4m8 4-2-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="20" cy="10" r="1.3" fill="white" />
    <circle cx="16" cy="16" r="1.3" fill="white" />
    <circle cx="24" cy="16" r="1.3" fill="white" />
    <circle cx="15" cy="22" r="1.3" fill="white" />
    <circle cx="25" cy="22" r="1.3" fill="white" />
  </svg>
);

const Icon = ({ name, size = 20, className = '' }) => {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className,
    'aria-hidden': true,
    focusable: false,
  };

  const paths = {
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" /></>,
    eye: <><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></>,
    eyeOff: <><path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 5.2A10.7 10.7 0 0 1 12 5c6.4 0 10 7 10 7a15.5 15.5 0 0 1-3.1 4.1M6.2 6.3C3.5 8.1 2 12 2 12s3.6 7 10 7c1 0 2-.2 2.8-.5" /></>,
    arrow: <><path d="M5 12h14m-6-6 6 6-6 6" /></>,
    smile: <><circle cx="12" cy="12" r="9" /><path d="M8 14s1.4 2 4 2 4-2 4-2M9 9h.01M15 9h.01" /></>,
    target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
    chart: <><path d="M4 19V5m0 14h16" /><path d="m7 15 4-4 3 2 5-6" /><path d="M16 7h3v3" /></>,
    user: <><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></>,
    heart: <path d="M20.8 8.7c0 4.2-8.8 10-8.8 10s-8.8-5.8-8.8-10A4.7 4.7 0 0 1 12 6.3a4.7 4.7 0 0 1 8.8 2.4Z" />,
  };

  return <svg {...common}>{paths[name]}</svg>;
};

const Login = ({ signup = false }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const location = useLocation();
  const [notice, setNotice] = useState(location.state?.notice || '');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    const normalizedEmail = email.trim();
    if (signup && name.trim().length < 2) {
      setError('Enter your name to create your account.');
      return;
    }
    if (!normalizedEmail || !password) {
      setError('Enter your email address and password to continue.');
      return;
    }
    if (signup && (password.length < 8 || password.length > 128)) {
      setError('Choose a password between 8 and 128 characters.');
      return;
    }
    if (event.currentTarget.elements.email.validity.typeMismatch) {
      setError('Enter a valid email address to continue.');
      return;
    }

    setError('');
    setNotice('');
    setLoading(true);

    try {
      if (signup) {
        await register(name.trim(), normalizedEmail, password);
        navigate('/dashboard', { replace: true });
      } else {
        await login(normalizedEmail, password);
        navigate(location.state?.from || '/dashboard', { replace: true });
      }
    } catch (err) {
      setError(
        err instanceof TypeError || err.message === 'Failed to fetch'
          ? 'We could not reach Lerni. Check your connection and try again.'
          : err.message || 'Unable to sign in. Please check your details and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <main className="login-main">
        <section className="login-hero" aria-labelledby="hero-title">
          <header className="brand-lockup">
            <BrainMark className="brand-mark" />
            <div>
              <div className="brand-name">Lerni</div>
              <div className="brand-caption">Emotion-Aware Study Assistant</div>
            </div>
          </header>

          <div className="hero-copy">
            <p className="hero-eyebrow"><span /> A more human way to learn</p>
            <h1 id="hero-title">Your Emotions<br />Power Better<br /><span>Learning</span></h1>
            <p className="hero-description">
              Lerni adapts to your emotions, learning style and progress — so you can study
              smarter, not harder.
            </p>

            <ul className="feature-list">
              <li className="feature-item">
                <span className="feature-icon feature-icon--lavender"><Icon name="smile" size={21} /></span>
                <span><strong>Real-time Emotion Detection</strong><small>Understand how you feel while you learn.</small></span>
              </li>
              <li className="feature-item">
                <span className="feature-icon feature-icon--mint"><Icon name="target" size={21} /></span>
                <span><strong>Personalized Learning</strong><small>Get content and support that fits your needs.</small></span>
              </li>
              <li className="feature-item">
                <span className="feature-icon feature-icon--blue"><Icon name="chart" size={21} /></span>
                <span><strong>Track Your Progress</strong><small>See your growth, achievements and more.</small></span>
              </li>
            </ul>
          </div>

          <div className="hero-artwork">
            <img
              className="study-illustration"
              src="/study-illustration.svg"
              alt="A student in purple headphones studying at a laptop beside books and a plant"
            />
            <div className="emotion-card" aria-label="Illustrative current emotion: Focused">
              <div className="emotion-card__top">
                <span>Current Emotion</span>
                <span className="emotion-live-dot" />
              </div>
              <div className="emotion-card__content">
                <span className="emotion-face"><Icon name="smile" size={21} /></span>
                <span className="emotion-label"><strong>Focused</strong><small>You're in the zone</small></span>
                <span className="emotion-wave" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></span>
              </div>
              <span className="emotion-card__footnote">Illustration · No camera access</span>
            </div>
          </div>
        </section>

        <section className="login-side" aria-label={signup ? 'Create an account' : 'Sign in'}>
          <div className="login-side-topline">Smarter Learning <span>•</span> Better You</div>
          <div className="login-card">
            <div className="card-brand"><BrainMark className="card-brand-mark" /></div>
            <h2 className="login-title">{signup ? 'Create Your Account' : 'Welcome Back'}</h2>
            <p className="login-subtitle">
              {signup ? 'Join Lerni and make your learning personal' : 'Sign in to continue your learning journey'}
            </p>

            {error && <div className="login-message login-message--error" role="alert">{error}</div>}
            {notice && <div className="login-message login-message--notice" role="status">{notice}</div>}

            <form onSubmit={handleSubmit} noValidate>
              {signup && (
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <div className="input-wrap">
                    <Icon name="user" className="input-icon" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Your name"
                      autoComplete="name"
                      maxLength={80}
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              )}
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrap">
                  <Icon name="mail" className="input-icon" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setError('');
                    }}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrap">
                  <Icon name="lock" className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setError('');
                    }}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                    disabled={loading}
                  >
                    <Icon name={showPassword ? 'eyeOff' : 'eye'} size={19} />
                  </button>
                </div>
              </div>

              <button type="submit" className="login-button" disabled={loading}>
                <span>
                  {loading
                    ? (signup ? 'Creating account…' : 'Signing in…')
                    : (signup ? 'Create Account' : 'Sign In')}
                </span>
                {loading ? <span className="loading-spinner" aria-hidden="true" /> : <Icon name="arrow" size={19} />}
              </button>
            </form>

            <p className="signup-copy">
              {signup ? 'Already have an account? ' : 'Don’t have an account? '}
              <Link className="text-action" to={signup ? '/login' : '/signup'}>
                {signup ? 'Sign in' : 'Sign up'}
              </Link>
            </p>

          </div>
        </section>
      </main>

      <footer className="login-footer">
        <div className="footer-brand">
          <BrainMark className="footer-mark" />
          <strong>Lerni</strong><span className="footer-dot">•</span><span>Emotion-Aware Study Assistant</span>
        </div>
        <nav className="footer-links" aria-label="Footer">
          <span className="footer-built"><Icon name="heart" size={14} /> Built for better learners</span>
        </nav>
      </footer>
    </div>
  );
};

export default Login;
