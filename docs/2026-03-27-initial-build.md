# 2026-03-27 — Initial Build

## What was built

- Docker-based local development stack (nginx + Express + SQLite)
- Landing page with an embedded HLS radio player

## Technical decisions

### Express.js for the API server
The project already had Express established as the standard dev/test webserver. Chosen for its minimal setup and familiarity in this codebase.

### SQLite via `better-sqlite3` for the database
Chosen over PostgreSQL for local prototyping because it requires no separate server process, no credentials, and the database is a single file. `better-sqlite3` specifically was chosen over the `sqlite3` package for its synchronous API, which is simpler and faster for the query patterns expected here.

### nginx as reverse proxy
Mirrors the pattern from the existing `radiocalico2` project. nginx handles static file serving (with appropriate cache headers) and proxies `/api/*` to Express. This separation means the frontend and backend can be deployed independently and static assets benefit from nginx's efficient file serving.

### Docker Compose for the full stack
Keeps the dev environment self-contained and reproducible. The two services (`web` for nginx, `node` for Express) communicate over Docker's internal network. The SQLite file is persisted in a named volume (`db_data`) so data survives container restarts.

### Port 3001 for this project
Port 3000 is occupied by the `radiocalico2` project's Docker stack (nginx mapped to `0.0.0.0:3000`). Port 3001 was chosen as the next available port.

### `.dockerignore` excluding `node_modules`
`better-sqlite3` includes a native C++ addon compiled against a specific Node.js ABI version. The host machine runs a different Node version than the Node 20 container, causing a module version mismatch. Excluding `node_modules` from the build context ensures `npm ci` runs inside the container and compiles the addon for the correct version.

### HLS.js for audio streaming
The live stream is delivered as HLS (`live.m3u8`). HLS is not natively supported in all browsers (notably Chrome and Firefox). HLS.js is loaded from CDN to provide a consistent cross-browser experience, with a fallback to native HLS for Safari.

### All API routes prefixed `/api/`
nginx only proxies the `/api/` path prefix to the Express container. Static files are served directly by nginx for everything else. This is a hard constraint — routes without the prefix will 404 at the nginx level and never reach Express.
