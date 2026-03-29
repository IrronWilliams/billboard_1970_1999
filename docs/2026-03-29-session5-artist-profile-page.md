# 2026-03-29 Session 5 — Artist Profile Page

## What was built

A new `public/artist.html` page that displays a full artist profile when a user clicks the ↗ icon next to any artist name in the Billboard countdown tables on the 70s, 80s, and 90s decade pages.

### artist.html

A contemporary dark-themed single-page profile with the following sections:

- **Hero**: Artist name, selected song + year, album art (blurred as background), initials fallback
- **6 stat cards**: Total charted singles, Top 10 hits, Top 5 hits, Number one hits, Best chart position, Years on chart (individual year chips, not a range)
- **Highlights row**: Highest Charting Single, Lowest Charting Single, Longest Running Single — each showing peak position and date range (e.g. "August 1988 – October 1988")
- **Selected Song panel**: Peak chart position, date first charted, total weeks on chart, star flags if the song is the artist's best or longest running entry
- **Biography panel**: Artist bio excerpt from Wikipedia
- **Full chart history table**: All songs sorted by peak position, with weeks on chart, year(s) charted, and date first charted

### Linking from decade pages

All three countdown tables (70s, 80s, 90s) gained a small `↗` icon in the artist name cell of each row. Clicking the icon opens `artist.html?artist=NAME&song=SONG&year=YEAR`. Clicking anywhere else on the row still updates the player as before (the profile link click is intercepted before reaching the row handler).

### New API endpoints

- `GET /api/artist-stats?artist=NAME` — returns aggregate stats computed from the weekly CSV: total singles, top 10/5/1 counts, highest/lowest/longest running songs (with peak position, total weeks, first/last chart dates), all years active, full song list
- `GET /api/song-stats?artist=NAME&song=TITLE` — returns per-song stats: true peak position, total weeks on chart, first charted date, years active

## Technical choices

### Data source — weekly CSV over year-end CSV

The existing year-end CSV (`Billboard1970-1999_Remote.csv`) was initially used for the artist stats endpoints but replaced with the weekly detail CSV (`Billboard1970-1999_Detail_Remote.csv`, 156,495 rows) after the first session. The weekly data provides:

- **True peak position** (e.g. "Billie Jean" peaked at #1 weekly, not year-end #2)
- **Actual total weeks on chart** (e.g. "Billie Jean" — 24 weeks)
- **Exact first charted date** (e.g. "January 22, 1983")
- **Last charted date** (used for date ranges on highlight cards)

The weekly CSV is mounted read-only into the node container at `/app/chartdata/Billboard1970-1999_Detail_Remote.csv` and parsed once at startup into `PERF_INDEX` (a two-level Map: normalized artist → normalized song → rows).

### Two name-mismatch problems solved

**Artist names**: The weekly CSV uses `Daryl Hall John Oates` while the year-end CSV (embedded in the decade JS files) uses `Daryl Hall and John Oates`. The `normPerf()` function strips connector words (`and`, `the`, `feat`, `with`, etc.) from both the query and the stored name before matching.

**Song titles**: The weekly CSV sometimes appends subtitles not present in the year-end CSV (e.g. `Two Steps Behind (From "Last Action Hero")`). `normSong()` strips trailing parenthetical expressions before normalizing so `"Two Steps Behind"` resolves correctly. The same logic is mirrored in `normTitle()` on the client side in `artist.html` for the `isHighest`, `isLongest`, and `isCur` comparisons.

### Wikipedia biography with music-specific fallback

Biography text is fetched from the Wikipedia REST API (`/api/rest_v1/page/summary/{name}`). For artists like "Prince" whose bare name returns a non-music article (royalty in that case), the `fetchWiki()` function retries with `(musician)`, `(singer)`, `(band)`, `(rapper)` suffixes in sequence, checking the result's `description` and `extract` fields against a music keyword regex before accepting it.

### Highlight cards — descriptive text over boolean flags

Initially the Selected Song panel showed `Yes ★` for "Artist's Best Entry" and "Artist's Longest Running". This was confusing (users had no context for what "Yes" meant). Replaced with the actual stat value:
- Best entry → `★ peaked at #N`
- Longest running → `★ N weeks on chart`

### Lowest Charting Single card wording

The initial format `Peak #80 · August 1987 – September 1987` was misleading — it implied the song held #80 for that entire period. Reworded to `Charted August 1987 – September 1987, peaked at #80` to make clear the date range is when the song was on the chart and the peak is what it achieved during that run.

### Years on chart — individual years not a range

The "Years on Chart" stat card originally showed a range like `1983–1996`. Updated to show each year as an individual chip (e.g. `1983 1984 1987 1988 1989 1992 1993 1994 1995 1996`) so gaps in an artist's chart history are visible at a glance.

### Highest Charting Single — tiebreaker sort and tied-songs display

When multiple songs share the same peak position (e.g. Mariah Carey has 12 #1 singles), the original `sort()` by `bestPosition` left tied entries in CSV insertion order, making the selection arbitrary. Two changes were made:

1. **Sort tiebreaker** (`index.js`): `allSongs` is now sorted by `bestPosition` ascending then `totalWeeks` descending. `highestSingle = allSongs[0]` therefore always returns the song with the longest chart run among those sharing the top peak.

2. **Card meta text** (`artist.html`): when `allSongs` contains more than one song at the same peak, the Highest Charting Single card shows:
   `Peak #1 · Longest run among 12 #1 singles · Single spent 32 weeks on the charts`
   When there is no tie, the existing date-range format is preserved:
   `Peak #1 · August 1988 – January 1989`

## Files changed

| File | Change |
|---|---|
| `public/artist.html` | New file — full artist profile page |
| `public/70s.js` | Added ↗ profile link in `renderCountdown` rows; click handler guards against link clicks |
| `public/80s.js` | Same as 70s.js |
| `public/90s.js` | Same as 70s.js |
| `public/70s.css` | Added `a.profile-link` style |
| `public/80s.css` | Added `a.profile-link` style |
| `public/90s.css` | Added `a.profile-link` style |
| `index.js` | Added weekly CSV parsing into `PERF_INDEX`; added `GET /api/artist-stats` and `GET /api/song-stats` endpoints; added `normPerf`, `normSong`, `weekIdToMs`, `fmtWeekDate` helpers |
| `docker-compose.yml` | Added weekly CSV bind mount; replaced year-end CSV mount |
| `CLAUDE.md` | Added `artist.html` to folder structure; documented both CSVs, name-mismatch handling, and Wikipedia fallback chain |

## What is not yet done

- **Rating persistence** — thumbs up/down UI exists on all three decade pages but votes are not saved to the database
- **Song lyrics display** — planned, no implementation started
- **`/api/ratings` route and DB schema** — UI hooks are in place
