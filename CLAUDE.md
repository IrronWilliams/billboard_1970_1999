# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

An online radio station website for Billboard's Top 100 songs from 1970–1999. Users can listen to a live HLS stream and rate songs. Each decade (70s, 80s, 90s) has its own era-styled player page. Planned additions: lyrics display and album/title art.

## Tech stack

| Layer | Technology |
|---|---|
| Reverse proxy / static files | nginx (Alpine Docker image) |
| API server | Express.js on Node 20 (Docker) |
| Database | SQLite via `better-sqlite3` |
| Audio streaming | HLS via hls.js (CDN) |

## Folder structure

```
public/          Static files baked into nginx at build time (HTML, CSS, JS, images)
  index.html     Original base player page
  70s.html       Era-styled player — 1970s (vinyl record, warm earth tones)
  80s.html       Era-styled player — 1980s (cassette tape, synthwave neon)
  90s.html       Era-styled player — 1990s (CD disc, teal/charcoal)
docs/            Decision logs — one Markdown file per session, named YYYY-MM-DD-*.md
index.js         Express entry point — add all API routes here
db.js            Exports a single shared better-sqlite3 connection (WAL mode, foreign keys on)
nginx.conf       nginx config — serves public/, proxies /api/* to Express
Dockerfile.node  Node container
Dockerfile.nginx nginx container
docker-compose.yml  Defines `node` and `web` services + db_data volume
```

## Running the app

```bash
docker compose up -d                # start (assumes already running)
docker compose up --build -d        # rebuild after any code change
docker compose down                 # stop
docker compose logs -f node         # Express logs
docker compose logs -f web          # nginx logs
```

App is available at **http://localhost:3001**.

## Key constraints

- **All Express routes must be prefixed `/api/`** — nginx only proxies that path prefix to the node container; everything else is served as a static file.
- **Static file changes require a rebuild** — `public/` is copied into the nginx image at build time.
- **The server is assumed to be already running.** Do not start it unless necessary; if a restart is needed, run it in the background.
- **`better-sqlite3` is a native module** — `.dockerignore` excludes `node_modules` so it recompiles inside the container. If running outside Docker via `npm start`, it must be compiled against the local Node version.
- The SQLite database is persisted in the `db_data` named Docker volume at `/app/data/data.db` inside the container.

## GitHub integration

A Claude Code GitHub Actions workflow is configured at `.github/workflows/claude.yml`. Tag `@claude` in any issue or PR comment to trigger it. The workflow uses `ANTHROPIC_API_KEY` stored as a repository secret.

## Feature status

| Feature | Status | Notes |
|---|---|---|
| Live HLS stream playback | ✅ Done | hls.js (CDN) + Safari native fallback |
| Era-styled player pages (70s, 80s, 90s) | ✅ Done | `public/70s.html`, `80s.html`, `90s.html` |
| Animated waveform + media element spin | ✅ Done | All three player pages |
| Song rating (thumbs up / down) | ✅ UI done | Client-side only — no API or DB persistence yet |
| Song lyrics display | 🔲 Planned | |
| Album / title art display | 🔲 Planned | |
| Rating persistence via API + DB | 🔲 Planned | UI hooks are in place; needs `/api/ratings` route and DB schema |
