import { Injectable } from '@nestjs/common';
import { RedisService } from '../../../../infrastructure/redis/redis.service';
import { IGuestSessionStore } from '../../application/services/guest-session.store.interface';

@Injectable()
export class RedisGuestSessionStore extends IGuestSessionStore {
  constructor(private readonly redisService: RedisService) {
    super();
  }

  async start(playerId: string, ttlSeconds: number): Promise<void> {
    await this.redisService.set(this.key(playerId), '1', ttlSeconds);
  }

  isActive(playerId: string): Promise<boolean> {
    return this.redisService.exists(this.key(playerId));
  }

  async end(playerId: string): Promise<void> {
    await this.redisService.del(this.key(playerId));
  }

  private key(playerId: string): string {
    return `guest:session:${playerId}`;
  }
}
