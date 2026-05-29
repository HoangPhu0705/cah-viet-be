import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import {
  EmailAlreadyInUseException,
  InvalidCredentialsException,
} from '../../domain/exceptions/auth.exceptions';
import { IPlayerRepository } from '../../domain/repositories/player.repository.interface';
import { RedisService } from '../../../../infrastructure/redis/redis.service';
import { AuthMapper } from '../../presentation/mappers/auth.mapper';
import { GuestLoginDto } from '../../presentation/dto/guest-login.dto';
import { RegisterDto } from '../../presentation/dto/register.dto';
import { LoginDto } from '../../presentation/dto/login.dto';
import { AuthResponseDto } from '../../presentation/dto/auth-response.dto';
import { JwtPayload } from '../../../../shared/types';
import { parseTtlToSeconds } from '../../../../common/utils/time.utils';

@Injectable()
export class AuthService {
  constructor(
    private readonly playerRepo: IPlayerRepository,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
    private readonly mapper: AuthMapper,
  ) {}

  async guestLogin(dto: GuestLoginDto): Promise<AuthResponseDto> {
    const player = await this.playerRepo.create({
      nickname: dto.nickname,
      avatarId: dto.avatarId,
      isGuest: true,
    });

    const payload: JwtPayload = {
      sub: player.id,
      nickname: player.nickname,
      isGuest: true,
    };
    const ttlSeconds = parseTtlToSeconds(
      this.configService.get<string>('jwt.guestExpiresIn') ?? '24h',
      86400,
    );

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: ttlSeconds,
    });
    await this.redisService.set(`guest:session:${player.id}`, '1', ttlSeconds);

    return this.buildResponse(accessToken, player);
  }

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const existing = await this.playerRepo.findByEmail(dto.email);
    if (existing) throw new EmailAlreadyInUseException();

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const player = await this.playerRepo.create({
      nickname: dto.nickname,
      avatarId: dto.avatarId,
      isGuest: false,
      email: dto.email,
      passwordHash,
    });

    const payload: JwtPayload = {
      sub: player.id,
      nickname: player.nickname,
      isGuest: false,
    };

    return this.buildResponse(this.signRegisteredToken(payload), player);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const player = await this.playerRepo.findByEmail(dto.email);
    if (!player?.passwordHash) throw new InvalidCredentialsException();

    const valid = await bcrypt.compare(dto.password, player.passwordHash);
    if (!valid) throw new InvalidCredentialsException();

    const payload: JwtPayload = {
      sub: player.id,
      nickname: player.nickname,
      isGuest: false,
    };

    return this.buildResponse(this.signRegisteredToken(payload), player);
  }

  private signRegisteredToken(payload: JwtPayload): string {
    const ttlSeconds = parseTtlToSeconds(
      this.configService.get<string>('jwt.expiresIn') ?? '7d',
      604800,
    );
    return this.jwtService.sign(payload, { expiresIn: ttlSeconds });
  }

  private buildResponse(
    accessToken: string,
    player: Parameters<AuthMapper['toPlayerResponseDto']>[0],
  ): AuthResponseDto {
    const response = new AuthResponseDto();
    response.accessToken = accessToken;
    response.player = this.mapper.toPlayerResponseDto(player);
    return response;
  }
}
