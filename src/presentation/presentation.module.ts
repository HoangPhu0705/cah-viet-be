import { Module } from '@nestjs/common';
import { AuthUseCasesModule } from '../use-cases/auth/auth-use-cases.module';
import { AuthController } from './controllers/auth.controller';
import { RoomsController } from './controllers/rooms.controller';
import { JwtStrategy } from './guards/jwt.strategy';
import { WsJwtGuard } from './guards/ws-jwt.guard';

@Module({
  imports: [AuthUseCasesModule],
  controllers: [AuthController, RoomsController],
  providers: [JwtStrategy, WsJwtGuard],
})
export class PresentationModule {}
