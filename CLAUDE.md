# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Vite dev server at http://localhost:5173
- `npm run build` — Type-checks (`tsc -b`), builds with Vite, then **copies `dist/*` into `../Agendify/front/`**. The build will fail if that sibling directory doesn't exist; this is an intentional hand-off to a co-located backend repo.
- `npm run lint` — ESLint over the repo (flat config in `eslint.config.js`, TypeScript + react-hooks + react-refresh).
- `npm run preview` — Serve the production build locally.

There is no test runner configured; `@types/jest` is in dependencies but no Jest setup exists.

## Architecture

This is the React 19 + TypeScript + Vite frontend for Agendify, an AI-powered Twitter promotion platform. It pairs with a separate backend repo (Agendify-Backend) and is deployed to Railway.

### Routing & auth gating
All routes live in `src/routes.tsx` (not in `App.tsx`). Each protected route inline-checks `useAuth().user` and `<Navigate>`s to `/login` if absent — there is no `<ProtectedRoute>` wrapper. `/login` and `/register` redirect to `/agendas` when the user is already authenticated. The catch-all `*` route redirects to `/agendas` or `/login` based on auth state.

The campaign flow is nested under `/agendas/:agendaId/...`:
- `/agendas/:agendaId` → cluster detail (PromotionClusterPage)
- `/agendas/:agendaId/promote` → promote form
- `/agendas/:agendaId/promote/results` → review/approve generated replies
- `/agendas/:agendaId/dashboard` → analytics (note: this route is currently **not** auth-gated, unlike its siblings)

### Auth state
`src/context/AuthContext.tsx` is the single source of truth for the logged-in user. It:
- Persists the user (including `accessToken` and `refreshToken`) to `localStorage` under the key `"user"`.
- Normalizes `profilePicture` URLs via `formatProfilePictureUrl` — bare `/uploads/...` paths are rewritten against `window.location.origin`.
- Exposes `login`, `register`, `updateProfile`, `refreshAccessToken`, `logout`.

`useAuth()` throws if used outside `<AuthProvider>`, which wraps the entire app in `components/App.tsx`.

### API client
`src/services/api-client.ts` is a singleton Axios instance with two interceptors:
- **Request:** reads `user` from `localStorage`, attaches `Authorization: JWT <accessToken>`. If the request body is `FormData`, it deletes the `Content-Type` header so the browser sets the multipart boundary.
- **Response:** on 401, calls `/auth/refresh-token` once (guarded by `_retry`), updates `localStorage`, and replays the original request. If refresh fails it calls `useAuth().logout()` — note this is a **hook called outside React**, which is a latent bug; treat with care if touching this file.

Base URL comes from `VITE_API_BASE_URL` (default `http://localhost:3000/api`). The README mentions `VITE_API_URL`, but the code reads `VITE_API_BASE_URL` — use the latter when configuring `.env`.

### Google OAuth
The client ID is **hardcoded** in `src/main.tsx` inside `<GoogleOAuthProvider clientId="...">`, not read from env. Update it there if it changes.

### Styling
Bootstrap 5 is imported globally in `main.tsx`. Each page has a matching CSS file in `src/styles/` (e.g. `LoginPage.tsx` → `styles/login.css`). There is no CSS-in-JS or CSS modules setup — styles are global, so class names should be page-scoped to avoid collisions.

### TypeScript strictness
`tsconfig.app.json` enables `strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, and `noUncheckedSideEffectImports`. The build will fail on unused locals/params, so prefix intentionally unused identifiers with `_`.
