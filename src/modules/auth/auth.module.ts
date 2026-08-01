import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { jwtConfig } from '../../config';
import type { JwtConfig } from '../../config';
import { AuthController } from './presentation/controllers/auth.controller';
import { AuthService } from './application/services/auth.service';
import { IAuthService } from './application/services/auth.service.interface';
import { ITokenService } from './application/services/token.service.interface';
import { IGuestSessionStore } from './application/services/guest-session.store.interface';
import { JwtTokenService } from './infrastructure/services/jwt-token.service';
import { RedisGuestSessionStore } from './infrastructure/services/redis-guest-session.store';
import { AuthMapper } from './presentation/mappers/auth.mapper';
import { JwtStrategy } from './presentation/guards/jwt.strategy';
import { WsJwtGuard } from './presentation/guards/ws-jwt.guard';
import { IPlayerRepository } from './domain/repositories/player.repository.interface';
import { PrismaPlayerRepository } from './infrastructure/repositories/prisma-player.repository';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: JwtConfig) => ({ secret: config.secret }),
      inject: [jwtConfig.KEY],
    }),
  ],
  controllers: [AuthController],
  providers: [
    { provide: IPlayerRepository, useClass: PrismaPlayerRepository },
    { provide: ITokenService, useClass: JwtTokenService },
    { provide: IGuestSessionStore, useClass: RedisGuestSessionStore },
    AuthMapper,
    { provide: IAuthService, useClass: AuthService },
    JwtStrategy,
    WsJwtGuard,
  ],
  // `JwtModule` deliberately stays private — other modules consume `ITokenService`.
  exports: [PassportModule, ITokenService, IGuestSessionStore, WsJwtGuard],
})
export class AuthModule {}
