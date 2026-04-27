import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IPlayerRepository } from '../../core/repositories/player.repository.interface';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { AuthFactoryService } from './auth-factory.service';
import { GuestLoginDto } from '../../shared/dto/auth/guest-login.dto';
import { AuthResponseDto } from '../../shared/dto/auth/auth-response.dto';
import { JwtPayload } from '../../shared/types';

@Injectable()
export class GuestLoginUseCase {
  constructor(
    private readonly playerRepo: IPlayerRepository,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
    private readonly factory: AuthFactoryService,
  ) {}

  async execute(dto: GuestLoginDto): Promise<AuthResponseDto> {
    const player = await this.playerRepo.create({
      nickname: dto.nickname,
      avatarId: dto.avatarId,
      isGuest: true,
    });

    const payload: JwtPayload = { sub: player.id, nickname: player.nickname, isGuest: true };
    const ttlSeconds = this.parseTtlToSeconds(
      this.configService.get<string>('jwt.guestExpiresIn') ?? '24h',
    );

    const accessToken = this.jwtService.sign(payload, { expiresIn: ttlSeconds });
    await this.redisService.set(`guest:session:${player.id}`, '1', ttlSeconds);

    const response = new AuthResponseDto();
    response.accessToken = accessToken;
    response.player = this.factory.toPlayerResponseDto(player);
    return response;
  }

  private parseTtlToSeconds(ttl: string): number {
    const match = ttl.match(/^(\d+)([smhd])$/);
    if (!match) return 86400;
    const value = parseInt(match[1], 10);
    const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
    return value * (multipliers[match[2]] ?? 1);
  }
}
