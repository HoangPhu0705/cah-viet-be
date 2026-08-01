import { Inject } from '@nestjs/common';
import appConfig from './namespaces/app.config';
import jwtConfig from './namespaces/jwt.config';
import redisConfig from './namespaces/redis.config';
import databaseConfig from './namespaces/database.config';

/**
 * Single place where config lives:
 *  - one namespace file per concern, each returning a typed object
 *  - one `Inject*Config()` decorator per namespace
 *
 * Consumers inject a typed slice instead of reaching for `ConfigService.get('some.key')`,
 * so a renamed key is a compile error rather than an `undefined` at runtime.
 */
export const configNamespaces = [
  appConfig,
  jwtConfig,
  redisConfig,
  databaseConfig,
];

export const InjectAppConfig = (): ReturnType<typeof Inject> =>
  Inject(appConfig.KEY);

export const InjectJwtConfig = (): ReturnType<typeof Inject> =>
  Inject(jwtConfig.KEY);

export const InjectRedisConfig = (): ReturnType<typeof Inject> =>
  Inject(redisConfig.KEY);

export const InjectDatabaseConfig = (): ReturnType<typeof Inject> =>
  Inject(databaseConfig.KEY);

export { appConfig, jwtConfig, redisConfig, databaseConfig };
export type { AppConfig } from './namespaces/app.config';
export type { JwtConfig } from './namespaces/jwt.config';
export type { RedisConfig } from './namespaces/redis.config';
export type { DatabaseConfig } from './namespaces/database.config';
