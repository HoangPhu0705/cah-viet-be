import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AuthTokenPayload } from '../../../../shared/types';
import { AppException } from '../../../../common/exceptions/app.exception';
import { ITokenService } from '../../application/services/token.service.interface';
import { IGuestSessionStore } from '../../application/services/guest-session.store.interface';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private readonly tokenService: ITokenService,
    private readonly guestSessions: IGuestSessionStore,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    const token =
      (client.handshake.auth?.token as string) ??
      client.handshake.headers.authorization?.replace('Bearer ', '') ??
      '';

    if (!token) throw new WsException('No token provided');

    let payload: AuthTokenPayload;
    try {
      payload = this.tokenService.verify(token);
    } catch (error) {
      throw new WsException(
        error instanceof AppException ? error.message : 'Invalid token',
      );
    }

    if (payload.isGuest && !(await this.guestSessions.isActive(payload.sub))) {
      throw new WsException('Guest session expired');
    }

    (client.data as { user: AuthTokenPayload }).user = payload;
    return true;
  }
}
