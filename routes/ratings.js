const express = require('express');
const router  = express.Router();
const pool    = require('../ratingsDb');

function getClientIp(req) {
  return req.headers['x-real-ip']
    || (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
    || req.ip;
}

async function getAggregates(song, artist, ip) {
  const { rows } = await pool.query(
    `SELECT
       COUNT(*) FILTER (WHERE vote = 'up')   AS up,
       COUNT(*) FILTER (WHERE vote = 'down') AS down,
       MAX(CASE WHEN ip = $3 THEN vote END)  AS user_vote
     FROM ratings
     WHERE song = $1 AND artist = $2`,
    [song, artist, ip]
  );
  const row = rows[0];
  return {
    up:       parseInt(row.up,   10),
    down:     parseInt(row.down, 10),
    userVote: row.user_vote || null
  };
}

// GET /api/ratings?song=...&artist=...
router.get('/', async (req, res) => {
  const { song, artist } = req.query;
  if (!song || !artist) return res.status(400).json({ error: 'song and artist required' });
  const ip = getClientIp(req);
  try {
    res.json(await getAggregates(song, artist, ip));
  } catch (e) {
    console.error('GET /api/ratings error:', e.message);
    res.status(503).json({ error: 'ratings unavailable' });
  }
});

// POST /api/ratings — cast or switch vote (upsert)
router.post('/', async (req, res) => {
  const { song, artist, year, decade, vote } = req.body;
  if (!song || !artist || !year || !vote) {
    return res.status(400).json({ error: 'song, artist, year, and vote required' });
  }
  if (!['up', 'down'].includes(vote)) {
    return res.status(400).json({ error: 'vote must be "up" or "down"' });
  }
  const ip      = getClientIp(req);
  const yearInt = parseInt(year, 10);
  const dec     = decade != null ? parseInt(decade, 10) : Math.floor(yearInt / 10) * 10;
  try {
    await pool.query(
      `INSERT INTO ratings (song, artist, year, decade, vote, ip)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (song, artist, ip) DO UPDATE SET vote = EXCLUDED.vote`,
      [song, artist, yearInt, dec, vote, ip]
    );
    res.json(await getAggregates(song, artist, ip));
  } catch (e) {
    console.error('POST /api/ratings error:', e.message);
    res.status(503).json({ error: 'ratings unavailable' });
  }
});

// DELETE /api/ratings?song=...&artist=...
router.delete('/', async (req, res) => {
  const { song, artist } = req.query;
  if (!song || !artist) return res.status(400).json({ error: 'song and artist required' });
  const ip = getClientIp(req);
  try {
    await pool.query(
      'DELETE FROM ratings WHERE song = $1 AND artist = $2 AND ip = $3',
      [song, artist, ip]
    );
    res.json(await getAggregates(song, artist, ip));
  } catch (e) {
    console.error('DELETE /api/ratings error:', e.message);
    res.status(503).json({ error: 'ratings unavailable' });
  }
});

module.exports = router;
