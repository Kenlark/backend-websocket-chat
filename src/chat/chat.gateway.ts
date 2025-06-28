import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Server, Socket } from 'socket.io';
import { ChatMessage } from './chat-message.entity';

/**
 * Gateway WebSocket pour gérer les communications de chat en temps réel
 * Cette classe gère les connexions, déconnexions et l'envoi de messages
 */
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  // Instance du serveur WebSocket Socket.io
  @WebSocketServer()
  server: Server;

  constructor(
    // Injection du repository TypeORM pour accéder à la base de données
    @InjectRepository(ChatMessage)
    private readonly messageRepo: Repository<ChatMessage>,
  ) {}

  /**
   * Gère la connexion d'un nouveau client WebSocket
   * Envoie l'historique des 50 derniers messages au client qui se connecte
   */
  async handleConnection(client: Socket) {
    console.log(`Client connecté: ${client.id}`);

    // Récupère les 50 derniers messages de la base de données
    const history = await this.messageRepo.find({
      order: { timestamp: 'ASC' }, // Tri par ordre chronologique
      take: 50, // Limite à 50 messages
    });

    // Envoie l'historique au client qui vient de se connecter
    client.emit('chatHistory', history);
  }

  /**
   * Gère la déconnexion d'un client WebSocket
   */
  handleDisconnect(client: Socket) {
    console.log(`Client déconnecté: ${client.id}`);
  }

  /**
   * Gère l'envoi d'un nouveau message de chat
   * Sauvegarde le message en base et le diffuse à tous les clients connectés
   */
  @SubscribeMessage('sendMessage')
  async handleMessage(
    client: Socket,
    payload: { user: string; message: string }, // Données du message (utilisateur et contenu)
  ) {
    // Sauvegarde le message en base de données avec un timestamp
    const saved = await this.messageRepo.save({
      user: payload.user,
      message: payload.message,
      timestamp: new Date().toISOString(),
    });

    // Diffuse le message sauvegardé à tous les clients connectés
    this.server.emit('newMessage', saved);
  }
}
