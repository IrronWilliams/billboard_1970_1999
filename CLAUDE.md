# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

An online radio station website for Billboard's Top 100 songs from 1970–1999. Users can listen to a live HLS stream and — in upcoming features — rate songs, read lyrics, and view title art.

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

## Planned features

- Song rating system
- Song lyrics display
- Title / album art display
