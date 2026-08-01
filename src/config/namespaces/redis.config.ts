import { registerAs } from '@nestjs/config';

export const REDIS_CONFIG_NAMESPACE = 'redis';

export interface RedisConfig {
  host: string;
  port: number;
}

export default registerAs(
  REDIS_CONFIG_NAMESPACE,
  (): RedisConfig => ({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  }),
);
