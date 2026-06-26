import { Player } from '../entities/player.entity';

export interface CreatePlayerData {
  nickname: string;
  avatarId: string;
  isGuest: boolean;
  email?: string;
  passwordHash?: string;
}

export abstract class IPlayerRepository {
  abstract findById(id: string): Promise<Player | null>;
  abstract findByEmail(email: string): Promise<Player | null>;
  abstract create(data: CreatePlayerData): Promise<Player>;
}
