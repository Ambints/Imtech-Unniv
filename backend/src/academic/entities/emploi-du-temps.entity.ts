import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Parcours } from '../../scolarite/entities/parcours.entity';
import { Seance } from './seance.entity';

@Entity('emplois_du_temps')
export class EmploiDuTemps {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  titre: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 20 })
  anneeAcademique: string;

  @Column({ type: 'smallint' })
  semestre: number;

  @Column({ type: 'boolean', default: false })
  publie: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  datePublication: Date;

  @Column({ type: 'text', nullable: true })
  remarques: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  fichierPdf: string;

  // Relations
  @ManyToOne(() => Parcours, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parcours_id' })
  parcours: Parcours;

  @OneToMany(() => Seance, (seance) => seance.emploiDuTemps)
  seances: Seance[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
