import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './common/filters/all-exception.filter';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  // Crear la aplicación con rawBody habilitado para webhooks de Stripe
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  // Servir archivos estáticos de imágenes
  app.use('/images', express.static(join(__dirname, '..', 'uploads')));

  // Configurar CORS
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  const logger = new Logger(AppModule.name);
  const configService = app.get(ConfigService);

  // Global Exception Filter = maneja TODOS los errores
  // app.useGlobalFilters(new AllExceptionsFilter());

  // Global prefix desde el archivo .env
  const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1');
  app.setGlobalPrefix(apiPrefix);

  // Global validation pipe para DTOs 
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: false,
      transform: true, // Habilita la transformación automática
      validationError: {
        target: false,
        value: false,
      },
    }),
  );

  // Iniciar el servidor 
  const port = configService.get<string>('PORT', '3001');
  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`API Base URL: http://localhost:${port}/${apiPrefix}`);
  logger.log(`Images URL: http://localhost:${port}/images`);
}

bootstrap();