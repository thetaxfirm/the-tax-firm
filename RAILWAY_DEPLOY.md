# Deploying The Tax Firm to Railway

This is the full runbook for launching the site on Railway after the Manus
migration. Estimated time end-to-end: ~30–45 min, most of it one-time account setup.

## Architecture

```
Railway project "the-tax-firm"
├── Web service      → Dockerfile.web   → serves the site + API   → thetaxfirm.us
├── MySQL plugin     → provides DATABASE_URL
└── (optional) Sync service → Dockerfile → Google Drive → blog sync worker
```

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

*(AWS S3 works identically — just omit `S3_ENDPOINT` and use a real region.)*

---

## Step 3 — Railway project + MySQL

1. <https://railway.app> → **New Project → Deploy from GitHub repo** →
   `thetaxfirm/the-tax-firm`, branch `claude/project-context-y3h9vk` (or `main`
   once merged).
2. In the service that Railway creates for the web app: **Settings → Build →**
   set **Builder: Dockerfile** and **Dockerfile Path: `Dockerfile.web`**.
3. Add a database: **New → Database → Add MySQL**. Railway creates it and exposes
   a connection string. Reference it from the web service as `DATABASE_URL`
   (use the private/internal URL Railway provides, or the public one for migrations).

---

## Step 4 — Set environment variables on the web service

Paste these into the web service's **Variables** tab. Values marked *(generated)*
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

# Branding (optional)
VITE_APP_TITLE        = The Tax Firm
```

> **Important:** `VITE_GOOGLE_CLIENT_ID` must be set *before the build* — it is
> compiled into the client bundle. If you add it after the first build, trigger a
> redeploy so it takes effect.

---

## Step 5 — Create the database schema

The MySQL database starts empty. Push the schema once:

- **Option A (locally):** with the Railway MySQL *public* URL exported:
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
- The blog-sync worker (`Dockerfile`, `scripts/sync-drive-blog.ts`) is independent;
  deploy it as a second Railway service only if you use the Google Drive → blog flow.
- Full variable reference: `ENV_TEMPLATE.md`.
```
