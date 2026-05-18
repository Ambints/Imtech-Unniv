import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Utilisateur } from '../../scolarite/entities/utilisateur.entity';
import { Etudiant } from '../../scolarite/entities/etudiant.entity';
import { Parcours } from '../../scolarite/entities/parcours.entity';
import { NiveauEtude } from '../../scolarite/entities/niveau-etude.entity';
import { MessageDestinataire } from './message-destinataire.entity';

@Entity('message_enseignant')
export class MessageEnseignant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'enseignant_id' })
  enseignantId: string;

  @Column({ length: 255 })
  sujet: string;

  @Column('text')
  contenu: string;

  @Column({ 
    name: 'type_message',
    type: 'varchar',
    length: 50
  })
  typeMessage: 'direct' | 'classe' | 'parcours';

  // Pour message direct
  @Column({ name: 'etudiant_id', nullable: true })
  etudiantId?: string;

  // Pour message classe
  @Column({ name: 'classe_id', nullable: true })
  classeId?: string;

  // Pour message parcours
  @Column({ name: 'parcours_id', nullable: true })
  parcoursId?: string;

  @Column({ name: 'niveau_id', nullable: true })
  niveauId?: string;

  @Column({ name: 'nombre_destinataires', default: 0 })
  nombreDestinataires: number;

  @CreateDateColumn({ name: 'date_envoi' })
  dateEnvoi: Date;

  @Column({ 
    length: 50,
    default: 'envoye'
  })
  statut: 'envoye' | 'lu' | 'archive';

  // Relations
  @ManyToOne(() => Utilisateur)
  @JoinColumn({ name: 'enseignant_id' })
  enseignant: Utilisateur;

  @ManyToOne(() => Etudiant, { nullable: true })
  @JoinColumn({ name: 'etudiant_id' })
  etudiant?: Etudiant;

  @ManyToOne(() => Parcours, { nullable: true })
  @JoinColumn({ name: 'parcours_id' })
  parcours?: Parcours;

  @ManyToOne(() => NiveauEtude, { nullable: true })
  @JoinColumn({ name: 'niveau_id' })
  niveau?: NiveauEtude;

  @OneToMany(() => MessageDestinataire, destinataire => destinataire.message)
  destinataires: MessageDestinataire[];
}

// Made with Bob
