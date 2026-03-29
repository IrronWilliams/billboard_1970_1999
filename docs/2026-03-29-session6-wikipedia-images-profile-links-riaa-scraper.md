# 2026-03-29 Session 6 — Wikipedia Image Fallback, Profile Link Split, RIAA Scraper

## What was built

### 1. Wikipedia image fallback on decade pages and artist.html

All three countdown pages (`70s.js`, `80s.js`, `90s.js`) and `artist.html` now fall back to a Wikipedia thumbnail when local album art is not found.

**How it works:**
- `GET /api/albumart` is tried first (existing behavior)
- On 404, a new client-side `fetchWikiThumb(artist)` function queries the Wikipedia REST API (`/api/rest_v1/page/summary/{name}`)
- Returns `data.thumbnail.source` if the article is music-related
- Falls back to the initials placeholder only if Wikipedia also has no image

**`fetchWikiThumb` in `70s.js`, `80s.js`, `90s.js`** (added before `getInitials`):
- Same music-keyword guard (`WIKI_MUSIC_RE`) and suffix chain (`(musician)`, `(singer)`, `(band)`, `(rapper)`) as `fetchWiki()` in `artist.html`
- Returns thumbnail URL string or `null`
- Called in `testImg.onerror` handler; on success, sets `artistImgEl.src` and hides the initials placeholder

**`artist.html`** — added `probe.onerror` handler (previously missing entirely):
- Calls the existing `fetchWiki(ARTIST)` function (already on the page for biography)
- Extracts `data.thumbnail.source` from the response
- Applies the thumbnail to both `#heroArt` (the visible image) and `#heroBgArt` (blurred background)

**Why Wikipedia over a placeholder:** Many artists in the 1970–1990s catalog have no local album art files. The Wikipedia thumbnail is a recognizable artist photo that significantly improves the UI compared to initials alone.

**Why reuse `fetchWiki` on `artist.html`:** The function was already present and already handles the music-keyword validation and suffix fallback. Adding a separate `fetchWikiThumb` would have been redundant.

### 2. Artist and song profile links split into two separate arrows

Previously each countdown row had a single `↗` icon in the artist cell linking to `artist.html?artist=NAME&song=SONG&year=YEAR`. This was changed to two separate links:

| Cell | URL | Tooltip |
|---|---|---|
| Artist name | `artist.html?artist=NAME` | "Click for artist bio" |
| Song title | `artist.html?artist=NAME&song=SONG&year=YEAR` | "Click for song details" |

**Why split:** The two entry points serve different user intents. Clicking the artist name implies interest in the artist as a whole (biography, full chart history, career stats). Clicking the song title implies interest in that specific track (peak position, weeks on chart, Selected Song panel). Separating them makes the navigation more intuitive and the tooltips more precise.

**Why the artist link omits the song param:** `artist.html` handles a missing `song` param gracefully — it simply does not render the Selected Song panel. This keeps the artist-focused view clean.

**Previous tooltip text** was "Click for artist bio, chart stats & song details" on the single arrow. The new split tooltips — "Click for artist bio" and "Click for song details" — are shorter and more accurate to what each link actually opens.

Applied to `70s.js`, `80s.js`, `90s.js`. The existing `a.profile-link` click guard in the row handler catches both links since both share the same CSS class.

### 3. RIAA certified units scraper

A one-time Node.js data extraction script was created at:
```
~/ProjectNotes/billboard_1970_1999_notes/scrape_riaa.js
```

**Problem:** The RIAA certification values in `Billboard1970-1999_Remote.csv` are dated. The `riaa.com/gold-platinum/` website has current "Certified Units" data (e.g. Billie Jean is now Diamond — 10 Million units, not just Platinum). The site requires JavaScript to load the detail panel, so a direct HTML scrape was not initially obvious.

**How the RIAA site works (discovered by inspection):**
1. Search results page HTML contains `<tr class="table_award_row" id="default_ID">` entries
2. Each row contains an award icon (`icons/N_big.png` — N=0 is Gold, N=1–9 is Nx Platinum, N=10 is Diamond)
3. Clicking "MORE DETAILS" calls `showDefaultDetail(id, type)` defined in `riaa-gnp/award_by_group.js`
4. That function POSTs to `https://www.riaa.com/wp-admin/admin-ajax.php` with `action=load_detail_from_recent&id=ID&mobile=false&type=TYPE`
5. The response is a JSON-encoded HTML fragment containing a table with columns: Release Date | Previous Certifications | Category | Type | **Certified Units** | Genre
6. Certified Units value is in `<td class='col-md-4'>VALUE</td>`

**Key debugging finding — icon/ID pairing:** An initial approach matched icon levels and award IDs using two separate global regexes, then zipped them by index. This failed because stray `0_big.png` icons exist in the page header/navigation before the search results, causing the index pairing to misalign (e.g. Billie Jean showed "Diamond" level but "0.5 Million" units — the Gold award's units). Fixed by splitting the HTML on `id="default_"` and extracting the icon and type from each chunk independently, ensuring the level is always matched to its own award ID.

**Script behavior:**
- Reads 2,923 unique artist+song pairs from the Billboard CSV
- Step 1 per song: search RIAA, extract highest certification award (ID, type, level)
- Step 2 per song: AJAX call for Certified Units
- 700ms delay between search requests, 300ms before AJAX call
- Saves progress to `riaa_certified_units.json` every 25 entries (re-run safe)
- Output: `{ "ARTIST|||SONG": { certLevel, certUnits, awardId } | null }`

**Status:** Script is written and tested on a sample of 6 songs. Full run (~60–70 min) not yet executed. CSV and decade JS update pending completion of the scrape.

## Files changed

| File | Change |
|---|---|
| `public/70s.js` | Added `WIKI_MUSIC_RE` constant and `fetchWikiThumb()` function; updated `testImg.onerror` to call it; split artist link into `artistUrl` and added `songUrl` on song cell; updated tooltips |
| `public/80s.js` | Same as 70s.js |
| `public/90s.js` | Same as 70s.js |
| `public/artist.html` | Added `probe.onerror` handler that calls `fetchWiki()` and applies `thumbnail.source` to hero image and background |
| `CLAUDE.md` | Added Wikipedia image fallback docs, profile links section, RIAA scraper section; updated feature status table |
| `~/ProjectNotes/.../scrape_riaa.js` | New one-time data extraction script (outside repo) |

## What is not yet done

- **RIAA scraper full run** — script is ready, ~60–70 min to complete; `riaa_certified_units.json` not yet produced
- **RIAA data applied to CSV and JS files** — pending scraper output
- **Rating persistence** — thumbs up/down UI exists on all three decade pages but votes are not saved to the database
- **Song lyrics display** — planned, no implementation started
- **`/api/ratings` route and DB schema** — UI hooks are in place
