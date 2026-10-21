# Emotion-Aware Study Assistant

Lerni is a React and Express learning app. Camera-based expression estimates are optional and are not required to browse or complete Study lessons.

## Current Study Experience

The Study catalogue contains eight subjects. Lessons are currently available only where matching content exists in `src/data/lessonContent.js`; subjects without lessons remain unavailable instead of opening placeholder content.

- Catalogue: `/study`
- Subject overview: `/study/:subjectSlug`
- Dedicated lesson: `/study/:subjectSlug/lessons/:lessonSlug`

Lesson URLs use stable slugs and load content independently of navigation state, so direct links and browser refreshes retain the selected lesson. The reader includes lesson objectives, sections, previous/next navigation, and an explicit completion action.

The original `/lesson`, `/quiz`, `/simplified`, and `/break` routes remain as legacy experiences. Study catalogue lesson links do not route through those pages.

Account profiles, lesson completions, quiz results, and dashboard progress are stored per user. Local development uses SQLite; production requires PostgreSQL and a `DATABASE_URL`.

## Legacy Lesson Experience

### 1. Login Page (`/`)
- Users can sign in or create an account at `/signup`
- Protected pages validate the current session with the backend before loading

### 2. Start Study Page (`/start-study`)
- Dashboard with learning progress and navigation

### 3. Subject Selection (`/subject-selection`)
- Legacy subject-selection route

### 4. Topic Selection (`/topic-selection`)
- Legacy topic-selection route

### 5. Lesson Page (`/lesson`) - Main Learning Interface
The legacy learning experience includes:
- **Lesson content** divided into sections (Introduction, Operations, Examples)
- **Progress tracking** (Section X of Y, percentage complete)
- **Reading material** with clear explanations
- **Emotion detection panel** (right side) showing:
  - Current emotion (Focused, Happy, Confused, Bored, Sleepy)
  - Confidence percentage
  - Emotion breakdown bars
  - XP tracking
- **Navigation buttons** (Previous/Next)
- **Three adaptive action buttons:**
  - Show Quiz (when bored or want to test knowledge)
  - Simplify Topic (when confused)
  - Take Break (when sleepy or tired)
- **When all sections complete:** Click "Complete Lesson" → Goes to Quiz

### 6. Quiz Page (`/quiz`)
- Interactive quiz with 5 questions about the topic
- Multiple choice answers
- Progress bar
- Score calculation with percentage
- XP rewards based on performance
- Result screen with:
  - Score and correct answers
  - Performance feedback
  - Options: Retry Quiz or View Analytics

### 7. Simplified Content (`/simplified`)
Accessed when user is confused or clicks "Simplify Topic":
- Easy-to-understand explanations
- Real-life analogies (e.g., stack of plates)
- Visual examples and diagrams
- Step-by-step breakdown
- Key points summary
- Options: Take Quiz or Continue Learning

### 8. Break Screen (`/break`)
Accessed when user is sleepy or clicks "Take Break":
- 2-minute countdown timer with circular progress
- Break tips (drink water, stretch, rest eyes, walk around)
- Options: Extend break (+1 minute) or Skip break
- Auto-completes when timer ends
- Returns to Lesson page

### 9. Analytics Dashboard (`/analytics`)
Opens after completing quiz:
- **Session statistics:** Study time, focus score, XP earned, topics completed
- **Emotion breakdown chart:** Shows time spent in each emotion
- **Quiz performance:** Circular score display with feedback
- **Achievements/badges:** Earned and locked badges
- **Personalized recommendations:** Based on performance
- **Options:** 
  - Start New Session (goes to Subject Selection)
  - Continue to Next Topic (goes to Topic Selection)

## Adaptive Learning Logic

The system adapts based on detected emotions:

- **Focused** 😊 → Continue normal lesson, everything flows smoothly
- **Confused** 😕 → "Simplify Topic" button highlighted → Shows easier explanation
- **Bored** 😑 → "Show Quiz" button highlighted → Interactive quiz to engage
- **Sleepy** 😴 → "Take Break" button highlighted → Suggests rest period
- **Happy** 😄 → Continue with positive reinforcement

## Complete User Journey

```
Login 
  ↓
Start Study (Welcome)
  ↓
Subject Selection (Choose subject)
  ↓
Topic Selection (Choose topic)
  ↓
Lesson Page (Read & Learn with emotion detection)
  ├→ Confused? → Simplified Content → Back to Lesson
  ├→ Bored? → Quiz → Analytics
  ├→ Sleepy? → Break Screen → Back to Lesson
  └→ Complete Lesson → Quiz → Analytics
       ↓
Analytics (View performance)
  ├→ Start New Session → Subject Selection
  └→ Next Topic → Topic Selection
```

## Setup

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install backend dependencies:
```bash
npm install
```

3. Copy `backend/.env.example` to `backend/.env`, set a private `JWT_SECRET` (at least 32 random characters), and optionally add `GEMINI_API_KEY` for AI Tutor.

4. Start the backend server:
```bash
npm start
```

The backend will run on `http://localhost:5000`

Local SQLite data is stored in the ignored `backend/data/` folder. Production requires PostgreSQL through `DATABASE_URL`; configure `FRONTEND_URL` (or `CORS_ORIGINS`) and the database in the backend host. See [backend setup](./backend/README.md) for local secrets and Render environment configuration. Keep `backend/.env` private and never put the AI provider key in frontend code. AI Tutor conversation history is currently held in backend memory and cleared when the backend restarts.

### Local Demo Login Credentials

The demo account is seeded only for non-production SQLite development:
```
Email: emma@example.com
Password: password123
```

## Tech Stack

- **Frontend:** React 18, React Router 6
- **Styling:** CSS (custom)
- **Backend:** Node.js, Express, bcryptjs, JWT, SQLite/PostgreSQL
- **AI/ML:** Optional emotion detection and server-side Gemini AI Tutor integration
- **Database:** SQLite locally; PostgreSQL in production

## Features

✅ User authentication and protected Study routes
✅ Eight-subject Study catalogue with actual available lesson counts
✅ Dedicated, refresh-safe routes for available Study lessons
✅ Database-backed per-user lesson, quiz, and analytics data
✅ Optional camera activation in the legacy lesson experience

## Remaining Platform Work

1. Author and validate lessons for subjects that currently have no available content.
2. Integrate lesson-specific quizzes into the new Study reader.

## Goal

Provide stress-free learning by:
- Detecting when students struggle
- Automatically simplifying content
- Making learning fun with quizzes
- Preventing burnout with breaks
- Tracking progress and motivation
