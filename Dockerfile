# ----------------------------
# Build stage
# ----------------------------
FROM oven/bun:1 AS builder

WORKDIR /app

# Install OpenSSL
RUN apt-get update -y && \
    apt-get install -y openssl && \
    rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json bun.lock* ./

# Copy Prisma schema
COPY prisma ./prisma

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build TypeScript
RUN bun run build


# ----------------------------
# Production stage
# ----------------------------
FROM node:20-bookworm-slim AS production

WORKDIR /app

# Install OpenSSL
RUN apt-get update -y && \
    apt-get install -y openssl && \
    rm -rf /var/lib/apt/lists/*

# Copy package.json
COPY --from=builder /app/package.json ./

# Copy dependencies
COPY --from=builder /app/node_modules ./node_modules

# Copy compiled application
COPY --from=builder /app/dist ./dist

# Copy Prisma
COPY --from=builder /app/prisma ./prisma

# Application port
EXPOSE 5000

# Run migrations, then start server
CMD ["sh", "-c", "npx prisma migrate deploy --schema=./prisma/schema && node ./dist/server.js"]