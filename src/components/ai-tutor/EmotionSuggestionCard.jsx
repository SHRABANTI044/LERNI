import React from 'react';

const EmotionSuggestionCard = ({ suggestion, onDismiss, onAction }) => {
  if (!suggestion) return null;

  const handleAction = (action) => {
    if (onAction) onAction(action);
  };

  const handleDismiss = () => {
    if (onDismiss) onDismiss();
  };

  return (
    <div className="at-emotion-suggestion" role="region" aria-label="Learning suggestion">
      <div className="at-emotion-suggestion-body">
        <strong className="at-emotion-suggestion-title">{suggestion.title}</strong>
        <p className="at-emotion-suggestion-message">{suggestion.message}</p>
        <div className="at-emotion-suggestion-actions">
          {(suggestion.actions || []).map((action) => (
            <button
              type="button"
              key={action}
              className="at-emotion-action"
              onClick={() => handleAction(action)}
            >
              {action.charAt(0).toUpperCase() + action.slice(1)}
            </button>
          ))}
          <button type="button" className="at-emotion-dismiss" onClick={handleDismiss}>
            Not now
          </button>
          <button
            type="button"
            className="at-emotion-close"
            title="Dismiss"
            aria-label="Dismiss suggestion"
            onClick={handleDismiss}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmotionSuggestionCard;
