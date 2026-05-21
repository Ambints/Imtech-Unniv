import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Suivi moral et comportemental des étudiants
 * Important pour une université catholique
 */
@Entity('suivi_moral')
export class SuiviMoral {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'etudiant_id' })
  etudiantId: string;

  @Column({ name: 'date_entretien', type: 'date' })
  dateEntretien: Date;

  @Column()
  sujet: string;

  @Column({ type: 'text' })
  observations: string;

  @Column({ type: 'text', nullable: true })
  recommandations: string;

  @Column({ name: 'suivi_par' })
  suiviPar: string; // ID du surveillant

  @Column({ name: 'parent_informe', default: false })
  parentInforme: boolean;

  @Column({ name: 'date_information_parent', nullable: true })
  dateInformationParent: Date;

  @Column({ default: 'en_cours' })
  statut: 'en_cours' | 'cloture' | 'suivi_requis';

  @Column({ name: 'prochain_rdv', type: 'date', nullable: true })
  prochainRdv: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

/**
 * Autorisations de sortie (important pour mineurs et internes)
 */
@Entity('autorisation_sortie')
export class AutorisationSortie {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'etudiant_id' })
  etudiantId: string;

  @Column()
  type: 'sortie_anticipee' | 'absence_prevue' | 'sortie_exceptionnelle';

  @Column({ name: 'date_debut', type: 'timestamp' })
  dateDebut: Date;

  @Column({ name: 'date_fin', type: 'timestamp' })
  dateFin: Date;

  @Column({ type: 'text' })
  motif: string;

  @Column({ name: 'demande_par' })
  demandePar: string; // Étudiant, parent, ou tuteur

  @Column({ name: 'est_mineur', default: false })
  estMineur: boolean;

  @Column({ name: 'autorisation_parentale_url', nullable: true })
  autorisationParentaleUrl: string;

  @Column({ default: 'en_attente' })
  statut: 'en_attente' | 'approuvee' | 'refusee' | 'annulee';

  @Column({ name: 'validee_par', nullable: true })
  valideePar: string; // ID du surveillant

  @Column({ name: 'date_validation', nullable: true })
  dateValidation: Date;

  @Column({ name: 'motif_refus', nullable: true })
  motifRefus: string;

  @Column({ type: 'text', nullable: true })
  observations: string;

  @Column({ name: 'sortie_effective', default: false })
  sortieEffective: boolean;

  @Column({ name: 'heure_sortie', type: 'time', nullable: true })
  heureSortie: string;

  @Column({ name: 'heure_retour', type: 'time', nullable: true })
  heureRetour: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

/**
 * Rapport de conduite périodique
 */
@Entity('rapport_conduite')
export class RapportConduite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'etudiant_id' })
  etudiantId: string;

  @Column({ type: 'date' })
  periode_debut: Date;

  @Column({ type: 'date' })
  periode_fin: Date;

  @Column({ name: 'note_comportement', type: 'decimal', precision: 3, scale: 1 })
  noteComportement: number; // Sur 20

  @Column({ name: 'note_assiduite', type: 'decimal', precision: 3, scale: 1 })
  noteAssiduite: number; // Sur 20

  @Column({ name: 'note_discipline', type: 'decimal', precision: 3, scale: 1 })
  noteDiscipline: number; // Sur 20

  @Column({ name: 'nombre_absences', default: 0 })
  nombreAbsences: number;

  @Column({ name: 'nombre_retards', default: 0 })
  nombreRetards: number;

  @Column({ name: 'nombre_sanctions', default: 0 })
  nombreSanctions: number;

  @Column({ type: 'text' })
  appreciation_generale: string;

  @Column({ type: 'text', nullable: true })
  points_forts: string;

  @Column({ type: 'text', nullable: true })
  points_amelioration: string;

  @Column({ type: 'text', nullable: true })
  recommandations: string;

  @Column({ name: 'redige_par' })
  redigePar: string; // ID du surveillant

  @Column({ name: 'valide_par', nullable: true })
  validePar: string; // ID du responsable

  @Column({ default: 'brouillon' })
  statut: 'brouillon' | 'valide' | 'transmis_parents';

  @Column({ name: 'date_transmission', nullable: true })
  dateTransmission: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

/**
 * Conseil de discipline
 */
@Entity('conseil_discipline')
export class ConseilDiscipline {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'etudiant_id' })
  etudiantId: string;

  @Column({ name: 'date_conseil', type: 'timestamp' })
  dateConseil: Date;

  @Column({ type: 'text' })
  motif_convocation: string;

  @Column({ type: 'jsonb', default: [] })
  incidents_lies: string[]; // IDs des incidents

  @Column({ type: 'jsonb', default: [] })
  membres_presents: any[]; // [{nom, role, signature}]

  @Column({ type: 'text', nullable: true })
  deliberation: string;

  @Column({ nullable: true })
  decision: 'aucune_sanction' | 'avertissement' | 'blame' | 'exclusion_temporaire' | 'exclusion_definitive' | 'renvoi';

  @Column({ type: 'text', nullable: true })
  justification_decision: string;

  @Column({ name: 'droit_appel', default: true })
  droitAppel: boolean;

  @Column({ name: 'delai_appel_jours', default: 15 })
  delaiAppelJours: number;

  @Column({ default: 'convoque' })
  statut: 'convoque' | 'tenu' | 'reporte' | 'annule';

  @Column({ name: 'proces_verbal_url', nullable: true })
  procesVerbalUrl: string;

  @Column({ name: 'parent_present', default: false })
  parentPresent: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

// Made with Bob