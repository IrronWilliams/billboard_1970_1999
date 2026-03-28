const STREAM = 'https://d3d4yli4hf5bmh.cloudfront.net/hls/live.m3u8';

const audio     = new Audio();
const record    = document.getElementById('record');
const waveform  = document.getElementById('waveform');
const playBtn   = document.getElementById('playBtn');
const statusEl  = document.getElementById('status');
const volSlider = document.getElementById('volSlider');
const volPct    = document.getElementById('volPct');
const speakerEl = document.getElementById('speakerIcon');
const thumbUp   = document.getElementById('thumbUp');
const thumbDown = document.getElementById('thumbDown');
const upCount   = document.getElementById('upCount');
const downCount = document.getElementById('downCount');

let isPlaying = false;
let hlsReady  = false;
let upVotes   = 0;
let downVotes = 0;
let userVote  = null; // 'up' | 'down' | null

// ── HLS INIT ──
(function initHls() {
  if (typeof Hls !== 'undefined' && Hls.isSupported()) {
    const hls = new Hls({ enableWorker: true });
    hls.loadSource(STREAM);
    hls.attachMedia(audio);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      hlsReady = true;
      setStatus('Signal acquired — ready');
    });
    hls.on(Hls.Events.ERROR, (_, data) => {
      if (data.fatal) setStatus('Signal lost — retrying...');
    });
  } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
    audio.src = STREAM;
    hlsReady  = true;
    setStatus('Signal acquired — ready');
  } else {
    setStatus('HLS not supported in this browser');
  }
})();

// ── PLAY / PAUSE ──
playBtn.addEventListener('click', () => {
  if (!hlsReady) { setStatus('Loading signal...'); return; }
  if (isPlaying) {
    audio.pause();
    setPlayState(false);
  } else {
    audio.play()
      .then(() => setPlayState(true))
      .catch(() => setStatus('Playback blocked — try again'));
  }
});

function setPlayState(playing) {
  isPlaying = playing;
  if (playing) {
    playBtn.innerHTML = '&#9646;&#9646;';
    playBtn.classList.replace('state-play', 'state-pause');
    record.classList.add('spinning');
    waveform.classList.add('playing');
    setStatus('Live &bull; On air now');
  } else {
    playBtn.innerHTML = '&#9654;';
    playBtn.classList.replace('state-pause', 'state-play');
    record.classList.remove('spinning');
    waveform.classList.remove('playing');
    setStatus('Paused');
  }
}

// ── VOLUME ──
function syncVolume() {
  const v   = parseFloat(volSlider.value);
  const pct = Math.round(v * 100);
  audio.volume = v;
  volPct.textContent = pct + '%';

  // Neon pink fill on track
  volSlider.style.background =
    `linear-gradient(90deg, #ff1a75 ${pct}%, #20084a ${pct}%)`;

  // Speaker icon dims at low volume
  if (pct === 0) {
    speakerEl.textContent = '🔇';
    speakerEl.classList.add('dim');
  } else if (pct < 35) {
    speakerEl.textContent = '🔉';
    speakerEl.classList.add('dim');
  } else {
    speakerEl.textContent = '🔊';
    speakerEl.classList.remove('dim');
  }
}

volSlider.addEventListener('input', () => {
  audio.muted = false;
  syncVolume();
});
speakerEl.addEventListener('click', () => {
  audio.muted = !audio.muted;
  if (audio.muted) {
    speakerEl.textContent = '🔇';
    speakerEl.classList.add('dim');
  } else {
    syncVolume();
  }
});
syncVolume();

// ── RATING ──
thumbUp.addEventListener('click', () => {
  if (userVote === 'up') {
    upVotes--;
    userVote = null;
    thumbUp.classList.remove('voted-up');
  } else {
    if (userVote === 'down') {
      downVotes = Math.max(0, downVotes - 1);
      thumbDown.classList.remove('voted-down');
    }
    upVotes++;
    userVote = 'up';
    thumbUp.classList.add('voted-up');
  }
  renderVotes();
});

thumbDown.addEventListener('click', () => {
  if (userVote === 'down') {
    downVotes--;
    userVote = null;
    thumbDown.classList.remove('voted-down');
  } else {
    if (userVote === 'up') {
      upVotes = Math.max(0, upVotes - 1);
      thumbUp.classList.remove('voted-up');
    }
    downVotes++;
    userVote = 'down';
    thumbDown.classList.add('voted-down');
  }
  renderVotes();
});

function renderVotes() {
  upCount.textContent   = upVotes;
  downCount.textContent = downVotes;
  upCount.classList.toggle('show',   upVotes   > 0);
  downCount.classList.toggle('show', downVotes > 0);
}

function setStatus(msg) { statusEl.innerHTML = msg; }
