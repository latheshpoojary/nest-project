import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerService } from './modules/logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule,{
    bufferLogs: true,
  });
  app.useLogger(app.get(LoggerService));
  app.setGlobalPrefix('api/v1');
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
