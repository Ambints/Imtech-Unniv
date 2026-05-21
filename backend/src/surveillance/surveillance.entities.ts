import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';

@Entity({ name: 'surveillants_generaux' })
export class SurveillantGeneral {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  nom: string;

  @Column({ length: 100 })
  prenom: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ length: 20 })
  telephone: string;

  @Column({ 
    type: 'enum', 
    enum: ['permanent', 'vacataire', 'contractuel'],
    default: 'permanent'
  })
  type_contrat: string;

  @Column({ 
    type: 'enum', 
    enum: ['actif', 'en_conge', 'suspendu'],
    default: 'actif'
  })
  statut: string;

  @Column({ type: 'text', nullable: true })
  specialite: string;

  @Column({ default: true })
  actif: boolean;

  @OneToMany(() => AppelNumerique, appel => appel.surveillant)
  appels: AppelNumerique[];

  @OneToMany(() => IncidentDisciplinaire, incident => incident.surveillant)
  incidents: IncidentDisciplinaire[];

  @OneToMany(() => OrganisationExamen, organisation => organisation.surveillant)
  organisations: OrganisationExamen[];

  @OneToMany(() => RapportSurveillance, rapport => rapport.surveillant)
  rapports: RapportSurveillance[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity({ name: 'appels_numeriques' })
export class AppelNumerique {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  titre: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'date' })
  date_appel: Date;

  @Column({ type: 'time' })
  heure_debut: string;

  @Column({ type: 'time', nullable: true })
  heure_fin: string;

  @Column({ length: 200, nullable: true })
  salle: string;

  @Column({ length: 200, nullable: true })
  matiere: string;

  @Column({ length: 200, nullable: true })
  classe: string;

  @Column({ 
    type: 'enum', 
    enum: ['planifie', 'en_cours', 'termine', 'annule'],
    default: 'planifie'
  })
  statut: string;

  @Column({ type: 'text', nullable: true })
  observations: string;

  @Column({ type: 'int', nullable: true })
  nombre_etudiants_present: number;

  @Column({ type: 'int', nullable: true })
  nombre_etudiants_absents: number;

  @ManyToOne(() => SurveillantGeneral, surveillant => surveillant.appels)
  @JoinColumn({ name: 'surveillant_id' })
  surveillant: SurveillantGeneral;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity({ name: 'incidents_disciplinaires' })
export class IncidentDisciplinaire {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  titre: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ 
    type: 'enum', 
    enum: ['mineur', 'moyen', 'grave'],
    default: 'mineur'
  })
  gravite: string;

  @Column({ 
    type: 'enum', 
    enum: ['signale', 'en_investigation', 'traite', 'archive'],
    default: 'signale'
  })
  statut: string;

  @Column({ type: 'date' })
  date_incident: Date;

  @Column({ type: 'time' })
  heure_incident: string;

  @Column({ length: 200, nullable: true })
  lieu: string;

  @Column({ length: 200, nullable: true })
  temoins: string;

  @Column({ type: 'text', nullable: true })
  mesures_prises: string;

  @Column({ type: 'text', nullable: true })
  sanction_appliquee: string;

  @ManyToOne(() => SurveillantGeneral, surveillant => surveillant.incidents)
  @JoinColumn({ name: 'surveillant_id' })
  surveillant: SurveillantGeneral;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity({ name: 'organisations_examens' })
export class OrganisationExamen {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  titre: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'date' })
  date_examen: Date;

  @Column({ type: 'time' })
  heure_debut: string;

  @Column({ type: 'time', nullable: true })
  heure_fin: string;

  @Column({ length: 200, nullable: true })
  salle: string;

  @Column({ length: 200, nullable: true })
  matiere: string;

  @Column({ length: 200, nullable: true })
  classe: string;

  @Column({ type: 'int', nullable: true })
  nombre_etudiants_inscrits: number;

  @Column({ type: 'int', nullable: true })
  nombre_etudiants_presents: number;

  @Column({ 
    type: 'enum', 
    enum: ['planifie', 'en_cours', 'termine', 'annule'],
    default: 'planifie'
  })
  statut: string;

  @Column({ type: 'text', nullable: true })
  observations: string;

  @Column({ type: 'text', nullable: true })
  incidents_signales: string;

  @ManyToOne(() => SurveillantGeneral, surveillant => surveillant.organisations)
  @JoinColumn({ name: 'surveillant_id' })
  surveillant: SurveillantGeneral;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity({ name: 'rapports_surveillance' })
export class RapportSurveillance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  titre: string;

  @Column({ type: 'text' })
  contenu: string;

  @Column({ type: 'date' })
  date_rapport: Date;

  @Column({ 
    type: 'enum', 
    enum: ['journalier', 'hebdomadaire', 'mensuel', 'evenementiel'],
    default: 'journalier'
  })
  type_rapport: string;

  @Column({ 
    type: 'enum', 
    enum: ['brouillon', 'soumis', 'valide', 'rejete'],
    default: 'brouillon'
  })
  statut: string;

  @Column({ type: 'text', nullable: true })
  recommandations: string;

  @Column({ type: 'text', nullable: true })
  actions_correctives: string;

  @ManyToOne(() => SurveillantGeneral, surveillant => surveillant.rapports)
  @JoinColumn({ name: 'surveillant_id' })
  surveillant: SurveillantGeneral;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
