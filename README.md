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
- PWA (next-pwa) with service worker
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
- **useOfflineSync** — on reconnect, fetches pending results from IndexedDB and submits them to the server
- **IndexedDB** (`lib/db.ts`) — stores: cached tests with questions, pending offline results

### Auth Flow

```
Login → Access token (Redux memory) + Refresh token (httpOnly cookie)
      → Page reload → AuthInitializer calls /auth/refresh → new access token
      → Logout → cookie cleared
```

### Offline Flow

```
Online visit → Test cached in IndexedDB
Go offline  → Take test from IndexedDB cache
            → Result saved to IndexedDB as pending
Come online → useOfflineSync auto-submits pending results
```

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

**Client-side scoring**
Test scores are calculated in the browser. This is a deliberate trade-off to support the offline mode: without internet, the server can't verify answers. In a high-stakes exam system, server-side scoring with offline result queuing would be required.

**Correct answers in API response**
The `/api/tests/:id` endpoint returns `correct_answer` for each question — necessary for offline scoring. A production exam platform would handle this server-side or use a separate verification endpoint.

---

## Security

- Passwords hashed with bcrypt (10 rounds)
- JWT access tokens stored in Redux (memory), not localStorage — protected from XSS
- Refresh tokens in httpOnly, Secure, SameSite=Lax cookies
- Rate limiting: 10 requests/min on all `/api/auth/*` routes
- Request body capped at 1MB
- Input validation on all auth endpoints
- CORS locked to production domain
