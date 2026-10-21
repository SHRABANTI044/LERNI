import React from 'react';
import { renderMarkdown } from './MarkdownRenderer';

const formatTime = (timestamp) => {
  if (!timestamp) return null;
  try {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (_) {
    return null;
  }
};

const AiAvatar = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#5b61f6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    <circle cx="12" cy="9" r="2" />
  </svg>
);

const ChatMessage = ({ message, onCopy, onFeedback, onRegenerate, onExplainSimply, onGiveExample }) => {
  const isAi = message.role === 'assistant';
  const time = formatTime(message.timestamp);
  const status = message.status || 'done';

  const handleCopy = () => {
    if (!onCopy) return;
    onCopy(message.content);
  };

  const handleFeedback = (helpful) => {
    if (!onFeedback) return;
    onFeedback(message.id, helpful);
  };

  const actions = (
    <div className="at-message-actions">
      <button type="button" className="at-action-button" title="Copy response" aria-label="Copy response" onClick={handleCopy} disabled={status !== 'done'}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      </button>
      <button type="button" className={`at-action-button${message.feedback === true ? ' is-selected' : ''}`} title="Helpful" aria-label="Mark response as helpful" aria-pressed={message.feedback === true} onClick={() => handleFeedback(true)} disabled={status !== 'done'}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="22 7 13.5 15.5 8.5 10.5" /><polyline points="16 7 22 7 22 13" />
        </svg>
      </button>
      <button type="button" className={`at-action-button${message.feedback === false ? ' is-selected' : ''}`} title="Not helpful" aria-label="Mark response as not helpful" aria-pressed={message.feedback === false} onClick={() => handleFeedback(false)} disabled={status !== 'done'}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="22 17 13.5 8.5 8.5 13.5" /><polyline points="16 17 22 17 22 11" />
        </svg>
      </button>
      <button type="button" className="at-action-button" title="Regenerate response" aria-label="Regenerate response" onClick={onRegenerate} disabled={status !== 'done' || !onRegenerate}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M1 4v6h6M23 20v-6h-6" /><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.49 4.36A9 9 0 0 1 2.31 15.74" />
        </svg>
      </button>
      <button type="button" className="at-action-button" title="Explain more simply" aria-label="Explain response more simply" onClick={onExplainSimply} disabled={status !== 'done' || !onExplainSimply}>
        Simpler
      </button>
      <button type="button" className="at-action-button" title="Give an example" aria-label="Ask for an example" onClick={onGiveExample} disabled={status !== 'done' || !onGiveExample}>
        Example
      </button>
    </div>
  );

  return (
    <div className={`at-message ${isAi ? 'at-message--ai' : 'at-message--student'} at-message--${status}`}>
      {isAi && (
        <div className="at-message-avatar" aria-hidden="true">
          <AiAvatar />
        </div>
      )}
      <div className={`at-message-bubble ${isAi ? 'at-message-bubble--ai' : 'at-message-bubble--student'}`}>
        {isAi ? renderMarkdown(message.content) : <span className="at-plain-text">{message.content}</span>}
      </div>
      {time && <span className="at-message-time">{time}</span>}
      {isAi && status === 'done' && actions}
    </div>
  );
};

export default ChatMessage;
