# The Tax Firm — Premium Tax Strategy Website

A full-stack premium website for The Tax Firm (thetaxfirm.us), featuring a dark luxury "Midnight Boardroom" aesthetic, interactive calculators, client portal, blog/CMS system, and CRM integration.

## 🏗️ Tech Stack

- **Frontend:** React 19, TypeScript, TailwindCSS 4, Framer Motion, Wouter (routing)
- **Backend:** Express.js, Node.js, tRPC 11
- **Database:** MySQL/TiDB via Drizzle ORM
- **Storage:** Any S3-compatible object store (Cloudflare R2, AWS S3, Backblaze B2, MinIO)
- **Auth:** Google OAuth 2.0 + self-contained HS256 session cookies
- **Email:** Resend (owner notifications)
- **External Integrations:** Calendly, GoHighLevel CRM, Google Drive sync

## 🚀 Features

### Public Website

- Premium dark luxury design (midnight navy #0B1120 + amber-gold #D4A853)
- Animated hero with live statistics
- Service pages: Tax Strategy, Fractional CFO, Bookkeeping
- Interactive tax savings calculator
- ROI calculator for Fractional CFO services
- Dynamic pricing calculator for Bookkeeping
- 12+ in-depth blog articles with SEO optimization
- 8-question FAQ accordion
- Auto-rotating testimonials carousel
- Social media integration (Facebook, LinkedIn, Instagram)

### Client Portal

- Secure login with session management
- Document upload with progress bar and ETA
- Engagement status tracking
- Real-time messaging with the team
- Admin management dashboard

### Blog/CMS System

- Static articles + database-driven dynamic articles
- REST API for external publishing (Tely.ai integration)
- Google Drive sync for automated content publishing
- Category filtering, search, social sharing
- SEO: JSON-LD structured data, dynamic sitemap, Open Graph tags

### CRM Integration

- Pre-booking questionnaire (9 questions)
- Auto-creates contacts in GoHighLevel with smart tags
- Admin dashboard for reviewing submissions
- CSV export, status management, email notifications

## 📋 Prerequisites

- Node.js 20+
- pnpm 10+
- MySQL/TiDB database
- An S3-compatible bucket (for file storage)
- A Google OAuth 2.0 client (for sign-in)

## 🔧 Environment Variables

[`ENV_TEMPLATE.md`](ENV_TEMPLATE.md) is the full reference. For local development,
create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=mysql://user:password@host:port/database

# Authentication — Google OAuth 2.0
JWT_SECRET=a-long-random-string          # openssl rand -hex 32
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
ADMIN_EMAILS=chris@thetaxfirm.us         # comma-separated, granted the admin role

# Object storage (S3-compatible: R2, S3, B2, MinIO)
S3_BUCKET=thetaxfirm-uploads
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_ENDPOINT=https://<accountid>.r2.cloudflarestorage.com   # omit for AWS S3
S3_REGION=auto
S3_PUBLIC_URL=https://cdn.thetaxfirm.us

# Owner notifications (Resend) — optional
RESEND_API_KEY=re_...
NOTIFY_EMAIL_TO=chris@thetaxfirm.us
NOTIFY_EMAIL_FROM=The Tax Firm <notify@thetaxfirm.us>
OWNER_EMAIL=chris@thetaxfirm.us

# GoHighLevel CRM
GHL_API_KEY=your-ghl-api-key
GHL_LOCATION_ID=hf2fpQyPswcNJOmnqRFR

# Blog API (for external publishing)
BLOG_API_KEY=your-blog-api-key
```

The client reads no environment variables at all — sign-in starts at the
server-rendered `GET /api/oauth/login` — so nothing is baked into the bundle and
no variable needs to be present at build time. The page title and metadata are
in `client/index.html`.

Google OAuth needs an **Authorized redirect URI** of `<origin>/api/oauth/callback`
for every domain the app runs on, including `http://localhost:3000/api/oauth/callback`.

## 🏃 Local Development

```bash
# Install dependencies
pnpm install

# Push database schema
pnpm db:push

# Start development server
pnpm dev
```

The dev server runs at http://localhost:3000 with hot module replacement.

## 🏗️ Build & Production

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## 🚀 Deployment

**Railway is the production host.** The app runs there as a persistent
Express + tRPC server — one long-lived process that serves both the API and the
built client — with an optional second service for the Google Drive blog-sync
worker. There is no serverless deployment path.

| Railway service   | Built from        | Command                | Role                                  |
| ----------------- | ----------------- | ---------------------- | ------------------------------------- |
| Web (required)    | `Dockerfile`      | `pnpm start`           | Serves the site + API on `$PORT`      |
| Sync (optional)   | `Dockerfile.sync` | `pnpm sync:blog:serve` | Google Drive → blog article sync      |
| MySQL plugin      | —                 | —                      | Provides `DATABASE_URL`               |

`railway.toml` points the web service at `Dockerfile`. Railway applies that
root config to every service, so the sync service must override it — point its
**Settings → Config as code** at `railway.sync.toml`, which selects
`Dockerfile.sync`.

Internally the server is split so the app itself owns no hosting concerns:
`server/_core/app.ts` exports `createApp()`, which builds the Express app with
every API route but binds no port and serves no static files;
`server/_core/index.ts` wraps it — running pending database migrations, serving
`dist/public`, and binding `0.0.0.0:$PORT`.

See [`RAILWAY_DEPLOY.md`](RAILWAY_DEPLOY.md) for the full runbook (Google OAuth
client, R2 bucket, environment variables, schema push, domain cutover).

To run the production image locally:

```bash
docker build -t the-tax-firm .
docker run -p 3000:3000 --env-file .env the-tax-firm
```

### Working with Claude / AI assistants

This codebase is structured for AI-assisted development:

- Clear file organization with descriptive names
- TypeScript throughout for type safety
- tRPC for end-to-end type-safe API calls
- Comprehensive test suite (69+ tests)
- `todo.md` tracks all features and their completion status

To work with Claude or another AI assistant:

1. Clone the repository
2. Share the README and relevant files for context
3. The AI can modify, extend, or debug any part of the codebase
4. Run `pnpm test` to verify changes
5. Push to GitHub and deploy

## 📁 Project Structure

```
├── client/                  # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page-level components
│   │   ├── data/            # Static data (blog posts, etc.)
│   │   ├── lib/             # Utilities (tRPC client)
│   │   └── _core/           # Auth hooks
│   └── index.html           # HTML entry point
├── server/                  # Backend (Express + tRPC)
│   ├── _core/
│   │   ├── app.ts           # createApp() — routes only, no host concerns
│   │   ├── index.ts         # Production entry (migrations, static, $PORT)
│   │   ├── googleAuth.ts    # Google OAuth code exchange + id_token verify
│   │   └── ...              # Context, tRPC, cookies, sitemap, migrations
│   ├── routers.ts           # tRPC procedures
│   ├── db.ts                # Database query helpers
│   ├── blogApi.ts           # REST API for blog publishing
│   ├── ghl.ts               # GoHighLevel CRM integration
│   └── storage.ts           # S3-compatible object storage helpers
├── drizzle/                 # Database schema & migrations
├── scripts/                 # Utility scripts (sitemap, Drive sync)
├── shared/                  # Shared types & constants
├── Dockerfile               # Railway web service (Express + built client)
├── Dockerfile.sync          # Railway sync worker (Google Drive → blog)
├── railway.toml             # Railway config for the web service
├── railway.sync.toml        # Railway config for the sync worker service
├── ENV_TEMPLATE.md          # Environment variable reference
├── RAILWAY_DEPLOY.md        # Deployment runbook
└── todo.md                  # Feature tracking
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test server/portal.test.ts
```

## 📡 Blog API

External services (like Tely.ai) can publish articles via the REST API:

```bash
# Create/update an article
curl -X POST https://thetaxfirm.us/api/blog/articles \
  -H "Authorization: Bearer YOUR_BLOG_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Your Article Title",
    "content": "Full article content in markdown or HTML...",
    "category": "Tax Strategy",
    "author": "Christopher Craig"
  }'

# List all articles
curl https://thetaxfirm.us/api/blog/articles

# Get single article
curl https://thetaxfirm.us/api/blog/articles/your-article-slug

# Update article
curl -X PUT https://thetaxfirm.us/api/blog/articles/your-article-slug \
  -H "Authorization: Bearer YOUR_BLOG_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title"}'

# Delete article
curl -X DELETE https://thetaxfirm.us/api/blog/articles/your-article-slug \
  -H "Authorization: Bearer YOUR_BLOG_API_KEY"
```

## 📞 Contact

- **Owner:** Christopher Craig, Enrolled Agent (EA License #131056)
- **Email:** chris@thetaxfirm.us
- **Phone:** (702) 498-2144
- **Website:** https://thetaxfirm.us
- **Calendly:** https://calendly.com/chriscraig702

## 📄 License

MIT
