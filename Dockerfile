# Web app (Express + React SPA) for Railway.
# The blog-sync worker is a separate Railway service built from ./Dockerfile.sync.
#
# The client reads no `import.meta.env` values, so nothing needs to be present at
# BUILD time — every variable is read by the server at runtime. Changing one in
# Railway therefore takes effect on restart, with no rebuild.

FROM node:20-slim

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

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
