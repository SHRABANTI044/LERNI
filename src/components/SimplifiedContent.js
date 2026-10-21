import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getQuizBySubjectTopic } from '../data/quizCatalog';
import './SimplifiedContent.css';

const SimplifiedContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const subject = location.state?.subject;
  const topic = location.state?.topic;
  const lessonState = { subject, topic };
  const quizMatch = subject && topic ? getQuizBySubjectTopic(subject.name, topic.name) : null;
  const quizRoute = quizMatch ? `/quiz/${quizMatch.id}` : '/quiz';

  if (!subject || topic?.name !== 'Stack') {
    return (
      <div className="simplified-container">
        <div className="simplified-card" role="status">
          <h1 className="simplified-title">Simplified content is unavailable</h1>
          <p className="simplified-subtitle">This explanation is currently available for Stack only.</p>
          <button
            className="continue-btn"
            onClick={() => subject && topic ? navigate('/lesson', { state: lessonState }) : navigate('/study')}
          >
            {subject && topic ? 'Back to Lesson' : 'Back to Study'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="simplified-container">
      <div className="simplified-header">
        <button className="back-btn" onClick={() => navigate('/lesson', { state: lessonState })}>
          ← Back to Lesson
        </button>
        <div className="simplified-badge">
          <span className="badge-icon">💡</span>
          Simplified Explanation
        </div>
      </div>

      <div className="simplified-card">
        <h1 className="simplified-title">Stack - Made Simple! 📚</h1>
        <p className="simplified-subtitle">Let's understand Stack in the easiest way possible</p>

        {/* Simple Analogy */}
        <div className="content-section">
          <h2 className="section-title">🍽️ Think of a Stack of Plates</h2>
          <div className="analogy-box">
            <p>Imagine you're washing dishes and stacking plates:</p>
            <ul>
              <li>You put a clean plate on TOP of the stack</li>
              <li>When you need a plate, you take it from the TOP</li>
              <li>You can't take a plate from the middle or bottom easily</li>
            </ul>
            <p className="highlight">That's exactly how a Stack works in programming! 🎯</p>
          </div>
        </div>

        {/* Visual Representation */}
        <div className="content-section">
          <h2 className="section-title">📊 Visual Example</h2>
          <div className="visual-stack">
            <div className="stack-item">Item 3 (Top) ← Last In</div>
            <div className="stack-item">Item 2</div>
            <div className="stack-item">Item 1 (Bottom) ← First In</div>
          </div>
          <p className="visual-note">
            ⬆️ We can only add or remove from the TOP
          </p>
        </div>

        {/* Simple Operations */}
        <div className="content-section">
          <h2 className="section-title">🔧 Three Simple Operations</h2>
          <div className="operations-grid">
            <div className="operation-card">
              <div className="operation-icon">➕</div>
              <h3>Push</h3>
              <p>Add an item to the top</p>
              <div className="code-example">stack.push(5)</div>
            </div>
            <div className="operation-card">
              <div className="operation-icon">➖</div>
              <h3>Pop</h3>
              <p>Remove item from the top</p>
              <div className="code-example">stack.pop()</div>
            </div>
            <div className="operation-card">
              <div className="operation-icon">👀</div>
              <h3>Peek</h3>
              <p>Look at the top item</p>
              <div className="code-example">stack.peek()</div>
            </div>
          </div>
        </div>

        {/* Real Life Examples */}
        <div className="content-section">
          <h2 className="section-title">🌍 Where Do We Use Stacks?</h2>
          <div className="examples-list">
            <div className="example-item">
              <span className="example-icon">↩️</span>
              <div>
                <strong>Undo Button</strong>
                <p>In Word/Photoshop - your last action is undone first</p>
              </div>
            </div>
            <div className="example-item">
              <span className="example-icon">🌐</span>
              <div>
                <strong>Browser Back Button</strong>
                <p>Goes to the last page you visited</p>
              </div>
            </div>
            <div className="example-item">
              <span className="example-icon">📞</span>
              <div>
                <strong>Function Calls</strong>
                <p>When functions call each other in code</p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Points */}
        <div className="content-section key-points">
          <h2 className="section-title">🎯 Remember These Key Points</h2>
          <div className="points-list">
            <div className="point-item">✅ LIFO = Last In, First Out</div>
            <div className="point-item">✅ Only access the TOP element</div>
            <div className="point-item">✅ Push adds, Pop removes</div>
            <div className="point-item">✅ Very fast operations (O(1))</div>
          </div>
        </div>

        <div className="action-buttons">
          <button className="quiz-btn" onClick={() => navigate(quizRoute)}>
            Test Your Understanding 📝
          </button>
          <button className="continue-btn" onClick={() => navigate('/lesson', { state: lessonState })}>
            Continue Learning →
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimplifiedContent;
