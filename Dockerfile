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

# Copy workspace config
COPY package*.json ./
COPY shared/package.json shared/
COPY server/package.json server/
COPY src/package.json src/

# Install production deps only
RUN npm ci --omit=dev

# Copy built frontend
COPY --from=builder /app/dist ./dist

# Copy shared source (needed at runtime by tsx)
COPY shared/ shared/

# Copy server source
COPY server/ server/

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["npm", "run", "start", "-w", "server"]
