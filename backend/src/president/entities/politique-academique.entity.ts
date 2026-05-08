import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/user.entity';

@Entity({ name: 'politique_academique' })
export class PolitiqueAcademique {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  titre: string;

  @Column({ name: 'type_politique', length: 50 })
  typePolitique: 'academique' | 'spirituelle' | 'pastorale' | 'administrative' | 'financiere';

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  objectifs: string;

  @Column({ name: 'principes_directeurs', type: 'text', nullable: true })
  principesDirecteurs: string;

  @Column({ name: 'date_adoption', type: 'date' })
  dateAdoption: Date;

  @Column({ name: 'date_revision', type: 'date', nullable: true })
  dateRevision: Date;

  @Column({ name: 'date_expiration', type: 'date', nullable: true })
  dateExpiration: Date;

  @Column({ name: 'auteur_id', type: 'uuid' })
  auteurId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'auteur_id' })
  auteur: User;

  @Column({ name: 'validateur_id', type: 'uuid', nullable: true })
  validateurId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'validateur_id' })
  validateur: User;

  @Column({ length: 30, default: 'brouillon' })
  statut: 'brouillon' | 'en_revision' | 'approuve' | 'actif' | 'archive';

  @Column({ length: 20 })
  version: string;

  @Column({ name: 'document_url', type: 'text', nullable: true })
  documentUrl: string;

  @Column({ name: 'domaines_application', type: 'jsonb', nullable: true })
  domainesApplication: any;

  @Column({ name: 'indicateurs_suivi', type: 'jsonb', nullable: true })
  indicateursSuivi: any;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

// Made with Bob
