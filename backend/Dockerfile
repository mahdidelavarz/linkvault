FROM node:20-alpine AS builder

WORKDIR /app

COPY backend/package*.json ./
# Install all deps (including devDeps) so TypeScript is available for the build
RUN npm config set registry https://mirror2.chabokan.net/npm/ && npm ci

COPY backend/ ./
RUN npm run build

# ── Production image ──────────────────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Set npm mirror for production
RUN npm config set registry https://mirror2.chabokan.net/npm/

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
# Install ALL dependencies (not just production)
RUN npm ci

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "dist/server.js"]
