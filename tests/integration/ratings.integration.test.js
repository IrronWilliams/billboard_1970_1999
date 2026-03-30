'use strict';

const request = require('supertest');
const express = require('express');

// ---------------------------------------------------------------------------
// Mock the pg pool BEFORE any app modules are required
// ---------------------------------------------------------------------------
jest.mock('../../ratingsDb', () => ({ query: jest.fn() }));

const ratingsRouter = require('../../routes/ratings');
const pool          = require('../../ratingsDb');

// ---------------------------------------------------------------------------
// Minimal Express app — does NOT import index.js to avoid CSV startup cost
// ---------------------------------------------------------------------------
function buildApp() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json());
  app.use('/api/ratings', ratingsRouter);
  return app;
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
function aggregateResult({ up = 0, down = 0, userVote = null } = {}) {
  return { rows: [{ up: String(up), down: String(down), user_vote: userVote }] };
}

function writeResult() {
  return { rows: [] };
}

const SONG   = 'Africa';
const ARTIST = 'Toto';
const YEAR   = 1982;
const DECADE = 1980;

beforeEach(() => {
  pool.query.mockReset();
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  console.error.mockRestore();
});

// ===========================================================================
// Suite 1 — Response shape contract (P0)
// ===========================================================================
describe('Response shape contract — every route returns { up, down, userVote }', () => {
  let app;
  beforeAll(() => { app = buildApp(); });

  test('GET returns correct shape with integer counts and null userVote when no vote exists', async () => {
    pool.query.mockResolvedValueOnce(aggregateResult({ up: 3, down: 1, userVote: null }));
    const res = await request(app).get('/api/ratings').query({ song: SONG, artist: ARTIST });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ up: 3, down: 1, userVote: null });
    expect(typeof res.body.up).toBe('number');
    expect(typeof res.body.down).toBe('number');
  });

  test('GET returns userVote as "up" when the calling IP has voted up', async () => {
    pool.query.mockResolvedValueOnce(aggregateResult({ up: 1, down: 0, userVote: 'up' }));
    const res = await request(app).get('/api/ratings').set('x-real-ip', '10.0.0.1').query({ song: SONG, artist: ARTIST });
    expect(res.status).toBe(200);
    expect(res.body.userVote).toBe('up');
  });

  test('POST returns correct shape immediately after inserting a vote', async () => {
    pool.query.mockResolvedValueOnce(writeResult()).mockResolvedValueOnce(aggregateResult({ up: 1, down: 0, userVote: 'up' }));
    const res = await request(app).post('/api/ratings').send({ song: SONG, artist: ARTIST, year: YEAR, vote: 'up' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ up: 1, down: 0, userVote: 'up' });
  });

  test('DELETE returns correct shape after removing a vote', async () => {
    pool.query.mockResolvedValueOnce(writeResult()).mockResolvedValueOnce(aggregateResult({ up: 0, down: 0, userVote: null }));
    const res = await request(app).delete('/api/ratings').query({ song: SONG, artist: ARTIST });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ up: 0, down: 0, userVote: null });
  });
});

// ===========================================================================
// Suite 2 — Full vote lifecycle (P0)
// ===========================================================================
describe('Full vote lifecycle: GET → POST → GET → DELETE → GET', () => {
  let app;
  const IP = '203.0.113.42';
  beforeAll(() => { app = buildApp(); });

  test('Step 1 — GET before any vote: up=0, down=0, userVote=null', async () => {
    pool.query.mockResolvedValueOnce(aggregateResult());
    const res = await request(app).get('/api/ratings').set('x-real-ip', IP).query({ song: SONG, artist: ARTIST });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ up: 0, down: 0, userVote: null });
  });

  test('Step 2 — POST "up" vote: upsert fires first, aggregate returns up=1', async () => {
    pool.query.mockResolvedValueOnce(writeResult()).mockResolvedValueOnce(aggregateResult({ up: 1, down: 0, userVote: 'up' }));
    const res = await request(app).post('/api/ratings').set('x-real-ip', IP).send({ song: SONG, artist: ARTIST, year: YEAR, vote: 'up' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ up: 1, down: 0, userVote: 'up' });
    expect(pool.query).toHaveBeenCalledTimes(2);

    const [upsertSql, upsertArgs] = pool.query.mock.calls[0];
    expect(upsertSql).toMatch(/INSERT INTO ratings/i);
    expect(upsertSql).toContain('ON CONFLICT (song, artist, ip)');
    expect(upsertArgs).toEqual([SONG, ARTIST, YEAR, DECADE, 'up', IP]);

    const [aggregateSql] = pool.query.mock.calls[1];
    expect(aggregateSql).toMatch(/SELECT/i);
    expect(aggregateSql).toMatch(/COUNT\(\*\)/i);
  });

  test('Step 3 — GET after POST: aggregate re-runs, reflects the up vote', async () => {
    pool.query.mockResolvedValueOnce(aggregateResult({ up: 1, down: 0, userVote: 'up' }));
    const res = await request(app).get('/api/ratings').set('x-real-ip', IP).query({ song: SONG, artist: ARTIST });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ up: 1, down: 0, userVote: 'up' });
    expect(pool.query).toHaveBeenCalledTimes(1);
  });

  test('Step 4 — DELETE vote: delete SQL fires first, aggregate returns up=0', async () => {
    pool.query.mockResolvedValueOnce(writeResult()).mockResolvedValueOnce(aggregateResult({ up: 0, down: 0, userVote: null }));
    const res = await request(app).delete('/api/ratings').set('x-real-ip', IP).query({ song: SONG, artist: ARTIST });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ up: 0, down: 0, userVote: null });
    expect(pool.query).toHaveBeenCalledTimes(2);

    const [deleteSql, deleteArgs] = pool.query.mock.calls[0];
    expect(deleteSql).toMatch(/DELETE FROM ratings/i);
    expect(deleteArgs).toEqual([SONG, ARTIST, IP]);

    const [aggregateSql] = pool.query.mock.calls[1];
    expect(aggregateSql).toMatch(/SELECT/i);
  });

  test('Step 5 — GET after DELETE: back to zero counts, no userVote', async () => {
    pool.query.mockResolvedValueOnce(aggregateResult({ up: 0, down: 0, userVote: null }));
    const res = await request(app).get('/api/ratings').set('x-real-ip', IP).query({ song: SONG, artist: ARTIST });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ up: 0, down: 0, userVote: null });
  });
});

// ===========================================================================
// Suite 3 — Vote switching (P1)
// ===========================================================================
describe('Vote switching: POST "up" then POST "down" changes userVote and flips counts', () => {
  let app;
  const IP = '198.51.100.7';
  beforeAll(() => { app = buildApp(); });

  test('Initial "up" vote returns up=1, down=0, userVote="up"', async () => {
    pool.query.mockResolvedValueOnce(writeResult()).mockResolvedValueOnce(aggregateResult({ up: 1, down: 0, userVote: 'up' }));
    const res = await request(app).post('/api/ratings').set('x-real-ip', IP).send({ song: SONG, artist: ARTIST, year: YEAR, vote: 'up' });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ up: 1, down: 0, userVote: 'up' });
  });

  test('Switch to "down": upsert receives "down", response reflects switched vote', async () => {
    pool.query.mockResolvedValueOnce(writeResult()).mockResolvedValueOnce(aggregateResult({ up: 0, down: 1, userVote: 'down' }));
    const res = await request(app).post('/api/ratings').set('x-real-ip', IP).send({ song: SONG, artist: ARTIST, year: YEAR, vote: 'down' });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ up: 0, down: 1, userVote: 'down' });
    const upsertArgs = pool.query.mock.calls[0][1];
    expect(upsertArgs[4]).toBe('down');
  });

  test('After switching, GET reflects the "down" vote for the same IP', async () => {
    pool.query.mockResolvedValueOnce(aggregateResult({ up: 0, down: 1, userVote: 'down' }));
    const res = await request(app).get('/api/ratings').set('x-real-ip', IP).query({ song: SONG, artist: ARTIST });
    expect(res.status).toBe(200);
    expect(res.body.userVote).toBe('down');
  });
});

// ===========================================================================
// Suite 4 — Multi-IP behavior (P2)
// ===========================================================================
describe('Multi-IP behavior: two IPs voting on the same song', () => {
  let app;
  const IP_A = '192.0.2.10';
  const IP_B = '192.0.2.20';
  beforeAll(() => { app = buildApp(); });

  test('IP_A votes "up": aggregate called with IP_A, returns userVote="up"', async () => {
    pool.query.mockResolvedValueOnce(writeResult()).mockResolvedValueOnce(aggregateResult({ up: 1, down: 0, userVote: 'up' }));
    const res = await request(app).post('/api/ratings').set('x-real-ip', IP_A).send({ song: SONG, artist: ARTIST, year: YEAR, vote: 'up' });
    expect(res.status).toBe(200);
    expect(res.body.userVote).toBe('up');
    expect(pool.query.mock.calls[0][1][5]).toBe(IP_A);  // upsert $6
    expect(pool.query.mock.calls[1][1][2]).toBe(IP_A);  // aggregate $3
  });

  test('IP_B votes "down": global counts include both votes, userVote="down" for IP_B', async () => {
    pool.query.mockResolvedValueOnce(writeResult()).mockResolvedValueOnce(aggregateResult({ up: 1, down: 1, userVote: 'down' }));
    const res = await request(app).post('/api/ratings').set('x-real-ip', IP_B).send({ song: SONG, artist: ARTIST, year: YEAR, vote: 'down' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ up: 1, down: 1, userVote: 'down' });
    expect(pool.query.mock.calls[0][1][5]).toBe(IP_B);
    expect(pool.query.mock.calls[1][1][2]).toBe(IP_B);
  });

  test('IP_A GETs counts: sees up=1, down=1, but userVote="up" (not down)', async () => {
    pool.query.mockResolvedValueOnce(aggregateResult({ up: 1, down: 1, userVote: 'up' }));
    const res = await request(app).get('/api/ratings').set('x-real-ip', IP_A).query({ song: SONG, artist: ARTIST });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ up: 1, down: 1, userVote: 'up' });
    expect(pool.query.mock.calls[0][1][2]).toBe(IP_A);
  });

  test('IP_B GETs counts: sees up=1, down=1, userVote="down"', async () => {
    pool.query.mockResolvedValueOnce(aggregateResult({ up: 1, down: 1, userVote: 'down' }));
    const res = await request(app).get('/api/ratings').set('x-real-ip', IP_B).query({ song: SONG, artist: ARTIST });
    expect(res.status).toBe(200);
    expect(res.body.userVote).toBe('down');
    expect(pool.query.mock.calls[0][1][2]).toBe(IP_B);
  });
});

// ===========================================================================
// Suite 5 — Guard clause / missing field protection (P1)
// ===========================================================================
describe('Guard clause / missing field protection — 400 responses with no DB interaction', () => {
  let app;
  beforeAll(() => { app = buildApp(); });

  test('GET without song returns 400', async () => {
    const res = await request(app).get('/api/ratings').query({ artist: ARTIST });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('GET without artist returns 400', async () => {
    const res = await request(app).get('/api/ratings').query({ song: SONG });
    expect(res.status).toBe(400);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('GET without any params returns 400', async () => {
    const res = await request(app).get('/api/ratings');
    expect(res.status).toBe(400);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('POST without song returns 400 (simulates bypassed UI guard)', async () => {
    const res = await request(app).post('/api/ratings').send({ artist: ARTIST, year: YEAR, vote: 'up' });
    expect(res.status).toBe(400);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('POST without artist returns 400', async () => {
    const res = await request(app).post('/api/ratings').send({ song: SONG, year: YEAR, vote: 'up' });
    expect(res.status).toBe(400);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('POST without year returns 400', async () => {
    const res = await request(app).post('/api/ratings').send({ song: SONG, artist: ARTIST, vote: 'up' });
    expect(res.status).toBe(400);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('POST without vote returns 400', async () => {
    const res = await request(app).post('/api/ratings').send({ song: SONG, artist: ARTIST, year: YEAR });
    expect(res.status).toBe(400);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('POST with invalid vote value ("sideways") returns 400', async () => {
    const res = await request(app).post('/api/ratings').send({ song: SONG, artist: ARTIST, year: YEAR, vote: 'sideways' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/up.*down|down.*up/i);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('DELETE without song returns 400', async () => {
    const res = await request(app).delete('/api/ratings').query({ artist: ARTIST });
    expect(res.status).toBe(400);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('DELETE without artist returns 400', async () => {
    const res = await request(app).delete('/api/ratings').query({ song: SONG });
    expect(res.status).toBe(400);
    expect(pool.query).not.toHaveBeenCalled();
  });
});

// ===========================================================================
// Suite 6 — DB error → 503 (P2)
// ===========================================================================
describe('DB error handling — 503 returned on pool.query rejection', () => {
  let app;
  beforeAll(() => { app = buildApp(); });

  test('GET returns 503 when pool.query rejects', async () => {
    pool.query.mockRejectedValueOnce(new Error('connection refused'));
    const res = await request(app).get('/api/ratings').query({ song: SONG, artist: ARTIST });
    expect(res.status).toBe(503);
    expect(res.body).toHaveProperty('error');
  });

  test('POST returns 503 when the upsert rejects', async () => {
    pool.query.mockRejectedValueOnce(new Error('deadlock detected'));
    const res = await request(app).post('/api/ratings').send({ song: SONG, artist: ARTIST, year: YEAR, vote: 'up' });
    expect(res.status).toBe(503);
    expect(res.body).toHaveProperty('error');
  });

  test('POST returns 503 when the upsert succeeds but the aggregate rejects', async () => {
    pool.query.mockResolvedValueOnce(writeResult()).mockRejectedValueOnce(new Error('temporary unavailability'));
    const res = await request(app).post('/api/ratings').send({ song: SONG, artist: ARTIST, year: YEAR, vote: 'up' });
    expect(res.status).toBe(503);
  });

  test('DELETE returns 503 when pool.query rejects', async () => {
    pool.query.mockRejectedValueOnce(new Error('network timeout'));
    const res = await request(app).delete('/api/ratings').query({ song: SONG, artist: ARTIST });
    expect(res.status).toBe(503);
    expect(res.body).toHaveProperty('error');
  });
});

// ===========================================================================
// Suite 7 — IP extraction priority (P3)
// ===========================================================================
describe('IP extraction: x-real-ip takes priority over x-forwarded-for', () => {
  let app;
  beforeAll(() => { app = buildApp(); });

  test('x-real-ip is used when both headers are present', async () => {
    const REAL_IP = '10.1.2.3', FORWARDED_IP = '10.9.9.9';
    pool.query.mockResolvedValueOnce(writeResult()).mockResolvedValueOnce(aggregateResult({ up: 1, userVote: 'up' }));
    await request(app).post('/api/ratings').set('x-real-ip', REAL_IP).set('x-forwarded-for', FORWARDED_IP).send({ song: SONG, artist: ARTIST, year: YEAR, vote: 'up' });
    expect(pool.query.mock.calls[0][1][5]).toBe(REAL_IP);
    expect(pool.query.mock.calls[1][1][2]).toBe(REAL_IP);
  });

  test('x-forwarded-for first value is used when x-real-ip is absent', async () => {
    pool.query.mockResolvedValueOnce(writeResult()).mockResolvedValueOnce(aggregateResult({ up: 1, userVote: 'up' }));
    await request(app).post('/api/ratings').set('x-forwarded-for', '10.20.30.40, 10.50.60.70').send({ song: SONG, artist: ARTIST, year: YEAR, vote: 'up' });
    expect(pool.query.mock.calls[0][1][5]).toBe('10.20.30.40');
  });
});

// ===========================================================================
// Suite 8 — decade auto-calculation (P3)
// ===========================================================================
describe('decade auto-calculation: derived from year when not supplied', () => {
  let app;
  beforeAll(() => { app = buildApp(); });

  test('decade=1980 is derived from year=1982 when decade is omitted', async () => {
    pool.query.mockResolvedValueOnce(writeResult()).mockResolvedValueOnce(aggregateResult({ up: 1 }));
    await request(app).post('/api/ratings').send({ song: SONG, artist: ARTIST, year: 1982, vote: 'up' });
    expect(pool.query.mock.calls[0][1][3]).toBe(1980);
  });

  test('decade=1970 is derived from year=1979', async () => {
    pool.query.mockResolvedValueOnce(writeResult()).mockResolvedValueOnce(aggregateResult({ up: 1 }));
    await request(app).post('/api/ratings').send({ song: SONG, artist: ARTIST, year: 1979, vote: 'up' });
    expect(pool.query.mock.calls[0][1][3]).toBe(1970);
  });

  test('explicit decade in body overrides auto-calculation', async () => {
    pool.query.mockResolvedValueOnce(writeResult()).mockResolvedValueOnce(aggregateResult({ up: 1 }));
    await request(app).post('/api/ratings').send({ song: SONG, artist: ARTIST, year: 1982, decade: 1990, vote: 'up' });
    expect(pool.query.mock.calls[0][1][3]).toBe(1990);
  });
});

// ===========================================================================
// Suite 9 — SQL argument contracts (P1)
// ===========================================================================
describe('SQL argument contracts — positional args match schema column types', () => {
  let app;
  const IP = '203.0.113.99';
  beforeAll(() => { app = buildApp(); });

  test('POST upsert args: [string, string, integer, integer, string, string]', async () => {
    pool.query.mockResolvedValueOnce(writeResult()).mockResolvedValueOnce(aggregateResult({ up: 1 }));
    await request(app).post('/api/ratings').set('x-real-ip', IP).send({ song: SONG, artist: ARTIST, year: YEAR, vote: 'up' });
    const args = pool.query.mock.calls[0][1];
    expect(args).toHaveLength(6);
    expect(typeof args[0]).toBe('string');  // song
    expect(typeof args[1]).toBe('string');  // artist
    expect(typeof args[2]).toBe('number');  // year
    expect(typeof args[3]).toBe('number');  // decade
    expect(typeof args[4]).toBe('string');  // vote
    expect(typeof args[5]).toBe('string');  // ip
  });

  test('GET aggregate args: [string, string, string] — ip must be a string', async () => {
    pool.query.mockResolvedValueOnce(aggregateResult());
    await request(app).get('/api/ratings').set('x-real-ip', IP).query({ song: SONG, artist: ARTIST });
    const args = pool.query.mock.calls[0][1];
    expect(args).toHaveLength(3);
    expect(typeof args[0]).toBe('string');
    expect(typeof args[1]).toBe('string');
    expect(typeof args[2]).toBe('string');
    expect(args[2]).toBe(IP);
  });

  test('DELETE args: [string, string, string] in order song, artist, ip', async () => {
    pool.query.mockResolvedValueOnce(writeResult()).mockResolvedValueOnce(aggregateResult());
    await request(app).delete('/api/ratings').set('x-real-ip', IP).query({ song: SONG, artist: ARTIST });
    const args = pool.query.mock.calls[0][1];
    expect(args).toHaveLength(3);
    expect(args[0]).toBe(SONG);
    expect(args[1]).toBe(ARTIST);
    expect(args[2]).toBe(IP);
  });
});
