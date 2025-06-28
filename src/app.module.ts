import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ChatGateway } from './chat/chat.gateway';
import { ChatMessage } from './chat/chat-message.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

/**
 * Module principal de l'application NestJS
 * Configure les modules de configuration, base de données et WebSocket
 */
@Module({
  imports: [
    // Module de configuration pour charger les variables d'environnement
    ConfigModule.forRoot({
      isGlobal: true, // charge le .env automatiquement
    }),

    // Configuration de la connexion à la base de données MongoDB avec TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mongodb', // Type de base de données
        url: config.get<string>('MONGO_URI'),
        synchronize: true, // Synchronise automatiquement le schéma avec la base de données
        entities: [ChatMessage], // Liste des entités à synchroniser
      }),
    }),

    // Enregistrement de l'entité ChatMessage pour l'injection de dépendances
    TypeOrmModule.forFeature([ChatMessage]),
  ],
  providers: [ChatGateway],
})
export class AppModule {}
