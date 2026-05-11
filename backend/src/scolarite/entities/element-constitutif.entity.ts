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
import { UniteEnseignement } from './unite-enseignement.entity';
import { Note } from './note.entity';

@Entity('element_constitutif')
export class ElementConstitutif {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 200 })
  intitule: string;

  @ManyToOne(() => UniteEnseignement, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'unite_enseignement_id' })
  uniteEnseignement: UniteEnseignement;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  coefficient: number;

  @Column({ type: 'smallint' })
  volumeHoraire: number;

  @Column({ type: 'varchar', length: 50, default: 'cm' })
  typeEvaluation: string;

  @Column({ type: 'varchar', length: 20, default: 'obligatoire' })
  categorie: string;

  @Column({ type: 'varchar', length: 20, default: 'actif' })
  statut: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  competencesVisees: string[];

  @Column({ type: 'jsonb', nullable: true })
  prerequis: string[];

  @OneToMany(() => Note, (note) => note.ec)
  notes: Note[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
