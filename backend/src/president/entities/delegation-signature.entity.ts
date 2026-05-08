import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/user.entity';

@Entity({ name: 'delegation_signature' })
export class DelegationSignature {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'numero_delegation', length: 50, unique: true })
  numeroDelegation: string;

  @Column({ name: 'delegant_id', type: 'uuid' })
  delegantId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'delegant_id' })
  delegant: User;

  @Column({ name: 'delegataire_id', type: 'uuid' })
  delegataireId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'delegataire_id' })
  delegataire: User;

  @Column({ name: 'type_document', length: 50 })
  typeDocument: string;

  @Column({ name: 'portee_delegation', type: 'text' })
  porteeDelegation: string;

  @Column({ name: 'date_debut', type: 'date' })
  dateDebut: Date;

  @Column({ name: 'date_fin', type: 'date', nullable: true })
  dateFin: Date;

  @Column({ type: 'boolean', default: true })
  actif: boolean;

  @Column({ type: 'text', nullable: true })
  conditions: string;

  @Column({ name: 'montant_max_autorise', type: 'decimal', precision: 15, scale: 2, nullable: true })
  montantMaxAutorise: number;

  @Column({ name: 'niveaux_autorises', length: 100, nullable: true })
  niveauxAutorises: string;

  @Column({ name: 'raison_delegation', type: 'text', nullable: true })
  raisonDelegation: string;

  @Column({ name: 'document_delegation_url', type: 'text', nullable: true })
  documentDelegationUrl: string;

  @Column({ name: 'date_revocation', type: 'timestamptz', nullable: true })
  dateRevocation: Date;

  @Column({ name: 'raison_revocation', type: 'text', nullable: true })
  raisonRevocation: string;

  @Column({ name: 'notifications_activees', type: 'boolean', default: true })
  notificationsActivees: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

// Made with Bob
