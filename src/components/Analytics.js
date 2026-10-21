import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserProgress } from '../services/api';
import { quizCatalog } from '../data/quizCatalog';
import AppShell from './AppShell';
import './Analytics.css';

const ACHIEVEMENTS = [
  { id: 'first-quiz', name: 'First Quiz', icon: '[!]', hint: 'Complete your first quiz' },
  { id: 'perfect-score', name: 'Perfect Score', icon: '100', hint: 'Score 100% on a quiz' },
  { id: 'quiz-master', name: 'Quiz Master', icon: '[*]', hint: 'Complete 5 quizzes' },
  { id: 'first-lesson', name: 'First Lesson', icon: '[=]', hint: 'Finish your first lesson' },
  { id: 'dedicated-learner', name: 'Dedicated Learner', icon: '[*]', hint: 'Finish 5 lessons' },
];

const buildWeek = () => {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let index = 6; index >= 0; index -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - index);
    days.push(date);
  }
  return days;
};

const sameDay = (value, date) => {
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime())
    && parsed.getFullYear() === date.getFullYear()
    && parsed.getMonth() === date.getMonth()
    && parsed.getDate() === date.getDate();
};

const Analytics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getUserProgress()
      .then((data) => { if (active) setProgress(data); })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Could not load your progress data.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const quizzes = useMemo(
    () => (Array.isArray(progress?.quizHistory) ? progress.quizHistory : []),
    [progress]
  );

  const week = useMemo(() => buildWeek(), []);
  const weeklyActivity = useMemo(() => week.map((date) => ({
    date,
    label: date.toLocaleDateString(undefined, { weekday: 'short' }),
    count: quizzes.filter((quiz) => sameDay(quiz.completedAt, date)).length,
  })), [week, quizzes]);
  const maxActivity = Math.max(1, ...weeklyActivity.map((day) => day.count));
  const activeDays = weeklyActivity.filter((day) => day.count > 0).length;

  const topicPerformance = useMemo(() => {
    const byTopic = new Map();
    quizzes.forEach((quiz) => {
      if (!quiz?.topic) return;
      const key = `${quiz.subject}::${quiz.topic}`;
      const percentage = quiz.percentage ?? (quiz.totalQuestions
        ? Math.round(((quiz.score || 0) / quiz.totalQuestions) * 100)
        : 0);
      const entry = byTopic.get(key) || { topic: quiz.topic, subject: quiz.subject, attempts: 0, total: 0, best: 0 };
      entry.attempts += 1;
      entry.total += percentage;
      entry.best = Math.max(entry.best, percentage);
      byTopic.set(key, entry);
    });
    return Array.from(byTopic.values())
      .map((entry) => ({ ...entry, average: Math.round(entry.total / entry.attempts) }))
      .sort((a, b) => a.average - b.average);
  }, [quizzes]);

  const averageScore = useMemo(() => {
    if (!quizzes.length) return 0;
    return Math.round(quizzes.reduce((sum, quiz) => sum + (quiz.percentage ?? 0), 0) / quizzes.length);
  }, [quizzes]);

  const bestScore = useMemo(
    () => quizzes.reduce((max, quiz) => Math.max(max, quiz.percentage ?? 0), 0),
    [quizzes]
  );

  const xp = Number(progress?.xpEarned) || 0;
  const level = Math.floor(xp / 100) + 1;
  const levelProgress = xp % 100;
  const studyMinutes = Number(progress?.totalStudyTime) || 0;
  const lessonsCompleted = Number(progress?.topicsCompleted) || 0;
  const mastered = topicPerformance.filter((entry) => entry.best >= 80).length;
  const needsReview = topicPerformance.filter((entry) => entry.best < 60).length;
  const earned = Array.isArray(progress?.achievements) ? progress.achievements : [];
  const emotionSummary = Array.isArray(progress?.emotionBreakdown)
    ? progress.emotionBreakdown.filter((item) => Number(item.percentage) > 0)
    : [];
  const recentQuiz = progress?.recentQuiz || quizzes[quizzes.length - 1] || null;
  const coverage = quizCatalog.length
    ? Math.round((new Set(quizzes.map((quiz) => quiz.topic)).size / quizCatalog.length) * 100)
    : 0;

  const stats = [
    { label: 'Total XP', value: xp.toLocaleString(), note: `Level ${level}` },
    { label: 'Average score', value: `${averageScore}%`, note: `Best ${bestScore}%` },
    { label: 'Quizzes taken', value: quizzes.length, note: `${activeDays} active days` },
    { label: 'Lessons done', value: lessonsCompleted, note: `${studyMinutes}m studied` },
  ];

  if (loading) {
    return (
      <AppShell active="Analytics" title="Analytics" subtitle="Loading your progress data...">
        <p className="an-loading" role="status">Loading your progress...</p>
      </AppShell>
    );
  }

  return (
    <AppShell active="Analytics" title="Analytics" subtitle="How your learning is going so far.">
      {error && <p className="an-error" role="alert">{error}</p>}

      <section className="an-stats" aria-label="Key statistics">
        {stats.map((stat) => (
          <article className="an-stat" key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
            <small>{stat.note}</small>
          </article>
        ))}
      </section>

      <div className="an-grid">
        <section className="an-panel an-activity">
          <div className="an-panel-head">
            <div><h2>Quiz activity</h2><p>Attempts over the last 7 days</p></div>
            <span className="an-badge">{activeDays}/7 active</span>
          </div>
          {quizzes.length ? (
            <div className="an-chart" role="img" aria-label={`Quiz activity for the last 7 days. ${activeDays} active days.`}>
              {weeklyActivity.map((day) => (
                <div className="an-column" key={day.label}>
                  <span className="an-column-count">{day.count || ''}</span>
                  <div className="an-track">
                    <span className="an-bar" style={{ height: `${day.count ? Math.max(14, (day.count / maxActivity) * 100) : 4}%` }} />
                  </div>
                  <span className="an-column-day">{day.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="an-empty">No quiz attempts yet. Your activity will appear here once you take a quiz.</p>
          )}
        </section>

        <section className="an-panel an-score">
          <div className="an-panel-head">
            <div><h2>Overall score</h2><p>Average across every attempt</p></div>
          </div>
          <div className="an-ring" role="img" aria-label={`Average score ${averageScore} percent`}>
            <span className="an-ring-value">{averageScore}%</span>
            <span className="an-ring-label">Average</span>
          </div>
          <div className="an-mini-stats">
            <span><strong>{bestScore}%</strong><small>Best score</small></span>
            <span><strong>{coverage}%</strong><small>Topic coverage</small></span>
            <span><strong>{mastered}</strong><small>Topics mastered</small></span>
          </div>
        </section>
        <section className="an-panel an-topics">
          <div className="an-panel-head">
            <div><h2>Topic performance</h2><p>Weakest topics first</p></div>
            {needsReview > 0 && <span className="an-badge is-warn">{needsReview} to review</span>}
          </div>
          {topicPerformance.length ? (
            <ul className="an-topic-list">
              {topicPerformance.map((entry) => (
                <li key={`${entry.subject}-${entry.topic}`}>
                  <div className="an-topic-row">
                    <span className="an-topic-name">{entry.topic}</span>
                    <span className="an-topic-score">{entry.average}%</span>
                  </div>
                  <div className="an-topic-track">
                    <span style={{ width: `${entry.average}%` }} />
                  </div>
                  <small className="an-topic-meta">{entry.subject} - {entry.attempts} {entry.attempts === 1 ? 'attempt' : 'attempts'} - best {entry.best}%</small>
                </li>
              ))}
            </ul>
          ) : (
            <p className="an-empty">Take a quiz to see how you are performing per topic.</p>
          )}
        </section>

        <section className="an-panel an-achievements">
          <div className="an-panel-head">
            <div><h2>Achievements</h2><p>{earned.length} of {ACHIEVEMENTS.length} unlocked</p></div>
          </div>
          <div className="an-achievement-grid">
            {ACHIEVEMENTS.map((achievement) => {
              const isEarned = earned.includes(achievement.id);
              return (
                <div className={`an-achievement${isEarned ? ' is-earned' : ' is-locked'}`} key={achievement.id}>
                  <span className="an-achievement-icon">{achievement.icon}</span>
                  <strong>{achievement.name}</strong>
                  <small>{isEarned ? 'Unlocked' : achievement.hint}</small>
                </div>
              );
            })}
          </div>
        </section>
        <section className="an-panel an-recent">
          <div className="an-panel-head">
            <div><h2>Recent attempt</h2><p>Your most recent quiz</p></div>
          </div>
          {recentQuiz ? (
            <div className="an-recent-body">
              <span className="an-recent-topic">{recentQuiz.topic || 'Quiz'}</span>
              <span className="an-recent-subject">{recentQuiz.subject || ''}</span>
              <div className="an-recent-stats">
                <span><strong>{recentQuiz.score}/{recentQuiz.totalQuestions}</strong><small>Correct</small></span>
                <span><strong>{recentQuiz.percentage ?? 0}%</strong><small>Score</small></span>
                <span><strong>+{recentQuiz.xpEarned || 0}</strong><small>XP</small></span>
              </div>
              <p className="an-recent-date">
                {recentQuiz.completedAt ? new Date(recentQuiz.completedAt).toLocaleString() : 'Date unavailable'}
              </p>
            </div>
          ) : (
            <p className="an-empty">No attempts recorded yet.</p>
          )}
        </section>

        <section className="an-panel an-emotion">
          <div className="an-panel-head">
            <div><h2>Emotion journey</h2><p>Expression estimates from study</p></div>
          </div>
          {emotionSummary.length ? (
            <div className="an-emotion-list">
              {emotionSummary.map((item) => (
                <div className="an-emotion-row" key={item.emotion}>
                  <span className="an-emotion-name">{item.emotion}</span>
                  <span className="an-emotion-track"><i style={{ width: `${Math.min(100, Number(item.percentage))}%` }} /></span>
                  <strong>{item.percentage}%</strong>
                </div>
              ))}
              <p className="an-disclaimer">Facial-expression estimates can be inaccurate and do not determine how you feel.</p>
            </div>
          ) : (
            <p className="an-empty">No expression estimates saved yet. Camera features are never started automatically.</p>
          )}
        </section>
      </div>

      <section className="an-level">
        <div>
          <span className="an-level-kicker">LEVEL {level}</span>
          <h2>{levelProgress} / 100 XP to level {level + 1}</h2>
          <p>Every correct answer earns 20 XP.</p>
        </div>
        <div className="an-level-track">
          <span style={{ width: `${levelProgress}%` }} />
        </div>
      </section>

      <div className="an-actions">
        <Link className="an-button is-quiet" to="/study">Continue learning</Link>
        <Link className="an-button is-primary" to="/quiz">Take another quiz</Link>
        <button type="button" className="an-button is-quiet" onClick={() => navigate('/dashboard')}>Back to dashboard</button>
      </div>
    </AppShell>
  );
};

export default Analytics;