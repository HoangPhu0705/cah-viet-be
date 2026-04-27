export class JwtPayload {
  sub: string;
  nickname: string;
  isGuest: boolean;
  iat?: number;
  exp?: number;
}
