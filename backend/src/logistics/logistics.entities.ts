import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('ticket_maintenance')
export class TicketMaintenance {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'batiment_id', nullable: true }) batimentId: string;
  @Column({ name: 'salle_id', nullable: true }) salleId: string;
  @Column() titre: string;
  @Column() description: string;
  @Column({ name: 'type_maintenance', default: 'curative' }) typeMaintenance: string;
  @Column({ default: 'normale' }) priorite: string;
  @Column({ default: 'ouvert' }) statut: string;
  @Column({ name: 'signale_par' }) signalePar: string;
  @Column({ name: 'assigne_a', nullable: true }) assigneA: string;
  @Column({ name: 'date_signalement', default: () => 'NOW()' }) dateSignalement: Date;
  @Column({ name: 'date_resolution', nullable: true }) dateResolution: Date;
  @Column({ name: 'photos_url', type: 'jsonb', default: [] }) photosUrl: any;
  @Column({ name: 'cout_reparation', nullable: true, type: 'decimal', precision: 10, scale: 2 }) coutReparation: number;
  @Column({ nullable: true }) observations: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

@Entity('reservation_salle')
export class ReservationSalle {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'salle_id' }) salleId: string;
  @Column() titre: string;
  @Column({ nullable: true }) description: string;
  @Column({ name: 'date_reservation' }) dateReservation: Date;
  @Column({ name: 'heure_debut', type: 'time' }) heureDebut: string;
  @Column({ name: 'heure_fin', type: 'time' }) heureFin: string;
  @Column({ name: 'demande_par' }) demandePar: string;
  @Column({ name: 'approuve_par', nullable: true }) approuvePar: string;
  @Column({ default: 'en_attente' }) statut: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}

@Entity('stock')
export class Stock {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() reference: string;
  @Column() libelle: string;
  @Column() categorie: string;
  @Column() unite: string;
  @Column({ name: 'quantite_stock', type: 'decimal', precision: 10, scale: 2, default: 0 }) quantiteStock: number;
  @Column({ name: 'seuil_alerte', type: 'decimal', precision: 10, scale: 2, default: 0 }) seuilAlerte: number;
  @Column({ name: 'prix_unitaire', nullable: true, type: 'decimal', precision: 10, scale: 2 }) prixUnitaire: number;
  @Column({ nullable: true }) fournisseur: string;
  @Column({ nullable: true }) emplacement: string;
  @Column({ name: 'derniere_mise_a_jour', default: () => 'NOW()' }) derniereMiseAJour: Date;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}

@Entity('mouvement_stock')
export class MouvementStock {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'stock_id' }) stockId: string;
  @Column({ name: 'type_mouvement' }) typeMouvement: string;
  @Column({ type: 'decimal', precision: 10, scale: 2 }) quantite: number;
  @Column({ nullable: true }) motif: string;
  @Column({ name: 'reference_doc', nullable: true }) referenceDoc: string;
  @Column({ name: 'utilisateur_id', nullable: true }) utilisateurId: string;
  @Column({ name: 'date_mouvement', default: () => 'NOW()' }) dateMouvement: Date;
}

@Entity('planning_entretien')
export class PlanningEntretien {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'salle_id', nullable: true }) salleId: string;
  @Column({ name: 'batiment_id', nullable: true }) batimentId: string;
  @Column({ nullable: true }) zone: string;
  @Column({ name: 'type_nettoyage' }) typeNettoyage: string;
  @Column({ name: 'responsable_id', nullable: true }) responsableId: string;
  @Column({ name: 'jour_semaine', nullable: true }) jourSemaine: number;
  @Column({ name: 'heure_debut', type: 'time', nullable: true }) heureDebut: string;
  @Column({ name: 'duree_minutes', nullable: true }) dureeMinutes: number;
  @Column({ default: true, name: 'actif' }) actif: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}

@Entity('rapport_entretien')
export class RapportEntretien {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'planning_id', nullable: true }) planningId: string;
  @Column({ name: 'realise_par' }) realisePar: string;
  @Column({ name: 'date_realisation', default: () => 'CURRENT_DATE' }) dateRealisation: Date;
  @Column({ name: 'heure_debut', type: 'time', nullable: true }) heureDebut: string;
  @Column({ name: 'heure_fin', type: 'time', nullable: true }) heureFin: string;
  @Column({ default: 'realise' }) statut: string;
  @Column({ nullable: true }) observations: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}