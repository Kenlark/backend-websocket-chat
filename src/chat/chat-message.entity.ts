import { Entity, ObjectIdColumn, ObjectId, Column } from 'typeorm';

/**
 * Entité représentant un message de chat dans la base de données MongoDB
 * Cette classe définit la structure des données pour les messages du chat
 */
@Entity()
export class ChatMessage {
  // Identifiant unique MongoDB (ObjectId)
  @ObjectIdColumn()
  id: ObjectId;

  // Nom de l'utilisateur qui a envoyé le message
  @Column()
  user: string;

  // Contenu du message
  @Column()
  message: string;

  // Date et heure d'envoi du message
  @Column()
  timestamp: Date;
}
