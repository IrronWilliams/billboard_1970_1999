# 2026-03-31 — Environments, Operations & Troubleshooting Guide

## Overview

The Billboard Rankings app runs in two environments:

| Environment | URL | Server | Compose file |
|---|---|---|---|
| Local dev | http://localhost | Your local machine | `docker-compose.prod.yml` |
| Production | http://143.244.163.190 | DigitalOcean Droplet | `docker-compose.prod.yml` |

Both environments use the **same Supabase PostgreSQL instance** for ratings data. There is no separate local database — any vote cast locally is stored in the same DB as production.

---

## Architecture

```
Browser
  └── nginx (port 80)          ← billboardrankings-web container
        ├── /api/*  → proxy → Express (port 3001)  ← billboardrankings-node container
        └── /*      → static files (public/)
                                      ↓
                              Supabase PostgreSQL
                         (ratings DB — cloud, always on)
```

Two containers run in both environments:
- **billboardrankings-web** — nginx; serves static HTML/CSS/JS and proxies `/api/*` to node
- **billboardrankings-node** — Express.js API server; connects to Supabase for ratings

---

## Local Dev — Starting and Stopping

All commands must be run from the project directory:
```bash
cd ~/billboardrankings
```

**Start:**
```bash
docker compose -f docker-compose.prod.yml up -d
```

**Start with rebuild** (after any code change):
```bash
docker compose -f docker-compose.prod.yml up --build -d
```

**Stop:**
```bash
docker compose -f docker-compose.prod.yml down
```

**View logs:**
```bash
docker compose -f docker-compose.prod.yml logs node --tail=50
docker compose -f docker-compose.prod.yml logs web --tail=50
```

**Check running containers:**
```bash
docker ps
```

App is available at **http://localhost** (port 80).

---

## Production (DigitalOcean) — Starting and Stopping

**Access the server:**

SSH is configured with a key stored on the machine used to originally set up the droplet. If SSH is unavailable, use the **DigitalOcean browser console**:
- Log in to digitalocean.com → Droplets → billboard-1970-1999 → Console

Once on the server:
```bash
cd /root/billboard_1970_1999
```

**Start:**
```bash
docker compose -f docker-compose.prod.yml up -d
```

**Start with rebuild:**
```bash
docker compose -f docker-compose.prod.yml up --build -d
```

**Stop:**
```bash
docker compose -f docker-compose.prod.yml down
```

**View logs:**
```bash
docker logs billboard_1970_1999-node-1 --tail=50
```

**Check running containers:**
```bash
docker ps
```

### Auto-restart
Both containers are set to `restart: unless-stopped`. This means:
- They start automatically when the server reboots
- You only need to manually start them if they were explicitly stopped with `docker compose down`

---

## Supabase — Important Details

**Project:** `kaauajqojxvtdvspyber` (visible in the connection string)
**Host:** `aws-1-us-east-1.pooler.supabase.com:6543`
**Database:** `postgres`
**User:** `postgres.kaauajqojxvtdvspyber`

The connection string format is:
```
postgresql://postgres.kaauajqojxvtdvspyber:PASSWORD@aws-1-us-east-1.pooler.supabase.com:6543/postgres
```

### .env file (both environments)
The `.env` file must contain `DATABASE_URL` with no brackets around the password:
```
DATABASE_URL=postgresql://postgres.kaauajqojxvtdvspyber:PASSWORD@aws-1-us-east-1.pooler.supabase.com:6543/postgres
```

**Common mistakes to avoid:**
- Do NOT wrap the password in brackets: `[PASSWORD]` — this will cause authentication failures
- Do NOT use `DATBASE_URL` (typo) — it must be `DATABASE_URL`
- Special characters in the password (`[`, `]`, `@`, `#`, etc.) must be URL-encoded if used

### SSL
`ratingsDb.js` connects with `ssl: { rejectUnauthorized: false }` — required for Supabase's pooler endpoint.

### Schema
The ratings table is defined in `init-db.sql`. It was run once manually in the Supabase SQL editor during initial setup. It does not need to be run again unless the database is wiped.

---

## Troubleshooting

### Site is down / not loading
1. Check if containers are running: `docker ps`
2. If no containers listed, start them (see above)
3. If containers are running, check nginx logs: `docker compose logs web --tail=20`

### Ratings buttons do nothing / no response
1. Open browser DevTools → Network tab → click a thumb button → look for a failed `/api/ratings` request
2. Or test the API directly in the browser console:
   ```js
   fetch('/api/ratings?song=Le+Freak&artist=Chic').then(r => r.json()).then(console.log)
   ```
3. If you get `{"error":"ratings unavailable"}`, the node container can't reach Supabase

### `ratings unavailable` — database connection failing
Check node logs for the specific error:
```bash
docker logs billboard_1970_1999-node-1 --tail=20   # production
docker compose -f docker-compose.prod.yml logs node --tail=20  # local
```

Common errors and fixes:

| Error | Cause | Fix |
|---|---|---|
| `password authentication failed` | Wrong password or brackets in `.env` | Check `.env` — remove brackets, verify password in Supabase dashboard |
| `ENOTFOUND` / connection timeout | DATABASE_URL not set or wrong host | Check `docker exec <node-container> env \| grep DATABASE_URL` |
| `SSL` errors | SSL config mismatch | Verify `ratingsDb.js` has `ssl: { rejectUnauthorized: false }` |

### Verify what DATABASE_URL the container is actually using
```bash
# Local
docker exec billboardrankings-node-1 env | grep DATABASE_URL

# Production
docker exec billboard_1970_1999-node-1 env | grep DATABASE_URL
```

If the container has the wrong value, the `.env` change wasn't picked up — do a full `down` then `up`.

### Container won't start / crashes immediately
```bash
docker compose -f docker-compose.prod.yml logs node
```
Look for startup errors — missing env vars, port conflicts, or module load failures.

---

## Key Files

| File | Purpose |
|---|---|
| `.env` | Environment variables — `DATABASE_URL` for Supabase |
| `docker-compose.prod.yml` | Compose config for both local and production |
| `ratingsDb.js` | pg Pool — reads `DATABASE_URL` from environment |
| `routes/ratings.js` | GET / POST / DELETE `/api/ratings` handlers |
| `init-db.sql` | Ratings table schema — run once in Supabase SQL editor |
| `nginx.conf` | Proxies `/api/*` to node; serves static files |
