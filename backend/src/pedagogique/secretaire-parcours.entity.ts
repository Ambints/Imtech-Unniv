import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Parcours } from '../academic/academic.entities';

/**
 * Entité de liaison entre Secrétaire et Parcours
 * Permet d'affecter plusieurs parcours à un secrétaire avec métadonnées d'audit
 */
@Entity('secretaire_parcours')
export class SecretaireParcours {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'secretaire_id' })
  secretaireId: string;

  @Column({ name: 'parcours_id' })
  parcoursId: string;

  @ManyToOne(() => Parcours, { eager: true })
  @JoinColumn({ name: 'parcours_id' })
  parcours: Parcours;

  @Column({ name: 'assigned_at', default: () => 'NOW()' })
  assignedAt: Date;

  @Column({ name: 'assigned_by', nullable: true })
  assignedBy: string; // ID de l'admin qui a fait l'affectation

  @Column({ name: 'actif', default: true })
  actif: boolean; // Permet de désactiver une affectation sans la supprimer

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
