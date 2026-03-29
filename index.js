const express = require('express');
const fs      = require('fs');
const path    = require('path');
const db = require('./db');

// ── CSV helper ──────────────────────────────────────────────────────────────
function parseCSVLine(line) {
  const fields = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { inQ = !inQ; }
    else if (c === ',' && !inQ) { fields.push(cur); cur = ''; }
    else { cur += c; }
  }
  fields.push(cur);
  return fields;
}

// ── Weekly chart data (Billboard1970-1999_Detail_Remote.csv) ────────────────
// Columns: url,WeekID,Week Position,Song,Performer,SongID,Instance,
//          Previous Week Position,Peak Position,Weeks on Chart,Year
//
// PERF_INDEX: normName → { rawName, songs: Map<normSong, { rawSong, rows[] }> }
// where each row = { weekPos, weekId, weeksOnChart, instance, year }
//
// Artist names in this CSV differ from the year-end CSV used in the decade JS
// files (e.g. "Daryl Hall John Oates" vs "Daryl Hall and John Oates").
// We normalise both the query and the stored name by stripping connector words
// so they match regardless of "and"/"&"/omission.

const CONN = new Set(['and', 'the', 'feat', 'featuring', 'ft', 'with', 'vs']);

function normPerf(s) {
  return s.toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ').trim()
    .split(/\s+/).filter(w => w && !CONN.has(w))
    .join('');
}

function normSong(s) {
  // Strip trailing parenthetical subtitles before normalizing so that
  // "Two Steps Behind" matches "Two Steps Behind (From \"Last Action Hero\")".
  // The `|| s` fallback keeps songs whose entire title is parenthetical
  // (e.g. "(I Can't Get No) Satisfaction") intact.
  const stripped = s.replace(/\s*\([^)]*\)\s*$/, '').trim() || s;
  return stripped.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function weekIdToMs(weekId) {
  try {
    const [datePart] = weekId.split(' ');
    const [m, d, y]  = datePart.split('/').map(Number);
    return new Date(y, m - 1, d).getTime();
  } catch { return 0; }
}

function fmtWeekDate(weekId) {
  // "1/22/1983 0:00" → "January 22, 1983"
  try {
    const [datePart] = weekId.split(' ');
    const [m, d, y]  = datePart.split('/').map(Number);
    return new Date(y, m - 1, d)
      .toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  } catch { return weekId; }
}

const PERF_INDEX = new Map();

try {
  const raw   = fs.readFileSync('/app/chartdata/Billboard1970-1999_Detail_Remote.csv', 'latin1');
  const lines = raw.split('\n');
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const f = parseCSVLine(line);
    if (f.length < 11) continue;
    const performer    = f[4].trim();
    const song         = f[3].trim();
    const weekPos      = parseInt(f[2],  10);
    const weekId       = f[1].trim();
    const instance     = parseInt(f[6] || '1', 10) || 1;
    const weeksOnChart = parseInt(f[9],  10);
    const year         = parseInt(f[10], 10);
    if (!performer || !song || isNaN(weekPos) || isNaN(year)) continue;

    const np = normPerf(performer);
    const ns = normSong(song);

    if (!PERF_INDEX.has(np)) PERF_INDEX.set(np, { rawName: performer, songs: new Map() });
    const pe = PERF_INDEX.get(np);
    if (!pe.songs.has(ns))   pe.songs.set(ns, { rawSong: song, rows: [] });
    pe.songs.get(ns).rows.push({ weekPos, weekId, weeksOnChart, instance, year });
  }
  let totalRows = 0;
  PERF_INDEX.forEach(p => p.songs.forEach(s => { totalRows += s.rows.length; }));
  console.log(`Weekly chart data loaded: ${PERF_INDEX.size} artists, ${totalRows} entries`);
} catch (e) {
  console.warn('Weekly chart data unavailable:', e.message);
}

// ── Abbreviation alias detection ─────────────────────────────────────────────
// Detects artist name variants where one form uses per-word initials in place of
// a full band-name suffix, e.g. "Prince And The N.P.G." ↔
// "Prince And The New Power Generation".
//
// Algorithm: for pairs sharing the same first token, find the common prefix
// of their token arrays, then check whether the diverging suffix of one entry
// consists of single-letter tokens that are initials of the other's suffix words.

function tokensForAlias(rawName) {
  return rawName.toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ').trim()
    .split(/\s+/).filter(w => w && !CONN.has(w));
}

function couldBeInitials(short, long) {
  if (short.length !== long.length) return false;
  return short.every((t, i) => t.length === 1 && long[i].startsWith(t));
}

const ALIAS_MAP = new Map(); // normKey → Set<normKey>

(function buildAliasMap() {
  const entries = [];
  PERF_INDEX.forEach((pe, key) => entries.push({ key, tokens: tokensForAlias(pe.rawName) }));

  // Group by first token so we only compare entries that share a leading word
  const byFirst = new Map();
  for (const e of entries) {
    const f = e.tokens[0] || '';
    if (!byFirst.has(f)) byFirst.set(f, []);
    byFirst.get(f).push(e);
  }

  byFirst.forEach(group => {
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const { key: ki, tokens: ti } = group[i];
        const { key: kj, tokens: tj } = group[j];
        if (ti.length !== tj.length) continue;
        let pfx = 0;
        while (pfx < ti.length && ti[pfx] === tj[pfx]) pfx++;
        if (pfx === 0) continue;
        const ri = ti.slice(pfx);
        const rj = tj.slice(pfx);
        // Require at least 2 suffix tokens to avoid single-letter false positives
        // (e.g. "Timmy T." and "Timmy Thomas" are different people, not an alias)
        if (ri.length < 2) continue;
        if (couldBeInitials(ri, rj) || couldBeInitials(rj, ri)) {
          if (!ALIAS_MAP.has(ki)) ALIAS_MAP.set(ki, new Set([ki]));
          if (!ALIAS_MAP.has(kj)) ALIAS_MAP.set(kj, new Set([kj]));
          ALIAS_MAP.get(ki).add(kj);
          ALIAS_MAP.get(kj).add(ki);
          console.log(`Artist alias: "${PERF_INDEX.get(ki).rawName}" ↔ "${PERF_INDEX.get(kj).rawName}"`);
        }
      }
    }
  });
})();

function getAliasedEntries(np) {
  const keys = ALIAS_MAP.has(np) ? [...ALIAS_MAP.get(np)] : [np];
  return keys.map(k => PERF_INDEX.get(k)).filter(Boolean);
}

// ── Express ──────────────────────────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ── ALBUM ART ────────────────────────────────────────────────────────────────
// Connector words that appear in CSV artist names but are often dropped or
// replaced with "&" in filenames, and vice-versa.
const CONNECTORS = new Set(['and', 'the', 'feat', 'featuring', 'ft', 'with', 'vs']);

function normalizeForMatch(s) {
  return s.toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ').trim()
    .split(/\s+/).filter(w => w && !CONNECTORS.has(w))
    .join('');
}

// Walks the filename word by word, accumulating tokens, until the accumulation
// equals the needle or overshoots it.
function artistMatches(artist, filename) {
  const needle = normalizeForMatch(artist);
  if (!needle) return false;
  const base  = filename.replace(/\.jpe?g$/i, '');
  const words = base.toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ').trim()
    .split(/\s+/).filter(w => w && !CONNECTORS.has(w));
  let acc = '';
  for (const w of words) {
    acc += w;
    if (acc === needle) return true;
    if (acc.length >= needle.length) return false;
  }
  return false;
}

app.get('/api/albumart', (req, res) => {
  const { artist, year } = req.query;
  if (!artist) return res.status(400).json({ error: 'artist required' });

  const base = '/app/albumart';
  let allDirs;
  try {
    allDirs = fs.readdirSync(base).filter(d => /^\d{4}$/.test(d)).sort();
  } catch {
    return res.status(404).json({ error: 'albumart folder not found' });
  }

  let yearDirs = allDirs;
  if (year) {
    const ds = Math.floor(parseInt(year, 10) / 10) * 10;
    const de = ds + 9;
    yearDirs  = [
      ...allDirs.filter(d => +d >= ds && +d <= de),
      ...allDirs.filter(d => +d <  ds || +d >  de)
    ];
  }

  const candidates = [artist];
  if (/^the\s+/i.test(artist)) candidates.push(artist.replace(/^the\s+/i, ''));
  const andIdx = artist.search(/\s+and\s+/i);
  if (andIdx > 0) candidates.push(artist.slice(0, andIdx).trim());

  for (const name of candidates) {
    for (const dir of yearDirs) {
      let files;
      try { files = fs.readdirSync(path.join(base, dir)).filter(f => /\.jpe?g$/i.test(f)); }
      catch { continue; }
      const match = files.find(f => artistMatches(name, f));
      if (match) return res.sendFile(path.join(base, dir, match));
    }
  }
  res.status(404).json({ error: 'not found' });
});

// ── ARTIST STATS ─────────────────────────────────────────────────────────────
app.get('/api/artist-stats', (req, res) => {
  const { artist } = req.query;
  if (!artist) return res.status(400).json({ error: 'artist required' });

  const np      = normPerf(artist);
  const entries = getAliasedEntries(np);
  if (entries.length === 0) return res.json({ found: false, artist });

  // Merge songs from all aliased entries by normalized song title to avoid duplicates
  const songMap = new Map();
  for (const pe of entries) {
    pe.songs.forEach(({ rawSong, rows }, ns) => {
      if (!songMap.has(ns)) songMap.set(ns, { rawSong, rows: [] });
      songMap.get(ns).rows.push(...rows);
    });
  }

  const primaryEntry = PERF_INDEX.get(np) || entries[0];
  const songs = [];
  songMap.forEach(({ rawSong, rows }) => {
    const bestPos    = Math.min(...rows.map(r => r.weekPos));
    const totalWeeks = rows.length;
    const years      = [...new Set(rows.map(r => r.year))].sort();
    // First charted: instance=1, weeksOnChart=1; fallback to earliest row by year
    const firstRow   = rows.find(r => r.instance === 1 && r.weeksOnChart === 1)
                    || rows.slice().sort((a, b) => a.year - b.year)[0];
    const lastRow    = rows.slice().sort((a, b) => weekIdToMs(b.weekId) - weekIdToMs(a.weekId))[0];
    songs.push({
      song:        rawSong,
      bestPosition: bestPos,
      totalWeeks,
      years,
      firstDate: firstRow ? fmtWeekDate(firstRow.weekId) : null,
      firstYear: firstRow ? firstRow.year : years[0],
      lastDate:  lastRow  ? fmtWeekDate(lastRow.weekId)  : null
    });
  });

  // Primary: best peak position (ascending). Secondary: most weeks on chart
  // (descending) so that when multiple songs share the same peak — e.g.
  // Mariah Carey's 12 #1 singles — the longest-running one is listed first
  // and selected as highestSingle rather than whichever CSV row was processed first.
  songs.sort((a, b) => a.bestPosition - b.bestPosition || b.totalWeeks - a.totalWeeks);

  const totalSingles  = songs.length;
  const top10         = songs.filter(s => s.bestPosition <= 10).length;
  const top5          = songs.filter(s => s.bestPosition <=  5).length;
  const top1          = songs.filter(s => s.bestPosition ===  1).length;
  const highestSingle = songs[0];
  const lowestSingle  = [...songs].sort((a, b) => b.bestPosition - a.bestPosition)[0];
  const longestRunning= [...songs].sort((a, b) => b.totalWeeks   - a.totalWeeks  )[0];

  const allYears = [...new Set(songs.flatMap(s => s.years))].sort();

  res.json({
    found: true,
    artist: primaryEntry.rawName,
    totalSingles, top10, top5, top1,
    highestSingle, lowestSingle, longestRunning,
    firstYear: allYears[0],
    lastYear:  allYears[allYears.length - 1],
    allYears,
    allSongs:  songs
  });
});

// ── SONG STATS ───────────────────────────────────────────────────────────────
app.get('/api/song-stats', (req, res) => {
  const { artist, song } = req.query;
  if (!artist || !song) return res.status(400).json({ error: 'artist and song required' });

  const np      = normPerf(artist);
  const ns      = normSong(song);
  const entries = getAliasedEntries(np);
  if (entries.length === 0) return res.json({ found: false });

  let se = null;
  let matchedEntry = null;
  for (const pe of entries) {
    if (pe.songs.has(ns)) { se = pe.songs.get(ns); matchedEntry = pe; break; }
  }
  if (!se) return res.json({ found: false });

  const { rawSong, rows } = se;
  const peakPos    = Math.min(...rows.map(r => r.weekPos));
  const totalWeeks = rows.length;
  const years      = [...new Set(rows.map(r => r.year))].sort();
  const firstRow   = rows.find(r => r.instance === 1 && r.weeksOnChart === 1)
                  || rows.slice().sort((a, b) => a.year - b.year)[0];

  res.json({
    found:       true,
    artist:      matchedEntry.rawName,
    song:        rawSong,
    peakPosition: peakPos,
    totalWeeks,
    firstDate:   firstRow ? fmtWeekDate(firstRow.weekId) : null,
    firstYear:   firstRow ? firstRow.year : years[0],
    years
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
