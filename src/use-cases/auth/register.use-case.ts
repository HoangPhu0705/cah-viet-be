import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { IPlayerRepository } from '../../core/repositories/player.repository.interface';
import { AuthFactoryService } from './auth-factory.service';
import { RegisterDto } from '../../shared/dto/auth/register.dto';
import { AuthResponseDto } from '../../shared/dto/auth/auth-response.dto';
import { JwtPayload } from '../../shared/types';

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly playerRepo: IPlayerRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly factory: AuthFactoryService,
  ) {}

  async execute(dto: RegisterDto): Promise<AuthResponseDto> {
    const existing = await this.playerRepo.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const player = await this.playerRepo.create({
      nickname: dto.nickname,
      avatarId: dto.avatarId,
      isGuest: false,
      email: dto.email,
      passwordHash,
    });

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
