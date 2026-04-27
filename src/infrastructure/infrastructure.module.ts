import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { PrismaPlayerRepository } from './repositories/prisma-player.repository';
import { PrismaRoomRepository } from './repositories/prisma-room.repository';
import { IPlayerRepository } from '../core/repositories/player.repository.interface';
import { IRoomRepository } from '../core/repositories/room.repository.interface';

@Module({
  imports: [PrismaModule, RedisModule],
  providers: [
    { provide: IPlayerRepository, useClass: PrismaPlayerRepository },
    { provide: IRoomRepository, useClass: PrismaRoomRepository },
  ],
  exports: [PrismaModule, RedisModule, IPlayerRepository, IRoomRepository],
})
export class InfrastructureModule {}
