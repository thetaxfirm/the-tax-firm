# The Tax Firm - Blog Auto-Publisher Guide

## Overview

This project includes a Google Drive to Blog sync system that automatically publishes blog articles from a shared Google Drive folder to The Tax Firm website via the Blog REST API.

## Architecture

```
Google Drive Folder ──> Sync Script (Railway) ──> Blog REST API (thetaxfirm.us)
                              │
                        Railway Volume
                       /app/data/published.json
                      (anti-duplicate tracking)
```

## Components

### 1. Blog REST API

**File:** `server/blogApi.ts`

Endpoints (all under `/api/blog/`):

| Method | Endpoint                   | Auth         | Description                      |
| ------ | -------------------------- | ------------ | -------------------------------- |
| POST   | `/api/blog/articles`       | Bearer token | Create or upsert article by slug |
| GET    | `/api/blog/articles`       | None         | List published articles          |
| GET    | `/api/blog/articles/:slug` | None         | Get single article               |
| PUT    | `/api/blog/articles/:slug` | Bearer token | Update article                   |
| DELETE | `/api/blog/articles/:slug` | Bearer token | Delete article                   |

**Required fields for POST:** `title`, `content` (markdown)

**Optional fields:** `slug`, `excerpt`, `category`, `readTime`, `author`, `authorRole`, `featured`, `image`, `status`, `source`, `externalId`, `metaTitle`, `metaDescription`, `tags`, `publishedAt`

### 2. Sync Script

**File:** `scripts/sync-drive-blog.ts`

Runs on Railway as a long-lived service with:

- HTTP server for health checks and manual control
- Automatic sync every 24 hours
- Anti-duplicate system with persistent volume

**Two modes:**

- `pnpm sync:blog` — one-shot sync (for testing/cron)
- `pnpm sync:blog:serve` — long-running server + scheduled sync (production)

### 3. Anti-Duplicate System

Prevents re-publishing articles when Railway redeploys containers.

**Three layers:**

1. **Railway Volume** mounted at `/app/data` — persists `published.json` across deploys
2. **Double-check by ID + title** — if a Google Doc is re-created with a new Drive ID but same title, it's still recognized as a duplicate
3. **Seed endpoint** — if volume data is lost, restore state via API

### 4. Management Endpoints (on Railway service)

| Method | Endpoint          | Auth         | Description               |
| ------ | ----------------- | ------------ | ------------------------- |
| GET    | `/health`         | None         | Health check              |
| GET    | `/published`      | None         | List all tracked articles |
| POST   | `/published/seed` | Bearer token | Restore published state   |
| POST   | `/sync`           | Bearer token | Trigger sync manually     |

## Google Drive Setup

**Folder:** `chris@thetaxfirm.us` ([link](https://drive.google.com/drive/folders/12mg17mM2jhXizwjAfsr8sqQTOhuxoQ6K))

**Supported file types:**

- Google Docs (exported as plain text)
- `.md`, `.txt` files (downloaded directly)
- Images and other files are skipped

**Naming convention:**

- Simple: `Article Title Here` → title = "Article Title Here", category = "Tax Strategy"
- With category: `[Real Estate] Cost Segregation Guide` → title = "Cost Segregation Guide", category = "Real Estate"

## Environment Variables

### For the main site (thetaxfirm.us)

| Variable                                     | Description                |
| -------------------------------------------- | -------------------------- |
| `DATABASE_URL`                               | MySQL connection string    |
| `BLOG_API_KEY`                               | API key for blog endpoints |
| `JWT_SECRET`                                 | Cookie/session secret      |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (server-only)     |
| `GOOGLE_CLIENT_SECRET`                       | Google OAuth client secret |
| `GHL_API_KEY`                                | GoHighLevel CRM API key    |
| `GHL_LOCATION_ID`                            | GoHighLevel location ID    |

### For the sync service (Railway)

| Variable          | Value                               |
| ----------------- | ----------------------------------- |
| `GOOGLE_API_KEY`  | Google API key for Drive access     |
| `DRIVE_FOLDER_ID` | `12mg17mM2jhXizwjAfsr8sqQTOhuxoQ6K` |
| `BLOG_API_URL`    | `https://thetaxfirm.us/api/blog`    |
| `BLOG_API_KEY`    | Blog API bearer token               |
| `DATA_DIR`        | `/app/data` (Railway volume mount)  |
| `PORT`            | `8080`                              |

## Railway Deployment

**Project:** `supportive-forgiveness` (rename in Railway dashboard)
**Service:** `manus-autopublisher` (legacy name; rename in the Railway dashboard)
**Volume:** `manus-autopublisher-volume` mounted at `/app/data`

### Deploy updates

```bash
cd ~/Desktop/Project/the-tax-firm
railway up -d
```

### Check logs

```bash
railway service logs
```

### Trigger manual sync

```bash
curl -X POST https://<railway-url>/sync \
  -H "Authorization: Bearer <BLOG_API_KEY>"
```

### Restore published state (if volume lost)

```bash
curl -X POST https://<railway-url>/published/seed \
  -H "Authorization: Bearer <BLOG_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"articles": [{"id": "gdrive:FILE_ID", "title": "Article Title"}]}'
```

## Current Status

**What works:**

- Sync script connects to Google Drive and reads files
- Anti-duplicate tracking with persistent volume
- Railway deployment with auto-restart
- File type filtering (skips images, only processes docs)

**Historical note:**

- The Blog API used to return HTML instead of JSON on `thetaxfirm.us`, because the
  site was served as a static build with no Express server behind it. That is
  resolved: the site now runs as a persistent Express server on Railway, so
  `/api/blog/*` is served by the same process that serves the pages.

## Local Development

```bash
# Install dependencies
pnpm install

# Start dev server (site)
pnpm dev
# -> http://localhost:3000

# Test blog sync locally
DATA_DIR=./data pnpm sync:blog

# Run sync in server mode locally
DATA_DIR=./data pnpm sync:blog:serve
```

## File Structure

```
scripts/
  sync-drive-blog.ts    — Google Drive to Blog sync script
server/
  blogApi.ts            — Blog REST API endpoints
  db.ts                 — Database layer (Drizzle ORM + MySQL)
Dockerfile              — Container for Railway sync service
```
