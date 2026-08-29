# Claude Development Prompt — The Tax Firm

Use this document when working with Claude (or any AI assistant) to make updates to The Tax Firm website codebase.

---

## Project Overview

**The Tax Firm** (thetaxfirm.us) is a premium full-stack website for a tax strategy and planning firm led by Christopher Craig, an IRS Enrolled Agent (License #131056) based in Las Vegas, NV.

**Design Language:** "Midnight Boardroom" — dark luxury aesthetic with midnight navy (#0B1120) background, amber-gold (#D4A853) accents, glass-morphism effects, and professional typography (DM Serif Display for headings, DM Sans for body).

---

## Tech Stack

| Layer           | Technology                   | Notes                                                  |
| --------------- | ---------------------------- | ------------------------------------------------------ |
| Frontend        | React 19 + TypeScript        | SPA with client-side routing via Wouter                |
| Styling         | TailwindCSS 4                | Custom dark theme, glass-card utilities                |
| Animation       | Framer Motion                | Scroll-triggered animations, hover effects             |
| Backend         | Express.js + tRPC 11         | Type-safe API, procedures in `server/routers.ts`       |
| Database        | MySQL/TiDB + Drizzle ORM     | Schema in `drizzle/schema.ts`                          |
| Storage         | S3-compatible (R2 / S3 / B2) | File uploads via `server/storage.ts` helpers           |
| Auth            | Google OAuth 2.0             | HS256 session cookies, `protectedProcedure` for auth   |
| Email           | Resend                       | Owner notifications via `server/_core/notification.ts` |
| Package Manager | pnpm 10                      | Lockfile: `pnpm-lock.yaml`                             |
| Testing         | Vitest                       | Tests in `server/*.test.ts`                            |

---

## File Structure & Key Files

```
the-tax-firm/
├── client/
│   ├── index.html                    # HTML shell with meta tags, fonts, analytics
│   └── src/
│       ├── App.tsx                    # Routes & layout (Wouter)
│       ├── index.css                  # Global styles, Tailwind theme, custom utilities
│       ├── components/
│       │   ├── Navbar.tsx             # Main navigation (responsive, auth-aware)
│       │   ├── Hero.tsx               # Hero section with animated stats
│       │   ├── Services.tsx           # Service cards (Asset Protection, Tax Mitigation, Wealth Building)
│       │   ├── About.tsx              # Christopher Craig bio, EA seal, social links
│       │   ├── TaxCalculator.tsx      # Interactive tax savings calculator
│       │   ├── Testimonials.tsx       # Auto-rotating testimonial carousel
│       │   ├── FAQ.tsx                # 8-question accordion
│       │   ├── BookingQuestionnaire.tsx # 9-step modal questionnaire → Calendly embed
│       │   ├── Footer.tsx             # Footer with social links
│       │   └── SEOHead.tsx            # Dynamic meta tags (title, description, OG, keywords)
│       ├── pages/
│       │   ├── Home.tsx               # Main landing page (composes all sections)
│       │   ├── Blog.tsx               # Blog listing with search & category filter
│       │   ├── BlogArticle.tsx        # Individual article renderer (markdown + tables)
│       │   ├── FractionalCFOPage.tsx  # Service page with ROI calculator
│       │   ├── BookkeepingPage.tsx    # Service page with pricing calculator
│       │   ├── Portal.tsx             # Client portal (documents, messages, engagements)
│       │   ├── AdminResponses.tsx     # Admin: questionnaire submissions
│       │   └── AdminPortal.tsx        # Admin: client portal management
│       ├── data/
│       │   └── blogPosts.ts           # Static blog articles (12+ articles)
│       └── lib/
│           └── trpc.ts               # tRPC client binding
├── server/
│   ├── _core/                         # Framework internals (DO NOT EDIT unless extending)
│   │   ├── index.ts                   # Express server entry point
│   │   ├── env.ts                     # Environment variable access
│   │   ├── trpc.ts                    # tRPC router/procedure definitions
│   │   ├── context.ts                 # Request context (auth)
│   │   ├── oauth.ts                   # OAuth callback handler
│   │   ├── notification.ts            # Owner notification helper
│   │   ├── sitemap.ts                 # Dynamic sitemap generation
│   │   └── vite.ts                    # Dev/prod static serving
│   ├── routers.ts                     # ALL tRPC procedures (questionnaire, portal, blog admin)
│   ├── db.ts                          # Database query helpers (Drizzle)
│   ├── blogApi.ts                     # REST API for external blog publishing
│   ├── ghl.ts                         # GoHighLevel CRM integration
│   └── storage.ts                     # S3 upload/download helpers
├── drizzle/
│   └── schema.ts                      # Database tables (users, questionnaire_responses, engagements, documents, messages, blog_articles)
├── scripts/
│   ├── generate-sitemap.ts            # Static sitemap generator (build-time)
│   └── sync-drive-blog.ts            # Google Drive → blog sync script
├── shared/
│   └── const.ts                       # Shared constants
├── Dockerfile                         # Railway web service (Express + client)
├── Dockerfile.sync                    # Railway sync worker (Drive → blog)
├── railway.toml                       # Railway config — web service
├── railway.sync.toml                  # Railway config — sync worker service
└── todo.md                            # Feature tracking (checkbox format)
```

---

## Coding Standards

### General Rules

1. **TypeScript everywhere** — No `any` types. Use Zod for runtime validation.
2. **tRPC for all API calls** — Never use raw fetch/axios from the frontend. Use `trpc.*.useQuery()` or `trpc.*.useMutation()`.
3. **Drizzle ORM for database** — All queries go through `server/db.ts` helpers. Never write raw SQL in route handlers.
4. **S3 for file storage** — Never store file bytes in the database. Use `storagePut()` and save the URL/key in DB.
5. **Environment variables** — Access via `server/_core/env.ts`. Never hardcode secrets.

### Frontend Standards

- Use **shadcn/ui** components from `@/components/ui/*` for consistent UI
- Use **Framer Motion** for animations (scroll-triggered, hover, page transitions)
- Use **Wouter** for routing (not React Router)
- All pages must include `<SEOHead>` with title, description, and keywords
- Mobile-first responsive design with Tailwind breakpoints
- Color palette: midnight navy `#0B1120`, amber-gold `#D4A853`, white text `#FFFFFF`
- Glass-morphism: `bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl`

### Backend Standards

- Use `publicProcedure` for unauthenticated endpoints
- Use `protectedProcedure` for logged-in user endpoints
- Use `adminProcedure` for admin-only endpoints
- Validate all inputs with Zod schemas
- Return typed responses (Drizzle rows are auto-typed)
- Use `notifyOwner()` for important events (new submissions, uploads)

### Database Standards

- Schema changes: edit `drizzle/schema.ts` → run `pnpm db:push`
- All timestamps as UTC milliseconds (bigint)
- Use `text()` for variable-length strings, `varchar()` for fixed-length
- Foreign keys reference `users.id`
- Soft delete preferred (status field) over hard delete

### Testing Standards

- Test files: `server/*.test.ts`
- Use Vitest with `describe/it/expect`
- Test against the live dev server (not mocks) for integration tests
- Run `pnpm test` before committing
- All tests must pass before deployment

---

## Common Tasks

### Adding a New Page

1. Create `client/src/pages/NewPage.tsx`
2. Add route in `client/src/App.tsx`
3. Add navigation link in `Navbar.tsx` and/or `Footer.tsx`
4. Include `<SEOHead>` with appropriate meta tags
5. Add `[ ]` item to `todo.md`

### Adding a New API Endpoint

1. Add Zod schema + query helper in `server/db.ts`
2. Add procedure in `server/routers.ts`
3. Call from frontend with `trpc.newEndpoint.useQuery()` or `.useMutation()`
4. Write test in `server/newFeature.test.ts`
5. Run `pnpm test`

### Adding a New Database Table

1. Define table in `drizzle/schema.ts`
2. Run `pnpm db:push` to sync schema
3. Add query helpers in `server/db.ts`
4. Add tRPC procedures in `server/routers.ts`

### Adding a Blog Article (Static)

1. Add article object to `client/src/data/blogPosts.ts`
2. Follow the existing structure (slug, title, excerpt, content, category, readTime, author, date, image)
3. Content uses markdown with pipe tables supported

### Adding a Blog Article (API)

```bash
curl -X POST https://thetaxfirm.us/api/blog/articles \
  -H "Authorization: Bearer <BLOG_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"title": "...", "content": "...", "category": "Tax Strategy"}'
```

---

## External Integrations

| Service               | Purpose                                        | Config                                                                                  |
| --------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------- |
| GoHighLevel           | CRM — auto-creates contacts from questionnaire | `GHL_API_KEY`, `GHL_LOCATION_ID`                                                        |
| Calendly              | Appointment scheduling (embedded)              | Hardcoded URL: `https://calendly.com/chriscraig702`                                     |
| Tely.ai               | Automated blog publishing                      | Uses `BLOG_API_KEY` via REST API                                                        |
| Google Drive          | Blog content sync                              | `DRIVE_FOLDER_ID`, `GOOGLE_API_KEY`                                                     |
| S3-compatible storage | File storage (documents, images)               | `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_ENDPOINT`, `S3_PUBLIC_URL` |
| Google OAuth          | Sign-in (starts at `GET /api/oauth/login`)     | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`                     |
| Resend                | Owner email notifications                      | `RESEND_API_KEY`, `NOTIFY_EMAIL_TO`, `NOTIFY_EMAIL_FROM`                                |

---

## Design Tokens (Quick Reference)

```css
/* Colors */
--midnight-navy: #0b1120;
--amber-gold: #d4a853;
--text-primary: #ffffff;
--text-secondary: #94a3b8;
--card-bg: rgba(255, 255, 255, 0.05);
--card-border: rgba(255, 255, 255, 0.1);

/* Typography */
--font-heading: "DM Serif Display", serif;
--font-body: "DM Sans", sans-serif;

/* Spacing */
--section-padding: 6rem 0;
--container-max: 1280px;

/* Effects */
--glass: bg-white/5 backdrop-blur-sm border border-white/10;
--gold-glow: 0 0 20px rgba(212, 168, 83, 0.3);
```

---

## Deployment

**Railway is the only production host.** The app is a persistent Express + tRPC
server, not a serverless function — there is no Vercel or Manus deploy path.

| Railway service | Built from        | Command                | Config              |
| --------------- | ----------------- | ---------------------- | ------------------- |
| Web (required)  | `Dockerfile`      | `pnpm start`           | `railway.toml`      |
| Sync (optional) | `Dockerfile.sync` | `pnpm sync:blog:serve` | `railway.sync.toml` |

`server/_core/app.ts` exports `createApp()` — routes only, no port and no static
files. `server/_core/index.ts` is the production entry: it runs pending
migrations, serves `dist/public`, and binds `0.0.0.0:$PORT`. Runbook:
`RAILWAY_DEPLOY.md`.

---

## Important Notes

1. **Never hardcode ports** — Always use `process.env.PORT || "3000"`
2. **Never store images locally** — Upload to S3/CDN and use the returned URL
3. **The `server/_core/` directory is framework code** — Avoid editing unless extending infrastructure
4. **Static blog articles** in `blogPosts.ts` are merged with database articles on the frontend
5. **All booking CTAs** trigger the questionnaire modal, which shows Calendly after completion
6. **Admin access** requires `role: "admin"` in the users table
7. **The site is live at thetaxfirm.us** — Test changes locally before pushing

---

## Getting Started (for new developers)

```bash
# 1. Clone the repo
git clone https://github.com/thetaxfirm/the-tax-firm.git
cd the-tax-firm

# 2. Install dependencies
pnpm install

# 3. Set up environment variables (get values from team lead)
# See ENV_TEMPLATE.md for the full reference; create a .env file

# 4. Push database schema
pnpm db:push

# 5. Start dev server
pnpm dev

# 6. Run tests
pnpm test

# 7. Build for production
pnpm build && pnpm start
```
