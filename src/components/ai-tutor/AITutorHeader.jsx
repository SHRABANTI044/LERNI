import React from 'react';
import SubjectContextSelector from './SubjectContextSelector';

const AITutorHeader = ({
  status,
  context,
  onSetContext,
  onClearContext,
  onSelectMode,
  mode,
  onNewChat,
  onToggleHistory,
  historyOpen,
}) => (
  <header className="at-header">
    <div className="at-header-tools">
      <div className="at-header-context">
        <SubjectContextSelector
          subject={context.subject || null}
          topic={context.topic || null}
          onChange={onSetContext}
          onClear={onClearContext}
        />
        <label className="at-mode-select">
          <span>Help style</span>
          <select value={mode} onChange={(event) => onSelectMode(event.target.value)}>
            <option value="explain-simply">Explain simply</option>
            <option value="detailed">Detailed explanation</option>
            <option value="step-by-step">Step by step</option>
            <option value="exam-revision">Exam revision</option>
            <option value="practice">Practice questions</option>
          </select>
        </label>
      </div>
      <div className="at-header-actions">
        <span className={`at-status at-status--${status}`} role="status">
          {status === 'available' ? 'Gemini key detected' : status === 'checking' ? 'Checking configuration' : 'Tutor unavailable'}
        </span>
        <button type="button" className="at-button at-button--quiet" onClick={onToggleHistory} aria-expanded={historyOpen}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 5h18M3 12h18M3 19h18" />
          </svg>
          Chats
        </button>
        <button type="button" className="at-button at-button--primary" onClick={onNewChat}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New chat
        </button>
      </div>
    </div>
  </header>
);

export default AITutorHeader;
