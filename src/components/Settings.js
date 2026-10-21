import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../services/api';
import AppShell from './AppShell';
import './Settings.css';

const Settings = () => {
  const navigate = useNavigate();
  const profile = getCurrentUser();

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
    <AppShell active="Settings" title="Settings" subtitle="Manage your Lerni account">
      <section className="settings-panel">
        <div className="settings-head">
          <h2>Account</h2>
          <p>Update your account details and preferences.</p>
        </div>
        <div className="settings-field">
          <label>Name</label>
          <p className="settings-value">{profile?.name || 'Learner'}</p>
        </div>
        <div className="settings-field">
          <label>Email</label>
          <p className="settings-value">{profile?.email || 'Not available'}</p>
        </div>
        <div className="settings-field">
          <label>Member since</label>
          <p className="settings-value">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Account created on sign-in'}</p>
        </div>
        <div className="settings-actions">
          <button type="button" className="settings-button is-primary" onClick={handleLogout}>
            Sign out
          </button>
          <Link className="settings-button is-quiet" to="/dashboard">
            Back to dashboard
          </Link>
        </div>
        <div className="settings-note">
          <small>Lerni — Learn Smarter. Grow Better.</small>
        </div>
      </section>
    </AppShell>
  );
};

export default Settings;
