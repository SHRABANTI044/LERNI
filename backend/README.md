# Lerni backend

Express API for Lerni accounts, saved learning progress, and the AI Tutor.

## Local setup

From the project root:

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

Set `JWT_SECRET` in `backend/.env` to a private random value of at least 32 characters. This PowerShell command replaces the example value (or adds the setting if missing) without printing the secret:

```powershell
node -e "const fs=require('fs');const p='.env';const s=fs.readFileSync(p,'utf8');const line='JWT_SECRET='+require('crypto').randomBytes(48).toString('hex');fs.writeFileSync(p,/^JWT_SECRET=.*$/m.test(s)?s.replace(/^JWT_SECRET=.*$/m,line):s.trimEnd()+'\n'+line+'\n')"
```

Add `GEMINI_API_KEY` to use AI Tutor; keep provider keys on the backend only.

Start the API:

```powershell
npm start
```

Local development uses SQLite at `backend/data/lerni.sqlite`. The database and its write-ahead log are ignored by Git. SQLite tables are created and upgraded when the API starts. The local demo account is seeded only for non-production SQLite development:

```text
Email: emma@example.com
Password: password123
```

Do not deploy the demo account or use its password in production.

## Production configuration

Configure these environment variables in the backend host:

- `NODE_ENV=production`
- `DATABASE_URL` — PostgreSQL connection URL. Startup fails if it is missing; production never silently falls back to SQLite.
- `JWT_SECRET` — private random value with at least 32 characters.
- `FRONTEND_URL` — deployed frontend origin, such as `https://lerni.example.com`. For multiple browser origins, set `CORS_ORIGINS` to a comma-separated list instead.
- `GEMINI_API_KEY` — optional; required only for AI Tutor replies.
- `PORT` — usually supplied by the hosting platform.
- `DATABASE_SSL=false` only when the PostgreSQL provider explicitly requires SSL to be disabled. SSL is enabled by default in production.

The backend supports PostgreSQL databases where `users.id` is `UUID`, `TEXT`, or `BIGINT`; newly created account-related tables use the existing ID type for their foreign keys. For `BIGINT` IDs, PostgreSQL generates each new user ID using the column's configured identity or sequence.

For a Render deployment, create a PostgreSQL database, set its internal connection URL as `DATABASE_URL`, then add the other variables to the backend web service. If frontend and API are deployed separately, set the frontend build variable `REACT_APP_API_URL` to the backend origin only (no `/api` suffix), and set the backend `FRONTEND_URL` to the frontend origin. The frontend variable must be available when building the React app.

## API

All authenticated endpoints use `Authorization: Bearer <token>`. Access tokens expire after eight hours. `/api/auth/logout` revokes the account's current token version; a later sign-in creates a fresh token.

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/signup` | Create an account |
| `POST` | `/api/auth/login` | Sign in |
| `GET` | `/api/auth/me` | Validate the token and return the current profile |
| `POST` | `/api/auth/logout` | Revoke the current account token version |
| `GET` | `/api/progress` | Get the signed-in user's saved dashboard and analytics data |
| `POST` | `/api/progress/quiz` | Save a quiz result |
| `POST` | `/api/progress/lesson` | Save a lesson completion |
| `GET` | `/api/tutor/health` | Check AI Tutor configuration |
| `POST` | `/api/tutor/chat` | Stream an AI Tutor response |
| `GET` | `/api/tutor/conversations` | List the signed-in user's recent tutor chats |
| `DELETE` | `/api/tutor/conversations/:id` | Delete a tutor chat |
| `GET` | `/api/health` | Check API status and database type |

`/api/register`, `/api/login`, and `/api/user` remain as compatibility routes. Signup validates and normalizes email, hashes passwords with bcrypt, and rejects duplicate accounts. Progress rows are always scoped to the authenticated token, never a browser-supplied user ID. Quiz XP is calculated by the server.

User profiles, progress totals, lesson completions, quiz results, and explicitly submitted emotion estimates are stored in the configured database. Tutor conversations remain in backend memory and are cleared when the backend restarts.
