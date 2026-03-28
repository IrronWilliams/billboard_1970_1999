# 2026-03-28 — Decade Radio Player Pages

## What was built

Three self-contained HTML player pages, one per decade, each capable of playing the live HLS stream:

| File | Decade | Media element | Station name |
|---|---|---|---|
| `public/70s.html` | 1970–1979 | Spinning vinyl record | Groovy FM |
| `public/80s.html` | 1980–1989 | Cassette tape with spinning reels | Power 80s |
| `public/90s.html` | 1990–1999 | Spinning compact disc (CD) | Altitude 99 |

Each page includes:
- HLS stream playback (hls.js from CDN, Safari native HLS fallback)
- Spinning media element (stops on pause)
- Artist photo placeholder (swap `div.artist-photo-placeholder` for `<img>`)
- Song title, artist name, release year
- Animated waveform (14 bars, unique duration/delay per bar)
- Live badge with pulsing dot
- Play/pause button with correct icon state
- Volume slider with live percentage readout and speaker icon that dims at low volume
- Thumbs-up / thumbs-down rating with toggle and vote counter badge

The 90s page additionally displays a stream quality panel (source, quality tier, sample rate, channels).

---

## Technical decisions

### One file per decade, no shared base file

Each HTML file is fully self-contained (inline CSS + inline JS). A shared base template was considered but rejected: the three pages have fundamentally different visual designs and different DOM structures (record vs. cassette vs. CD). Sharing a base would have required a templating system (not available without a build step) or deeply nested CSS overrides, both of which would add complexity for what is currently three files. If more decades are added this can be revisited.

### Static files in `public/` — rebuild required on change

The nginx container copies `public/` at image build time (`COPY public/ /usr/share/nginx/html/`). This means any new or changed file requires `docker compose up --build -d`. This is a known constraint from the initial build (see `2026-03-27-initial-build.md`) and is intentional — nginx serves static files with no runtime overhead.

### Media elements built entirely from CSS — no images

All three media visuals (vinyl grooves, cassette with spokes, CD with iridescent rainbow) are constructed from layered CSS gradients and pseudo-elements only. No image files are needed.

- **Vinyl record (70s):** `radial-gradient` with alternating dark rings simulates pressed grooves. The center label uses a `conic-gradient` in orange/gold. Whole element rotates on `.spinning`.
- **Cassette tape (80s):** Rectangular housing with a label sticker (`linear-gradient`), a tape window (`position: absolute`), and two reel hubs built from stacked `conic-gradient` + `radial-gradient` to simulate a 3-spoke hub. Only the `.reel-hub` elements rotate on `.spinning` — the cassette body stays still, matching real cassette behavior.
- **Compact disc (90s):** `repeating-radial-gradient` creates concentric data track rings. A `conic-gradient` with partial-opacity color stops creates the iridescent rainbow effect. A `radial-gradient` highlight spot at ~34% 28% simulates specular reflection. The entire disc rotates on `.spinning`, which naturally cycles the rainbow colors.

### Per-decade era aesthetics

Each page is intentionally distinct in color palette, typography, and background treatment to reinforce the decade it represents.

| Decade | Palette | Typography | Background |
|---|---|---|---|
| 70s | Burnt orange, harvest gold, warm brown | Playfair Display (serif) + Bebas Neue | CSS wood-grain (repeating-linear-gradient) |
| 80s | Neon pink (#ff1a75), electric cyan (#00e5ff), dark purple | Orbitron (futuristic) + Exo 2 | Synthwave horizon glow + grid lines; CRT scanline overlay |
| 90s | Teal (#00b8c8), lime green, dark charcoal | Teko (condensed) + Rajdhani + VT323 (LCD) | Dot grid (radial-gradient 1px) + monitor-top glow |

All fonts are loaded from Google Fonts CDN. System font fallbacks (`sans-serif`) are specified for resilience.

### Volume slider fill via inline background style

CSS `input[type=range]` does not support a native fill track in Firefox. The filled portion is updated by setting `element.style.background` via JavaScript on every `input` event, using a `linear-gradient` that splits at the current percentage. This works consistently across Chrome, Firefox, and Safari without browser-specific pseudo-elements.

### Rating system — client-side only (no persistence)

Vote counts are held in JS variables and reset on page reload. This is intentional at this stage — the database schema for a rating system has not been designed yet and the `/api/` routes for submitting votes do not exist. The UI is wired up to make backend integration straightforward: votes are tracked as `userVote: 'up' | 'down' | null` with a toggle pattern that handles switching sides in one step.

### Stream quality panel (90s page only)

The 90s page displays source format, quality tier, sample rate, and channel count. These values are hardcoded to reflect the known stream configuration (`LOSSLESS HLS / CD QUALITY / 44.1 kHz / STEREO`). A future improvement would be to read these values from the HLS manifest or from a `/api/stream-info` endpoint so they stay accurate if the stream changes.

### `id="record"` on all three media elements

The JavaScript in each page references the media element as `document.getElementById('record')` and calls `record.classList.add('spinning')` / `record.classList.remove('spinning')`. Using a consistent ID means the JS logic is identical across all three files. The CSS then applies the correct animation (whole-element rotation for vinyl and CD; reel-only rotation for cassette) based on the element's class.
