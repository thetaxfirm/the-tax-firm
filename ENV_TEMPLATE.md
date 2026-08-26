# Environment Variables

Set these in your hosting provider's environment panel (Vercel / Railway / Render).
`VITE_`-prefixed variables are baked into the frontend bundle at build time; all
others are server-only. Never commit real values to git.

## Required

| Variable                | Description                                                   | Example                                                                  |
| ----------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `DATABASE_URL`          | MySQL/TiDB connection string (include SSL for prod)           | `mysql://user:pass@host:4000/thetaxfirm?ssl={"rejectUnauthorized":true}` |
| `JWT_SECRET`            | Secret for signing session cookies (use a long random string) | `openssl rand -hex 32`                                                   |
| `GOOGLE_CLIENT_ID`      | Google OAuth 2.0 client ID (server-side)                      | `xxxx.apps.googleusercontent.com`                                        |
| `VITE_GOOGLE_CLIENT_ID` | Same value as `GOOGLE_CLIENT_ID`, exposed to the frontend     | `xxxx.apps.googleusercontent.com`                                        |
| `GOOGLE_CLIENT_SECRET`  | Google OAuth 2.0 client secret                                | `GOCSPX-...`                                                             |
| `ADMIN_EMAILS`          | Comma-separated emails granted the `admin` role on sign-in    | `chris@thetaxfirm.us`                                                    |
| `GHL_API_KEY`           | GoHighLevel API key (JWT bearer token, no "Bearer " prefix)   | `eyJhbGci...`                                                            |
| `GHL_LOCATION_ID`       | GoHighLevel location ID                                       | `hf2fpQyPswcNJOmnqRFR`                                                   |
| `BLOG_API_KEY`          | Bearer token protecting `/api/blog` write endpoints           | random string                                                            |

## Object storage (portal document + blog image uploads)

S3-compatible — works with Cloudflare R2, AWS S3, Backblaze B2, etc.

| Variable               | Description                                                      | Example                                        |
| ---------------------- | ---------------------------------------------------------------- | ---------------------------------------------- |
| `S3_BUCKET`            | Bucket name                                                      | `thetaxfirm-uploads`                           |
| `S3_ACCESS_KEY_ID`     | Access key                                                       | —                                              |
| `S3_SECRET_ACCESS_KEY` | Secret key                                                       | —                                              |
| `S3_ENDPOINT`          | Custom endpoint. **Set for R2**, leave unset for AWS S3          | `https://<accountid>.r2.cloudflarestorage.com` |
| `S3_REGION`            | Region (`auto` for R2)                                           | `auto`                                         |
| `S3_PUBLIC_URL`        | Public base URL for objects (needed for durable blog image URLs) | `https://cdn.thetaxfirm.us`                    |
| `S3_FORCE_PATH_STYLE`  | `true` to force path-style addressing (some providers)           | `true`                                         |

## Email notifications (optional but recommended)

Owner alerts on new questionnaire submissions / blog posts, sent via [Resend](https://resend.com).
If unset, the underlying actions still succeed — the notification is simply skipped.

| Variable            | Description                                                 | Example                               |
| ------------------- | ----------------------------------------------------------- | ------------------------------------- |
| `RESEND_API_KEY`    | Resend API key                                              | `re_...`                              |
| `NOTIFY_EMAIL_TO`   | Recipient(s), comma-separated (falls back to `OWNER_EMAIL`) | `chris@thetaxfirm.us`                 |
| `NOTIFY_EMAIL_FROM` | Verified sender                                             | `The Tax Firm <notify@thetaxfirm.us>` |
| `OWNER_EMAIL`       | Owner email; default notification recipient                 | `chris@thetaxfirm.us`                 |

## Optional

| Variable         | Description                      | Default             |
| ---------------- | -------------------------------- | ------------------- |
| `PORT`           | Server port (long-running hosts) | `3000`              |
| `VITE_APP_TITLE` | Site title                       | `The Tax Firm`      |
| `VITE_APP_LOGO`  | Logo URL                         | —                   |
| `OWNER_NAME`     | Owner display name               | `Christopher Craig` |

## Notes

- The app no longer depends on any Manus / "Forge" service. `BUILT_IN_FORGE_*`,
  `VITE_FRONTEND_FORGE_*`, `OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL`, and
  `VITE_APP_ID` are read by no code and can be deleted from your hosting
  provider whenever convenient — leaving them set does no harm.
- `OWNER_OPEN_ID` still works (it grants the `admin` role to one openId), but
  openIds are now `google:<sub>`, so a value carried over from Manus will never
  match. Prefer `ADMIN_EMAILS`.
- Google OAuth requires an **Authorized redirect URI** of
  `https://YOUR_DOMAIN/api/oauth/callback` (add one per domain, including any
  preview/staging domain and `http://localhost:3000/api/oauth/callback` for local dev).
