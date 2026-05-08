import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/user.entity';
import { Incident } from '../../discipline/discipline.entities';

@Entity({ name: 'arbitrage_discipline' })
export class ArbitrageDiscipline {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'numero_arbitrage', length: 50, unique: true })
  numeroArbitrage: string;

  @Column({ name: 'incident_id', type: 'uuid' })
  incidentId: string;

  @ManyToOne(() => Incident)
  @JoinColumn({ name: 'incident_id' })
  incident: Incident;

  @Column({ name: 'etudiant_id', type: 'uuid', nullable: true })
  etudiantId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'etudiant_id' })
  etudiant: User;

  @Column({ name: 'conseil_discipline_date', type: 'date', nullable: true })
  conseilDisciplineDate: Date;

  @Column({ name: 'membres_conseil', type: 'jsonb', nullable: true })
  membresConseil: any;

  @Column({ name: 'decision_conseil', type: 'text', nullable: true })
  decisionConseil: string;

  @Column({ name: 'sanction_proposee', length: 50, nullable: true })
  sanctionProposee: string;

  @Column({ name: 'appel_demande', type: 'boolean', default: false })
  appelDemande: boolean;

  @Column({ name: 'motif_appel', type: 'text', nullable: true })
  motifAppel: string;

  @Column({ name: 'date_appel', type: 'timestamptz', nullable: true })
  dateAppel: Date;

  @Column({ name: 'arbitre_id', type: 'uuid' })
  arbitreId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'arbitre_id' })
  arbitre: User;

  @Column({ name: 'date_arbitrage', type: 'timestamptz' })
  dateArbitrage: Date;

  @Column({ name: 'decision_arbitrale', type: 'text' })
  decisionArbitrale: string;

  @Column({ name: 'sanction_finale', length: 50, nullable: true })
  sanctionFinale: 'aucune' | 'avertissement' | 'blame' | 'exclusion_temporaire' | 'exclusion_definitive' | 'autre';

  @Column({ name: 'duree_exclusion_jours', type: 'int', nullable: true })
  dureeExclusionJours: number;

  @Column({ name: 'conditions_reintegration', type: 'text', nullable: true })
  conditionsReintegration: string;

  @Column({ name: 'commentaire_president', type: 'text', nullable: true })
  commentairePresident: string;

  @Column({ length: 20, default: 'definitif' })
  statut: 'definitif' | 'en_appel' | 'annule';

  @Column({ name: 'notification_envoyee', type: 'boolean', default: false })
  notificationEnvoyee: boolean;

  @Column({ name: 'date_notification', type: 'timestamptz', nullable: true })
  dateNotification: Date;

  @Column({ name: 'document_decision_url', type: 'text', nullable: true })
  documentDecisionUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

// Made with Bob
