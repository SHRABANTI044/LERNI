const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';
const databaseUrl = process.env.DATABASE_URL;

if (isProduction && !databaseUrl) {
  console.warn('⚠️  [DATABASE WARNING] DATABASE_URL is not set in production.');
  console.warn('⚠️  Falling back to local SQLite database. On Render free tier, attach a PostgreSQL database to persist data permanently across restarts.');
}

const usePostgres = Boolean(databaseUrl);
const sqlitePath = process.env.LERNI_SQLITE_PATH || path.join(__dirname, 'data', 'lerni.sqlite');
let sqlite;
let pool;
let postgresUserIdType = 'text';

if (usePostgres) {
  const sslRequired = process.env.DATABASE_SSL !== 'false';
  pool = new Pool({
    connectionString: databaseUrl,
    ssl: sslRequired ? { rejectUnauthorized: false } : false,
  });
} else {
  fs.mkdirSync(path.dirname(sqlitePath), { recursive: true });
  sqlite = new Database(sqlitePath);
  sqlite.pragma('foreign_keys = ON');
  sqlite.pragma('journal_mode = WAL');
}

const sqliteQuery = (sql, params = []) => {
  const statement = sqlite.prepare(sql.replace(/\$\d+/g, '?'));
  if (/^\s*(SELECT|PRAGMA|WITH)\b/i.test(sql) || /\bRETURNING\b/i.test(sql)) {
    return { rows: statement.all(...params) };
  }
  const result = statement.run(...params);
  return { rows: [], rowCount: result.changes };
};

const query = (sql, params = []) => (
  usePostgres ? pool.query(sql, params) : Promise.resolve(sqliteQuery(sql, params))
);

const postgresUserIdColumnType = (databaseType) => {
  if (databaseType === 'uuid') return 'UUID';
  if (databaseType === 'text') return 'TEXT';
  if (databaseType === 'bigint') return 'BIGINT';
  throw new Error(`Unsupported PostgreSQL users.id type "${databaseType}". Expected UUID, TEXT, or BIGINT.`);
};

const transaction = async (operations) => {
  if (usePostgres) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const results = [];
      for (const operation of operations) {
        results.push(await client.query(operation.sql, operation.params || []));
      }
      await client.query('COMMIT');
      return results;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  const execute = sqlite.transaction(() => operations.map((operation) => (
    sqliteQuery(operation.sql, operation.params || [])
  )));
  return execute();
};

const initialize = async () => {
  await query(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL,
    auth_version INTEGER NOT NULL DEFAULT 0
  )`);

  let userIdColumnType = 'TEXT';
  if (usePostgres) {
    const result = await query(
      `SELECT format_type(atttypid, atttypmod) AS id_type
       FROM pg_attribute
       WHERE attrelid = to_regclass('users') AND attname = 'id' AND NOT attisdropped`
    );
    const databaseType = result.rows[0]?.id_type;
    if (!databaseType) {
      throw new Error('Could not determine the PostgreSQL users.id column type.');
    }
    postgresUserIdType = databaseType;
    userIdColumnType = postgresUserIdColumnType(databaseType);
  }

  const statements = [
    `CREATE TABLE IF NOT EXISTS user_progress (
      user_id ${userIdColumnType} PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      total_study_time INTEGER NOT NULL DEFAULT 0,
      xp_earned INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS quiz_results (
      id TEXT PRIMARY KEY,
      user_id ${userIdColumnType} NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      subject TEXT NOT NULL,
      topic TEXT NOT NULL,
      score INTEGER NOT NULL,
      total_questions INTEGER NOT NULL,
      percentage INTEGER NOT NULL,
      xp_earned INTEGER NOT NULL,
      time_spent INTEGER NOT NULL DEFAULT 0,
      completed_at TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS lesson_completions (
      id TEXT PRIMARY KEY,
      user_id ${userIdColumnType} NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      subject TEXT NOT NULL,
      topic TEXT NOT NULL,
      study_minutes INTEGER NOT NULL DEFAULT 0,
      completed_at TEXT NOT NULL,
      UNIQUE (user_id, subject, topic)
    )`,
    `CREATE TABLE IF NOT EXISTS emotion_history (
      id TEXT PRIMARY KEY,
      user_id ${userIdColumnType} NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      emotion TEXT NOT NULL,
      confidence REAL NOT NULL,
      recorded_at TEXT NOT NULL
    )`,
    'CREATE INDEX IF NOT EXISTS quiz_results_user_date ON quiz_results(user_id, completed_at)',
    'CREATE INDEX IF NOT EXISTS emotion_history_user_date ON emotion_history(user_id, recorded_at)',
    `INSERT INTO user_progress (user_id, total_study_time, xp_earned, updated_at)
     SELECT id, 0, 0, ${usePostgres ? 'CURRENT_TIMESTAMP::text' : 'CURRENT_TIMESTAMP'} FROM users WHERE TRUE
     ON CONFLICT (user_id) DO NOTHING`,
  ];

  for (const statement of statements) await query(statement);
};

const createUserWithProgress = async (user) => {
  const userColumns = 'name, email, password_hash, created_at, auth_version';
  const userValues = [user.name, user.email, user.password_hash, user.created_at, user.auth_version];
  const progressSql = 'INSERT INTO user_progress (user_id, total_study_time, xp_earned, updated_at) VALUES ($1, 0, 0, $2)';

  if (usePostgres && postgresUserIdType === 'bigint') {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query(
        `INSERT INTO users (${userColumns}) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        userValues
      );
      const createdUser = { ...user, id: result.rows[0].id };
      await client.query(progressSql, [createdUser.id, createdUser.created_at]);
      await client.query('COMMIT');
      return createdUser;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  await transaction([
    {
      sql: 'INSERT INTO users (id, name, email, password_hash, created_at, auth_version) VALUES ($1, $2, $3, $4, $5, $6)',
      params: [user.id, ...userValues],
    },
    {
      sql: progressSql,
      params: [user.id, user.created_at],
    },
  ]);
  return user;
};

const close = async () => {
  if (pool) await pool.end();
  if (sqlite) sqlite.close();
};

module.exports = {
  close,
  createUserWithProgress,
  initialize,
  postgresUserIdColumnType,
  query,
  transaction,
  usePostgres,
};
