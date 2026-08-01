import { registerAs } from '@nestjs/config';
import { parseTtlToSeconds } from '../../common/utils/time.utils';

export const JWT_CONFIG_NAMESPACE = 'jwt';

const DEFAULT_ACCESS_TTL = '7d';
const DEFAULT_ACCESS_TTL_SECONDS = 604_800;
const DEFAULT_GUEST_TTL = '24h';
const DEFAULT_GUEST_TTL_SECONDS = 86_400;

export interface JwtConfig {
  secret: string;
  /** `iss` claim — proves the token was minted by this backend. */
  issuer: string;
  /** `aud` claim — proves the token was minted for this app's clients. */
  audience: string;
  algorithm: 'HS256';
  accessTokenTtlSeconds: number;
  guestTokenTtlSeconds: number;
}

export default registerAs(JWT_CONFIG_NAMESPACE, (): JwtConfig => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');

  return {
    secret,
    issuer: process.env.JWT_ISSUER || 'xamcard-be',
    audience: process.env.JWT_AUDIENCE || 'xamcard-web',
    algorithm: 'HS256',
    accessTokenTtlSeconds: parseTtlToSeconds(
      process.env.JWT_EXPIRES_IN || DEFAULT_ACCESS_TTL,
      DEFAULT_ACCESS_TTL_SECONDS,
    ),
    guestTokenTtlSeconds: parseTtlToSeconds(
      process.env.GUEST_JWT_EXPIRES_IN || DEFAULT_GUEST_TTL,
      DEFAULT_GUEST_TTL_SECONDS,
    ),
  };
});
