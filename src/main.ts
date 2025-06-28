import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

/**
 * Point d'entrée principal de l'application NestJS
 * Initialise et démarre le serveur WebSocket avec Fastify
 */
async function bootstrap() {
  // Crée l'instance de l'application NestJS avec Fastify comme serveur HTTP
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // Active CORS pour permettre les requêtes cross-origin
  app.enableCors();
  await app.listen(3000, '0.0.0.0');
}
bootstrap();
