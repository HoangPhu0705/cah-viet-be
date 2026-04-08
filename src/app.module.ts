import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [AuthModule, RoomsModule, RedisModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
