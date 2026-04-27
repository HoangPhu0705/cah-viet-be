import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { IPlayerRepository } from '../../core/repositories/player.repository.interface';
import { AuthFactoryService } from './auth-factory.service';
import { LoginDto } from '../../shared/dto/auth/login.dto';
import { AuthResponseDto } from '../../shared/dto/auth/auth-response.dto';
import { JwtPayload } from '../../shared/types';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly playerRepo: IPlayerRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly factory: AuthFactoryService,
  ) {}

  async execute(dto: LoginDto): Promise<AuthResponseDto> {
    const player = await this.playerRepo.findByEmail(dto.email);
    if (!player?.passwordHash) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, player.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const payload: JwtPayload = { sub: player.id, nickname: player.nickname, isGuest: false };
    const ttlSeconds = this.parseTtlToSeconds(
      this.configService.get<string>('jwt.expiresIn') ?? '7d',
    );

    const accessToken = this.jwtService.sign(payload, { expiresIn: ttlSeconds });

    const response = new AuthResponseDto();
    response.accessToken = accessToken;
    response.player = this.factory.toPlayerResponseDto(player);
    return response;
  }

  private parseTtlToSeconds(ttl: string): number {
    const match = ttl.match(/^(\d+)([smhd])$/);
    if (!match) return 604800;
    const value = parseInt(match[1], 10);
    const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
    return value * (multipliers[match[2]] ?? 1);
  }
}
