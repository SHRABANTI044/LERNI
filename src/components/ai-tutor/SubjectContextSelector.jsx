import React, { useState, useEffect, useRef } from 'react';
import { studyCatalog } from '../../data/studyCurriculum';

const SubjectContextSelector = ({ subject, topic, onChange, onClear }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [stage, setStage] = useState('subjects'); // 'subjects' | 'topics'
  const [selectedSubject, setSelectedSubject] = useState(null);
  const menuRef = useRef(null);

  const allSubjects = studyCatalog;
  const filteredSubjects = allSubjects.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase())
  );

  const currentSubject = allSubjects.find((s) => s.name === subject || s.slug === subject);
  const currentTopics = currentSubject
    ? currentSubject.modules.flatMap((m) => m.topics)
    : [];

  const handleSelectSubject = (s) => {
    setSelectedSubject(s);
    setStage('topics');
    setQuery('');
  };

  const handleSelectTopic = (t) => {
    setOpen(false);
    setStage('subjects');
    setQuery('');
    setSelectedSubject(null);
    if (onChange) onChange(selectedSubject.name, t);
  };

  const handleClear = () => {
    setOpen(false);
    setStage('subjects');
    setQuery('');
    setSelectedSubject(null);
    if (onClear) onClear();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
        setStage('subjects');
        setQuery('');
        setSelectedSubject(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const contextLabel = (
    <span className="at-context-label">
      {subject ? `${subject}${topic ? ` · ${topic}` : ''}` : 'Choose a subject'}
    </span>
  );

  const toggleContent = (
    <button
      type="button"
      className="at-context-toggle"
      onClick={() => setOpen(!open)}
      aria-expanded={open}
      aria-haspopup="listbox"
    >
      {contextLabel}
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
  );

  if (!open) return toggleContent;

  const hasTopics = stage === 'topics' && currentTopics.length > 0;

  return (
    <div className="at-context-menu" ref={menuRef}>
      {toggleContent}
      <div className="at-context-dropdown">
        <div className="at-context-search">
          <input
            className="at-context-search-input"
            placeholder="Search subjects"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setStage('subjects');
              setSelectedSubject(null);
            }}
            autoFocus
          />
        </div>
        {stage === 'subjects' ? (
          <nav className="at-context-list" aria-label="Subjects">
            {filteredSubjects.length === 0 ? (
              <p className="at-context-empty">No subjects found.</p>
            ) : (
              filteredSubjects.map((s) => (
                <button
                  type="button"
                  className="at-context-subject"
                  key={s.slug}
                  onClick={() => handleSelectSubject(s)}
                >
                  {s.name}
                </button>
              ))
            )}
          </nav>
        ) : (
          <>
            <nav className="at-context-list" aria-label={`Topics for ${selectedSubject?.name || currentSubject?.name || 'selected subject'}`}>
              {hasTopics ? (
                currentTopics.map((t) => (
                  <button
                    type="button"
                    className="at-context-topic"
                    key={t}
                    onClick={() => handleSelectTopic(t)}
                  >
                    {t}
                  </button>
                ))
              ) : (
                <p className="at-context-empty">No topics available for this subject.</p>
              )}
            </nav>
            <button type="button" className="at-context-clear" onClick={handleClear}>
              Clear context
            </button>
          </>
        )}
        {!hasTopics && stage === 'subjects' && filteredSubjects.length > 0 && (
          <button type="button" className="at-context-clear" onClick={handleClear}>
            Clear context
          </button>
        )}
      </div>
    </div>
  );
};

export default SubjectContextSelector;
