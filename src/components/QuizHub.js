import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUserProgress } from '../services/api';
import { quizCatalog, quizSubjects } from '../data/quizCatalog';
import AppShell from './AppShell';
import './QuizHub.css';

const STATUS_LABEL = {
  new: 'Not started',
  review: 'Needs review',
  completed: 'Completed',
  mastered: 'Mastered',
};

const attemptKey = (subject, topic) => `${subject}::${topic}`;

const buildQuizStats = (history) => {
  const stats = new Map();
  (Array.isArray(history) ? history : []).forEach((attempt) => {
    if (!attempt || !attempt.topic) return;
    const key = attemptKey(attempt.subject, attempt.topic);
    const percentage = attempt.percentage ?? (attempt.totalQuestions
      ? Math.round(((attempt.score || 0) / attempt.totalQuestions) * 100)
      : 0);
    const existing = stats.get(key) || { attempts: 0, best: 0, last: 0, incorrect: 0 };
    existing.attempts += 1;
    existing.best = Math.max(existing.best, percentage);
    existing.last = percentage;
    existing.incorrect += Math.max(0, (attempt.totalQuestions || 0) - (attempt.score || 0));
    stats.set(key, existing);
  });
  return stats;
};

const QuizHub = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(() => new Map());
  const [subject, setSubject] = useState('All');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    let active = true;
    getUserProgress()
      .then((data) => { if (active) setStats(buildQuizStats(data?.quizHistory)); })
      .catch((requestError) => { if (active) setError(requestError.message || 'Could not load quiz history.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const quizzes = useMemo(() => quizCatalog.map((quiz) => {
    const stat = stats.get(attemptKey(quiz.subject, quiz.topic)) || null;
    let status = 'new';
    if (stat) {
      if (stat.best >= 80) status = 'mastered';
      else if (stat.best >= 60) status = 'completed';
      else status = 'review';
    }
    return { ...quiz, stat, status };
  }), [stats]);

  const visible = useMemo(() => quizzes.filter((quiz) => {
    if (subject !== 'All' && quiz.subject !== subject) return false;
    if (filter === 'todo' && quiz.status !== 'new') return false;
    if (filter === 'review' && quiz.status !== 'review') return false;
    const needle = query.trim().toLowerCase();
    if (needle && !`${quiz.topic} ${quiz.subject}`.toLowerCase().includes(needle)) return false;
    return true;
  }), [quizzes, subject, filter, query]);

  const grouped = useMemo(() => quizSubjects
    .map((name) => ({ subject: name, items: visible.filter((quiz) => quiz.subject === name) }))
    .filter((group) => group.items.length), [visible]);

  const totals = useMemo(() => ({
    quizzes: quizzes.length,
    attempted: quizzes.filter((quiz) => quiz.stat).length,
    mastered: quizzes.filter((quiz) => quiz.status === 'mastered').length,
    review: quizzes.filter((quiz) => quiz.status === 'review').length,
  }), [quizzes]);

  return (
    <AppShell active="Quizzes" title="Quizzes" subtitle="Practise every topic and track your progress.">
      <section className="hub-hero">
        <div className="hub-hero-copy">
          <span className="hub-kicker">QUIZ CENTRE</span>
          <h2>Test what you know</h2>
          <p>Every quiz has 5 questions drawn from the topic you studied. Scores are saved to your account.</p>
        </div>
        <div className="hub-hero-stats">
          <span><strong>{totals.quizzes}</strong><small>Quizzes</small></span>
          <span><strong>{totals.attempted}</strong><small>Attempted</small></span>
          <span><strong>{totals.mastered}</strong><small>Mastered</small></span>
          <span><strong>{totals.review}</strong><small>To review</small></span>
        </div>
      </section>

      <section className="hub-toolbar" aria-label="Filter quizzes">
        <div className="hub-search">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search topics"
            aria-label="Search quizzes"
          />
        </div>
        <div className="hub-filters" role="group" aria-label="Quiz filters">
          {[
            { key: 'all', label: 'All' },
            { key: 'todo', label: 'Not started' },
            { key: 'review', label: 'Needs review' },
          ].map((option) => (
            <button
              key={option.key}
              type="button"
              className={`hub-filter${filter === option.key ? ' is-active' : ''}`}
              onClick={() => setFilter(option.key)}
              aria-pressed={filter === option.key}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="hub-subjects" role="group" aria-label="Filter by subject">
          {['All', ...quizSubjects].map((name) => (
            <button
              key={name}
              type="button"
              className={`hub-subject${subject === name ? ' is-active' : ''}`}
              onClick={() => setSubject(name)}
              aria-pressed={subject === name}
            >
              {name}
            </button>
          ))}
        </div>
      </section>

      {error && <p className="hub-error" role="alert">{error} Quiz attempts still work, but history may be incomplete.</p>}
      {loading && <p className="hub-empty" role="status">Loading your quiz history...</p>}
      {!loading && !grouped.length && (
        <p className="hub-empty" role="status">No quizzes match these filters.</p>
      )}

      {grouped.map((group) => (
        <section className="hub-group" key={group.subject}>
          <div className="hub-group-heading">
            <h3>{group.subject}</h3>
            <span>{group.items.length} {group.items.length === 1 ? 'quiz' : 'quizzes'}</span>
          </div>
          <div className="hub-grid">
            {group.items.map((quiz) => (
              <article className="hub-card" key={quiz.id}>
                <div className="hub-card-top">
                  <span className={`hub-difficulty is-${quiz.difficulty.toLowerCase()}`}>{quiz.difficulty}</span>
                  <span className={`hub-status is-${quiz.status}`}>{STATUS_LABEL[quiz.status]}</span>
                </div>
                <h4>{quiz.topic}</h4>
                <p className="hub-card-meta">
                  {quiz.questionCount} questions
                  {quiz.stat ? ` - Best ${quiz.stat.best}%` : ''}
                  {quiz.stat ? ` - ${quiz.stat.attempts} ${quiz.stat.attempts === 1 ? 'attempt' : 'attempts'}` : ''}
                </p>
                <div className="hub-card-actions">
                  <Link className="hub-button is-primary" to={`/quiz/${quiz.id}`}>
                    {quiz.stat ? 'Retake quiz' : 'Start quiz'}
                  </Link>
                  <Link className="hub-button is-quiet" to={quiz.lessonRoute}>Review lesson</Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </AppShell>
  );
};

export default QuizHub;