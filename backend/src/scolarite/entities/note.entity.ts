import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { Etudiant } from './etudiant.entity';
import { ElementConstitutif } from './element-constitutif.entity';
import { UniteEnseignement } from './unite-enseignement.entity';
import { SessionExamen } from './session-examen.entity';
import { Utilisateur } from './utilisateur.entity';

@Entity('note')
@Unique(['etudiant', 'ec', 'sessionExamen'])
export class Note {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Etudiant, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'etudiant_id' })
  etudiant: Etudiant;

  @ManyToOne(() => ElementConstitutif, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'ec_id' })
  ec: ElementConstitutif;

  @ManyToOne(() => UniteEnseignement, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'ue_id' })
  ue: UniteEnseignement;

  @ManyToOne(() => SessionExamen, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'session_id' })
  sessionExamen: SessionExamen;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  valeur: number;

  @Column({ type: 'varchar', length: 30, default: 'examen_final' })
  typeEvaluation: string;

  @Column({ type: 'boolean', default: false })
  absenceJustifiee: boolean;

  @Column({ type: 'varchar', length: 20, nullable: true })
  mention: string;

  @Column({ type: 'boolean', default: false })
  verrouille: boolean;

  @Column({ type: 'varchar', length: 128, nullable: true })
  hashIntegrite: string;

  @ManyToOne(() => Utilisateur, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'saisi_par' })
  saisiPar: Utilisateur;

  @ManyToOne(() => Utilisateur, { nullable: true })
  @JoinColumn({ name: 'valide_par' })
  validePar: Utilisateur;

  @Column({ type: 'timestamptz' })
  dateSaisie: Date;

  @Column({ type: 'timestamptz', nullable: true })
  dateVerrouillage: Date;

  @Column({ type: 'text', nullable: true })
  observations: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
