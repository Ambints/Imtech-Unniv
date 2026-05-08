import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/user.entity';
import { Parcours } from '../../academic/academic.entities';

@Entity({ name: 'validation_parcours' })
export class ValidationParcours {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'parcours_id', type: 'uuid' })
  parcoursId: string;

  @ManyToOne(() => Parcours)
  @JoinColumn({ name: 'parcours_id' })
  parcours: Parcours;

  @Column({ name: 'type_action', length: 30 })
  typeAction: 'ouverture' | 'fermeture' | 'modification' | 'suspension';

  @Column({ name: 'demandeur_id', type: 'uuid' })
  demandeurId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'demandeur_id' })
  demandeur: User;

  @Column({ name: 'validateur_id', type: 'uuid', nullable: true })
  validateurId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'validateur_id' })
  validateur: User;

  @Column({ name: 'date_demande', type: 'timestamptz' })
  dateDemande: Date;

  @Column({ name: 'date_validation', type: 'timestamptz', nullable: true })
  dateValidation: Date;

  @Column({ length: 30, default: 'en_attente' })
  statut: 'en_attente' | 'approuve' | 'rejete' | 'en_revision';

  @Column({ name: 'motif_demande', type: 'text' })
  motifDemande: string;

  @Column({ name: 'commentaire_validateur', type: 'text', nullable: true })
  commentaireValidateur: string;

  @Column({ type: 'jsonb', nullable: true })
  justificatifs: any;

  @Column({ name: 'impact_analyse', type: 'text', nullable: true })
  impactAnalyse: string;

  @Column({ name: 'date_effet', type: 'date', nullable: true })
  dateEffet: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

// Made with Bob
