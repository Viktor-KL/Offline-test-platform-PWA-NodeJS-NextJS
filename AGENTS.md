# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

Offline-first test platform — fullstack showcase app. Students can take tests and results sync automatically when internet is restored. Built as a learning project to demonstrate Node.js, RTK, PostgreSQL, and design patterns.

## Commands

### Backend (run from `backend/` directory)
```bash
npm run dev      # start dev server with nodemon (port 4000)
npm run build    # compile TypeScript to dist/
npm start        # run compiled JS
```

### Database
```bash
docker compose up -d    # start PostgreSQL container
docker compose down     # stop container (data persists in volume)
docker ps               # check container status and port mapping
```

## Architecture

Monorepo with two separate packages:
- `backend/` — raw Node.js HTTP server (no Express/Nest)
- `frontend/` — Next.js + RTK (not yet built)

### Backend Layer Structure

```
Request → Middleware chain → Router → Controller → Service → Repository → PostgreSQL
```

**No framework** — everything is hand-rolled:
- `src/server.ts` — `http.createServer`, runs middleware chain via `runMiddleware()`, then delegates to router
- `src/router.ts` — manual route table (array of `{ method, path, handler }`), `matchPath()` handles URL params like `/api/tests/:id`
- `src/middleware/` — cors, logger, bodyParser (each takes `req, res, next`)
- `src/types.ts` — `AppRequest` extends `IncomingMessage` with `body?` and `params?`

**Design patterns in use:**
- **Singleton** — `src/db/connection.ts` exports `getPool()`, creates `pg.Pool` once
- **Repository** — `src/repositories/` isolates all SQL; controllers never write SQL directly

### Database Schema

4 tables: `users`, `tests`, `questions`, `results`
- `questions.options` and `results.answers` use `JSONB`
- `questions` and `results` reference `tests` and `users` with `ON DELETE CASCADE`

### Environment Variables

See `backend/.env.example`. Key vars: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `PORT`, `JWT_SECRET`, `JWT_REFRESH_SECRET`.

### Auth Strategy (in progress)

JWT with two tokens:
- **Access token** — 15 min, sent in `Authorization: Bearer` header
- **Refresh token** — 7 days, stored in httpOnly cookie

`src/services/authService.ts` handles register/login/refresh logic using `bcryptjs` + `jsonwebtoken`.

## Key Conventions

- All communication with Viktor is in **Russian**
- Viktor is learning backend — explain concepts, point out issues but let him fix them himself; only provide ready-made code for pure repetition
- Commit after each logical unit of completed, working functionality
- Always check current file state before suggesting changes (files may differ from what was discussed)
