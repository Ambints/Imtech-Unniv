import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';

@Entity({ name: 'presidents' })
export class President {
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

  @Column({ type: 'text', nullable: true })
  signature_numerique: string;

  @Column({ default: true })
  actif: boolean;

  @Column({ type: 'date', nullable: true })
  date_debut_mandat: Date;

  @Column({ type: 'date', nullable: true })
  date_fin_mandat: Date;

  @OneToMany(() => DecisionPresidentielle, decision => decision.president)
  decisions: DecisionPresidentielle[];

  @OneToMany(() => ValidationRecrutement, validation => validation.president)
  validationsRecrutement: ValidationRecrutement[];

  @OneToMany(() => Arbitrage, arbitrage => arbitrage.president)
  arbitrages: Arbitrage[];

  @OneToMany(() => ConseilUniversitaire, conseil => conseil.president)
  conseils: ConseilUniversitaire[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity({ name: 'decisions_presidentielles' })
export class DecisionPresidentielle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  titre: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  contenu: string;

  @Column({ 
    type: 'enum', 
    enum: ['brouillon', 'en_attente', 'approuve', 'rejete', 'publie'],
    default: 'brouillon'
  })
  statut: string;

  @Column({ type: 'date' })
  date_decision: Date;

  @Column({ type: 'text', nullable: true })
  signature_numerique: string;

  @ManyToOne(() => President, president => president.decisions)
  @JoinColumn({ name: 'president_id' })
  president: President;

  @OneToMany(() => Arbitrage, arbitrage => arbitrage.decision)
  arbitrages: Arbitrage[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity({ name: 'validations_recrutements' })
export class ValidationRecrutement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  type_recrutement: string;

  @Column({ length: 200 })
  candidat_nom: string;

  @Column({ length: 200 })
  poste: string;

  @Column({ type: 'text', nullable: true })
  motivation: string;

  @Column({ 
    type: 'enum', 
    enum: ['en_attente', 'approuve', 'rejete', 'demande_info'],
    default: 'en_attente'
  })
  statut: string;

  @Column({ type: 'text', nullable: true })
  commentaire: string;

  @Column({ type: 'date' })
  date_validation: Date;

  @Column({ type: 'text', nullable: true })
  signature_numerique: string;

  @ManyToOne(() => President, president => president.validationsRecrutement)
  @JoinColumn({ name: 'president_id' })
  president: President;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity({ name: 'arbitrages' })
export class Arbitrage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  titre: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  contexte: string;

  @Column({ type: 'text', nullable: true })
  decision_arbitrage: string;

  @Column({ 
    type: 'enum', 
    enum: ['ouvert', 'en_cours', 'termine', 'reporte'],
    default: 'ouvert'
  })
  statut: string;

  @Column({ type: 'date' })
  date_arbitrage: Date;

  @Column({ type: 'text', nullable: true })
  signature_numerique: string;

  @ManyToOne(() => President, president => president.arbitrages)
  @JoinColumn({ name: 'president_id' })
  president: President;

  @ManyToOne(() => DecisionPresidentielle, decision => decision.arbitrages)
  @JoinColumn({ name: 'decision_id' })
  decision: DecisionPresidentielle;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity({ name: 'conseils_universitaires' })
export class ConseilUniversitaire {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  titre: string;

  @Column({ type: 'text', nullable: true })
  ordre_du_jour: string;

  @Column({ type: 'text', nullable: true })
  compte_rendu: string;

  @Column({ type: 'date' })
  date_conseil: Date;

  @Column({ type: 'time' })
  heure_debut: string;

  @Column({ type: 'time', nullable: true })
  heure_fin: string;

  @Column({ length: 200, nullable: true })
  lieu: string;

  @Column({ 
    type: 'enum', 
    enum: ['planifie', 'en_cours', 'termine', 'annule'],
    default: 'planifie'
  })
  statut: string;

  @Column({ type: 'text', nullable: true })
  participants: string;

  @Column({ type: 'text', nullable: true })
  decisions_prises: string;

  @ManyToOne(() => President, president => president.conseils)
  @JoinColumn({ name: 'president_id' })
  president: President;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
