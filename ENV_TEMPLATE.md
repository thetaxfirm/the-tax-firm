# Environment Variables Template

Copy these into your hosting provider's environment variables panel (Vercel, Railway, etc.)

## Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | MySQL/TiDB connection string | `mysql://user:pass@host:port/db?ssl={"rejectUnauthorized":true}` |
| `JWT_SECRET` | Secret for signing session cookies | `your-random-secret-string` |
| `VITE_APP_ID` | OAuth application ID | `app-id-from-provider` |
| `OAUTH_SERVER_URL` | OAuth backend base URL | `https://oauth.provider.com` |
| `VITE_OAUTH_PORTAL_URL` | OAuth login portal URL (frontend) | `https://login.provider.com` |
| `OWNER_OPEN_ID` | Owner's OAuth ID | `user-id` |
| `OWNER_NAME` | Owner's display name | `Christopher Craig` |
| `BUILT_IN_FORGE_API_URL` | LLM/Storage/Notification API URL | `https://api.provider.com` |
| `BUILT_IN_FORGE_API_KEY` | Server-side API key for built-in services | `sk-...` |
| `VITE_FRONTEND_FORGE_API_KEY` | Frontend API key for built-in services | `pk-...` |
| `VITE_FRONTEND_FORGE_API_URL` | Frontend API URL for built-in services | `https://api.provider.com` |
| `GHL_API_KEY` | GoHighLevel API key | `Bearer ...` |
| `GHL_LOCATION_ID` | GoHighLevel location ID | `hf2fpQyPswcNJOmnqRFR` |
| `BLOG_API_KEY` | API key for external blog publishing | `your-blog-api-key` |
| `VITE_APP_TITLE` | Site title | `The Tax Firm` |
| `VITE_APP_LOGO` | Logo URL | `https://cdn.example.com/logo.png` |

## Optional Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port (defaults to 3000) | `3000` |
| `VITE_ANALYTICS_ENDPOINT` | Analytics endpoint URL | `https://analytics.example.com` |
| `VITE_ANALYTICS_WEBSITE_ID` | Analytics website ID | `website-id` |

## Notes

- All `VITE_` prefixed variables are exposed to the frontend bundle
- `DATABASE_URL` must include SSL configuration for production
- The `BLOG_API_KEY` is used as a Bearer token for the `/api/blog/articles` REST endpoint
- `GHL_API_KEY` should include the "Bearer " prefix
