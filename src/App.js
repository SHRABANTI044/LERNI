import React, { useCallback, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { clearSession, getUserProfile, isAuthenticated } from './services/api';
import Login from './components/Login';
import StartStudy from './components/StartStudy';
import SubjectSelection from './components/SubjectSelection';
import StudyLessonPage from './components/StudyLessonPage';
import TopicSelection from './components/TopicSelection';
import Lesson from './components/Lesson';
import QuizHub from './components/QuizHub';
import QuizSession from './components/QuizSession';
import SimplifiedContent from './components/SimplifiedContent';
import BreakScreen from './components/BreakScreen';
import Analytics from './components/Analytics';
import Logout from './components/Logout';
import AITutor from './pages/AITutor';
import Settings from './components/Settings';
import './App.css';

const SessionRoute = ({ children, publicOnly = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState(isAuthenticated() ? 'checking' : 'unauthenticated');
  const [validatedPath, setValidatedPath] = useState(null);
  const [error, setError] = useState('');

  const validateSession = useCallback(() => {
    if (!isAuthenticated()) {
      setStatus('unauthenticated');
      setValidatedPath(location.pathname);
      return;
    }
    setStatus('checking');
    setError('');
    getUserProfile()
      .then(() => {
        setStatus('authenticated');
        setValidatedPath(location.pathname);
      })
      .catch((requestError) => {
        if (publicOnly) {
          clearSession();
          setStatus('unauthenticated');
        } else if (isAuthenticated()) {
          setStatus('error');
          setError(requestError.message || 'Could not verify your session.');
        } else {
          setStatus('unauthenticated');
        }
        setValidatedPath(location.pathname);
      });
  }, [location.pathname]);

  useEffect(() => {
    validateSession();
  }, [validateSession]);

  useEffect(() => {
    const handleExpiredSession = () => {
      navigate('/login', { replace: true, state: { from: location.pathname } });
    };
    window.addEventListener('lerni:session-expired', handleExpiredSession);
    return () => window.removeEventListener('lerni:session-expired', handleExpiredSession);
  }, [location.pathname, navigate]);

  if (validatedPath !== location.pathname || status === 'checking') {
    return <p className="session-checking" role="status">Verifying your session…</p>;
  }
  if (publicOnly && status === 'unauthenticated') return children;
  if (publicOnly && status === 'authenticated') return <Navigate to="/dashboard" replace />;
  if (!publicOnly && status === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (status === 'error') {
    return (
      <main className="session-check-error" role="alert">
        <p>{error}</p>
        <button type="button" onClick={validateSession} style={{ marginRight: '8px' }}>Try again</button>
        <button type="button" onClick={() => { clearSession(); setStatus('unauthenticated'); }}>Log in again</button>
      </main>
    );
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<SessionRoute publicOnly><Login /></SessionRoute>} />
        <Route path="/signup" element={<SessionRoute publicOnly><Login signup /></SessionRoute>} />
        <Route path="/dashboard" element={<SessionRoute><StartStudy /></SessionRoute>} />
        <Route path="/start-study" element={<SessionRoute><StartStudy /></SessionRoute>} />
        <Route path="/study" element={<SessionRoute><SubjectSelection /></SessionRoute>} />
        <Route path="/study/:subjectSlug" element={<SessionRoute><SubjectSelection /></SessionRoute>} />
        <Route path="/study/:subjectSlug/lessons/:lessonSlug" element={<SessionRoute><StudyLessonPage /></SessionRoute>} />
        <Route path="/subject-selection" element={<SessionRoute><SubjectSelection /></SessionRoute>} />
        <Route path="/topic-selection" element={<SessionRoute><TopicSelection /></SessionRoute>} />
        <Route path="/lesson" element={<SessionRoute><Lesson /></SessionRoute>} />
        <Route path="/quiz" element={<SessionRoute><QuizHub /></SessionRoute>} />
        <Route path="/quiz/:quizId" element={<SessionRoute><QuizSession /></SessionRoute>} />
        <Route path="/simplified" element={<SessionRoute><SimplifiedContent /></SessionRoute>} />
        <Route path="/break" element={<SessionRoute><BreakScreen /></SessionRoute>} />
        <Route path="/analytics" element={<SessionRoute><Analytics /></SessionRoute>} />
        <Route path="/ai-tutor" element={<SessionRoute><AITutor /></SessionRoute>} />
        <Route path="/settings" element={<SessionRoute><Settings /></SessionRoute>} />
        <Route path="/logout" element={<Logout />} />
      </Routes>
    </Router>
  );
}

export default App;
