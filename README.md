# Charades Game Night Hub

Spin for a player, fetch AI-generated prompts, run five-round matches, and keep score without leaving the browser.

## TL;DR (Short Version)

- Build teams through a slide-out player panel, then spin the neon wheel to decide who acts next.
- Topic + difficulty pickers recolor the table and fetch five OpenAI-powered prompts custom to that round.
- Each actor gets a five-minute countdown, can burn 30 seconds for an alternate hint, and records wins/losses straight into the scoreboard.
- Tech stack: React 18, TypeScript, Vite, Tailwind CSS on the frontend; Express + OpenAI + shared TypeScript types on the backend. Run `npm install` then `npm run dev` to launch both apps together.

## Long Version

### What the App Does

1. **Player Setup Drawer** – A fixed left drawer lets you add, color-pick, or clear players; the roster persists via `localStorage` so game night can resume later.
2. **Prize Wheel** – The SVG-based wheel wedges each player into a slice, animates multi-turn spins, and emits the winning player back into the game context.
3. **Prompt Console** – Topic and difficulty selectors (fed by `@charades/shared`) recolor the board and call `/api/challenge` for five fresh prompts; alternates shave 30 seconds from the timer.
4. **Turn Timer & Controls** – Once prompts load for a player, a five-minute countdown starts, Surrender/Got It buttons lock in the outcome, and the player’s badge floats over the prompt card.
5. **Scoreboard** – Five rounds per player render as a grid of ✓/✕ marks with running totals, and celebratory overlays flash when turns end.

### Key Features

- **OpenAI prompt generation** with duplicate avoidance and per-theme history saved to `apps/api/data/challenge-history.json`.
- **Topic-driven theming** that swaps logos, accent colors, and badge styling based on the selected category.
- **Alternate prompt penalty** subtracts 30 seconds so teams weigh the cost of skipping clues mid-turn.
- **Local persistence** for player rosters plus reset helpers for rounds and participants.
- **Accessibility-minded controls** with keyboard-friendly menus, aria labels, and visible focus styles.

### How It Was Built

- **Frameworks:** React 18 + Vite + TypeScript in `apps/web`; Express + TypeScript in `apps/api`.
- **Styling:** Tailwind CSS plus custom gradients, static-TV headers, and wheel SVG math for the casino vibe.
- **State & Logic:** `GameContext` centralizes prompts, timers, wheel spins, and scoreboard updates so every component stays in sync.
- **API Integration:** `apps/api/src/routes.ts` calls `gpt-4o-mini` with strict JSON responses, difficulty rules, and a deduped history file.
- **Shared Types:** `packages/shared` hosts the `Topic`, `Difficulty`, and `Challenge*` contracts consumed by both workspaces through TS path aliases.

### Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Add backend environment variables** – `apps/api/.env`
   ```bash
   OPENAI_API_KEY=sk-...
   PORT=8000                 # optional, defaults to 8000
   CORS_ALLOWED_ORIGINS=http://localhost:5173
   ```
3. **Add frontend environment variables** – `apps/web/.env`
   ```bash
   VITE_API_BASE=http://127.0.0.1:8000/api   # defaults to /api when omitted
   ```
4. **Run both apps**
   ```bash
   npm run dev
   ```
   This launches the shared package watcher, the API (`http://127.0.0.1:8000`), and the Vite dev server (`http://localhost:5173`).

### Development Notes

- Repository layout:
  ```
  apps/
    api/   Express backend + OpenAI integration
    web/   Vite/React frontend
  packages/
    shared/  Type definitions + topic metadata
  ```
- Prompt history is file-based; make sure `apps/api/data/` stays writable in whatever environment you deploy to.
- The wheel requires at least two players before the drawer lets you close it; `Spin` button listens to a `spinSignal` raised from the prompt area.
- Timer + scoreboard limits are set in `GameContext` (`ROUNDS = 5`, `TURN_DURATION_MS = 5 * 60 * 1000`); tweaking them here updates the UI everywhere.
- `npm run build` chains builds for shared types, API, then web so deployment artifacts stay in lockstep.

### Firebase Hosting Deploy

1. **Set production API base** – `apps/web/.env.production`
   ```bash
   VITE_API_BASE=https://charades-tracy.onrender.com/api
   ```
2. **Build the web app**
   ```bash
   npm run build --workspace=apps/web
   ```
3. **Deploy hosting**
   ```bash
   firebase deploy --only hosting
   ```

**Switching API targets**
- Local dev uses `apps/web/.env` (typically `http://127.0.0.1:8000/api`).
- Production builds use `apps/web/.env.production` (Render URL).

### Roadmap Ideas

- Dynamic round counts or variable timer lengths configurable per match.
- Mobile-friendly gestures (swipe to spin, shake for alternate prompt).
- Exportable game summaries (CSV of rounds, MVP, etc.) for party recaps.
- Offline prompt packs for no-internet nights or non-OpenAI backends.

Enjoy hosting charades nights without index cards—spin, mime, and track the bragging rights! If you add new twists, document them here so the next host can pick up where you left off.
