FROM node:22-slim AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# pnpm comes from Corepack at the exact version pinned by package.json "packageManager".
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY shared/package.json shared/
COPY src/package.json src/
COPY server/package.json server/

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

# Self-contained production bundle for the server workspace: server sources plus
# its production dependencies, with @virtual-cdu/shared copied into node_modules.
# --legacy keeps the normal symlinked workspace links for development (pnpm 10
# otherwise requires inject-workspace-packages for deploy).
RUN pnpm --filter @virtual-cdu/server deploy --prod --legacy /prod/server

# Stage 2: Production runtime
FROM node:22-slim

ARG APP_VERSION=unknown
ARG COMMIT_SHA=unknown

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Server sources with production-only dependencies (from pnpm deploy). The shared
# workspace is included as server/node_modules/@virtual-cdu/shared.
COPY --from=builder /prod/server ./server
# Copy built frontend (served from ../dist relative to the server directory)
COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
ENV PORT=8080
ENV APP_VERSION=${APP_VERSION}
ENV COMMIT_SHA=${COMMIT_SHA}

RUN chown -R node:node /app
USER node

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

EXPOSE 8080

# Same as the server's "start" script (tsx src/index.ts), run from /app/server so
# ../dist resolves to the built frontend.
WORKDIR /app/server
CMD ["node", "node_modules/tsx/dist/cli.mjs", "src/index.ts"]
