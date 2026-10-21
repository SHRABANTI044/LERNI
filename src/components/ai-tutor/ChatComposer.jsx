import React, { useRef, useCallback } from 'react';

const ChatComposer = ({ value, onChange, onSend, disabled, sending }) => {
  const inputRef = useRef(null);

  const handleChange = useCallback((event) => {
    onChange(event.target.value);
  }, [onChange]);

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
    // Shift+Enter uses the browser's default newline behaviour in the textarea.
  }, [onSend]);

  const handleSend = useCallback(() => {
    onSend();
    if (inputRef.current) inputRef.current.focus();
  }, [onSend]);

  const handleClear = useCallback(() => {
    onChange('');
    if (inputRef.current) inputRef.current.focus();
  }, [onChange]);

  const isEmpty = !value || value.trim().length === 0;

  return (
    <div className="at-composer">
      <div className="at-composer-inner">
        <textarea
          ref={inputRef}
          className="at-textarea"
          placeholder="Ask Lerni anything about your studies..."
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled || sending}
          rows={1}
          data-rows="1"
          spellCheck
          autoComplete="off"
          autoCorrect="off"
        />
        <div className="at-composer-controls">
          {!isEmpty && (
            <button
              type="button"
              className="at-clear-button"
              title="Clear"
              aria-label="Clear input"
              onClick={handleClear}
              disabled={disabled || sending}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
          <button
            type="button"
            className={`at-send-button ${isEmpty || disabled || sending ? 'is-disabled' : ''}`}
            title="Send message"
            aria-label="Send message"
            onClick={handleSend}
            disabled={isEmpty || disabled || sending}
          >
            {sending ? (
              <span className="at-send-loading" aria-hidden="true"></span>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        </div>
      </div>
      {!sending && !isEmpty && (
        <p className="at-composer-hint">
          Press <span className="at-key">Enter</span> to send &nbsp;•&nbsp; <span className="at-key">Shift</span> + <span className="at-key">Enter</span> for a new line
        </p>
      )}
      <p className="at-composer-disclaimer">
        AI-generated responses may be inaccurate or incomplete. Please verify important information against your course materials.
      </p>
    </div>
  );
};

export default ChatComposer;
