import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Verrouillage des notes après délibération
 */
@Entity('verrouillage_notes')
export class VerrouillageNotes {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ name: 'session_examen_id' })
  sessionExamenId: string;

  @Column({ name: 'parcours_id' })
  parcoursId: string;

  @Column({ name: 'ue_id', nullable: true })
  ueId: string;

  @Column({ name: 'date_deliberation' })
  dateDeliberation: Date;

  @Column({ default: true })
  verrouille: boolean;

  @Column({ name: 'verrouille_par' })
  verrouillePar: string;

  @Column({ name: 'date_verrouillage', default: () => 'NOW()' })
  dateVerrouillage: Date;

  @Column({ name: 'deverrouille_par', nullable: true })
  deverrouillePar: string;

  @Column({ name: 'date_deverrouillage', nullable: true })
  dateDeverrouillage: Date;

  @Column({ type: 'text', nullable: true })
  motif_deverrouillage: string;

  @Column({ name: 'jeton_admin', nullable: true })
  jetonAdmin: string; // Token pour déverrouillage d'urgence

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

/**
 * Calcul des moyennes et résultats par étudiant
 */
@Entity('resultat_academique')
export class ResultatAcademique {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ name: 'etudiant_id' })
  etudiantId: string;

  @Column({ name: 'session_examen_id' })
  sessionExamenId: string;

  @Column({ name: 'parcours_id' })
  parcoursId: string;

  @Column({ name: 'moyenne_generale', type: 'decimal', precision: 5, scale: 2 })
  moyenneGenerale: number;

  @Column({ name: 'total_credits', default: 0 })
  totalCredits: number;

  @Column({ name: 'credits_valides', default: 0 })
  creditsValides: number;

  @Column({ type: 'jsonb', default: [] })
  details_ues: any[]; // [{ueId, moyenneUe, coefficient, credits, valide}]

  @Column({ type: 'jsonb', default: [] })
  details_ecs: any[]; // [{ecId, note, coefficient}]

  @Column()
  mention: string; // passable, assez_bien, bien, tres_bien, excellent

  @Column()
  decision: 'passe' | 'redouble' | 'ajourne' | 'exclu' | 'dispense';

  @Column({ name: 'est_definitif', default: false })
  estDefinitif: boolean;

  @Column({ name: 'date_calcul', default: () => 'NOW()' })
  dateCalcul: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

/**
 * Relevés de notes officiels générés
 */
@Entity('releve_note')
export class ReleveNote {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ name: 'etudiant_id' })
  etudiantId: string;

  @Column({ name: 'session_examen_id' })
  sessionExamenId: string;

  @Column({ name: 'numero_releve', unique: true })
  numeroReleve: string;

  @Column({ name: 'fichier_pdf_url', nullable: true })
  fichierPdfUrl: string;

  @Column({ type: 'jsonb' })
  contenu: any; // Données structurées du relevé

  @Column({ default: 'brouillon' })
  statut: 'brouillon' | 'valide' | 'imprime' | 'delivre';

  @Column({ name: 'genere_par' })
  generePar: string;

  @Column({ name: 'date_generation', default: () => 'NOW()' })
  dateGeneration: Date;

  @Column({ name: 'valide_par', nullable: true })
  validePar: string;

  @Column({ name: 'date_validation', nullable: true })
  dateValidation: Date;

  @Column({ name: 'est_signe_numerique', default: false })
  estSigneNumerique: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

/**
 * Attestations et diplômes
 */
@Entity('diplome_document')
export class DiplomeDocument {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ name: 'etudiant_id' })
  etudiantId: string;

  @Column({ name: 'parcours_id' })
  parcoursId: string;

  @Column()
  type: 'attestation_reussite' | 'diplome_provisoire' | 'diplome_definitif';

  @Column({ name: 'numero_document', unique: true })
  numeroDocument: string;

  @Column({ name: 'fichier_pdf_url', nullable: true })
  fichierPdfUrl: string;

  @Column({ name: 'date_delivrance', nullable: true })
  dateDelivrance: Date;

  @Column({ default: 'en_preparation' })
  statut: 'en_preparation' | 'verifie' | 'signe' | 'delivre' | 'archive';

  @Column({ name: 'est_verifie_finance', default: false })
  estVerifieFinance: boolean; // Vérification dettes économat

  @Column({ name: 'est_verifie_discipline', default: false })
  estVerifieDiscipline: boolean;

  @Column({ name: 'delivre_par', nullable: true })
  delivrePar: string;

  @Column({ type: 'text', nullable: true })
  observations: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

/**
 * Équivalences de crédits (Erasmus, transferts)
 */
@Entity('equivalence_credit')
export class EquivalenceCredit {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ name: 'etudiant_id' })
  etudiantId: string;

  @Column({ name: 'etablissement_origine' })
  etablissementOrigine: string;

  @Column({ name: 'pays_origine', nullable: true })
  paysOrigine: string;

  @Column({ name: 'programme_origine' })
  programmeOrigine: string;

  @Column({ type: 'jsonb' })
  credits_origine: any[]; // [{matiere, credits, note}]

  @Column({ type: 'jsonb' })
  equivalences_attribuees: any[]; // [{ueId, creditsAttribues}]

  @Column({ name: 'total_credits_transfere', default: 0 })
  totalCreditsTransfere: number;

  @Column({ default: 'demande' })
  statut: 'demande' | 'en_etude' | 'valide' | 'refuse';

  @Column({ name: 'traite_par', nullable: true })
  traitePar: string;

  @Column({ name: 'date_decision', nullable: true })
  dateDecision: Date;

  @Column({ type: 'text', nullable: true })
  justification: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

// Made with Bob
