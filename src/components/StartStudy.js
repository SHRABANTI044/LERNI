import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, getUserProgress, logout } from '../services/api';
import './StartStudy.css';

const Icon = ({ name, size = 18 }) => {
  const shapes = {
    dashboard: <><rect x="3" y="3" width="8" height="8" rx="2" /><rect x="13" y="3" width="8" height="5" rx="2" /><rect x="13" y="10" width="8" height="11" rx="2" /><rect x="3" y="13" width="8" height="8" rx="2" /></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" /><path d="M4 17a2.5 2.5 0 0 1 2.5-2.5H20M8 7h8" /></>,
    quiz: <><path d="M8 4h11a2 2 0 0 1 2 2v14H8a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z" /><path d="M8 4v13m4-8 2 2 4-4" /></>,
    chart: <><path d="M3 3v18h18" /><path d="m7 14 4-4 3 3 6-7" /></>,
    flash: <path d="m13 2-3 8h7l-6 12 1-9H6l7-11Z" />,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.6-1.4-2.4 1.4-1.1a7 7 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.6a8 8 0 0 1 1.7-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.6 1.4 2.4-1.4 1.1a7 7 0 0 1-.1 1.9Z" /></>,
    logout: <><path d="M10 17l5-5-5-5m5 5H3" /><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></>,
    arrow: <><path d="M5 12h14m-6-6 6 6-6 6" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    star: <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />,
    target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
    spark: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" /><path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" /></>,
    user: <><circle cx="12" cy="8" r="3.5" /><path d="M5 21a7 7 0 0 1 14 0" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  };

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {shapes[name]}
    </svg>
  );
};

const navigationItems = [
  { label: 'Dashboard', icon: 'dashboard', destination: 'dashboard' },
  { label: 'Study', icon: 'book', destination: 'study' },
  { label: 'Quizzes', icon: 'quiz', destination: 'quiz' },
  { label: 'Analytics', icon: 'chart', destination: 'analytics' },
  { label: 'AI Tutor', icon: 'spark', destination: 'ai-tutor' },
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const StartStudy = () => {
  const navigate = useNavigate();
  const [profile] = useState(() => getCurrentUser());
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const loadProgress = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getUserProgress();
      setProgress(data);
    } catch (requestError) {
      setError(requestError.message || 'Could not load your study progress.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const userName = profile?.name?.trim().split(/\s+/)[0] || 'Learner';
  const quizzes = useMemo(
    () => (Array.isArray(progress?.quizHistory) ? progress.quizHistory : []),
    [progress]
  );
  const recentQuiz = progress?.recentQuiz || quizzes[quizzes.length - 1] || null;
  const xp = Number.isFinite(Number(progress?.xpEarned)) ? Number(progress.xpEarned) : null;
  const level = xp === null ? null : Math.floor(xp / 100) + 1;
  const levelProgress = xp === null ? 0 : xp % 100;
  const studyMinutes = Number.isFinite(Number(progress?.totalStudyTime))
    ? Number(progress.totalStudyTime)
    : null;

  const weeklyQuizActivity = useMemo(() => {
    const dates = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (6 - index));
      return date;
    });

    return dates.map((date) => {
      const count = quizzes.filter((quiz) => {
        const completed = new Date(quiz.completedAt);
        return !Number.isNaN(completed.getTime())
          && completed.getFullYear() === date.getFullYear()
          && completed.getMonth() === date.getMonth()
          && completed.getDate() === date.getDate();
      }).length;

      return {
        label: date.toLocaleDateString(undefined, { weekday: 'short' }),
        count,
      };
    });
  }, [quizzes]);

  const maxActivity = Math.max(1, ...weeklyQuizActivity.map((day) => day.count));
  const activeDays = weeklyQuizActivity.filter((day) => day.count > 0).length;
  const emotionSummary = Array.isArray(progress?.emotionBreakdown)
    ? progress.emotionBreakdown.filter((item) => Number(item.percentage) > 0)
    : [];
  const nextStep = recentQuiz
    ? `Review ${recentQuiz.topic || 'your latest quiz'}`
    : 'Choose a subject to begin';

  const handleNavigation = (item) => {
    setMobileMenuOpen(false);
    setNotice('');
    if (item.destination === 'dashboard') return;
    if (item.destination === 'study') {
      navigate('/study');
      return;
    }
    if (item.destination === 'quiz') {
      navigate('/quiz');
      return;
    }
    if (item.destination === 'analytics') {
      navigate('/analytics');
      return;
    }
    if (item.destination === 'ai-tutor') {
      navigate('/ai-tutor');
      return;
    }
    if (item.destination === 'settings') {
      navigate('/settings');
      return;
    }
    setNotice(`${item.label} is coming soon.`);
  };

  const handleContinue = () => {
    if (recentQuiz?.subject) {
      navigate('/topic-selection', { state: { subject: { name: recentQuiz.subject } } });
      return;
    }
    navigate('/subject-selection');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch {
      navigate('/login', {
        replace: true,
        state: { notice: 'Signed out on this device. The server could not confirm sign-out; your session will expire automatically.' },
      });
    }
  };

  const formattedDate = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="dashboard-shell">
      <aside className={`dashboard-sidebar${mobileMenuOpen ? ' dashboard-sidebar--open' : ''}`}>
        <div className="dashboard-brand">
          <span className="dashboard-brand-mark"><Icon name="spark" size={21} /></span>
          <span>Lerni<small>LEARN SMARTER. GROW BETTER.</small></span>
          <button
            type="button"
            className="dashboard-mobile-close"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation menu"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <p className="dashboard-nav-heading">MENU</p>
        <nav className="dashboard-nav" aria-label="Main navigation">
          {navigationItems.map((item) => (
            <button
              type="button"
              key={item.label}
              className={`dashboard-nav-item${item.destination === 'dashboard' ? ' is-active' : ''}`}
              onClick={() => handleNavigation(item)}
            >
              <Icon name={item.icon} size={18} />
              <span>{item.label}</span>
              {item.destination === 'coming-soon' && <span className="nav-soon">Soon</span>}
            </button>
          ))}
        </nav>

        <div className="dashboard-sidebar-bottom">
          <div className="dashboard-user">
            <span className="dashboard-avatar">{userName.charAt(0).toUpperCase()}</span>
            <span className="dashboard-user-info"><strong>{profile?.name || 'Learner'}</strong><small>{profile?.email || 'Your account'}</small></span>
          </div>
          <button type="button" className="dashboard-logout" onClick={handleLogout}>
            <Icon name="logout" size={17} /> <span>Log out</span>
          </button>
        </div>
      </aside>

      {mobileMenuOpen && (
        <button
          type="button"
          className="dashboard-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close navigation menu"
        />
      )}

      <main className="dashboard-main">
        <header className="dashboard-header">
          <button
            type="button"
            className="dashboard-menu-toggle"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <span /><span /><span />
          </button>
          <div className="dashboard-greeting">
            <h1>{getGreeting()}, {userName} <span aria-hidden="true">✦</span></h1>
            <p>Ready to make progress on your learning goals today?</p>
          </div>
          <div className="dashboard-header-date">
            <span className="date-dot" />
            <span>{formattedDate}</span>
          </div>
        </header>

        {notice && <div className="dashboard-notice" role="status">{notice}</div>}

        {error && (
          <div className="dashboard-error" role="alert">
            <span>{error}</span>
            <button type="button" onClick={loadProgress} disabled={loading}>
              {loading ? 'Retrying…' : 'Retry'}
            </button>
          </div>
        )}

        <div className="dashboard-content-grid">
          <section className="dashboard-center" aria-label="Your learning dashboard">
            <section className="dashboard-hero">
              <div className="dashboard-hero-copy">
                <span className="hero-kicker"><Icon name="spark" size={14} /> YOUR LEARNING SPACE</span>
                <h2>{recentQuiz ? 'Keep your momentum going' : 'Your learning journey starts here'}</h2>
                <p>
                  {recentQuiz
                    ? `Pick up with ${recentQuiz.topic || 'your latest topic'} and keep growing one step at a time.`
                    : 'Explore a subject, find a topic you love, and take your first step today.'}
                </p>
                <button type="button" className="dashboard-primary-button" onClick={handleContinue}>
                  {recentQuiz ? 'Continue Learning' : 'Start Learning'}
                  <Icon name="arrow" size={17} />
                </button>
              </div>
              <div className="dashboard-hero-art" aria-hidden="true">
                <span className="hero-orbit hero-orbit--one" />
                <span className="hero-orbit hero-orbit--two" />
                <div className="hero-book hero-book--back" />
                <div className="hero-book hero-book--front"><Icon name="book" size={34} /></div>
                <span className="hero-spark hero-spark--one">✦</span>
                <span className="hero-spark hero-spark--two">✧</span>
              </div>
            </section>

            <div className="dashboard-stats">
              <article className="dashboard-stat-card">
                <span className="stat-symbol stat-symbol--violet"><Icon name="star" size={18} /></span>
                <span className="stat-copy"><strong>{loading ? '—' : (xp === null ? '—' : xp.toLocaleString())}</strong><small>Total XP</small></span>
                <span className="stat-subcopy">earned</span>
              </article>
              <article className="dashboard-stat-card">
                <span className="stat-symbol stat-symbol--blue"><Icon name="target" size={18} /></span>
                <span className="stat-copy"><strong>{loading ? '—' : (level === null ? '—' : `Level ${level}`)}</strong><small>Current level</small></span>
                <span className="stat-subcopy">{levelProgress}/100 XP</span>
              </article>
              <article className="dashboard-stat-card">
                <span className="stat-symbol stat-symbol--mint"><Icon name="book" size={18} /></span>
                <span className="stat-copy"><strong>{loading ? '—' : (progress ? progress.topicsCompleted : '—')}</strong><small>Topics completed</small></span>
                <span className="stat-subcopy">all time</span>
              </article>
              <article className="dashboard-stat-card">
                <span className="stat-symbol stat-symbol--peach"><Icon name="clock" size={18} /></span>
                <span className="stat-copy"><strong>{loading ? '—' : (studyMinutes === null ? '—' : `${studyMinutes}m`)}</strong><small>Study time</small></span>
                <span className="stat-subcopy">all time</span>
              </article>
            </div>

            <div className="dashboard-lower-grid">
              <section className="dashboard-panel activity-panel">
                <div className="panel-heading">
                  <div><h2>Learning activity</h2><p>Quiz attempts over the last 7 days</p></div>
                  <button type="button" className="panel-link" onClick={() => navigate('/analytics')}>Details <Icon name="arrow" size={14} /></button>
                </div>
                {loading ? (
                  <div className="activity-empty">Loading activity…</div>
                ) : quizzes.length ? (
                  <div className="activity-chart" role="img" aria-label={`Quiz activity for the last 7 days. ${activeDays} active days.`}>
                    {weeklyQuizActivity.map((day) => (
                      <div className="activity-column" key={day.label}>
                        <span className="activity-count">{day.count || ''}</span>
                        <div className="activity-track">
                          <span className="activity-bar" style={{ height: `${day.count ? Math.max(15, (day.count / maxActivity) * 100) : 4}%` }} />
                        </div>
                        <span className="activity-day">{day.label}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="activity-empty">
                    <span className="empty-chart-icon"><Icon name="chart" size={20} /></span>
                    <span>Your quiz activity will appear here.</span>
                    <button type="button" onClick={() => navigate('/subject-selection')}>Start a lesson</button>
                  </div>
                )}
                <div className="activity-legend"><span /> Quiz attempts <strong>{activeDays} active {activeDays === 1 ? 'day' : 'days'}</strong></div>
              </section>

              <section className="dashboard-panel next-step-panel">
                <div className="panel-heading">
                  <div><h2>Your next step</h2><p>A simple place to continue</p></div>
                  <span className="next-step-icon"><Icon name="spark" size={17} /></span>
                </div>
                <div className="next-step-content">
                  <span className="next-step-kicker">{recentQuiz ? 'BASED ON YOUR LATEST QUIZ' : 'READY WHEN YOU ARE'}</span>
                  <h3>{nextStep}</h3>
                  <p>{recentQuiz ? 'Revisit the topic, then try another lesson to strengthen your understanding.' : 'Choose one of the available subjects to start learning.'}</p>
                </div>
                <button type="button" className="next-step-button" onClick={() => navigate('/study/machine-learning')}>
                  {recentQuiz ? 'Explore this subject' : 'Browse subjects'} <Icon name="arrow" size={16} />
                </button>
              </section>
            </div>
          </section>

          <aside className="dashboard-right" aria-label="Learning insights">
            <section className="dashboard-panel insight-panel">
              <div className="panel-heading">
                <div><h2>Your week</h2><p>Learning activity at a glance</p></div>
                <span className="week-badge">{activeDays}/7</span>
              </div>
              <div className="week-days" aria-label={`${activeDays} days with quiz activity this week`}>
                {weeklyQuizActivity.map((day) => (
                  <div className="week-day" key={`week-${day.label}`}>
                    <span className={day.count ? 'week-day-dot is-active' : 'week-day-dot'}>{day.count ? '✓' : ''}</span>
                    <small>{day.label.slice(0, 1)}</small>
                  </div>
                ))}
              </div>
              <p className="week-caption">
                {activeDays
                  ? `${activeDays} ${activeDays === 1 ? 'day' : 'days'} with saved quiz activity this week.`
                  : 'Start a lesson and your weekly activity will show here.'}
              </p>
            </section>

            <section className="dashboard-panel emotion-panel">
              <div className="panel-heading">
                <div><h2>Emotion journey</h2><p>Expression estimates from study</p></div>
                <span className="emotion-panel-icon"><Icon name="spark" size={16} /></span>
              </div>
              {loading ? (
                <p className="emotion-empty">Loading saved estimates…</p>
              ) : emotionSummary.length ? (
                <div className="emotion-summary-list">
                  {emotionSummary.slice(0, 3).map((item) => (
                    <div className="emotion-summary-item" key={item.emotion}>
                      <span>{item.emotion}</span><span className="emotion-summary-track"><i style={{ width: `${Math.min(100, Number(item.percentage))}%` }} /></span><strong>{item.percentage}%</strong>
                    </div>
                  ))}
                  <p className="emotion-disclaimer">Facial-expression estimates can be inaccurate and do not determine how you feel.</p>
                </div>
              ) : (
                <p className="emotion-empty">No expression estimates saved yet. Camera features are never started automatically.</p>
              )}
            </section>

            <section className="dashboard-motivation">
              <span className="motivation-icon"><Icon name="spark" size={19} /></span>
              <p>Small steps create big progress.</p>
              <span>Every lesson is a step forward.</span>
            </section>

            <div className="dashboard-right-actions">
              <button type="button" onClick={() => navigate('/analytics')}>View analytics <Icon name="arrow" size={15} /></button>
              <button type="button" onClick={() => navigate('/subject-selection')}>Explore subjects <Icon name="arrow" size={15} /></button>
            </div>
          </aside>
        </div>

        <footer className="dashboard-footer">
          <span>© {new Date().getFullYear()} Lerni</span>
          <span>Learn at your pace. Grow every day.</span>
        </footer>
      </main>
    </div>
  );
};

export default StartStudy;
