# 2026-03-28 Session 4 — Billboard Countdown and Album Art for 80s and 90s Pages

## What was built

The Billboard Top 100 Countdown feature — previously built for the 70s page — was extended to the 80s and 90s pages. Both pages now have full feature parity with the 70s page.

### 80s page (`80s.html`, `80s.css`, `80s.js`)
- Year buttons 1980–1989 render a full 100-song table descending (100→1)
- Clicking any row updates the player card: song title, artist name, year badge, artist initials
- Album art fetched via `/api/albumart` with decade-first search (1980–1989 folders prioritized)
- `<img id="artistImg">` and `id="artistPlaceholder"` added to artist photo slot
- Countdown styled in 80s synthwave theme: neon pink rank #1, cyan rank #2, purple rank #3, Orbitron font throughout, cyan artist names, pink RIAA badges

### 90s page (`90s.html`, `90s.css`, `90s.js`)
- Year buttons 1990–1999 render a full 100-song table descending (100→1)
- Same row-click player update and album art behavior as 70s and 80s
- Countdown styled in 90s teal/charcoal theme: teal rank #1, lime rank #2, silver rank #3, Teko font, teal artist names

## Technical choices

### Data generation
Billboard Year-End Top 100 data for 1980–1989 and 1990–1999 was parsed from the same CSV source used for the 70s page (`~/ProjectNotes/billboard_1970_1999_notes/Billboard1970-1999_Remote.csv`) using the same Python script pattern. All 10 years in each decade yielded exactly 100 entries. Data was appended directly to each decade's JS file.

### Code reuse approach — append, not extract
The countdown handlers and `updatePlayer` function are duplicated across `70s.js`, `80s.js`, and `90s.js` rather than extracted into a shared module. This was a deliberate choice: the pages are served as static files from nginx with no build step or module bundler. A shared JS file would require either an additional `<script>` tag on each page or a bundler. Duplication across three files is simpler and keeps each page fully self-contained.

### Styling — per-theme rather than shared
Countdown CSS was written separately for each decade to match the existing era aesthetics rather than using a single shared stylesheet. The structural rules (`.countdown-section`, `.year-btns`, `.countdown-table`, etc.) are identical in intent but use each page's CSS variables, so the 80s table feels neon/synthwave and the 90s table feels teal/industrial. A shared base sheet was considered but rejected for the same reason as JS: no build step, and per-file isolation is easier to maintain.

### Body layout change
Both 80s and 90s `body` rules were changed from `display: flex; align-items: center; justify-content: center` (single centered card) to `flex-direction: column; align-items: stretch` with a `.page-wrap` max-width container. This is the same pattern used on the 70s page and allows the countdown section to sit below the card at full section width while keeping both elements centered within a 900px max-width wrapper.

## Files changed

| File | Change |
|---|---|
| `public/80s.html` | Added `.page-wrap`, `<img id="artistImg">`, `id="artistPlaceholder"`, `id="artistInitials"`, countdown section with 1980–1989 year buttons and table |
| `public/80s.css` | Changed body to column flex, added `.page-wrap`, added full countdown section styles in synthwave theme |
| `public/80s.js` | Appended `const BILLBOARD` (100 songs × 10 years), countdown handlers, `updatePlayer`, album art fetch |
| `public/90s.html` | Same structural changes as 80s.html, year buttons 1990–1999 |
| `public/90s.css` | Same structural changes as 80s.css, styled in teal/charcoal 90s theme |
| `public/90s.js` | Same JS additions as 80s.js |
| `CLAUDE.md` | Updated feature status table — all countdown and album art rows now marked done for all decades |

## What is not yet done

- **Rating persistence** — thumbs up/down UI exists on all three pages but votes are not saved to the database
- **Song lyrics display** — planned, no implementation started
- **`/api/ratings` route and DB schema** — UI hooks are in place
