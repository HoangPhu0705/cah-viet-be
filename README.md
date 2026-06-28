# CAH VietVerse Backend

A real-time game server built with NestJS, powering a web-based implementation of "Cards Against Humanity" with Vietnamese content. This backend manages game rooms, player authentication, real-time cursor tracking, and automated round transitions using WebSockets, Redis, and BullMQ. [1](#0-0) 

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | NestJS |
| Real-time | Socket.IO (NestJS Gateway) |
| Cache / Game State | Redis (ioredis) |
| Queue | BullMQ (Redis-backed) |
| Database | PostgreSQL + Prisma |
| Authentication | JWT (NestJS guards + passport-jwt) |
| Container | Docker |
| Registry | AWS ECR |
| Hosting | AWS EC2 t2.micro (Free Tier) |
| CI/CD | GitHub Actions | [2](#0-1) 

## Features

- **Guest & Registered Authentication**: Low-friction guest flow with nickname-only login, plus traditional email/password authentication for persistent stats and profiles [3](#0-2) 
- **Room Management**: Host-configurable settings (max players, win conditions, deck selection, pacing modes, wildcard toggle) with short join codes [4](#0-3) 
- **Real-time Game Loop**: Socket.IO-based game flow with card dealing, submission phases, and "Card Czar" rotation [5](#0-4) 
- **Background Workers**: BullMQ-powered round timers, disconnect grace periods, and room cleanup tasks [6](#0-5) 
- **Social Features**: In-game chat, cursor tracking, and card emote reactions [7](#0-6) 

## Project Setup

### Prerequisites
- Node.js 22
- Yarn
- PostgreSQL
- Redis

### Installation

```bash
# Install dependencies
yarn install

# Copy environment template
cp .env.example .env

# Generate Prisma client
yarn prisma generate

# Run database migrations
yarn prisma migrate dev

# Start development server
yarn start:dev
```

The application will start on port 3001 (configurable via `PORT` environment variable). [8](#0-7) 

## Environment Variables

Create a `.env` file based on `.env.example`: [9](#0-8) 

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (`development`, `production`, `test`) | - |
| `PORT` | Server port | `3001` |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `REDIS_HOST` | Redis hostname | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | JWT TTL for registered users | `7d` |
| `GUEST_JWT_EXPIRES_IN` | JWT TTL for guest sessions | `24h` |
| `FE_URL` | Frontend URL (for CORS) | `http://localhost:3000` |
| `SWAGGER_ENABLED` | Force-enable Swagger | `false` | [10](#0-9) 

## Project Structure

```
src/
├── main.ts
├── app.module.ts
├── config/
│   └── configuration.ts
├── modules/
│   ├── auth/          # Authentication (JWT, guards)
│   ├── rooms/         # Room management
│   ├── game/          # Game logic & Socket.IO gateway
│   ├── players/       # Player management
│   └── decks/         # Card deck management
├── redis/             # Redis service (@Global)
├── prisma/            # Prisma service (@Global)
├── workers/           # BullMQ processors (round, cleanup)
└── common/            # Decorators, filters, interceptors
``` [11](#0-10) 

## API Documentation

Swagger documentation is available at `/api` when running in development mode or when `SWAGGER_ENABLED=true`. [12](#0-11) [13](#0-12) 

## Running Tests

```bash
# Unit tests
yarn test

# E2E tests
yarn test:e2e

# Test coverage
yarn test:cov
```

## Docker

Build and run using Docker:

```bash
# Build image
docker build -t cah-backend .

# Run container
docker run -p 3001:3001 --env-file .env cah-backend
```

The Dockerfile uses a multi-stage build for optimized production images. [14](#0-13) 

## Deployment

### CI/CD Pipeline

The project uses GitHub Actions for automated CI/CD:

- **CI**: Runs on pull requests to `main` - lints, tests, and builds the application [15](#0-14) 
- **CD**: Runs on push to `main` - builds Docker image, pushes to AWS ECR, and deploys to EC2 [16](#0-15) 

### AWS Infrastructure

- **Region**: `ap-southeast-1` [17](#0-16) 
- **ECR Repository**: `cah-backend`
- **EC2 Instance**: t2.micro (Free Tier)
- **RDS**: PostgreSQL t3.micro (Free Tier)
- **Redis**: Upstash Redis (Free Tier)

### Deployment Phases

1. **Phase 1 (Current)**: EC2 + Docker via SSH
2. **Phase 2 (Planned)**: ECS Fargate
3. **Phase 3 (Planned)**: EKS (Kubernetes) [18](#0-17) 

## Socket.IO Events

### Client → Server
- `join_room`, `cursor_move`, `play_card`, `czar_pick`, `chat_message`, `emote_react`, `start_round`, `kick_player` [19](#0-18) 

### Server → Client
- `cursor_update`, `player_joined`, `player_left`, `round_started`, `card_played`, `round_reveal`, `round_winner`, `game_over`, `host_changed`, `chat_message`, `emote_reaction`, `player_kicked` [20](#0-19) 

## License

MIT

## Notes

The current README.md file in the repository is the default NestJS starter template and does not reflect the actual CAH VietVerse Backend project. This proposed README is based on the project documentation in CLAUDE.md, the CI/CD workflows, configuration files, and the actual codebase structure. [21](#0-20) 

Wiki pages you might want to explore:
- [Overview (HoangPhu0705/cah-viet-be)](/wiki/HoangPhu0705/cah-viet-be#1)
- [Configuration & Environment Variables (HoangPhu0705/cah-viet-be)](/wiki/HoangPhu0705/cah-viet-be#3.2)
- [CI/CD Pipelines (GitHub Actions) (HoangPhu0705/cah-viet-be)](/wiki/HoangPhu0705/cah-viet-be#5.2)

### Citations

**File:** CLAUDE.md (L5-9)
```markdown
Cards Against Humanity web app (pet project / learning focus).

- **Frontend:** Next.js (separate repo)
- **Backend:** NestJS (separate repo — `cah-backend`)
- **Goal:** Learn NestJS, WebSockets, Redis, BullMQ, CI/CD, Docker, AWS
```

**File:** CLAUDE.md (L15-30)
```markdown
| Layer              | Choice                                                   |
| ------------------ | -------------------------------------------------------- |
| Framework          | NestJS                                                   |
| Real-time          | Socket.IO (NestJS Gateway)                               |
| Cache / game state | Redis (ioredis)                                          |
| Queue              | BullMQ (backed by Redis)                                 |
| Database           | PostgreSQL + Prisma                                      |
| Auth               | JWT (NestJS guards + passport-jwt)                       |
| Container          | Docker                                                   |
| Registry           | AWS ECR                                                  |
| Hosting (BE)       | AWS EC2 t2.micro (free tier) → ECS Fargate → EKS later   |
| Hosting (FE)       | Vercel                                                   |
| Managed DB         | AWS RDS PostgreSQL t3.micro (free tier)                  |
| Redis hosting      | Upstash Redis (free tier, no AWS ElastiCache — not free) |
| CI/CD              | GitHub Actions                                           |
| Cloud              | AWS                                                      |
```

**File:** CLAUDE.md (L45-51)
```markdown
### Players & auth

- **Guest flow:** nickname + avatar pick (preset avatars), no email required
- **Guest session:** JWT with short TTL, stored in Redis
- **Guest TTL:** extends automatically while the game room is active; invalidated when room is destroyed (not extended after room cleanup — no session reclaim on refresh)
- **Registered users get:** persistent stats & win history, profile/avatar customization, friends list + invite system
- **Registered auth:** email + password; OAuth (Google) is a stretch goal
```

**File:** CLAUDE.md (L53-59)
```markdown
### Rooms

- Host configures: max players (4–10), win condition (round limit or score limit), deck selection, pacing mode, wildcard toggle
- **Pacing mode:** host picks per room — fixed timer (configurable seconds) or manual round start by host
- **Host disconnect:** host role transfers to next player automatically
- **Room cleanup:** BullMQ delayed job fires after all players disconnect → room destroyed → guest sessions voided
- Short join code generated (e.g. `ABC123`)
```

**File:** CLAUDE.md (L61-73)
```markdown
### Game loop

- Classic CAH rules — one Card Czar per round
- Each player dealt 10 white cards
- If wildcards enabled: 1 wildcard slot randomly included per hand
- **Wildcard white cards:**
  - Rendered as a special card component with a text input
  - Player types their answer and submits like any other card
  - Single-use — discarded after round, not recycled into deck pool
  - Re-dealt by chance each new round
  - Enabled/disabled by host per room
- Classic decks seeded into PostgreSQL at setup
- No full custom deck management — wildcard cards replace that feature (simpler, more fun)
```

**File:** CLAUDE.md (L75-80)
```markdown
### BullMQ job types

1. **Round timer** — delayed job per round, cancelled if all players submit early
2. **Disconnect grace period** — 10s job, cancelled if player reconnects in time; auto-skips player if not
3. **Room cleanup** — fires after all players disconnect, destroys room, voids guest sessions

```

**File:** CLAUDE.md (L81-86)
```markdown
### Social features

- In-game text chat (scoped to room)
- Card emote reactions (during reveal phase)
- Cursor tracking (see other players' cursors in real time, throttled ~50ms on FE)
- Friends list + invite system (registered users only, nice-to-have)
```

**File:** CLAUDE.md (L91-142)
```markdown
## Backend module structure

```
src/
├── main.ts
├── app.module.ts
├── config/
│   └── configuration.ts
├── types/
│   └── index.ts
├── modules/
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── auth.controller.ts
│   │   ├── jwt.strategy.ts
│   │   ├── jwt-auth.guard.ts
│   │   └── ws-jwt.guard.ts
│   ├── rooms/
│   │   ├── rooms.module.ts
│   │   ├── rooms.service.ts
│   │   └── rooms.controller.ts
│   ├── game/
│   │   ├── game.module.ts
│   │   ├── game.service.ts
│   │   ├── game.controller.ts
│   │   └── game.gateway.ts
│   ├── players/
│   │   ├── players.module.ts
│   │   ├── players.service.ts
│   │   └── players.controller.ts
│   └── decks/
│       ├── decks.module.ts
│       ├── decks.service.ts
│       └── decks.controller.ts
├── redis/
│   ├── redis.module.ts        ← @Global()
│   └── redis.service.ts
├── prisma/
│   ├── prisma.module.ts       ← @Global()
│   └── prisma.service.ts
├── workers/
│   ├── round.processor.ts
│   └── cleanup.processor.ts
└── common/
    ├── decorators/
    │   └── current-user.decorator.ts
    ├── filters/
    │   └── ws-exception.filter.ts
    └── interceptors/
        └── logging.interceptor.ts
```
```

**File:** CLAUDE.md (L148-157)
```markdown
### Client → Server

- `join_room`
- `cursor_move` (throttled ~50ms on FE)
- `play_card` — white card id or wildcard text
- `czar_pick`
- `chat_message`
- `emote_react`
- `start_round` (host only)
- `kick_player` (host only)
```

**File:** CLAUDE.md (L159-171)
```markdown
### Server → Client

- `cursor_update`
- `player_joined` / `player_left`
- `round_started` — black card + timer config
- `card_played` — N of M submitted (anonymous)
- `round_reveal` — all submissions shown
- `round_winner` — czar pick + updated scores
- `game_over` — final leaderboard
- `host_changed`
- `chat_message`
- `emote_reaction`
- `player_kicked`
```

**File:** CLAUDE.md (L187-192)
```markdown
### AWS deployment phases

1. **Now (free tier):** EC2 t2.micro + RDS t3.micro + Upstash Redis + ECR + GitHub Actions
2. **Later:** ECS Fargate (proper container orchestration, ~$15-30/mo)
3. **Stretch:** EKS (Kubernetes, use student credits — $0.10/hr control plane fee)

```

**File:** src/main.ts (L8-12)
```typescript
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev || process.env.SWAGGER_ENABLED === 'true') {
    setupSwagger(app);
  }
```

**File:** src/main.ts (L14-15)
```typescript
  const port = process.env.PORT ?? 3001;
  await app.listen(port);
```

**File:** .env.example (L1-10)
```text
NODE_ENV=development
PORT=>>EXAMPLE_VALUE<<
DATABASE_URL=>>EXAMPLE_VALUE<<
REDIS_HOST=>>EXAMPLE_VALUE<<
REDIS_PORT=>>EXAMPLE_VALUE<<
JWT_SECRET=>>EXAMPLE_VALUE<<
JWT_EXPIRES_IN=>>EXAMPLE_VALUE<<
GUEST_JWT_EXPIRES_IN=>>EXAMPLE_VALUE<<
FE_URL=>>EXAMPLE_VALUE<<
SWAGGER_ENABLED=false
```

**File:** src/config/swagger.ts (L4-16)
```typescript
const SWAGGER_PATH = 'api';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('CAH VietVerse API')
    .setDescription('Cards Against Humanity backend')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(SWAGGER_PATH, app, document);
}
```

**File:** Dockerfile (L1-36)
```dockerfile
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

WORKDIR /app

ENV NODE_ENV=production

# Install only production deps
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production && yarn cache clean

# Copy compiled output + generated Prisma client from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY prisma ./prisma

EXPOSE 3001

CMD ["node", "dist/main"]
```

**File:** .github/workflows/ci.yml (L3-36)
```yaml
on:
  pull_request:
    branches:
      - main

jobs:
  ci:
    name: Lint, Test & Build
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v6

      - name: Setup Node
        uses: actions/setup-node@v6
        with:
          node-version: 22
          cache: yarn

      - name: Install dependencies
        run: yarn install --frozen-lockfile

      - name: Generate Prisma client
        run: yarn prisma generate

      - name: Lint
        run: yarn lint

      - name: Test
        run: yarn test

      - name: Build
        run: yarn build
```

**File:** .github/workflows/deploy.yml (L3-90)
```yaml
on:
  push:
    branches:
      - main

env:
  AWS_REGION: ap-southeast-1 # change to your region
  ECR_REPOSITORY: cah-backend # your ECR repo name

jobs:
  deploy:
    name: Build, Push & Deploy
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: yarn

      - name: Install dependencies
        run: yarn install --frozen-lockfile

      - name: Generate Prisma client
        run: yarn prisma generate

      - name: Lint
        run: yarn lint

      - name: Test
        run: yarn test

      # ── AWS ────────────────────────────────────────────────────────────────
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      # ── Docker ─────────────────────────────────────────────────────────────
      - name: Build and push Docker image
        id: build-image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker tag  $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG \
                      $ECR_REGISTRY/$ECR_REPOSITORY:latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest
          echo "image=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG" >> $GITHUB_OUTPUT

      # ── EC2 (Phase 1) ──────────────────────────────────────────────────────
      - name: Deploy to EC2
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          envs: ECR_REGISTRY,ECR_REPOSITORY,IMAGE_TAG,AWS_REGION
          script: |
            aws ecr get-login-password --region $AWS_REGION \
              | docker login --username AWS --password-stdin $ECR_REGISTRY

            docker pull $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG

            docker stop cah-backend || true
            docker rm   cah-backend || true

            docker run -d \
              --name cah-backend \
              --restart unless-stopped \
              -p 3001:3001 \
              --env-file /home/${{ secrets.EC2_USER }}/.env \
              $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
```

**File:** README.md (L1-90)
```markdown
<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ yarn install
```

## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Run tests

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ yarn install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch
```
