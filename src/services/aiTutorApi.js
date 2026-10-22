/*
 * AI Tutor service layer.
 *
 * The backend proxies chat requests to Gemini and keeps each user's recent
 * conversations in server memory. The provider key is never sent to the
 * browser.
 *
 * Backend contract (proxied through CRA at /api):
 *
 *   GET    /api/tutor/health
 *     Response: { available: true }
 *
 *   POST   /api/tutor/chat
 *     Body:   { message, conversationId?, subject?, topic?, lessonId?, mode? }
 *     Response: { reply: string, conversationId: string }
 *
 *   GET    /api/tutor/conversations
 *     Response: { conversations: Array<{ id, title, messages, updatedAt }> }
 *
 *   DELETE /api/tutor/conversations/:id
 *     Response: { success: true }
 *
 * Authentication reuses the existing token from localStorage (see
 * services/api.js). No Gemini API key is ever embedded in the frontend.
 */

const getApiBase = () => {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    const envUrl = (process.env.REACT_APP_API_URL || '').trim();
    if (!envUrl || (window.location.hostname.endsWith('onrender.com') && envUrl.includes('onrender.com'))) {
      return '/api';
    }
  }
  let envUrl = (process.env.REACT_APP_API_URL || '').trim().replace(/\/+$/, '');
  if (!envUrl) return '/api';
  if (!/^https?:\/\//i.test(envUrl) && !envUrl.startsWith('/')) {
    envUrl = `https://${envUrl}`;
  }
  return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
};

const API_URL = `${getApiBase()}/tutor`;

const getToken = () => localStorage.getItem('token');

const authHeaders = () => {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

class AiTutorApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'AiTutorApiError';
    this.status = status;
  }
}

const handleResponse = async (response) => {
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const data = await response.json();
      message = data.message || message;
    } catch (_) {
      // Ignore non-JSON error bodies
    }
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('lerni:session-expired'));
    }
    throw new AiTutorApiError(message, response.status);
  }
  if (response.status === 204) return null;
  return response.json();
};

const requestWithTimeout = async (input, options, timeoutMs = 30000) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(input, { ...options, signal: controller.signal });
    return await handleResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new AiTutorApiError('The request timed out. Please try again.', 408);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

export const checkTutorHealth = async () => {
  const data = await requestWithTimeout(`${API_URL}/health`, {
    method: 'GET',
    headers: authHeaders(),
  });
  return Boolean(data && data.available);
};

export const sendTutorMessage = async (payload) => {
  const { message, conversationId, subject, topic, lessonId, mode } = payload;
  const onDelta = payload.onDelta;
  if (!message || !message.trim()) {
    throw new AiTutorApiError('Please type a message before sending.', 400);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90000);
  try {
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        message: message.trim(),
        ...(conversationId ? { conversationId } : {}),
        ...(subject ? { subject } : {}),
        ...(topic ? { topic } : {}),
        ...(lessonId ? { lessonId } : {}),
        ...(mode ? { mode } : {}),
      }),
      signal: controller.signal,
    });
    if (!response.ok) {
      await handleResponse(response);
    }
    if (!response.body) {
      throw new AiTutorApiError('Your browser could not receive the tutor response stream.', 502);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let result = null;
    const processLine = (line) => {
      if (!line.trim()) return;
      let event;
      try {
        event = JSON.parse(line);
      } catch (_) {
        throw new AiTutorApiError('The tutor returned an invalid response stream.', 502);
      }
      if (event.type === 'delta' && typeof event.text === 'string') {
        if (onDelta) onDelta(event.text);
      } else if (event.type === 'done') {
        result = { reply: event.reply, conversationId: event.conversationId };
      } else if (event.type === 'error') {
        throw new AiTutorApiError(event.message || 'The tutor could not complete the response.', 502);
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      lines.forEach(processLine);
      if (done) {
        if (buffer.trim()) processLine(buffer);
        break;
      }
    }
    if (!result) {
      throw new AiTutorApiError('The tutor response ended before it was complete.', 502);
    }
    return result;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new AiTutorApiError('The request timed out. Please try again.', 408);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

export const getTutorConversations = async () => {
  const data = await requestWithTimeout(`${API_URL}/conversations`, {
    method: 'GET',
    headers: authHeaders(),
  });
  return data && Array.isArray(data.conversations) ? data.conversations : [];
};

export const deleteTutorConversation = async (id) => {
  await requestWithTimeout(`${API_URL}/conversations/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return id;
};

const aiTutorApi = {
  checkTutorHealth,
  sendTutorMessage,
  getTutorConversations,
  deleteTutorConversation,
};
export default aiTutorApi;
