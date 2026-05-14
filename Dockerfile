FROM node:22-slim AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
COPY shared/package.json shared/
COPY src/package.json src/
COPY server/package.json server/

RUN npm ci

COPY . .

RUN npm run build

# Stage 2: Production runtime
FROM node:22-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy workspace config with lockfile for npm ci
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/shared/package.json ./shared/
COPY --from=builder /app/server/package.json ./server/

# Copy shared source (types needed at runtime by server)
COPY --from=builder /app/shared ./shared
# Copy server source
COPY --from=builder /app/server ./server
# Copy built frontend
COPY --from=builder /app/dist ./dist

# Install only production deps for the server workspace
RUN npm ci --omit=dev -w server

ENV NODE_ENV=production
ENV PORT=8080

RUN chown -R node:node /app
USER node

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

EXPOSE 8080

CMD ["npm", "run", "start", "-w", "server"]
