# 2026-03-29 Session 8 — iTunes Audio Preview and Video Modal

## What was built

### 1. iTunes audio preview on song select (all three decade players)

When a countdown row is clicked, the player now fetches a 30-second AAC audio preview from Apple's iTunes Search API and plays it automatically, replacing the live HLS stream for that selection.

**API used:** `https://itunes.apple.com/search?term=ARTIST+SONG&media=music&entity=song&limit=5`

No API key required. The call is made directly from the browser (CORS-friendly).

**HLS handling:** The module-level `hls` variable (previously `const` inside the IIFE) is now accessible so `hls.detachMedia()` can be called before switching `audio.src` to the iTunes preview URL. This prevents HLS from reasserting control over the audio element.

**`isPreviewMode` flag:** Added to track whether the player is in preview mode vs live stream mode. The play button handler, `setPlayState` status text, and `resetPlayer` all branch on this flag.

**`audio.ended` handler:** Added to detect when the 30-second preview finishes, setting the play button back to its paused state and showing "Preview ended" in the status bar.

### 2. iTunes music video preview modal (all three decade players)

When a song is selected, a parallel iTunes music video search runs alongside the audio preview fetch. If a 30-second MP4 video clip is found, a `▶ Video` button appears below the play/pause button. Clicking it pauses the audio and opens the video in a full-screen overlay modal. Closing the modal (via ✕ or clicking outside) resumes the audio preview.

**Video search — three-stage strategy:**

| Stage | Search term | Validation |
|---|---|---|
| 1 | Artist name only (`limit=25`) | Track name must match the song |
| 2 | Artist + song combined (`limit=10`) | Track name AND artist name must match |
| 3 | Song name only (`limit=15`) | Artist name must overlap with ours |

**Why artist-only first:** Combined searches frequently return cover versions or unrelated songs that happen to share a title (e.g. "How Can I Fall" by Breathe returning Mario's version). Searching by artist first and validating the track name avoids this.

**Why three stages:** Some artists have low video catalog coverage under their own name on iTunes. Falling back to a song-only search with artist validation catches cases where the catalog entry is indexed differently.

**Artist validation in Stage 2:** Stage 2 originally only validated the track name, which caused wrong-artist results (e.g. Breathe / How Can I Fall returning Mario's video). Artist name validation was added to both Stage 2 and Stage 3.

### 3. Accent and apostrophe normalization in video search

The `norm()` helper used for all video search comparisons:
1. Lowercases the string
2. Calls `.normalize('NFD')` then strips combining diacritical marks (`\u0300–\u036f`) — handles accented artist names like "Exposé" → "expose"
3. Strips apostrophes — handles song titles stored without apostrophes (e.g. "Youve Lost That Loving Feeling", "IM Coming Out")
4. Replaces remaining non-alphanumeric characters with spaces and collapses whitespace

**Why accent normalization matters:** Artist names in the BILLBOARD data use plain ASCII. iTunes catalog entries may use the accented spelling (e.g. "Exposé"). Without accent stripping, the artist match would fail and return no video.

**Why apostrophe stripping:** Song titles in the decade JS files have apostrophes removed (a historical data entry convention in the CSV). iTunes track names retain apostrophes. Stripping both sides before comparison makes them equivalent.

### 4. Quality panel removed (all three decade players)

The "Source / Quality / Sample Rate / Channels" panel was removed from all three HTML files and their corresponding CSS files. With the player now serving iTunes 30-second AAC previews rather than a lossless HLS stream, the panel values ("LOSSLESS HLS", "CD QUALITY") were no longer accurate.

### 5. Player reset on year button click (all three decade players)

Clicking a year button now calls `resetPlayer()` before rendering the new countdown table. This clears all player fields to neutral defaults ("Select a song" / "Artist"), stops any playing audio, detaches HLS, hides the video button, and sets the status bar to "Click a song to preview."

**Why:** Previously the player retained the last-selected song (or the hardcoded placeholder) when switching years, which was confusing — the displayed song had no relation to the year being browsed.

**Hardcoded placeholders removed:** `70s.html` had "September" / "Earth, Wind & Fire", `80s.html` had "Billie Jean" / "Michael Jackson", and `90s.html` had "Waterfalls" / "TLC" baked into the HTML. These were replaced with generic "Select a song" / "Artist" text.

## Technical choices

**Why iTunes over Deezer or Spotify:**
- No API key or server-side proxy required (Deezer has CORS restrictions in the browser)
- Spotify requires OAuth token management
- iTunes Search API is CORS-permissive and returns direct `.m4a` and `.mp4` preview URLs that play natively in `<audio>` and `<video>` elements

**Why 30-second previews are acceptable:** The use case is a discovery/browsing experience for Billboard hits. Users are browsing a ranked list and want to identify songs quickly — 30 seconds is sufficient to recognize a track. Full-length playback would require licensing agreements.

**Why `Promise.all` for audio + video fetch:** Both iTunes searches run in parallel on row click, reducing total wait time from ~sequential to ~max(audio_latency, video_latency).

**Modal theme per era:** Each decade's video modal uses that page's CSS variables (gold tones for 70s, neon pink for 80s, teal for 90s) to stay visually consistent with the era theme.

## Files changed

| File | Change |
|---|---|
| `public/70s.js` | Added `hls` module var, `isPreviewMode`, `currentVideoUrl`, iTunes fetch functions, `switchToPreview`, video modal handlers, `resetPlayer`; `updatePlayer` made async; play button and `setPlayState` updated |
| `public/80s.js` | Same as above; also fixed video search stage 2 to validate artist name |
| `public/90s.js` | Same as 70s.js |
| `public/70s.html` | Removed quality panel; added video button and modal; cleared hardcoded placeholder song |
| `public/80s.html` | Same as 70s.html |
| `public/90s.html` | Same as 70s.html |
| `public/70s.css` | Removed quality panel CSS; added video button and modal styles (gold theme) |
| `public/80s.css` | Removed quality panel CSS; added video button and modal styles (neon pink theme) |
| `public/90s.css` | Removed quality panel CSS; added video button and modal styles (teal theme) |

## What is not yet done

- **Full-length music videos** — would require a Google YouTube Data API key (free tier); currently all video previews are 30-second iTunes clips
- **iTunes preview for 70s/90s audio accuracy** — same search logic as 80s; coverage varies by era and artist
- **Rating persistence** — thumbs up/down UI exists on all three decade pages but votes are not saved to the database
- **Song lyrics display** — planned, no implementation started
- **`/api/ratings` route and DB schema** — UI hooks are in place
