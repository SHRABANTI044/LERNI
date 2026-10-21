import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../services/api';
import './StartStudy.css';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: 'dashboard', to: '/dashboard' },
  { label: 'Study', icon: 'book', to: '/study' },
  { label: 'Quizzes', icon: 'quiz', to: '/quiz' },
  { label: 'Analytics', icon: 'chart', to: '/analytics' },
  { label: 'AI Tutor', icon: 'spark', to: '/ai-tutor' },
];

const Icon = ({ name, size = 18 }) => {
  const shapes = {
    dashboard: 'M3 3h8v8H3zM13 3h8v5h-8zM13 10h8v11h-8zM3 13h8v8H3z',
    book: 'M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16ZM4 17a2.5 2.5 0 0 1 2.5-2.5H20M8 7h8',
    quiz: 'M8 4h11a2 2 0 0 1 2 2v14H8a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3ZM8 4v13m4-8 2 2 4-4',
    chart: 'M3 3v18h18m-11-4 4-4 3 3 6-7',
    spark: 'm12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z',
    logout: 'M10 17l5-5-5-5m5 5H3M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6',
    settings: 'M3 12a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 19a7 7 0 0 1-4.32-1.1l-1.5 1.5a5.5 5.5 0 0 0 7.07 0l1.5-1.5A7 7 0 0 1 12 19Z',
    close: 'm6 6 12 12M18 6 6 18',
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={shapes[name] || shapes.spark} />
    </svg>
  );
};

const AppShell = ({ active, title, subtitle, children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profile] = useState(() => getCurrentUser());
  const userName = (profile?.name || 'Learner').trim().split(/\s+/)[0] || 'Learner';

  const isActive = (item) => {
    if (active && item.label.toLowerCase().startsWith(active.toLowerCase())) return true;
    if (item.to === '/quiz') return location.pathname === '/quiz' || location.pathname.startsWith('/quiz/');
    if (item.to === '/study') return location.pathname.startsWith('/study') || location.pathname.startsWith('/subject') || location.pathname.startsWith('/topic') || location.pathname.startsWith('/lesson');
    if (item.to === '/dashboard') return location.pathname === '/dashboard' || location.pathname === '/start-study';
    return location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
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

  return (
    <div className="dashboard-shell">
      <aside className={`dashboard-sidebar${mobileOpen ? ' dashboard-sidebar--open' : ''}`}>
        <div className="dashboard-brand">
          <span className="dashboard-brand-mark"><Icon name="spark" size={21} /></span>
          <span>Lerni<small>LEARN SMARTER. GROW BETTER.</small></span>
          <button type="button" className="dashboard-mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close navigation menu">
            <Icon name="close" size={20} />
          </button>
        </div>
        <p className="dashboard-nav-heading">MENU</p>
        <nav className="dashboard-nav" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <Link key={item.label} to={item.to} onClick={() => setMobileOpen(false)}
              className={`dashboard-nav-item${isActive(item) ? ' is-active' : ''}`}
              aria-current={isActive(item) ? 'page' : undefined}>
              <Icon name={item.icon} size={18} /><span>{item.label}</span>
            </Link>
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
      {mobileOpen && <button type="button" className="dashboard-backdrop" onClick={() => setMobileOpen(false)} aria-label="Close navigation menu" />}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <button type="button" className="dashboard-menu-toggle" onClick={() => setMobileOpen(true)} aria-label="Open navigation menu">
            <span /><span /><span />
          </button>
          <div className="dashboard-greeting">
            {title ? <h1>{title}</h1> : null}
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
        </header>
        <div className={`dashboard-page-content${active === 'AI Tutor' ? ' dashboard-page-content--tutor' : ''}`} style={{ padding: '6px 0 22px' }}>
          {children}
        </div>
        <footer className="dashboard-footer">
          <span>© {new Date().getFullYear()} Lerni</span>
          <span>Learn Smarter. Grow Better.</span>
        </footer>
      </main>
    </div>
  );
};

export default AppShell;
