# Environment Variables

Set these in the Railway service's **Variables** tab (see `RAILWAY_DEPLOY.md`).
Server secrets are read at runtime. Public `VITE_TELY_*` form connections are
compiled into the client bundle and require a rebuild. Never put private keys
in a `VITE_` variable or commit real credentials.

## Required

| Variable                | Description                                                   | Example                                                                  |
| ----------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `DATABASE_URL`          | MySQL/TiDB connection string (include SSL for prod)           | `mysql://user:pass@host:4000/thetaxfirm?ssl={"rejectUnauthorized":true}` |
| `JWT_SECRET`            | Secret for signing session cookies (use a long random string) | `openssl rand -hex 32`                                                   |
| `GOOGLE_CLIENT_ID`      | Google OAuth 2.0 client ID (server-side)                      | `xxxx.apps.googleusercontent.com`                                        |
| `GOOGLE_CLIENT_SECRET`  | Google OAuth 2.0 client secret                                | `GOCSPX-...`                                                             |
| `ADMIN_EMAILS`          | Comma-separated emails granted the `admin` role on sign-in    | `chris@thetaxfirm.us`                                                    |
| `BLOG_API_KEY`          | Bearer token protecting `/api/blog` write endpoints           | random string                                                            |
| `GHL_API_KEY`           | GoHighLevel API key (JWT bearer token, no "Bearer " prefix)   | `eyJhbGci...`                                                            |
| `GHL_LOCATION_ID`       | GoHighLevel location ID                                       | `hf2fpQyPswcNJOmnqRFR`                                                   |

## Public Tely forms (build-time)

Copy the native form connections from the business's Tely Portal. Supply them
to the Docker build using the matching build arguments, or to Vite for local
development. Missing connections leave forms unavailable, not locally stored.

| Variable | Value |
| --- | --- |
| `VITE_TELY_EMBED_SCRIPT_URL` | Versioned native SDK URL |
| `VITE_TELY_QUESTIONNAIRE_CONTEXT_URL` | Questionnaire context URL |
| `VITE_TELY_QUESTIONNAIRE_SUBMISSIONS_URL` | Questionnaire submissions URL |
| `VITE_TELY_NEWSLETTER_CONTEXT_URL` | Tax updates request context URL |
| `VITE_TELY_NEWSLETTER_SUBMISSIONS_URL` | Tax updates request submissions URL |
| `VITE_TELY_SALES_SCRIPT_TAG` | Complete public Sales tag issued by the business's Tely Portal |
| `VITE_TELY_ANALYTICS_SCRIPT_TAG` | Complete public Analytics tag issued by the same business's Tely Portal |

Tely Clients owns new requests, visitor identity and notification policy.
Keep customer notifications off during preparation. The updates form records
an updates request, not a mailing-list subscription. Calendly still owns actual
booking and opens only after the questionnaire capture is acknowledged.
Sales and Analytics load independently on public routes. Analytics excludes
`/portal` and `/admin` before history changes can emit a pageview. Both embeds
are disposed on private-route entry and remounted on return to the public site.
This requires the shared Analytics embed lifecycle contract; site preparation
does not install variables, rebuild or deploy the working site.

## Object storage (portal document + blog image uploads)

S3-compatible — works with Cloudflare R2, AWS S3, Backblaze B2, etc.

| Variable               | Description                                                      | Example                                        |
| ---------------------- | ---------------------------------------------------------------- | ---------------------------------------------- |
| `S3_BUCKET`            | Bucket name                                                      | `thetaxfirm-uploads`                           |
| `S3_ACCESS_KEY_ID`     | Access key                                                       | —                                              |
| `S3_SECRET_ACCESS_KEY` | Secret key                                                       | —                                              |
| `S3_ENDPOINT`          | Custom endpoint. **Set for R2**, leave unset for AWS S3          | `https://<accountid>.r2.cloudflarestorage.com` |
| `S3_REGION`            | Region (`auto` for R2)                                           | `auto`                                         |
| `S3_PUBLIC_URL`        | Public base URL for **blog assets only** (durable image links). Portal documents stay on presigned URLs regardless. | `https://cdn.thetaxfirm.us`                    |
| `S3_FORCE_PATH_STYLE`  | `true` to force path-style addressing (some providers)           | `true`                                         |

## Email notifications (optional but recommended)

Local blog owner alerts, sent via [Resend](https://resend.com).
If unset, the underlying actions still succeed — the notification is simply skipped.

| Variable            | Description                                                 | Example                               |
| ------------------- | ----------------------------------------------------------- | ------------------------------------- |
| `RESEND_API_KEY`    | Resend API key                                              | `re_...`                              |
| `NOTIFY_EMAIL_TO`   | Recipient(s), comma-separated (falls back to `OWNER_EMAIL`) | `chris@thetaxfirm.us`                 |
| `NOTIFY_EMAIL_FROM` | Verified sender                                             | `The Tax Firm <notify@thetaxfirm.us>` |
| `OWNER_EMAIL`       | Owner email; default notification recipient                 | `chris@thetaxfirm.us`                 |

## Optional

| Variable | Description                                        | Default |
| -------- | -------------------------------------------------- | ------- |
| `PORT`   | Server port. Railway injects this; do not set it.  | `3000`  |

## Notes

- The app no longer depends on any Manus / "Forge" service, and no longer
  deploys to Vercel. `BUILT_IN_FORGE_*`, `VITE_FRONTEND_FORGE_*`,
  `OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL`, and `VITE_APP_ID` are read by no
  code and can be deleted from Railway whenever convenient — leaving them set
  does no harm.
- `OWNER_OPEN_ID` still works (it grants the `admin` role to one openId), but
  openIds are now `google:<sub>`, so a value carried over from Manus will never
  match. Prefer `ADMIN_EMAILS`.
- Apart from the public Tely form connections, Google sign-in starts at
  `GET /api/oauth/login`, which the server builds, so `VITE_GOOGLE_CLIENT_ID` is
  no longer needed — only the server-side `GOOGLE_CLIENT_ID`. Earlier revisions
  of this file also listed `VITE_APP_TITLE`, `VITE_APP_LOGO`, `OWNER_NAME` and
  `VITE_ANALYTICS_*`; nothing reads those either. The page title and metadata
  live in `client/index.html`.
- Google OAuth requires an **Authorized redirect URI** of
  `https://YOUR_DOMAIN/api/oauth/callback` (add one per domain, including any
  preview/staging domain and `http://localhost:3000/api/oauth/callback` for local dev).
