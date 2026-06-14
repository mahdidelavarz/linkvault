FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

RUN npm config set registry https://mirror2.chabokan.net/npm/ && npm install


# Copy all frontend source
COPY frontend/ ./

<<<<<<< HEAD
=======
# next.config.ts resolves rewrites() at build time into routes-manifest.json,
# so the backend rewrite target must be known during the build, not just at
# container runtime.
ARG BACKEND_INTERNAL_URL=http://backend:5000
ENV BACKEND_INTERNAL_URL=$BACKEND_INTERNAL_URL

>>>>>>> 0716009 (init)
# Build Next.js (Standalone mode - بهترین روش برای Docker)
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "server.js"]