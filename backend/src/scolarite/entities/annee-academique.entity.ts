import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Inscription } from './inscription.entity';
import { SessionExamen } from './session-examen.entity';

@Entity('annee_academique')
export class AnneeAcademique {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  annee: string;

  @Column({ type: 'date' })
  dateDebut: Date;

  @Column({ type: 'date' })
  dateFin: Date;

  @Column({ type: 'varchar', length: 200 })
  libelle: string;

  @Column({ type: 'varchar', length: 20, default: 'en_cours' })
  statut: string;

  @Column({ type: 'text', nullable: true })
  observations: string;

  @OneToMany(() => Inscription, (inscription) => inscription.anneeAcademique)
  inscriptions: Inscription[];

  @OneToMany(() => SessionExamen, (session) => session.anneeAcademique)
  sessionsExamen: SessionExamen[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
