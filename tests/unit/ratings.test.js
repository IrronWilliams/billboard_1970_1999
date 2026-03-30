'use strict';

const express  = require('express');
const request  = require('supertest');

// ---------------------------------------------------------------------------
// Mock ratingsDb BEFORE requiring the router so Jest intercepts the require
// ---------------------------------------------------------------------------
jest.mock('../../ratingsDb');
const pool = require('../../ratingsDb');

// ---------------------------------------------------------------------------
// Build a minimal app that mounts only the ratings router
// ---------------------------------------------------------------------------
function buildApp() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  const ratingsRouter = require('../../routes/ratings');
  app.use('/', ratingsRouter);
  return app;
}

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------
const SONG   = 'Bohemian Rhapsody';
const ARTIST = 'Queen';
const YEAR   = 1975;
const DECADE = 1970;

const AGG_NO_VOTE = {
  rows: [{ up: '3', down: '1', user_vote: null }],
};
const AGG_UP_VOTE = {
  rows: [{ up: '4', down: '1', user_vote: 'up' }],
};
const AGG_DOWN_VOTE = {
  rows: [{ up: '3', down: '2', user_vote: 'down' }],
};
const AGG_AFTER_DELETE = {
  rows: [{ up: '3', down: '1', user_vote: null }],
};

function mockQueryOnce(resolveValue) {
  pool.query.mockResolvedValueOnce(resolveValue);
}

function mockQueryError(error) {
  pool.query.mockRejectedValueOnce(error);
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  console.error.mockRestore();
});

// ===========================================================================
// GET /
// ===========================================================================
describe('GET / — retrieve aggregates', () => {
  let app;
  beforeAll(() => { app = buildApp(); });

  // ── Input validation ──────────────────────────────────────────────────────

  test('[CRITICAL] returns 400 when song query param is missing', async () => {
    const res = await request(app).get('/').query({ artist: ARTIST });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'song and artist required' });
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('[CRITICAL] returns 400 when artist query param is missing', async () => {
    const res = await request(app).get('/').query({ song: SONG });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'song and artist required' });
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('[CRITICAL] returns 400 when both query params are missing', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'song and artist required' });
  });

  // ── Happy path ────────────────────────────────────────────────────────────

  test('[CRITICAL] returns correct { up, down, userVote } shape with no prior vote', async () => {
    mockQueryOnce(AGG_NO_VOTE);
    const res = await request(app).get('/').query({ song: SONG, artist: ARTIST });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ up: 3, down: 1, userVote: null });
  });

  test('[CRITICAL] userVote is "up" when this IP previously voted up', async () => {
    mockQueryOnce(AGG_UP_VOTE);
    const res = await request(app)
      .get('/').query({ song: SONG, artist: ARTIST }).set('x-real-ip', '10.0.0.1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ up: 4, down: 1, userVote: 'up' });
  });

  test('[CRITICAL] userVote is "down" when this IP previously voted down', async () => {
    mockQueryOnce(AGG_DOWN_VOTE);
    const res = await request(app)
      .get('/').query({ song: SONG, artist: ARTIST }).set('x-real-ip', '10.0.0.1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ up: 3, down: 2, userVote: 'down' });
  });

  test('[CRITICAL] up and down counts are parsed as integers (not strings)', async () => {
    mockQueryOnce({ rows: [{ up: '99', down: '42', user_vote: null }] });
    const res = await request(app).get('/').query({ song: SONG, artist: ARTIST });
    expect(typeof res.body.up).toBe('number');
    expect(typeof res.body.down).toBe('number');
    expect(res.body.up).toBe(99);
    expect(res.body.down).toBe(42);
  });

  // ── IP extraction ─────────────────────────────────────────────────────────

  test('[IMPORTANT] x-real-ip is forwarded as the $3 parameter to the DB query', async () => {
    mockQueryOnce(AGG_NO_VOTE);
    const ip = '203.0.113.5';
    await request(app).get('/').query({ song: SONG, artist: ARTIST }).set('x-real-ip', ip);
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('FROM ratings'), [SONG, ARTIST, ip]);
  });

  test('[IMPORTANT] x-forwarded-for first entry is used as IP when x-real-ip absent', async () => {
    mockQueryOnce(AGG_NO_VOTE);
    const firstIp = '198.51.100.1';
    await request(app)
      .get('/').query({ song: SONG, artist: ARTIST })
      .set('x-forwarded-for', `${firstIp}, 10.0.0.1, 10.0.0.2`);
    expect(pool.query).toHaveBeenCalledWith(expect.anything(), [SONG, ARTIST, firstIp]);
  });

  test('[IMPORTANT] x-real-ip takes priority over x-forwarded-for', async () => {
    mockQueryOnce(AGG_NO_VOTE);
    const realIp      = '192.0.2.1';
    const forwardedIp = '198.51.100.1';
    await request(app)
      .get('/').query({ song: SONG, artist: ARTIST })
      .set('x-real-ip', realIp).set('x-forwarded-for', forwardedIp);
    expect(pool.query).toHaveBeenCalledWith(expect.anything(), [SONG, ARTIST, realIp]);
  });

  test('[NICE-TO-HAVE] x-forwarded-for with whitespace is trimmed', async () => {
    mockQueryOnce(AGG_NO_VOTE);
    const realFirstIp = '198.51.100.10';
    await request(app)
      .get('/').query({ song: SONG, artist: ARTIST })
      .set('x-forwarded-for', `  ${realFirstIp}  , 10.0.0.1`);
    expect(pool.query).toHaveBeenCalledWith(expect.anything(), [SONG, ARTIST, realFirstIp]);
  });

  // ── Error handling ────────────────────────────────────────────────────────

  test('[CRITICAL] returns 503 when pool.query throws', async () => {
    mockQueryError(new Error('connection refused'));
    const res = await request(app).get('/').query({ song: SONG, artist: ARTIST });
    expect(res.status).toBe(503);
    expect(res.body).toEqual({ error: 'ratings unavailable' });
  });

  test('[IMPORTANT] does not expose internal error details in the 503 body', async () => {
    mockQueryError(new Error('pg: password authentication failed for user "app"'));
    const res = await request(app).get('/').query({ song: SONG, artist: ARTIST });
    expect(res.status).toBe(503);
    expect(res.body.error).toBe('ratings unavailable');
    expect(JSON.stringify(res.body)).not.toMatch(/password/i);
  });
});

// ===========================================================================
// POST /
// ===========================================================================
describe('POST / — cast or switch vote (upsert)', () => {
  let app;
  beforeAll(() => { app = buildApp(); });

  // ── Input validation ──────────────────────────────────────────────────────

  test('[CRITICAL] returns 400 when song is missing', async () => {
    const res = await request(app).post('/').send({ artist: ARTIST, year: YEAR, vote: 'up' });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'song, artist, year, and vote required' });
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('[CRITICAL] returns 400 when artist is missing', async () => {
    const res = await request(app).post('/').send({ song: SONG, year: YEAR, vote: 'up' });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'song, artist, year, and vote required' });
  });

  test('[CRITICAL] returns 400 when year is missing', async () => {
    const res = await request(app).post('/').send({ song: SONG, artist: ARTIST, vote: 'up' });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'song, artist, year, and vote required' });
  });

  test('[CRITICAL] returns 400 when vote is missing', async () => {
    const res = await request(app).post('/').send({ song: SONG, artist: ARTIST, year: YEAR });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'song, artist, year, and vote required' });
  });

  test('[CRITICAL] returns 400 when vote value is not "up" or "down"', async () => {
    const res = await request(app).post('/').send({ song: SONG, artist: ARTIST, year: YEAR, vote: 'sideways' });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'vote must be "up" or "down"' });
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('[CRITICAL] returns 400 for vote value with incorrect casing ("Up")', async () => {
    const res = await request(app).post('/').send({ song: SONG, artist: ARTIST, year: YEAR, vote: 'Up' });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'vote must be "up" or "down"' });
  });

  test('[IMPORTANT] returns 400 for empty-string vote', async () => {
    const res = await request(app).post('/').send({ song: SONG, artist: ARTIST, year: YEAR, vote: '' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required|vote must be/);
  });

  // ── Happy path ────────────────────────────────────────────────────────────

  test('[CRITICAL] new "up" vote: runs INSERT upsert then returns updated aggregates', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 1 });
    mockQueryOnce(AGG_UP_VOTE);
    const res = await request(app).post('/').send({ song: SONG, artist: ARTIST, year: YEAR, vote: 'up' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ up: 4, down: 1, userVote: 'up' });
    expect(pool.query).toHaveBeenCalledTimes(2);
  });

  test('[CRITICAL] new "down" vote: runs INSERT upsert then returns updated aggregates', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 1 });
    mockQueryOnce(AGG_DOWN_VOTE);
    const res = await request(app).post('/').send({ song: SONG, artist: ARTIST, year: YEAR, vote: 'down' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ up: 3, down: 2, userVote: 'down' });
  });

  test('[CRITICAL] INSERT uses ON CONFLICT upsert — correct SQL is sent to the pool', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 1 });
    mockQueryOnce(AGG_UP_VOTE);
    await request(app).post('/').send({ song: SONG, artist: ARTIST, year: YEAR, vote: 'up' }).set('x-real-ip', '10.10.10.1');
    const insertCall = pool.query.mock.calls[0];
    expect(insertCall[0]).toContain('ON CONFLICT (song, artist, ip)');
    expect(insertCall[0]).toContain('DO UPDATE SET vote = EXCLUDED.vote');
  });

  // ── Vote switching ────────────────────────────────────────────────────────

  test('[CRITICAL] switching vote from "up" to "down" issues the same upsert SQL', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 1 });
    mockQueryOnce(AGG_DOWN_VOTE);
    const res = await request(app).post('/').send({ song: SONG, artist: ARTIST, year: YEAR, vote: 'down' }).set('x-real-ip', '10.10.10.1');
    expect(res.status).toBe(200);
    expect(res.body.userVote).toBe('down');
    expect(pool.query).toHaveBeenCalledTimes(2);
    expect(pool.query.mock.calls[0][0]).toContain('ON CONFLICT');
  });

  // ── decade auto-derivation ────────────────────────────────────────────────

  test('[IMPORTANT] decade is auto-derived from year when not provided', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 1 });
    mockQueryOnce(AGG_UP_VOTE);
    await request(app).post('/').send({ song: SONG, artist: ARTIST, year: 1983, vote: 'up' });
    const insertParams = pool.query.mock.calls[0][1];
    expect(insertParams[3]).toBe(1980);
  });

  test('[IMPORTANT] decade provided in body overrides auto-derivation', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 1 });
    mockQueryOnce(AGG_UP_VOTE);
    await request(app).post('/').send({ song: SONG, artist: ARTIST, year: 1983, decade: 2000, vote: 'up' });
    const insertParams = pool.query.mock.calls[0][1];
    expect(insertParams[3]).toBe(2000);
  });

  test('[IMPORTANT] year is cast to an integer in the INSERT params', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 1 });
    mockQueryOnce(AGG_UP_VOTE);
    await request(app).post('/').send({ song: SONG, artist: ARTIST, year: '1975', vote: 'up' });
    const insertParams = pool.query.mock.calls[0][1];
    expect(typeof insertParams[2]).toBe('number');
    expect(insertParams[2]).toBe(1975);
  });

  // ── IP extraction in POST ─────────────────────────────────────────────────

  test('[IMPORTANT] IP from x-real-ip is passed as $6 in the INSERT', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 1 });
    mockQueryOnce(AGG_UP_VOTE);
    const ip = '172.16.0.99';
    await request(app).post('/').send({ song: SONG, artist: ARTIST, year: YEAR, vote: 'up' }).set('x-real-ip', ip);
    const insertParams = pool.query.mock.calls[0][1];
    expect(insertParams[5]).toBe(ip);
  });

  test('[IMPORTANT] IP from x-forwarded-for (first entry) is used when x-real-ip absent', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 1 });
    mockQueryOnce(AGG_UP_VOTE);
    const firstIp = '203.0.113.77';
    await request(app).post('/').send({ song: SONG, artist: ARTIST, year: YEAR, vote: 'up' }).set('x-forwarded-for', `${firstIp}, 192.168.1.1`);
    const insertParams = pool.query.mock.calls[0][1];
    expect(insertParams[5]).toBe(firstIp);
  });

  // ── Error handling ────────────────────────────────────────────────────────

  test('[CRITICAL] returns 503 when the INSERT query throws', async () => {
    mockQueryError(new Error('deadlock detected'));
    const res = await request(app).post('/').send({ song: SONG, artist: ARTIST, year: YEAR, vote: 'up' });
    expect(res.status).toBe(503);
    expect(res.body).toEqual({ error: 'ratings unavailable' });
  });

  test('[CRITICAL] returns 503 when the follow-up aggregate SELECT throws', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 1 });
    mockQueryError(new Error('read replica lag'));
    const res = await request(app).post('/').send({ song: SONG, artist: ARTIST, year: YEAR, vote: 'up' });
    expect(res.status).toBe(503);
    expect(res.body).toEqual({ error: 'ratings unavailable' });
  });
});

// ===========================================================================
// DELETE /
// ===========================================================================
describe('DELETE / — remove vote', () => {
  let app;
  beforeAll(() => { app = buildApp(); });

  // ── Input validation ──────────────────────────────────────────────────────

  test('[CRITICAL] returns 400 when song query param is missing', async () => {
    const res = await request(app).delete('/').query({ artist: ARTIST });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'song and artist required' });
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('[CRITICAL] returns 400 when artist query param is missing', async () => {
    const res = await request(app).delete('/').query({ song: SONG });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'song and artist required' });
  });

  // ── Happy path ────────────────────────────────────────────────────────────

  test('[CRITICAL] removes vote and returns updated { up, down, userVote: null }', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 1 });
    mockQueryOnce(AGG_AFTER_DELETE);
    const res = await request(app).delete('/').query({ song: SONG, artist: ARTIST });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ up: 3, down: 1, userVote: null });
    expect(pool.query).toHaveBeenCalledTimes(2);
  });

  test('[CRITICAL] DELETE SQL targets correct song, artist, and IP params', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 1 });
    mockQueryOnce(AGG_AFTER_DELETE);
    const ip = '10.20.30.40';
    await request(app).delete('/').query({ song: SONG, artist: ARTIST }).set('x-real-ip', ip);
    const deleteCall = pool.query.mock.calls[0];
    expect(deleteCall[0]).toContain('DELETE FROM ratings');
    expect(deleteCall[1]).toEqual([SONG, ARTIST, ip]);
  });

  test('[IMPORTANT] deleting a non-existent vote still returns 200 with current counts', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 0 });
    mockQueryOnce(AGG_NO_VOTE);
    const res = await request(app).delete('/').query({ song: SONG, artist: ARTIST });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ up: 3, down: 1, userVote: null });
  });

  // ── IP extraction in DELETE ───────────────────────────────────────────────

  test('[IMPORTANT] x-forwarded-for first IP is used in DELETE params when x-real-ip absent', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 1 });
    mockQueryOnce(AGG_AFTER_DELETE);
    const firstIp = '198.51.100.250';
    await request(app).delete('/').query({ song: SONG, artist: ARTIST }).set('x-forwarded-for', `${firstIp}, 10.0.0.1`);
    const deleteParams = pool.query.mock.calls[0][1];
    expect(deleteParams[2]).toBe(firstIp);
  });

  // ── Error handling ────────────────────────────────────────────────────────

  test('[CRITICAL] returns 503 when the DELETE query throws', async () => {
    mockQueryError(new Error('server closed the connection unexpectedly'));
    const res = await request(app).delete('/').query({ song: SONG, artist: ARTIST });
    expect(res.status).toBe(503);
    expect(res.body).toEqual({ error: 'ratings unavailable' });
  });

  test('[CRITICAL] returns 503 when the follow-up aggregate SELECT throws after DELETE', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 1 });
    mockQueryError(new Error('out of memory'));
    const res = await request(app).delete('/').query({ song: SONG, artist: ARTIST });
    expect(res.status).toBe(503);
    expect(res.body).toEqual({ error: 'ratings unavailable' });
  });
});

// ===========================================================================
// IP extraction fallback
// ===========================================================================
describe('IP extraction — req.ip fallback when no headers present', () => {
  let app;
  beforeAll(() => { app = buildApp(); });

  test('[NICE-TO-HAVE] falls back to req.ip when neither header is present', async () => {
    mockQueryOnce(AGG_NO_VOTE);
    await request(app).get('/').query({ song: SONG, artist: ARTIST });
    const queryParams = pool.query.mock.calls[0][1];
    expect(typeof queryParams[2]).toBe('string');
    expect(queryParams[2].length).toBeGreaterThan(0);
  });
});
