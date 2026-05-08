import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/user.entity';
import { Departement } from '../../academic/academic.entities';

@Entity({ name: 'validation_recrutement' })
export class ValidationRecrutement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'numero_dossier', length: 50, unique: true })
  numeroDossier: string;

  @Column({ name: 'candidat_nom', length: 100 })
  candidatNom: string;

  @Column({ name: 'candidat_prenom', length: 100 })
  candidatPrenom: string;

  @Column({ name: 'candidat_email', length: 254, nullable: true })
  candidatEmail: string;

  @Column({ name: 'candidat_telephone', length: 30, nullable: true })
  candidatTelephone: string;

  @Column({ length: 100 })
  poste: string;

  @Column({ name: 'departement_id', type: 'uuid', nullable: true })
  departementId: string;

  @ManyToOne(() => Departement)
  @JoinColumn({ name: 'departement_id' })
  departement: Departement;

  @Column({ name: 'type_contrat', length: 30 })
  typeContrat: 'cdi' | 'cdd' | 'vacation' | 'stage';

  @Column({ name: 'type_recrutement', length: 30 })
  typeRecrutement: 'strategique' | 'standard' | 'urgent';

  @Column({ name: 'niveau_poste', length: 30, nullable: true })
  niveauPoste: 'direction' | 'cadre' | 'employe' | 'enseignant_titulaire' | 'enseignant_vacataire';

  @Column({ name: 'demandeur_id', type: 'uuid' })
  demandeurId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'demandeur_id' })
  demandeur: User;

  @Column({ name: 'validateur_rh_id', type: 'uuid', nullable: true })
  validateurRhId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'validateur_rh_id' })
  validateurRh: User;

  @Column({ name: 'date_validation_rh', type: 'timestamptz', nullable: true })
  dateValidationRh: Date;

  @Column({ name: 'validateur_president_id', type: 'uuid', nullable: true })
  validateurPresidentId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'validateur_president_id' })
  validateurPresident: User;

  @Column({ name: 'date_validation_president', type: 'timestamptz', nullable: true })
  dateValidationPresident: Date;

  @Column({ length: 30, default: 'en_attente' })
  statut: 'en_attente' | 'valide_rh' | 'approuve' | 'rejete' | 'en_revision';

  @Column({ length: 20, default: 'normale' })
  priorite: 'haute' | 'normale' | 'basse';

  @Column({ name: 'salaire_propose', type: 'decimal', precision: 12, scale: 2 })
  salairePropose: number;

  @Column({ length: 10, default: 'MGA' })
  devise: string;

  @Column({ name: 'date_prise_fonction', type: 'date', nullable: true })
  datePriseFonction: Date;

  @Column({ type: 'text' })
  justification: string;

  @Column({ name: 'competences_requises', type: 'text', nullable: true })
  competencesRequises: string;

  @Column({ name: 'cv_url', type: 'text', nullable: true })
  cvUrl: string;

  @Column({ name: 'lettre_motivation_url', type: 'text', nullable: true })
  lettreMotivationUrl: string;

  @Column({ name: 'diplomes_urls', type: 'jsonb', nullable: true })
  diplomesUrls: any;

  @Column({ name: 'commentaire_rh', type: 'text', nullable: true })
  commentaireRh: string;

  @Column({ name: 'commentaire_president', type: 'text', nullable: true })
  commentairePresident: string;

  @Column({ name: 'decision_finale', type: 'text', nullable: true })
  decisionFinale: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

// Made with Bob
