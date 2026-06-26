import { Module } from '@nestjs/common';
import { RoomsController } from './presentation/controllers/rooms.controller';
import { IRoomRepository } from './domain/repositories/room.repository.interface';
import { PrismaRoomRepository } from './infrastructure/repositories/prisma-room.repository';

@Module({
  controllers: [RoomsController],
  providers: [
    { provide: IRoomRepository, useClass: PrismaRoomRepository },
  ],
  exports: [IRoomRepository],
})
export class RoomModule {}
