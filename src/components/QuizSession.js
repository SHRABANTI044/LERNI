import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { saveQuizResult } from '../services/api';
import { getQuizById, getQuizBySubjectTopic } from '../data/quizCatalog';
import { getQuizQuestions } from '../data/quizBank';
import AppShell from './AppShell';
import './QuizSession.css';

const XP_PER_CORRECT = 20;

const letterFor = (index) => String.fromCharCode(65 + index);

const resolveQuiz = (quizId, location) => {
  if (quizId) {
    const byId = getQuizById(quizId);
    if (byId) return byId;
  }
  const state = location?.state || {};
  const subject = state.subject?.name || state.subject;
  const topic = state.topic?.name || state.topic;
  if (subject && topic) {
    const byNames = getQuizBySubjectTopic(subject, topic);
    if (byNames) return byNames;
    return { id: null, subject, topic, questionCount: 0, difficulty: 'Mixed', lessonRoute: '/study' };
  }
  return null;
};

const QuizSession = () => {
  const { quizId } = useParams();
  const location = useLocation();
  const quiz = useMemo(() => resolveQuiz(quizId, location), [quizId, location]);

  const questions = useMemo(() => {
    if (!quiz) return [];
    return getQuizQuestions(quiz.subject, quiz.topic);
  }, [quiz]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saved, setSaved] = useState(false);
  const startedAtRef = useRef(Date.now());

  useEffect(() => {
    setCurrentIndex(0);
    setSelected(null);
    setAnswers([]);
    setFinished(false);
    setSaved(false);
    setSaveError('');
    startedAtRef.current = Date.now();
  }, [quiz?.id, quiz?.subject, quiz?.topic]);

  const score = answers.filter((answer) => answer.isCorrect).length;
  const percentage = questions.length ? Math.round((score / questions.length) * 100) : 0;
  const current = questions[currentIndex] || null;

  const submitResult = useCallback(async (finalAnswers) => {
    if (!quiz || !questions.length) return;
    setSaving(true);
    setSaveError('');
    const correct = finalAnswers.filter((answer) => answer.isCorrect).length;
    const xpEarned = correct * XP_PER_CORRECT;
    const timeSpent = Math.max(0, Math.round((Date.now() - startedAtRef.current) / 1000));
    try {
      await saveQuizResult(quiz.subject, quiz.topic, correct, questions.length, xpEarned, timeSpent);
      setSaved(true);
      try {
        const cache = JSON.parse(localStorage.getItem('lerni-quiz-stats') || 'null');
        const key = `${quiz.subject}-${quiz.topic}`;
        const previous = cache && cache.key === key ? cache.stats : null;
        const attempts = (previous?.attempts || 0) + 1;
        const recentScore = Math.round((correct / questions.length) * 100);
        localStorage.setItem('lerni-quiz-stats', JSON.stringify({
          key,
          stats: {
            attempts,
            recentScore,
            averageScore: previous?.averageScore
              ? Math.round((previous.averageScore + recentScore) / 2)
              : recentScore,
            incorrectCount: questions.length - correct,
            weakTopics: [quiz.topic],
          },
          at: Date.now(),
        }));
      } catch { /* local cache is optional */ }
    } catch (error) {
      setSaveError(error.message || 'Could not save your quiz result.');
    } finally {
      setSaving(false);
    }
  }, [quiz, questions.length]);

  const handleNext = () => {
    if (!current || selected === null) return;
    const answer = {
      question: current.question,
      selected,
      correct: current.correct,
      isCorrect: selected === current.correct,
    };
    const nextAnswers = [...answers, answer];
    setAnswers(nextAnswers);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      setSelected(null);
      return;
    }

    setFinished(true);
    submitResult(nextAnswers);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelected(null);
    setAnswers([]);
    setFinished(false);
    setSaved(false);
    setSaveError('');
    startedAtRef.current = Date.now();
  };

  if (!quiz) {
    return (
      <AppShell active="Quizzes" title="Quiz unavailable" subtitle="We could not find that quiz.">
        <div className="qs-missing" role="status">
          <h2>Quiz not found</h2>
          <p>Pick a topic from the quiz centre to start practising.</p>
          <Link to="/quiz">Back to quizzes</Link>
        </div>
      </AppShell>
    );
  }

  if (!questions.length) {
    return (
      <AppShell active="Quizzes" title={quiz.topic} subtitle={quiz.subject}>
        <div className="qs-missing" role="status">
          <h2>No questions available yet</h2>
          <p>This topic does not have a question bank yet. Try another topic.</p>
          <Link to="/quiz">Back to quizzes</Link>
        </div>
      </AppShell>
    );
  }
  if (finished) {
    const missed = answers.filter((answer) => !answer.isCorrect).length;
    const headline = percentage >= 80
      ? 'Excellent work!'
      : percentage >= 60 ? 'Good progress' : 'Worth another pass';
    const summary = percentage >= 80
      ? `You have a strong grasp of ${quiz.topic}.`
      : percentage >= 60
        ? `You understand the basics of ${quiz.topic}. Review the missed questions to level up.`
        : `Revisit the ${quiz.topic} lesson, then try the quiz again.`;

    return (
      <AppShell active="Quizzes" title={quiz.topic} subtitle={quiz.subject}>
        <div className="qs-results">
          <section className="qs-result-card">
            <span className="qs-result-kicker">RESULT</span>
            <h2>{headline}</h2>
            <p className="qs-result-summary">{summary}</p>
            <div className="qs-score-ring" role="img" aria-label={`Score ${percentage} percent`}>
              <span className="qs-score-value">{percentage}%</span>
              <span className="qs-score-label">Score</span>
            </div>
            <div className="qs-result-stats">
              <span><strong>{score}/{questions.length}</strong><small>Correct</small></span>
              <span><strong>{missed}</strong><small>Missed</small></span>
              <span><strong>+{score * XP_PER_CORRECT}</strong><small>XP earned</small></span>
            </div>
            {saving && <p className="qs-save-status" role="status">Saving your result...</p>}
            {saved && !saveError && <p className="qs-save-status" role="status">Your result was saved to your account.</p>}
            {saveError && (
              <div className="qs-save-error" role="alert">
                <p>{saveError}</p>
                <button type="button" onClick={() => submitResult(answers)}>Retry saving result</button>
              </div>
            )}
            <div className="qs-result-actions">
              <button type="button" className="qs-button is-quiet" onClick={handleRestart}>Retake quiz</button>
              <Link className="qs-button is-quiet" to={quiz.lessonRoute}>Review lesson</Link>
              <Link className="qs-button is-primary" to="/analytics">View analytics</Link>
            </div>
          </section>

          <section className="qs-review">
            <h3>Answer review</h3>
            <ol className="qs-review-list">
              {answers.map((answer, index) => (
                <li key={`${index}-${answer.question}`} className={answer.isCorrect ? 'is-correct' : 'is-wrong'}>
                  <span className="qs-review-index">{index + 1}</span>
                  <div>
                    <p className="qs-review-question">{answer.question}</p>
                    <p className="qs-review-answer">
                      {answer.isCorrect ? 'Correct' : 'Incorrect'} - the answer is option{' '}
                      {String.fromCharCode(65 + answer.correct)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </AppShell>
    );
  }
  return (
    <AppShell active="Quizzes" title={quiz.topic} subtitle={quiz.subject}>
      <div className="qs-layout">
        <section className="qs-card">
          <div className="qs-card-head">
            <span className="qs-difficulty">{quiz.difficulty}</span>
            <span className="qs-counter">Question {currentIndex + 1} of {questions.length}</span>
          </div>
          <div className="qs-progress" role="progressbar" aria-valuenow={currentIndex + 1} aria-valuemin={1} aria-valuemax={questions.length}>
            <span style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
          </div>

          <h2 className="qs-question">{current.question}</h2>

          <ul className="qs-options">
            {current.options.map((option, index) => (
              <li key={option}>
                <button
                  type="button"
                  className={`qs-option${selected === index ? ' is-selected' : ''}`}
                  onClick={() => setSelected(index)}
                  aria-pressed={selected === index}
                >
                  <span className="qs-option-letter">{letterFor(index)}</span>
                  <span className="qs-option-text">{option}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="qs-controls">
            <button
              type="button"
              className="qs-button is-quiet"
              onClick={() => { setCurrentIndex(Math.max(0, currentIndex - 1)); setSelected(null); }}
              disabled={currentIndex === 0}
            >
              &larr; Previous
            </button>
            <button type="button" className="qs-button is-primary" onClick={handleNext} disabled={selected === null}>
              {currentIndex + 1 === questions.length ? 'Finish quiz' : 'Next question'}
            </button>
          </div>
        </section>

        <aside className="qs-aside">
          <div className="qs-aside-card">
            <h3>Progress</h3>
            <ul className="qs-dots">
              {questions.map((question, index) => {
                const answered = answers[index];
                const state = answered ? (answered.isCorrect ? 'is-correct' : 'is-wrong') : (index === currentIndex ? 'is-current' : '');
                return (
                  <li key={index}>
                    <span className={`qs-dot${state ? ` ${state}` : ''}`}>
                      {answered ? (answered.isCorrect ? 'OK' : 'X') : index + 1}
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="qs-aside-note">{answers.length} of {questions.length} answered</p>
          </div>
          <div className="qs-aside-card">
            <h3>Need a refresher?</h3>
            <p>Read the lesson before retrying - it maps directly to these questions.</p>
            <Link className="qs-button is-quiet" to={quiz.lessonRoute}>Open lesson</Link>
            <Link className="qs-aside-link" to="/quiz">All quizzes</Link>
          </div>
          <p className="qs-privacy">Quizzes never start the camera. Expression estimates are optional and never affect your score.</p>
        </aside>
      </div>
    </AppShell>
  );
};

export default QuizSession;