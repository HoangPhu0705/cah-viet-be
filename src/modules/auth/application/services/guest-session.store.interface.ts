/**
 * Guest sessions live in Redis only — a guest token is worthless once its session
 * is gone (room cleanup voids it), so every guest token check hits this store.
 */
export abstract class IGuestSessionStore {
  abstract start(playerId: string, ttlSeconds: number): Promise<void>;
  abstract isActive(playerId: string): Promise<boolean>;
  abstract end(playerId: string): Promise<void>;
}
