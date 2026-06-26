import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupApp } from './config/app.setup';
import { SWAGGER_PATH } from './config/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setupApp(app);

  const port = process.env.PORT ?? 3001;
  await app.listen(port);

  // Only open browser in interactive local dev
  if (
    process.env.NODE_ENV === 'development' &&
    !process.env.CI &&
    process.stdout.isTTY
  ) {
    try {
      const { default: open } = await import('open');
      await open(`http://localhost:${port}/${SWAGGER_PATH}`);
    } catch {
      // silently skip if browser open fails
    }
  }
}

bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
