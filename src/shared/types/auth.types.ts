/**
 * Marks what a token is allowed to do. Carried as a private claim so a token
 * minted for one flow can't be replayed in another.
 */
export const AuthTokenType = {
  Access: 'access',
  Guest: 'guest',
} as const;

export type AuthTokenType = (typeof AuthTokenType)[keyof typeof AuthTokenType];

/** Claims this app puts in — and requires back out of — every token it accepts. */
export interface AuthTokenPayload {
  sub: string;
  nickname: string;
  isGuest: boolean;
  tokenType: AuthTokenType;
  iss?: string;
  aud?: string | string[];
  iat?: number;
  exp?: number;
}

/** Who a token is issued for. */
export interface TokenSubject {
  id: string;
  nickname: string;
}

export interface IssuedToken {
  token: string;
  expiresInSeconds: number;
}
