import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('sujet_examen')
export class SujetExamen {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'session_id' }) sessionId: string;
  @Column({ name: 'ec_id' }) ecId: string;
  @Column() titre: string;
  @Column({ type: 'text' }) description: string;
  @Column({ name: 'duree_minutes' }) dureeMinutes: number;
  @Column({ name: 'coefficient', type: 'decimal', precision: 4, scale: 2, default: 1 }) coefficient: number;
  @Column({ name: 'fichier_sujet_url', nullable: true }) fichierSujetUrl: string;
  @Column({ name: 'fichier_correction_url', nullable: true }) fichierCorrectionUrl: string;
  @Column({ name: 'depose_par' }) deposePar: string;
  @Column({ name: 'date_depot', default: () => 'NOW()' }) dateDepot: Date;
  @Column({ name: 'valide_par', nullable: true }) validePar: string;
  @Column({ name: 'date_validation', nullable: true }) dateValidation: Date;
  @Column({ default: 'en_preparation' }) statut: 'en_preparation' | 'soumis' | 'valide' | 'refuse' | 'archive';
  @Column({ name: 'relecteurs', type: 'simple-array', nullable: true }) relecteurs: string[];
  @Column({ type: 'jsonb', nullable: true }) historique: any;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

@Entity('deliberation')
export class Deliberation {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'session_id' }) sessionId: string;
  @Column({ name: 'ue_id' }) ueId: string;
  @Column({ name: 'date_deliberation' }) dateDeliberation: Date;
  @Column({ name: 'president_jury' }) presidentJury: string;
  @Column({ type: 'simple-array', nullable: true }) membresJury: string[];
  @Column({ name: 'moyenne_generale', type: 'decimal', precision: 5, scale: 2, nullable: true }) moyenneGenerale: number;
  @Column({ name: 'taux_reussite', type: 'decimal', precision: 5, scale: 2, nullable: true }) tauxReussite: number;
  @Column({ name: 'pv_signe_url', nullable: true }) pvSigneUrl: string;
  @Column({ default: 'en_cours' }) statut: 'en_cours' | 'verrouille' | 'publie' | 'archive';
  @Column({ name: 'verrouille_par', nullable: true }) verrouillePar: string;
  @Column({ name: 'date_verrouillage', nullable: true }) dateVerrouillage: Date;
  @Column({ type: 'text', nullable: true }) observations: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

@Entity('jury')
export class Jury {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'deliberation_id' }) deliberationId: string;
  @Column({ name: 'enseignant_id' }) enseignantId: string;
  @Column() role: 'president' | 'membre' | 'secretaire' | 'invite';
  @Column({ name: 'date_convocation', nullable: true }) dateConvocation: Date;
  @Column({ name: 'present', default: false }) present: boolean;
  @Column({ name: 'signature_url', nullable: true }) signatureUrl: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}

@Entity('pv_note')
export class PVNote {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'deliberation_id' }) deliberationId: string;
  @Column({ name: 'etudiant_id' }) etudiantId: string;
  @Column({ name: 'moyenne_ue', type: 'decimal', precision: 5, scale: 2 }) moyenneUe: number;
  @Column({ name: 'moyenne_generale', type: 'decimal', precision: 5, scale: 2 }) moyenneGenerale: number;
  @Column({ name: 'credits_acquis', default: 0 }) creditsAcquis: number;
  @Column({ name: 'mention' }) mention: 'passable' | 'assez_bien' | 'bien' | 'tres_bien' | 'excellent';
  @Column({ default: 'passe' }) decision: 'passe' | 'redouble' | 'exclu' | 'ajourne';
  @Column({ name: 'appreciation', nullable: true }) appreciation: string;
  @Column({ default: false }) valide: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
