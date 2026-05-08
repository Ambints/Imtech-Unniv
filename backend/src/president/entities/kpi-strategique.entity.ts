import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/user.entity';

@Entity({ name: 'kpi_strategique' })
export class KpiStrategique {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  nom: string;

  @Column({ length: 50 })
  categorie: 'academique' | 'financier' | 'rh' | 'pastoral' | 'infrastructure' | 'qualite';

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'formule_calcul', type: 'text', nullable: true })
  formuleCalcul: string;

  @Column({ name: 'unite_mesure', length: 30, nullable: true })
  uniteMesure: string;

  @Column({ name: 'valeur_cible', type: 'decimal', precision: 15, scale: 2 })
  valeurCible: number;

  @Column({ name: 'valeur_actuelle', type: 'decimal', precision: 15, scale: 2, nullable: true })
  valeurActuelle: number;

  @Column({ name: 'seuil_alerte', type: 'decimal', precision: 15, scale: 2, nullable: true })
  seuilAlerte: number;

  @Column({ name: 'frequence_mesure', length: 30, nullable: true })
  frequenceMesure: 'quotidien' | 'hebdomadaire' | 'mensuel' | 'trimestriel' | 'annuel';

  @Column({ name: 'responsable_suivi_id', type: 'uuid', nullable: true })
  responsableSuiviId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'responsable_suivi_id' })
  responsableSuivi: User;

  @Column({ type: 'boolean', default: true })
  actif: boolean;

  @Column({ name: 'date_debut', type: 'date' })
  dateDebut: Date;

  @Column({ name: 'date_fin', type: 'date', nullable: true })
  dateFin: Date;

  @Column({ name: 'historique_valeurs', type: 'jsonb', nullable: true })
  historiqueValeurs: any;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

// Made with Bob
