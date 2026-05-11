import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Pointage QR Code pour l'appel numérique
 */
@Entity('pointage_qr')
export class PointageQR {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ name: 'seance_id' })
  seanceId: string;

  @Column({ name: 'etudiant_id' })
  etudiantId: string;

  @Column({ name: 'code_qr', unique: true })
  codeQr: string;

  @Column({ name: 'date_generation', default: () => 'NOW()' })
  dateGeneration: Date;

  @Column({ name: 'date_scan', nullable: true })
  dateScan: Date;

  @Column({ name: 'scanne_par', nullable: true })
  scannePar: string; // ID du surveillant qui a scanné

  @Column({ default: 'scanne' })
  statut: 'scanne' | 'manuel' | 'absent';

  @Column({ name: 'localisation_scan', nullable: true })
  localisationScan: string; // GPS ou salle

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

/**
 * Log des présences avec validation du surveillant
 */
@Entity('presence_surveillance')
export class PresenceSurveillance {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ name: 'etudiant_id' })
  etudiantId: string;

  @Column({ name: 'seance_id' })
  seanceId: string;

  @Column({ name: 'date_pointage', default: () => 'CURRENT_DATE' })
  datePointage: Date;

  @Column({ name: 'heure_arrivee', type: 'time', nullable: true })
  heureArrivee: string;

  @Column({ name: 'heure_depart', type: 'time', nullable: true })
  heureDepart: string;

  @Column({ default: 'present' })
  statut: 'present' | 'absent' | 'retard' | 'sortie_anticipee';

  @Column({ name: 'justificatif_url', nullable: true })
  justificatifUrl: string;

  @Column({ name: 'est_justifie', default: false })
  estJustifie: boolean;

  @Column({ name: 'justifie_par', nullable: true })
  justifiePar: string; // ID du surveillant qui valide

  @Column({ name: 'date_justification', nullable: true })
  dateJustification: Date;

  @Column({ name: 'mode_pointage', default: 'manuel' })
  modePointage: 'qr' | 'manuel' | 'badge';

  @Column({ name: 'pointe_par' })
  pointePar: string; // ID du surveillant

  @Column({ type: 'text', nullable: true })
  observations: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

/**
 * Alertes automatiques vers le secrétariat
 */
@Entity('alerte_discipline')
export class AlerteDiscipline {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ name: 'etudiant_id' })
  etudiantId: string;

  @Column()
  type: 'absence_repetee' | 'retard_cumule' | 'sanction_grave' | 'incident_critique';

  @Column({ type: 'text' })
  message: string;

  @Column({ default: 'non_lue' })
  statut: 'non_lue' | 'lue' | 'traitee';

  @Column({ name: 'generee_par' })
  genereePar: string; // Système ou surveillant

  @Column({ name: 'destinataire_role', default: 'secretariat' })
  destinataireRole: string;

  @Column({ name: 'date_lecture', nullable: true })
  dateLecture: Date;

  @Column({ name: 'traitee_par', nullable: true })
  traiteePar: string;

  @Column({ name: 'date_traitement', nullable: true })
  dateTraitement: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

/**
 * Configuration des salles d'examen pour surveillance
 */
@Entity('configuration_examen')
export class ConfigurationExamen {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ name: 'session_examen_id' })
  sessionExamenId: string;

  @Column({ name: 'salle_id' })
  salleId: string;

  @Column({ name: 'places_total', default: 0 })
  placesTotal: number;

  @Column({ name: 'places_attribuees', default: 0 })
  placesAttribuees: number;

  @Column({ type: 'jsonb', default: [] })
  plan_places: any[]; // [{etudiantId, place, rangee}]

  @Column({ name: 'surveillant_id' })
  surveillantId: string;

  @Column({ default: 'preparation' })
  statut: 'preparation' | 'en_cours' | 'termine' | 'incident';

  @Column({ type: 'text', nullable: true })
  rapport_incident: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

// Made with Bob
