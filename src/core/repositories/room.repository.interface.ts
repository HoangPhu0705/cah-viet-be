import { Room } from '../entities/room.entity';
import { CreateRoomData } from '../dtos';

export abstract class IRoomRepository {
  abstract findById(id: string): Promise<Room | null>;
  abstract findByCode(code: string): Promise<Room | null>;
  abstract create(data: CreateRoomData): Promise<Room>;
  abstract delete(id: string): Promise<void>;
}
