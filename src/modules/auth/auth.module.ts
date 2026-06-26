import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './presentation/controllers/auth.controller';
import { AuthService } from './application/services/auth.service';
import { IAuthService } from './application/services/auth.service.interface';
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
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.secret'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    { provide: IPlayerRepository, useClass: PrismaPlayerRepository },
    AuthMapper,
    { provide: IAuthService, useClass: AuthService },
    JwtStrategy,
    WsJwtGuard,
  ],
  exports: [JwtModule, PassportModule, WsJwtGuard],
})
export class AuthModule {}
