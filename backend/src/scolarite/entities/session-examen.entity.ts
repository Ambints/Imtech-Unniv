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
import { AnneeAcademique } from './annee-academique.entity';
import { Note } from './note.entity';
import { Deliberation } from './deliberation.entity';
import { VerrouillageNotes } from './verrouillage-notes.entity';

@Entity('session_examen')
export class SessionExamen {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  libelle: string;

  @Column({ type: 'varchar', length: 20, default: 'normale', name: 'type_session' })
  typeSession: string;

  @ManyToOne(() => AnneeAcademique, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'annee_academique_id' })
  anneeAcademique: AnneeAcademique;

  @Column({ type: 'date', name: 'date_debut' })
  dateDebut: Date;

  @Column({ type: 'date', name: 'date_fin' })
  dateFin: Date;

  @Column({ type: 'varchar', length: 20, default: 'planifiee' })
  statut: string;

  @OneToMany(() => Note, (note) => note.sessionExamen)
  notes: Note[];

  @OneToMany(() => Deliberation, (deliberation) => deliberation.sessionExamen)
  deliberations: Deliberation[];

  @OneToMany(() => VerrouillageNotes, (verrouillage) => verrouillage.sessionExamen)
  verrouillages: VerrouillageNotes[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
