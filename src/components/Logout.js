import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/api';
import './Logout.css';

const Logout = () => {
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);

  const handleLogout = async () => {
    if (pending) return;
    setPending(true);
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

  const handleCancel = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="logout-overlay">
      <div className="logout-modal">
        <div className="logout-icon">🚪</div>
        <h2 className="logout-title">Log Out</h2>
        <p className="logout-message">Are you sure you want to log out?</p>
        <p className="logout-subtitle">You'll need to log in again to continue your study session.</p>
        
        <div className="logout-buttons">
          <button className="cancel-btn" onClick={handleCancel} disabled={pending}>
            Cancel
          </button>
          <button className="confirm-btn" onClick={handleLogout} disabled={pending}>
            {pending ? 'Signing out…' : 'Yes, Log Out'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Logout;
