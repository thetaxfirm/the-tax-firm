# Web app (Express + React SPA) for Railway.
# The blog-sync worker is a separate Railway service built from ./Dockerfile.sync.
#
# Public Tely form connections are compiled into the client at build time.
# Server secrets remain runtime-only and must never use the VITE_ prefix.

FROM node:20-slim

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

# Install dependencies (dev deps included — needed to build).
COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/
RUN pnpm install --frozen-lockfile

# Build client (dist/public) + server bundle (dist/index.js).
COPY . .
ARG VITE_TELY_EMBED_SCRIPT_URL
ARG VITE_TELY_QUESTIONNAIRE_CONTEXT_URL
ARG VITE_TELY_QUESTIONNAIRE_SUBMISSIONS_URL
ARG VITE_TELY_NEWSLETTER_CONTEXT_URL
ARG VITE_TELY_NEWSLETTER_SUBMISSIONS_URL
ARG VITE_TELY_SALES_SCRIPT_TAG
ARG VITE_TELY_ANALYTICS_SCRIPT_TAG
RUN pnpm build

ENV NODE_ENV=production
# Railway injects PORT; the server reads process.env.PORT (default 3000).
EXPOSE 3000

CMD ["pnpm", "start"]
