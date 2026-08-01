import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectJwtConfig } from '../../../../config';
import type { JwtConfig } from '../../../../config';
import {
  AuthTokenPayload,
  AuthTokenType,
  IssuedToken,
  TokenSubject,
} from '../../../../shared/types';
import { InvalidTokenException } from '../../domain/exceptions/auth.exceptions';
import { ITokenService } from '../../application/services/token.service.interface';

/** Claims we sign; `sub`/`iss`/`aud`/`exp`/`iat` are added by the signer options. */
type AppClaims = Pick<AuthTokenPayload, 'nickname' | 'isGuest' | 'tokenType'>;

/**
 * The only place in the app that touches the JWT library.
 *
 * Every token is stamped with this app's `iss` + `aud` and a `tokenType` claim, and
 * verification requires all three — so a token signed with the same secret by
 * anything else (another service sharing the secret, an old deploy, a copy-pasted
 * token from another environment) is rejected.
 */
@Injectable()
export class JwtTokenService extends ITokenService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectJwtConfig() private readonly config: JwtConfig,
  ) {
    super();
  }

  issueAccessToken(subject: TokenSubject): IssuedToken {
    return this.issue(
      subject,
      AuthTokenType.Access,
      this.config.accessTokenTtlSeconds,
    );
  }

  issueGuestToken(subject: TokenSubject): IssuedToken {
    return this.issue(
      subject,
      AuthTokenType.Guest,
      this.config.guestTokenTtlSeconds,
    );
  }

  verify(token: string): AuthTokenPayload {
    let decoded: unknown;
    try {
      decoded = this.jwtService.verify<Record<string, unknown>>(token, {
        secret: this.config.secret,
        issuer: this.config.issuer,
        audience: this.config.audience,
        algorithms: [this.config.algorithm],
      });
    } catch {
      throw new InvalidTokenException();
    }

    return this.validateClaims(decoded);
  }

  validateClaims(payload: unknown): AuthTokenPayload {
    if (typeof payload !== 'object' || payload === null) {
      throw new InvalidTokenException('Malformed token payload');
    }

    const claims = payload as Partial<AuthTokenPayload>;

    if (claims.iss !== this.config.issuer) {
      throw new InvalidTokenException('Token was not issued by this app');
    }
    if (!this.hasAudience(claims.aud)) {
      throw new InvalidTokenException('Token was not issued for this app');
    }
    if (!this.isKnownTokenType(claims.tokenType)) {
      throw new InvalidTokenException('Unknown token type');
    }
    if (typeof claims.sub !== 'string' || typeof claims.nickname !== 'string') {
      throw new InvalidTokenException('Missing player claims');
    }
    // `isGuest` drives authorization elsewhere, so it must agree with the token type.
    if (claims.isGuest !== (claims.tokenType === AuthTokenType.Guest)) {
      throw new InvalidTokenException('Inconsistent token claims');
    }

    return {
      sub: claims.sub,
      nickname: claims.nickname,
      isGuest: claims.isGuest,
      tokenType: claims.tokenType,
      iss: claims.iss,
      aud: claims.aud,
      iat: claims.iat,
      exp: claims.exp,
    };
  }

  private issue(
    subject: TokenSubject,
    tokenType: AuthTokenType,
    expiresInSeconds: number,
  ): IssuedToken {
    const claims: AppClaims = {
      nickname: subject.nickname,
      isGuest: tokenType === AuthTokenType.Guest,
      tokenType,
    };

    const token = this.jwtService.sign(claims, {
      secret: this.config.secret,
      subject: subject.id,
      issuer: this.config.issuer,
      audience: this.config.audience,
      algorithm: this.config.algorithm,
      expiresIn: expiresInSeconds,
    });

    return { token, expiresInSeconds };
  }

  private hasAudience(aud: string | string[] | undefined): boolean {
    return Array.isArray(aud)
      ? aud.includes(this.config.audience)
      : aud === this.config.audience;
  }

  private isKnownTokenType(value: unknown): value is AuthTokenType {
    return Object.values<unknown>(AuthTokenType).includes(value);
  }
}
