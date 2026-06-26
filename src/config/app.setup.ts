import { INestApplication, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';
import { AppExceptionFilter } from '../common/filters/app-exception.filter';
import { setupSwagger } from './swagger';

export function setupApp(app: INestApplication): void {
  app.use(helmet());

  app.enableCors({ origin: process.env.FE_URL || 'http://localhost:3000' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new AppExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  const isDev = process.env.NODE_ENV === 'development';
  if (isDev || process.env.SWAGGER_ENABLED === 'true') {
    setupSwagger(app);
  }
}
