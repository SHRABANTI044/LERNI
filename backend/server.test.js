const { after, before, test } = require('node:test');
const assert = require('node:assert/strict');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-used-only-by-backend-tests-123456';
process.env.LERNI_SQLITE_PATH = ':memory:';

const database = require('./database');
const { app } = require('./server');

let server;
let baseUrl;

before(async () => {
  await database.initialize();
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  await database.close();
});

const post = (route, body, token) => fetch(`${baseUrl}${route}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  },
  body: JSON.stringify(body),
});

test('signup, authentication, and progress stay scoped to the current user', async () => {
  const registration = await post('/api/auth/signup', {
    name: '  Taylor Learner  ',
    email: 'TAYLOR@example.com',
    password: 'correct-horse-2026',
  });
  assert.equal(registration.status, 201);
  const created = await registration.json();
  assert.equal(created.user.name, 'Taylor Learner');
  assert.equal(created.user.email, 'taylor@example.com');
  assert.equal(Object.hasOwn(created.user, 'password_hash'), false);
  assert.equal(typeof created.token, 'string');

  const duplicate = await post('/api/register', {
    name: 'Taylor',
    email: 'taylor@example.com',
    password: 'correct-horse-2026',
  });
  assert.equal(duplicate.status, 409);

  const login = await post('/api/auth/login', {
    email: 'TAYLOR@example.com',
    password: 'correct-horse-2026',
  });
  assert.equal(login.status, 200);
  const signedIn = await login.json();
  const profile = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { Authorization: `Bearer ${signedIn.token}` },
  });
  assert.equal(profile.status, 200);

  const quiz = await post('/api/progress/quiz', {
    subject: 'Science',
    topic: 'Gravity',
    score: 2,
    totalQuestions: 3,
    xpEarned: 99999,
    userId: 'someone-else',
  }, signedIn.token);
  assert.equal(quiz.status, 200);
  assert.equal((await quiz.json()).quizResult.xpEarned, 40);

  const lesson = await post('/api/progress/lesson', {
    subject: 'Science',
    topic: 'Gravity',
    timeSpent: 120,
  }, signedIn.token);
  assert.equal(lesson.status, 200);
  assert.equal((await lesson.json()).alreadyCompleted, false);

  const repeatedLesson = await post('/api/progress/lesson', {
    subject: 'Science',
    topic: 'Gravity',
    timeSpent: 900,
  }, signedIn.token);
  assert.equal((await repeatedLesson.json()).alreadyCompleted, true);

  const dashboard = await fetch(`${baseUrl}/api/progress`, {
    headers: { Authorization: `Bearer ${signedIn.token}` },
  });
  const savedProgress = await dashboard.json();
  assert.equal(savedProgress.xpEarned, 40);
  assert.equal(savedProgress.totalStudyTime, 2);
  assert.equal(savedProgress.topicsCompleted, 1);
  assert.equal(savedProgress.totalQuizzes, 1);

  const secondRegistration = await post('/api/auth/signup', {
    name: 'Another Learner',
    email: 'another@example.com',
    password: 'different-password',
  });
  const secondUser = await secondRegistration.json();
  const secondDashboard = await fetch(`${baseUrl}/api/progress`, {
    headers: { Authorization: `Bearer ${secondUser.token}` },
  });
  const emptyProgress = await secondDashboard.json();
  assert.equal(emptyProgress.xpEarned, 0);
  assert.equal(emptyProgress.totalStudyTime, 0);
  assert.equal(emptyProgress.totalQuizzes, 0);

  const logout = await post('/api/auth/logout', {}, signedIn.token);
  assert.equal(logout.status, 200);
  const revoked = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { Authorization: `Bearer ${signedIn.token}` },
  });
  assert.equal(revoked.status, 401);
});

test('CORS allows local development origins and rejects unconfigured external origins', async () => {
  const localResponse = await fetch(`${baseUrl}/api/auth/signup`, {
    method: 'POST',
    headers: {
      Origin: 'http://localhost:5000/',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: 'X', email: 'invalid', password: '12345678' }),
  });
  assert.equal(localResponse.status, 400);
  assert.equal(localResponse.headers.get('access-control-allow-origin'), 'http://localhost:5000/');

  const externalResponse = await fetch(`${baseUrl}/api/auth/signup`, {
    method: 'POST',
    headers: {
      Origin: 'https://untrusted.example',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: 'X', email: 'invalid', password: '12345678' }),
  });
  assert.equal(externalResponse.status, 403);
  assert.deepEqual(await externalResponse.json(), {
    message: 'This website is not allowed to access the backend.',
  });
});

test('PostgreSQL progress foreign keys use the existing users.id type', () => {
  assert.equal(database.postgresUserIdColumnType('uuid'), 'UUID');
  assert.equal(database.postgresUserIdColumnType('text'), 'TEXT');
  assert.equal(database.postgresUserIdColumnType('bigint'), 'BIGINT');
  assert.throws(
    () => database.postgresUserIdColumnType('integer'),
    /Unsupported PostgreSQL users\.id type "integer".*UUID, TEXT, or BIGINT/
  );
});
