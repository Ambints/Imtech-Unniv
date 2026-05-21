import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { MessageEnseignant } from './message-enseignant.entity';
import { Etudiant } from '../../scolarite/entities/etudiant.entity';

@Entity('message_destinataire')
export class MessageDestinataire {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'message_id' })
  messageId: string;

  @Column({ name: 'etudiant_id' })
  etudiantId: string;

  @Column({ default: false })
  lu: boolean;

  @Column({ name: 'date_lecture', nullable: true })
  dateLecture?: Date;

  // Relations
  @ManyToOne(() => MessageEnseignant, message => message.destinataires)
  @JoinColumn({ name: 'message_id' })
  message: MessageEnseignant;

  @ManyToOne(() => Etudiant)
  @JoinColumn({ name: 'etudiant_id' })
  etudiant: Etudiant;
}

// Made with Bob
