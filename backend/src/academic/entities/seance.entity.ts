import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Salle } from './salle.entity';
import { Utilisateur } from '../../scolarite/entities/utilisateur.entity';
import { UniteEnseignement } from '../../scolarite/entities/unite-enseignement.entity';
import { Parcours } from '../../scolarite/entities/parcours.entity';
import { EmploiDuTemps } from './emploi-du-temps.entity';

@Entity('seances')
export class Seance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 200 })
  intitule: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'cm',
    enum: ['cm', 'td', 'tp', 'examen', 'reunion'],
  })
  type: 'cm' | 'td' | 'tp' | 'examen' | 'reunion';

  @Column({ type: 'timestamptz' })
  dateDebut: Date;

  @Column({ type: 'timestamptz' })
  dateFin: Date;

  @Column({ type: 'integer', default: 0 })
  effectif: number;

  @Column({ type: 'integer', default: 0 })
  capacite: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'boolean', default: true })
  actif: boolean;

  // Colonnes de relation pour les recherches
  @Column({ type: 'uuid', nullable: true })
  salleId: string;

  @Column({ type: 'uuid', nullable: true })
  enseignantId: string;

  @Column({ type: 'uuid', nullable: true })
  ueId: string;

  @Column({ type: 'uuid', nullable: true })
  parcoursId: string;

  @Column({ type: 'uuid', nullable: true })
  emploiDuTempsId: string;

  // Relations
  @ManyToOne(() => Salle, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'salle_id' })
  salle: Salle;

  @ManyToOne(() => Utilisateur, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'enseignant_id' })
  enseignant: Utilisateur;

  @ManyToOne(() => UniteEnseignement, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'ue_id' })
  ue: UniteEnseignement;

  @ManyToOne(() => Parcours, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parcours_id' })
  parcours: Parcours;

  @ManyToOne(() => EmploiDuTemps, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'emploi_du_temps_id' })
  emploiDuTemps: EmploiDuTemps;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
