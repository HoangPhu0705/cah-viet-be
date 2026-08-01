import { INestApplication, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';
import { AppExceptionFilter } from '../common/filters/app-exception.filter';
import { setupSwagger } from './swagger';
import appConfig from './namespaces/app.config';
import type { AppConfig } from './namespaces/app.config';

export function setupApp(app: INestApplication): void {
  const config = app.get<AppConfig>(appConfig.KEY);

  app.use(helmet());

  app.enableCors({ origin: config.feUrl });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new AppExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  if (config.swaggerEnabled) {
    setupSwagger(app);
  }
}
