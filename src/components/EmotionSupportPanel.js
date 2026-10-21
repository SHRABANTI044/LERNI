import React, { useEffect, useRef, useState } from 'react';

const ACTION_LABELS = {
  walkthrough: 'Show Walkthrough Example',
  simpler: 'Simplify This Topic',
  example: 'Show Worked Example',
  review: 'Review the Explanation',
  practice: 'Practise with a Quiz',
  challenge: 'Try a Challenge Question',
  next: 'Continue to the Next Lesson',
  break: 'Start 5-Minute Break',
  continue: 'Continue Studying',
  later: 'Not Now',
  dismiss: 'Dismiss',
};

export const LearningSuggestionCard = ({ recommendation, onAction, onNotNow, onDismiss, onDisable }) => {
  if (!recommendation) return null;
  return (
    <section className="study-support-card" role="status" aria-live="polite" aria-label="Learning suggestion">
      <div className="study-support-copy">
        <strong>{recommendation.title}</strong>
        <p>{recommendation.message}</p>
        <p className="study-support-note">Optional. Expression estimates are uncertain; quiz results and your choices matter most.</p>
      </div>
      <div className="study-support-actions">
        {recommendation.actions.map((action) => (
          <button key={action} type="button" className="study-support-btn" onClick={() => onAction(action, recommendation)}>
            {ACTION_LABELS[action] || action}
          </button>
        ))}
        <button type="button" className="study-support-btn is-quiet" onClick={() => onNotNow(recommendation.type)}>Not Now</button>
        <button type="button" className="study-support-btn is-quiet" onClick={() => onDismiss(recommendation.type)}>Dismiss</button>
        <button type="button" className="study-support-btn is-quiet" onClick={onDisable}>Turn off suggestions</button>
      </div>
    </section>
  );
};

// Backwards-compatible export (previous panel name).
export const EmotionSupportPanel = LearningSuggestionCard;
export default LearningSuggestionCard;

// Functional 5-minute break overlay: single timer, cleanup on unmount.
export const BreakTimer = ({ seconds = 300, lessonName = '', onEnd, onClose }) => {
  const [remaining, setRemaining] = useState(seconds);
  const timerRef = useRef(null);
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };
  }, [seconds]);
  useEffect(() => {
    if (remaining === 0 && timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, [remaining]);
  const mm = String(Math.floor(remaining / 60)).padStart(1, '0');
  const ss = String(remaining % 60).padStart(2, '0');
  return (
    <section className="study-support-card is-break" role="dialog" aria-label="Break timer">
      <div className="study-support-copy">
        <strong>{remaining === 0 ? 'Break complete' : `Break — ${mm}:${ss} left`}</strong>
        <p>{remaining === 0 ? 'Ready when you are.' : `Rest your eyes. ${lessonName ? `Your place in "${lessonName}" is saved.` : 'Your place is saved.'}`}</p>
      </div>
      <div className="study-support-actions">
        {remaining === 0
          ? <button type="button" className="study-support-btn" onClick={onEnd || onClose}>Return to Lesson</button>
          : <button type="button" className="study-support-btn" onClick={onClose}>End Break Early</button>}
      </div>
    </section>
  );
};

