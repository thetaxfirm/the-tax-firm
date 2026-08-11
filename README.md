# The Tax Firm — Premium Tax Strategy Website

A full-stack premium website for The Tax Firm (thetaxfirm.us), featuring a dark luxury "Midnight Boardroom" aesthetic, interactive calculators, client portal, blog/CMS system, and CRM integration.

## 🏗️ Tech Stack

- **Frontend:** React 19, TypeScript, TailwindCSS 4, Framer Motion, Wouter (routing)
- **Backend:** Express.js, Node.js, tRPC 11
- **Database:** MySQL/TiDB via Drizzle ORM
- **Storage:** AWS S3 for file uploads
- **Auth:** Manus OAuth (replaceable with any OAuth provider)
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
- AWS S3 bucket (for file storage)

## 🔧 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL=mysql://user:password@host:port/database

# Authentication
JWT_SECRET=your-jwt-secret
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=your-oauth-server-url
VITE_OAUTH_PORTAL_URL=your-oauth-portal-url

# Owner Info
OWNER_OPEN_ID=owner-open-id
OWNER_NAME=Christopher Craig

# Built-in APIs (LLM, Storage, Notifications)
BUILT_IN_FORGE_API_URL=your-forge-api-url
BUILT_IN_FORGE_API_KEY=your-forge-api-key
VITE_FRONTEND_FORGE_API_KEY=your-frontend-forge-key
VITE_FRONTEND_FORGE_API_URL=your-frontend-forge-url

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

### Option 1: Manus (Current - Recommended)
The site is currently hosted on Manus at thetaxfirm.us with built-in hosting, SSL, and custom domain support.

### Option 2: Vercel
1. Push code to GitHub
2. Import the repository in Vercel
3. Set all environment variables in Vercel's dashboard
4. Vercel will auto-detect the `vercel.json` configuration
5. Deploy

### Option 3: Railway / Render / Fly.io
Use the included `Dockerfile` for containerized deployment:
```bash
docker build -t the-tax-firm .
docker run -p 3000:3000 --env-file .env the-tax-firm
```

### Option 4: Claude / AI-Assisted Development
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
│   ├── _core/               # Framework plumbing (OAuth, context, etc.)
│   ├── routers.ts           # tRPC procedures
│   ├── db.ts                # Database query helpers
│   ├── blogApi.ts           # REST API for blog publishing
│   ├── ghl.ts               # GoHighLevel CRM integration
│   └── storage.ts           # S3 file storage helpers
├── drizzle/                 # Database schema & migrations
├── scripts/                 # Utility scripts (sitemap, Drive sync)
├── shared/                  # Shared types & constants
├── Dockerfile               # Container deployment
├── vercel.json              # Vercel deployment config
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
