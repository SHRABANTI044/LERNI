import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './BreakScreen.css';

const BreakScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const suggestedTime = location.state?.suggestedTime || 120; // Default 2 minutes
  const lessonState = { subject: location.state?.subject, topic: location.state?.topic };
  const [breakTime, setBreakTime] = useState(suggestedTime);
  const [isActive] = useState(true);

  useEffect(() => {
    let interval = null;
    if (isActive && breakTime > 0) {
      interval = setInterval(() => {
        setBreakTime(time => time - 1);
      }, 1000);
    } else if (breakTime === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, breakTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSkipBreak = () => {
    if (lessonState.subject && lessonState.topic) {
      navigate('/lesson', { state: lessonState });
    } else {
      navigate('/study');
    }
  };

  const handleExtendBreak = () => {
    setBreakTime(breakTime + 60); // Add 1 more minute
  };

  return (
    <div className="break-container">
      <div className="break-card">
        <div className="break-icon">☕</div>
        <h1 className="break-title">Time for a Break!</h1>
        <p className="break-subtitle">You've been studying hard. Take a moment to relax.</p>

        <div className="timer-display">
          <div className="timer-circle">
            <svg className="timer-svg" viewBox="0 0 100 100">
              <circle
                className="timer-bg"
                cx="50"
                cy="50"
                r="45"
              />
              <circle
                className="timer-progress"
                cx="50"
                cy="50"
                r="45"
                style={{
                  strokeDashoffset: `${283 - (283 * breakTime) / suggestedTime}`
                }}
              />
            </svg>
            <div className="timer-text">{formatTime(breakTime)}</div>
          </div>
        </div>

        <div className="break-tips">
          <h3 className="tips-title">💡 Quick Break Tips</h3>
          <div className="tips-grid">
            <div className="tip-item">
              <span className="tip-icon">💧</span>
              <span>Drink water</span>
            </div>
            <div className="tip-item">
              <span className="tip-icon">🧘</span>
              <span>Stretch your body</span>
            </div>
            <div className="tip-item">
              <span className="tip-icon">👀</span>
              <span>Rest your eyes</span>
            </div>
            <div className="tip-item">
              <span className="tip-icon">🚶</span>
              <span>Walk around</span>
            </div>
          </div>
        </div>

        <div className="break-actions">
          <button className="extend-btn" onClick={handleExtendBreak}>
            + 1 Minute
          </button>
          <button className="resume-btn" onClick={handleSkipBreak}>
            {breakTime === 0 ? 'Resume Learning' : 'Skip Break'}
          </button>
        </div>

        {breakTime === 0 && (
          <div className="break-complete">
            <span className="complete-icon">✅</span>
            Break complete! Ready to continue?
          </div>
        )}
      </div>
    </div>
  );
};

export default BreakScreen;
