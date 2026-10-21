import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { lessonContent } from '../data/lessonContent';
import { getLegacySubjectName, getLessonProgressKey, resolveStudyLessonRoute, slugifyStudyId } from '../data/studyCurriculum';
import { getUserProgress, saveLessonProgress } from '../services/api';
import useEmotionDetection from '../hooks/useEmotionDetection';
import { buildLearningRecommendation } from '../services/learningRecommendations';
import LearningSuggestionCard, { BreakTimer } from './EmotionSupportPanel';
import { getWalkthrough, getSimplified } from '../data/learningSupport';
import { getQuizBySubjectTopic } from '../data/quizCatalog';
import { SUPPORTED_EXPRESSIONS } from '../hooks/useEmotionDetection';
import './StudyLessonPage.css';

const STATUS_TEXT = {
  off: 'Camera is off.',
  loading: 'Starting emotion support… You can keep reading.',
  'no-face': 'Looking for a face. Position your face in the preview.',
  unclear: 'Unable to detect clearly. You can keep studying normally.',
  ready: 'Expression estimate available.',
  paused: 'Emotion support paused.',
  error: 'Emotion support unavailable.',
};

const StudyLessonPage = () => {
  const { subjectSlug, lessonSlug } = useParams();
  const route = resolveStudyLessonRoute(subjectSlug, lessonSlug);
  const subject = route?.subject;
  const lessons = route?.lessons || [];
  const lesson = route?.lesson;
  const lessonIndex = route?.lessonIndex ?? -1;
  const lessonProgressKey = subject && lesson ? getLessonProgressKey(subject, lesson.name) : '';
  const lessonSections = lesson ? lessonContent[lesson.name].sections : [];
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const [progress, setProgress] = useState(null);
  const [progressLoading, setProgressLoading] = useState(true);
  const [progressError, setProgressError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [emotionOptIn, setEmotionOptIn] = useState(false);
  const [smoothedSignal, setSmoothedSignal] = useState(null);
  const [sadSeconds, setSadSeconds] = useState(0);
  const [recommendation, setRecommendation] = useState(null);
  const [dismissedTypes, setDismissedTypes] = useState([]);
  const [cooldowns, setCooldowns] = useState({});
  const [suggestionsPaused, setSuggestionsPaused] = useState(false);
  const [supportPaused, setSupportPaused] = useState(false); // pause processing, keep camera
  const [breakRequested, setBreakRequested] = useState(false);
  const [showBreakTimer, setShowBreakTimer] = useState(false);
  const [activeHelp, setActiveHelp] = useState(null); // 'walkthrough' | 'simpler' | null
  const [quizStats, setQuizStats] = useState(null);
  const sadTimerRef = useRef(null);

  const handleSmoothedEmotion = useCallback((emotion, conf) => {
    setSmoothedSignal({ emotion, confidence: conf, lastSeen: Date.now() });
  }, []);

  const {
    isLoading: emotionLoading,
    error: emotionError,
    currentEmotion,
    confidence,
    smoothedEmotion,
    detectionStatus,
    isWebcamOn,
    isPaused,
    modelsReady,
    modelsLoading,
    startupStep,
    startDetection,
    stopDetection,
    clearError,
    pauseDetection,
    resumeDetection,
    retryModels,
  } = useEmotionDetection(videoRef, emotionOptIn && !supportPaused ? handleSmoothedEmotion : null);

  useEffect(() => {
    if (!lessonProgressKey) {
      setProgressLoading(false);
      return undefined;
    }

    let active = true;
    setProgressLoading(true);
    setProgressError('');
    getUserProgress()
      .then((data) => {
        if (active) setProgress(data);
      })
      .catch((error) => {
        if (active) setProgressError(error.message || 'Could not load lesson progress.');
      })
      .finally(() => {
        if (active) setProgressLoading(false);
      });

    return () => { active = false; };
  }, [lessonProgressKey]);

  useEffect(() => {
    setElapsedSeconds(0);
    setSaveError('');
    const timer = setInterval(() => setElapsedSeconds((seconds) => seconds + 1), 1000);
    return () => clearInterval(timer);
  }, [lessonProgressKey]);

  // Reset per-lesson state; stop camera on lesson change/unmount.
  useEffect(() => {
    setSmoothedSignal(null);
    setSadSeconds(0);
    setRecommendation(null);
    setDismissedTypes([]);
    setCooldowns({});
    setSupportPaused(false);
    setBreakRequested(false);
    setShowBreakTimer(false);
    setActiveHelp(null);
    return () => stopDetection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonProgressKey]);

  // Track sustained Sad signal (uncertain) for optional break suggestion.
  useEffect(() => {
    if (sadTimerRef.current) { clearInterval(sadTimerRef.current); sadTimerRef.current = null; }
    if (smoothedSignal?.emotion === 'Sad' && smoothedSignal.confidence >= 45 && isWebcamOn) {
      sadTimerRef.current = setInterval(() => setSadSeconds((s) => s + 1), 1000);
    } else {
      setSadSeconds(0);
    }
    return () => { if (sadTimerRef.current) { clearInterval(sadTimerRef.current); sadTimerRef.current = null; } };
  }, [smoothedSignal, isWebcamOn]);

  // Derive quiz stats for THIS lesson from backend progress (no fake scores).
  useEffect(() => {
    if (!progress || !subject || !lesson) { setQuizStats(null); return; }
    const history = Array.isArray(progress.quizHistory) ? progress.quizHistory : [];
    const legacy = getLegacySubjectName(subject);
    const mine = history.filter((q) => q && (q.subject === legacy || q.subject === subject.name) && (!q.topic || q.topic === lesson.name));
    if (!mine.length) { setQuizStats(null); return; }
    const recent = mine[mine.length - 1];
    const incorrect = mine.reduce((s, q) => s + Math.max(0, (q.totalQuestions || 0) - (q.score || 0)), 0);
    setQuizStats({
      attempts: mine.length,
      recentScore: recent.percentage ?? (recent.totalQuestions ? Math.round((recent.score / recent.totalQuestions) * 100) : null),
      averageScore: Math.round(mine.reduce((s, q) => s + (q.percentage ?? 0), 0) / mine.length),
      incorrectCount: incorrect,
      weakTopics: [lesson.name],
    });
  }, [progress, subject, lesson]);

  const quizTarget = useMemo(() => {
    if (!subject || !lesson) return null;
    const legacy = getLegacySubjectName(subject);
    let quizSubject = legacy;
    if (legacy === 'Machine Learning') quizSubject = 'Machine Learning';
    else if (legacy === 'Data Structures' || legacy === 'Algorithms') {
      const dsTopics = ['Stack', 'Queue', 'Linked List', 'Binary Tree', 'Hash Table', 'Graph'];
      quizSubject = dsTopics.includes(lesson.name) ? 'Data Structures' : 'Algorithms';
    } else if (legacy === 'Database Systems') quizSubject = 'Database Systems';
    else if (legacy === 'Operating Systems') quizSubject = 'Operating Systems';
    else if (subject.name === 'Web Development') quizSubject = 'Web Development';

    const match = getQuizBySubjectTopic(quizSubject, lesson.name);
    if (!match) return null;
    return { subject: match.subject, topic: match.topic, id: match.id, route: `/quiz/${match.id}` };
  }, [subject, lesson]);

  // Recommendation engine: quiz first, emotion only as tentative support.
  // Single card at a time; recommendation memo avoids repeat notifications.
  useEffect(() => {
    if (suggestionsPaused || supportPaused) { setRecommendation(null); return; }
    const rec = buildLearningRecommendation({
      lessonId: lesson?.name,
      emotionSupportEnabled: emotionOptIn && isWebcamOn,
      smoothedEmotion: smoothedSignal ? { ...smoothedSignal, sustainedSeconds: sadSeconds, frames: smoothedEmotion?.frames ?? 3 } : null,
      quizStats: effectiveQuizStatsRef.current,
      dismissedTypes,
      cooldowns,
      suggestionsPaused,
      breakRequested,
      hasSimplerExplanation: true,
      hasWalkthrough: true,
      hasQuiz: Boolean(quizTarget),
      hasChallenge: false,
    });
    setRecommendation((prev) => {
      if (!rec && !prev) return prev;
      if (rec && prev && rec.type === prev.type) return prev; // avoid repeated notifications
      return rec;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson, emotionOptIn, isWebcamOn, smoothedSignal, smoothedEmotion, sadSeconds, quizStats, dismissedTypes, cooldowns, suggestionsPaused, supportPaused, breakRequested, quizTarget?.subject, quizTarget?.topic]);

  const completedLessons = Array.isArray(progress?.completedLessons) ? progress.completedLessons.map(String) : [];
  const previousLesson = lessons[lessonIndex - 1];
  const nextLesson = lessons[lessonIndex + 1];

  const localQuizStats = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('lerni-quiz-stats') || 'null'); } catch { return null; }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonProgressKey]);
  const effectiveQuizStats = quizStats || (localQuizStats?.key === lessonProgressKey ? localQuizStats.stats : null);
  // Ref mirror so the recommendation effect always sees fresh stats without loops.
  const effectiveQuizStatsRef = useRef(null);
  effectiveQuizStatsRef.current = effectiveQuizStats;

  const walkthrough = lesson ? getWalkthrough(lesson.name) : null;
  const simplified = lesson ? getSimplified(lesson.name) : null;

  const enableEmotion = () => { setEmotionOptIn(true); setSupportPaused(false); startDetection(); };
  const disableEmotion = () => {
    setEmotionOptIn(false);
    setSupportPaused(false);
    setSmoothedSignal(null);
    setSadSeconds(0);
    stopDetection();
  };
  const pauseSupport = () => { setSupportPaused(true); pauseDetection(); };
  const resumeSupport = () => { setSupportPaused(false); resumeDetection(); };
  const dismissRecommendation = (type) => {
    setDismissedTypes((d) => [...new Set([...d, type])]);
    setRecommendation(null);
  };
  const snoozeRecommendation = (type) => {
    setCooldowns((c) => ({ ...c, [type]: Date.now() }));
    setRecommendation(null);
  };
  const handleSupportAction = (action, rec) => {
    if (action === 'break') {
      // Functional 5-minute overlay; preserves lesson + progress (no navigation).
      setShowBreakTimer(true);
      setBreakRequested(false);
      dismissRecommendation(rec.type);
      return;
    }
    if (action === 'walkthrough' || action === 'example') {
      setActiveHelp('walkthrough');
      setTimeout(() => document.getElementById('study-help-panel')?.scrollIntoView({ behavior: 'smooth' }), 50);
      dismissRecommendation(rec.type);
      return;
    }
    if (action === 'simpler') {
      setActiveHelp('simpler');
      setTimeout(() => document.getElementById('study-help-panel')?.scrollIntoView({ behavior: 'smooth' }), 50);
      dismissRecommendation(rec.type);
      return;
    }
    if (action === 'review') {
      setActiveHelp(null);
      document.getElementById('study-objectives-title')?.scrollIntoView({ behavior: 'smooth' });
      dismissRecommendation(rec.type);
      return;
    }
    if (action === 'practice' || action === 'challenge') {
      if (quizTarget) navigate(quizTarget.route);
      else snoozeRecommendation(rec.type);
      return;
    }
    if (action === 'next' && nextLesson) {
      navigate(`/study/${subject.slug}/lessons/${nextLesson.slug}`);
      return;
    }
    if (action === 'later' || action === 'continue') { snoozeRecommendation(rec.type); return; }
    dismissRecommendation(rec.type);
  };
  const isComplete = completedLessons.includes(lessonProgressKey);
  const objectives = lesson ? [
    `Explain the key ideas behind ${lesson.name}.`,
    `Describe the concepts covered in ${lessonSections[1]?.title || 'the lesson sections'}.`,
    `Identify a practical use of ${lesson.name}.`,
  ] : [];

  const markComplete = async () => {
    if (!subject || !lesson || isComplete || saving) return;
    setSaving(true);
    setSaveError('');

    try {
      await saveLessonProgress(getLegacySubjectName(subject), lesson.name, elapsedSeconds);
      setProgress((current) => ({
        ...(current || {}),
        completedLessons: [...new Set([...completedLessons, lessonProgressKey])],
      }));
    } catch (error) {
      setSaveError(error.message || 'Could not save lesson completion. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!subject || !lesson) {
    return (
      <div className="study-page">
        <header className="study-topbar">
          <Link className="study-brand" to="/study"><span className="study-brand-icon">L</span><strong>Lerni</strong></Link>
          <Link className="study-back-button" to={subject ? `/study/${subject.slug}` : '/study'}>Back to {subject ? 'subject' : 'Study'}</Link>
        </header>
        <main className="study-lesson-not-found" role="status">
          <span className="study-eyebrow">LESSON UNAVAILABLE</span>
          <h1>This lesson could not be found</h1>
          <p>The lesson URL may be invalid, or this content is not available yet.</p>
          <Link to={subject ? `/study/${subject.slug}` : '/study'}>Return to {subject ? subject.name : 'Study'}</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="study-page study-lesson-page">
      <header className="study-topbar">
        <Link className="study-brand" to="/dashboard"><span className="study-brand-icon">L</span><strong>Lerni</strong></Link>
        <nav className="study-breadcrumb" aria-label="Breadcrumb">
          <Link to="/study">Study</Link><span>/</span>
          <Link to={`/study/${subject.slug}`}>{subject.name}</Link><span>/</span>
          <strong aria-current="page">{lesson.name}</strong>
        </nav>
        <Link className="study-back-button" to={`/study/${subject.slug}`}>Back to subject</Link>
      </header>

      <main className="study-lesson-content">
        <header className="study-lesson-heading">
          <span className="study-eyebrow">{lesson.moduleTitle} · LESSON {String(lessonIndex + 1).padStart(2, '0')} OF {lessons.length}</span>
          <h1>{lesson.name}</h1>
          <p>{lessonSections[0]?.content.split('\n').find((line) => line.trim()) || `Learn the core ideas behind ${lesson.name}.`}</p>
          <div className="study-lesson-meta">
            <span>{subject.name}</span><span>{lesson.moduleTitle}</span>
            {progressLoading ? <span>Loading progress…</span> : <span className={isComplete ? 'is-complete' : ''}>{progressError ? 'Progress unavailable' : isComplete ? 'Completed' : 'Not completed'}</span>}
          </div>
        </header>

        <section className={`study-emotion-support${isWebcamOn ? ' is-active' : ''}`} aria-label="Optional emotion support">
          <video
            ref={videoRef}
            className={`study-emotion-video${isWebcamOn ? ' is-active' : ''}`}
            autoPlay
            playsInline
            muted
            aria-label="Local webcam preview"
          />
          <div className="study-emotion-copy">
            <strong>Emotion Support</strong>
            <p>Get optional learning suggestions based on facial-expression estimates and your learning progress.</p>
            <p className="study-privacy-note">Camera access is optional. Lerni uses facial-expression estimates to offer learning suggestions and does not save webcam video.</p>
            <p className="study-emotion-status" role="status">
              {emotionLoading && startupStep ? startupStep : supportPaused || isPaused ? STATUS_TEXT.paused : emotionLoading ? STATUS_TEXT.loading : STATUS_TEXT[detectionStatus] || STATUS_TEXT.off}
            </p>
            <p className="study-emotion-status">
              Supported expressions: {SUPPORTED_EXPRESSIONS.join(', ')}. Confidence is the model&apos;s certainty, not proof of how you feel.
            </p>
            {isWebcamOn && !supportPaused && !isPaused && currentEmotion && (
              <p className="study-emotion-estimate" role="status">
                Estimate: {currentEmotion} ({confidence}% model confidence). Uncertain — does not measure understanding.
              </p>
            )}
            {isWebcamOn && !supportPaused && !isPaused && smoothedEmotion && detectionStatus === 'ready' && (
              <p className="study-emotion-estimate" role="status">
                Smoothed estimate: {smoothedEmotion.emotion} ({smoothedEmotion.confidence}% over {smoothedEmotion.frames} frames).
              </p>
            )}
            {emotionError && (
              <p className="study-emotion-error" role="alert">
                {emotionError}{' '}
                {isWebcamOn && !modelsReady && (
                  <button type="button" className="study-emotion-toggle" onClick={retryModels} disabled={modelsLoading}>
                    {modelsLoading ? 'Retrying…' : 'Retry model load'}
                  </button>
                )}
                <button type="button" className="study-emotion-toggle" onClick={clearError}>
                  Dismiss
                </button>
              </p>
            )}
            {isWebcamOn && <p className="study-emotion-status">Camera: on · Models: {modelsReady ? 'ready' : modelsLoading ? 'loading…' : 'not loaded'} · Processing: {supportPaused || isPaused ? 'paused' : 'active'}</p>}
            {effectiveQuizStats && (
              <p className="study-emotion-status">Recent quiz: {effectiveQuizStats.recentScore ?? effectiveQuizStats.averageScore}% · {effectiveQuizStats.attempts} attempt(s). Quiz results guide revision suggestions.</p>
            )}
          </div>
          <div className="study-emotion-buttons">
            {isWebcamOn ? (
              <>
                {supportPaused || isPaused
                  ? <button type="button" className="study-emotion-toggle is-primary" onClick={resumeSupport}>Resume Emotion Support</button>
                  : <button type="button" className="study-emotion-toggle" onClick={pauseSupport}>Pause Emotion Support</button>}
                <button type="button" className="study-emotion-toggle" onClick={disableEmotion}>Turn Off Webcam</button>
              </>
            ) : (
              <>
                <button type="button" className="study-emotion-toggle is-primary" onClick={enableEmotion} disabled={emotionLoading}>
                  {emotionLoading ? 'Starting…' : detectionStatus === 'error' ? 'Try Webcam Again' : 'Enable Emotion Support'}
                </button>
                <button type="button" className="study-emotion-toggle" onClick={() => setEmotionOptIn(false)}>Continue Without Webcam</button>
                <button type="button" className="study-emotion-toggle" onClick={() => setBreakRequested(true)}>I&apos;d like a break</button>
              </>
            )}
          </div>
        </section>

        {!suggestionsPaused && (
          <LearningSuggestionCard
            recommendation={recommendation}
            onAction={handleSupportAction}
            onNotNow={snoozeRecommendation}
            onDismiss={dismissRecommendation}
            onDisable={() => { setSuggestionsPaused(true); setRecommendation(null); }}
          />
        )}
        {suggestionsPaused && (
          <button type="button" className="study-emotion-toggle" onClick={() => { setSuggestionsPaused(false); setDismissedTypes([]); setCooldowns({}); }}>
            Turn suggestions back on
          </button>
        )}
        {showBreakTimer && (
          <BreakTimer seconds={300} lessonName={lesson.name} onEnd={() => setShowBreakTimer(false)} onClose={() => setShowBreakTimer(false)} />
        )}
        {activeHelp && (
          <section id="study-help-panel" className="study-lesson-panel study-help-panel" aria-label={activeHelp === 'walkthrough' ? 'Walkthrough example' : 'Simpler explanation'}>
            {activeHelp === 'walkthrough' ? (
              <>
                <h2>{walkthrough.title}</h2>
                <p>{walkthrough.intro}</p>
                <ol>{walkthrough.steps.map((s) => <li key={s}>{s}</li>)}</ol>
              </>
            ) : (
              <>
                <h2>Simpler explanation: {lesson.name}</h2>
                <p><strong>Analogy:</strong> {simplified.analogy}</p>
                <p>{simplified.simple}</p>
                <p><strong>Example:</strong> {simplified.example}</p>
              </>
            )}
            <div className="study-support-actions">
              {quizTarget && <button type="button" className="study-support-btn" onClick={() => navigate(quizTarget.route)}>Practise with a Quiz</button>}
              <button type="button" className="study-support-btn is-quiet" onClick={() => setActiveHelp(null)}>Close</button>
            </div>
          </section>
        )}

        {progressError && <p className="study-lesson-message is-error" role="alert">{progressError} You can still study, but saved progress may be unavailable.</p>}

        <section className="study-lesson-panel study-lesson-objectives" aria-labelledby="study-objectives-title">
          <h2 id="study-objectives-title">Learning objectives</h2>
          <ul>
            {objectives.map((objective) => <li key={objective}>{objective}</li>)}
          </ul>
        </section>

        {lessonSections.length > 3 && (
          <nav className="study-lesson-toc" aria-label="Lesson sections">
            <strong>In this lesson</strong>
            {lessonSections.map((section) => (
              <a key={section.title} href={`#${slugifyStudyId(section.title)}`}>{section.title}</a>
            ))}
          </nav>
        )}

        <div className="study-lesson-sections">
          {lessonSections.map((section) => (
            <section className="study-lesson-section" id={slugifyStudyId(section.title)} key={section.title}>
              <div className="study-lesson-section-icon" aria-hidden="true">{section.image}</div>
              <div>
                <h2>{section.title}</h2>
                <div className="study-lesson-prose">
                  {section.content.split('\n').filter((line) => line.trim()).map((line, index) => (
                    <p key={`${section.title}-${index}`}>{line.trim()}</p>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>

        <section className="study-lesson-panel study-lesson-summary">
          <h2>Key takeaways</h2>
          <p>Before moving on, make sure you can explain these parts of the lesson:</p>
          <ul>{lessonSections.map((section) => <li key={section.title}>{section.title}</li>)}</ul>
        </section>

        {saveError && <p className="study-lesson-message is-error" role="alert">{saveError}</p>}
        <div className="study-lesson-controls">
          <Link className="study-lesson-back-link" to={`/study/${subject.slug}`}>Back to subject</Link>
          <div className="study-lesson-control-actions">
            {quizTarget && (
              <Link className="study-lesson-quiz-link" to={quizTarget.route}>Take Quiz</Link>
            )}
            <button type="button" className="study-lesson-complete" onClick={markComplete} disabled={saving || progressLoading || isComplete}>
              {isComplete ? 'Lesson completed' : saving ? 'Saving progress…' : 'Mark as complete'}
            </button>
          </div>
        </div>

        <nav className="study-lesson-navigation" aria-label="Lesson navigation">
          {previousLesson ? (
            <Link to={`/study/${subject.slug}/lessons/${previousLesson.slug}`}>← {previousLesson.name}</Link>
          ) : <button type="button" disabled>First available lesson</button>}
          {nextLesson ? (
            <Link to={`/study/${subject.slug}/lessons/${nextLesson.slug}`}>{nextLesson.name} →</Link>
          ) : <button type="button" disabled>Last available lesson</button>}
        </nav>
      </main>
    </div>
  );
};

export default StudyLessonPage;
