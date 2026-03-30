# 2026-03-30 — Rating Persistence Backend

## What was built

- PostgreSQL-backed rating persistence for the Billboard Top 100 radio station app
- `GET / POST / DELETE /api/ratings` Express router (`routes/ratings.js`)
- PostgreSQL schema with IP-based vote deduplication (`init-db.sql`)
- `ratingsDb.js` — `pg` Pool singleton, configured via `DATABASE_URL` env var
- `postgres:16-alpine` service added to `docker-compose.yml` for local dev
- Client-side wiring in `public/70s2.js`, `80s2.js`, `90s2.js` — ratings fetched on song select, cast/switched/removed on thumb click
- 78 Jest + supertest tests across unit and integration suites (all passing)

## Technical decisions

### PostgreSQL for ratings, SQLite retained for chart data

SQLite is the existing DB for this project, but it has a single-writer lock and is not designed for concurrent user writes over a network. PostgreSQL handles concurrent writes cleanly and is the standard choice for production user-generated data. However, the Billboard chart data (loaded from CSV at startup into `PERF_INDEX`) is static and read-only — SQLite is a perfectly appropriate fit for that use case and migrating it to PostgreSQL would add complexity with no benefit. The two databases are kept isolated; neither references the other.

### Supabase for production PostgreSQL

Chosen over Railway, Neon, and self-hosted. Supabase offers a generous free tier, standard PostgreSQL (no vendor lock-in), and a SQL editor for running the schema migration directly. The `pg` driver connects to it with a standard connection string — no Supabase-specific client or SDK is needed. For local dev, a `postgres:16-alpine` Docker service mirrors the production engine exactly.

### IP-based vote identity (no login required)

Three options were considered: anonymous (no deduplication), IP-based, and session cookie. IP-based was chosen as the best balance: it prevents trivial vote stuffing while requiring no auth system, no cookie consent, and no user accounts. Acknowledged limitation: shared IPs (office NAT) and VPNs can bypass it, but this is acceptable for a hobby/fan app where the goal is approximate fairness, not rigorous enforcement.

### Upsert-for-POST (single verb handles new votes and switches)

The POST handler uses `INSERT ... ON CONFLICT (song, artist, ip) DO UPDATE SET vote = EXCLUDED.vote`. This means the client always POSTs to cast or switch a vote — it does not need to track whether a prior vote exists before deciding between POST and PUT. The DB constraint enforces one-vote-per-IP-per-song atomically, preventing race conditions. A separate DELETE handles un-voting. This design reduces client complexity and eliminates a class of race condition.

### ON CONFLICT (column list) not ON CONFLICT ON CONSTRAINT name

The upsert uses `ON CONFLICT (song, artist, ip)` rather than `ON CONFLICT ON CONSTRAINT ratings_song_ip_uq`. The column-list syntax is more portable — it works regardless of the constraint name and is unaffected by future schema renames. The named-constraint form was caught in the Phase 7 quality review and corrected.

### Aggregate counts returned on every mutating response

Every POST and DELETE response returns the updated `{ up, down, userVote }` counts directly (via a follow-up `getAggregates` call), so the client never needs a separate GET after a vote. This trades one extra SELECT per mutation for simpler client code and consistent UI responsiveness.

### fetchRatings added to Promise.all in updatePlayer

When a song is selected, `fetchRatings` runs in parallel with the existing `fetchItunesPreview` and `fetchItunesVideo` calls. This means aggregate counts are fetched with zero additional latency — they arrive at the same time as the audio/video preview results. A non-fatal catch in `fetchRatings` returns `{ up: 0, down: 0, userVote: null }` so a ratings API outage never breaks song selection.

### decade column stored explicitly (not derived on read)

The `decade` column is derived from `year` at write time (`Math.floor(year / 10) * 10`) and stored in the DB. This makes future decade-level aggregate queries (e.g. "most-liked songs of the 80s") a simple filter on an indexed column rather than a computed expression over all rows.

### postgres healthcheck + depends_on in docker-compose

The `node` service depends on `postgres` with `condition: service_healthy`. The healthcheck runs `pg_isready` every 5 seconds. Without this, the node container can start before PostgreSQL is ready to accept connections, causing the first rating request to fail with a connection error. The `pg` Pool lazy-connects so the app starts cleanly, but the healthcheck ensures Postgres is accepting connections before node is considered running.

### Jest + supertest with mocked pg Pool

No real database is required to run tests. The `pg` Pool exported by `ratingsDb.js` is replaced with a `jest.fn()` mock, so tests exercise the full Express router, middleware, IP extraction, validation, and error handling without a running PostgreSQL instance. This keeps the test suite fast (~1s for 78 tests) and runnable in any environment including CI. Each mutating route fires two `pool.query` calls (write + aggregate), and tests use `mockResolvedValueOnce` sequences to verify the interaction order.

### Routes extracted to routes/ratings.js (not added inline to index.js)

`index.js` is already long (350+ lines of CSV parsing, normalization, and route handlers). Extracting the ratings router to `routes/ratings.js` keeps `index.js` clean — it adds only two lines (`require` and `app.use`). This matches the pragmatic balance approach chosen from three architecture options considered during design.

## Files created

| File | Purpose |
|---|---|
| `ratingsDb.js` | `pg` Pool singleton |
| `routes/ratings.js` | GET / POST / DELETE handlers |
| `init-db.sql` | Schema DDL — auto-runs on first `docker compose up` |
| `jest.config.js` | Jest configuration |
| `tests/unit/ratings.test.js` | 37 unit tests |
| `tests/integration/ratings.integration.test.js` | 41 integration tests |

## Files modified

| File | Change |
|---|---|
| `package.json` | Added `pg`, `jest`, `supertest`; updated test scripts |
| `docker-compose.yml` | Added `postgres` service with healthcheck, `ratings_data` volume, `DATABASE_URL` env var on node service |
| `index.js` | Added `trust proxy 1`, `require('./routes/ratings')`, `app.use('/api/ratings', ratingsRouter)` |
| `public/70s2.js` | Added `fetchRatings`, `castVote`, `applyRatings`; wired into `updatePlayer` and `resetPlayer` |
| `public/80s2.js` | Same as 70s2.js |
| `public/90s2.js` | Same as 70s2.js |
| `CLAUDE.md` | Updated tech stack, folder structure, feature status table, key constraints |

## Production deployment checklist

1. Run `init-db.sql` once in the Supabase SQL editor
2. Set `DATABASE_URL` to the Supabase connection string in your deployment environment
3. Deploy — no other configuration changes needed
