# Stage 1: Build frontend
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY shared/package.json shared/
COPY src/package.json src/
COPY server/package.json server/

RUN npm ci

COPY . .

RUN npm run build

# Stage 2: Production runtime
FROM node:20-alpine

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

EXPOSE 8080

CMD ["npm", "run", "start", "-w", "server"]
