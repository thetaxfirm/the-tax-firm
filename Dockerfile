# Web app (Express + React SPA) for Railway.
# The blog-sync worker is a separate Railway service built from ./Dockerfile.sync.
#
# NOTE: VITE_* variables are compiled into the client bundle during `pnpm build`,
# so they must be present at BUILD time. Railway exposes a service's variables to
# the Docker build; declare each one as an ARG below so it is picked up.

FROM node:20-slim

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

# Build-time (baked into the frontend bundle).
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_APP_TITLE="The Tax Firm"
ARG VITE_APP_LOGO
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID \
    VITE_APP_TITLE=$VITE_APP_TITLE \
    VITE_APP_LOGO=$VITE_APP_LOGO

# Install dependencies (dev deps included — needed to build).
COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/
RUN pnpm install --frozen-lockfile

# Build client (dist/public) + server bundle (dist/index.js).
COPY . .
RUN pnpm build

ENV NODE_ENV=production
# Railway injects PORT; the server reads process.env.PORT (default 3000).
EXPOSE 3000

CMD ["pnpm", "start"]
