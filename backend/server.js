const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const database = require('./database');

const app = express();
app.set('trust proxy', 1);
const PORT = Number(process.env.PORT) || 5000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-flash-lite-latest';
const tutorConversations = new Map();
const tutorModes = new Set(['explain-simply', 'detailed', 'step-by-step', 'exam-revision', 'practice']);

let JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  if (process.env.NODE_ENV === 'production') {
    JWT_SECRET = crypto.randomBytes(32).toString('hex');
    console.warn('⚠️  [SECURITY WARNING] JWT_SECRET is not configured or is under 32 characters in production.');
    console.warn('⚠️  A temporary in-memory JWT secret was generated. Set JWT_SECRET in your Render environment variables to preserve user logins across redeploys.');
  } else {
    JWT_SECRET = 'development_jwt_secret_must_be_at_least_32_characters_long_123456';
  }
}

if (process.env.NODE_ENV === 'production' && !process.env.FRONTEND_URL && !process.env.CORS_ORIGINS) {
  console.warn('⚠️  [CORS WARNING] Neither FRONTEND_URL nor CORS_ORIGINS is set in production.');
  console.warn('⚠️  Permitting browser requests temporarily so initial deployment succeeds. Configure FRONTEND_URL in Render to restrict origins.');
}

const configuredOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const defaultAllowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
];

const allowedOrigins = configuredOrigins.length > 0 ? configuredOrigins : defaultAllowedOrigins;

const normalizeOrigin = (origin) => (origin ? origin.trim().replace(/\/+$/, '') : '');

const isRenderOrigin = (origin) => Boolean(origin && /\.onrender\.com\/?$/i.test(origin));

const isLocalDevelopmentOrigin = (origin) => (
  process.env.NODE_ENV !== 'production'
  && /^https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::\d{1,5})?\/?$/i.test(origin)
);

app.use(cors({
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }
    const normalized = normalizeOrigin(origin);
    const isAllowed = allowedOrigins.some((allowed) => normalizeOrigin(allowed) === normalized);
    if (isAllowed || isLocalDevelopmentOrigin(origin) || isRenderOrigin(origin)) {
      return callback(null, true);
    }
    if (configuredOrigins.length === 0) {
      return callback(null, true);
    }
    return callback(new Error('This origin is not allowed by the backend CORS configuration.'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '32kb' }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: { message: 'Too many sign-in attempts. Please wait and try again.' },
});
const safeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.created_at,
});
const createToken = (user) => jwt.sign(
  { id: user.id, email: user.email, ver: user.auth_version },
  JWT_SECRET,
  { expiresIn: '8h' }
);

const registerHandler = async (req, res) => {
  try {
    const body = req.body || {};
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = body.password;
    if (name.length < 2 || name.length > 80) {
      return res.status(400).json({ message: 'Name must be between 2 and 80 characters.' });
    }
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Enter a valid email address.' });
    }
    if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
      return res.status(400).json({ message: 'Password must be between 8 and 128 characters.' });
    }
    let user = {
      id: randomUUID(),
      name,
      email,
      password_hash: await bcrypt.hash(password, 12),
      created_at: new Date().toISOString(),
      auth_version: 0,
    };
    user = await database.createUserWithProgress(user);
    res.status(201).json({
      message: 'User registered successfully',
      token: createToken(user),
      user: safeUser(user),
    });
  } catch (error) {
    if (error.code === '23505' || error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ message: 'An account with that email already exists.' });
    }
    console.error('Account registration failed:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const loginHandler = async (req, res) => {
  try {
    const body = req.body || {};
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const result = await database.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(
      password.slice(0, 128),
      user?.password_hash || '$2a$12$1j5i9pMnnVBbyDiMQMxYCeDM0G1NyogszvkkVVYGoceCvF5fo8FXK'
    );
    if (!user || !password || !validPassword) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    res.json({
      message: 'Login successful',
      token: createToken(user),
      user: safeUser(user),
    });
  } catch (error) {
    console.error('Account login failed:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const verifyToken = async (req, res, next) => {
  const authorization = req.headers.authorization || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) return res.status(401).json({ message: 'Authentication is required.' });
  try {
    const decoded = jwt.verify(match[1], JWT_SECRET);
    if (!decoded || typeof decoded.id !== 'string') {
      return res.status(401).json({ message: 'Your session is invalid. Please sign in again.' });
    }
    const result = await database.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    const user = result.rows[0];
    if (!user || decoded.ver !== user.auth_version) {
      return res.status(401).json({ message: 'Your session has expired. Please sign in again.' });
    }
    req.userId = user.id;
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Your session has expired. Please sign in again.' });
    }
    next(error);
  }
};

app.post('/api/auth/signup', authLimiter, registerHandler);
app.post('/api/register', authLimiter, registerHandler);
app.post('/api/auth/login', authLimiter, loginHandler);
app.post('/api/login', authLimiter, loginHandler);
app.get('/api/auth/me', verifyToken, (req, res) => res.json({ user: safeUser(req.user) }));
app.get('/api/user', verifyToken, (req, res) => res.json(safeUser(req.user)));
app.post('/api/auth/logout', verifyToken, async (req, res, next) => {
  try {
    await database.query('UPDATE users SET auth_version = auth_version + 1 WHERE id = $1', [req.userId]);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

app.get('/api/tutor/health', verifyToken, (req, res) => {
  res.json({ available: Boolean(GEMINI_API_KEY) });
});

app.get('/api/tutor/conversations', verifyToken, (req, res) => {
  const conversations = tutorConversations.get(String(req.userId)) || new Map();
  res.json({
    conversations: [...conversations.values()]
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)),
  });
});

app.delete('/api/tutor/conversations/:id', verifyToken, (req, res) => {
  const conversations = tutorConversations.get(String(req.userId));
  if (conversations) conversations.delete(req.params.id);
  res.json({ success: true });
});

app.post('/api/tutor/chat', verifyToken, async (req, res) => {
  const { message, conversationId, subject, topic, lessonId, mode = 'explain-simply' } = req.body;

  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ message: 'Please enter a question.' });
  }
  if (message.length > 12000) {
    return res.status(400).json({ message: 'Please keep your message under 12,000 characters.' });
  }
  if (!tutorModes.has(mode)) {
    return res.status(400).json({ message: 'Choose a valid tutor response style.' });
  }
  if (!GEMINI_API_KEY) {
    return res.status(503).json({ message: 'The AI Tutor is not configured. Add GEMINI_API_KEY to the backend environment and restart the server.' });
  }

  const ownerId = String(req.userId);
  const id = typeof conversationId === 'string' && conversationId.length <= 100
    ? conversationId
    : randomUUID();
  const userConversations = tutorConversations.get(ownerId) || new Map();
  const existing = userConversations.get(id);
  const conversation = existing || {
    id,
    title: message.trim().slice(0, 60),
    subject: typeof subject === 'string' ? subject.slice(0, 120) : null,
    topic: typeof topic === 'string' ? topic.slice(0, 160) : null,
    lessonId: typeof lessonId === 'string' ? lessonId.slice(0, 160) : null,
    updatedAt: new Date().toISOString(),
    messages: [],
  };
  const modes = {
    'explain-simply': 'Explain concepts in plain, approachable language. Define unfamiliar terms.',
    detailed: 'Give a thorough explanation with useful context and important details.',
    'step-by-step': 'Break the explanation or solution into clear, numbered steps.',
    'exam-revision': 'Focus on exam-relevant concepts, concise revision, and common misconceptions.',
    practice: 'Teach interactively and include a short practice question when appropriate.',
  };
  const context = [subject && `Subject: ${subject}`, topic && `Topic: ${topic}`, lessonId && `Lesson: ${lessonId}`]
    .filter(Boolean)
    .join('\n');
  const systemInstruction = [
    'You are Lerni, a supportive AI study tutor. Help learners understand their course material accurately and encourage them to reason through ideas.',
    modes[mode],
    context ? `Use this learner-selected study context when relevant:\n${context}` : '',
    'Be clear and focused. If a question is ambiguous, ask a clarifying question. Do not claim to know course content that was not provided.',
  ].filter(Boolean).join('\n\n');
  const previousMessages = conversation.messages.slice(-16).map((item) => (
    `${item.role === 'assistant' ? 'Lerni' : 'Learner'}: ${item.content}`
  ));
  const input = [
    previousMessages.length ? `Conversation so far:\n${previousMessages.join('\n\n')}` : '',
    `Learner's latest message:\n${message.trim()}`,
    'Respond to the learner’s latest message.',
  ].filter(Boolean).join('\n\n');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);
  let idleTimeout;

  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/interactions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY,
        },
        body: JSON.stringify({
          model: GEMINI_MODEL,
          input,
          system_instruction: systemInstruction,
          generation_config: { temperature: 0.65, max_output_tokens: 1024, thinking_level: 'minimal' },
          stream: true,
          store: false,
        }),
        signal: controller.signal,
      }
    );
    if (!response.ok) {
      const data = await response.json();
      const upstreamMessage = data?.error?.message || 'The AI provider rejected the request.';
      const status = response.status === 429 ? 503 : 502;
      return res.status(status).json({
        message: response.status === 429
          ? 'The AI Tutor is receiving too many requests. Please try again shortly.'
          : `The AI Tutor could not complete that request: ${upstreamMessage}`,
      });
    }

    res.status(200);
    res.set({
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    });
    res.flushHeaders();

    let reply = '';
    let eventBuffer = '';
    const decoder = new TextDecoder();
    const reader = response.body.getReader();
    idleTimeout = setTimeout(() => controller.abort(), 20000);
    const processEvent = (event) => {
      const payload = event
        .split(/\r?\n/)
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).trim())
        .join('\n');
      if (!payload || payload === '[DONE]') return;
      const data = JSON.parse(payload);
      if (data.event_type === 'step.delta' && data.delta?.type === 'text' && data.delta.text) {
        reply += data.delta.text;
        res.write(`${JSON.stringify({ type: 'delta', text: data.delta.text })}\n`);
      } else if (data.event_type === 'interaction.failed') {
        throw new Error(data.error?.message || 'The AI provider could not complete the response.');
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      clearTimeout(idleTimeout);
      if (!done) idleTimeout = setTimeout(() => controller.abort(), 20000);
      eventBuffer += decoder.decode(value, { stream: !done });
      const events = eventBuffer.split(/\r?\n\r?\n/);
      eventBuffer = events.pop() || '';
      events.forEach(processEvent);
      if (done) {
        if (eventBuffer.trim()) processEvent(eventBuffer);
        break;
      }
    }

    reply = reply.trim();
    if (!reply) {
      res.write(`${JSON.stringify({ type: 'error', message: 'The AI provider returned an empty response. Please try again.' })}\n`);
      return res.end();
    }

    const timestamp = new Date().toISOString();
    conversation.messages = [
      ...conversation.messages,
      { id: randomUUID(), role: 'user', content: message.trim(), timestamp },
      { id: randomUUID(), role: 'assistant', content: reply, timestamp },
    ].slice(-40);
    conversation.updatedAt = timestamp;
    conversation.subject = typeof subject === 'string' ? subject.slice(0, 120) : conversation.subject;
    conversation.topic = typeof topic === 'string' ? topic.slice(0, 160) : conversation.topic;
    conversation.lessonId = typeof lessonId === 'string' ? lessonId.slice(0, 160) : conversation.lessonId;
    userConversations.set(id, conversation);
    tutorConversations.set(ownerId, userConversations);
    res.write(`${JSON.stringify({ type: 'done', reply, conversationId: id })}\n`);
    return res.end();
  } catch (error) {
    if (error.name === 'AbortError') {
      if (res.headersSent) {
        res.write(`${JSON.stringify({ type: 'error', message: 'The AI Tutor took too long to respond. Please try again.' })}\n`);
        return res.end();
      }
      return res.status(504).json({ message: 'The AI Tutor took too long to respond. Please try again.' });
    }
    console.error('AI Tutor request failed:', error.message);
    if (res.headersSent) {
      res.write(`${JSON.stringify({ type: 'error', message: error.message })}\n`);
      return res.end();
    }
    return res.status(502).json({ message: 'The AI Tutor could not connect to its response service. Please try again.' });
  } finally {
    clearTimeout(timeout);
    clearTimeout(idleTimeout);
  }
});

app.post('/api/progress/quiz', verifyToken, async (req, res, next) => {
  try {
    const body = req.body || {};
    const { subject, topic, score, totalQuestions } = body;
    const timeSpent = body.timeSpent == null ? 0 : Number(body.timeSpent);
    if (typeof subject !== 'string' || !subject.trim() || subject.length > 120
      || typeof topic !== 'string' || !topic.trim() || topic.length > 160) {
      return res.status(400).json({ message: 'A valid subject and topic are required.' });
    }
    if (!Number.isInteger(score) || !Number.isInteger(totalQuestions)
      || totalQuestions < 1 || totalQuestions > 200 || score < 0 || score > totalQuestions
      || !Number.isFinite(timeSpent) || timeSpent < 0 || timeSpent > 86400) {
      return res.status(400).json({ message: 'The quiz result is invalid.' });
    }

    const quizResult = {
      id: randomUUID(),
      subject: subject.trim(),
      topic: topic.trim(),
      score,
      totalQuestions,
      percentage: Math.round((score / totalQuestions) * 100),
      xpEarned: score * 20,
      timeSpent: Math.round(timeSpent),
      completedAt: new Date().toISOString(),
    };
    await database.transaction([
      {
        sql: `INSERT INTO quiz_results
          (id, user_id, subject, topic, score, total_questions, percentage, xp_earned, time_spent, completed_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        params: [quizResult.id, req.userId, quizResult.subject, quizResult.topic, score, totalQuestions,
          quizResult.percentage, quizResult.xpEarned, quizResult.timeSpent, quizResult.completedAt],
      },
      {
        sql: `INSERT INTO user_progress (user_id, total_study_time, xp_earned, updated_at)
          VALUES ($1, 0, $2, $3)
          ON CONFLICT (user_id) DO UPDATE SET
            xp_earned = user_progress.xp_earned + excluded.xp_earned,
            updated_at = excluded.updated_at`,
        params: [req.userId, quizResult.xpEarned, quizResult.completedAt],
      },
    ]);
    res.json({ success: true, quizResult });
  } catch (error) {
    next(error);
  }
});

app.post('/api/progress/lesson', verifyToken, async (req, res, next) => {
  try {
    const body = req.body || {};
    const { subject, topic } = body;
    const timeSpent = body.timeSpent == null ? 0 : Number(body.timeSpent);
    if (typeof subject !== 'string' || !subject.trim() || subject.length > 120
      || typeof topic !== 'string' || !topic.trim() || topic.length > 160
      || !Number.isFinite(timeSpent) || timeSpent < 0 || timeSpent > 86400) {
      return res.status(400).json({ message: 'The lesson completion is invalid.' });
    }
    const lessonId = randomUUID();
    const completedAt = new Date().toISOString();
    const studyMinutes = Math.max(1, Math.round(timeSpent / 60));
    const results = await database.transaction([
      {
        sql: `INSERT INTO lesson_completions (id, user_id, subject, topic, study_minutes, completed_at)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (user_id, subject, topic) DO NOTHING`,
        params: [lessonId, req.userId, subject.trim(), topic.trim(), studyMinutes, completedAt],
      },
      {
        sql: `UPDATE user_progress SET
            total_study_time = total_study_time + $1,
            updated_at = $2
          WHERE user_id = $3
            AND EXISTS (SELECT 1 FROM lesson_completions WHERE id = $4)`,
        params: [studyMinutes, completedAt, req.userId, lessonId],
      },
    ]);
    const result = results[0];
    res.json({ success: true, alreadyCompleted: result.rowCount === 0 });
  } catch (error) {
    next(error);
  }
});

app.post('/api/progress/emotion', verifyToken, async (req, res, next) => {
  try {
    const body = req.body || {};
    const { emotion, confidence } = body;
    if (typeof emotion !== 'string' || !emotion.trim() || emotion.length > 40
      || !Number.isFinite(Number(confidence)) || Number(confidence) < 0 || Number(confidence) > 100) {
      return res.status(400).json({ message: 'The emotion estimate is invalid.' });
    }
    const recordedAt = typeof body.timestamp === 'string' && !Number.isNaN(Date.parse(body.timestamp))
      ? new Date(body.timestamp).toISOString()
      : new Date().toISOString();
    await database.query(
      'INSERT INTO emotion_history (id, user_id, emotion, confidence, recorded_at) VALUES ($1, $2, $3, $4, $5)',
      [randomUUID(), req.userId, emotion.trim(), Number(confidence), recordedAt]
    );
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

app.get('/api/progress', verifyToken, async (req, res, next) => {
  try {
    const [quizTotals, recentQuizzes, lessons, emotions, userProgress] = await Promise.all([
      database.query(
        'SELECT COUNT(*) AS count, COALESCE(AVG(percentage), 0) AS average_score, SUM(CASE WHEN percentage = 100 THEN 1 ELSE 0 END) AS perfect_count FROM quiz_results WHERE user_id = $1',
        [req.userId]
      ),
      database.query(
        'SELECT id, subject, topic, score, total_questions AS "totalQuestions", percentage, xp_earned AS "xpEarned", time_spent AS "timeSpent", completed_at AS "completedAt" FROM quiz_results WHERE user_id = $1 ORDER BY completed_at DESC LIMIT 10',
        [req.userId]
      ),
      database.query(
        'SELECT subject, topic, study_minutes AS "studyMinutes" FROM lesson_completions WHERE user_id = $1 ORDER BY completed_at',
        [req.userId]
      ),
      database.query(
        'SELECT emotion, COUNT(*) AS count FROM emotion_history WHERE user_id = $1 GROUP BY emotion',
        [req.userId]
      ),
      database.query('SELECT total_study_time, xp_earned FROM user_progress WHERE user_id = $1', [req.userId]),
    ]);
    const totalQuizzes = Number(quizTotals.rows[0].count);
    const quizHistory = recentQuizzes.rows.reverse();
    const totalEmotions = emotions.rows.reduce((sum, item) => sum + Number(item.count), 0);
    const emotionCounts = Object.fromEntries(emotions.rows.map((item) => [item.emotion, Number(item.count)]));
    const lessonCount = lessons.rows.length;
    const achievements = [];
    if (totalQuizzes) achievements.push('first-quiz');
    if (Number(quizTotals.rows[0].perfect_count) > 0) achievements.push('perfect-score');
    if (totalQuizzes >= 5) achievements.push('quiz-master');
    if (lessonCount) achievements.push('first-lesson');
    if (lessonCount >= 5) achievements.push('dedicated-learner');
    const emotionBreakdown = emotions.rows.map(({ emotion, count }) => ({
      emotion,
      percentage: totalEmotions ? Math.round((Number(count) / totalEmotions) * 100) : 0,
      color: emotion === 'Focused' ? '#10b981' : emotion === 'Happy' ? '#fbbf24' : emotion === 'Neutral' ? '#6b7280' : emotion === 'Confused' ? '#ef4444' : '#a855f7',
    }));
    res.json({
      totalStudyTime: Number(userProgress.rows[0]?.total_study_time || 0),
      focusScore: totalEmotions ? Math.round(((emotionCounts.Focused || 0) + (emotionCounts.Happy || 0)) / totalEmotions * 100) : 0,
      xpEarned: Number(userProgress.rows[0]?.xp_earned || 0),
      topicsCompleted: lessonCount,
      completedLessons: lessons.rows.map((lesson) => `${lesson.subject}-${lesson.topic}`),
      quizScore: Math.round(Number(quizTotals.rows[0].average_score)),
      totalQuizzes,
      emotionBreakdown,
      recentQuiz: quizHistory[quizHistory.length - 1] || null,
      achievements,
      quizHistory,
    });
  } catch (error) {
    next(error);
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    database: database.usePostgres ? 'postgresql' : 'sqlite',
    aiTutorConfigured: Boolean(GEMINI_API_KEY),
  });
});

// Serve frontend production build if available (supports single full-stack Web Service on Render)
const frontendBuildPath = path.resolve(__dirname, '..', 'build');
if (fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.resolve(frontendBuildPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      status: 'OK',
      message: 'Lerni Backend API is running',
      health: '/api/health',
    });
  });
}

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  console.error('Request failed:', error.message);
  if (error.message === 'This origin is not allowed by the backend CORS configuration.') {
    return res.status(403).json({ message: 'This website is not allowed to access the backend.' });
  }
  return res.status(500).json({ message: 'An unexpected server error occurred.' });
});

const startServer = async () => {
  await database.initialize();
  app.listen(PORT, () => console.log(`Lerni backend listening on port ${PORT}`));
};

if (require.main === module) {
  startServer().catch((error) => {
    console.error('Backend startup failed:', error.message);
    process.exitCode = 1;
  });
}

module.exports = { app, startServer };
