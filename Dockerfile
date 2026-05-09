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

# Copy only what the server needs at runtime
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/server ./server
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/server/package.json ./server/

# Install only server production deps
WORKDIR /app/server
RUN npm ci --omit=dev

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "server/node_modules/.bin/tsx", "server/src/index.ts"]
