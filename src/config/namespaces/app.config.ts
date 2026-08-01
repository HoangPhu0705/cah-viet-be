import { registerAs } from '@nestjs/config';

export const APP_CONFIG_NAMESPACE = 'app';

export interface AppConfig {
  nodeEnv: string;
  isDevelopment: boolean;
  port: number;
  feUrl: string;
  swaggerEnabled: boolean;
}

export default registerAs(APP_CONFIG_NAMESPACE, (): AppConfig => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isDevelopment = nodeEnv === 'development';

  return {
    nodeEnv,
    isDevelopment,
    port: parseInt(process.env.PORT || '3001', 10),
    feUrl: process.env.FE_URL || 'http://localhost:3000',
    swaggerEnabled: isDevelopment || process.env.SWAGGER_ENABLED === 'true',
  };
});
