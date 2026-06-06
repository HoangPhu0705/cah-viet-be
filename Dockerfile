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

# Copy compiled output, generated Prisma client, and Prisma CLI from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
COPY prisma ./prisma
COPY prisma.config.cjs ./

EXPOSE 3001

CMD ["node", "dist/src/main"]
