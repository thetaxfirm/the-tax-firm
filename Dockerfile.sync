FROM node:20-slim

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy scripts
COPY scripts/ ./scripts/
COPY tsconfig.json ./

# Create data directory (will be mounted as volume)
RUN mkdir -p /app/data

EXPOSE 8080

CMD ["pnpm", "sync:blog:serve"]
