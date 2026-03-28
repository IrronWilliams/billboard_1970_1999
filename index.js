const express = require('express');
const fs      = require('fs');
const path    = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ── ALBUM ART ──
// Connector words that appear in CSV artist names but are often dropped or
// replaced with "&" in filenames, and vice-versa. Strip them from both sides
// before comparing so "Simon and Garfunkel" matches "Simon-&-Garfunkel_..." and
// "Daryl Hall and John Oates" matches "Daryl_Hall_John_Oates-...".
const CONNECTORS = new Set(['and', 'the', 'feat', 'featuring', 'ft', 'with', 'vs']);

function normalizeForMatch(s) {
  return s.toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')   // all separators → space
    .trim()
    .split(/\s+/)
    .filter(w => w && !CONNECTORS.has(w))
    .join('');
}

// Returns true when the filename's artist prefix — the words before the album
// title begins — matches the query artist after connector-word stripping.
// Walks the filename word by word, accumulating alphanumeric tokens, until the
// accumulation equals the needle or overshoots it.
function artistMatches(artist, filename) {
  const needle = normalizeForMatch(artist);
  if (!needle) return false;

  const base  = filename.replace(/\.jpe?g$/i, '');
  const words = base.toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(w => w && !CONNECTORS.has(w));

  let accumulated = '';
  for (const w of words) {
    accumulated += w;
    if (accumulated === needle) return true;
    if (accumulated.length >= needle.length) return false;
  }
  return false;
}

app.get('/api/albumart', (req, res) => {
  const { artist, year } = req.query;
  if (!artist) return res.status(400).json({ error: 'artist required' });

  const base = '/app/albumart';
  let allDirs;
  try {
    allDirs = fs.readdirSync(base)
      .filter(d => /^\d{4}$/.test(d))
      .sort();
  } catch {
    return res.status(404).json({ error: 'albumart folder not found' });
  }

  // If a year is provided, search its decade first, then the remaining years.
  let yearDirs = allDirs;
  if (year) {
    const decadeStart = Math.floor(parseInt(year, 10) / 10) * 10;
    const decadeEnd   = decadeStart + 9;
    const inDecade    = allDirs.filter(d => +d >= decadeStart && +d <= decadeEnd);
    const outDecade   = allDirs.filter(d => +d < decadeStart || +d > decadeEnd);
    yearDirs = [...inDecade, ...outDecade];
  }

  // Build a list of candidate names to try, most-specific first:
  //   1. Full artist name as-is
  //   2. Strip leading "The "  (e.g. "The Knack" → "Knack")
  //   3. Part before " and "   (e.g. "Paul McCartney and Wings" → "Paul McCartney")
  const candidates = [artist];
  if (/^the\s+/i.test(artist)) candidates.push(artist.replace(/^the\s+/i, ''));
  const andIdx = artist.search(/\s+and\s+/i);
  if (andIdx > 0) candidates.push(artist.slice(0, andIdx).trim());

  for (const name of candidates) {
    for (const dir of yearDirs) {
      let files;
      try {
        files = fs.readdirSync(path.join(base, dir)).filter(f => /\.jpe?g$/i.test(f));
      } catch {
        continue;
      }
      const match = files.find(f => artistMatches(name, f));
      if (match) return res.sendFile(path.join(base, dir, match));
    }
  }

  res.status(404).json({ error: 'not found' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

