import React, { useState } from 'react';

const ConversationHistory = ({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onDelete,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const query = (searchQuery || '').toLowerCase().trim();
  const filtered = conversations.filter(
    (c) =>
      !query ||
      c.title.toLowerCase().includes(query) ||
      (c.subject && c.subject.toLowerCase().includes(query)) ||
      (c.topic && c.topic.toLowerCase().includes(query))
  );

  const handleDelete = (event, id) => {
    event.stopPropagation();
    if (window.confirm('Delete this conversation?')) {
      onDelete(id);
    }
  };

  if (conversations.length === 0) {
    return (
      <div className="at-history-empty">
        <h3>Your chats</h3>
        <p className="at-history-empty-text">Your recent chats will appear here.</p>
        <button type="button" className="at-button at-button--primary" onClick={onNewChat}>
          New Chat
        </button>
      </div>
    );
  }

  return (
    <div className="at-history-list">
      <div className="at-history-head">
        <div>
          <h3>Your chats</h3>
          <p>Recent conversations</p>
        </div>
        <button type="button" className="at-button at-button--quiet at-history-new" onClick={onNewChat}>
          New Chat
        </button>
      </div>
      <div className="at-history-search">
        <input
          className="at-history-search-input"
          placeholder="Search conversations"
          aria-label="Search conversations"
          value={searchQuery || ''}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
      <p className="at-history-session-note">Chats are held in server memory and clear when the backend restarts.</p>
      {filtered.length === 0 ? (
        <p className="at-history-empty-text">No conversations found.</p>
      ) : (
        <nav className="at-history-nav" aria-label="Conversation history">
          {filtered.map((conversation) => {
            const isActive = conversation.id === activeId;
            const updated = conversation.updatedAt
              ? new Date(conversation.updatedAt).toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
              : '';
            const contextLabel = [conversation.subject, conversation.topic].filter(Boolean).join(' · ');
            return (
              <div
                key={conversation.id}
                className={`at-history-item${isActive ? ' is-active' : ''}`}
              >
                <button
                  type="button"
                  className="at-history-item-select"
                  aria-current={isActive ? 'true' : undefined}
                  onClick={() => onSelect(conversation.id)}
                >
                  <div className="at-history-item-main">
                    <strong className="at-history-item-title">{conversation.title}</strong>
                    <span className="at-history-item-context">{contextLabel}</span>
                  </div>
                  {updated && <span className="at-history-item-time">{updated}</span>}
                </button>
                <button
                  type="button"
                  className="at-history-item-delete"
                  title="Delete conversation"
                  aria-label={`Delete ${conversation.title}`}
                  onClick={(event) => handleDelete(event, conversation.id)}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            );
          })}
        </nav>
      )}
    </div>
  );
};

export default ConversationHistory;
