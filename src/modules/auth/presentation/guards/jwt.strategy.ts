import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RedisService } from '../../../../infrastructure/redis/redis.service';
import { JwtPayload } from '../../../../shared/types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly redisService: RedisService) {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not set');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    if (payload.isGuest) {
      const exists = await this.redisService.exists(
        `guest:session:${payload.sub}`,
      );
      if (!exists) throw new UnauthorizedException('Guest session expired');
    }
    return payload;
  }
}
