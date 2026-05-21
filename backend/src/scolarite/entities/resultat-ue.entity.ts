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
import { Utilisateur } from './utilisateur.entity';
import { ResultatSemestre } from './resultat-semestre.entity';
import { UniteEnseignement } from './unite-enseignement.entity';

@Entity('resultat_ue')
@Unique(['etudiant', 'uniteEnseignement', 'resultatSemestre'])
export class ResultatUE {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Etudiant, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'etudiant_id' })
  etudiant: Etudiant;

  @ManyToOne(() => UniteEnseignement, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'ue_id' })
  uniteEnseignement: UniteEnseignement;

  @ManyToOne(() => ResultatSemestre, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'resultat_semestre_id' })
  resultatSemestre: ResultatSemestre;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  moyenneUE: number;

  @Column({ type: 'smallint', nullable: true })
  creditsECTS: number;

  @Column({ type: 'boolean', default: false })
  creditsAcquis: boolean;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'en_cours',
    enum: ['en_cours', 'valide', 'ajourne', 'compense'],
  })
  statut: string;

  @ManyToOne(() => UniteEnseignement, { nullable: true })
  @JoinColumn({ name: 'compensation_ue_id' })
  compensationUE: UniteEnseignement;

  @Column({ type: 'timestamptz', nullable: true })
  dateValidation: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
