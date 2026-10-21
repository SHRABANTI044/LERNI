import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { lessonContent } from '../data/lessonContent';
import { getQuizBySubjectTopic } from '../data/quizCatalog';
import { getUserProgress, saveLessonProgress } from '../services/api';
import useEmotionDetection from '../hooks/useEmotionDetection';
import './Lesson.css';

// Emotion emoji mapping
const getEmotionEmoji = (emotion) => {
  const emojis = {
    'Happy': '😊',
    'Focused': '🎯',
    'Neutral': '😐',
    'Confused': '😕',
    'Sad': '😢',
    'Angry': '😠',
    'Surprised': '😲'
  };
  return emojis[emotion] || '😐';
};

const Lesson = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const subject = location.state?.subject;
  const topic = location.state?.topic;
  
  const [currentSection, setCurrentSection] = useState(0);
  const [sessionTime, setSessionTime] = useState(0); // Session time in seconds
  const [progressData, setProgressData] = useState({
    xpEarned: 0,
    totalStudyTime: 0
  });
  
  // State for sad emotion tracking and break notification
  const [, setSadDuration] = useState(0); // Duration in seconds
  const [showBreakNotification, setShowBreakNotification] = useState(false);
  const [suggestedBreakTime, setSuggestedBreakTime] = useState(120); // Default 2 min
  
  const videoRef = useRef(null);
  const sadIntervalRef = useRef(null);

  // Session time tracking - increments every second
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch user progress from backend
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const data = await getUserProgress();
        setProgressData({
          xpEarned: data.xpEarned || 0,
          totalStudyTime: data.totalStudyTime || 0
        });
      } catch (error) {
        console.error('Error fetching progress:', error);
      }
    };
    fetchProgress();
  }, []);
  
  // Use emotion detection hook
  const {
    isLoading: emotionLoading,
    error: emotionError,
    currentEmotion,
    confidence,
    isWebcamOn,
    startDetection,
    stopDetection,
    getEmotionBreakdown
  } = useEmotionDetection(videoRef);

  // Track sad emotion duration and trigger break notification
  useEffect(() => {
    if (currentEmotion === 'Sad' && confidence > 50) {
      // Start tracking sad duration if not already tracking
      if (!sadIntervalRef.current) {
        sadIntervalRef.current = setInterval(() => {
          setSadDuration(prev => {
            const newDuration = prev + 1;
            
            // Trigger break notification based on sad duration
            // 10-20 seconds = 2 min break, 20+ seconds = 4 min break
            if (newDuration === 10 && !showBreakNotification) {
              setSuggestedBreakTime(120); // 2 minutes
              setShowBreakNotification(true);
            } else if (newDuration === 20 && !showBreakNotification) {
              setSuggestedBreakTime(240); // 4 minutes
              setShowBreakNotification(true);
            }
            
            return newDuration;
          });
        }, 1000);
      }
    } else {
      // Reset sad duration when emotion changes from Sad
      if (sadIntervalRef.current) {
        clearInterval(sadIntervalRef.current);
        sadIntervalRef.current = null;
        setSadDuration(0);
      }
    }

    return () => {
      if (sadIntervalRef.current) {
        clearInterval(sadIntervalRef.current);
        sadIntervalRef.current = null;
      }
    };
  }, [currentEmotion, confidence, showBreakNotification]);

  // Handle taking a suggested break
  const handleTakeSuggestedBreak = () => {
    setShowBreakNotification(false);
    setSadDuration(0);
    navigate('/break', { state: { suggestedTime: suggestedBreakTime, subject, topic } });
  };

  // Handle dismissing the notification
  const handleDismissNotification = () => {
    setShowBreakNotification(false);
    setSadDuration(0);
  };

  // Privacy: Lerni never stores webcam video or raw expression histories.
  // (Previous periodic emotion-saving interval removed.)

  // Get emotion breakdown for display
  const emotionBreakdown = getEmotionBreakdown();
  
  // Default breakdown if no data yet
  const displayEmotionBreakdown = emotionBreakdown.length > 0 ? emotionBreakdown : [
    { emotion: 'Happy', percentage: 5, color: '#fbbf24' },
    { emotion: 'Neutral', percentage: 3, color: '#6b7280' },
    { emotion: 'Focused', percentage: 0, color: '#10b981' },
    { emotion: 'Confused', percentage: 0, color: '#ef4444' },
    { emotion: 'Sad', percentage: 0, color: '#3b82f6' }
  ];

  // Get lesson sections for the selected topic
  const lessonSections = subject && topic ? lessonContent[topic.name]?.sections || [] : [];

  // Resolve the quiz route for this topic so "Take Quiz" lands on the right quiz.
  const quizRoute = (() => {
    if (!subject || !topic) return '/quiz';
    const match = getQuizBySubjectTopic(subject.name, topic.name);
    return match ? `/quiz/${match.id}` : '/quiz';
  })();

  const handleNext = () => {
    if (currentSection < lessonSections.length - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      // Lesson complete - save progress to backend
      saveLessonProgress(subject.name, topic.name, sessionTime).catch(console.error);
      // Go to quiz
      navigate(quizRoute);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleShowQuiz = () => {
    navigate(quizRoute);
  };

  const handleSimplify = () => {
    navigate('/simplified', { state: { subject, topic } });
  };

  const handleTakeBreak = () => {
    navigate('/break', { state: { subject, topic } });
  };

  if (!subject || !topic || !lessonSections.length) {
    return (
      <main className="lesson-unavailable" role="status">
        <h1>Lesson unavailable</h1>
        <p>Open an available lesson from Study to continue learning.</p>
        <button type="button" onClick={() => navigate('/study')}>Back to Study</button>
      </main>
    );
  }

  return (
    <div className="lesson-container">
      {/* Sidebar */}
      <aside className="lesson-sidebar">
        <div className="logo-section">
          <div className="brain-logo">
            <svg viewBox="0 0 100 100" className="brain-svg">
              <path
                d="M30 20 Q20 20 20 30 Q20 40 25 45 Q20 50 20 60 Q20 70 30 70 L30 80 Q30 90 40 90 L60 90 Q70 90 70 80 L70 70 Q80 70 80 60 Q80 50 75 45 Q80 40 80 30 Q80 20 70 20 Q65 20 60 25 Q55 20 50 20 Q45 20 40 25 Q35 20 30 20 Z"
                fill="none"
                stroke="url(#brainGradient)"
                strokeWidth="2"
              />
              <defs>
                <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="logo-text">
            <span>Emotion-Aware Study</span>
            <span className="gradient-text">Assistant</span>
          </div>
        </div>

        <nav className="nav-menu">
          <a href="#dashboard" className="nav-item" onClick={() => navigate('/start-study')}>
            <span className="nav-icon">📊</span>
            Dashboard
          </a>
          <a href="#live-session" className="nav-item active" onClick={() => navigate('/lesson', { state: { subject, topic } })}>
            <span className="nav-icon">▶️</span>
            Live Session
          </a>
          <a href="#lessons" className="nav-item" onClick={() => navigate('/topic-selection', { state: { subject } })}>
            <span className="nav-icon">📚</span>
            Lessons
          </a>
          <a href="#quizzes" className="nav-item" onClick={() => navigate(quizRoute)}>
            <span className="nav-icon">📝</span>
            Quizzes
          </a>
          <a href="#ai-tutor" className="nav-item" onClick={() => navigate('/ai-tutor', { state: { subject, topic, lessonId: topic } })}>
            <span className="nav-icon">✨</span>
            AI Tutor
          </a>
          <a href="#analytics" className="nav-item" onClick={() => navigate('/analytics')}>
            <span className="nav-icon">📈</span>
            Analytics
          </a>
          <a href="#settings" className="nav-item">
            <span className="nav-icon">⚙️</span>
            Settings
          </a>
          <a href="#logout" className="nav-item" onClick={() => navigate('/logout')}>
            <span className="nav-icon">🚪</span>
            Logout
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="lesson-main">
        {/* Header */}
        <header className="lesson-header">
          <h1 className="page-title">{topic.name} - {subject.name}</h1>
          <div className="header-actions">
            <div className="user-welcome">
              {/* <img src="https://i.pravatar.cc/40?img=5" alt="User" className="user-avatar" /> */}
              <span>Welcome, <strong>Emma</strong>!</span>
            </div>
            
            {/* Break Notification Popup */}
            {showBreakNotification && (
              <div className="break-notification-popup">
                <div className="break-notification-content">
                  <div className="break-notification-icon">😢💆</div>
                  <div className="break-notification-text">
                    <p className="break-notification-title">You seem a bit sad</p>
                    <p className="break-notification-message">
                      Take a {suggestedBreakTime === 240 ? '4' : '2'} minute break to refresh your mind!
                    </p>
                  </div>
                  <div className="break-notification-actions">
                    <button 
                      className="break-notification-accept"
                      onClick={handleTakeSuggestedBreak}
                    >
                      Take Break ☕
                    </button>
                    <button 
                      className="break-notification-dismiss"
                      onClick={handleDismissNotification}
                    >
                      Later
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <button 
              className={`icon-btn notification-btn ${showBreakNotification ? 'active' : ''}`}
              onClick={() => showBreakNotification ? handleDismissNotification() : null}
            >
              {showBreakNotification ? '💡' : '🔔'}
              {showBreakNotification && <span className="notification-badge"></span>}
            </button>
            <button className="icon-btn settings-btn">⚙️</button>
          </div>
        </header>

        <div className="lesson-content-wrapper">
          {/* Lesson Content */}
          <div className="lesson-content-area">
            {/* Progress */}
            <div className="lesson-progress-bar">
              <div className="progress-info">
                <span>Section {currentSection + 1} of {lessonSections.length}</span>
                <span className="progress-percent">{Math.round(((currentSection + 1) / lessonSections.length) * 100)}% Complete</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${((currentSection + 1) / lessonSections.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Lesson Section */}
            <div className="lesson-section">
              <div className="section-icon">{lessonSections[currentSection].image}</div>
              <h2 className="section-title">{lessonSections[currentSection].title}</h2>
              <div className="section-content">
                {lessonSections[currentSection].content.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="lesson-navigation">
              <button 
                className="nav-btn prev-btn" 
                onClick={handlePrevious}
                disabled={currentSection === 0}
              >
                ← Previous
              </button>
              <button 
                className="nav-btn next-btn" 
                onClick={handleNext}
              >
                {currentSection === lessonSections.length - 1 ? 'Complete Lesson' : 'Next →'}
              </button>
            </div>
          </div>

          {/* Emotion Sidebar */}
          <aside className="emotion-panel">
            <div className="emotion-card">
              <div className="card-header">
                <span className="card-icon">🧠</span>
                Emotion Detection
                <div className="emotion-wave">📊</div>
              </div>

              {/* Emotion error message */}
              {emotionError && (
                <div className="emotion-error" style={{ padding: '10px', backgroundColor: '#fee2e2', borderRadius: '8px', marginBottom: '10px', fontSize: '12px', color: '#dc2626' }}>
                  {emotionError}
                </div>
              )}

              {!isWebcamOn && !emotionLoading && (
                <div className="emotion-opt-in">
                  <p>Facial-expression results are estimates and may not reflect how you feel.</p>
                  <button type="button" onClick={startDetection}>Enable camera for this session</button>
                </div>
              )}

              {/* Loading state */}
              {emotionLoading && !emotionError && (
                <div className="current-emotion" style={{ justifyContent: 'center', padding: '20px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div className="emotion-icon large">⏳</div>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>Loading emotion detection...</p>
                  </div>
                </div>
              )}

              {/* Current emotion display */}
              {isWebcamOn && !emotionLoading && !emotionError && (
                <div className="current-emotion">
                  <div className="emotion-icon large">{getEmotionEmoji(currentEmotion || 'Neutral')}</div>
                  <div className="emotion-info">
                    <div className="emotion-label">
                      Emotion: <strong className="emotion-value">{currentEmotion || 'Detecting...'}</strong>
                    </div>
                    <div className="confidence-label">
                      Confidence: <strong>{confidence}%</strong>
                    </div>
                    <div className="confidence-bar">
                      <div className="confidence-fill" style={{ width: `${confidence}%` }}></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Webcam preview - visible to user */}
              <div className={`webcam-preview${isWebcamOn ? ' is-active' : ''}`} style={{
                marginTop: '10px',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '2px solid #e5e7eb'
              }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ 
                    width: '100%', 
                    height: '120px',
                    objectFit: 'cover',
                    transform: 'scaleX(-1)' // Mirror the video
                  }}
                />
              </div>
              {isWebcamOn && <div style={{
                fontSize: '10px', 
                color: '#6b7280', 
                textAlign: 'center',
                marginTop: '4px'
              }}>
                👆 Your camera preview
              </div>}
              {isWebcamOn && (
                <button type="button" className="emotion-camera-toggle" onClick={stopDetection}>
                  Turn off camera
                </button>
              )}

              {/* Emotion breakdown - now uses real data */}
              <div className="emotion-breakdown">
                {displayEmotionBreakdown.map((item, index) => (
                  <div key={index} className="emotion-row">
                    <span className="emotion-emoji">{getEmotionEmoji(item.emotion)}</span>
                    <span className="emotion-name">{item.emotion}</span>
                    <div className="emotion-bar">
                      <div 
                        className="emotion-bar-fill" 
                        style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                      ></div>
                    </div>
                    <span className="emotion-percent">{item.percentage}%</span>
                  </div>
                ))}
              </div>

              <div className="xp-earned">
                <div className="xp-info">
                  <span className="xp-icon">⭐</span>
                  <span className="xp-text">+{progressData.xpEarned} XP Earned</span>
                </div>
                <div className="xp-time">
                  <span className="fire-icon">🔥</span>
                  <span>{Math.floor(sessionTime / 60)} mins • {progressData.totalStudyTime} mins</span>
                </div>
              </div>
              <div className="xp-progress-bar">
                <div className="xp-progress-fill"></div>
              </div>

              <div className="action-buttons">
                <button className="action-btn" onClick={handleShowQuiz}>Show Quiz</button>
                {topic.name === 'Stack' ? (
                  <button className="action-btn" onClick={handleSimplify}>Simplify Topic</button>
                ) : (
                  <button className="action-btn" disabled title="Simplified content is available for Stack only">Simplify Topic · Coming Soon</button>
                )}
                <button className="action-btn primary" onClick={handleTakeBreak}>Take Break</button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Lesson;
