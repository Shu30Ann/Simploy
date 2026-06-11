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

### 4. Install dependencies

```bash
npm install
```

> This installs everything listed in `package.json`, including Next.js, Tailwind CSS, Framer Motion, and Lucide React.

### 5. Start the development server

```bash
npm run dev
```

### 6. Open in browser

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
