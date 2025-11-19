# Charades Mono

This repository is a small monorepo that powers a charades prompt generator and play helper. It contains a backend API that talks to OpenAI, a Vite-powered web client, and a shared package for types/config between them.

## Repository Layout

```
apps/
  api/        Express + OpenAI backend
  web/        Vite/React frontend
packages/
  shared/     Shared TypeScript definitions/constants
```

### apps/api
* Express server (`src/index.ts`) exposes `/api/challenge`.
* `routes.ts` handles OpenAI chat completion calls. Prompts are collected and stored per-theme so future responses avoid duplicates.
* Local prompt history JSON lives at `apps/api/data/challenge-history.json` (gitignored).
* `.env` (not committed) should contain `OPENAI_API_KEY` and optional `PORT`.

### apps/web
* Vite + React app residing in `src/`.
* `App.tsx` renders the UI for selecting theme/difficulty, calling the API via `src/api.ts`, and displaying results.
* `components/GameWheel.tsx` contains a simple wheel spinner widget for picking players. It exposes the selected player back to `App` so the prompt card can show that badge.
* Tailwind is configured via `tailwind.config.js` and `src/index.css`.

### packages/shared
* Contains the TypeScript types shared by both API and web apps (`ChallengeRequest`, `ChallengeResponse`, `Topic`, etc.).
* Built output is in `packages/shared/dist`. Both apps import the source during dev via TypeScript path mapping.

## How the Pieces Interact

1. The web app lets the user pick a theme, difficulty, and optionally a player from the wheel.
2. When “Get Prompts” is clicked, `apps/web` calls `/api/challenge` with the selected theme/difficulty.
3. The API (`apps/api`) forwards that request to OpenAI, enforces the prompt rules, filters out duplicates based on the stored history, and persists new prompts to disk.
4. The API returns a JSON payload (`ChallengeResponse`) that is rendered in the web UI along with color-coded topic/player badges.
5. The shared package guarantees both sides agree on request/response shapes and topic metadata.

## Development

```bash
npm install         # installs root + workspace dependencies
npm run dev         # runs web and api concurrently (see package.json scripts)
```

The API expects `apps/api/.env` with `OPENAI_API_KEY=...`. The web app reads `VITE_API_BASE` via `apps/web/.env` (defaults to `/api` for local proxying).

## Preparing for Deployment

1. **Build shared package first**  
   ```bash
   npm --workspace packages/shared run build
   ```
2. **Build each app**  
   ```bash
   npm --workspace apps/api run build
   npm --workspace apps/web run build
   ```
   The API output goes to `apps/api/dist`. The web app outputs to `apps/web/dist`.
3. **Configure environment**  
   * Provide `OPENAI_API_KEY` and `PORT` for the API.  
   * Serve the built `apps/web/dist` via a static host (Netlify, Vercel, S3, etc.) or behind the API as a static middleware.
4. **Deploy API**  
   * Deploy the contents of `apps/api/dist` (plus `package.json`) to your Node runtime (Render, Railway, Heroku, AWS, etc.).  
   * Ensure the `apps/api/data/` directory is writable so prompt history can persist. Consider mounting persistent storage.
5. **Wire up the frontend**  
   * Set `VITE_API_BASE` (or similar runtime env) on the web host to point to the deployed API URL.  
   * Rebuild the web app with that env (e.g., `VITE_API_BASE=https://api.example.com npm --workspace apps/web run build`) and deploy the static assets.
6. **Optional: unify hosting**  
   * Serve `apps/web/dist` from the API server by mounting `express.static` if you prefer a single deployment target. Update the build script or API entrypoint accordingly.

## Additional Notes

* The API stores prompt history on the local filesystem. For production clustering or serverless deployments, replace `storage.ts` with a shared datastore (e.g., Redis, Postgres).
* When updating shared types, run `npm --workspace packages/shared run build` so consuming apps get updated `dist` files before building.
* Tailwind styles depend on the custom topic palette defined in `apps/web/tailwind.config.js`.

Feel free to tailor the deployment steps to your hosting provider of choice. The critical pieces are ensuring the API has network access to OpenAI with persisted storage for prompt history, and the web app hits the correct API URL.
