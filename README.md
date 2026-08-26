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
VITE_GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com   # same value, frontend
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
OWNER_NAME=Christopher Craig

# GoHighLevel CRM
GHL_API_KEY=your-ghl-api-key
GHL_LOCATION_ID=hf2fpQyPswcNJOmnqRFR

# Blog API (for external publishing)
BLOG_API_KEY=your-blog-api-key

# App Branding
VITE_APP_TITLE=The Tax Firm
VITE_APP_LOGO=your-logo-url

# Analytics (optional)
VITE_ANALYTICS_ENDPOINT=your-analytics-endpoint
VITE_ANALYTICS_WEBSITE_ID=your-analytics-id
```

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

## 🚀 Deployment Options

The app is host-agnostic: `server/_core/app.ts` exports `createApp()`, which
builds the Express app with every API route but binds no port and serves no
static files. Each host wraps it:

| Host                    | Entry point                                               | Serves the client from           |
| ----------------------- | --------------------------------------------------------- | -------------------------------- |
| Vercel                  | `api/index.ts` (exports the app as a serverless function) | Vercel's CDN, from `dist/public` |
| Railway / any container | `server/_core/index.ts` (`pnpm start`)                    | `express.static(dist/public)`    |

### Option 1: Vercel (primary)

1. Push code to GitHub and import the repository in Vercel.
2. Set the environment variables from [`VERCEL_ENV_VARS.txt`](VERCEL_ENV_VARS.txt)
   in Project Settings → Environment Variables. `VITE_*` values are baked into
   the client bundle at build time, so they must be set before the first deploy.
3. Vercel picks up `vercel.json`: `pnpm build` produces the client into
   `dist/public` (the output directory) and `api/index.ts` is deployed as the
   single Node function that answers `/api/*`. Everything else falls back to
   `index.html` for client-side routing.
4. Deploy.

### Option 2: Railway / Render / Fly.io

Use the included `Dockerfile` for containerized deployment — see
[`RAILWAY_DEPLOY.md`](RAILWAY_DEPLOY.md) for the full runbook.

```bash
docker build -t the-tax-firm .
docker run -p 3000:3000 --env-file .env the-tax-firm
```

### Option 3: Claude / AI-Assisted Development

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
├── api/                     # Vercel serverless entry (wraps createApp())
├── server/                  # Backend (Express + tRPC)
│   ├── _core/
│   │   ├── app.ts           # createApp() — host-agnostic Express app
│   │   ├── index.ts         # Long-running entry (port + static files)
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
├── Dockerfile               # Container deployment (web app)
├── Dockerfile.sync          # Container for the Google Drive blog-sync worker
├── vercel.json              # Vercel deployment config
├── ENV_TEMPLATE.md          # Environment variable reference
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
