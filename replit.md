# الخبر الموثوق (Trusted News)

Arabic RTL news verification platform — a knowledge filter, not a social feed. Every news item must include sources, runs through a verification pipeline (linguistic analysis, source matching, claim checking, source scoring), and earns a visible confidence band (high / medium / low). Users have reputation tiers (regular / trusted / verified_publisher) and sources have trust scores.

## Stack
- pnpm monorepo with workspace packages
- React 19 + Vite + Tailwind + shadcn/ui frontend (artifact: `trusted-news`)
- Express 5 API at `/api` (artifact: `api-server`)
- Drizzle ORM + PostgreSQL
- OpenAPI spec → Orval-generated React Query hooks (`@workspace/api-client-react`) and Zod schemas (`@workspace/api-zod`)
- framer-motion for transitions, recharts for sparklines & donut

## Layout
- `lib/api-spec/openapi.yaml` — single source of truth for the API
- `lib/api-client-react/src/generated/` — generated hooks (do not edit; run codegen)
- `lib/api-zod/src/generated/` — generated zod schemas (do not edit)
- `lib/db/src/schema/` — Drizzle tables: users, sources, news, news_sources, comments, likes
- `artifacts/api-server/src/routes/` — `news.ts`, `sources.ts`, `users.ts`, `dashboard.ts`, `health.ts`
- `artifacts/api-server/src/lib/seed.ts` — initial seed (4 users, 8 sources, 7 news, comments)
- `artifacts/api-server/src/lib/mappers.ts` — DTO mappers + `computeVerification` (time-based progress)
- `artifacts/trusted-news/src/pages/` — home, news-detail, verify, explain, submit, sources, source-detail, me, trust, explore, u/[id]
- `artifacts/trusted-news/src/components/` — layout (header + bottom tab bar), news-card, status-badge, confidence-bar

## Routes (frontend)
- `/` home feed (tabs: لك / أهم الأخبار / محلي / دولي)
- `/news/:id` detail · `/news/:id/verify` live verification · `/news/:id/explain` AI reasoning
- `/submit` submit form (sources mandatory)
- `/sources` registry (filter tabs + search) · `/sources/:id` detail with sparkline
- `/me` self profile · `/u/:id` public profile · `/trust` trust tiers
- `/explore` dashboard summary + trending

## Verification simulation
No background jobs. The `/news/:id/verification` endpoint computes progress from `verificationStartedAt` + `verificationDurationSeconds`. The verify page polls every 1.5s and routes to `/news/:id` when progress hits 100.

## Single user "me"
Authentication is not implemented in this MVP. The hardcoded current user is `user_0001` (أحمد محمد). All `/me` and submit-author behaviour resolve to that user.

## Workflows
- `artifacts/api-server: API Server` — Express on `$PORT` (8080 in dev)
- `artifacts/trusted-news: web` — Vite dev on `$PORT` (mounted at `/`)
- `artifacts/mockup-sandbox: Component Preview Server` — design sandbox (not used in production flow)

## Codegen
After editing `lib/api-spec/openapi.yaml`, run:
```
pnpm --filter @workspace/api-spec run codegen
```
Do not change `info.title: Api` — it's wired into the codegen output paths.
After editing `lib/db/src/schema/*`, run:
```
pnpm --filter @workspace/db run push
```
And rebuild types so `@workspace/api-server` sees them:
```
pnpm -r --filter @workspace/db exec tsc -p tsconfig.json
```
