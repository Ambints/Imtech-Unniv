import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('incident')
export class Incident {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'etudiant_id' }) etudiantId: string;
  @Column({ name: 'date_incident', default: () => 'CURRENT_DATE' }) dateIncident: Date;
  @Column() lieu: string;
  @Column() description: string;
  @Column({ name: 'temoins', type: 'text', nullable: true }) temoins: string;
  @Column({ name: 'gravite', default: 'mineure' }) gravite: 'mineure' | 'moyenne' | 'majeure' | 'critique';
  @Column({ default: 'en_attente' }) statut: 'en_attente' | 'valide' | 'rejette' | 'cloture';
  @Column({ name: 'declare_par' }) declarePar: string;
  @Column({ name: 'valide_par', nullable: true }) validePar: string;
  @Column({ name: 'date_validation', nullable: true }) dateValidation: Date;
  @Column({ nullable: true }) observations: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

@Entity('sanction')
export class Sanction {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'etudiant_id' }) etudiantId: string;
  @Column({ name: 'incident_id', nullable: true }) incidentId: string;
  @Column() type: 'avertissement' | 'blame' | 'exclusion_temporaire' | 'exclusion_definitive' | 'travail_communautaire';
  @Column({ name: 'date_debut' }) dateDebut: Date;
  @Column({ name: 'date_fin', nullable: true }) dateFin: Date;
  @Column() motif: string;
  @Column({ name: 'decide_par' }) decidePar: string;
  @Column({ default: 'en_cours' }) statut: 'en_cours' | 'executee' | 'annulee' | 'appelee';
  @Column({ name: 'date_notification', nullable: true }) dateNotification: Date;
  @Column({ name: 'parent_notifie', default: false }) parentNotifie: boolean;
  @Column({ nullable: true }) observations: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

@Entity('avertissement')
export class Avertissement {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'etudiant_id' }) etudiantId: string;
  @Column() niveau: number; // 1, 2, 3
  @Column() motif: string;
  @Column({ name: 'emis_par' }) emisPar: string;
  @Column({ name: 'date_emission', default: () => 'CURRENT_DATE' }) dateEmission: Date;
  @Column({ name: 'date_lecture', nullable: true }) dateLecture: Date;
  @Column({ name: 'elu_conseil', default: false }) eluConseil: boolean;
  @Column({ name: 'date_conseil', nullable: true }) dateConseil: Date;
  @Column({ default: 'actif' }) statut: 'actif' | 'retire' | 'acquitte';
  @Column({ nullable: true }) observations: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
