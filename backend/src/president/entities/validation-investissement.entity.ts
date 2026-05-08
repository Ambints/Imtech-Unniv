import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/user.entity';
import { Departement } from '../../academic/academic.entities';

@Entity({ name: 'validation_investissement' })
export class ValidationInvestissement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'numero_projet', length: 50, unique: true })
  numeroProjet: string;

  @Column({ length: 255 })
  titre: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ length: 50 })
  categorie: 'infrastructure' | 'equipement' | 'informatique' | 'mobilier' | 'vehicule' | 'autre';

  @Column({ name: 'sous_categorie', length: 100, nullable: true })
  sousCategorie: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  montant: number;

  @Column({ length: 10, default: 'MGA' })
  devise: string;

  @Column({ name: 'departement_beneficiaire_id', type: 'uuid', nullable: true })
  departementBeneficiaireId: string;

  @ManyToOne(() => Departement)
  @JoinColumn({ name: 'departement_beneficiaire_id' })
  departementBeneficiaire: Departement;

  @Column({ name: 'demandeur_id', type: 'uuid' })
  demandeurId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'demandeur_id' })
  demandeur: User;

  @Column({ name: 'validateur_economat_id', type: 'uuid', nullable: true })
  validateurEconomatId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'validateur_economat_id' })
  validateurEconomat: User;

  @Column({ name: 'date_validation_economat', type: 'timestamptz', nullable: true })
  dateValidationEconomat: Date;

  @Column({ name: 'validateur_president_id', type: 'uuid', nullable: true })
  validateurPresidentId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'validateur_president_id' })
  validateurPresident: User;

  @Column({ name: 'date_validation_president', type: 'timestamptz', nullable: true })
  dateValidationPresident: Date;

  @Column({ length: 30, default: 'en_attente' })
  statut: 'en_attente' | 'valide_economat' | 'approuve' | 'rejete' | 'en_revision' | 'en_cours' | 'termine';

  @Column({ length: 20, default: 'normale' })
  priorite: 'haute' | 'normale' | 'basse';

  @Column({ type: 'boolean', default: false })
  urgence: boolean;

  @Column({ type: 'text' })
  justification: string;

  @Column({ name: 'impact_attendu', type: 'text', nullable: true })
  impactAttendu: string;

  @Column({ name: 'alternatives_etudiees', type: 'text', nullable: true })
  alternativesEtudiees: string;

  @Column({ name: 'source_financement', length: 100, nullable: true })
  sourceFinancement: string;

  @Column({ name: 'devis_urls', type: 'jsonb', nullable: true })
  devisUrls: any;

  @Column({ name: 'cahier_charges_url', type: 'text', nullable: true })
  cahierChargesUrl: string;

  @Column({ name: 'date_debut_prevue', type: 'date', nullable: true })
  dateDebutPrevue: Date;

  @Column({ name: 'date_fin_prevue', type: 'date', nullable: true })
  dateFinPrevue: Date;

  @Column({ name: 'duree_mois', type: 'int', nullable: true })
  dureeMois: number;

  @Column({ name: 'fournisseur_propose', length: 255, nullable: true })
  fournisseurPropose: string;

  @Column({ name: 'commentaire_economat', type: 'text', nullable: true })
  commentaireEconomat: string;

  @Column({ name: 'commentaire_president', type: 'text', nullable: true })
  commentairePresident: string;

  @Column({ name: 'decision_finale', type: 'text', nullable: true })
  decisionFinale: string;

  @Column({ name: 'conditions_approbation', type: 'text', nullable: true })
  conditionsApprobation: string;

  @Column({ name: 'suivi_realisation', type: 'jsonb', nullable: true })
  suiviRealisation: any;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

// Made with Bob
