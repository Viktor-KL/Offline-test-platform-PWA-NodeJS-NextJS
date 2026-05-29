# Offline Test Platform

A fullstack quiz application built as a portfolio showcase. Students can take tests and results sync automatically when internet is restored — designed with Ukrainian power outages in mind.

**Live demo → [quiz-offline-platform.site](https://quiz-offline-platform.site)**

---

## Stack

**Backend**
- Raw Node.js `http` module — no Express or NestJS
- TypeScript
- PostgreSQL with `pg`
- JWT (access token 15min + refresh token 7d in httpOnly cookie)
- bcryptjs for password hashing
- Docker + Docker Compose

**Frontend**
- Next.js 16 (App Router)
- Redux Toolkit + RTK Query
- Tailwind CSS v4
- PWA (`@ducanh2912/next-pwa`) with service worker + App Router offline fallback
- IndexedDB for offline storage

**Infrastructure**
- nginx as reverse proxy
- Let's Encrypt SSL
- GitHub Actions CI/CD — auto-deploy on push to `main`
- Hetzner VPS

---

## Architecture

### Backend

```
Request → Middleware chain → Router → Controller → Service → Repository → PostgreSQL
```

No framework — everything is hand-rolled:

- **`server.ts`** — `http.createServer`, runs middleware chain via `runMiddleware()`, delegates to router
- **`router.ts`** — manual route table with `matchPath()` for URL params (e.g. `/api/tests/:id`)
- **`middleware/`** — cors, logger, bodyParser, auth, rateLimit (each takes `req, res, next`)
- **Repository pattern** — all SQL isolated in `repositories/`, controllers never write queries directly
- **Singleton pattern** — `db/connection.ts` creates `pg.Pool` once via `getPool()`

### Frontend

```
AuthInitializer (refresh token check)
  └── SyncManager (pending offline results)
       └── App (RTK Query, Redux state)
```

- **RTK Query** handles all API calls with auto token injection via `prepareHeaders`
- **AuthInitializer** — blocks render until `/auth/refresh` completes, preventing race conditions on page reload
- **useOfflineSync** — on reconnect, fetches pending results from IndexedDB and submits them to the server (which scores them)
- **IndexedDB** (`lib/db.ts`) — three independent object stores, each owned by one screen to avoid overwrites:
  - `testList` — lightweight list metadata (id/title/description), written by the dashboard for offline browsing
  - `tests` — full tests **with questions**, written by the test page for offline taking
  - `pendingResults` — answers submitted offline, awaiting sync

### Auth Flow

```
Login → Access token (Redux memory) + Refresh token (httpOnly cookie)
      → Page reload → AuthInitializer calls /auth/refresh → new access token
      → Logout → cookie cleared
```

### Offline Flow

```
Online visit → Test list cached (testList) + opened tests cached with questions (tests)
             → Service worker caches the app shell + /~offline fallback page
Go offline  → Dashboard list served from IndexedDB; take a cached test from IndexedDB
            → Result saved to IndexedDB as pending (score placeholder)
Come online → useOfflineSync auto-submits pending results
            → Server calculates the real score; RTK Query refreshes the UI
```

Pages in the App Router are server-rendered and aren't in the precache manifest, so any
uncached navigation falls back to the precached `/~offline` page instead of a hard error.

---

## Local Development

**Prerequisites:** Node.js 20+, Docker

```bash
# 1. Start PostgreSQL
docker compose up -d

# 2. Backend
cd backend
cp .env.example .env   # fill in values
npm install
npm run dev            # http://localhost:4000

# 3. Frontend (separate terminal)
cd frontend
npm install
npm run dev            # http://localhost:3000
```

**Seed the database** (after tables are created):
```bash
psql -U postgres -d testplatform < seed.sql
```

### Environment variables

`backend/.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=testplatform
DB_USER=postgres
DB_PASSWORD=your_password
PORT=4000
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
```

---

## Deployment

The production stack runs in Docker Compose: `postgres`, `backend`, `frontend`, `nginx`, `certbot`.

```bash
# On the server
docker compose -f docker-compose.prod.yml up -d --build
```

CI/CD: GitHub Actions automatically deploys on every push to `main` via SSH.

---

## Design Decisions & Trade-offs

**Why raw Node.js?**
To demonstrate understanding of how HTTP servers, routing, and middleware work at the framework level — not just how to use them.

**Server-side scoring**
Scores are calculated on the server in `resultController`, never in the browser. The `/api/tests/:id` endpoint strips `correct_answer` from every question, so the client never sees the answer key. Offline submissions store the raw answers with a placeholder score and are scored by the server on sync — the offline mode stays secure without trusting the client.

**My Results offline**
The results list isn't cached in IndexedDB (only pending submissions are), so "My Results" is empty without a connection. Caching the last-seen results for read-only offline display would be a straightforward extension.

---

## Security

- Passwords hashed with bcrypt (10 rounds)
- JWT access tokens stored in Redux (memory), not localStorage — protected from XSS
- Refresh tokens in httpOnly, Secure, SameSite=Lax cookies
- Rate limiting: 10 requests/min on all `/api/auth/*` routes
- Request body capped at 1MB
- Input validation on all auth endpoints
- CORS locked to production domain
