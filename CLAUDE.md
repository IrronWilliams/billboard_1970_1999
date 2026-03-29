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
  70s.css        Styles for 70s player
  70s.js         JavaScript for 70s player
  80s.html       Era-styled player — 1980s (cassette tape, synthwave neon)
  80s.css        Styles for 80s player
  80s.js         JavaScript for 80s player
  90s.html       Era-styled player — 1990s (CD disc, teal/charcoal)
  90s.css        Styles for 90s player
  90s.js         JavaScript for 90s player
  artist.html    Artist profile page — biography, Billboard stats, song stats, chart history
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

## Billboard data sources

Two CSV files exist; use the right one for the right purpose:

**Year-end chart data** (for decade JS files — `70s.js`, `80s.js`, `90s.js`):
```
~/ProjectNotes/billboard_1970_1999_notes/Billboard1970-1999_Remote.csv
```
Columns: `ChartPosition, Year, Artist, Song, RIAA Certification`. 2999 rows, year-end Hot 100 rankings. When adding or updating chart data to any decade JS file, read from this CSV.

**Weekly chart data** (for `GET /api/artist-stats` and `GET /api/song-stats`):
```
~/ProjectNotes/billboard_1970_1999_notes/Billboard1970-1999_Detail_Remote.csv
```
Columns: `url, WeekID, Week Position, Song, Performer, SongID, Instance, Previous Week Position, Peak Position, Weeks on Chart, Year`. 156,495 rows of weekly Hot 100 entries 1970–1999. Mounted read-only at `/app/chartdata/Billboard1970-1999_Detail_Remote.csv`. Loaded into `PERF_INDEX` at startup.

**Song sort order in `allSongs`**: sorted by `bestPosition` ascending, then `totalWeeks` descending as a tiebreaker. This ensures that when multiple songs share the same peak (e.g. Mariah Carey's 12 #1 singles), `highestSingle = allSongs[0]` returns the one with the longest chart run rather than an arbitrary CSV-order result.

**Important — two name-mismatch issues handled in `index.js`:**

1. **Artist names** differ between the two CSVs (e.g. `Daryl Hall and John Oates` in year-end vs `Daryl Hall John Oates` in weekly). `normPerf()` strips connector words (`and`, `the`, `feat`, etc.) from both sides before matching.

2. **Song titles** in the weekly CSV sometimes include subtitles not present in the year-end CSV (e.g. `Two Steps Behind (From "Last Action Hero")`). `normSong()` strips trailing parenthetical expressions (`\s*\([^)]*\)\s*$`) before normalizing so `"Two Steps Behind"` matches the full stored title. The same `normTitle()` function is mirrored client-side in `artist.html` for song comparisons.

**Wikipedia biography** (`artist.html`): fetched via `https://en.wikipedia.org/api/rest_v1/page/summary/{name}`. If the bare artist name returns a non-music article (e.g. "Prince" returns royalty), the `fetchWiki()` function retries automatically with `(musician)`, `(singer)`, `(band)`, `(rapper)` suffixes in order.

## Album art

Local JPEG files live at:
```
~/ProjectNotes/billboard_1970_1999_notes/AlbumArt/<year>/
```
Mounted read-only into the node container at `/app/albumart`. Served via `GET /api/albumart?artist=<name>&year=<year>`.

Filename conventions vary across folders (two styles coexist):
- `Artist-Name_album-title.jpg` — hyphens in artist name, underscore before album
- `Artist_Name-album-title.jpg` — underscores in artist name, hyphen before album

Matching strategy in `index.js`:
1. Strip connector words (`and`, `the`, `feat`, `with`, etc.) from both the query and filename
2. Accumulate filename words until they equal the normalized artist name
3. Decade-first search: year folders within the clicked song's decade are searched before other decades
4. Fallback candidates: strip leading "The", then try the name before " and " (e.g. "Paul McCartney and Wings" → "Paul McCartney")
5. 404 falls back silently to the initials placeholder in the player

## Feature status

| Feature | Status | Notes |
|---|---|---|
| Live HLS stream playback | ✅ Done | hls.js (CDN) + Safari native fallback |
| Era-styled player pages (70s, 80s, 90s) | ✅ Done | `public/70s.html`, `80s.html`, `90s.html` |
| Animated waveform + media element spin | ✅ Done | All three player pages |
| Mobile responsive layout | ✅ Done | All three decade pages; breakpoints at 480px, 360px, 320px |
| Billboard Top 100 Countdown (70s) | ✅ Done | `70s.js` — year buttons 1970–1979, full 100-song table per year sourced from CSV; descending display (100→1) |
| Billboard Top 100 Countdown (80s) | ✅ Done | `80s.js` — year buttons 1980–1989, full 100-song table per year; descending display (100→1) |
| Billboard Top 100 Countdown (90s) | ✅ Done | `90s.js` — year buttons 1990–1999, full 100-song table per year; descending display (100→1) |
| Countdown row → player update (all decades) | ✅ Done | Clicking any row updates player song/artist/year/initials; selected row highlighted |
| Album art display (all decades) | ✅ Done | `GET /api/albumart` searches decade-first; fuzzy artist name matching; falls back to initials |
| Artist profile page | ✅ Done | `public/artist.html` — biography (Wikipedia), Billboard stats, song stats, chart history; linked via ↗ icon in all countdown tables |
| Song rating (thumbs up / down) | ✅ UI done | Client-side only — no API or DB persistence yet |
| Song lyrics display | 🔲 Planned | |
| Rating persistence via API + DB | 🔲 Planned | UI hooks are in place; needs `/api/ratings` route and DB schema |
