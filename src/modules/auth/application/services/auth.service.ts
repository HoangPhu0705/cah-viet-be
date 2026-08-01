import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  EmailAlreadyInUseException,
  InvalidCredentialsException,
} from '../../domain/exceptions/auth.exceptions';
import { IPlayerRepository } from '../../domain/repositories/player.repository.interface';
import { AuthMapper } from '../../presentation/mappers/auth.mapper';
import { GuestLoginDto } from '../../presentation/dto/guest-login.dto';
import { RegisterDto } from '../../presentation/dto/register.dto';
import { LoginDto } from '../../presentation/dto/login.dto';
import { AuthResponseDto } from '../../presentation/dto/auth-response.dto';
import { IAuthService } from './auth.service.interface';
import { ITokenService } from './token.service.interface';
import { IGuestSessionStore } from './guest-session.store.interface';

const PASSWORD_SALT_ROUNDS = 10;

@Injectable()
export class AuthService extends IAuthService {
  constructor(
    private readonly playerRepo: IPlayerRepository,
    private readonly tokenService: ITokenService,
    private readonly guestSessions: IGuestSessionStore,
    private readonly mapper: AuthMapper,
  ) {
    super();
  }

  async guestLogin(dto: GuestLoginDto): Promise<AuthResponseDto> {
    const player = await this.playerRepo.create({
      nickname: dto.nickname,
      avatarId: dto.avatarId,
      isGuest: true,
    });

    const { token, expiresInSeconds } = this.tokenService.issueGuestToken({
      id: player.id,
      nickname: player.nickname,
    });
    await this.guestSessions.start(player.id, expiresInSeconds);

    return this.buildResponse(token, player);
  }

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const existing = await this.playerRepo.findByEmail(dto.email);
    if (existing) throw new EmailAlreadyInUseException();

    const passwordHash = await bcrypt.hash(dto.password, PASSWORD_SALT_ROUNDS);
    const player = await this.playerRepo.create({
      nickname: dto.nickname,
      avatarId: dto.avatarId,
      isGuest: false,
      email: dto.email,
      passwordHash,
    });

    const { token } = this.tokenService.issueAccessToken({
      id: player.id,
      nickname: player.nickname,
    });

    return this.buildResponse(token, player);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const player = await this.playerRepo.findByEmail(dto.email);
    if (!player?.passwordHash) throw new InvalidCredentialsException();

    const valid = await bcrypt.compare(dto.password, player.passwordHash);
    if (!valid) throw new InvalidCredentialsException();

    const { token } = this.tokenService.issueAccessToken({
      id: player.id,
      nickname: player.nickname,
    });

    return this.buildResponse(token, player);
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
