import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getStudySubjectByLegacyName, slugifyStudyId } from '../data/studyCurriculum';
import './TopicSelection.css';

const TopicSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const subject = location.state?.subject;
  const studySubject = getStudySubjectByLegacyName(subject?.name);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [navigationError, setNavigationError] = useState('');

  // Different topics for each subject
  const topicsBySubject = {
    'Data Structures': [
      { id: 1, name: 'Stack', difficulty: 'Easy', duration: '30 mins', completed: false },
      { id: 2, name: 'Queue', difficulty: 'Easy', duration: '30 mins', completed: false },
      { id: 3, name: 'Linked List', difficulty: 'Medium', duration: '45 mins', completed: false },
      { id: 4, name: 'Binary Tree', difficulty: 'Medium', duration: '50 mins', completed: false },
      { id: 5, name: 'Hash Table', difficulty: 'Medium', duration: '40 mins', completed: false },
      { id: 6, name: 'Graph', difficulty: 'Hard', duration: '60 mins', completed: false }
    ],
    'Algorithms': [
      { id: 1, name: 'Bubble Sort', difficulty: 'Easy', duration: '25 mins', completed: false },
      { id: 2, name: 'Binary Search', difficulty: 'Easy', duration: '30 mins', completed: false },
      { id: 3, name: 'Quick Sort', difficulty: 'Medium', duration: '40 mins', completed: false },
      { id: 4, name: 'Merge Sort', difficulty: 'Medium', duration: '40 mins', completed: false },
      { id: 5, name: 'Dynamic Programming', difficulty: 'Hard', duration: '60 mins', completed: false },
      { id: 6, name: 'Greedy Algorithms', difficulty: 'Hard', duration: '55 mins', completed: false }
    ],
    'Web Development': [
      { id: 1, name: 'HTML Basics', difficulty: 'Easy', duration: '35 mins', completed: false },
      { id: 2, name: 'CSS Styling', difficulty: 'Easy', duration: '40 mins', completed: false },
      { id: 3, name: 'JavaScript Fundamentals', difficulty: 'Medium', duration: '50 mins', completed: false },
      { id: 4, name: 'React Components', difficulty: 'Medium', duration: '45 mins', completed: false },
      { id: 5, name: 'REST APIs', difficulty: 'Medium', duration: '40 mins', completed: false },
      { id: 6, name: 'Authentication & Security', difficulty: 'Hard', duration: '60 mins', completed: false }
    ],
    'Machine Learning': [
      { id: 1, name: 'Introduction to ML', difficulty: 'Easy', duration: '35 mins', completed: false },
      { id: 2, name: 'Linear Regression', difficulty: 'Easy', duration: '40 mins', completed: false },
      { id: 3, name: 'Classification', difficulty: 'Medium', duration: '45 mins', completed: false },
      { id: 4, name: 'Neural Networks', difficulty: 'Medium', duration: '55 mins', completed: false },
      { id: 5, name: 'Deep Learning', difficulty: 'Hard', duration: '60 mins', completed: false },
      { id: 6, name: 'Natural Language Processing', difficulty: 'Hard', duration: '65 mins', completed: false }
    ],
    'Database Systems': [
      { id: 1, name: 'SQL Basics', difficulty: 'Easy', duration: '30 mins', completed: false },
      { id: 2, name: 'Database Design', difficulty: 'Easy', duration: '35 mins', completed: false },
      { id: 3, name: 'Joins & Relationships', difficulty: 'Medium', duration: '40 mins', completed: false },
      { id: 4, name: 'Indexing & Optimization', difficulty: 'Medium', duration: '45 mins', completed: false },
      { id: 5, name: 'Transactions & ACID', difficulty: 'Hard', duration: '50 mins', completed: false },
      { id: 6, name: 'NoSQL Databases', difficulty: 'Hard', duration: '55 mins', completed: false }
    ],
    'Operating Systems': [
      { id: 1, name: 'OS Introduction', difficulty: 'Easy', duration: '30 mins', completed: false },
      { id: 2, name: 'Process Management', difficulty: 'Easy', duration: '35 mins', completed: false },
      { id: 3, name: 'Memory Management', difficulty: 'Medium', duration: '45 mins', completed: false },
      { id: 4, name: 'File Systems', difficulty: 'Medium', duration: '40 mins', completed: false },
      { id: 5, name: 'Deadlocks', difficulty: 'Hard', duration: '50 mins', completed: false },
      { id: 6, name: 'Virtual Memory', difficulty: 'Hard', duration: '55 mins', completed: false }
    ]
  };

  // Get topics for the selected subject
  const topics = subject ? topicsBySubject[subject.name] || [] : [];
  const availableTopicNames = new Set(studySubject?.modules.flatMap((module) => module.lessons) || []);

  const handleStartLesson = () => {
    if (!selectedTopic || !studySubject || !availableTopicNames.has(selectedTopic.name)) {
      setNavigationError('This topic is not available as a lesson yet.');
      return;
    }
    navigate(`/study/${studySubject.slug}/lessons/${slugifyStudyId(selectedTopic.name)}`);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return '#10b981';
      case 'Medium': return '#fbbf24';
      case 'Hard': return '#ef4444';
      default: return '#b8b8d1';
    }
  };

  return (
    <div className="topic-selection-container">
      <div className="selection-header">
        <div className="brain-icon">
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
        <div>
          <p className="subject-breadcrumb">{subject?.name || 'Study'}</p>
          <h1 className="page-title">Select a Topic</h1>
        </div>
      </div>

      {topics.length ? (
        <div className="topics-list">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className={`topic-card ${selectedTopic?.id === topic.id ? 'selected' : ''}`}
              role="button"
              tabIndex={0}
              aria-pressed={selectedTopic?.id === topic.id}
              onClick={() => { setSelectedTopic(topic); setNavigationError(''); }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setSelectedTopic(topic);
                  setNavigationError('');
                }
              }}
            >
              <div className="topic-main">
                <div className="topic-number">{topic.id}</div>
                <div className="topic-info">
                  <h3 className="topic-name">{topic.name}</h3>
                  <div className="topic-meta">
                    <span
                      className="topic-difficulty"
                      style={{ color: getDifficultyColor(topic.difficulty) }}
                    >
                      {topic.difficulty}
                    </span>
                    <span className="topic-duration">⏱️ {topic.duration}</span>
                  </div>
                </div>
              </div>
              {topic.completed && <span className="topic-completed">✓ Completed</span>}
            </div>
          ))}
        </div>
      ) : (
        <p className="topic-selection-empty" role="status">
          {subject ? 'No available lessons are listed for this subject yet.' : 'Choose a subject in Study before selecting a topic.'}
        </p>
      )}

      <div className="selection-actions">
        <button className="back-btn" onClick={() => navigate(studySubject ? `/study/${studySubject.slug}` : '/study')}>
          ← Back
        </button>
        <button 
          className="start-lesson-btn" 
          onClick={handleStartLesson}
          disabled={!selectedTopic || !studySubject || !availableTopicNames.has(selectedTopic.name)}
        >
          Start Lesson →
        </button>
      </div>
      {navigationError && <p className="topic-selection-empty" role="alert">{navigationError}</p>}
    </div>
  );
};

export default TopicSelection;
