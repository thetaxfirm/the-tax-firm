# Deploying The Tax Firm to Railway

This is the full runbook for launching the site on Railway. **Railway is the
single production host** — the site no longer deploys to Manus or Vercel.
Estimated time end-to-end: ~30–45 min, most of it one-time account setup.

## Architecture

```
Railway project "the-tax-firm"
├── Web service      → Dockerfile       → serves the site + API   → thetaxfirm.us
├── MySQL plugin     → provides DATABASE_URL
└── (optional) Sync service → Dockerfile.sync → Google Drive → blog sync worker
```

The web service is one long-lived Node process (`pnpm start` →
`server/_core/index.ts`). On boot it applies any pending database migrations,
serves the built client from `dist/public`, and binds `0.0.0.0:$PORT` using the
port Railway injects. Migrations are idempotent — drizzle records applied ones
in a `__drizzle_migrations` table — so restarts and redeploys are safe.

External accounts you'll create: a **Google OAuth client** (sign-in) and an
**S3-compatible bucket** (Cloudflare R2 recommended, for uploads).

---

## Step 1 — Google OAuth client (sign-in)

1. Go to <https://console.cloud.google.com/> → create/select a project.
2. **APIs & Services → OAuth consent screen** → External → fill app name
   ("The Tax Firm"), support email, developer email → Save. (You can leave it in
   "Testing" and add yourself as a test user, or Publish for public access.)
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
   - Application type: **Web application**
   - **Authorized redirect URIs** — add every domain the app runs on:
     - `https://thetaxfirm.us/api/oauth/callback`
     - `https://<your-railway-subdomain>.up.railway.app/api/oauth/callback`
     - `http://localhost:3000/api/oauth/callback` (local dev)
4. Copy the **Client ID** and **Client secret**.

> The Client ID goes into BOTH `GOOGLE_CLIENT_ID` (server) and
> `VITE_GOOGLE_CLIENT_ID` (frontend, baked at build). The secret is server-only.

---

## Step 2 — Object storage (Cloudflare R2)

1. Cloudflare dashboard → **R2 → Create bucket** (e.g. `thetaxfirm-uploads`).
2. **R2 → Manage API Tokens → Create API Token** (Object Read & Write). Copy the
   **Access Key ID** and **Secret Access Key**, and note your **account ID**.
3. For durable blog-image URLs, enable public access on the bucket
   (R2 → bucket → Settings → Public access / custom domain) and copy the public URL.
4. Values:
   - `S3_BUCKET` = bucket name
   - `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` = the token above
   - `S3_ENDPOINT` = `https://<accountid>.r2.cloudflarestorage.com`
   - `S3_REGION` = `auto`
   - `S3_PUBLIC_URL` = the bucket's public URL (or custom domain)

_(AWS S3 works identically — just omit `S3_ENDPOINT` and use a real region.)_

---

## Step 3 — Railway project + MySQL

1. <https://railway.app> → **New Project → Deploy from GitHub repo** →
   `thetaxfirm/the-tax-firm`, branch `main`.
2. The web app builds from **`Dockerfile`**, which `railway.toml` already points
   to — no build settings to change.

   > Railway applies the repo-root `railway.toml` to **every** service in the
   > project. If you also run the blog-sync worker, that service must override
   > it: **Settings → Config as code** → `railway.sync.toml`, which selects
   > `Dockerfile.sync`. Without that override the worker service would build the
   > web app instead.
3. Add a database: **New → Database → Add MySQL**. Railway creates it and exposes
   a connection string. Reference it from the web service as `DATABASE_URL`
   (use the private/internal URL Railway provides, or the public one for migrations).

---

## Step 4 — Set environment variables on the web service

Paste these into the web service's **Variables** tab. Values marked _(generated)_
were created for you; the rest come from Steps 1–2 and your existing keys.

```
# Core
DATABASE_URL          = <from Railway MySQL plugin>
JWT_SECRET            = <generated — see handoff message>
BLOG_API_KEY          = <generated — see handoff message>

# Google sign-in  (Client ID goes in BOTH of these)
GOOGLE_CLIENT_ID      = <from Step 1>
VITE_GOOGLE_CLIENT_ID = <same value as GOOGLE_CLIENT_ID>
GOOGLE_CLIENT_SECRET  = <from Step 1>
ADMIN_EMAILS          = chris@thetaxfirm.us

# GoHighLevel CRM
GHL_API_KEY           = <your GHL token>
GHL_LOCATION_ID       = hf2fpQyPswcNJOmnqRFR

# Object storage (Step 2)
S3_BUCKET             = thetaxfirm-uploads
S3_ACCESS_KEY_ID      = <from Step 2>
S3_SECRET_ACCESS_KEY  = <from Step 2>
S3_ENDPOINT           = https://<accountid>.r2.cloudflarestorage.com
S3_REGION             = auto
S3_PUBLIC_URL         = <bucket public URL>

# Email notifications (optional; skip and alerts are simply not sent)
RESEND_API_KEY        = <resend.com key>
NOTIFY_EMAIL_TO       = chris@thetaxfirm.us
NOTIFY_EMAIL_FROM     = The Tax Firm <notify@thetaxfirm.us>
OWNER_EMAIL           = chris@thetaxfirm.us
```

That is the complete set. `VITE_GOOGLE_CLIENT_ID` is the only `VITE_*` variable
the client reads — there is nothing to configure for branding or analytics.

> **Important:** `VITE_GOOGLE_CLIENT_ID` must be set _before the build_ — it is
> compiled into the client bundle. If you add it after the first build, trigger a
> redeploy so it takes effect.

---

## Step 5 — Create the database schema

The MySQL database starts empty. Push the schema once:

- **Option A (locally):** with the Railway MySQL _public_ URL exported:
  ```bash
  DATABASE_URL='mysql://…public…' pnpm db:push
  ```
- **Option B (Railway one-off):** run `pnpm db:push` as a one-off command in the
  service shell.

This creates the `users`, `questionnaire_responses`, `engagements`, `documents`,
`messages`, and `blog_articles` tables.

---

## Step 6 — Domain cutover (thetaxfirm.us)

1. Web service → **Settings → Networking → Custom Domain** → add `thetaxfirm.us`
   (and `www.thetaxfirm.us`). Railway shows a CNAME target.
2. In **GoDaddy DNS**, point the domain at Railway's target:
   - `www` → CNAME → `<railway-target>`
   - apex `@` → use GoDaddy forwarding to `www`, or an ALIAS/ANAME if available.
3. Add `https://thetaxfirm.us/api/oauth/callback` to the Google OAuth redirect
   URIs (Step 1) if not already there.

Test on the temporary `*.up.railway.app` URL first, then cut the domain over.

---

## Step 7 — Verify

- [ ] Home, service pages, blog render
- [ ] Questionnaire submits → row in DB **and** a contact appears in GoHighLevel
- [ ] "Sign in" → Google → returns logged in; your account shows as **admin**
- [ ] Client portal: upload a document → downloads back (storage works)
- [ ] `https://thetaxfirm.us/api/blog/articles` returns **JSON** (not HTML) —
      the production API is now actually running, unlike the old static host

---

## Notes

- The old Manus/Forge variables (`BUILT_IN_FORGE_*`, `VITE_FRONTEND_FORGE_*`,
  `OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL`, `VITE_APP_ID`) are obsolete — don't set them.
- The blog-sync worker (`Dockerfile.sync`, `scripts/sync-drive-blog.ts`) is
  independent; deploy it as a second Railway service (config as code →
  `railway.sync.toml`) only if you use the Google Drive → blog flow.
- Full variable reference: `ENV_TEMPLATE.md`.

---

## Decommissioning Vercel

The repo no longer contains `vercel.json` or any serverless entry point, so the
Vercel project can no longer build this app. Once Railway is serving
`thetaxfirm.us`:

1. Confirm the Railway deploy answers on the custom domain (Step 7).
2. Delete the Vercel project (or at minimum disconnect the GitHub integration so
   it stops attempting a build on every push).
3. The Vercel-only environment variables disappear with the project; nothing in
   this repo reads them.

```

```
