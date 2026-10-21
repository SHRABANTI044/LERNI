import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  checkTutorHealth,
  sendTutorMessage,
  getTutorConversations,
  deleteTutorConversation,
} from '../services/aiTutorApi';
import AppShell from '../components/AppShell';
import AITutorHeader from '../components/ai-tutor/AITutorHeader';
import WelcomeScreen from '../components/ai-tutor/WelcomeScreen';
import { SuggestedGrid } from '../components/ai-tutor/SuggestedPromptCard';
import ConversationHistory from '../components/ai-tutor/ConversationHistory';
import ChatComposer from '../components/ai-tutor/ChatComposer';
import EmotionSuggestionCard from '../components/ai-tutor/EmotionSuggestionCard';
import ChatMessage from '../components/ai-tutor/ChatMessage';
import '../components/ai-tutor/styles/ai-tutor.css';

const DEFAULT_MODE = 'explain-simply';

const AITutor = () => {
  const location = useLocation();
  const messagesEndRef = useRef(null);

  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [serviceStatus, setServiceStatus] = useState('checking');
  const [mode, setMode] = useState(DEFAULT_MODE);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [context, setContext] = useState({ subject: null, topic: null, lessonId: null });
  const [emotionSuggestion, setEmotionSuggestion] = useState(null);

  const activeMessages = useCallback(
    () => (activeId ? conversations.find((c) => c.id === activeId)?.messages || [] : []),
    [activeId, conversations]
  );
  const welcomeMode = activeId == null;

  useEffect(() => {
    let active = true;
    setServiceStatus('checking');
    checkTutorHealth()
      .then((ok) => {
        if (active) setServiceStatus(ok ? 'available' : 'unavailable');
      })
      .catch(() => {
        if (active) setServiceStatus('unavailable');
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    getTutorConversations()
      .then((items) => {
        if (active) setConversations((current) => current.length ? current : items);
      })
      .catch(() => {
        // Chat remains available when conversation history cannot be loaded.
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const stateSubject = location.state?.subject;
    const stateTopic = location.state?.topic;
    const params = new URLSearchParams(location.search);
    const paramSubject = params.get('subject') || undefined;
    const paramTopic = params.get('topic') || undefined;

    if (stateSubject || stateTopic || paramSubject || paramTopic) {
      setContext({
        subject: stateSubject || paramSubject || null,
        topic: stateTopic || paramTopic || null,
        lessonId: location.state?.lessonId || null,
      });
    }
    if (location.state?.emotionSuggestion) {
      setEmotionSuggestion(location.state.emotionSuggestion);
    }
  }, [location]);

  const scrollMessages = useCallback((behavior = 'smooth') => {
    const end = messagesEndRef.current;
    if (end) end.scrollTo({ top: end.scrollHeight, behavior });
  }, []);

  const replaceConversation = useCallback((next) => {
    setConversations((current) => {
      const index = current.findIndex((c) => c.id === next.id);
      if (index >= 0) {
        const updated = [...current];
        updated[index] = next;
        return updated;
      }
      return [next, ...current];
    });
  }, []);

  const appendToConversation = useCallback((conversationId, message) => {
    setConversations((current) => {
      const index = current.findIndex((c) => c.id === conversationId);
      if (index < 0) return current;
      const updated = [...current];
      const target = { ...updated[index] };
      target.messages = [...(target.messages || []), message];
      target.updatedAt = new Date().toISOString();
      updated[index] = target;
      return updated;
    });
  }, []);

  const updateConversationMessage = useCallback((conversationId, messageId, update) => {
    setConversations((current) =>
      current.map((conversation) => {
        if (conversation.id !== conversationId) return conversation;
        return {
          ...conversation,
          updatedAt: new Date().toISOString(),
          messages: (conversation.messages || []).map((message) =>
            message.id === messageId ? update(message) : message
          ),
        };
      })
    );
  }, []);

  const removeConversationMessage = useCallback((conversationId, messageId) => {
    setConversations((current) =>
      current.map((conversation) => conversation.id === conversationId
        ? {
            ...conversation,
            messages: (conversation.messages || []).filter((message) => message.id !== messageId),
          }
        : conversation)
    );
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const handleNewChat = useCallback(() => {
    setActiveId(null);
    setError(null);
    setHistoryOpen(false);
  }, []);

  const handleSelectConversation = useCallback((id) => {
    setActiveId(id);
    setError(null);
    setHistoryOpen(false);
  }, []);

  const handleDeleteConversation = useCallback(async (id) => {
    try {
      await deleteTutorConversation(id);
    } catch (deleteError) {
      setError({
        message: deleteError.message || 'Could not delete this conversation.',
        retry: false,
      });
      return;
    }
    setConversations((current) => current.filter((c) => c.id !== id));
    if (activeId === id) setActiveId(null);
  }, [activeId]);

  const handleSetContext = useCallback((subject, topic, lessonId) => {
    setContext({ subject, topic, lessonId });
  }, []);

  const handleClearContext = useCallback(() => {
    setContext({ subject: null, topic: null, lessonId: null });
  }, []);


  const handleSendMessage = useCallback(
    async (text) => {
      const trimmed = (text || '').trim();
      if (!trimmed || sending) return;

      setError(null);
      const userMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: trimmed,
        timestamp: new Date().toISOString(),
      };
      const targetConversationId = activeId || `conv-${Date.now()}`;
      const assistantMessageId = `msg-${Date.now()}-assistant`;
      const assistantPlaceholder = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        status: 'streaming',
      };

      if (!activeId) {
        const next = {
          id: targetConversationId,
          title: trimmed.slice(0, 60),
          subject: context.subject || null,
          topic: context.topic || null,
          lessonId: context.lessonId || null,
          updatedAt: new Date().toISOString(),
          messages: [userMessage],
        };
        replaceConversation(next);
        setActiveId(next.id);
      } else {
        appendToConversation(targetConversationId, userMessage);
      }
      appendToConversation(targetConversationId, assistantPlaceholder);

      setSending(true);
      try {
        const data = await sendTutorMessage({
          message: trimmed,
          conversationId: targetConversationId,
          subject: context.subject || undefined,
          topic: context.topic || undefined,
          lessonId: context.lessonId || undefined,
          mode,
          onDelta: (text) => {
            updateConversationMessage(targetConversationId, assistantMessageId, (message) => ({
              ...message,
              content: message.content + text,
            }));
            window.requestAnimationFrame(() => scrollMessages('auto'));
          },
        });
        updateConversationMessage(targetConversationId, assistantMessageId, (message) => ({
          ...message,
          content: data.reply,
          timestamp: new Date().toISOString(),
          status: 'done',
        }));
        if (data.conversationId) {
          setConversations((current) =>
            current.map((c) =>
              c.id === targetConversationId ? { ...c, conversationId: data.conversationId } : c
            )
          );
        }
        setInputValue('');
      } catch (err) {
        removeConversationMessage(targetConversationId, assistantMessageId);
        setError({
          message: err.message || 'Could not send your message. Please try again.',
          retry: true,
        });
      } finally {
        setSending(false);
      }
      scrollMessages();
    },
    [activeId, context, mode, sending, replaceConversation, appendToConversation, updateConversationMessage, removeConversationMessage, scrollMessages]
  );

  const handleRetry = useCallback(() => {
    if (!inputValue || sending) return;
    const text = inputValue;
    const assistantMessageId = `msg-${Date.now()}-retry`;
    const targetConversationId = activeId;
    appendToConversation(targetConversationId, {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      status: 'streaming',
    });
    setError(null);
    setSending(true);
    sendTutorMessage({
      message: text,
      conversationId: conversations.find((conversation) => conversation.id === activeId)?.conversationId || activeId,
      subject: context.subject || undefined,
      topic: context.topic || undefined,
      lessonId: context.lessonId || undefined,
      mode,
      onDelta: (chunk) => updateConversationMessage(targetConversationId, assistantMessageId, (message) => ({
        ...message,
        content: message.content + chunk,
      })),
    })
      .then((data) => {
        updateConversationMessage(targetConversationId, assistantMessageId, (message) => ({
          ...message,
          content: data.reply,
          timestamp: new Date().toISOString(),
          status: 'done',
        }));
        if (data.conversationId) {
          setConversations((current) =>
            current.map((c) =>
              c.id === activeId ? { ...c, conversationId: data.conversationId } : c
            )
          );
        }
        setInputValue('');
      })
      .catch((err) => {
        removeConversationMessage(targetConversationId, assistantMessageId);
        setError({
          message: err.message || 'Could not send your message. Please try again.',
          retry: true,
        });
      })
      .finally(() => {
        setSending(false);
        scrollMessages();
      });
  }, [activeId, context, conversations, inputValue, mode, sending, appendToConversation, updateConversationMessage, removeConversationMessage, scrollMessages]);

  const handleRegenerate = useCallback(() => {
    const messages = activeMessages();
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUser || sending) return;
    const existingAssistant = [...messages].reverse().find((message) => message.role === 'assistant');
    if (!existingAssistant) return;
    let streamedReply = '';
    setError(null);
    setSending(true);
    sendTutorMessage({
      message: lastUser.content,
      conversationId: conversations.find((conversation) => conversation.id === activeId)?.conversationId || activeId,
      subject: context.subject || undefined,
      topic: context.topic || undefined,
      lessonId: context.lessonId || undefined,
      mode,
      onDelta: (chunk) => {
        streamedReply += chunk;
        updateConversationMessage(activeId, existingAssistant.id, (message) => ({
          ...message,
          content: streamedReply,
        }));
      },
    })
      .then((data) => {
        updateConversationMessage(activeId, existingAssistant.id, (message) => ({
          ...message,
          content: data.reply,
          timestamp: new Date().toISOString(),
          status: 'done',
        }));
        if (data.conversationId) {
          setConversations((current) => current.map((conversation) => (
            conversation.id === activeId
              ? { ...conversation, conversationId: data.conversationId }
              : conversation
          )));
        }
        setInputValue('');
      })
      .catch((err) => {
        if (streamedReply) {
          updateConversationMessage(activeId, existingAssistant.id, (message) => ({
            ...message,
            content: existingAssistant.content,
          }));
        }
        setError({
          message: err.message || 'Could not regenerate the response. Please try again.',
          retry: true,
        });
      })
      .finally(() => {
        setSending(false);
        scrollMessages();
      });
  }, [activeId, context, conversations, mode, sending, activeMessages, updateConversationMessage, scrollMessages]);

  const handleFollowUp = useCallback(
    (followUp) => {
      const messages = activeMessages();
      const lastAi = [...messages].reverse().find((m) => m.role === 'assistant');
      const text = lastAi ? `${followUp} regarding your previous answer.` : followUp;
      setError(null);
      handleSendMessage(text);
    },
    [handleSendMessage, activeMessages]
  );

  const handleActionFeedback = useCallback((id, helpful) => {
    // Feedback is recorded in local UI state only; the backend exposes no
    // tutor feedback endpoint, so we never claim it was saved to a server.
    setConversations((current) =>
      current.map((c) => {
        if (c.id !== activeId) return c;
        const target = { ...c };
        target.messages = (target.messages || []).map((m) =>
          m.id === id ? { ...m, feedback: helpful } : m
        );
        return target;
      })
    );
  }, [activeId]);

  const handleCopy = useCallback(async (content) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (copyError) {
      setError({
        message: copyError.message || 'Could not copy this response. Check your browser clipboard permissions.',
        retry: false,
      });
    }
  }, []);

  const handleAction = useCallback(
    (action, messageId) => {
      if (action === 'helpful' || action === 'not_helpful') return;
      const messages = activeMessages();
      const message = messages.find((m) => m.id === messageId);
      if (!message) return;
      if (action === 'regenerate') {
        handleRegenerate();
      } else if (action === 'simpler') {
        handleFollowUp('Explain your previous answer more simply');
      } else if (action === 'example') {
        handleFollowUp('Give me an example based on your previous answer');
      }
    },
    [handleRegenerate, handleFollowUp, activeMessages]
  );

  const handleEmotionAction = useCallback(
    (action) => {
      if (action === 'explain more simply') {
        handleFollowUp('Explain your current lesson more simply');
      } else if (action === 'show an example') {
        handleFollowUp('Give me an example for my current lesson');
      }
      setEmotionSuggestion(null);
    },
    [handleFollowUp]
  );

  return (
    <AppShell active="AI Tutor" title="AI Tutor" subtitle="Your personal learning companion.">
      <div className="at-page">
        <AITutorHeader
          status={serviceStatus}
          context={context}
          onSetContext={handleSetContext}
          onClearContext={handleClearContext}
          onSelectMode={(next) => setMode(next)}
          mode={mode}
          onNewChat={handleNewChat}
          onToggleHistory={() => setHistoryOpen((prev) => !prev)}
          historyOpen={historyOpen}
        />
        <div className="at-body">
          <aside className={`at-history-panel ${historyOpen ? 'is-open' : ''}`} aria-hidden={!historyOpen}>
            <ConversationHistory
              conversations={conversations}
              activeId={activeId}
              onSelect={handleSelectConversation}
              onNewChat={handleNewChat}
              onDelete={handleDeleteConversation}
            />
          </aside>
          <main className="at-main">
            {welcomeMode ? (
              <div className="at-empty-state">
                <WelcomeScreen />
                <SuggestedGrid onSelectPrompt={handleSendMessage} disabled={serviceStatus !== 'available'} />
                {error && (
                  <div className="at-error-banner" role="alert">
                    {error.message}
                    <button type="button" className="at-error-dismiss" onClick={clearError} aria-label="Dismiss">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                )}
                <ChatComposer
                  value={inputValue}
                  onChange={setInputValue}
                  onSend={() => handleSendMessage(inputValue)}
                  disabled={serviceStatus !== 'available'}
                  sending={sending}
                />
                {serviceStatus === 'unavailable' && (
                  <p className="at-setup-note">
                    Check that the backend is running and has <code>GEMINI_API_KEY</code> configured to start chatting.
                  </p>
                )}
              </div>
            ) : (
              <div className="at-chat">
                {error && (
                  <div className="at-error-banner">
                    {error.message}
                    {error.retry && (
                      <button type="button" className="at-error-retry" onClick={handleRetry}>
                        Retry
                      </button>
                    )}
                    <button type="button" className="at-error-dismiss" onClick={clearError} aria-label="Dismiss">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                )}
                <div className="at-messages" ref={messagesEndRef}>
                  {activeMessages().map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      onCopy={handleCopy}
                      onFeedback={handleActionFeedback}
                      onRegenerate={() => handleAction('regenerate', message.id)}
                      onExplainSimply={() => handleAction('simpler', message.id)}
                      onGiveExample={() => handleAction('example', message.id)}
                    />
                  ))}
                  {sending && !error && !activeMessages().some((message) => (
                    message.role === 'assistant' && message.status === 'streaming' && message.content
                  )) && (
                    <div className="at-message at-message--ai at-message--sending">
                      <div className="at-message-avatar" aria-hidden="true">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#5b61f6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /><circle cx="12" cy="9" r="2" />
                        </svg>
                      </div>
                      <div className="at-message-bubble at-message-bubble--ai">
                        <span className="at-typing">Lerni is typing<span className="at-typing-dots">…</span></span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="at-composer-wrap">
                  {emotionSuggestion && (
                    <EmotionSuggestionCard
                      suggestion={emotionSuggestion}
                      onDismiss={() => setEmotionSuggestion(null)}
                      onAction={handleEmotionAction}
                    />
                  )}
                  <ChatComposer
                    value={inputValue}
                    onChange={setInputValue}
                    onSend={() => handleSendMessage(inputValue)}
                    disabled={sending}
                    sending={sending}
                  />
                </div>
              </div>
            )}
          </main>
        </div>
        {historyOpen && (
          <button type="button" className="at-history-backdrop" onClick={() => setHistoryOpen(false)} aria-label="Close chat history" />
        )}
      </div>
    </AppShell>
  );
};

export default AITutor;
