import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('releve_note')
export class ReleveNote {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'etudiant_id' }) etudiantId: string;
  @Column({ name: 'annee_academique_id' }) anneeAcademiqueId: string;
  @Column() semestre: number;
  @Column({ name: 'moyenne_generale', type: 'decimal', precision: 5, scale: 2 }) moyenneGenerale: number;
  @Column({ name: 'credits_valides', default: 0 }) creditsValides: number;
  @Column({ name: 'credits_total', default: 0 }) creditsTotal: number;
  @Column() mention: 'passable' | 'assez_bien' | 'bien' | 'tres_bien' | 'excellent' | 'ajourne';
  @Column({ name: 'numero_releve', unique: true }) numeroReleve: string;
  @Column({ name: 'fichier_url', nullable: true }) fichierUrl: string;
  @Column({ default: 'brouillon' }) statut: 'brouillon' | 'valide' | 'signe' | 'delivre' | 'archive';
  @Column({ name: 'genere_par', nullable: true }) generePar: string;
  @Column({ name: 'date_generation', default: () => 'NOW()' }) dateGeneration: Date;
  @Column({ name: 'valide_par', nullable: true }) validePar: string;
  @Column({ name: 'date_validation', nullable: true }) dateValidation: Date;
  @Column({ name: 'signe_par', nullable: true }) signePar: string;
  @Column({ name: 'date_signature', nullable: true }) dateSignature: Date;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

@Entity('attestation')
export class Attestation {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'etudiant_id' }) etudiantId: string;
  @Column() type: 'scolarite' | 'reussite' | 'inscription' | 'stage' | 'bourse' | 'paiement' | 'comportement';
  @Column({ name: 'annee_academique_id', nullable: true }) anneeAcademiqueId: string;
  @Column({ name: 'numero_attestation', unique: true }) numeroAttestation: string;
  @Column({ type: 'text' }) contenu: string;
  @Column({ name: 'fichier_url', nullable: true }) fichierUrl: string;
  @Column({ default: 'en_preparation' }) statut: 'en_preparation' | 'valide' | 'signe' | 'delivre';
  @Column({ name: 'demande_par' }) demandePar: string;
  @Column({ name: 'date_demande', default: () => 'NOW()' }) dateDemande: Date;
  @Column({ name: 'valide_par', nullable: true }) validePar: string;
  @Column({ name: 'date_validation', nullable: true }) dateValidation: Date;
  @Column({ name: 'signe_par', nullable: true }) signePar: string;
  @Column({ name: 'date_signature', nullable: true }) dateSignature: Date;
  @Column({ name: 'date_delivrance', nullable: true }) dateDelivrance: Date;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

@Entity('diplome')
export class Diplome {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'etudiant_id' }) etudiantId: string;
  @Column({ name: 'parcours_id' }) parcoursId: string;
  @Column({ name: 'annee_academique_id' }) anneeAcademiqueId: string;
  @Column({ name: 'type_diplome' }) typeDiplome: 'licence' | 'master' | 'doctorat' | 'certificat' | 'attestation';
  @Column({ name: 'mention_obtenue' }) mentionObtenue: 'passable' | 'assez_bien' | 'bien' | 'tres_bien' | 'excellent';
  @Column({ name: 'numero_diplome', unique: true }) numeroDiplome: string;
  @Column({ name: 'numero_livret', unique: true, nullable: true }) numeroLivret: string;
  @Column({ name: 'moyenne_generale', type: 'decimal', precision: 5, scale: 2 }) moyenneGenerale: number;
  @Column({ name: 'date_obtention' }) dateObtention: Date;
  @Column({ name: 'fichier_diplome_url', nullable: true }) fichierDiplomeUrl: string;
  @Column({ name: 'fichier_supplement_url', nullable: true }) fichierSupplementUrl: string;
  @Column({ default: 'en_preparation' }) statut: 'en_preparation' | 'valide' | 'signe' | 'delivre' | 'archive';
  @Column({ name: 'genere_par', nullable: true }) generePar: string;
  @Column({ name: 'valide_par', nullable: true }) validePar: string;
  @Column({ name: 'date_validation', nullable: true }) dateValidation: Date;
  @Column({ name: 'signe_numeriquement', default: false }) signeNumeriquement: boolean;
  @Column({ name: 'signature_president_url', nullable: true }) signaturePresidentUrl: string;
  @Column({ name: 'date_signature', nullable: true }) dateSignature: Date;
  @Column({ name: 'date_delivrance', nullable: true }) dateDelivrance: Date;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
