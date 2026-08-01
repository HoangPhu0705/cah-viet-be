import {
  AuthTokenPayload,
  IssuedToken,
  TokenSubject,
} from '../../../../shared/types';

/**
 * The app's own token contract. Everything outside this module talks to tokens
 * through here, so the JWT library stays an implementation detail of
 * `JwtTokenService` and can be swapped (paseto, opaque tokens, KMS-signed) without
 * touching callers.
 */
export abstract class ITokenService {
  /** Long-lived token for a registered player. */
  abstract issueAccessToken(subject: TokenSubject): IssuedToken;

  /** Short-lived token for a guest player, tied to a Redis session. */
  abstract issueGuestToken(subject: TokenSubject): IssuedToken;

  /** Verifies signature, expiry and this app's claims. Throws on anything else. */
  abstract verify(token: string): AuthTokenPayload;

  /**
   * Claims-only check, for the passport strategy which has already done the
   * signature/expiry verification itself. Prefer `verify` everywhere else.
   */
  abstract validateClaims(payload: unknown): AuthTokenPayload;
}
