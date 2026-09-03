# ----------------------------
# Build stage
# ----------------------------
FROM oven/bun:1 AS builder

WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update -y && \
    apt-get install -y openssl && \
    rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json bun.lock* ./

# Copy Prisma schema
COPY prisma ./prisma

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source
COPY . .

# Generate Prisma Client
RUN bunx prisma generate --schema=./prisma/schema

# Build TypeScript
RUN bun run build


# ----------------------------
# Production stage
# ----------------------------
FROM node:20-bookworm-slim AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install OpenSSL for Prisma
RUN apt-get update -y && \
    apt-get install -y openssl && \
    rm -rf /var/lib/apt/lists/*

# Copy package
COPY --from=builder /app/package.json ./package.json

# Copy dependencies
COPY --from=builder /app/node_modules ./node_modules

# Copy compiled application
COPY --from=builder /app/dist ./dist

# Copy Prisma schema and generated client
COPY --from=builder /app/prisma ./prisma

EXPOSE 5000

CMD ["sh", "-c", "npx prisma migrate deploy --schema=./prisma/schema && node ./dist/server.js"]