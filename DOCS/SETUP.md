# Simploy Frontend — Setup Guide

## Prerequisites

Make sure you have the following installed before starting:

- **Node.js** v18 or higher — [nodejs.org](https://nodejs.org)
- **npm** v9 or higher (comes with Node.js)
- **Git**

Check your versions:
```bash
node --version
npm --version
```

---

## Getting Started

### 1. Clone the repo

```bash
git clone <repo-url>
cd Simploy
```

### 2. Switch to the correct branch

```bash
git checkout Sam
```

> Ask the team which branch has the latest frontend work if unsure.

### 3. Navigate to the frontend folder

```bash
cd frontend
```

### 4. Start the backend

From the repo root:

```bash
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

Local development uses SQLite by default at `backend/simploy.db`. Set `SIMPLOY_DATABASE_PATH` to use another local database file.

### 5. Install frontend dependencies

```bash
npm install
```

> This installs everything listed in `package.json`, including Next.js, Tailwind CSS, Framer Motion, and Lucide React.

### 6. Configure the frontend API URL

Create `frontend/.env.local` when needed:

```bash
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

### 7. Start the development server

```bash
npm run dev
```

### 8. Open in browser

```
http://localhost:3000
```

The page hot-reloads automatically whenever you save a file — no need to restart the server.

---

## Other Useful Commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start local dev server at `http://localhost:3000` |
| `npm run build` | Build for production (good for catching errors) |
| `npm run lint` | Run ESLint to check for code issues |

---

## Project Structure (quick reference)

```
frontend/
  app/                  → Pages and global styles
  components/
    landing/            → All landing page sections
    ui/                 → Shared components (Button, FadeUp, etc.)
  public/               → Static assets
  tailwind.config.ts    → Brand colors and font config
```

See `FRONTEND.md` for a full breakdown of every file and its purpose.

---

## Troubleshooting

**Port 3000 already in use**
```bash
npm run dev -- -p 3001
```
Then open `http://localhost:3001`.

**`npm install` fails with SSL errors**
```bash
npm config set strict-ssl false
npm install
```

**Dependencies out of date after pulling**
```bash
npm install
```
Always run this after pulling new changes in case new packages were added.

---

## Career GPS Backend Setup

For Supabase-backed deployment:

1. Run `backend/supabase_schema.sql`.
2. Run these additive migrations in order:
   - `backend/migrations/001_career_gps_foundation.sql`
   - `backend/migrations/002_career_gps_rls.sql`
   - `backend/migrations/003_career_gps_profile_api_fields.sql`
   - `backend/migrations/004_career_gps_profile_api_rls.sql`
   - `backend/migrations/005_career_buddy.sql`
3. Set backend-only variables on Render:

```bash
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SIMPLOY_CORS_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:3000
SIMPLOY_CORS_ORIGIN_REGEX=https://.*\.vercel\.app|http://(localhost|127\.0\.0\.1):\d+
SIMPLOY_CAREER_BUDDY_AI_PROVIDER=auto
SIMPLOY_CAREER_BUDDY_RATE_LIMIT_PER_HOUR=20
```

Career Buddy is usable without paid AI access. Leave `OPENAI_API_KEY` empty for deterministic template responses. If an AI provider is enabled later, set `OPENAI_API_KEY` and `SIMPLOY_CAREER_BUDDY_MODEL` only on the backend.

For Vercel frontend, set only:

```bash
NEXT_PUBLIC_API_URL=https://your-render-backend.onrender.com
```

Never add `SUPABASE_SERVICE_ROLE_KEY` or `OPENAI_API_KEY` to frontend or `NEXT_PUBLIC_*` variables.
