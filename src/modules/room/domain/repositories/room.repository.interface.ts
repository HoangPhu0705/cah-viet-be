import { Room } from '../entities/room.entity';

export interface CreateRoomData {
  code: string;
  hostId: string;
  settings: Record<string, unknown>;
}

export abstract class IRoomRepository {
  abstract findById(id: string): Promise<Room | null>;
  abstract findByCode(code: string): Promise<Room | null>;
  abstract create(data: CreateRoomData): Promise<Room>;
  abstract delete(id: string): Promise<void>;
}
