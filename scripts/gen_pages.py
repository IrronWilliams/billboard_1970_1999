#!/usr/bin/env python3
"""Generator: creates 70s2.html, 80s2.html, 90s2.html, artist2.html"""

import re, os

PUB = '/home/iwilliams/billboardrankings/public'

def read_js(name):
    with open(f'{PUB}/{name}', 'r', encoding='utf-8') as f:
        return f.read()

def write_html(name, content):
    path = f'{PUB}/{name}'
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Created {path} ({len(content):,} bytes)')

def write_css(name, content):
    path = f'{PUB}/{name}'
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content.strip() + '\n')
    print(f'Created {path} ({len(content):,} bytes)')

def patch_js(js, filled, unfilled, play_text=False):
    """Apply per-page substitutions to the source JS."""
    # Fix artist profile links
    js = js.replace('artist.html?artist=', 'artist2.html?artist=')
    # Fix volume slider fill color
    js = js.replace("const filled   = '#d95c0a';", f"const filled   = '{filled}';")
    js = js.replace("const unfilled = '#3d2000';", f"const unfilled = '{unfilled}';")
    if play_text:
        # 80s2: play button shows PLAY/PAUSE text instead of HTML entities
        js = js.replace("playBtn.innerHTML = '&#9646;&#9646;';", "playBtn.textContent = 'PAUSE';")
        js = js.replace("playBtn.innerHTML = '&#9654;';",        "playBtn.textContent = 'PLAY';")
    return js

# ─────────────────────────────────────────────────────────────────────────────
# SHARED HTML FRAGMENTS
# ─────────────────────────────────────────────────────────────────────────────

WAVEFORM_BARS = '\n      '.join(['<div class="wave-bar"></div>'] * 14)

SHARED_MODAL = """
<div class="video-modal" id="videoModal">
  <div class="video-modal-inner">
    <button class="video-modal-close" id="videoModalClose">&#10005;</button>
    <p class="video-modal-label">iTunes 30-sec Preview</p>
    <video id="videoPlayer" controls playsinline></video>
  </div>
</div>"""

HLS_CDN = '<script src="https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js"></script>'

# ─────────────────────────────────────────────────────────────────────────────
# 70s2.html — MAXIMALIST SOUL POSTER
# ─────────────────────────────────────────────────────────────────────────────

CSS_70S = """
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg:        #1a0e02;
      --paper:     #f2e4c4;
      --ink:       #1a0e02;
      --burnt:     #c4580a;
      --gold:      #d4a20a;
      --gold-lt:   #f0c840;
      --rust:      #a83210;
      --cream-dk:  #d8c898;
      --muted-ink: #6a4a1a;
      --green-up:  #2a6010;
      --red-down:  #8a1810;
      --live-red:  #cc2010;
    }
    html { scroll-behavior: smooth; }
    body {
      background: var(--bg);
      font-family: 'Teko', sans-serif;
      min-height: 100vh;
      padding: 28px 16px 48px;
    }
    .page-wrap {
      max-width: 860px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 40px;
    }

    /* ── CARD ── */
    .card {
      background: var(--paper);
      color: var(--ink);
      max-width: 420px;
      margin: 0 auto;
      width: 100%;
      padding: 28px 28px 20px;
      border-radius: 2px;
      position: relative;
      box-shadow:
        0 0 0 2px var(--burnt),
        0 0 0 5px var(--paper),
        0 0 0 7px var(--gold),
        10px 10px 40px rgba(0,0,0,.85);
    }
    /* Corner accent squares */
    .card::before, .card::after {
      content: '';
      position: absolute;
      width: 10px; height: 10px;
      background: var(--gold);
    }
    .card::before { top: -4px; left: -4px; }
    .card::after  { bottom: -4px; right: -4px; }

    /* ── LIVE BADGE ── */
    .live-badge {
      position: absolute; top: 14px; right: 14px;
      background: var(--live-red); color: #fff;
      font-family: Teko; font-size: .68rem; font-weight: 600;
      letter-spacing: .15em; text-transform: uppercase;
      padding: 3px 8px; display: flex; align-items: center; gap: 5px;
    }
    .live-dot {
      width: 6px; height: 6px; border-radius: 50%; background: #fff;
      animation: pulse-dot 1.4s ease-in-out infinite;
    }
    @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:.25} }

    /* ── STATION ── */
    .station { text-align: center; margin-bottom: 6px; }
    .station-name {
      font-family: 'Abril Fatface', serif;
      font-size: 2rem; color: var(--burnt); letter-spacing: .02em;
    }
    .station-sub {
      font-family: Teko; font-size: .62rem; font-weight: 300;
      letter-spacing: .28em; text-transform: uppercase;
      color: var(--muted-ink); margin-top: 2px;
    }

    /* ── MEDIA ROW ── */
    .media-row {
      display: flex; align-items: center;
      justify-content: center; gap: 18px;
      margin: 20px 0 16px;
    }
    /* Vinyl record */
    .record-wrap { position: relative; width: 152px; flex-shrink: 0; }
    .record {
      width: 152px; height: 152px; border-radius: 50%;
      background:
        radial-gradient(circle, #3a3a3a 0%, #0e0e0e 16%,
          #1a1a1a 17%, #0a0a0a 30%, #181818 31%, #0d0d0d 43%,
          #1c1c1c 44%, #111 57%, #161616 58%, #0a0a0a 70%,
          #1a1a1a 71%, #0e0e0e 84%, #1c1c1c 85%, #111 100%);
      box-shadow: 0 4px 24px rgba(0,0,0,.75), inset 0 0 0 1px rgba(255,255,255,.04);
      position: relative; cursor: pointer;
    }
    .record-label {
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 54px; height: 54px; border-radius: 50%;
      background: var(--paper); border: 1px solid var(--cream-dk);
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
    }
    .record-label-name {
      font-family: 'Abril Fatface'; font-size: .42rem;
      color: var(--burnt); line-height: 1.1;
    }
    .record-label-fm { font-family: Teko; font-size: .5rem; color: var(--muted-ink); }
    .record-arm {
      position: absolute; top: 6px; right: -10px;
      width: 2px; height: 48px; background: var(--gold);
      transform-origin: top center; transform: rotate(22deg);
      border-radius: 1px;
    }
    @keyframes vinyl-spin { to { transform: rotate(360deg); } }
    #record.spinning { animation: vinyl-spin 2.4s linear infinite; }

    /* Artist photo */
    .artist-photo {
      width: 110px; height: 110px; border-radius: 2px;
      overflow: hidden; flex-shrink: 0;
      box-shadow: 4px 4px 0 var(--cream-dk), 0 8px 20px rgba(0,0,0,.25);
    }
    .artist-photo img { width:100%; height:100%; object-fit:cover; display:block; }
    .artist-photo-placeholder {
      width: 100%; height: 100%;
      background: var(--cream-dk);
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
    }
    .artist-initials {
      font-family: 'Abril Fatface'; font-size: 2rem; color: var(--muted-ink);
    }
    .artist-photo-sub {
      font-family: Teko; font-size: .58rem; color: var(--muted-ink);
      letter-spacing: .1em; text-transform: uppercase; margin-top: 2px;
    }

    /* ── SONG INFO ── */
    .song-info { text-align: center; margin-bottom: 12px; }
    #songTitle {
      font-family: 'Zilla Slab'; font-style: italic; font-weight: 600;
      font-size: 1.4rem; color: var(--ink); line-height: 1.2; margin-bottom: 4px;
    }
    #artistName {
      font-family: Teko; font-weight: 600; font-size: .88rem;
      letter-spacing: .12em; text-transform: uppercase; color: var(--burnt);
    }
    #songYear { font-family: Teko; font-size: .72rem; color: var(--muted-ink); margin-top: 2px; }

    /* ── WAVEFORM ── */
    .waveform {
      display: flex; align-items: flex-end;
      justify-content: center; gap: 3px; height: 36px; margin: 10px 0;
    }
    .wave-bar { width: 4px; border-radius: 2px 2px 0 0; background: var(--burnt); height: 6px; }
    @keyframes wave-bounce { 0%,100%{height:5px} 50%{height:var(--wh,26px)} }
    .waveform.playing .wave-bar { animation: wave-bounce .8s ease-in-out infinite; }
    .waveform.playing .wave-bar:nth-child(1)  {--wh:18px;animation-delay:0s}
    .waveform.playing .wave-bar:nth-child(2)  {--wh:26px;animation-delay:.07s}
    .waveform.playing .wave-bar:nth-child(3)  {--wh:32px;animation-delay:.14s}
    .waveform.playing .wave-bar:nth-child(4)  {--wh:22px;animation-delay:.21s}
    .waveform.playing .wave-bar:nth-child(5)  {--wh:30px;animation-delay:.05s}
    .waveform.playing .wave-bar:nth-child(6)  {--wh:14px;animation-delay:.12s}
    .waveform.playing .wave-bar:nth-child(7)  {--wh:28px;animation-delay:.19s}
    .waveform.playing .wave-bar:nth-child(8)  {--wh:20px;animation-delay:.26s}
    .waveform.playing .wave-bar:nth-child(9)  {--wh:34px;animation-delay:.03s}
    .waveform.playing .wave-bar:nth-child(10) {--wh:16px;animation-delay:.10s}
    .waveform.playing .wave-bar:nth-child(11) {--wh:24px;animation-delay:.17s}
    .waveform.playing .wave-bar:nth-child(12) {--wh:12px;animation-delay:.24s}
    .waveform.playing .wave-bar:nth-child(13) {--wh:28px;animation-delay:.31s}
    .waveform.playing .wave-bar:nth-child(14) {--wh:18px;animation-delay:.08s}

    /* ── CONTROLS ── */
    .controls { display: flex; justify-content: center; margin: 12px 0 8px; }
    #playBtn {
      width: 72px; height: 72px; border-radius: 50%;
      background: var(--burnt); color: #fff; border: none; cursor: pointer;
      font-size: 1.4rem; display: flex; align-items: center; justify-content: center;
      box-shadow: 4px 4px 0 var(--rust), 0 8px 20px rgba(0,0,0,.2);
      transition: transform .1s, box-shadow .1s;
    }
    #playBtn:hover { transform: translate(-1px,-1px); box-shadow: 5px 5px 0 var(--rust); }
    #playBtn:active { transform: translate(2px,2px); box-shadow: 2px 2px 0 var(--rust); }

    /* ── VIDEO BTN ── */
    .video-btn-row { text-align: center; margin-bottom: 8px; min-height: 28px; }
    #videoBtn {
      background: transparent; border: 2px solid var(--burnt); color: var(--burnt);
      font-family: Teko; font-size: .82rem; font-weight: 600; letter-spacing: .1em;
      padding: 4px 16px; cursor: pointer;
      box-shadow: 3px 3px 0 var(--muted-ink); transition: transform .1s;
    }
    #videoBtn:hover { transform: translate(-1px,-1px); }

    /* ── VOLUME ── */
    .volume-row { display: flex; align-items: center; gap: 8px; margin: 8px 0; }
    #speakerIcon { font-size: .95rem; min-width: 20px; }
    #speakerIcon.dim { opacity: .45; }
    #volSlider {
      flex: 1; -webkit-appearance: none; height: 4px;
      border-radius: 2px; outline: none; cursor: pointer;
    }
    #volSlider::-webkit-slider-thumb {
      -webkit-appearance: none; width: 14px; height: 14px;
      border-radius: 50%; background: var(--burnt);
      box-shadow: 1px 1px 0 var(--rust); cursor: pointer;
    }
    #volPct {
      font-family: Teko; font-size: .72rem; color: var(--muted-ink);
      min-width: 36px; text-align: right;
    }

    /* ── DIVIDER ── */
    .divider { position: relative; margin: 14px 0; }
    .divider::before {
      content: ''; display: block;
      border-top: 1px solid var(--cream-dk); margin-bottom: 3px;
    }
    .divider::after {
      content: '◆';
      display: block; text-align: center;
      color: var(--gold); font-size: .7rem;
      line-height: 1;
    }

    /* ── RATING ── */
    .rating-section { text-align: center; margin-bottom: 12px; }
    .rating-label {
      font-family: Teko; font-size: .62rem; letter-spacing: .15em;
      text-transform: uppercase; color: var(--muted-ink); margin-bottom: 8px;
    }
    .rating-btns { display: flex; justify-content: center; gap: 20px; }
    .thumb-btn {
      background: transparent; border: 2px solid var(--cream-dk); color: var(--ink);
      font-size: 1rem; padding: 7px 16px; cursor: pointer;
      display: flex; align-items: center; gap: 6px;
      font-family: Teko; font-size: .82rem;
      transition: border-color .15s, background .15s;
    }
    .thumb-btn:hover { border-color: var(--burnt); }
    .thumb-btn.voted-up   { background: rgba(42,96,16,.1); border-color: var(--green-up); }
    .thumb-btn.voted-down { background: rgba(138,24,16,.1); border-color: var(--red-down); }
    .vote-count { font-family: Teko; font-size: .72rem; color: var(--muted-ink); }
    .vote-count:not(.show) { display: none; }

    /* ── STATUS / FOOTER ── */
    .status-bar {
      font-family: Teko; font-size: .7rem; letter-spacing: .06em;
      color: var(--muted-ink); text-align: center; margin-top: 6px;
    }
    .card-footer {
      font-family: Teko; font-size: .58rem; letter-spacing: .15em;
      text-transform: uppercase; color: var(--cream-dk);
      text-align: center; margin-top: 12px; opacity: .65;
    }

    /* ── COUNTDOWN SECTION ── */
    .countdown-section {
      background: var(--paper); color: var(--ink);
      padding: 32px 28px 28px;
      box-shadow:
        0 0 0 2px var(--burnt),
        0 0 0 5px var(--paper),
        0 0 0 7px var(--gold),
        10px 10px 40px rgba(0,0,0,.85);
    }
    .countdown-header { text-align: center; margin-bottom: 24px; }
    .countdown-title-main {
      font-family: 'Abril Fatface'; font-size: 2.4rem; color: var(--ink); line-height: 1;
    }
    .countdown-title-sub {
      font-family: Teko; font-size: .78rem; font-weight: 700;
      letter-spacing: .3em; text-transform: uppercase; color: var(--burnt); margin-top: 4px;
    }
    .countdown-desc {
      font-family: 'Zilla Slab'; font-style: italic;
      font-size: .78rem; color: var(--muted-ink); margin-top: 5px;
    }

    /* Year buttons */
    .year-btns { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; margin-bottom: 22px; }
    .year-btn {
      font-family: Teko; font-size: .98rem; font-weight: 700; letter-spacing: .04em;
      background: var(--ink); color: var(--paper);
      border: none; padding: 7px 13px; cursor: pointer;
      transition: background .15s;
    }
    .year-btn:hover { background: var(--burnt); }
    .year-btn.active { background: var(--burnt); box-shadow: 3px 3px 0 var(--rust); }

    /* Table wrap */
    .table-wrap { display: none; }
    .table-wrap.visible { display: block; }
    .table-year-bar {
      display: flex; align-items: baseline; gap: 12px; margin-bottom: 14px;
      border-bottom: 3px solid var(--ink); padding-bottom: 8px;
    }
    .table-year-num { font-family: 'Abril Fatface'; font-size: 3rem; color: var(--burnt); line-height: 1; }
    .table-year-label { font-family: Teko; font-size: .72rem; letter-spacing: .18em; text-transform: uppercase; color: var(--muted-ink); }

    /* Table */
    .countdown-table { width: 100%; border-collapse: collapse; }
    .countdown-table thead tr { border-bottom: 2px solid var(--ink); }
    .countdown-table th {
      font-family: Teko; font-size: .7rem; font-weight: 700;
      letter-spacing: .14em; text-transform: uppercase; color: var(--muted-ink);
      padding: 6px 10px; text-align: left;
    }
    .countdown-table th.col-rank { text-align: center; width: 48px; }
    .countdown-table th.col-riaa { text-align: center; }
    .countdown-table tbody tr {
      border-bottom: 1px solid var(--cream-dk); cursor: pointer; transition: background .1s;
    }
    .countdown-table tbody tr:hover { background: rgba(196,88,10,.06); }
    .countdown-table tbody tr.row-selected { background: rgba(212,162,10,.12); }
    .countdown-table td { padding: 9px 10px; vertical-align: middle; }
    .col-rank { text-align: center; }
    .rank-badge {
      font-family: Teko; font-weight: 700; font-size: .9rem;
      display: inline-block; padding: 2px 6px;
    }
    .rank-1   { background: var(--gold-lt); color: var(--ink); }
    .rank-2   { background: var(--cream-dk); color: var(--ink); }
    .rank-3   { background: #c07830; color: var(--paper); }
    .rank-other { color: var(--muted-ink); }
    .td-artist { font-family: Teko; font-weight: 600; font-size: .92rem; color: var(--burnt); }
    .td-song { font-family: 'Zilla Slab'; font-style: italic; font-size: .84rem; color: var(--ink); }
    .td-riaa { text-align: center; }
    .riaa-badge {
      font-family: Teko; font-size: .68rem; font-weight: 600;
      border: 1px solid var(--muted-ink); color: var(--muted-ink);
      padding: 1px 5px; display: inline-block; transform: rotate(-1.5deg);
    }
    .riaa-none { font-family: Teko; font-size: .68rem; color: var(--cream-dk); }
    .profile-link { color: var(--burnt); text-decoration: none; font-size: .68rem; margin-left: 3px; opacity: .6; }
    .profile-link:hover { opacity: 1; }

    /* ── VIDEO MODAL ── */
    .video-modal {
      display: none; position: fixed; inset: 0;
      background: rgba(26,14,2,.93); z-index: 1000;
      align-items: center; justify-content: center;
    }
    .video-modal.open { display: flex; }
    .video-modal-inner {
      background: var(--paper); padding: 24px; position: relative;
      box-shadow: 6px 6px 0 var(--rust), 0 20px 60px rgba(0,0,0,.9);
      max-width: 480px; width: 90%;
    }
    .video-modal-close {
      position: absolute; top: 8px; right: 12px;
      background: none; border: none; font-size: 1.1rem;
      color: var(--muted-ink); cursor: pointer; font-family: Teko; font-weight: 700;
    }
    .video-modal-label { font-family: Teko; font-size: .68rem; letter-spacing: .1em; text-transform: uppercase; color: var(--muted-ink); margin-bottom: 10px; }
    #videoPlayer { width: 100%; display: block; }

    /* ── BACK NAV ── */
    .back-nav { width: 100%; max-width: 420px; margin: 0 auto 12px; }
    .back-btn {
      font-family: Teko; font-size: .85rem; font-weight: 600; letter-spacing: .1em;
      text-transform: uppercase; color: var(--gold); text-decoration: none;
      opacity: .8; transition: opacity .15s;
    }
    .back-btn:hover { opacity: 1; }

    /* ── RESPONSIVE ── */
    @media (max-width: 480px) {
      body { padding: 16px 12px 40px; }
      .card, .countdown-section { padding: 22px 18px 16px; }
      .record-wrap { width: 128px; }
      .record { width: 128px; height: 128px; }
      .artist-photo { width: 92px; height: 92px; }
      #playBtn { width: 62px; height: 62px; font-size: 1.2rem; }
    }
    @media (max-width: 360px) {
      .media-row { flex-direction: column; align-items: center; }
      .record-arm { display: none; }
      .countdown-table th.col-riaa, .countdown-table td.td-riaa { display: none; }
      .year-btn { font-size: .86rem; padding: 6px 10px; }
    }
"""

HTML_BODY_70S = """<div class="page-wrap">
  <div class="back-nav"><a href="billboard70_99.html" class="back-btn">&#8592; All Decades</a></div>
  <div class="card">
    <div class="live-badge"><div class="live-dot"></div>LIVE</div>
    <div class="station">
      <div class="station-name">SOUL FM</div>
      <div class="station-sub">Billboard Hot 100 &middot; The 1970s</div>
    </div>
    <div class="media-row">
      <div class="record-wrap">
        <div class="record" id="record">
          <div class="record-label">
            <div class="record-label-name">SOUL</div>
            <div class="record-label-fm">FM</div>
          </div>
        </div>
        <div class="record-arm"></div>
      </div>
      <div class="artist-photo" id="artistPhotoWrap">
        <img id="artistImg" src="" alt="" style="display:none">
        <div class="artist-photo-placeholder" id="artistPlaceholder">
          <div class="artist-initials" id="artistInitials"></div>
          <div class="artist-photo-sub">Artist</div>
        </div>
      </div>
    </div>
    <div class="song-info">
      <div id="songTitle">Select a song to preview</div>
      <div id="artistName"></div>
      <div id="songYear"></div>
    </div>
    <div class="waveform" id="waveform">
      <div class="wave-bar"></div><div class="wave-bar"></div>
      <div class="wave-bar"></div><div class="wave-bar"></div>
      <div class="wave-bar"></div><div class="wave-bar"></div>
      <div class="wave-bar"></div><div class="wave-bar"></div>
      <div class="wave-bar"></div><div class="wave-bar"></div>
      <div class="wave-bar"></div><div class="wave-bar"></div>
      <div class="wave-bar"></div><div class="wave-bar"></div>
    </div>
    <div class="controls">
      <button class="state-play" id="playBtn">&#9654;</button>
    </div>
    <div class="video-btn-row">
      <button id="videoBtn" style="display:none">&#9654; Video</button>
    </div>
    <div class="volume-row">
      <span id="speakerIcon">&#128266;</span>
      <input type="range" id="volSlider" min="0" max="1" step="0.01" value="1">
      <span id="volPct">100%</span>
    </div>
    <div class="divider"></div>
    <div class="rating-section">
      <div class="rating-label">Rate this song</div>
      <div class="rating-btns">
        <button class="thumb-btn" id="thumbUp">&#128077; <span class="vote-count" id="upCount"></span></button>
        <button class="thumb-btn" id="thumbDown">&#128078; <span class="vote-count" id="downCount"></span></button>
      </div>
    </div>
    <div class="status-bar" id="status">Tune in &middot; Select a song to preview</div>
    <div class="card-footer">Billboard &middot; Top 100 &middot; 1970&ndash;1979</div>
  </div>

  <section class="countdown-section">
    <div class="countdown-header">
      <div class="countdown-title-main">BILLBOARD</div>
      <div class="countdown-title-sub">Top 100 Countdown</div>
      <div class="countdown-desc">Year-end Hot 100 &middot; 1970 to 1979</div>
    </div>
    <div class="year-btns">
      <button class="year-btn" data-year="1970">1970</button>
      <button class="year-btn" data-year="1971">1971</button>
      <button class="year-btn" data-year="1972">1972</button>
      <button class="year-btn" data-year="1973">1973</button>
      <button class="year-btn" data-year="1974">1974</button>
      <button class="year-btn" data-year="1975">1975</button>
      <button class="year-btn" data-year="1976">1976</button>
      <button class="year-btn" data-year="1977">1977</button>
      <button class="year-btn" data-year="1978">1978</button>
      <button class="year-btn" data-year="1979">1979</button>
    </div>
    <div class="table-wrap" id="tableWrap">
      <div class="table-year-bar">
        <span class="table-year-num" id="tableYearNum"></span>
        <span class="table-year-label">Billboard Year-End Hot 100</span>
      </div>
      <table class="countdown-table">
        <thead><tr>
          <th class="col-rank">#</th>
          <th>Artist</th>
          <th>Song</th>
          <th class="col-riaa">RIAA</th>
        </tr></thead>
        <tbody id="countdownBody"></tbody>
      </table>
    </div>
  </section>
</div>"""

# ─────────────────────────────────────────────────────────────────────────────
# 80s2.html — BRUTALIST NEON GRID
# ─────────────────────────────────────────────────────────────────────────────

CSS_80S = """
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg:        #000;
      --surface:   #0a0a0a;
      --grid:      #1c1c1c;
      --magenta:   #ff0066;
      --cyan:      #00ffcc;
      --white:     #f0f0f0;
      --dim:       #555;
      --green-up:  #00ff66;
      --red-down:  #ff3300;
    }
    html { scroll-behavior: smooth; }
    body {
      background: var(--bg);
      color: var(--white);
      font-family: 'Share Tech Mono', monospace;
      min-height: 100vh;
      padding: 20px 14px 48px;
    }
    .page-wrap {
      max-width: 900px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 28px;
    }

    /* ── CARD ── */
    .card {
      max-width: 460px; margin: 0 auto; width: 100%;
      background: var(--surface);
      border: 1px solid var(--magenta);
      box-shadow: 4px 4px 0 var(--magenta);
      position: relative;
    }

    /* ── CARD HEADER ── */
    .card-header {
      display: grid; grid-template-columns: 1fr auto;
      align-items: center; padding: 14px 18px;
      border-bottom: 1px solid var(--grid);
    }
    .station-name { line-height: 1; }
    .name-line1 {
      font-family: 'Black Han Sans', sans-serif;
      font-size: .65rem; color: var(--magenta);
      letter-spacing: .22em; text-transform: uppercase; display: block;
    }
    .name-line2 {
      font-family: 'Black Han Sans', sans-serif;
      font-size: 2.4rem; color: var(--white); display: block; line-height: .9;
    }

    /* ── LIVE BADGE ── */
    .live-badge {
      display: flex; align-items: center; gap: 5px;
      background: var(--magenta); color: #000;
      font-family: 'Share Tech Mono'; font-size: .6rem; letter-spacing: .1em;
      padding: 4px 10px;
    }
    .live-dot {
      width: 6px; height: 6px; border-radius: 50%; background: #000;
      animation: pulse-dot 1.4s ease-in-out infinite;
    }
    @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:.2} }

    /* ── MEDIA ROW ── */
    .media-row {
      display: grid; grid-template-columns: auto 1fr;
      align-items: center;
      border-bottom: 1px solid var(--grid);
    }

    /* Cassette */
    .cassette {
      width: 176px; height: 108px;
      background: #0a0a0a;
      border: 1px solid var(--magenta);
      box-shadow: 4px 4px 0 var(--magenta);
      position: relative; flex-shrink: 0; margin: 14px;
      overflow: hidden;
    }
    .cassette-label {
      position: absolute; top: 9px; left: 9px; right: 9px; height: 34px;
      background: #000; border: 1px solid var(--cyan);
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
    }
    .cassette-label-title {
      font-family: 'Black Han Sans'; font-size: .58rem; color: var(--white); letter-spacing: .08em;
    }
    .cassette-label-sub {
      font-family: 'Share Tech Mono'; font-size: .4rem; color: var(--dim);
    }
    .cassette-window {
      position: absolute; bottom: 10px; left: 9px; right: 9px; height: 40px;
      background: #000; border: 1px solid var(--grid);
      display: flex; align-items: center; justify-content: space-around; overflow: hidden;
    }
    .reel {
      width: 28px; height: 28px; border-radius: 50%;
      background: repeating-conic-gradient(#222 0deg 60deg, transparent 60deg 120deg);
      border: 2px solid var(--grid); position: relative; flex-shrink: 0;
    }
    .reel::after {
      content: ''; position: absolute; inset: 7px; border-radius: 50%;
      background: #111; border: 1px solid var(--dim);
    }
    .tape-strip {
      width: 36%; height: 3px; background: var(--magenta);
    }
    .screw {
      position: absolute; width: 7px; height: 7px;
      border-radius: 50%; background: #111; border: 1px solid var(--dim);
    }
    .screw-tl { top: 3px; left: 3px; }
    .screw-tr { top: 3px; right: 3px; }
    .screw-bl { bottom: 3px; left: 3px; }
    .screw-br { bottom: 3px; right: 3px; }
    @keyframes reel-spin { to { transform: rotate(360deg); } }
    #record.spinning .reel { animation: reel-spin 1.2s linear infinite; }

    /* Artist photo area */
    .media-info { padding: 14px; display: flex; gap: 12px; align-items: flex-start; }
    .artist-photo {
      width: 84px; height: 84px; flex-shrink: 0;
      border: 1px solid var(--cyan); overflow: hidden;
    }
    .artist-photo img { width:100%; height:100%; object-fit:cover; display:block; }
    .artist-photo-placeholder {
      width:100%; height:100%; background:#111;
      display:flex; flex-direction:column; align-items:center; justify-content:center;
    }
    .artist-initials { font-family:'Black Han Sans'; font-size:1.8rem; color:var(--cyan); }
    .artist-photo-sub { font-family:'Share Tech Mono'; font-size:.45rem; color:var(--dim); }
    .song-info { flex: 1; min-width: 0; }
    #songTitle {
      font-family:'Barlow Condensed'; font-weight:900; font-size:1.25rem;
      color:var(--white); line-height:1.1; margin-bottom:5px;
    }
    #artistName { font-family:'Share Tech Mono'; font-size:.65rem; color:var(--cyan); margin-top:3px; }
    #songYear { font-family:'Share Tech Mono'; font-size:.6rem; color:var(--dim); margin-top:2px; }

    /* ── WAVEFORM ── */
    .waveform {
      display: flex; align-items: flex-end; gap: 3px;
      height: 30px; padding: 8px 18px;
      border-top: 1px solid var(--grid);
    }
    .wave-bar { width: 2px; background: var(--cyan); height: 5px; }
    @keyframes wave-bounce { 0%,100%{height:4px} 50%{height:var(--wh,22px)} }
    .waveform.playing .wave-bar { animation: wave-bounce .8s ease-in-out infinite; }
    .waveform.playing .wave-bar:nth-child(1)  {--wh:14px;animation-delay:0s}
    .waveform.playing .wave-bar:nth-child(2)  {--wh:22px;animation-delay:.07s}
    .waveform.playing .wave-bar:nth-child(3)  {--wh:26px;animation-delay:.14s}
    .waveform.playing .wave-bar:nth-child(4)  {--wh:16px;animation-delay:.21s}
    .waveform.playing .wave-bar:nth-child(5)  {--wh:24px;animation-delay:.05s}
    .waveform.playing .wave-bar:nth-child(6)  {--wh:10px;animation-delay:.12s}
    .waveform.playing .wave-bar:nth-child(7)  {--wh:22px;animation-delay:.19s}
    .waveform.playing .wave-bar:nth-child(8)  {--wh:14px;animation-delay:.26s}
    .waveform.playing .wave-bar:nth-child(9)  {--wh:26px;animation-delay:.03s}
    .waveform.playing .wave-bar:nth-child(10) {--wh:12px;animation-delay:.10s}
    .waveform.playing .wave-bar:nth-child(11) {--wh:18px;animation-delay:.17s}
    .waveform.playing .wave-bar:nth-child(12) {--wh:8px;animation-delay:.24s}
    .waveform.playing .wave-bar:nth-child(13) {--wh:22px;animation-delay:.31s}
    .waveform.playing .wave-bar:nth-child(14) {--wh:14px;animation-delay:.08s}

    /* ── PLAY BUTTON — FULL WIDTH RECT ── */
    .controls { border-top: 1px solid var(--grid); }
    #playBtn {
      width: 100%; height: 50px;
      background: var(--magenta); color: #000; border: none; cursor: pointer;
      font-family: 'Barlow Condensed'; font-weight: 900;
      font-size: 1.4rem; letter-spacing: .1em;
      transition: background .1s, color .1s;
    }
    #playBtn:hover { background: var(--cyan); color: #000; }
    #playBtn:active { background: #fff; color: #000; }

    /* ── VIDEO BTN ── */
    .video-btn-row { border-top: 1px solid var(--grid); padding: 8px 18px; min-height: 38px; }
    #videoBtn {
      background: transparent; border: 1px solid var(--cyan); color: var(--cyan);
      font-family: 'Barlow Condensed'; font-weight: 700; font-size: .82rem;
      letter-spacing: .08em; padding: 4px 14px; cursor: pointer;
      transition: background .1s;
    }
    #videoBtn:hover { background: rgba(0,255,204,.1); }

    /* ── VOLUME ── */
    .volume-row {
      display: flex; align-items: center; gap: 10px; padding: 8px 18px;
      border-top: 1px solid var(--grid);
    }
    #speakerIcon { font-size: .85rem; }
    #speakerIcon.dim { opacity: .4; }
    #volSlider {
      flex: 1; -webkit-appearance: none; height: 3px; outline: none; cursor: pointer;
    }
    #volSlider::-webkit-slider-thumb {
      -webkit-appearance: none; width: 12px; height: 12px;
      background: var(--magenta); cursor: pointer;
    }
    #volPct { font-family:'Share Tech Mono'; font-size:.65rem; color:var(--dim); min-width:36px; text-align:right; }

    /* ── RATING ── */
    .rating-section {
      border-top: 1px solid var(--grid); padding: 8px 18px;
      display: flex; align-items: center; gap: 14px;
    }
    .rating-label { font-family:'Share Tech Mono'; font-size:.58rem; color:var(--dim); flex:1; }
    .rating-btns { display: flex; gap: 8px; }
    .thumb-btn {
      background: transparent; border: 1px solid var(--grid); color: var(--white);
      font-size: .95rem; padding: 5px 12px; cursor: pointer;
      display: flex; align-items: center; gap: 5px;
      font-family: 'Barlow Condensed'; font-weight: 700;
      transition: border-color .15s, background .15s;
    }
    .thumb-btn:hover { border-color: var(--cyan); }
    .thumb-btn.voted-up   { border-color: var(--green-up); background: rgba(0,255,102,.08); }
    .thumb-btn.voted-down { border-color: var(--red-down); background: rgba(255,51,0,.08); }
    .vote-count { font-family:'Share Tech Mono'; font-size:.6rem; color:var(--dim); }
    .vote-count:not(.show) { display:none; }

    /* ── STATUS / FOOTER ── */
    .status-bar { border-top:1px solid var(--grid); padding:7px 18px; font-family:'Share Tech Mono'; font-size:.62rem; color:var(--dim); }
    .card-footer { border-top:1px solid var(--grid); padding:5px 18px; font-family:'Share Tech Mono'; font-size:.52rem; color:#333; text-align:right; }

    /* ── COUNTDOWN ── */
    .countdown-section { background: var(--surface); border: 1px solid var(--grid); }
    .countdown-header { padding: 22px 26px 14px; border-bottom: 1px solid var(--grid); }
    .countdown-title-main { font-family:'Black Han Sans'; font-size:2.2rem; color:var(--white); line-height:.95; }
    .countdown-title-sub  { font-family:'Black Han Sans'; font-size:2.2rem; color:var(--magenta); line-height:.95; }
    .countdown-desc { font-family:'Share Tech Mono'; font-size:.58rem; color:var(--dim); margin-top:8px; letter-spacing:.04em; }

    /* Year buttons */
    .year-btns { display: flex; border-bottom: 1px solid var(--grid); }
    .year-btn {
      flex: 1; font-family:'Barlow Condensed'; font-weight:700; font-size:.85rem;
      background: transparent; color: var(--dim);
      border: none; border-right: 1px solid var(--grid);
      padding: 9px 3px; cursor: pointer; text-align: center;
      transition: color .12s, background .12s;
    }
    .year-btn:last-child { border-right: none; }
    .year-btn:hover { color: var(--white); background: rgba(255,255,255,.03); }
    .year-btn.active { background: var(--magenta); color: #000; }

    /* Table wrap */
    .table-wrap { display: none; }
    .table-wrap.visible { display: block; }
    .table-year-bar { display:flex; align-items:baseline; gap:10px; padding:14px 20px 10px; border-bottom:1px solid var(--grid); }
    .table-year-num { font-family:'Barlow Condensed'; font-weight:900; font-size:2.8rem; color:var(--magenta); line-height:1; }
    .table-year-label { font-family:'Share Tech Mono'; font-size:.58rem; color:var(--dim); }

    /* Table */
    .countdown-table { width:100%; border-collapse:collapse; }
    .countdown-table thead tr { border-bottom:1px solid var(--grid); }
    .countdown-table th {
      font-family:'Barlow Condensed'; font-weight:700; font-size:.66rem; letter-spacing:.1em;
      text-transform:uppercase; color:var(--dim);
      padding:8px 12px; text-align:left; border-right:1px solid var(--grid);
    }
    .countdown-table th:last-child { border-right:none; }
    .countdown-table th.col-rank { text-align:center; width:50px; }
    .countdown-table th.col-riaa { text-align:center; }
    .countdown-table tbody tr { border-bottom:1px solid var(--grid); cursor:pointer; transition:background .1s; }
    .countdown-table tbody tr:hover { background:rgba(255,0,102,.05); }
    .countdown-table tbody tr.row-selected { background:rgba(0,255,204,.05); outline:1px solid var(--cyan); }
    .countdown-table td { padding:10px 12px; vertical-align:middle; border-right:1px solid var(--grid); }
    .countdown-table td:last-child { border-right:none; }
    .col-rank { text-align:center; }
    .rank-badge { font-family:'Barlow Condensed'; font-weight:900; font-size:1rem; }
    .rank-1    { color:var(--magenta); }
    .rank-2    { color:var(--cyan); }
    .rank-3    { color:var(--white); }
    .rank-other { color:var(--dim); font-size:.85rem; }
    .td-artist { font-family:'Barlow Condensed'; font-weight:700; font-size:.95rem; color:var(--white); }
    .td-song   { font-family:'Barlow Condensed'; font-weight:400; font-size:.88rem; color:var(--dim); }
    .td-riaa { text-align:center; }
    .riaa-badge { font-family:'Share Tech Mono'; font-size:.6rem; color:var(--cyan); }
    .riaa-none  { font-family:'Share Tech Mono'; font-size:.6rem; color:var(--grid); }
    .profile-link { color:var(--magenta); text-decoration:none; font-size:.62rem; margin-left:3px; opacity:.6; }
    .profile-link:hover { opacity:1; }

    /* ── VIDEO MODAL ── */
    .video-modal { display:none; position:fixed; inset:0; background:rgba(0,0,0,.96); z-index:1000; align-items:center; justify-content:center; }
    .video-modal.open { display:flex; }
    .video-modal-inner { background:var(--surface); padding:20px; position:relative; border:1px solid var(--magenta); box-shadow:4px 4px 0 var(--magenta); max-width:480px; width:90%; }
    .video-modal-close { position:absolute; top:7px; right:10px; background:none; border:none; font-family:'Barlow Condensed'; font-size:1.2rem; color:var(--magenta); cursor:pointer; font-weight:900; }
    .video-modal-label { font-family:'Share Tech Mono'; font-size:.58rem; color:var(--dim); margin-bottom:10px; letter-spacing:.04em; }
    #videoPlayer { width:100%; display:block; }

    /* ── BACK NAV ── */
    .back-nav { width: 100%; max-width: 420px; margin: 0 auto 10px; }
    .back-btn {
      font-family: 'Barlow Condensed'; font-size: .8rem; font-weight: 700; letter-spacing: .12em;
      text-transform: uppercase; color: var(--cyan); text-decoration: none;
      opacity: .8; transition: opacity .15s;
    }
    .back-btn:hover { opacity: 1; }

    /* ── RESPONSIVE ── */
    @media (max-width: 480px) {
      body { padding: 10px 8px 40px; }
      .cassette { width: 148px; height: 90px; }
    }
    @media (max-width: 360px) {
      .media-row { grid-template-columns: 1fr; }
      .cassette { width: 100%; height: 80px; margin: 8px; }
      .countdown-table th.col-riaa, .countdown-table td.td-riaa { display: none; }
    }
"""

HTML_BODY_80S = """<div class="page-wrap">
  <div class="back-nav"><a href="billboard70_99.html" class="back-btn">&#8592; All Decades</a></div>
  <div class="card">
    <div class="card-header">
      <div class="station-name">
        <span class="name-line1">POWER</span>
        <span class="name-line2">80s</span>
      </div>
      <div class="live-badge"><div class="live-dot"></div>LIVE</div>
    </div>
    <div class="media-row">
      <div class="cassette" id="record">
        <div class="cassette-label">
          <div class="cassette-label-title">POWER 80s</div>
          <div class="cassette-label-sub">SIDE A &middot; 46 MIN</div>
        </div>
        <div class="cassette-window">
          <div class="reel"></div>
          <div class="tape-strip"></div>
          <div class="reel"></div>
        </div>
        <div class="screw screw-tl"></div>
        <div class="screw screw-tr"></div>
        <div class="screw screw-bl"></div>
        <div class="screw screw-br"></div>
      </div>
      <div class="media-info">
        <div class="artist-photo" id="artistPhotoWrap">
          <img id="artistImg" src="" alt="" style="display:none">
          <div class="artist-photo-placeholder" id="artistPlaceholder">
            <div class="artist-initials" id="artistInitials"></div>
            <div class="artist-photo-sub">Artist</div>
          </div>
        </div>
        <div class="song-info">
          <div id="songTitle">Select a track</div>
          <div id="artistName"></div>
          <div id="songYear"></div>
        </div>
      </div>
    </div>
    <div class="waveform" id="waveform">
      <div class="wave-bar"></div><div class="wave-bar"></div>
      <div class="wave-bar"></div><div class="wave-bar"></div>
      <div class="wave-bar"></div><div class="wave-bar"></div>
      <div class="wave-bar"></div><div class="wave-bar"></div>
      <div class="wave-bar"></div><div class="wave-bar"></div>
      <div class="wave-bar"></div><div class="wave-bar"></div>
      <div class="wave-bar"></div><div class="wave-bar"></div>
    </div>
    <div class="controls">
      <button class="state-play" id="playBtn">PLAY</button>
    </div>
    <div class="video-btn-row">
      <button id="videoBtn" style="display:none">&#9654; VIDEO</button>
    </div>
    <div class="volume-row">
      <span id="speakerIcon">&#128266;</span>
      <input type="range" id="volSlider" min="0" max="1" step="0.01" value="1">
      <span id="volPct">100%</span>
    </div>
    <div class="rating-section">
      <div class="rating-label">// RATE THIS TRACK</div>
      <div class="rating-btns">
        <button class="thumb-btn" id="thumbUp">&#128077; <span class="vote-count" id="upCount"></span></button>
        <button class="thumb-btn" id="thumbDown">&#128078; <span class="vote-count" id="downCount"></span></button>
      </div>
    </div>
    <div class="status-bar" id="status">// READY _ SELECT A TRACK</div>
    <div class="card-footer">BILLBOARD &middot; HOT 100 &middot; 1980&ndash;1989</div>
  </div>

  <section class="countdown-section">
    <div class="countdown-header">
      <div class="countdown-title-main">BILLBOARD</div>
      <div class="countdown-title-sub">COUNTDOWN</div>
      <div class="countdown-desc">// YEAR-END HOT 100 &middot; 1980 TO 1989</div>
    </div>
    <div class="year-btns">
      <button class="year-btn" data-year="1980">1980</button>
      <button class="year-btn" data-year="1981">1981</button>
      <button class="year-btn" data-year="1982">1982</button>
      <button class="year-btn" data-year="1983">1983</button>
      <button class="year-btn" data-year="1984">1984</button>
      <button class="year-btn" data-year="1985">1985</button>
      <button class="year-btn" data-year="1986">1986</button>
      <button class="year-btn" data-year="1987">1987</button>
      <button class="year-btn" data-year="1988">1988</button>
      <button class="year-btn" data-year="1989">1989</button>
    </div>
    <div class="table-wrap" id="tableWrap">
      <div class="table-year-bar">
        <span class="table-year-num" id="tableYearNum"></span>
        <span class="table-year-label">// BILLBOARD YEAR-END HOT 100</span>
      </div>
      <table class="countdown-table">
        <thead><tr>
          <th class="col-rank">#</th>
          <th>Artist</th>
          <th>Song</th>
          <th class="col-riaa">RIAA</th>
        </tr></thead>
        <tbody id="countdownBody"></tbody>
      </table>
    </div>
  </section>
</div>"""

# ─────────────────────────────────────────────────────────────────────────────
# 90s2.html — EDITORIAL SWISS-GRID
# ─────────────────────────────────────────────────────────────────────────────

CSS_90S = """
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg:        #f0ece2;
      --surface:   #ffffff;
      --ink:       #0a0a14;
      --indigo:    #2d1fff;
      --indigo-lt: #6655ff;
      --rust:      #d92b0a;
      --muted:     #6a6a7a;
      --rule:      #d0ccc0;
      --cd-silver: #c8c8d0;
      --green-up:  #0a7a30;
      --red-down:  #d92b0a;
    }
    html { scroll-behavior: smooth; }
    body {
      background: var(--bg);
      color: var(--ink);
      font-family: 'Fira Sans Condensed', sans-serif;
      min-height: 100vh;
      padding: 32px 20px 56px;
    }
    .page-wrap {
      max-width: 880px; margin: 0 auto;
      display: flex; flex-direction: column; gap: 40px;
    }

    /* ── CARD ── */
    .card {
      max-width: 480px; margin: 0 auto; width: 100%;
      background: var(--surface);
      border-left: 6px solid var(--indigo);
      box-shadow: 0 2px 0 var(--rule), 4px 8px 24px rgba(0,0,0,.10);
      padding: 32px 28px 24px; position: relative;
    }

    /* ── LIVE BADGE ── */
    .live-badge {
      position: absolute; top: 20px; right: 28px;
      background: var(--rust); color: #fff;
      font-family: 'Fira Mono'; font-size: .52rem; letter-spacing: .08em; text-transform: uppercase;
      padding: 3px 7px; display: flex; align-items: center; gap: 5px;
    }
    .live-dot {
      width: 5px; height: 5px; border-radius: 50%; background: #fff;
      animation: pulse-dot 1.4s ease-in-out infinite;
    }
    @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:.2} }

    /* ── STATION ── */
    .station { margin-bottom: 22px; }
    .station-eyebrow {
      font-family: 'Fira Sans Condensed'; font-size: .68rem; font-weight: 600;
      letter-spacing: .28em; text-transform: uppercase; color: var(--muted);
      display: block; margin-bottom: 0;
    }
    .station-numeral {
      font-family: 'Syne'; font-weight: 800;
      font-size: 5rem; line-height: .82; color: var(--ink); display: block;
    }
    .station-sub-line {
      font-family: 'Fira Mono'; font-size: .58rem; color: var(--muted); margin-top: 6px;
    }

    /* ── MEDIA ROW ── */
    .media-row { display: flex; align-items: center; gap: 18px; margin-bottom: 18px; }

    /* Compact Disc */
    .cd {
      width: 148px; height: 148px; border-radius: 50%; flex-shrink: 0; position: relative;
      background: radial-gradient(circle at 50%, #e4e4ec 0%, #c8c8d4 40%, #a8a8b8 70%, #b4b4c0 100%);
      box-shadow: 2px 4px 16px rgba(0,0,0,.18), inset 0 0 0 1px rgba(255,255,255,.3);
      transform: rotate(8deg);
      transition: transform .6s ease;
    }
    .cd::after {
      content: ''; position: absolute; inset: 0; border-radius: 50%;
      background: conic-gradient(
        from 0deg,
        rgba(45,31,255,.1) 0deg, rgba(0,200,100,.07) 60deg,
        rgba(217,43,10,.09) 120deg, rgba(255,200,0,.07) 180deg,
        rgba(45,31,255,.1) 240deg, rgba(0,200,100,.05) 300deg,
        rgba(45,31,255,.1) 360deg);
      mix-blend-mode: screen;
    }
    .cd::before {
      content: ''; position: absolute; inset: 0; border-radius: 50%;
      background: radial-gradient(circle at 35% 30%, rgba(255,255,255,.3) 0%, transparent 55%);
      z-index: 1;
    }
    .cd-hub {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
      width: 22px; height: 22px; border-radius: 50%; z-index: 2;
      background: var(--ink); border: 4px solid var(--cd-silver);
    }
    .cd-label {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
      width: 64px; height: 64px; border-radius: 50%;
      background: var(--surface); border: 1px solid var(--rule);
      display: flex; align-items: center; justify-content: center; z-index: 1;
    }
    .cd-label-text { font-family:'Syne'; font-weight:800; font-size:.48rem; color:var(--ink); letter-spacing:.04em; }
    @keyframes cd-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    #record.spinning { animation: cd-spin 1.8s linear infinite; }
    #record:not(.spinning) { transform: rotate(8deg); transition: transform .6s ease; }

    /* Artist photo */
    .artist-photo {
      width: 118px; height: 118px; flex-shrink: 0; overflow: hidden;
    }
    .artist-photo img { width:100%; height:100%; object-fit:cover; display:block; }
    .artist-photo-placeholder {
      width:100%; height:100%; background:var(--rule);
      display:flex; flex-direction:column; align-items:center; justify-content:center;
    }
    .artist-initials { font-family:'Syne'; font-weight:800; font-size:2.2rem; color:var(--muted); }
    .artist-photo-sub { font-family:'Fira Mono'; font-size:.52rem; color:var(--muted); margin-top:3px; }

    /* ── SONG INFO ── */
    .song-info { margin-bottom: 14px; }
    #songTitle {
      font-family:'Fraunces'; font-style:italic; font-weight:600; font-size:1.5rem;
      color:var(--ink); line-height:1.15; margin-bottom:5px; letter-spacing:-.01em;
    }
    #artistName {
      font-family:'Fira Sans Condensed'; font-weight:600; font-size:.82rem;
      letter-spacing:.1em; text-transform:uppercase; color:var(--muted);
    }
    #songYear { font-family:'Fira Mono'; font-size:.66rem; color:var(--rule); margin-top:2px; }

    /* ── WAVEFORM ── */
    .waveform { display:flex; align-items:flex-end; gap:3px; height:30px; margin:10px 0; }
    .wave-bar { width:3px; border-radius:1px; background:var(--indigo); height:5px; }
    @keyframes wave-bounce { 0%,100%{height:4px} 50%{height:var(--wh,24px)} }
    .waveform.playing .wave-bar { animation: wave-bounce .85s ease-in-out infinite; }
    .waveform.playing .wave-bar:nth-child(1)  {--wh:14px;animation-delay:0s}
    .waveform.playing .wave-bar:nth-child(2)  {--wh:22px;animation-delay:.07s}
    .waveform.playing .wave-bar:nth-child(3)  {--wh:28px;animation-delay:.14s}
    .waveform.playing .wave-bar:nth-child(4)  {--wh:16px;animation-delay:.21s}
    .waveform.playing .wave-bar:nth-child(5)  {--wh:24px;animation-delay:.05s}
    .waveform.playing .wave-bar:nth-child(6)  {--wh:10px;animation-delay:.12s}
    .waveform.playing .wave-bar:nth-child(7)  {--wh:26px;animation-delay:.19s}
    .waveform.playing .wave-bar:nth-child(8)  {--wh:18px;animation-delay:.26s}
    .waveform.playing .wave-bar:nth-child(9)  {--wh:28px;animation-delay:.03s}
    .waveform.playing .wave-bar:nth-child(10) {--wh:12px;animation-delay:.10s}
    .waveform.playing .wave-bar:nth-child(11) {--wh:20px;animation-delay:.17s}
    .waveform.playing .wave-bar:nth-child(12) {--wh:8px;animation-delay:.24s}
    .waveform.playing .wave-bar:nth-child(13) {--wh:24px;animation-delay:.31s}
    .waveform.playing .wave-bar:nth-child(14) {--wh:16px;animation-delay:.08s}

    /* ── CONTROLS ROW (play + volume on same row) ── */
    .controls-row { display:flex; align-items:center; gap:16px; margin:12px 0 8px; }
    #playBtn {
      width:52px; height:52px; border-radius:50%; flex-shrink:0;
      background:var(--indigo); color:#fff; border:none; cursor:pointer;
      font-size:1.15rem; display:flex; align-items:center; justify-content:center;
      transition:background .15s, transform .1s;
    }
    #playBtn:hover { background:var(--indigo-lt); }
    #playBtn:active { transform:scale(.94); }
    .volume-row { display:flex; align-items:center; gap:7px; flex:1; }
    #speakerIcon { font-size:.82rem; }
    #speakerIcon.dim { opacity:.4; }
    #volSlider {
      flex:1; -webkit-appearance:none; height:3px; outline:none; cursor:pointer;
    }
    #volSlider::-webkit-slider-thumb {
      -webkit-appearance:none; width:12px; height:12px;
      border-radius:50%; background:var(--indigo); cursor:pointer;
    }
    #volPct { font-family:'Fira Mono'; font-size:.6rem; color:var(--muted); min-width:34px; text-align:right; }

    /* ── VIDEO BTN ── */
    .video-btn-row { margin-bottom:8px; min-height:26px; }
    #videoBtn {
      background:transparent; border:none; border-bottom:2px solid var(--indigo);
      color:var(--indigo); font-family:'Fira Sans Condensed'; font-weight:600; font-size:.8rem;
      padding:3px 0; cursor:pointer; letter-spacing:.04em; transition:opacity .15s;
    }
    #videoBtn:hover { opacity:.7; }

    /* ── DIVIDER ── */
    .divider { border:none; border-top:1px solid var(--rule); margin:12px 0; }

    /* ── RATING ── */
    .rating-section { display:flex; align-items:center; gap:18px; margin-bottom:12px; }
    .rating-label { font-family:'Fira Mono'; font-size:.58rem; color:var(--muted); flex:1; }
    .rating-btns { display:flex; gap:10px; }
    .thumb-btn {
      background:transparent; border:none; color:var(--ink);
      font-size:1.1rem; padding:4px 6px; cursor:pointer;
      display:flex; align-items:center; gap:4px; transition:opacity .15s;
    }
    .thumb-btn:hover { opacity:.7; }
    .thumb-btn.voted-up   { color:var(--green-up); }
    .thumb-btn.voted-down { color:var(--red-down); }
    .vote-count { font-family:'Fira Mono'; font-size:.6rem; color:var(--indigo); }
    .vote-count:not(.show) { display:none; }

    /* ── STATUS / FOOTER ── */
    .status-bar { font-family:'Fira Mono'; font-size:.62rem; color:var(--muted); margin-bottom:6px; }
    .card-footer { font-family:'Fira Mono'; font-size:.52rem; color:var(--rule); margin-top:8px; border-top:1px solid var(--rule); padding-top:9px; }

    /* ── COUNTDOWN ── */
    .countdown-section { }
    .countdown-header { margin-bottom:18px; }
    .countdown-eyebrow { font-family:'Fira Sans Condensed'; font-size:.65rem; font-weight:600; letter-spacing:.24em; text-transform:uppercase; color:var(--muted); display:block; margin-bottom:2px; }
    .countdown-title { font-family:'Syne'; font-weight:800; font-size:3rem; color:var(--ink); line-height:.9; display:block; }
    .countdown-title-lo { font-family:'Fira Sans Condensed'; font-size:.65rem; color:var(--muted); letter-spacing:.2em; text-transform:uppercase; display:block; margin-top:6px; }

    /* Year buttons — ghost underline */
    .year-btns { display:flex; flex-wrap:wrap; gap:2px; margin-bottom:26px; border-bottom:1px solid var(--rule); padding-bottom:14px; }
    .year-btn {
      background:transparent; border:none; border-bottom:2px solid transparent;
      color:var(--muted); font-family:'Syne'; font-weight:700; font-size:.98rem;
      padding:4px 8px 5px; cursor:pointer; margin-bottom:-1px;
      transition:color .12s, border-color .12s;
    }
    .year-btn:hover { color:var(--ink); }
    .year-btn.active { border-bottom-color:var(--indigo); color:var(--ink); }

    /* Table year bar as left sidebar */
    .table-wrap { display:none; }
    .table-wrap.visible { display:block; }
    .table-year-bar { display:grid; grid-template-columns:80px 1fr; gap:14px; align-items:start; margin-bottom:18px; }
    .table-year-num { font-family:'Syne'; font-weight:800; font-size:4rem; color:var(--indigo); line-height:1; }
    .table-year-label { font-family:'Fira Mono'; font-size:.58rem; color:var(--muted); padding-top:8px; }

    /* Table */
    .countdown-table { width:100%; border-collapse:collapse; }
    .countdown-table thead tr { border-bottom:2px solid var(--ink); }
    .countdown-table th {
      font-family:'Fira Sans Condensed'; font-size:.65rem; font-weight:600;
      letter-spacing:.14em; text-transform:uppercase; color:var(--muted);
      padding:6px 10px 8px; text-align:left;
    }
    .countdown-table th.col-rank { text-align:center; width:48px; }
    .countdown-table th.col-riaa { text-align:center; }
    .countdown-table tbody tr { border-bottom:1px solid var(--rule); cursor:pointer; transition:background .1s; }
    .countdown-table tbody tr:hover { background:rgba(45,31,255,.04); }
    .countdown-table tbody tr.row-selected { background:rgba(45,31,255,.06); border-left:3px solid var(--indigo); }
    .countdown-table td { padding:10px; vertical-align:middle; }
    .col-rank { text-align:center; }
    .rank-badge { font-family:'Syne'; font-weight:800; font-size:.98rem; }
    .rank-1    { color:var(--indigo); font-size:1.08rem; }
    .rank-2, .rank-3 { color:var(--ink); }
    .rank-other { color:var(--muted); font-size:.82rem; font-family:'Fira Mono'; }
    .td-artist { font-family:'Fira Sans Condensed'; font-weight:600; font-size:.92rem; color:var(--ink); }
    .td-song { font-family:'Fraunces'; font-style:italic; font-weight:300; font-size:.85rem; color:var(--muted); }
    .td-riaa { text-align:center; }
    .riaa-badge { font-family:'Fira Mono'; font-size:.6rem; color:var(--indigo); }
    .riaa-none  { font-family:'Fira Mono'; font-size:.6rem; color:var(--rule); }
    .profile-link { color:var(--indigo); text-decoration:none; font-size:.62rem; margin-left:4px; opacity:.6; }
    .profile-link:hover { opacity:1; }

    /* ── VIDEO MODAL ── */
    .video-modal { display:none; position:fixed; inset:0; background:rgba(10,10,20,.86); z-index:1000; align-items:center; justify-content:center; }
    .video-modal.open { display:flex; }
    .video-modal-inner { background:var(--surface); padding:24px; position:relative; border-left:6px solid var(--indigo); box-shadow:0 24px 80px rgba(0,0,0,.25); max-width:480px; width:90%; }
    .video-modal-close { position:absolute; top:8px; right:12px; background:none; border:none; font-size:.95rem; color:var(--muted); cursor:pointer; font-family:'Fira Mono'; }
    .video-modal-label { font-family:'Fira Mono'; font-size:.58rem; color:var(--muted); margin-bottom:10px; }
    #videoPlayer { width:100%; display:block; }

    /* ── BACK NAV ── */
    .back-nav { width: 100%; max-width: 480px; margin: 0 auto 12px; }
    .back-btn {
      font-family: 'Fira Mono'; font-size: .72rem; letter-spacing: .06em;
      text-transform: uppercase; color: var(--indigo); text-decoration: none;
      opacity: .8; transition: opacity .15s;
    }
    .back-btn:hover { opacity: 1; }

    /* ── RESPONSIVE ── */
    @media (max-width: 480px) {
      body { padding: 20px 14px 44px; }
      .station-numeral { font-size: 3.5rem; }
      .card { border-left-width: 4px; padding: 24px 18px 18px; }
      .cd { width: 118px; height: 118px; }
      .artist-photo { width: 96px; height: 96px; }
    }
    @media (max-width: 360px) {
      .media-row { flex-direction: column; align-items: flex-start; }
      .countdown-table th.col-riaa, .countdown-table td.td-riaa { display: none; }
      .year-btn { font-size:.86rem; padding:4px 5px; }
      .table-year-num { font-size: 3rem; }
    }
"""

HTML_BODY_90S = """<div class="page-wrap">
  <div class="back-nav"><a href="billboard70_99.html" class="back-btn">&#8592; All Decades</a></div>
  <div class="card">
    <div class="live-badge"><div class="live-dot"></div>Live</div>
    <div class="station">
      <span class="station-eyebrow">Altitude</span>
      <span class="station-numeral">99</span>
    </div>
    <div class="station-sub-line">Billboard Hot 100 &middot; The 1990s</div>
    <div class="media-row">
      <div class="cd" id="record">
        <div class="cd-label"><div class="cd-label-text">ALT99</div></div>
        <div class="cd-hub"></div>
      </div>
      <div class="artist-photo" id="artistPhotoWrap">
        <img id="artistImg" src="" alt="" style="display:none">
        <div class="artist-photo-placeholder" id="artistPlaceholder">
          <div class="artist-initials" id="artistInitials"></div>
          <div class="artist-photo-sub">Artist</div>
        </div>
      </div>
    </div>
    <div class="song-info">
      <div id="songTitle">Select a song</div>
      <div id="artistName"></div>
      <div id="songYear"></div>
    </div>
    <div class="waveform" id="waveform">
      <div class="wave-bar"></div><div class="wave-bar"></div>
      <div class="wave-bar"></div><div class="wave-bar"></div>
      <div class="wave-bar"></div><div class="wave-bar"></div>
      <div class="wave-bar"></div><div class="wave-bar"></div>
      <div class="wave-bar"></div><div class="wave-bar"></div>
      <div class="wave-bar"></div><div class="wave-bar"></div>
      <div class="wave-bar"></div><div class="wave-bar"></div>
    </div>
    <div class="controls-row">
      <button class="state-play" id="playBtn">&#9654;</button>
      <div class="volume-row">
        <span id="speakerIcon">&#128266;</span>
        <input type="range" id="volSlider" min="0" max="1" step="0.01" value="1">
        <span id="volPct">100%</span>
      </div>
    </div>
    <div class="video-btn-row">
      <button id="videoBtn" style="display:none">&#9654; Video Preview</button>
    </div>
    <div class="divider"></div>
    <div class="rating-section">
      <div class="rating-label">Rate this song</div>
      <div class="rating-btns">
        <button class="thumb-btn" id="thumbUp">&#128077; <span class="vote-count" id="upCount"></span></button>
        <button class="thumb-btn" id="thumbDown">&#128078; <span class="vote-count" id="downCount"></span></button>
      </div>
    </div>
    <div class="status-bar" id="status">Select a song to preview</div>
    <div class="card-footer">Billboard &middot; Top 100 &middot; 1990&ndash;1999</div>
  </div>

  <section class="countdown-section">
    <div class="countdown-header">
      <span class="countdown-eyebrow">Billboard</span>
      <span class="countdown-title">Top 100</span>
      <span class="countdown-title-lo">Countdown &middot; 1990 to 1999</span>
    </div>
    <div class="year-btns">
      <button class="year-btn" data-year="1990">1990</button>
      <button class="year-btn" data-year="1991">1991</button>
      <button class="year-btn" data-year="1992">1992</button>
      <button class="year-btn" data-year="1993">1993</button>
      <button class="year-btn" data-year="1994">1994</button>
      <button class="year-btn" data-year="1995">1995</button>
      <button class="year-btn" data-year="1996">1996</button>
      <button class="year-btn" data-year="1997">1997</button>
      <button class="year-btn" data-year="1998">1998</button>
      <button class="year-btn" data-year="1999">1999</button>
    </div>
    <div class="table-wrap" id="tableWrap">
      <div class="table-year-bar">
        <div class="table-year-num" id="tableYearNum"></div>
        <div class="table-year-label">Billboard Year-End Hot 100</div>
      </div>
      <table class="countdown-table">
        <thead><tr>
          <th class="col-rank">#</th>
          <th>Artist</th>
          <th>Song</th>
          <th class="col-riaa">RIAA</th>
        </tr></thead>
        <tbody id="countdownBody"></tbody>
      </table>
    </div>
  </section>
</div>"""

# ─────────────────────────────────────────────────────────────────────────────
# artist2.html — DARK EDITORIAL / ART DECO NEWSPAPER
# ─────────────────────────────────────────────────────────────────────────────

CSS_ARTIST = """
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg:         #0c0b09;
      --surface:    #121110;
      --surface2:   #1c1a16;
      --rule:       #2a2620;
      --sepia:      #c8a050;
      --sepia-lt:   #e0c070;
      --sepia-dk:   #8a6820;
      --ink:        #f0ece0;
      --ink-muted:  #8a8070;
      --ink-dim:    #4a4438;
      --green:      #4a8030;
      --radius:     2px;
    }
    html { scroll-behavior: smooth; }
    body {
      font-family: 'IBM Plex Serif', serif;
      background: var(--bg);
      color: var(--ink);
      min-height: 100vh;
    }

    /* ── MASTHEAD ── */
    .header {
      position: sticky; top: 0; z-index: 100;
      display: flex; align-items: center;
      padding: 0 32px;
      height: 52px;
      background: var(--bg);
      border-bottom: 3px solid var(--sepia);
      gap: 16px;
    }
    .header::before, .header::after {
      content: '';
      position: absolute; left: 32px; right: 32px;
      height: 1px; background: var(--sepia);
    }
    .header::before { top: 8px; }
    .header::after  { bottom: 8px; }
    .back-btn {
      position: relative; z-index: 1;
      font-family: 'IBM Plex Mono'; font-size: .7rem; color: var(--ink-muted);
      text-decoration: none; letter-spacing: .06em;
      padding: 3px 8px; border: 1px solid var(--rule);
      transition: color .18s, border-color .18s;
    }
    .back-btn:hover { color: var(--sepia); border-color: var(--sepia); }
    .header-brand {
      position: relative; z-index: 1;
      font-family: 'Playfair Display'; font-weight: 700;
      font-size: .82rem; letter-spacing: .25em; text-transform: uppercase; color: var(--sepia);
      flex: 1; text-align: center;
    }
    .decade-badge {
      position: relative; z-index: 1;
      font-family: 'IBM Plex Mono'; font-size: .62rem; color: var(--ink-dim);
      letter-spacing: .08em;
    }

    /* ── HERO ── */
    .hero {
      position: relative; min-height: 280px;
      display: flex; align-items: flex-end;
      padding: 56px 40px 36px; overflow: hidden;
    }
    .hero-bg-base { position:absolute; inset:0; background:linear-gradient(135deg,#1a1204 0%,#0c0b09 50%,#060808 100%); }
    .hero-bg-art { position:absolute; inset:0; background-size:cover; background-position:center; opacity:0; filter:blur(40px); transition:opacity .5s; }
    .hero-bg-art.ready { opacity:.14; }
    .hero-gradient { position:absolute; inset:0; background:linear-gradient(to top,var(--bg) 0%,transparent 65%); }
    .hero-content {
      position: relative; z-index: 2;
      display: grid; grid-template-columns: 200px 1fr; gap: 40px;
      align-items: end; width: 100%; max-width: 1100px; margin: 0 auto;
    }
    .hero-art {
      width: 200px; height: 200px; overflow: hidden; flex-shrink: 0;
      border: 1px solid var(--rule);
      box-shadow: 4px 4px 0 var(--sepia-dk);
      display: flex; align-items: center; justify-content: center;
      background: var(--surface2);
    }
    .hero-art img { width:100%; height:100%; object-fit:cover; display:block; }
    .hero-art-initials {
      font-family:'Playfair Display'; font-weight:900; font-style:italic;
      font-size: 56px; color: var(--sepia); line-height: 1;
    }
    .hero-text { min-width: 0; }
    .hero-eyebrow {
      font-family:'IBM Plex Mono'; font-size:.62rem; letter-spacing:.18em;
      text-transform:uppercase; color:var(--sepia); margin-bottom:10px; display:block;
    }
    .hero-name {
      font-family:'Playfair Display'; font-weight:900;
      font-size:clamp(28px,5vw,58px); line-height:1; letter-spacing:-.01em;
      margin-bottom:12px; text-transform:uppercase;
    }
    .hero-song-line {
      font-family:'IBM Plex Serif'; font-size:.95rem; color:var(--ink-muted);
      font-style:italic; display:flex; align-items:center; gap:8px; flex-wrap:wrap;
    }
    .year-pill {
      display:inline-block; padding:2px 9px; font-style:normal;
      font-family:'IBM Plex Mono'; font-size:.62rem; color:var(--sepia);
      border:1px solid var(--sepia-dk);
    }

    /* ── MAIN ── */
    .main { max-width:1100px; margin:0 auto; padding:40px 40px 80px; }

    /* Loading */
    .loading-screen {
      display:flex; align-items:center; justify-content:center;
      padding:80px 32px; color:var(--ink-muted); font-family:'IBM Plex Mono'; font-size:.72rem; gap:10px;
    }
    .spinner {
      width:16px; height:16px; border:2px solid var(--rule);
      border-top-color:var(--sepia); border-radius:50%;
      animation:spin .7s linear infinite; flex-shrink:0;
    }
    @keyframes spin { to{transform:rotate(360deg)} }

    /* ── STATS ROW (pull-quote grid) ── */
    .stats-row {
      display:grid; grid-template-columns:repeat(6,1fr);
      border:1px solid var(--rule); margin-bottom:36px;
    }
    .stat-card {
      padding:20px 12px 16px; text-align:center;
      border-right:1px solid var(--rule);
    }
    .stat-card:last-child { border-right:none; }
    .stat-num {
      font-family:'IBM Plex Mono'; font-weight:600; font-size:2.4rem;
      color:var(--sepia); line-height:1; margin-bottom:7px;
      font-variant-numeric:tabular-nums;
    }
    .stat-num.sm { font-size:1.6rem; }
    .stat-lbl {
      font-family:'Playfair Display'; font-style:italic; font-weight:700;
      font-size:.68rem; color:var(--ink-muted); line-height:1.4;
    }

    /* ── HIGHLIGHTS ── */
    .highlight-row {
      display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr));
      gap:1px; background:var(--rule); margin-bottom:36px;
    }
    .hl-card { background:var(--surface); padding:16px 18px; }
    .hl-label {
      font-family:'IBM Plex Mono'; font-size:.58rem; letter-spacing:.1em;
      text-transform:uppercase; color:var(--sepia); margin-bottom:7px;
    }
    .hl-song {
      font-family:'Playfair Display'; font-weight:700; font-style:italic;
      font-size:.95rem; color:var(--ink); margin-bottom:4px;
      overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
    }
    .hl-meta { font-family:'IBM Plex Mono'; font-size:.6rem; color:var(--ink-muted); }

    /* ── SECTION HEADERS ── */
    .section-hd {
      display:flex; align-items:center; gap:14px; margin-bottom:14px;
    }
    .section-hd-text {
      font-family:'IBM Plex Mono'; font-size:.6rem; letter-spacing:.12em;
      text-transform:uppercase; color:var(--sepia); white-space:nowrap;
    }
    .section-hd-line { flex:1; height:1px; background:var(--sepia-dk); }

    /* ── TWO COLUMN LAYOUT ── */
    .two-col { display:grid; grid-template-columns:1fr 320px; gap:28px; margin-bottom:36px; }
    @media (max-width:680px) { .two-col { grid-template-columns:1fr; } }

    /* ── PANEL (selected song + bio) ── */
    .panel { background:var(--surface); border:1px solid var(--sepia); overflow:hidden; }
    .panel-head {
      padding:13px 18px; border-bottom:1px solid var(--rule);
      display:flex; align-items:center; gap:8px;
    }
    .panel-dot { width:5px; height:5px; border-radius:50%; background:var(--sepia); flex-shrink:0; }
    .panel-title {
      font-family:'IBM Plex Mono'; font-size:.62rem; letter-spacing:.1em;
      text-transform:uppercase; color:var(--sepia);
    }
    .panel-body { padding:16px 18px; }
    .info-row {
      display:flex; align-items:center; justify-content:space-between;
      padding:9px 0; border-bottom:1px solid var(--rule); gap:12px;
    }
    .info-row:last-child { border-bottom:none; }
    .info-key { font-family:'IBM Plex Mono'; font-size:.65rem; color:var(--ink-muted); flex-shrink:0; }
    .info-val { font-family:'IBM Plex Serif'; font-size:.82rem; font-weight:600; text-align:right; }

    /* Position badges */
    .pos-badge { display:inline-flex; align-items:center; gap:4px; padding:2px 9px; font-family:'IBM Plex Mono'; font-size:.7rem; font-weight:600; }
    .pos-1   { color:var(--sepia); border:1px solid var(--sepia-dk); }
    .pos-5   { color:#4a8030; border:1px solid rgba(74,128,48,.3); }
    .pos-10  { color:#4a7080; border:1px solid rgba(74,112,128,.3); }
    .pos-any { color:var(--ink-muted); border:1px solid var(--rule); }
    .star-flag { color:var(--sepia); font-size:.7rem; margin-left:3px; }

    /* ── BIOGRAPHY ── */
    .bio-text {
      font-family:'IBM Plex Serif'; font-size:.88rem; line-height:1.9;
      color:var(--ink-muted); text-align:justify; hyphens:auto;
    }
    .bio-source { margin-top:10px; font-family:'IBM Plex Mono'; font-size:.58rem; color:var(--ink-dim); }
    .bio-source a { color:var(--sepia); text-decoration:none; }
    .bio-source a:hover { text-decoration:underline; }

    /* ── TABLE WRAP ── */
    .table-wrap {
      background:var(--surface); border:1px solid var(--rule);
      overflow:hidden; margin-bottom:36px;
    }
    .ht { width:100%; border-collapse:collapse; }
    .ht thead th {
      padding:10px 14px; font-family:'IBM Plex Mono'; font-size:.58rem; font-weight:600;
      text-transform:uppercase; letter-spacing:.1em; color:var(--sepia);
      border-bottom:1px solid var(--sepia-dk); text-align:left;
      background:var(--surface2);
    }
    .ht tbody tr { transition:background .12s; }
    .ht tbody tr:hover { background:rgba(255,255,255,.02); }
    .ht tbody tr.selected { background:rgba(200,160,80,.06); border-left:2px solid var(--sepia); }
    .ht tbody td {
      padding:10px 14px; font-size:.82rem;
      border-bottom:1px solid var(--rule); vertical-align:middle;
    }
    .ht tbody tr:last-child td { border-bottom:none; }
    .rk {
      display:inline-flex; align-items:center; justify-content:center;
      width:28px; height:28px;
      font-family:'IBM Plex Mono'; font-size:.7rem; font-weight:600;
    }
    .rk-1   { color:var(--sepia); }
    .rk-5   { color:var(--green); }
    .rk-10  { color:#4a7080; }
    .rk-any { color:var(--ink-dim); }
    .song-cell { font-family:'IBM Plex Serif'; font-weight:600; max-width:260px; }
    .song-cell.cur { color:var(--sepia); }
    .cur-tag { font-family:'IBM Plex Mono'; font-size:.58rem; color:var(--ink-dim); margin-left:6px; }
    .yr-chip {
      display:inline-block; padding:1px 7px; font-family:'IBM Plex Mono'; font-size:.62rem;
      color:var(--ink-muted); background:var(--surface2); margin:1px 2px 1px 0;
    }
    .riaa-chip {
      display:inline-block; padding:1px 8px; font-family:'IBM Plex Mono'; font-size:.62rem;
      color:var(--green); border:1px solid rgba(74,128,48,.2);
    }

    /* ── RESPONSIVE ── */
    @media (max-width: 580px) {
      .header { padding: 0 16px; }
      .hero { padding: 36px 16px 24px; }
      .hero-content { grid-template-columns: 1fr; gap: 16px; }
      .hero-art { width: 100px; height: 100px; }
      .hero-name { font-size: 28px; }
      .main { padding: 24px 16px 60px; }
      .stats-row { grid-template-columns: repeat(3,1fr); }
      .ht tbody td, .ht thead th { padding: 8px 10px; }
      .bio-text { text-align: left; hyphens: none; }
    }
    @media (max-width: 360px) {
      .stats-row { grid-template-columns: repeat(2,1fr); }
      .hero-name { font-size: 22px; }
    }
"""

HTML_ARTIST = """<header class="header">
  <a class="back-btn" href="javascript:history.back()">&#8592; Back</a>
  <span class="header-brand">Billboard Radio</span>
  <span class="decade-badge" id="decadeBadge"></span>
</header>

<div class="hero">
  <div class="hero-bg-base"></div>
  <div class="hero-bg-art" id="heroBgArt"></div>
  <div class="hero-gradient"></div>
  <div class="hero-content">
    <div class="hero-art" id="heroArt">
      <div class="hero-art-initials" id="heroInitials"></div>
    </div>
    <div class="hero-text">
      <span class="hero-eyebrow">Artist Profile</span>
      <div class="hero-name" id="heroArtist"></div>
      <div class="hero-song-line" id="heroSongLine"></div>
    </div>
  </div>
</div>

<main class="main" id="main">
  <div class="loading-screen"><div class="spinner"></div>Loading profile&hellip;</div>
</main>"""

# ─────────────────────────────────────────────────────────────────────────────
# Build functions
# ─────────────────────────────────────────────────────────────────────────────

def make_decade_html(title, fonts_url, css, body_html, js, modal=SHARED_MODAL, hls=HLS_CDN, css_file=None, js_file=None):
    if css_file:
        styles = f'  <link rel="stylesheet" href="{css_file}">'
    else:
        styles = f'  <style>\n{css}\n  </style>'
    if js_file:
        script_block = f'<script src="{js_file}"></script>'
    else:
        script_block = f'<script>\n{js}\n</script>'
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <link href="{fonts_url}" rel="stylesheet">
{styles}
</head>
<body>
{body_html}
{modal}
{hls}
{script_block}
</body>
</html>"""

def make_artist_html(css, body_html, js):
    fonts = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=IBM+Plex+Serif:ital,wght@0,400;0,600;1,400&family=IBM+Plex+Mono:wght@400;600&display=swap"
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Artist Profile | Billboard Radio</title>
  <link href="{fonts}" rel="stylesheet">
  <style>
{css}
  </style>
</head>
<body>
{body_html}
<script>
{js}
</script>
</body>
</html>"""

# ─────────────────────────────────────────────────────────────────────────────
# Generate all files
# ─────────────────────────────────────────────────────────────────────────────

FONTS_70S = "https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Teko:wght@300;400;600;700&family=Zilla+Slab:ital,wght@0,400;0,600;1,400&display=swap"
FONTS_80S = "https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Barlow+Condensed:wght@300;400;700;900&family=Share+Tech+Mono&display=swap"
FONTS_90S = "https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;1,9..144,300;1,9..144,600&family=Fira+Sans+Condensed:wght@400;600&family=Fira+Mono:wght@400;500&display=swap"

# 70s2.html — CSS and JS in separate files
js70 = patch_js(read_js('70s.js'), '#c4580a', '#d8c898')
write_css('70s2.css', CSS_70S)
write_html('70s2.js', js70)
write_html('70s2.html', make_decade_html("Soul FM — 1970s Live Radio", FONTS_70S, None, HTML_BODY_70S, None, css_file='70s2.css', js_file='70s2.js'))

# 80s2.html — CSS and JS in separate files
js80 = patch_js(read_js('80s.js'), '#ff0066', '#1c1c1c', play_text=True)
write_css('80s2.css', CSS_80S)
write_html('80s2.js', js80)
write_html('80s2.html', make_decade_html("Power 80s — 1980s Live Radio", FONTS_80S, None, HTML_BODY_80S, None, css_file='80s2.css', js_file='80s2.js'))

# 90s2.html — CSS and JS in separate files
js90 = patch_js(read_js('90s.js'), '#2d1fff', '#d0ccc0')
write_css('90s2.css', CSS_90S)
write_html('90s2.js', js90)
write_html('90s2.html', make_decade_html("Altitude 99 — 1990s Live Radio", FONTS_90S, None, HTML_BODY_90S, None, css_file='90s2.css', js_file='90s2.js'))

# artist2.html — extract just the JS from artist.html
with open(f'{PUB}/artist.html', 'r', encoding='utf-8') as f:
    artist_src = f.read()
# Pull the JS between <script> and </script> tags (last script block)
js_match = re.search(r'<script>\n([\s\S]+?)\n</script>', artist_src)
artist_js = js_match.group(1) if js_match else ''
write_html('artist2.html', make_artist_html(CSS_ARTIST, HTML_ARTIST, artist_js))

print("Done!")
