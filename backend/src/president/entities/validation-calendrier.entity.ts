import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/user.entity';
import { AnneeAcademique } from '../../academic/academic.entities';

@Entity({ name: 'validation_calendrier' })
export class ValidationCalendrier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'annee_academique_id', type: 'uuid' })
  anneeAcademiqueId: string;

  @ManyToOne(() => AnneeAcademique)
  @JoinColumn({ name: 'annee_academique_id' })
  anneeAcademique: AnneeAcademique;

  @Column({ name: 'type_calendrier', length: 30 })
  typeCalendrier: 'general' | 'examens' | 'vacances' | 'evenements';

  @Column({ name: 'proposeur_id', type: 'uuid' })
  proposeurId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'proposeur_id' })
  proposeur: User;

  @Column({ name: 'date_proposition', type: 'timestamptz' })
  dateProposition: Date;

  @Column({ name: 'validateur_id', type: 'uuid', nullable: true })
  validateurId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'validateur_id' })
  validateur: User;

  @Column({ name: 'date_validation', type: 'timestamptz', nullable: true })
  dateValidation: Date;

  @Column({ length: 30, default: 'en_attente' })
  statut: 'en_attente' | 'approuve' | 'rejete' | 'en_revision';

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ name: 'calendrier_data', type: 'jsonb' })
  calendrierData: any;

  @Column({ name: 'commentaire_proposeur', type: 'text', nullable: true })
  commentaireProposeur: string;

  @Column({ name: 'commentaire_validateur', type: 'text', nullable: true })
  commentaireValidateur: string;

  @Column({ name: 'modifications_demandees', type: 'text', nullable: true })
  modificationsDemandees: string;

  @Column({ name: 'date_rentree', type: 'date', nullable: true })
  dateRentree: Date;

  @Column({ name: 'date_fin_cours', type: 'date', nullable: true })
  dateFinCours: Date;

  @Column({ name: 'periodes_examens', type: 'jsonb', nullable: true })
  periodesExamens: any;

  @Column({ name: 'periodes_vacances', type: 'jsonb', nullable: true })
  periodesVacances: any;

  @Column({ name: 'evenements_importants', type: 'jsonb', nullable: true })
  evenementsImportants: any;

  @Column({ name: 'document_calendrier_url', type: 'text', nullable: true })
  documentCalendrierUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

// Made with Bob
