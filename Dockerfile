# ── Stage 1: build ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Install deps (all — includes devDeps needed for build)
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy source + prisma schema
COPY . .

# Generate Prisma client then compile TypeScript
RUN yarn prisma generate
RUN yarn build

# ── Stage 2: production ──────────────────────────────────────────────────────
FROM node:22-alpine AS production

    
ENV NODE_ENV=production

# Install only production deps
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production && yarn cache clean

# Copy compiled output and generated Prisma client from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated
COPY prisma ./prisma
COPY prisma.config.cjs ./

EXPOSE 3001

CMD ["node", "dist/src/main"]
