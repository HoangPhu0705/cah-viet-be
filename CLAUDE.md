# CAH Backend — Decisions & Context

## Project overview

Cards Against Humanity web app (pet project / learning focus).

- **Frontend:** Next.js (separate repo)
- **Backend:** NestJS (separate repo — `cah-backend`)
- **Goal:** Learn NestJS, WebSockets, Redis, BullMQ, CI/CD, Docker, AWS

---

## Tech stack

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

---

## Repository structure

Two separate repos:

- `cah-frontend` — Next.js
- `cah-backend` — NestJS

---

## Product decisions

### Players & auth

- **Guest flow:** nickname + avatar pick (preset avatars), no email required
- **Guest session:** JWT with short TTL, stored in Redis
- **Guest TTL:** extends automatically while the game room is active; invalidated when room is destroyed (not extended after room cleanup — no session reclaim on refresh)
- **Registered users get:** persistent stats & win history, profile/avatar customization, friends list + invite system
- **Registered auth:** email + password; OAuth (Google) is a stretch goal

### Rooms

- Host configures: max players (4–10), win condition (round limit or score limit), deck selection, pacing mode, wildcard toggle
- **Pacing mode:** host picks per room — fixed timer (configurable seconds) or manual round start by host
- **Host disconnect:** host role transfers to next player automatically
- **Room cleanup:** BullMQ delayed job fires after all players disconnect → room destroyed → guest sessions voided
- Short join code generated (e.g. `ABC123`)

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

### BullMQ job types

1. **Round timer** — delayed job per round, cancelled if all players submit early
2. **Disconnect grace period** — 10s job, cancelled if player reconnects in time; auto-skips player if not
3. **Room cleanup** — fires after all players disconnect, destroys room, voids guest sessions

### Social features

- In-game text chat (scoped to room)
- Card emote reactions (during reveal phase)
- Cursor tracking (see other players' cursors in real time, throttled ~50ms on FE)
- Friends list + invite system (registered users only, nice-to-have)
- Voice: out of scope

---

## Backend module structure

Vertical slice architecture: each feature module owns its full stack (domain → application → infrastructure → presentation). Global infrastructure (Prisma, Redis) lives at the top level.

```
src/
├── main.ts
├── app.module.ts
│
├── common/                          # cross-cutting NestJS concerns
│   ├── decorators/
│   │   └── current-user.decorator.ts
│   ├── exceptions/
│   │   └── app.exception.ts         # base AppException class
│   ├── filters/
│   │   ├── app-exception.filter.ts
│   │   └── ws-exception.filter.ts
│   ├── guards/
│   │   └── jwt-auth.guard.ts        # generic AuthGuard('jwt') wrapper
│   ├── interceptors/
│   │   └── logging.interceptor.ts
│   └── utils/
│       └── time.utils.ts            # parseTtlToSeconds
│
├── config/                          # env config, app setup, swagger
│   ├── app.setup.ts
│   ├── configuration.ts
│   └── swagger.ts
│
├── infrastructure/                  # global shared adapters (@Global)
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   └── redis/
│       ├── redis.module.ts
│       └── redis.service.ts
│
├── shared/
│   └── types/
│       └── auth.types.ts            # JwtPayload (used cross-module)
│
├── workers/                         # BullMQ processors (future — cross-feature)
│   ├── round.processor.ts
│   └── cleanup.processor.ts
│
└── modules/
    ├── auth/
    │   ├── application/
    │   │   └── use-cases/
    │   │       ├── auth.use-case.interface.ts
    │   │       └── auth.use-case.ts
    │   ├── domain/
    │   │   ├── entities/
    │   │   │   └── player.entity.ts
    │   │   ├── exceptions/
    │   │   │   └── auth.exceptions.ts
    │   │   └── repositories/
    │   │       └── player.repository.interface.ts  # + CreatePlayerData
    │   ├── infrastructure/
    │   │   └── repositories/
    │   │       └── prisma-player.repository.ts
    │   ├── presentation/
    │   │   ├── controllers/
    │   │   │   └── auth.controller.ts
    │   │   ├── dto/
    │   │   │   ├── auth-response.dto.ts
    │   │   │   ├── guest-login.dto.ts
    │   │   │   ├── login.dto.ts
    │   │   │   └── register.dto.ts
    │   │   ├── guards/
    │   │   │   ├── jwt.strategy.ts   # Passport JWT strategy
    │   │   │   └── ws-jwt.guard.ts   # WebSocket auth guard
    │   │   └── mappers/
    │   │       └── auth.mapper.ts    # Player → PlayerResponseDto
    │   └── auth.module.ts
    │
    ├── room/
    │   ├── domain/
    │   │   ├── entities/
    │   │   │   └── room.entity.ts
    │   │   └── repositories/
    │   │       └── room.repository.interface.ts    # + CreateRoomData
    │   ├── infrastructure/
    │   │   └── repositories/
    │   │       └── prisma-room.repository.ts
    │   ├── presentation/
    │   │   ├── controllers/
    │   │   │   └── rooms.controller.ts
    │   │   └── gateways/            # Socket.IO — add when implementing
    │   └── room.module.ts
    │
    └── game/
        ├── domain/
        │   └── entities/
        │       └── game.entity.ts
        ├── presentation/
        │   └── gateways/            # main game gateway — add when implementing
        └── game.module.ts
```

### Architecture rules
- Repository interfaces (`IPlayerRepository`, `IRoomRepository`) live in each module's `domain/repositories/` — they are the domain's data contract
- Repository implementations (`Prisma*Repository`) live in each module's `infrastructure/repositories/`
- Passport `JwtStrategy` and `WsJwtGuard` live in `modules/auth/presentation/guards/` because they depend on `JwtService` registered in `AuthModule`
- `JwtAuthGuard` lives in `common/guards/` — it's a thin wrapper with no injected dependencies
- BullMQ workers go in top-level `workers/` because they are orchestration-level jobs that span multiple modules

---

## Socket.IO events

### Client → Server

- `join_room`
- `cursor_move` (throttled ~50ms on FE)
- `play_card` — white card id or wildcard text
- `czar_pick`
- `chat_message`
- `emote_react`
- `start_round` (host only)
- `kick_player` (host only)

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

---

## Prisma schema (v0.1)

- Prisma 6+ — no `url` in `datasource`, passed via `PrismaClient` constructor (`datasourceUrl`)
- `prisma/prisma.config.ts` required for Prisma 6
- Models: `Player`, `Room`, `Game`, `GamePlayer`, `Deck`, `BlackCard`, `WhiteCard`, `Friendship`
- `Room.settings` stored as `Json` (max players, win condition, pacing mode, wildcard toggle)
- Wildcard cards are ephemeral — Redis only, never stored in DB

---

## Infrastructure

### AWS deployment phases

1. **Now (free tier):** EC2 t2.micro + RDS t3.micro + Upstash Redis + ECR + GitHub Actions
2. **Later:** ECS Fargate (proper container orchestration, ~$15-30/mo)
3. **Stretch:** EKS (Kubernetes, use student credits — $0.10/hr control plane fee)

### CI/CD pipeline (GitHub Actions)

On push to `main`:

1. Lint + test (fail fast)
2. Configure AWS credentials (stored in GitHub Secrets)
3. Build Docker image, tag `:latest` + `:${{ github.sha }}`
4. Push to ECR
5. Phase 1: SSH into EC2, pull image, restart container
6. Phase 2: Update ECS task definition, deploy new revision

On pull requests: steps 1–2 only (no deploy)

### Key env vars

```env
PORT=3001
DATABASE_URL=postgresql://postgres:password@localhost:5432/cah
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=...
JWT_EXPIRES_IN=7d
GUEST_JWT_EXPIRES_IN=24h
FE_URL=http://localhost:3000
```

---

## Where we left off

- Docker + docker-compose set up locally (Postgres + Redis)
- Prisma schema defined, first migration run (`npx prisma migrate dev --name init`)
- Refactored to vertical slice architecture (feature modules with domain/application/infrastructure/presentation layers)
- `AuthModule` complete — guest login, register, login, JWT strategy, WsJwtGuard, repository pattern wired
- `RoomModule` scaffold in place — entity, repo interface, Prisma impl, empty controller
- `GameModule` placeholder created
- **Next step:** Implement room creation flow — `RoomModule` application layer + `POST /rooms` endpoint
