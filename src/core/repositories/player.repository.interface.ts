import { Player } from '../entities/player.entity';
import { CreatePlayerData } from '../dtos';

export abstract class IPlayerRepository {
  abstract findById(id: string): Promise<Player | null>;
  abstract findByEmail(email: string): Promise<Player | null>;
  abstract create(data: CreatePlayerData): Promise<Player>;
}
