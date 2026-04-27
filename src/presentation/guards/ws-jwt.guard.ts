import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { JwtPayload } from '../../shared/types';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    const token =
      (client.handshake.auth?.token as string) ??
      client.handshake.headers.authorization?.replace('Bearer ', '') ??
      '';

    if (!token) throw new UnauthorizedException('No token provided');

    const payload = this.jwtService.verify<JwtPayload>(token);

    if (payload.isGuest) {
      const exists = await this.redisService.exists(
        `guest:session:${payload.sub}`,
      );
      if (!exists) throw new UnauthorizedException('Guest session expired');
    }

    client.data.user = payload;
    return true;
  }
}
