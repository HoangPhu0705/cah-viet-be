import { registerAs } from '@nestjs/config';

export const DATABASE_CONFIG_NAMESPACE = 'database';

export interface DatabaseConfig {
  url: string;
}

export default registerAs(DATABASE_CONFIG_NAMESPACE, (): DatabaseConfig => {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');

  return { url };
});
