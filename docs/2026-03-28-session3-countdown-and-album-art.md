# 2026-03-28 Session 3 — Billboard Countdown, Row-Click Player, and Album Art

## What was built

### 1. Billboard Top 100 Countdown table (70s page)
A full year-end countdown section was added below the radio player card on `70s.html`. Users can click any of the ten year buttons (1970–1979) to load a sortable table showing all 100 songs for that year, ranked 100 (top row) → 1 (bottom row).

**Data source:** `~/ProjectNotes/billboard_1970_1999_notes/Billboard1970-1999_Remote.csv`
The CSV covers 1970–1999 (100 songs × 30 years). A Python script parsed it at build time and embedded the data directly into `70s.js` as a `const BILLBOARD` object keyed by year integer. Hand-authoring was avoided entirely.

**Known data gap:** 1971 position 1 was missing from the CSV; it was patched manually (Three Dog Night — "Joy to the World", 2× Platinum).

**Display order decision:** Data is stored in natural ascending order (pos 1…100) and reversed at render time via `[...songs].reverse()`. This preserves the source array for re-use when switching years.

### 2. Row-click updates the player card
Clicking any row in the countdown table now updates the radio player card at the top of the page: song title, artist name, year badge, and artist initials all change to reflect the selected song. The clicked row receives a gold highlight (`.row-selected`). After updating, the page scrolls back to the player card.

**Implementation:** Event delegation on `countdownBody` — a single `click` listener uses `e.target.closest('tr[data-artist]')` rather than attaching individual handlers to 100 rows. Artist/song/year are stored as `data-*` attributes on each `<tr>` at render time.

### 3. Album art display via `/api/albumart`
When a row is clicked, the player's artist initials placeholder is replaced with actual album art fetched from the local JPEG collection.

**Data location:** `~/ProjectNotes/billboard_1970_1999_notes/AlbumArt/<year>/`
Mounted read-only into the node container as a bind mount: `/app/albumart`.

**Why a bind mount instead of copying into `public/`:** The art collection is large and lives outside the repo. A bind mount keeps the Docker image lean and picks up any new images automatically on container restart without a rebuild.

**Why an API endpoint instead of direct nginx serving:** The fuzzy artist-name matching logic (see below) needs to run server-side to scan directory listings. nginx cannot do this; Express can.

**Endpoint:** `GET /api/albumart?artist=<name>&year=<year>`

### 4. Fuzzy artist-name matching
Two naming conventions coexist across the AlbumArt folders:
- Style A (older folders): `Aretha-Franklin_spirit-in-the-dark.jpg` — hyphens in artist name, underscore before album title
- Style B (newer folders): `Michael_Jackson-off-the-wall.jpg` — underscores in artist name, hyphen before album title

A single normalization function handles both: split on any non-alphanumeric character, discard connector words (`and`, `the`, `feat`, `featuring`, `ft`, `with`, `vs`), then join and compare. This also handles CSV names like "Simon and Garfunkel" matching filenames like `Simon-&-Garfunkel_...` where the ampersand is stripped and "and" is a connector word.

Word-boundary safety: rather than a simple `startsWith`, the matcher walks the filename word-by-word, accumulating tokens until the joined result equals the normalized artist name. This prevents partial-name false matches (e.g. "Chicago" matching a hypothetical "Chicagoland" file).

**Fallback candidate chain (tried in order):**
1. Full artist name as-is
2. Strip leading "The" (e.g. "The Knack" → "Knack")
3. Name before " and " (e.g. "Paul McCartney and Wings" → "Paul McCartney")

**Decade-first search:** The `year` query parameter is used to derive a decade (e.g. 1975 → 1970–1979). Year folders within that decade are searched first; remaining years are searched after. This ensures Diana Ross clicked in the 70s gets a 70s album cover, not an 80s one.

**Fallback on 404:** The player silently keeps the initials placeholder if no art is found. No broken-image state is shown; the `<img>` is hidden and the placeholder `<div>` is re-shown.

## Files changed

| File | Change |
|---|---|
| `public/70s.html` | Added `.page-wrap` wrapper, countdown section, `<img id="artistImg">` in artist photo slot |
| `public/70s.css` | Added countdown section styles, `.row-selected` highlight, `cursor: pointer` on rows; responsive breakpoints |
| `public/70s.js` | Added `const BILLBOARD` (100 songs × 10 years from CSV), `renderCountdown`, row-click delegation, `updatePlayer`, album art fetch logic |
| `public/80s.css` | Added responsive breakpoints |
| `public/90s.css` | Added responsive breakpoints |
| `nginx.conf` | Changed static asset cache from `max-age=31536000, immutable` to `no-cache` (dev-friendly; revalidates via ETags) |
| `index.js` | Added `GET /api/albumart` endpoint with fuzzy matching and decade-first folder search |
| `docker-compose.yml` | Added bind mount for AlbumArt folder into node container (`/app/albumart`, read-only) |
| `CLAUDE.md` | Updated feature status table; added Billboard data source and album art sections |

## What is not yet done

- Countdown table and row-click player update for **80s and 90s pages** — the API, CSS patterns, and data (CSV) are all in place; the feature just needs to be wired up on those pages following the same pattern as 70s
- **Rating persistence** — thumbs up/down UI exists on all three pages but votes are not saved to the database
- **Song lyrics display** — planned, no implementation started
