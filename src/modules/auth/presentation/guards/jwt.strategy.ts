import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectJwtConfig } from '../../../../config';
import type { JwtConfig } from '../../../../config';
import { AuthTokenPayload } from '../../../../shared/types';
import { AppException } from '../../../../common/exceptions/app.exception';
import { ITokenService } from '../../application/services/token.service.interface';
import { IGuestSessionStore } from '../../application/services/guest-session.store.interface';

/**
 * passport-jwt does the signature/expiry/`iss`/`aud` checks from the same config the
 * signer uses; `validate` then defers the app-specific claim rules to `ITokenService`
 * so HTTP and WebSocket auth can't drift apart.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectJwtConfig() config: JwtConfig,
    private readonly tokenService: ITokenService,
    private readonly guestSessions: IGuestSessionStore,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.secret,
      issuer: config.issuer,
      audience: config.audience,
      algorithms: [config.algorithm],
    });
  }

  async validate(rawPayload: unknown): Promise<AuthTokenPayload> {
    let payload: AuthTokenPayload;
    try {
      payload = this.tokenService.validateClaims(rawPayload);
    } catch (error) {
      throw new UnauthorizedException(
        error instanceof AppException ? error.message : 'Invalid token',
      );
    }

    if (payload.isGuest && !(await this.guestSessions.isActive(payload.sub))) {
      throw new UnauthorizedException('Guest session expired');
    }

    return payload;
  }
}
