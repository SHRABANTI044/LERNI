import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getUserProgress } from '../services/api';
import { getLessonProgressKey, slugifyStudyId, studyCatalog } from '../data/studyCurriculum';
import './SubjectSelection.css';

const catalog = studyCatalog;

const filters = ['All Subjects', 'In Progress', 'Not Started', 'Completed'];
const topicDurations = {
  Stack: 30, Queue: 30, 'Linked List': 45, 'Binary Tree': 50, 'Hash Table': 40, Graph: 60,
  'Bubble Sort': 25, 'Binary Search': 30, 'Quick Sort': 40, 'Merge Sort': 40, 'Dynamic Programming': 60, 'Greedy Algorithms': 55,
  'Introduction to ML': 35, 'Linear Regression': 40, Classification: 45, 'Neural Networks': 55, 'Deep Learning': 60, 'Natural Language Processing': 65,
  'HTML Basics': 35, 'CSS Styling': 40, 'JavaScript Fundamentals': 50, 'React Components': 45, 'REST APIs': 40, 'Authentication & Security': 60,
  'SQL Basics': 30, 'Database Design': 35, 'Joins & Relationships': 40, 'Indexing & Optimization': 45, 'Transactions & ACID': 50, 'NoSQL Databases': 55,
  'OS Introduction': 30, 'Process Management': 35, 'Memory Management': 45, 'File Systems': 40, Deadlocks: 50, 'Virtual Memory': 55,
};

const Icon = ({ name, size = 21 }) => {
  const icons = {
    brain: <><path d="M12 4a4 4 0 0 0-7.5 1.8A4 4 0 0 0 4 13a4 4 0 0 0 4 6h4V4Z" /><path d="M12 4a4 4 0 0 1 7.5 1.8A4 4 0 0 1 20 13a4 4 0 0 1-4 6h-4M8 8h.01M7 14h.01M16 8h.01M17 14h.01M12 9v8" /></>,
    network: <><circle cx="12" cy="5" r="2" /><circle cx="5" cy="18" r="2" /><circle cx="19" cy="18" r="2" /><path d="m11 7-5 9m7-9 5 9M7 18h10" /></>,
    code: <><path d="m8 8-4 4 4 4m8-8 4 4-4 4m-2-11-4 14" /></>,
    chart: <><path d="M3 3v18h18" /><path d="m7 14 4-4 3 3 6-7" /></>,
    branch: <><circle cx="6" cy="5" r="2" /><circle cx="18" cy="19" r="2" /><circle cx="6" cy="19" r="2" /><path d="M6 7v10m12-1v-2a4 4 0 0 0-4-4H6m0 0V7" /></>,
    database: <><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" /></>,
    monitor: <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8m-4-4v4m-5-13 3 3-3 3m6 0h3" /></>,
    server: <><rect x="3" y="3" width="18" height="8" rx="2" /><rect x="3" y="13" width="18" height="8" rx="2" /><path d="M7 7h.01M7 17h.01M11 7h6m-6 10h6" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    arrow: <><path d="M5 12h14m-6-6 6 6-6 6" /></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" /><path d="M4 17a2.5 2.5 0 0 1 2.5-2.5H20" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[name]}</svg>;
};

const getCompletedTopics = (progress) => {
  if (!Array.isArray(progress?.completedLessons)) return [];
  const records = new Set(progress.completedLessons.map(String));
  const completed = catalog.flatMap((subject) => subject.modules.flatMap((module) => (
    module.lessons.filter((topic) => records.has(getLessonProgressKey(subject, topic)))
  )));
  return [...new Set(completed)];
};

const StudySubject = ({ subject, completedTopics, onStartLesson, onBack }) => {
  const totalLessons = subject.modules.reduce((sum, module) => sum + module.lessons.length, 0);
  const completed = subject.modules.reduce((sum, module) => sum + module.lessons.filter((topic) => completedTopics.includes(topic)).length, 0);
  const percent = totalLessons ? Math.round((completed / totalLessons) * 100) : 0;

  return (
    <div className="study-page">
      <header className="study-topbar">
        <button type="button" className="study-brand" onClick={onBack}><span className="study-brand-icon"><Icon name="brain" size={19} /></span><strong>Lerni</strong></button>
        <nav className="study-breadcrumb" aria-label="Breadcrumb"><button type="button" onClick={onBack}>Study</button><span>/</span><strong>{subject.name}</strong></nav>
        <button type="button" className="study-back-button" onClick={onBack}>Back to subjects</button>
      </header>
      <main className="study-subject-content">
        <section className={`subject-overview subject-accent--${subject.color}`}>
          <span className="subject-overview-icon"><Icon name={subject.icon} size={29} /></span>
          <div className="subject-overview-copy">
            <span className="study-eyebrow">YOUR LEARNING PATH</span>
            <h1>{subject.name}</h1>
            <p>{subject.description}</p>
            <div className="subject-overview-meta">
              <span><Icon name="book" size={15} /> {totalLessons} available lessons</span>
              {subject.modules.length > 0 && <span>{subject.modules.length} {subject.modules.length === 1 ? 'module' : 'modules'}</span>}
              {totalLessons > 0 && <span><Icon name="clock" size={15} /> About {subject.modules.flatMap((module) => module.lessons).reduce((sum, topic) => sum + (topicDurations[topic] || 0), 0)} min</span>}
            </div>
          </div>
          <div className="subject-progress-overview">
            <strong>{percent}%</strong><span>completed</span>
            <div className="study-progress-track"><span style={{ width: `${percent}%` }} /></div>
            <small>{completed} of {totalLessons} lessons</small>
          </div>
        </section>

        {totalLessons ? (
          <section className="study-modules">
            <div className="study-section-heading"><div><h2>Learning modules</h2><p>Follow the path in order, or jump to any lesson.</p></div></div>
            {subject.modules.map((module, moduleIndex) => (
              <article className="study-module-card" key={module.title}>
                <div className="study-module-heading">
                  <span className="study-module-number">{String(moduleIndex + 1).padStart(2, '0')}</span>
                  <div><h3>{module.title}</h3><p>{module.lessons.length} lessons · {module.lessons.reduce((sum, topic) => sum + (topicDurations[topic] || 0), 0)} min estimated</p></div>
                  <span className="study-module-completion">{module.lessons.filter((topic) => completedTopics.includes(topic)).length}/{module.lessons.length}</span>
                </div>
                <div className="study-lesson-list">
                  {module.lessons.map((topic, topicIndex) => {
                    const isComplete = completedTopics.includes(topic);
                    const topicObject = { id: topicIndex + 1, name: topic, duration: `${topicDurations[topic] || 30} mins` };
                    return (
                      <button type="button" className="study-lesson-row" key={topic} onClick={() => onStartLesson(subject, topicObject)}>
                        <span className={`study-lesson-state${isComplete ? ' is-complete' : ''}`}>{isComplete ? <Icon name="check" size={14} /> : <Icon name="book" size={14} />}</span>
                        <span className="study-lesson-title">{topic}<small>{isComplete ? 'Completed' : 'Available lesson'}</small></span>
                        <span className="study-lesson-duration"><Icon name="clock" size={13} /> {topicDurations[topic] || 30} min</span>
                        <Icon name="arrow" size={16} />
                      </button>
                    );
                  })}
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="study-no-content">
            <span className="study-no-content-icon"><Icon name="book" size={23} /></span>
            <h2>Course content is being prepared</h2>
            <p>This subject is part of the Lerni catalogue, but it doesn’t have lessons yet. The catalogue will show them here when they’re available.</p>
            <button type="button" onClick={onBack}>Explore available lessons</button>
          </section>
        )}
      </main>
    </div>
  );
};

const SubjectSelection = () => {
  const navigate = useNavigate();
  const { subjectSlug } = useParams();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Subjects');
  const [progress, setProgress] = useState(null);
  const [progressError, setProgressError] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(true);
  const completedTopics = useMemo(() => getCompletedTopics(progress), [progress]);
  const selectedSubject = catalog.find((subject) => subject.slug === subjectSlug);

  useEffect(() => {
    let active = true;
    getUserProgress()
      .then((data) => {
        if (active) setProgress(data);
      })
      .catch((error) => {
        if (active) setProgressError(error.message || 'Could not load learning progress.');
      })
      .finally(() => {
        if (active) setLoadingProgress(false);
      });
    return () => { active = false; };
  }, []);

  const subjects = useMemo(() => catalog.map((subject) => {
    const lessons = subject.modules.flatMap((module) => module.lessons);
    const completed = lessons.filter((topic) => completedTopics.includes(topic)).length;
    return { ...subject, lessons, completed, percent: lessons.length ? Math.round((completed / lessons.length) * 100) : 0 };
  }), [completedTopics]);

  const visibleSubjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return subjects.filter((subject) => {
      const searchable = `${subject.name} ${subject.description} ${subject.lessons.join(' ')} ${subject.modules.map((module) => module.title).join(' ')}`.toLowerCase();
      const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
      const matchesFilter = activeFilter === 'All Subjects'
        || (activeFilter === 'Completed' && subject.lessons.length > 0 && subject.completed === subject.lessons.length)
        || (activeFilter === 'In Progress' && subject.completed > 0 && subject.completed < subject.lessons.length)
        || (activeFilter === 'Not Started' && subject.completed === 0);
      return matchesQuery && matchesFilter;
    });
  }, [subjects, query, activeFilter]);

  const continueSubject = useMemo(
    () => subjects.find((subject) => subject.completed > 0 && subject.completed < subject.lessons.length),
    [subjects]
  );
  const firstAvailableSubject = useMemo(
    () => subjects.find((subject) => subject.lessons.length > 0 && subject.completed < subject.lessons.length),
    [subjects]
  );
  const continueTopic = continueSubject?.lessons.find((topic) => !completedTopics.includes(topic));
  const firstAvailableTopic = firstAvailableSubject?.lessons.find((topic) => !completedTopics.includes(topic));

  const openSubject = (subject) => navigate(`/study/${subject.slug}`);
  const returnToStudy = () => navigate('/study');
  const startLesson = (subject, topic) => {
    navigate(`/study/${subject.slug}/lessons/${slugifyStudyId(topic.name)}`);
  };

  if (selectedSubject) {
    return <StudySubject subject={subjects.find((subject) => subject.slug === selectedSubject.slug) || selectedSubject} completedTopics={completedTopics} onStartLesson={startLesson} onBack={returnToStudy} />;
  }

  return (
    <div className="study-page">
      <header className="study-topbar">
        <button type="button" className="study-brand" onClick={() => navigate('/dashboard')}><span className="study-brand-icon"><Icon name="brain" size={19} /></span><strong>Lerni</strong></button>
        <nav className="study-topnav" aria-label="Main navigation"><button type="button" onClick={() => navigate('/dashboard')}>Dashboard</button><span className="is-current">Study</span><button type="button" onClick={() => navigate('/analytics')}>Analytics</button></nav>
        <button type="button" className="study-back-button" onClick={() => navigate('/dashboard')}>Back to dashboard</button>
      </header>

      <main className="study-content">
        <section className="study-heading">
          <div>
            <span className="study-eyebrow">LEARN SMARTER. GROW BETTER.</span>
            <h1>Your Learning Space</h1>
            <p>Explore new skills, build knowledge, and learn at your own pace.</p>
          </div>
          <label className="study-search">
            <Icon name="search" size={18} />
            <input aria-label="Search subjects and topics" type="search" placeholder="Search subjects, topics..." value={query} onChange={(event) => setQuery(event.target.value)} />
            {query && <button type="button" aria-label="Clear search" onClick={() => setQuery('')}><Icon name="close" size={16} /></button>}
          </label>
        </section>

        {progressError && <div className="study-error" role="alert">{progressError} Progress filters may be incomplete until progress loads.</div>}

        <div className="study-filter-row" role="group" aria-label="Filter subjects">
          {filters.map((filter) => (
            <button key={filter} type="button" className={`study-filter${activeFilter === filter ? ' is-selected' : ''}`} onClick={() => setActiveFilter(filter)}>
              {filter}{filter === 'All Subjects' && <span>{catalog.length}</span>}
            </button>
          ))}
          {loadingProgress && <span className="study-progress-loading">Loading your progress…</span>}
        </div>

        {!query && activeFilter === 'All Subjects' && (
          <section className="study-continue">
            <span className="study-continue-icon"><Icon name="book" size={20} /></span>
            <div className="study-continue-copy">
              <span>{continueSubject ? 'PICK UP WHERE YOU LEFT OFF' : 'READY FOR YOUR FIRST LESSON?'}</span>
              <strong>{continueSubject ? `Continue ${continueSubject.name}` : 'Start your learning journey'}</strong>
              <small>{continueSubject ? `${continueSubject.completed} of ${continueSubject.lessons.length} lessons completed` : 'Choose a subject with lessons available and get started.'}</small>
            </div>
            {(continueSubject || firstAvailableSubject) && (
              <button
                type="button"
                className="study-continue-button"
                onClick={() => startLesson(continueSubject || firstAvailableSubject, { name: continueTopic || firstAvailableTopic })}
              >
                {continueSubject ? 'Continue learning' : 'Explore lessons'} <Icon name="arrow" size={16} />
              </button>
            )}
          </section>
        )}

        <section className="study-catalogue">
          <div className="study-catalogue-heading"><div><h2>Explore subjects</h2><p>Choose a path and learn at your own pace.</p></div><span>{visibleSubjects.length} subjects</span></div>
          {visibleSubjects.length ? (
            <div className="study-subject-grid">
              {visibleSubjects.map((subject) => {
                const lessonCount = subject.lessons.length;
                const moduleCount = subject.modules.length;
                return (
                  <article className="study-subject-card" key={subject.slug}>
                    <div className={`study-subject-icon study-accent--${subject.color}`}><Icon name={subject.icon} size={23} /></div>
                    <h3>{subject.name}</h3>
                    <p className="study-subject-description">{subject.description}</p>
                    <div className="study-card-meta">
                      <span>{moduleCount} {moduleCount === 1 ? 'module' : 'modules'}</span><i /> <span>{lessonCount} {lessonCount === 1 ? 'lesson' : 'lessons'}</span>
                    </div>
                    {lessonCount ? (
                      <>
                        <div className="study-card-progress">
                          <div className="study-progress-label"><span>{subject.completed} of {lessonCount} completed</span><strong>{subject.percent}%</strong></div>
                          <div className="study-progress-track"><span style={{ width: `${subject.percent}%` }} /></div>
                        </div>
                        <button type="button" className="study-card-action" onClick={() => openSubject(subject)}>
                          {subject.percent ? 'Continue learning' : 'Explore lessons'} <Icon name="arrow" size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="study-not-yet">Lessons are being prepared</div>
                        <button type="button" className="study-card-action is-disabled" disabled>Coming soon</button>
                      </>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="study-empty">
              <span className="study-empty-icon"><Icon name="search" size={22} /></span>
              <h3>No subjects found.</h3>
              <p>Try a different keyword or clear your filters.</p>
              <button type="button" onClick={() => { setQuery(''); setActiveFilter('All Subjects'); }}>Clear search and filters</button>
            </div>
          )}
        </section>
        <footer className="study-footer"><span>Lerni · Learn Smarter. Grow Better.</span><span>Lesson counts reflect available course content.</span></footer>
      </main>
    </div>
  );
};

export default SubjectSelection;
