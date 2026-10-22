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

const API_URL = getApiBase();

export const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

const handleExpiredSession = () => {
  clearSession();
  window.dispatchEvent(new Event('lerni:session-expired'));
};

const request = async (path, options = {}) => {
  const { token: explicitToken, headers: requestHeaders, ...fetchOptions } = options;
  const token = explicitToken || localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...requestHeaders };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${path}`, { ...fetchOptions, headers });
  let data = {};
  try {
    data = await response.json();
  } catch (error) {
    if (response.ok) throw new Error('The server returned an invalid response.');
  }

  if (!response.ok) {
    if (response.status === 401) handleExpiredSession();
    const details = data.error || data.details || '';
    const message = details ? `${data.message || 'Error'}: ${details}` : (data.message || `Request failed (${response.status}).`);
    throw new Error(message);
  }
  return data;
};

export const login = async (email, password) => {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
};

export const register = async (name, email, password) => {
  const data = await request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
};

export const getUserProfile = async () => {
  const data = await request('/auth/me');
  localStorage.setItem('user', JSON.stringify(data.user));
  return data.user;
};

export const saveQuizResult = (subject, topic, score, totalQuestions, xpEarned, timeSpent) => (
  request('/progress/quiz', {
    method: 'POST',
    body: JSON.stringify({ subject, topic, score, totalQuestions, xpEarned, timeSpent }),
  })
);

export const saveLessonProgress = (subject, topic, timeSpent) => (
  request('/progress/lesson', {
    method: 'POST',
    body: JSON.stringify({ subject, topic, timeSpent }),
  })
);

export const saveEmotionData = async () => null;

export const getUserProgress = () => request('/progress');

export const logout = async () => {
  const token = localStorage.getItem('token');
  try {
    if (token) await request('/auth/logout', { method: 'POST', token });
  } finally {
    clearSession();
  }
};

export const isAuthenticated = () => Boolean(localStorage.getItem('token'));

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (error) {
    localStorage.removeItem('user');
    return null;
  }
};
