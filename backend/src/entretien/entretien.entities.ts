import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';

@Entity({ name: 'responsables_logistique' })
export class ResponsableLogistique {
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
    enum: ['permanent', 'contractuel'],
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

  @OneToMany(() => ServiceEntretien, service => service.responsable)
  services: ServiceEntretien[];

  @OneToMany(() => PlanningNettoyage, planning => planning.responsable)
  plannings: PlanningNettoyage[];

  @OneToMany(() => MaintenancePreventive, maintenance => maintenance.responsable)
  maintenances: MaintenancePreventive[];

  @OneToMany(() => RapportEntretien, rapport => rapport.responsable)
  rapports: RapportEntretien[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity({ name: 'services_entretien' })
export class ServiceEntretien {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  nom_service: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ 
    type: 'enum', 
    enum: ['nettoyage', 'maintenance', 'securite', 'jardinage', 'electricite', 'plomberie'],
    default: 'nettoyage'
  })
  type_service: string;

  @Column({ 
    type: 'enum', 
    enum: ['actif', 'inactif', 'suspendu'],
    default: 'actif'
  })
  statut: string;

  @Column({ type: 'text', nullable: true })
  equipements: string;

  @Column({ type: 'text', nullable: true })
  procedures: string;

  @ManyToOne(() => ResponsableLogistique, responsable => responsable.services)
  @JoinColumn({ name: 'responsable_id' })
  responsable: ResponsableLogistique;

  @OneToMany(() => PlanningNettoyage, planning => planning.service)
  plannings: PlanningNettoyage[];

  @OneToMany(() => MaintenancePreventive, maintenance => maintenance.service)
  maintenances: MaintenancePreventive[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity({ name: 'plannings_nettoyage' })
export class PlanningNettoyage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  titre: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'date' })
  date_nettoyage: Date;

  @Column({ type: 'time' })
  heure_debut: string;

  @Column({ type: 'time', nullable: true })
  heure_fin: string;

  @Column({ length: 200, nullable: true })
  zone: string;

  @Column({ length: 200, nullable: true })
  local: string;

  @Column({ 
    type: 'enum', 
    enum: ['journalier', 'hebdomadaire', 'mensuel', 'ponctuel'],
    default: 'journalier'
  })
  frequence: string;

  @Column({ 
    type: 'enum', 
    enum: ['planifie', 'en_cours', 'termine', 'annule'],
    default: 'planifie'
  })
  statut: string;

  @Column({ type: 'text', nullable: true })
  taches: string;

  @Column({ type: 'text', nullable: true })
  observations: string;

  @Column({ type: 'text', nullable: true })
  produits_utilises: string;

  @ManyToOne(() => ResponsableLogistique, responsable => responsable.plannings)
  @JoinColumn({ name: 'responsable_id' })
  responsable: ResponsableLogistique;

  @ManyToOne(() => ServiceEntretien, service => service.plannings)
  @JoinColumn({ name: 'service_id' })
  service: ServiceEntretien;

  @OneToMany(() => StockProduitsMenage, stock => stock.plannings)
  stocks: StockProduitsMenage[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity({ name: 'stocks_produits_menage' })
export class StockProduitsMenage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  nom_produit: string;

  @Column({ 
    type: 'enum', 
    enum: ['produit_nettoyage', 'desinfectant', 'materiel', 'consommable', 'equipement'],
    default: 'produit_nettoyage'
  })
  categorie_produit: string;

  @Column({ length: 100, nullable: true })
  reference: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  quantite_stock: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  stock_minimum: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  stock_maximum: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ 
    type: 'enum', 
    enum: ['disponible', 'en_rupture', 'commande', 'perime'],
    default: 'disponible'
  })
  statut: string;

  @Column({ type: 'text', nullable: true })
  fournisseur: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  prix_unitaire: number;

  @Column({ 
    type: 'enum', 
    enum: ['unite', 'litre', 'kilogramme', 'metre_carre', 'sachet'],
    default: 'unite'
  })
  unite_mesure: string;

  @Column({ type: 'date', nullable: true })
  date_derniere_entree: Date;

  @Column({ type: 'date', nullable: true })
  date_peremption: Date;

  @OneToMany(() => PlanningNettoyage, planning => planning.stocks)
  plannings: PlanningNettoyage[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity({ name: 'maintenances_preventives' })
export class MaintenancePreventive {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  titre: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'date' })
  date_maintenance: Date;

  @Column({ type: 'time' })
  heure_debut: string;

  @Column({ type: 'time', nullable: true })
  heure_fin: string;

  @Column({ length: 200, nullable: true })
  equipement: string;

  @Column({ length: 200, nullable: true })
  localisation: string;

  @Column({ 
    type: 'enum', 
    enum: ['electrique', 'mecanique', 'hydraulique', 'climatisation', 'plomberie', 'informatique'],
    default: 'mecanique'
  })
  type_maintenance: string;

  @Column({ 
    type: 'enum', 
    enum: ['planifie', 'en_cours', 'termine', 'reporte'],
    default: 'planifie'
  })
  statut: string;

  @Column({ type: 'text', nullable: true })
  interventions_realisees: string;

  @Column({ type: 'text', nullable: true })
  pieces_changees: string;

  @Column({ type: 'text', nullable: true })
  observations: string;

  @Column({ type: 'text', nullable: true })
  cout_estime: string;

  @Column({ type: 'text', nullable: true })
  technicien_responsable: string;

  @ManyToOne(() => ResponsableLogistique, responsable => responsable.maintenances)
  @JoinColumn({ name: 'responsable_id' })
  responsable: ResponsableLogistique;

  @ManyToOne(() => ServiceEntretien, service => service.maintenances)
  @JoinColumn({ name: 'service_id' })
  service: ServiceEntretien;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity({ name: 'rapports_entretien' })
export class RapportEntretien {
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
    enum: ['journalier', 'hebdomadaire', 'mensuel', 'evenementiel', 'incident'],
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

  @Column({ type: 'text', nullable: true })
  photos_jointes: string;

  @Column({ type: 'text', nullable: true })
  couts_engages: string;

  @Column({ type: 'text', nullable: true })
  indicateurs_performance: string;

  @ManyToOne(() => ResponsableLogistique, responsable => responsable.rapports)
  @JoinColumn({ name: 'responsable_id' })
  responsable: ResponsableLogistique;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
